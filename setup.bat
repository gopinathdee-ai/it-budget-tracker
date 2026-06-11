@echo off
echo.
echo ===============================================
echo IT Budget App - SETUP v1.5
echo ===============================================
echo.

echo STEP 1: Database setup...
sqlcmd -S localhost -E -C -Q "USE master; IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'itbudgetadmin') CREATE LOGIN [itbudgetadmin] WITH PASSWORD = 'YourPassword123!'; IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ITBudgetDB') CREATE DATABASE [ITBudgetDB]; USE [ITBudgetDB]; IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'itbudgetadmin') CREATE USER [itbudgetadmin] FOR LOGIN [itbudgetadmin]; ALTER ROLE db_owner ADD MEMBER [itbudgetadmin]; GO" >nul 2>nul
echo   OK

echo STEP 2: Backend folders...
if not exist backend mkdir backend
if not exist backend\src\database\migrations mkdir backend\src\database\migrations
if not exist backend\src\database\seeds mkdir backend\src\database\seeds
if not exist backend\src\routes mkdir backend\src\routes
echo   OK

echo STEP 3: .env.local...
if not exist backend\.env.local (
    (
        echo NODE_ENV=development
        echo PORT=3000
        echo DATABASE_HOST=localhost
        echo DATABASE_PORT=1433
        echo DATABASE_NAME=ITBudgetDB
        echo DATABASE_USER=itbudgetadmin
        echo DATABASE_PASSWORD=YourPassword123!
        echo JWT_SECRET=dev-secret-key-min-32-characters-long-here-12345
        echo SESSION_SECRET=dev-session-secret-min-32-characters-long-12345
    ) > backend\.env.local
)
echo   OK

echo STEP 4: package.json...
if not exist backend\package.json (
    (
        echo {
        echo   "name": "it-budget-backend",
        echo   "version": "1.0.0",
        echo   "main": "src/server.js",
        echo   "type": "module",
        echo   "scripts": {
        echo     "dev": "node --watch src/server.js",
        echo     "start": "node src/server.js",
        echo     "migrate:latest": "knex migrate:latest",
        echo     "seed:mandatory": "knex seed:run --specific=002_mandatory.js",
        echo     "seed:optional": "knex seed:run --specific=003_optional.js",
        echo     "db:setup": "npm run migrate:latest && npm run seed:mandatory && npm run seed:optional",
        echo     "db:reset": "npm run migrate:rollback --all && npm run migrate:latest && npm run seed:mandatory && npm run seed:optional"
        echo   },
        echo   "dependencies": {
        echo     "express": "^4.18.2",
        echo     "cors": "^2.8.5",
        echo     "dotenv": "^16.3.1",
        echo     "mssql": "^9.1.1",
        echo     "knex": "^3.0.1",
        echo     "passport": "^0.7.0",
        echo     "jsonwebtoken": "^9.1.2",
        echo     "bcryptjs": "^2.4.3",
        echo     "helmet": "^7.1.0",
        echo     "morgan": "^1.10.0"
        echo   }
        echo }
    ) > backend\package.json
)
echo   OK

echo STEP 5: Copy files...
copy knexfile.js backend\ >nul 2>nul
copy server.js backend\src\ >nul 2>nul
copy 001_create_initial_schema.js backend\src\database\migrations\ >nul 2>nul
copy 002_mandatory_seed.js backend\src\database\seeds\ >nul 2>nul
copy 003_optional_seed.js backend\src\database\seeds\ >nul 2>nul
echo   OK

echo STEP 6: Backend npm install...
cd backend
npm install --legacy-peer-deps >nul 2>nul
cd ..
echo   OK

echo STEP 7: Database setup...
cd backend
npm run db:setup >nul 2>nul
cd ..
echo   OK

echo STEP 8: React frontend...
if not exist frontend (
    echo   Please wait 5-10 minutes...
    call npx create-react-app frontend >nul 2>nul
)
echo   OK

echo STEP 9: Frontend components...
if not exist frontend\src\pages mkdir frontend\src\pages

if not exist frontend\src\pages\Dashboard.jsx (
    (
        echo import React, { useState, useEffect } from 'react';
        echo import axios from 'axios';
        echo export default function Dashboard^(^) {
        echo   const [data, setData] = useState^(null^);
        echo   const [loading, setLoading] = useState^(true^);
        echo   const [error, setError] = useState^(null^);
        echo   useEffect^(^(^) =^> {
        echo     axios.get^('http://localhost:3000/api/health'^)
        echo       .then^(res =^> { setData^(res.data^); setLoading^(false^); }^)
        echo       .catch^(err =^> { setError^(err.message^); setLoading^(false^); }^);
        echo   }, [^]^);
        echo   return ^(
        echo     ^<div style={{ padding: '20px' }}\>
        echo       ^<h1^>IT Budget Dashboard^</h1^>
        echo       {loading && ^<p^>Loading...^</p^>}
        echo       {error && ^<p style={{ color: 'red' }}\>Error: {error}^</p^>}
        echo       {data && ^<div style={{ backgroundColor: '#e8f5e9', padding: '20px' }}\>^<h2^>Connected!^</h2^>^<pre^>{JSON.stringify^(data, null, 2^)}^</pre^>^</div^>}
        echo     ^</div^>
        echo   ^);
        echo }
    ) > frontend\src\pages\Dashboard.jsx
)

(
    echo import Dashboard from './pages/Dashboard';
    echo function App^(^) { return ^<Dashboard /^>; }
    echo export default App;
) > frontend\src\App.js
echo   OK

echo STEP 10: Frontend npm install...
cd frontend
npm install axios --legacy-peer-deps >nul 2>nul
powershell -Command "$pkg = Get-Content 'package.json' -Raw | ConvertFrom-Json; $pkg | Add-Member -MemberType NoteProperty -Name 'proxy' -Value 'http://localhost:3000' -Force; $pkg | ConvertTo-Json -Depth 10 | Out-File 'package.json' -Encoding UTF8" >nul 2>nul
cd ..
echo   OK

echo STEP 11: Git commit...
git add -A >nul 2>nul
git commit -m "Setup complete" >nul 2>nul
echo   OK

echo.
echo ===============================================
echo SETUP COMPLETE!
echo ===============================================
echo.
echo Start: Terminal 1: cd backend && npm run dev
echo        Terminal 2: cd frontend && npm start
echo.
