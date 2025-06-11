# School Election Voting System - Setup Guide

## 🚀 Complete Installation Guide for New Laptop

### Prerequisites

#### 1. Install Node.js and npm
- Download from: https://nodejs.org/
- Choose the **LTS version** (Long Term Support)
- This includes npm automatically

**Verify installation:**
```bash
node --version
npm --version
```
You should see version numbers (Node.js v18+ recommended)

#### 2. Install Git (Optional but Recommended)
- Download from: https://git-scm.com/
- This allows you to clone repositories and manage version control

#### 3. Code Editor (Recommended)
- **VS Code**: https://code.visualstudio.com/
- **WebStorm**: https://www.jetbrains.com/webstorm/
- Or any text editor of your choice

---

### Method 1: Using Git Clone (Recommended)

If you have the project in a Git repository:

```bash
# Clone the repository
git clone <your-repository-url>
cd school-voting-system

# Install dependencies
npm install

# Start the application
npm start
```

---

### Method 2: Manual File Transfer

#### Step 1: Copy Project Files
Transfer these folders/files to your new laptop:
```
school-voting-system/
├── src/                     # Source code
├── public/                  # Public assets
├── package.json            # Dependencies list
├── package-lock.json       # Exact dependency versions
├── README.md              # Documentation
├── LICENSE                # License file
├── .gitignore             # Git ignore rules (if using Git)
└── Other config files
```

#### Step 2: Install Dependencies
```bash
# Navigate to project directory
cd path/to/school-voting-system

# Install all dependencies
npm install
```

#### Step 3: Start the Application
```bash
# Start development server
npm start
```

---

### Method 3: Starting from Scratch

If you want to recreate the project:

#### Step 1: Create React App
```bash
# Create new React app
npx create-react-app school-voting-system
cd school-voting-system
```

#### Step 2: Install Additional Dependencies
```bash
# Install testing libraries (if not already included)
npm install @testing-library/dom @testing-library/jest-dom @testing-library/react @testing-library/user-event web-vitals
```

#### Step 3: Copy Source Code
- Copy all files from `src/` folder
- Copy all files from `public/` folder
- Copy `README.md`, `LICENSE`, and other documentation

---

## 🔧 Configuration Steps

### 1. Environment Setup (Optional)
Create a `.env` file in the root directory:
```env
REACT_APP_SCHOOL_NAME=Your School Name
REACT_APP_ADMIN_PASSWORD=your_admin_password
REACT_APP_VERSION=1.0.0
```

### 2. Customize Branding
Update these files with your school's information:
- `public/index.html` - Update title and meta tags
- `public/manifest.json` - Update app name and descriptions
- `src/App.js` - Update school name and branding

### 3. Admin Configuration
In `src/App.js`, update the admin password (line ~50):
```javascript
const ADMIN_PASSWORD = 'your-secure-admin-password';
```

---

## 🏃‍♀️ Running the Application

### Development Mode
```bash
npm start
```
- Opens: http://localhost:3000
- Hot reload enabled (auto-refresh on changes)
- Development tools available

### Production Build
```bash
npm run build
```
- Creates optimized build in `build/` folder
- Ready for deployment to web servers

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage report
npm test -- --coverage
```

---

## 🌐 Deployment Options

### Option 1: Local Network Access
To access from other devices on the same network:
```bash
npm start -- --host 0.0.0.0
```
Then access via: `http://[your-ip-address]:3000`

### Option 2: Web Hosting
1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy the `build` folder to:**
   - **Netlify**: Drag & drop deployment
   - **Vercel**: Connect Git repository
   - **GitHub Pages**: Use gh-pages package
   - **Traditional hosting**: Upload build folder contents

### Option 3: Desktop App (Electron - Advanced)
Convert to desktop application using Electron framework.

---

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### Issue: "npm command not found"
**Solution:** Node.js/npm not installed properly
- Reinstall Node.js from official website
- Restart terminal/command prompt

#### Issue: "Module not found" errors
**Solution:** Dependencies not installed
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Port 3000 already in use
**Solution:** Use different port
```bash
npm start -- --port 3001
```

#### Issue: Permission errors (macOS/Linux)
**Solution:** Fix npm permissions
```bash
sudo chown -R $(whoami) ~/.npm
```

#### Issue: Build fails
**Solution:** Clear cache and rebuild
```bash
npm run build -- --reset-cache
```

### Performance Issues
- Close other applications to free up memory
- Use `npm start` for development (not production build)
- Check available disk space (need ~500MB free)

---

## 🔒 Security Considerations

### For Production Use:
1. **Change default admin password**
2. **Use HTTPS** (required for PWA features)
3. **Configure Content Security Policy**
4. **Set up proper session management**
5. **Regular security updates**

### For Development:
- Keep dependencies updated: `npm audit fix`
- Use environment variables for sensitive data
- Don't commit passwords to version control

---

## 📱 Browser Compatibility

### Supported Browsers:
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Features Requiring Modern Browsers:
- Local Storage (for vote persistence)
- CSS Grid and Flexbox (for responsive design)
- ES6+ JavaScript features

---

## 🆘 Getting Help

### If You Encounter Issues:

1. **Check the console** for error messages (F12 in browser)
2. **Verify Node.js version** is 14+ (`node --version`)
3. **Clear browser cache** and try again
4. **Check project documentation** in README.md
5. **Contact support** with specific error messages

### Useful Commands for Debugging:
```bash
# Check versions
node --version
npm --version

# Check project health
npm doctor

# List installed packages
npm list

# Check for vulnerabilities
npm audit
```

---

## 🎯 Quick Start Checklist

- [ ] Node.js installed (v14+)
- [ ] Project files copied/cloned
- [ ] `npm install` completed successfully
- [ ] `npm start` runs without errors
- [ ] Application opens at http://localhost:3000
- [ ] Admin panel accessible with correct password
- [ ] Students can vote successfully
- [ ] Results display correctly

---

**🎉 Congratulations! Your School Election Voting System is ready to use!**

For advanced configuration and customization, refer to the main README.md file.
