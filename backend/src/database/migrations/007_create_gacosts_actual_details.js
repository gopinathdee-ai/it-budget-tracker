// src/database/migrations/007_create_gacosts_actual_details.js
// Supports multiple actual cost entries per G&A Cost (monthly breakdown, etc.)

export const up = async function(knex) {
  const hasTable = await knex.schema.hasTable('GACostsActualDetails');
  if (hasTable) {
    console.log('GACostsActualDetails table already exists, skipping migration');
    return;
  }

  return knex.schema.createTable('GACostsActualDetails', (table) => {
    table.increments('id').primary();
    table.integer('gaCostId').unsigned().notNullable();
    table.decimal('amount', 12, 2).notNullable();
    table.date('entryDate').notNullable();
    table.text('description');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());

    table.foreign('gaCostId').references('GACosts.id').onDelete('CASCADE');
    table.index('gaCostId');
    table.index('entryDate');
  });
};

export const down = async function(knex) {
  return knex.schema.dropTableIfExists('GACostsActualDetails');
};
