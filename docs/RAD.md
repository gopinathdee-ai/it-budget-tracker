# RAD (Rapid Application Development) Guide

## Overview
This guide streamlines development of the IT Budget Tracker by establishing clear workflows, conventions, and implementation standards.

---

## Tech Stack Reference

| Layer | Technology | Port | Purpose |
|-------|-----------|------|---------|
| Frontend | React 18 + shadcn/ui + TailwindCSS | 3001 | User interface |
| Backend | Node.js + Express (ES Modules) | 3000 | REST API |
| Database | SQL Server 2025 | 1433 | Data persistence |
| Charts | Recharts | - | Data visualization |
| HTTP Client | Axios | - | Frontend API calls |
| ORM | Knex.js | - | Database query builder |
| Auth | Passport.js + JWT | - | Authentication |

---

## Environment Configuration

### Backend `.env` File
Required variables in `backend/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=1433
DATABASE_NAME=ITBudgetDB
DATABASE_USER=itbudgetadmin
DATABASE_PASSWORD=YourPassword123!

# Security (minimum 32 characters)
JWT_SECRET=dev-secret-key-min-32-characters-long-here-12345
SESSION_SECRET=dev-session-secret-min-32-characters-long-12345

# Session Configuration
SESSION_TIMEOUT=3600000 (1 hour in milliseconds)

# API Configuration
API_TIMEOUT=30000
MAX_REQUEST_SIZE=10mb
CORS_ORIGIN=http://localhost:3001

# Logging
LOG_LEVEL=debug
```

### Frontend `.env` File (Optional)
```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_API_TIMEOUT=30000
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE Users (
  id INT PRIMARY KEY IDENTITY(1,1),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  role ENUM('Admin', 'Reporting', 'DataEntry') DEFAULT 'DataEntry',
  isActive BIT DEFAULT 1,
  lastLogin DATETIME,
  createdAt DATETIME DEFAULT GETDATE(),
  updatedAt DATETIME DEFAULT GETDATE(),
  INDEX idx_email (email),
  INDEX idx_role (role)
);
```

### GACosts Table
```sql
CREATE TABLE GACosts (
  id INT PRIMARY KEY IDENTITY(1,1),
  year INT NOT NULL,
  category ENUM('Business Apps', 'IT Services', 'Other') NOT NULL,
  costType ENUM('Retained', 'Distributed') NOT NULL,
  serviceSoftware VARCHAR(255) NOT NULL,
  vendor VARCHAR(255) NOT NULL,
  version VARCHAR(50),
  currencyCode VARCHAR(3) DEFAULT 'USD',
  forecastComplete DECIMAL(12,2),
  createdByUserId INT UNSIGNED,
  createdAt DATETIME DEFAULT GETDATE(),
  updatedAt DATETIME DEFAULT GETDATE(),
  INDEX idx_year_category (year, category),
  INDEX idx_year_costType (year, costType),
  FOREIGN KEY (createdByUserId) REFERENCES Users(id)
);
```

### GACostsBudget & GACostsActual Tables
```sql
CREATE TABLE GACostsBudget (
  id INT PRIMARY KEY IDENTITY(1,1),
  gaCostId INT NOT NULL,
  maintenanceAmount DECIMAL(12,2) DEFAULT 0,
  newAmount DECIMAL(12,2) DEFAULT 0,
  totalAmount DECIMAL(12,2) DEFAULT 0,
  forecastComplete DECIMAL(12,2),
  createdAt DATETIME DEFAULT GETDATE(),
  updatedAt DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (gaCostId) REFERENCES GACosts(id) ON DELETE CASCADE,
  UNIQUE (gaCostId)
);

CREATE TABLE GACostsActual (
  id INT PRIMARY KEY IDENTITY(1,1),
  gaCostId INT NOT NULL,
  maintenanceAmount DECIMAL(12,2) DEFAULT 0,
  newAmount DECIMAL(12,2) DEFAULT 0,
  totalAmount DECIMAL(12,2) DEFAULT 0,
  createdAt DATETIME DEFAULT GETDATE(),
  updatedAt DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (gaCostId) REFERENCES GACosts(id) ON DELETE CASCADE,
  UNIQUE (gaCostId)
);
```

