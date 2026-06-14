// src/database/migrations/005_create_app_settings.js
// System-level settings table for app configuration (theme, etc.)

export const up = async function(knex) {
  const hasTable = await knex.schema.hasTable('AppSettings');

  if (!hasTable) {
    return knex.schema.createTable('AppSettings', (table) => {
      table.increments('id').primary();
      table.string('setting', 100).notNullable().unique();
      table.text('value').notNullable();
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
  }
};

export const down = async function(knex) {
  return knex.schema.dropTable('AppSettings');
};
