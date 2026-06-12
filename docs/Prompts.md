# Prompts.md - Phase-Based Development Prompts

Copy and paste these prompts directly into Claude Code to build each feature.

**Reference:** See [RAD.md](RAD.md) for implementation standards, database schema, API response formats, naming conventions, and architecture patterns.

---

## Phase 1: Foundation ✅ COMPLETE

(Project setup, backend server, frontend app, database connection already done)

---

## Phase 2: Core Features (START HERE)

### 2.1 G&A Costs Module

#### 2.1.1 Database Migration - G&A Costs Tables
```
Create a Knex database migration following RAD.md database schema patterns.

File location: backend/src/database/migrations/[timestamp]_create_gacosts_tables.js

Command to create:
npx knex migrate:make create_gacosts_tables

Implementation:
- Use ES module syntax (export const up/down, NOT exports)
- Each table: PascalCase name, camelCase columns
- Use MSSQL data types (INT, VARCHAR, DECIMAL, DATETIME)

Table 1: GACosts (main catalog)
- id: INT, primary key, auto-increment (IDENTITY)
- year: INT, NOT NULL, range 2020-2030
- category: VARCHAR with enum (Business Apps, IT Services, Other)
- costType: VARCHAR with enum (Retained, Distributed)
- serviceSoftware: VARCHAR(255), NOT NULL
- vendor: VARCHAR(255), NOT NULL
- version: VARCHAR(50), nullable
- currencyCode: VARCHAR(3), default 'USD'
- forecastComplete: DECIMAL(12,2), nullable
- createdByUserId: INT, foreign key to Users(id)
- createdAt: DATETIME, default GETDATE()
- updatedAt: DATETIME, default GETDATE()
- Indexes: (year, category), (year, costType)
- Foreign key: createdByUserId → Users(id)

Table 2: GACostsBudget (budget allocation)
- id: INT, primary key, auto-increment
- gaCostId: INT, NOT NULL, foreign key to GACosts
- maintenanceAmount: DECIMAL(12,2), default 0
- newAmount: DECIMAL(12,2), default 0
- totalAmount: DECIMAL(12,2), default 0
- forecastComplete: DECIMAL(12,2), nullable
- createdAt: DATETIME, default GETDATE()
- updatedAt: DATETIME, default GETDATE()
- Unique constraint: gaCostId
- Foreign key: gaCostId → GACosts(id) ON DELETE CASCADE

Table 3: GACostsActual (actual spending)
- id: INT, primary key, auto-increment
- gaCostId: INT, NOT NULL, foreign key to GACosts
- maintenanceAmount: DECIMAL(12,2), default 0
- newAmount: DECIMAL(12,2), default 0
- totalAmount: DECIMAL(12,2), default 0
- createdAt: DATETIME, default GETDATE()
- updatedAt: DATETIME, default GETDATE()
- Unique constraint: gaCostId
- Foreign key: gaCostId → GACosts(id) ON DELETE CASCADE

Rollback (down function):
- Drop tables in reverse order: GACostsActual, GACostsBudget, GACosts
- Use dropTableIfExists to avoid errors

Testing:
After creating the migration file, run:
npm run migrate:latest

Verify tables were created:
SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo'
```

#### 2.1.2 Backend CRUD Endpoints - G&A Costs
```
Create backend Express routes for G&A Costs following the RAD.md Backend Architecture pattern.

Files to create:
1. backend/src/routes/gacosts.js (route definitions)
2. backend/src/controllers/gacostsController.js (business logic)

Implement these endpoints:

1. GET /api/gacosts
   - List all G&A costs with pagination
   - Query params: ?year=2026&category=BusinessApps&page=1&pageSize=10
   - Response format: Follow RAD.md success response format
   - Returns paginated data array with budget/actual totals

2. GET /api/gacosts/:id
   - Get single G&A cost with related budget and actual amounts
   - Response: Full cost object with all details
   - Error handling: 404 if not found

3. POST /api/gacosts
   - Create new G&A cost
   - Body: { year, category, costType, serviceSoftware, vendor, version }
   - Response: Created cost object with ID
   - Validation: Required fields, valid categories, year range
   - Returns 201 status

4. PUT /api/gacosts/:id
   - Update G&A cost (any fields except id, createdAt)
   - Body: { category, serviceSoftware, vendor, version } (partial OK)
   - Response: Updated cost object
   - Validation: Valid categories if provided

5. DELETE /api/gacosts/:id
   - Delete G&A cost and related budget/actual records
   - Response: Follow RAD.md success format: { success: true, data: { id } }
   - Error handling: 404 if not found

Implementation details:
- Use ES6 async/await syntax
- Follow error handling pattern from RAD.md
- Use standardized response format (success/error)
- Include input validation using validators.js
- Add error status codes: 400 (validation), 404 (not found), 500 (server)
- Use try-catch blocks
- Use Knex.js for database queries (from backend/lib/knexfile.js)
- Register route in server.js: app.use('/api/gacosts', gacostsRoutes)
- Include console logging for debugging
- Add audit logging for create/update/delete operations
```