### Projects Tables
```sql
CREATE TABLE Projects (
  id INT PRIMARY KEY IDENTITY(1,1),
  year INT NOT NULL,
  projectName VARCHAR(255) NOT NULL,
  projectType ENUM('Capital (Maintenance)', 'Capital (Growth)', 'G&A') NOT NULL,
  status ENUM('Active', 'Complete', 'On Hold') DEFAULT 'Active',
  owner VARCHAR(255),
  description TEXT,
  createdByUserId INT UNSIGNED,
  createdAt DATETIME DEFAULT GETDATE(),
  updatedAt DATETIME DEFAULT GETDATE(),
  INDEX idx_year_type (year, projectType),
  INDEX idx_status (status),
  FOREIGN KEY (createdByUserId) REFERENCES Users(id)
);

CREATE TABLE ProjectsBudget (
  id INT PRIMARY KEY IDENTITY(1,1),
  projectId INT NOT NULL,
  internalLabour DECIMAL(12,2) DEFAULT 0,
  externalLabour DECIMAL(12,2) DEFAULT 0,
  hardwareSoftware DECIMAL(12,2) DEFAULT 0,
  other DECIMAL(12,2) DEFAULT 0,
  totalAmount DECIMAL(12,2) DEFAULT 0,
  createdAt DATETIME DEFAULT GETDATE(),
  updatedAt DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (projectId) REFERENCES Projects(id) ON DELETE CASCADE,
  UNIQUE (projectId)
);

CREATE TABLE ProjectsActual (
  id INT PRIMARY KEY IDENTITY(1,1),
  projectId INT NOT NULL,
  internalLabour DECIMAL(12,2) DEFAULT 0,
  externalLabour DECIMAL(12,2) DEFAULT 0,
  hardwareSoftware DECIMAL(12,2) DEFAULT 0,
  other DECIMAL(12,2) DEFAULT 0,
  totalAmount DECIMAL(12,2) DEFAULT 0,
  createdAt DATETIME DEFAULT GETDATE(),
  updatedAt DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (projectId) REFERENCES Projects(id) ON DELETE CASCADE,
  UNIQUE (projectId)
);
```

### AuditLog Table
```sql
CREATE TABLE AuditLog (
  id INT PRIMARY KEY IDENTITY(1,1),
  userId INT UNSIGNED,
  tableName VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
  recordId INT UNSIGNED,
  changes TEXT, -- JSON format
  ipAddress VARCHAR(45),
  createdAt DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE SET NULL,
  INDEX idx_table_action (tableName, action),
  INDEX idx_user (userId),
  INDEX idx_created (createdAt)
);
```

---

## API Response Standards

### Success Response Format
```javascript
// Single resource
{
  success: true,
  data: {
    id: 1,
    name: "Example",
    // ... resource fields
  },
  meta: {
    timestamp: "2026-06-11T10:30:00Z",
    version: "1.0"
  }
}

// Multiple resources with pagination
{
  success: true,
  data: [
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" }
  ],
  pagination: {
    page: 1,
    pageSize: 10,
    total: 100,
    totalPages: 10
  },
  meta: {
    timestamp: "2026-06-11T10:30:00Z",
    version: "1.0"
  }
}
```

### Error Response Format
```javascript
// Client error (4xx)
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Validation failed",
    details: [
      {
        field: "email",
        message: "Email is required"
      }
    ]
  },
  meta: {
    timestamp: "2026-06-11T10:30:00Z",
    version: "1.0"
  }
}

// Server error (5xx)
{
  success: false,
  error: {
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
    requestId: "req-12345" // for debugging
  },
  meta: {
    timestamp: "2026-06-11T10:30:00Z",
    version: "1.0"
  }
}
```

