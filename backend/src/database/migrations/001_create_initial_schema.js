// src/database/migrations/001_create_initial_schema.js
// Run via: npm run migrate:latest
// This creates all tables in one go - fully automated

export const up = async function(knex) {
  // Check if tables already exist to prevent errors
  const hasUsersTable = await knex.schema.hasTable('Users');
  
  if (hasUsersTable) {
    console.log('Tables already exist, skipping migration');
    return;
  }

  return knex.schema
    // ===== USERS TABLE =====
    .createTable('Users', (table) => {
      table.increments('id').primary();
      table.string('email', 255).unique().notNullable();
      table.string('username', 100).notNullable();
      table.string('passwordHash', 255).notNullable();
      table.enum('role', ['Admin', 'Reporting', 'DataEntry']).defaultTo('DataEntry');
      table.boolean('isActive').defaultTo(true);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      table.index('email');
      table.index('role');
    })

    // ===== GA_COSTS TABLE =====
    .createTable('GACosts', (table) => {
      table.increments('id').primary();
      table.integer('year').notNullable();
      table.enum('category', ['Business Apps', 'IT Services', 'Other']).notNullable();
      table.enum('costType', ['Retained', 'Distributed']).notNullable();
      table.string('serviceSoftware', 255).notNullable();
      table.string('vendor', 255).notNullable();
      table.string('version', 50);
      table.string('currencyCode', 3).defaultTo('USD');
      table.decimal('forecastComplete', 12, 2);
      table.integer('createdByUserId').unsigned();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      table.index(['year', 'category']);
      table.index(['year', 'costType']);
      table.foreign('createdByUserId').references('Users.id');
    })

    // ===== GA_COSTS_BUDGET TABLE =====
    .createTable('GACostsBudget', (table) => {
      table.increments('id').primary();
      table.integer('gaCostId').unsigned().notNullable();
      table.decimal('maintenanceAmount', 12, 2).defaultTo(0);
      table.decimal('newAmount', 12, 2).defaultTo(0);
      table.decimal('totalAmount', 12, 2).defaultTo(0);
      table.decimal('forecastComplete', 12, 2);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      table.foreign('gaCostId').references('GACosts.id').onDelete('CASCADE');
      table.unique('gaCostId');
    })

    // ===== GA_COSTS_ACTUAL TABLE =====
    .createTable('GACostsActual', (table) => {
      table.increments('id').primary();
      table.integer('gaCostId').unsigned().notNullable();
      table.decimal('maintenanceAmount', 12, 2).defaultTo(0);
      table.decimal('newAmount', 12, 2).defaultTo(0);
      table.decimal('totalAmount', 12, 2).defaultTo(0);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      table.foreign('gaCostId').references('GACosts.id').onDelete('CASCADE');
      table.unique('gaCostId');
    })

    // ===== PROJECTS TABLE =====
    .createTable('Projects', (table) => {
      table.increments('id').primary();
      table.integer('year').notNullable();
      table.string('projectName', 255).notNullable();
      table.enum('projectType', ['Capital (Maintenance)', 'Capital (Growth)', 'G&A']).notNullable();
      table.enum('status', ['Active', 'Complete', 'On Hold']).defaultTo('Active');
      table.string('owner', 255);
      table.text('description');
      table.integer('createdByUserId').unsigned();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      table.index(['year', 'projectType']);
      table.index('status');
      table.foreign('createdByUserId').references('Users.id');
    })

    // ===== PROJECTS_BUDGET TABLE =====
    .createTable('ProjectsBudget', (table) => {
      table.increments('id').primary();
      table.integer('projectId').unsigned().notNullable();
      table.decimal('internalLabour', 12, 2).defaultTo(0);
      table.decimal('externalLabour', 12, 2).defaultTo(0);
      table.decimal('hardwareSoftware', 12, 2).defaultTo(0);
      table.decimal('other', 12, 2).defaultTo(0);
      table.decimal('totalAmount', 12, 2).defaultTo(0);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      table.foreign('projectId').references('Projects.id').onDelete('CASCADE');
      table.unique('projectId');
    })

    // ===== PROJECTS_ACTUAL TABLE =====
    .createTable('ProjectsActual', (table) => {
      table.increments('id').primary();
      table.integer('projectId').unsigned().notNullable();
      table.decimal('internalLabour', 12, 2).defaultTo(0);
      table.decimal('externalLabour', 12, 2).defaultTo(0);
      table.decimal('hardwareSoftware', 12, 2).defaultTo(0);
      table.decimal('other', 12, 2).defaultTo(0);
      table.decimal('totalAmount', 12, 2).defaultTo(0);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      table.foreign('projectId').references('Projects.id').onDelete('CASCADE');
      table.unique('projectId');
    })

    // ===== CURRENCIES TABLE (for future multi-currency support) =====
    .createTable('Currencies', (table) => {
      table.string('code', 3).primary();
      table.string('name', 100).notNullable();
      table.decimal('conversionRate', 12, 6).defaultTo(1.0);
      table.string('baseCurrency', 3).defaultTo('USD');
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    })

    // ===== AUDIT_LOG TABLE =====
    .createTable('AuditLog', (table) => {
      table.increments('id').primary();
      table.integer('userId').unsigned();
      table.string('tableName', 100).notNullable();
      table.string('action', 50).notNullable(); // 'CREATE', 'UPDATE', 'DELETE'
      table.integer('recordId').unsigned();
      table.text('changes'); // JSON of what changed
      table.string('ipAddress', 45);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.index(['tableName', 'action']);
      table.index('userId');
      table.index('createdAt');
      table.foreign('userId').references('Users.id').onDelete('SET NULL');
    })

    // ===== PERMISSIONS TABLE =====
    .createTable('Permissions', (table) => {
      table.increments('id').primary();
      table.string('role', 50).notNullable();
      table.string('resource', 100).notNullable();
      table.string('action', 50).notNullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.unique(['role', 'resource', 'action']);
    });
};

export const down = async function(knex) {
  // Drop all tables in reverse order
  return knex.schema
    .dropTableIfExists('Permissions')
    .dropTableIfExists('AuditLog')
    .dropTableIfExists('Currencies')
    .dropTableIfExists('ProjectsActual')
    .dropTableIfExists('ProjectsBudget')
    .dropTableIfExists('Projects')
    .dropTableIfExists('GACostsActual')
    .dropTableIfExists('GACostsBudget')
    .dropTableIfExists('GACosts')
    .dropTableIfExists('Users');
};
