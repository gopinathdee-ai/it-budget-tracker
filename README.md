# IT Budget Tracker

An enterprise IT budget management application with multi-year planning, G&A cost tracking, actuals management, and reporting.

## Quick Start

### Prerequisites
- Node.js 18+
- SQL Server 2025 Developer (local or remote)
- Git

### Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your SQL Server credentials
   
   # Frontend
   cd ../frontend
   cp .env.example .env
   ```

3. **Initialize database:**
   ```bash
   cd backend
   npm run db:setup
   ```

4. **Start development servers:**
   ```bash
   # Terminal 1: Backend (port 3000)
   cd backend && npm run dev
   
   # Terminal 2: Frontend (port 3001)
   cd frontend && npm start
   ```

## Project Structure

```
├── backend/          # Express API + Knex.js migrations
│   ├── src/
│   ├── .env.example  # Environment template
│   └── README.md     # Backend setup details
│
└── frontend/         # React dashboard
    ├── src/
    ├── public/
    └── .env.example  # Environment template
```

## Development

See [backend/README.md](backend/README.md) for database and API details.

See [frontend/README.md](frontend/README.md) for React and build details.

## Features

- Multi-year budget planning
- G&A cost hierarchy (Category → SubCategory → Software)
- Multi-currency support with exchange rates
- Actuals tracking (multiple entries per cost with currency conversion)
- Dashboard with budget vs. actual analysis
- User roles and permissions

## License

Proprietary