#### 2.1.3 Frontend - G&A Costs Table Component
```
Create a React component following RAD.md Component Pattern at:
frontend/src/components/GACosts/GACostsTable.jsx

Specifications:
1. Display table of G&A costs from /api/gacosts endpoint
2. Columns: Year, Category, Cost Type, Service/Software, Budget, Actual, Variance
3. Component features:
   - Use custom useApi hook (from RAD.md) for backend calls
   - Fetch data on mount with pagination (?page=1&pageSize=10)
   - Show loading spinner (LoadingSpinner component)
   - Show error message on API failure (ErrorMessage component)
   - Display "No data" message if list empty
   - Pagination controls (next/prev buttons, page indicator)
   - Filter sidebar:
     - Year dropdown (2024, 2025, 2026, 2027)
     - Category dropdown (Business Apps, IT Services, Other)
     - Cost Type dropdown (Retained, Distributed)
   - Calculate variance (Budget - Actual) and format
   - Format all currency with formatCurrency() from utils
   - Format dates with formatDate() from utils
   - Highlight negative variance in red
4. Action buttons per row:
   - Edit (opens GACostsForm modal with pre-filled data)
   - Delete (shows confirmation dialog, calls DELETE endpoint)
5. Styling:
   - Use shadcn/ui Table component (or HTML table with Tailwind)
   - Use TailwindCSS for layout (responsive grid/flex)
   - Hover effects on rows
   - Zebra striping for readability
   - Mobile responsive (stack on mobile, scroll on tablet)
6. State management:
   - Use useState for page, filters, selectedRow
   - Use useEffect for data fetching
   - Clear filters button
7. Performance:
   - Debounce filter changes (300ms)
   - Memoize components if needed

Files needed:
- GACostsTable.jsx (main component)
- May need: GACostsFilter.jsx (separate filter component, optional)
```

#### 2.1.4 Frontend - G&A Costs Form Component
```
Create a React component following RAD.md patterns at:
frontend/src/components/GACosts/GACostsForm.jsx

Specifications:
1. Form fields:
   - Year (select: 2024, 2025, 2026, 2027) - required
   - Category (select: Business Apps, IT Services, Other) - required
   - Cost Type (select: Retained, Distributed) - required
   - Service/Software (text input, 255 char max) - required
   - Vendor (text input, 255 char max) - required
   - Version (text input, optional)
   - Forecast Complete (number, optional)

2. Functionality:
   - Mode: Create new (POST) or Edit existing (PUT)
   - If editing: pre-populate all fields with current data
   - Form validation (use validators from RAD.md):
     - All required fields must be filled
     - Year must be 2020-2030
     - Category must be from enum list
     - Cost Type must be from enum list
     - Amounts must be positive if provided
     - Show error messages below each field (red text)
   - Submit behavior:
     - Disable submit button while loading
     - Show "Saving..." text on button
     - POST /api/gacosts (create) or PUT /api/gacosts/:id (update)
     - Send Authorization header with JWT token
     - On success:
       - Show success toast: "G&A Cost saved successfully"
       - Close modal/navigate back
       - Refresh parent table
     - On error:
       - Show error toast with error message
       - Keep form open for user to fix
       - Highlight problematic fields

3. Component integration:
   - Used in modal from GACostsTable component
   - Props: onSuccess (callback), cost (optional, for edit mode)
   - Use custom useApi hook for API calls
   - Use useForm hook for form state management (if available)

4. Styling:
   - Use shadcn/ui Form, Input, Select, Button components
   - TailwindCSS for layout
   - Responsive (works on mobile, tablet, desktop)
   - Clear labels above inputs
   - Placeholder text for guidance
   - Error messages in red below fields
   - Submit button full width on mobile
   - Cancel button alongside submit

5. User experience:
   - Focus first field on open
   - Disable submit if form invalid
   - Show loading spinner on submit
   - Auto-fill any default values
   - Clear form on successful submit
```

