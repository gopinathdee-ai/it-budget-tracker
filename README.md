# IT Budget App - Complete Automated Setup

This zip contains everything you need to set up the entire IT Budget Tracking application in one go!

---

## WHAT'S IN THIS ZIP

```
it-budget-setup/
├── setup-all-automated.ps1      ← RUN THIS FIRST!
├── knexfile.js                  ← Database config
├── 001_create_initial_schema.js ← Database tables
├── 002_mandatory_seed.js        ← Production data
├── 003_optional_seed.js         ← Test data
├── server.js                    ← Backend entry point
└── README.md                    ← This file
```

---

## BEFORE YOU START

Make sure you have:
- ✅ SQL Server 2025 Developer installed
- ✅ Node.js 18+ installed
- ✅ Git installed
- ✅ Your project repo cloned locally
- ✅ PowerShell (Windows 10 has this built-in)

---

## QUICK START (3 STEPS)

### Step 1: Extract This Zip

Extract the entire contents to your project root folder.

Example:
```
C:\Users\YourName\it-budget-tracker\
├── (extract all files here)
├── setup-all-automated.ps1
├── knexfile.js
├── 001_create_initial_schema.js
└── ... (other files)
```

### Step 2: Run the Setup Script

Open PowerShell as Administrator:

```powershell
# Navigate to your project
cd C:\Users\YourName\it-budget-tracker

# Run the setup script
PowerShell -ExecutionPolicy Bypass -File ".\setup-all-automated.ps1"
```

**That's it!** The script will:
- Create SQL Server database
- Create database user
- Set up backend and frontend
- Install all dependencies
- Initialize database
- Make first Git commit

**Wait ~10 minutes while it runs.**

### Step 3: Start the App

When the script finishes, it shows you these commands:

```powershell
# Terminal 1
cd backend
npm run dev

# Terminal 2 (new terminal)
cd frontend
npm start
```

Browser opens to `http://localhost:3001` - you see the app! ✅

---

## WHAT GETS CREATED

After the script runs:

```
Your Project:
├── backend/
│   ├── src/
│   ├── node_modules/
│   ├── package.json
│   ├── .env.local
│   ├── knexfile.js
│   └── ... (backend files)
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── node_modules/
│   ├── package.json
│   └── ... (frontend files)
│
└── .git/
    └── (initial commit)

Database:
├── ITBudgetDB (SQL Server)
├── User: itbudgetadmin
└── All tables created with sample data
```

---

## DATABASE CREDENTIALS

After setup, you have:

```
Server: localhost
Database: ITBudgetDB
Username: itbudgetadmin
Password: YourPassword123!

(These are in backend/.env.local)
```

---

## RUNNING THE APP

### Terminal 1: Backend API

```powershell
cd backend
npm run dev

# Shows:
# ✅ Server started successfully!
# API: http://localhost:3000
```

### Terminal 2: Frontend

```powershell
cd frontend
npm start

# Shows:
# Local: http://localhost:3001
# Browser opens automatically
```

### You See

```
IT Budget Dashboard
✅ Backend Connected!

(with system status JSON)
```

---

## IF SOMETHING GOES WRONG

### Setup script fails

**"Cannot connect to SQL Server"**
- Check: Windows Services → SQL Server (MSSQLSERVER) → Running
- If not running, right-click → Start
- Then run the script again

**"npm command not found"**
- Install Node.js: https://nodejs.org/
- Then run the script again

**"PowerShell script cannot be loaded"**
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
PowerShell -ExecutionPolicy Bypass -File ".\setup-all-automated.ps1"
```

### App won't start

**Backend won't connect to database**
```powershell
# Check database exists
sqlcmd -S localhost -U itbudgetadmin -P YourPassword123! -d ITBudgetDB

# Should connect successfully
```

**Frontend can't find backend**
- Make sure backend is running first (Terminal 1)
- Check: `curl http://localhost:3000/api/health`
- Should return JSON

**Port already in use**
```powershell
# Check what's using port 3000
netstat -ano | findstr :3000

# Kill the process or use different port
PORT=3002 npm run dev
```

---

## NEXT STEPS

After the app is working:

1. **Read the guides** (if you need to understand how things work):
   - Production architecture
   - Workflow documentation
   - Testing strategy

2. **Start building features**:
   - Build G&A Costs CRUD
   - Build Projects CRUD
   - Add reports

3. **Deploy to AWS** (when ready):
   - Push to GitHub
   - GitHub Actions handles deployment automatically

---

## FILES EXPLAINED

- `setup-all-automated.ps1` → Automated setup script
- `knexfile.js` → Database configuration
- `001_create_initial_schema.js` → Create all database tables
- `002_mandatory_seed.js` → Production admin data
- `003_optional_seed.js` → Test data (dev only)
- `server.js` → Express backend entry point

---

## CUSTOMIZATION

Before running the script, you can edit these values:

In `setup-all-automated.ps1`, change:

```powershell
$SQL_SERVER = "localhost"           # Your SQL Server name
$DB_NAME = "ITBudgetDB"            # Database name
$DB_USER = "itbudgetadmin"         # Database user
$DB_PASSWORD = "YourPassword123!"  # Database password
```

Then run the script.

---

## TOTAL TIME

```
Extract zip:        2 minutes
Run script:        10 minutes
Start backend:     30 seconds
Start frontend:     1 minute

TOTAL: ~13 minutes
```

---

## SUCCESS!

When you see this in your browser:

```
IT Budget Dashboard

✅ Backend Connected!

{
  "status": "healthy",
  "timestamp": "...",
  "uptime": 45.234
}
```

**You're done!** Everything is set up and working. 🎉

---

## NEED HELP?

Common issues:
1. SQL Server not running → Start it in Windows Services
2. Port in use → Run on different port or kill existing process
3. npm not found → Install Node.js
4. Script won't run → Run as Administrator

If stuck, check the script output for error messages - they usually tell you exactly what's wrong.

---

## WHAT'S NEXT?

The app is now running. You can:

1. **Explore the dashboard**
   - Backend API running
   - Frontend displaying data
   - Connected together

2. **Start building**
   - Add features
   - Build your first API endpoint
   - Create React components

3. **Deploy to production**
   - Push code to GitHub
   - GitHub Actions handles everything
   - App deployed to AWS automatically

---

Good luck! You've got this. 🚀
