// Firebase configuration for BVB Valanchery Election backup
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBeV7kiEAVRJt7mWO1GdzSfxjJdBaCmukM",
  authDomain: "bvb-valanchery-election.firebaseapp.com",
  databaseURL: "https://bvb-valanchery-election-default-rtdb.firebaseio.com",
  projectId: "bvb-valanchery-election",
  storageBucket: "bvb-valanchery-election.firebasestorage.app",
  messagingSenderId: "870125138170",
  appId: "1:870125138170:web:88e618d9891afc3f2cd943"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const ELECTION_KEY = 'bvb_valanchery_2026';
const FIREBASE_QUEUE_KEY = 'schoolElection_firebasePendingBackup';

const getBackupRef = () => ref(database, `elections/${ELECTION_KEY}`);

const executeFirebaseWrite = async (data) => {
  await set(getBackupRef(), {
    ...data,
    lastBackupTime: new Date().toISOString(),
    backupVersion: '1.1'
  });
};

const readPendingBackup = () => {
  try {
    const raw = localStorage.getItem(FIREBASE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Failed to read pending Firebase backup:', error);
    return null;
  }
};

const writePendingBackup = (data) => {
  try {
    const payload = {
      data,
      queuedAt: new Date().toISOString()
    };
    localStorage.setItem(FIREBASE_QUEUE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error('Failed to queue Firebase backup locally:', error);
  }
};

const clearPendingBackup = () => {
  try {
    localStorage.removeItem(FIREBASE_QUEUE_KEY);
  } catch (error) {
    console.error('Failed to clear pending Firebase backup:', error);
  }
};

export const processFirebaseQueue = async () => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { success: false, queued: true, error: 'Offline' };
  }

  const pending = readPendingBackup();
  if (!pending?.data) {
    return { success: true, processed: false };
  }

  try {
    await executeFirebaseWrite(pending.data);
    clearPendingBackup();
    return { success: true, processed: true };
  } catch (error) {
    return { success: false, queued: true, error: error.message };
  }
};

export const initFirebaseAutoResync = () => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleOnline = () => {
    processFirebaseQueue().catch(() => {});
  };

  window.addEventListener('online', handleOnline);
  processFirebaseQueue().catch(() => {});

  return () => {
    window.removeEventListener('online', handleOnline);
  };
};

// Save full election state to Firebase
export const saveBackupToFirebase = async (electionData) => {
  // Keep the latest full snapshot locally so it can be synced when internet returns.
  writePendingBackup(electionData);

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { success: false, queued: true, error: 'Offline - queued for auto-resync' };
  }

  try {
    await executeFirebaseWrite(electionData);
    clearPendingBackup();
    return { success: true, queued: false };
  } catch (error) {
    console.error('Firebase backup failed:', error);
    return { success: false, queued: true, error: error.message };
  }
};

// Load election backup from Firebase
export const loadBackupFromFirebase = async () => {
  try {
    const snapshot = await get(getBackupRef());
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    }
    return { success: false, error: 'No backup found in Firebase' };
  } catch (error) {
    console.error('Firebase restore failed:', error);
    return { success: false, error: error.message };
  }
};

export { database, ELECTION_KEY };
