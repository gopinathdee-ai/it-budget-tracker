# IT Budget App Setup v3.0 - PowerShell

Write-Host ""
Write-Host "==============================================="
Write-Host "IT Budget App - SETUP v3.0 (PowerShell)"
Write-Host "==============================================="
Write-Host ""

$ErrorActionPreference = "SilentlyContinue"

# STEP 1
Write-Host "STEP 1: Database setup..." -NoNewline
sqlcmd -S localhost -E -C -Q "USE master; IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'itbudgetadmin') CREATE LOGIN [itbudgetadmin] WITH PASSWORD = 'YourPassword123!'; IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ITBudgetDB') CREATE DATABASE [ITBudgetDB]; USE [ITBudgetDB]; IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'itbudgetadmin') CREATE USER [itbudgetadmin] FOR LOGIN [itbudgetadmin]; ALTER ROLE db_owner ADD MEMBER [itbudgetadmin]; GO" *>$null
Write-Host " DONE"

# STEP 2
Write-Host "STEP 2: Backend folders..." -NoNewline
New-Item -ItemType Directory -Path "backend\src\database\migrations" -Force *>$null
New-Item -ItemType Directory -Path "backend\src\database\seeds" -Force *>$null
New-Item -ItemType Directory -Path "backend\src\routes" -Force *>$null
Write-Host " DONE"

# STEP 3
Write-Host "STEP 3: Environment file..." -NoNewline
if (-not (Test-Path "backend\.env.local")) {
    @"
NODE_ENV=development
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=1433
DATABASE_NAME=ITBudgetDB
DATABASE_USER=itbudgetadmin
DATABASE_PASSWORD=YourPassword123!
JWT_SECRET=dev-secret-key-min-32-characters-long-here-12345
SESSION_SECRET=dev-session-secret-min-32-characters-long-12345
"@ | Out-File "backend\.env.local" -Encoding UTF8
}
Write-Host " DONE"

# STEP 4
Write-Host "STEP 4: Package configuration..." -NoNewline
if (-not (Test-Path "backend\package.json")) {
    @"
{
  "name": "it-budget-backend",
  "version": "1.0.0",
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js",
    "migrate:latest": "knex migrate:latest",
    "seed:mandatory": "knex seed:run --specific=002_mandatory.js",
    "seed:optional": "knex seed:run --specific=003_optional.js",
    "db:setup": "npm run migrate:latest && npm run seed:mandatory && npm run seed:optional",
    "db:reset": "npm run migrate:rollback --all && npm run migrate:latest && npm run seed:mandatory && npm run seed:optional"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "mssql": "^9.1.1",
    "knex": "^3.0.1",
    "passport": "^0.7.0",
    "jsonwebtoken": "^9.1.2",
    "bcryptjs": "^2.4.3",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0"
  }
}
"@ | Out-File "backend\package.json" -Encoding UTF8
}
Write-Host " DONE"

# STEP 5
Write-Host "STEP 5: Copying database files..." -NoNewline
Copy-Item -Path "knexfile.js" -Destination "backend\" -Force -ErrorAction SilentlyContinue
Copy-Item -Path "server.js" -Destination "backend\src\" -Force -ErrorAction SilentlyContinue
Copy-Item -Path "001_create_initial_schema.js" -Destination "backend\src\database\migrations\" -Force -ErrorAction SilentlyContinue
Copy-Item -Path "002_mandatory_seed.js" -Destination "backend\src\database\seeds\" -Force -ErrorAction SilentlyContinue
Copy-Item -Path "003_optional_seed.js" -Destination "backend\src\database\seeds\" -Force -ErrorAction SilentlyContinue
Write-Host " DONE"

# STEP 6
Write-Host "STEP 6: Installing backend packages..." -NoNewline
if (-not (Test-Path "backend\node_modules")) {
    Push-Location "backend"
    npm install --legacy-peer-deps *>$null
    Pop-Location
}
Write-Host " DONE"

# STEP 7
Write-Host "STEP 7: Initializing database..." -NoNewline
Push-Location "backend"
npm run db:setup *>$null
Pop-Location
Write-Host " DONE"

# STEP 8
Write-Host "STEP 8: Creating React app (5-10 minutes, please wait)..." -NoNewline
if (-not (Test-Path "frontend")) {
    npx create-react-app frontend *>$null
}
Write-Host " DONE"

# STEP 9
Write-Host "STEP 9: Creating components..." -NoNewline
New-Item -ItemType Directory -Path "frontend\src\pages" -Force *>$null
if (-not (Test-Path "frontend\src\pages\Dashboard.jsx")) {
    @"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    axios.get('http://localhost:3000/api/health')
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);
  return (
    <div style={{ padding: '20px' }}>
      <h1>IT Budget Dashboard</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {data && <div style={{ backgroundColor: '#e8f5e9', padding: '20px' }}><h2>Connected!</h2><pre>{JSON.stringify(data, null, 2)}</pre></div>}
    </div>
  );
}
"@ | Out-File "frontend\src\pages\Dashboard.jsx" -Encoding UTF8
}
@"
import Dashboard from './pages/Dashboard';
function App() { return <Dashboard />; }
export default App;
"@ | Out-File "frontend\src\App.js" -Encoding UTF8
Write-Host " DONE"

# STEP 10
Write-Host "STEP 10: Installing frontend packages..." -NoNewline
if (-not (Test-Path "frontend\node_modules")) {
    Push-Location "frontend"
    npm install axios --legacy-peer-deps *>$null
    Pop-Location
}
Push-Location "frontend"
$pkg = Get-Content "package.json" -Raw | ConvertFrom-Json
$pkg | Add-Member -MemberType NoteProperty -Name "proxy" -Value "http://localhost:3000" -Force
$pkg | ConvertTo-Json -Depth 10 | Out-File "package.json" -Encoding UTF8
Pop-Location
Write-Host " DONE"

# STEP 11
Write-Host "STEP 11: Committing..." -NoNewline
git add -A *>$null
git commit -m "Setup complete" *>$null
Write-Host " DONE"

Write-Host ""
Write-Host "==============================================="
Write-Host "SETUP COMPLETE!"
Write-Host "==============================================="
Write-Host ""
Write-Host "Next steps:"
Write-Host "  Terminal 1: cd backend && npm run dev"
Write-Host "  Terminal 2: cd frontend && npm start"
Write-Host ""
Read-Host "Press Enter to exit"
