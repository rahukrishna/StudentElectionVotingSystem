# 🔐 Security Configuration for Internet Deployment

## Important Security Updates

### 1. Admin Password Configuration

**BEFORE DEPLOYING TO INTERNET**, you must change the default passwords in `src/App.js`:

```javascript
// Line ~559: Admin Panel Access
const ADMIN_PASSWORD = 'SecureAdmin2024!'; // ⚠️ CHANGE THIS!

// Line ~575: Results Access  
const RESULTS_PASSWORD = 'SecureResults2024!'; // ⚠️ CHANGE THIS!
```

### 2. Recommended Password Requirements

**Create strong passwords with:**
- At least 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- No common dictionary words
- Unique for your school

**Examples:**
```
YourSchool2024#Vote!
Election@SecureAccess9
SchoolVoting$2024Safe
```

### 3. Environment Variables (Advanced)

For better security, use environment variables:

**Step 1:** Create `.env` file in root directory:
```env
REACT_APP_ADMIN_PASSWORD=your-super-secure-admin-password
REACT_APP_RESULTS_PASSWORD=your-super-secure-results-password
REACT_APP_SCHOOL_NAME=Your School Name
```

**Step 2:** Update `src/App.js`:
```javascript
const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'fallback-password';
const RESULTS_PASSWORD = process.env.REACT_APP_RESULTS_PASSWORD || 'fallback-password';
```

**Step 3:** Configure in your hosting platform:
- **Netlify**: Site settings → Environment variables
- **Vercel**: Project settings → Environment Variables
- **GitHub Pages**: Use GitHub Secrets

### 4. Additional Security Measures

**Rate Limiting** (prevent brute force):
```javascript
let failedAttempts = 0;
const MAX_ATTEMPTS = 3;

const handleAdminAccess = () => {
  if (failedAttempts >= MAX_ATTEMPTS) {
    alert('Too many failed attempts. Please try again in 5 minutes.');
    return;
  }
  
  const password = prompt('Enter admin password:');
  if (password === ADMIN_PASSWORD) {
    setCurrentView('admin');
    failedAttempts = 0; // Reset on success
  } else {
    failedAttempts++;
    alert(`Incorrect password! ${MAX_ATTEMPTS - failedAttempts} attempts remaining.`);
  }
};
```

### 5. Pre-Deployment Security Checklist

- [ ] Changed default admin password
- [ ] Changed default results password  
- [ ] Passwords are 12+ characters with mix of character types
- [ ] Tested login with new passwords
- [ ] Removed any console.log statements with sensitive data
- [ ] Verified HTTPS is enabled on hosting platform
- [ ] Set up environment variables (optional but recommended)
- [ ] Tested all functionality in production build

### 6. During Election Security

**Monitor for:**
- Unusual voting patterns
- Multiple votes from same IP (if possible to track)
- Admin access attempts
- System performance issues

**Have ready:**
- Backup admin password (written down securely)
- Technical support contact
- Plan for manual vote counting if needed

---

**⚠️ CRITICAL: Never commit passwords to version control or share them publicly!**