#### 2.1.5 Frontend - G&A Costs Dashboard Component
```
Create a React component called GACostsDashboard that:

1. Summary cards (4 cards):
   - Total Budget (all years)
   - Total Actual (all years)
   - Total Variance (Budget - Actual)
   - YoY Change (year-over-year percentage)

2. Charts (using Recharts):
   - Bar chart: Budget vs Actual by category
   - Line chart: Spending trends by month (last 12 months)
   - Pie chart: Breakdown by category (percentage)

3. Controls:
   - Year selector (dropdown)
   - Refresh button
   - Export to CSV button (optional for now)

4. Layout:
   - Summary cards at top
   - Charts in 2-column grid below
   - Responsive (stacks on mobile)

5. Data:
   - Fetch from /api/gacosts?year=[selected]
   - Fetch from /api/dashboard/summary
   - Calculate metrics

Use Recharts for all charts.
Use shadcn/ui for cards and controls.
Format currency properly.
Handle loading and error states.
```

---

### 2.2 Projects Module

#### 2.2.1 Database Migration - Projects Tables
```
Create a Knex database migration that creates three tables for Projects:

1. Projects (main table):
   - id: integer, primary key, auto-increment
   - name: string, required
   - type: string (Capital Maintenance, Capital Growth, G&A)
   - status: string (Planning, Active, On Hold, Completed)
   - startDate: date
   - endDate: date
   - description: text
   - owner: string (project manager name)
   - createdAt: timestamp
   - updatedAt: timestamp
   - createdBy: integer (foreign key to users)

2. ProjectsBudget:
   - id: integer, primary key
   - projectId: integer, foreign key to Projects
   - amount: decimal(19,2)
   - year: integer

3. ProjectsActual:
   - id: integer, primary key
   - projectId: integer, foreign key to Projects
   - amount: decimal(19,2)
   - month: integer (1-12)
   - year: integer
   - notes: text

Include indexes on projectId, year, type, and status.
```

#### 2.2.2 Backend CRUD Endpoints - Projects
```
Create backend Express routes for Projects with these endpoints:

1. GET /api/projects
   - List all projects
   - Query params: ?year=2026&status=Active&type=CapitalGrowth
   - Response: Array of projects with budget/actual

2. GET /api/projects/:id
   - Get single project with full details
   - Include budget and actual amounts
   - Response: Project object

3. POST /api/projects
   - Create new project
   - Body: { name, type, status, startDate, endDate, description, owner }
   - Response: Created project

4. PUT /api/projects/:id
   - Update project
   - Body: { name, type, status, startDate, endDate, description, owner }
   - Response: Updated project

5. DELETE /api/projects/:id
   - Delete project
   - Response: { success: true }

6. GET /api/projects/status/summary
   - Get count of projects by status
   - Response: { Planning: 5, Active: 10, OnHold: 2, Completed: 8 }

Include error handling, validation, and proper HTTP codes.
```

#### 2.2.3 Frontend - Projects Table Component
```
Create a React component called ProjectsTable that:

1. Display projects in table format with columns:
   - Name, Type, Status, Owner, Start Date, End Date, Budget, Actual, Variance

2. Features:
   - Fetch from /api/projects on mount
   - Filter by type (dropdown)
   - Filter by status (dropdown with: Planning, Active, On Hold, Completed)
   - Filter by year (2024-2027)
   - Sort by column (Name, Type, Status, Start Date)
   - Pagination (10 per page)
   - Format dates (MM/DD/YYYY)
   - Format currency

3. Action buttons:
   - Edit (opens form modal)
   - Delete (with confirmation)
   - View details (opens detail view)

4. Status colors:
   - Planning: Gray
   - Active: Green
   - On Hold: Yellow
   - Completed: Blue

Use shadcn/ui Table, Button, Select, Badge.
Make responsive and mobile-friendly.
Include loading and error states.
```

