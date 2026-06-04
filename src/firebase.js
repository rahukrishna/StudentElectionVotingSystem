// Firebase configuration for BVB Valanchery Election backup
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, off } from 'firebase/database';

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

// Save full election state to Firebase
export const saveBackupToFirebase = async (electionData) => {
  try {
    const backupRef = ref(database, `elections/${ELECTION_KEY}`);
    await set(backupRef, {
      ...electionData,
      lastBackupTime: new Date().toISOString(),
      backupVersion: '1.0'
    });
    return { success: true };
  } catch (error) {
    console.error('Firebase backup failed:', error);
    return { success: false, error: error.message };
  }
};

// Load election backup from Firebase
export const loadBackupFromFirebase = async () => {
  try {
    const backupRef = ref(database, `elections/${ELECTION_KEY}`);
    const snapshot = await get(backupRef);
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