### HTTP Status Codes
| Code | Use Case | Example |
|------|----------|---------|
| 200 | Success | GET, PUT, DELETE completed |
| 201 | Created | POST successful |
| 400 | Bad Request | Validation error, missing fields |
| 401 | Unauthorized | Missing/invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry, constraint violation |
| 500 | Server Error | Database error, unexpected exception |

### Common Error Codes
```javascript
{
  VALIDATION_ERROR: "Input validation failed",
  NOT_FOUND: "Resource not found",
  UNAUTHORIZED: "Authentication required",
  FORBIDDEN: "Insufficient permissions",
  DUPLICATE_ENTRY: "Record already exists",
  DATABASE_ERROR: "Database operation failed",
  INTERNAL_SERVER_ERROR: "Unexpected server error"
}
```

---

## Backend Architecture

### Folder Structure
```
backend/
├── src/
│   ├── server.js              # Express app entry point
│   ├── config/
│   │   └── database.js        # Database configuration
│   ├── routes/
│   │   ├── health.js          # Health check endpoint
│   │   ├── gacosts.js         # G&A Costs routes
│   │   ├── projects.js        # Projects routes
│   │   ├── auth.js            # Authentication routes
│   │   └── dashboard.js       # Dashboard endpoints
│   ├── controllers/
│   │   ├── gacostsController.js
│   │   ├── projectsController.js
│   │   ├── authController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── errorHandler.js    # Global error handling
│   │   ├── auth.js            # JWT verification
│   │   ├── validation.js      # Input validation
│   │   ├── audit.js           # Audit logging
│   │   └── cors.js            # CORS configuration
│   ├── database/
│   │   ├── migrations/        # Knex migrations
│   │   └── seeds/             # Test data seeds
│   ├── utils/
│   │   ├── validators.js      # Input validation rules
│   │   ├── formatters.js      # Response formatters
│   │   └── logger.js          # Logging utility
│   └── lib/
│       └── knexfile.js        # Database config (moved here)
├── test/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── .env                       # Environment variables
├── package.json
└── README.md
```

### Backend Route Pattern
```javascript
// backend/src/routes/[feature].js
import express from 'express';
import * as controller from '../controllers/[feature]Controller.js';
import { validateInput } from '../middleware/validation.js';
import { requireAuth } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// GET all items
router.get('/', controller.getAll);

// GET single item
router.get('/:id', controller.getById);

// POST create
router.post(
  '/',
  validateInput('create[Feature]'),
  logAudit('[Feature]', 'CREATE'),
  controller.create
);

// PUT update
router.put(
  '/:id',
  validateInput('update[Feature]'),
  logAudit('[Feature]', 'UPDATE'),
  controller.update
);

// DELETE
router.delete(
  '/:id',
  logAudit('[Feature]', 'DELETE'),
  controller.delete
);

export default router;
```

### Error Handling Pattern
```javascript
// Controllers should use try-catch and return standardized responses
export async function getAll(req, res, next) {
  try {
    const filters = req.query; // year, category, etc.
    const data = await knex('TableName').where(filters);
    
    res.json({
      success: true,
      data,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error); // Pass to error handler middleware
  }
}

// Global error handler catches all errors
app.use((error, req, res, next) => {
  console.error(error);
  
  const statusCode = error.statusCode || 500;
  const errorCode = error.code || 'INTERNAL_SERVER_ERROR';
  
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: error.message
    },
    meta: { timestamp: new Date().toISOString() }
  });
});
```

### Validation Pattern
```javascript
// backend/src/utils/validators.js
export const validateGACost = (data) => {
  const errors = [];
  
  if (!data.year || data.year < 2020 || data.year > 2030) {
    errors.push({ field: 'year', message: 'Year must be between 2020-2030' });
  }
  
  if (!['Business Apps', 'IT Services', 'Other'].includes(data.category)) {
    errors.push({ field: 'category', message: 'Invalid category' });
  }
  
  if (data.amount && data.amount <= 0) {
    errors.push({ field: 'amount', message: 'Amount must be positive' });
  }
  
  return errors;
};
```