#### 2.2.4 Frontend - Projects Form Component
```
Create a React component called ProjectsForm that:

1. Form fields:
   - Name (text, required)
   - Type (select: Capital Maintenance, Capital Growth, G&A)
   - Status (select: Planning, Active, On Hold, Completed)
   - Start Date (date picker)
   - End Date (date picker)
   - Owner (text input - project manager name)
   - Description (textarea)
   - Budget Amount (number input)

2. Validation:
   - All required fields
   - End date must be after start date
   - Budget must be positive
   - Show field-level error messages

3. Functionality:
   - Create new OR edit existing
   - Pre-populate when editing
   - POST to /api/projects (create)
   - PUT to /api/projects/:id (update)
   - Show loading state during submit
   - Success/error toast messages
   - Close modal on success

Use shadcn/ui components.
Include date picker for start/end dates.
```

#### 2.2.5 Frontend - Projects Dashboard Component
```
Create a React component called ProjectsDashboard that:

1. Summary section (4 cards):
   - Total Projects
   - Active Projects
   - Total Budget (all projects)
   - Total Spent to Date

2. Charts (Recharts):
   - Bar chart: Budget vs Actual by project type
   - Pie chart: Projects by status (count)
   - Timeline: Project timeline (Gantt-like) showing start/end dates
   - Progress: Budget utilization by status

3. Controls:
   - Year filter
   - Refresh button
   - Create new project button

4. Layout:
   - Cards at top
   - Charts in responsive grid
   - Mobile-friendly

Data source: /api/projects and /api/projects/status/summary
Format dates and currency properly.
Handle loading and errors.
```

---

### 2.3 Dashboard & Reporting

#### 2.3.1 Backend - Dashboard Summary Endpoint
```
Create a backend endpoint:

GET /api/dashboard/summary?year=2026

Response should return:
{
  "gaCosts": {
    "totalBudget": 500000,
    "totalActual": 425000,
    "variance": 75000,
    "byCategory": {
      "BusinessApps": { budget: 200000, actual: 180000 },
      "ITServices": { budget: 200000, actual: 190000 },
      "Other": { budget: 100000, actual: 55000 }
    }
  },
  "projects": {
    "totalBudget": 2000000,
    "totalActual": 1650000,
    "variance": 350000,
    "byStatus": { Planning: 5, Active: 10, OnHold: 2, Completed: 8 },
    "byType": {
      "CapitalMaintenance": { budget: 800000, actual: 650000 },
      "CapitalGrowth": { budget: 900000, actual: 750000 },
      "GA": { budget: 300000, actual: 250000 }
    }
  },
  "summary": {
    "totalBudget": 2500000,
    "totalActual": 2075000,
    "totalVariance": 425000,
    "percentageUtilized": 83
  }
}

Calculate all values from GACosts, GACostsBudget, GACostsActual, Projects, ProjectsBudget, ProjectsActual tables.
Include error handling.
```

#### 2.3.2 Frontend - Main Dashboard Page
```
Create a React component called MainDashboard that serves as the home page:

1. Header:
   - Title: "IT Budget Dashboard"
   - Year selector (dropdown: 2024-2027)
   - Date range selector (start/end dates)
   - Refresh button

2. Top Summary Section (4 cards):
   - Total Budget (all categories)
   - Total Actual Spending
   - Variance (Budget - Actual)
   - Utilization % (Actual / Budget * 100)

3. Charts Section (2 rows x 2 columns on desktop, stacked on mobile):
   - Row 1:
     - Chart 1: G&A Costs - Budget vs Actual (bar chart by category)
     - Chart 2: Projects - Budget vs Actual (bar chart by type)
   - Row 2:
     - Chart 3: Spending Trends (line chart - last 12 months)
     - Chart 4: Budget Distribution (pie chart - G&A vs Projects)

4. Bottom Section:
   - Quick links to G&A Costs and Projects tables
   - Recent activities (last 5 changes)

5. Features:
   - Fetch from /api/dashboard/summary?year=[selected]
   - Auto-refresh every 5 minutes
   - Export dashboard to PDF button
   - Responsive layout (mobile-first)

Use Recharts for all visualizations.
Use shadcn/ui for cards, selectors, buttons.
Format all currency and percentages.
Handle loading and error states.
Make visually appealing with good spacing.
```

