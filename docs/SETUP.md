# IT Budget Tracker - Development Setup

Follow these steps to set up a development environment on Windows 11.

## Prerequisites

Install these first:
- **Node.js & npm** — [Download from nodejs.org](https://nodejs.org/)
- **SQL Server 2019+** or **SQL Server Express** — [Download from microsoft.com](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)

## Setup Steps

### 1. Clone the Repository

```powershell
git clone <your-repo-url>
cd it-budget-tracker
```

### 2. Create SQL Server Database (One-Time)

Run this command to create the database, login, and user:

```powershell
sqlcmd -S localhost -E -C -Q "USE master; IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'itbudgetadmin') CREATE LOGIN [itbudgetadmin] WITH PASSWORD = 'YourPassword123!'; IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ITBudgetDB') CREATE DATABASE [ITBudgetDB]; USE [ITBudgetDB]; IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'itbudgetadmin') CREATE USER [itbudgetadmin] FOR LOGIN [itbudgetadmin]; ALTER ROLE db_owner ADD MEMBER [itbudgetadmin]; GO"
```

**⚠️ Security Note:** 
- The password `YourPassword123!` shown above is a **development example only**
- For development, you can use simple passwords like this
- The actual credentials you use should be stored in `backend/.env.local` (which is **not committed** to git)
- `.env.local` is in `.gitignore` — your real passwords never reach the remote repository

### 3. Install Backend Dependencies

```powershell
cd backend
npm install
npm run db:setup
cd ..
```

This will:
- Install all backend npm packages
- Run database migrations
- Seed mandatory and optional data

### 4. Install Frontend Dependencies

```powershell
cd frontend
npm install
cd ..
```

## Running the Application

Open **two terminal windows**:

**Terminal 1 - Backend (Port 3000):**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend (Port 3000):**
```powershell
cd frontend
npm start
```

The app will open automatically at `http://localhost:3000`.

## Troubleshooting

**Database connection fails?**
- Ensure SQL Server is running
- Verify credentials in `backend/.env.local` match your setup
- Check `DATABASE_HOST` is `localhost` (or your SQL Server instance name)

**Port 3000 already in use?**
- Change `PORT` in `backend/.env.local`
- Or stop the process using that port

**npm install fails?**
- Delete `node_modules` folder and `package-lock.json`, then retry
- Try with `npm install --legacy-peer-deps`

---

That's it! Your development environment is ready. 🚀