---

## Frontend Architecture

### Folder Structure
```
frontend/
├── src/
│   ├── index.js               # React entry point
│   ├── App.js                 # Root component
│   ├── pages/
│   │   ├── Dashboard.jsx      # Main dashboard
│   │   ├── GACosts.jsx        # G&A Costs page
│   │   ├── Projects.jsx       # Projects page
│   │   ├── Reports.jsx        # Reports page
│   │   └── Login.jsx          # Login page
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── NotFound.jsx
│   │   ├── GACosts/
│   │   │   ├── GACostsTable.jsx
│   │   │   ├── GACostsForm.jsx
│   │   │   ├── GACostsFilter.jsx
│   │   │   └── GACostsDashboard.jsx
│   │   ├── Projects/
│   │   │   ├── ProjectsTable.jsx
│   │   │   ├── ProjectsForm.jsx
│   │   │   ├── ProjectsFilter.jsx
│   │   │   └── ProjectsDashboard.jsx
│   │   ├── Charts/
│   │   │   ├── BudgetVsActual.jsx
│   │   │   ├── SpendingTrends.jsx
│   │   │   ├── CategoryBreakdown.jsx
│   │   │   └── ProjectStatus.jsx
│   │   └── Forms/
│   │       ├── FormInput.jsx
│   │       ├── FormSelect.jsx
│   │       └── FormButton.jsx
│   ├── hooks/
│   │   ├── useApi.js          # Axios API calls
│   │   ├── useAuth.js         # Authentication
│   │   ├── useForm.js         # Form state management
│   │   └── usePagination.js   # Pagination logic
│   ├── context/
│   │   ├── AuthContext.jsx    # User/auth state
│   │   ├── NotificationContext.jsx  # Alerts/toasts
│   │   └── FilterContext.jsx  # Shared filters
│   ├── utils/
│   │   ├── api.js             # Axios instance + interceptors
│   │   ├── formatters.js      # Currency, date formatting
│   │   ├── validators.js      # Form validation
│   │   └── constants.js       # App-wide constants
│   ├── styles/
│   │   ├── globals.css
│   │   └── variables.css      # TailwindCSS variables
│   └── assets/
│       ├── icons/
│       └── images/
├── public/
│   └── index.html
├── .env
├── package.json
└── README.md
```