---

## Phase 3: Authentication & Authorization (Next Phase)

### 3.1 Database - User Management Tables
```
Create a Knex migration with three tables:

1. Users:
   - id: integer, primary key
   - email: string, unique, required
   - password: string (hashed with bcryptjs)
   - firstName: string
   - lastName: string
   - role: string (Admin, Reporting, DataEntry)
   - isActive: boolean (default: true)
   - lastLogin: timestamp
   - createdAt: timestamp
   - updatedAt: timestamp

2. Roles:
   - id: integer, primary key
   - name: string (Admin, Reporting, DataEntry)
   - description: string
   - createdAt: timestamp

3. Permissions:
   - id: integer, primary key
   - roleId: integer, foreign key to Roles
   - resource: string (gacosts, projects, users, reports)
   - action: string (create, read, update, delete)
   - createdAt: timestamp

Add unique constraint on (roleId, resource, action).
```

### 3.2 Backend - Authentication Endpoints
```
Create authentication endpoints:

1. POST /api/auth/login
   - Body: { email, password }
   - Response: { token, user: { id, email, name, role } }
   - Hash password check with bcryptjs
   - Generate JWT token valid for 24 hours
   - Update lastLogin timestamp

2. POST /api/auth/logout
   - Invalidate token (add to blacklist)
   - Response: { success: true }

3. GET /api/auth/me
   - Requires valid JWT token
   - Response: Current user profile
   - Used for session restoration

4. POST /api/auth/refresh
   - Requires valid JWT token
   - Response: New JWT token
   - Extend session

Include error handling for invalid credentials.
Use Passport.js for strategy setup.
Use jsonwebtoken for JWT handling.
```

### 3.3 Frontend - Login Page
```
Create a React component called LoginPage that:

1. Form fields:
   - Email (email input)
   - Password (password input)
   - Remember me (checkbox)

2. Features:
   - POST to /api/auth/login on submit
   - Store JWT token in localStorage
   - Store user info in React context/state
   - Show loading state during login
   - Show error message if login fails
   - Redirect to /dashboard on success
   - Redirect to /login if not authenticated

3. Styling:
   - Center form on page
   - Professional look
   - Mobile responsive
   - Show password toggle button

Use shadcn/ui for form components.
Include form validation (email format, password length).
```

---

## Phase 4: Advanced Features (Later Phase)

### 4.1 Audit Logging
```
Create backend middleware that logs all user actions:
- Create: Which user, what data, timestamp
- Update: Which user, what changed, before/after values, timestamp
- Delete: Which user, what was deleted, timestamp

Create AuditLog table and add logging to all CRUD endpoints.
```

### 4.2 Data Validation & Business Rules
```
Add these validations:
1. Budget amounts must be positive
2. Budget must not exceed max limit (TBD)
3. Dates must be valid and in correct order
4. Category/Type values must be from predefined list
5. No duplicate entries for same year/category
6. Projects cannot be deleted if active
```

---

## How to Use These Prompts

1. **Pick a prompt** from the current phase
2. **Copy the entire prompt** (including the triple backticks)
3. **Open Claude Code** and paste it
4. **Add any clarifications** if needed
5. **Run the code generation**
6. **Copy generated code** to your project
7. **Test the feature**
8. **Update Features-Tracker.md** when complete

---

## Prompt Order (Recommended)

For Phase 2, do in this order:

1. ✅ 2.1.1 - G&A Costs Database Migration
2. ✅ 2.1.2 - G&A Costs Backend CRUD
3. ✅ 2.1.3 - G&A Costs Table Component
4. ✅ 2.1.4 - G&A Costs Form Component
5. ✅ 2.1.5 - G&A Costs Dashboard
6. ✅ 2.2.1 - Projects Database Migration
7. ✅ 2.2.2 - Projects Backend CRUD
8. ✅ 2.2.3 - Projects Table Component
9. ✅ 2.2.4 - Projects Form Component
10. ✅ 2.2.5 - Projects Dashboard
11. ✅ 2.3.1 - Dashboard Summary Endpoint
12. ✅ 2.3.2 - Main Dashboard Page

This builds from database → backend → frontend, ensuring dependencies exist first.

