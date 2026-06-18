# IT Budget Tracker - Backend

Node.js/Express backend for the IT Budget Tracker application with SQL Server database and Knex.js migrations.

## Setup

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure your environment:

```bash
cp .env.example .env
```

Update the values in `.env` for your development environment:
- `DATABASE_HOST` - SQL Server instance (default: localhost)
- `DATABASE_NAME` - Database name (default: ITBudgetDB)
- `DATABASE_USER` - SQL Server user
- `DATABASE_PASSWORD` - SQL Server password
- `JWT_SECRET` - JWT signing secret (min 32 characters)
- `SESSION_SECRET` - Session signing secret (min 32 characters)

**Important**: Never commit `.env` to version control. It's already in `.gitignore`.

### 2. Database Setup

Install dependencies:
```bash
npm install
```

Run migrations:
```bash
npm run migrate
```

Rollback migrations (if needed):
```bash
npm run migrate:rollback
```

### 3. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Migrations

Database migrations are managed by Knex.js and located in `src/database/migrations/`.

Each migration file has:
- `up()` - Runs the migration
- `down()` - Rolls back the migration

### Creating a New Migration

```bash
npm run migrate:make create_my_table
```

This creates a new migration file in `src/database/migrations/`.

## Environment Targets

The knexfile supports three environments via `NODE_ENV`:

- **development** - Trust server certificate, no encryption, smaller pool
- **staging** - Encrypted connections, medium pool
- **production** - Encrypted connections, larger pool, strict certificate validation

## Configuration Files

- `.env` - Environment variables (local, not in repo)
- `.env.example` - Template for `.env` configuration
- `knexfile.js` - Knex.js configuration for database connections and migrations
