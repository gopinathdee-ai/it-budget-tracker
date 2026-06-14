// src/database/migrations/004_create_majorminor_schema.js
// Creates MajorMinor finance codes table

export const up = async function(knex) {
  const hasMajorMinorTable = await knex.schema.hasTable('MajorMinor');

  if (hasMajorMinorTable) {
    console.log('MajorMinor table already exists, skipping migration');
    return;
  }

  return knex.schema
    .createTable('MajorMinor', (table) => {
      table.increments('id');
      table.string('code', 20).notNullable().unique(); // e.g., "10000.50000"
      table.string('description', 255);
      table.boolean('isActive').defaultTo(true);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      table.index('code');
      table.index('isActive');
    });
};

export const down = async function(knex) {
  return knex.schema.dropTableIfExists('MajorMinor');
};