### State Management Pattern
```javascript
// Using React Context + useReducer for simple state
// src/context/AuthContext.jsx

import { createContext, useReducer } from 'react';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    case 'LOGIN_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return initialState;
    default:
      return state;
  }
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Custom Hook Pattern
```javascript
// src/hooks/useApi.js
import { useState, useCallback } from 'react';
import apiClient from '../utils/api.js';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, data = null) => {
    setLoading(true);
    setError(null);
    try {
      const config = { method, url };
      if (data) config.data = data;
      const response = await apiClient(config);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { request, loading, error };
}

// Usage in component:
// const { request, loading, error } = useApi();
// const data = await request('GET', '/api/gacosts');
```

### Component Pattern
```javascript
// src/components/GACosts/GACostsTable.jsx
import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export default function GACostsTable() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const { request, loading, error } = useApi();

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      const response = await request('GET', `/api/gacosts?page=${page}`);
      setData(response.data);
    } catch (err) {
      // Error handled by useApi hook
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Year</th>
            <th className="p-3 text-left">Category</th>
            <th className="p-3 text-right">Budget</th>
            <th className="p-3 text-right">Actual</th>
            <th className="p-3 text-right">Variance</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{item.year}</td>
              <td className="p-3">{item.category}</td>
              <td className="p-3 text-right">{formatCurrency(item.budget)}</td>
              <td className="p-3 text-right">{formatCurrency(item.actual)}</td>
              <td className="p-3 text-right">{formatCurrency(item.variance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Authentication & Authorization

### JWT Flow
```
1. User logs in → POST /api/auth/login
2. Server validates credentials
3. Server generates JWT token (24-hour expiry)
4. Token stored in localStorage (frontend)
5. Token sent in Authorization header (Bearer token)
6. Server validates token on protected routes
7. User can refresh token → POST /api/auth/refresh
```

### JWT Token Structure
```javascript
{
  header: { alg: 'HS256', typ: 'JWT' },
  payload: {
    id: 1,
    email: 'user@example.com',
    role: 'Admin',
    iat: 1234567890,
    exp: 1234571490 // 1 hour later
  },
  signature: 'hash...'
}
```

### Role-Based Access Control (RBAC)
```javascript
// Permission matrix
const permissions = {
  Admin: {
    gacosts: ['create', 'read', 'update', 'delete'],
    projects: ['create', 'read', 'update', 'delete'],
    users: ['create', 'read', 'update', 'delete'],
    reports: ['read', 'export']
  },
  Reporting: {
    gacosts: ['read'],
    projects: ['read'],
    users: [],
    reports: ['read', 'export']
  },
  DataEntry: {
    gacosts: ['create', 'read', 'update'],
    projects: ['create', 'read', 'update'],
    users: [],
    reports: ['read']
  }
};

// Middleware usage:
// POST /api/gacosts requires: user.role = 'Admin' OR 'DataEntry'
router.post('/', authorize(['Admin', 'DataEntry']), controller.create);
```

---

## Error Handling

### Frontend Error Handling Pattern
```javascript
// src/components/common/ErrorBoundary.jsx
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
    // Send to error tracking service (e.g., Sentry)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Interceptor
```javascript
// src/utils/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  timeout: 30000
});

// Request interceptor: add JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## Logging & Monitoring

### Backend Logging Levels
```javascript
// src/utils/logger.js
const LOG_LEVELS = {
  ERROR: 0,    // Critical errors
  WARN: 1,     // Warnings
  INFO: 2,     // Info messages
  DEBUG: 3     // Debug info
};

export function logError(message, error, context = {}) {
  console.error(`[ERROR] ${message}`, error, context);
  // Send to monitoring service (e.g., Sentry)
}

export function logInfo(message, data = {}) {
  console.log(`[INFO] ${message}`, data);
}

export function logAudit(userId, action, table, recordId, changes) {
  // Log to AuditLog table
  knex('AuditLog').insert({
    userId,
    action,
    tableName: table,
    recordId,
    changes: JSON.stringify(changes),
    createdAt: knex.fn.now()
  });
}
```

### Performance Monitoring
```javascript
// Measure API response times
import time from 'time-diff';

const timer = time.start();
const response = await request('/api/gacosts');
const duration = timer.end();
console.log(`API call took ${duration.ms}ms`);

// Frontend performance
if (window.performance?.measure) {
  performance.measure('component-render', 'navigationStart');
}
```

---

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Routes | lowercase, kebab-case, plural | `/api/gacosts`, `/api/projects` |
| Components | PascalCase | `GACostsTable.jsx`, `ProjectForm.jsx` |
| Files | PascalCase for components, kebab-case for utils | `GACostsTable.jsx`, `format-currency.js` |
| Variables | camelCase | `gaCostData`, `projectId`, `totalBudget` |
| Constants | UPPER_SNAKE_CASE | `MAX_BUDGET_AMOUNT`, `API_TIMEOUT` |
| Database tables | PascalCase | `GACosts`, `Projects`, `Users` |
| Database columns | camelCase | `gaCostId`, `createdAt`, `userName` |
| Functions | camelCase | `formatCurrency()`, `validateEmail()` |

---

## Development Workflow

### 1. Start Development Environment
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm start
```

### 2. Create New Backend Feature

#### Step 1: Create Database Migration (if needed)
```bash
cd backend
npx knex migrate:make create_[feature]_table
```

#### Step 2: Create Route
File: `backend/src/routes/[feature].js`
```javascript
import express from 'express';
import * as controller from '../controllers/[feature]Controller.js';

const router = express.Router();
router.get('/', controller.getAll);
router.post('/', controller.create);
export default router;
```

#### Step 3: Create Controller
File: `backend/src/controllers/[feature]Controller.js`
```javascript
import knex from '../lib/knexfile.js';

export async function getAll(req, res, next) {
  try {
    const data = await knex('TableName');
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
```

#### Step 4: Register Route in server.js
```javascript
import featureRoutes from './routes/[feature].js';
app.use('/api/[feature]', featureRoutes);
```

#### Step 5: Test with curl
```bash
curl http://localhost:3000/api/[feature]
```

### 3. Create New Frontend Component

#### File Pattern
File: `frontend/src/components/[Feature]/[ComponentName].jsx`

```javascript
import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi.js';

export default function ComponentName() {
  const [data, setData] = useState([]);
  const { request, loading, error } = useApi();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await request('GET', '/api/endpoint');
      setData(response.data);
    } catch (err) {
      // Handle error
    }
  };

  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

### 4. Database Migrations

#### Create Migration
```bash
cd backend
npx knex migrate:make [migration_name]
```

#### Migration File Pattern
```javascript
// backend/src/database/migrations/[timestamp]_[name].js
export const up = async function(knex) {
  return knex.schema
    .createTable('TableName', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
    });
};

export const down = async function(knex) {
  return knex.schema.dropTableIfExists('TableName');
};
```

#### Run Migrations
```bash
# Up (latest)
npm run migrate:latest

# Down (rollback)
npm run migrate:rollback
```

### 5. Database Seeds (Test Data)
```bash
cd backend
npx knex seed:make [seed_name]
```

---

## Testing

### Manual Testing Checklist
- [ ] Start both backend and frontend servers
- [ ] Open browser: `http://localhost:3001`
- [ ] Test all CRUD operations
- [ ] Check API calls in DevTools Network tab
- [ ] Verify error handling
- [ ] Test on mobile (DevTools device emulation)

### Testing with curl
```bash
# GET
curl http://localhost:3000/api/gacosts

# POST
curl -X POST http://localhost:3000/api/gacosts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"year": 2026, "category": "Business Apps"}'

# PUT
curl -X PUT http://localhost:3000/api/gacosts/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"category": "IT Services"}'

# DELETE
curl -X DELETE http://localhost:3000/api/gacosts/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Automated Testing (Future)
```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test

# E2E tests
npm run test:e2e
```

---

## Deployment

### Production Environment
```bash
# Build frontend
cd frontend
npm run build  # Creates build/ folder

# Run backend with production settings
cd backend
NODE_ENV=production npm start

# Serve frontend build with Node.js
npx serve -s frontend/build -l 3001
```

### Environment Configuration
```bash
# Production .env
NODE_ENV=production
DATABASE_HOST=prod-db.example.com
DATABASE_PASSWORD=SecurePassword123!
JWT_SECRET=prod-secret-min-32-chars-long-and-random
SESSION_SECRET=prod-session-secret-min-32-chars-long
CORS_ORIGIN=https://yourdomain.com
```

---

## Code Quality Standards

- **Use ESLint** for code consistency
- **Comment complex logic** only (not obvious code)
- **Keep functions under 20 lines**
- **Use async/await** (not callbacks)
- **Handle errors explicitly**
- **Use meaningful variable names**
- **Avoid deep nesting** (max 3 levels)
- **DRY principle**: Don't Repeat Yourself

---

## Common Errors & Fixes

| Error | Cause | Solution |
|-------|-------|----------|
| Cannot find module 'express' | npm packages not installed | `npm install` in backend |
| Port 3000 already in use | Another process using port | `lsof -i :3000` then kill process |
| CORS error | Frontend/backend mismatch | Check proxy in frontend/package.json |
| Database connection failed | .env missing | Create .env with correct credentials |
| SyntaxError: Cannot use import outside module | CommonJS/ES module mismatch | Ensure `"type": "module"` in package.json |
| JWT expired error | Token not refreshed | Frontend should redirect to login |
| 401 Unauthorized | Missing Bearer token | Check Authorization header format |

---

## Performance Tips

- Use pagination for large datasets (10-50 items per page)
- Implement caching for reports (5-10 minute TTL)
- Lazy-load components in React (`React.lazy()`)
- Optimize database queries with indexes
- Monitor API response times (target: <200ms)
- Use React DevTools Profiler to identify slow renders
- Compress images and assets
- Minify CSS and JavaScript in production

---

## Security Best Practices

1. **JWT Tokens**
   - Store in localStorage with 24-hour expiry
   - Send via Authorization header: `Bearer <token>`
   - Never log or expose tokens

2. **Password Security**
   - Hash with bcryptjs (min 10 rounds)
   - Min 8 characters, require mixed case + numbers

3. **Input Validation**
   - Validate on both frontend and backend
   - Sanitize before database insert
   - Use prepared statements (Knex handles this)

4. **CORS Configuration**
   - Only allow trusted domains
   - Set credentials: true only when needed

5. **Environment Variables**
   - Never commit `.env` files
   - Use `.env.example` as template
   - Rotate secrets regularly

6. **Audit Logging**
   - Log all data changes
   - Include user, timestamp, action
   - Store for compliance (min 1 year)

---

## Database Backup & Recovery

```bash
# Backup SQL Server database
sqlcmd -S localhost -d ITBudgetDB -Q "BACKUP DATABASE ITBudgetDB TO DISK = 'backup.bak'"

# Restore from backup
sqlcmd -S localhost -Q "RESTORE DATABASE ITBudgetDB FROM DISK = 'backup.bak'"
```

---

## Git Workflow

### Branch Strategy
```
main (production-ready code)
└── dev (development branch)
    ├── feature/gacosts-crud
    ├── feature/projects-dashboard
    └── feature/auth-system
```

### Commit Message Format
```
[TYPE] Brief description (under 50 chars)

Longer description if needed. Explain WHY the change.
Reference issue: Closes #123

Types: FEAT, FIX, DOCS, STYLE, REFACTOR, TEST, CHORE
```

### Pull Request Checklist
- [ ] Code follows naming conventions
- [ ] No console.log or debug code left
- [ ] Tests pass (if applicable)
- [ ] No sensitive data in code
- [ ] Updated documentation
- [ ] Rebased on main branch

---

## Documentation Requirements

Every feature needs:
1. **API Documentation**
   - HTTP method, path, authentication required
   - Request body example
   - Response format with sample data
   - Error cases and handling

2. **Database Schema**
   - SQL table definition
   - Foreign key relationships
   - Indexes and constraints

3. **Component Documentation**
   - Props interface
   - Usage example
   - Related components

4. **Error Cases**
   - What can go wrong
   - Error messages
   - Recovery steps

---

## Quick Reference

### Install Dependencies
```bash
cd backend && npm install
cd frontend && npm install
```

### Run Development
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm start
```

### Database Commands
```bash
# Run migrations
npm run migrate:latest

# Rollback last migration
npm run migrate:rollback

# Create seed file
npx knex seed:make seed_name

# Run seeds
npm run seed:run
```

### Build for Production
```bash
cd frontend && npm run build
cd backend && npm run build  # if TypeScript
```

---

## Additional Resources

- [Express.js Documentation](https://expressjs.com)
- [React Documentation](https://react.dev)
- [Knex.js Query Builder](https://knexjs.org)
- [Recharts Documentation](https://recharts.org)
- [TailwindCSS Reference](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [JWT.io](https://jwt.io)
- [SQL Server Best Practices](https://learn.microsoft.com/en-us/sql/relational-databases/best-practices)
