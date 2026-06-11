// knexfile.js - Knex.js configuration for database migrations
// This file defines how to connect to the database and run migrations

require('dotenv').config();

module.exports = {
  // Development environment
  development: {
    client: 'mssql',
    connection: {
      server: process.env.DATABASE_HOST || 'localhost\\SQLEXPRESS',
      database: process.env.DATABASE_NAME || 'ITBudgetDB',
      authentication: {
        type: 'default',
        options: {
          userName: process.env.DATABASE_USER || 'itbudgetadmin',
          password: process.env.DATABASE_PASSWORD || 'YourPassword123!',
        }
      },
      options: {
        trustServerCertificate: true,
        enableKeepAlive: true,
      }
    },
    migrations: {
      directory: './src/database/migrations',
      extension: 'js',
    },
    seeds: {
      directory: './src/database/seeds',
      extension: 'js',
    },
    pool: {
      min: 2,
      max: 10,
    },
  },

  // Staging environment
  staging: {
    client: 'mssql',
    connection: {
      server: process.env.DATABASE_HOST,
      database: process.env.DATABASE_NAME,
      authentication: {
        type: 'default',
        options: {
          userName: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASSWORD,
        }
      },
      options: {
        trustServerCertificate: true,
        enableKeepAlive: true,
      }
    },
    migrations: {
      directory: './src/database/migrations',
      extension: 'js',
    },
    seeds: {
      directory: './src/database/seeds',
      extension: 'js',
    },
    pool: {
      min: 2,
      max: 20,
    },
  },

  // Production environment
  production: {
    client: 'mssql',
    connection: {
      server: process.env.DATABASE_HOST,
      database: process.env.DATABASE_NAME,
      authentication: {
        type: 'default',
        options: {
          userName: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASSWORD,
        }
      },
      options: {
        trustServerCertificate: false,
        enableKeepAlive: true,
      }
    },
    migrations: {
      directory: './src/database/migrations',
      extension: 'js',
    },
    seeds: {
      directory: './src/database/seeds',
      extension: 'js',
    },
    pool: {
      min: 5,
      max: 30,
    },
  }
};
