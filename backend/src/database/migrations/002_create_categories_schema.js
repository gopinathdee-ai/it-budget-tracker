// src/database/migrations/002_create_categories_schema.js
// Creates Categories and SubCategories tables for managing G&A Cost classifications

export const up = async function(knex) {
  const hasCategoriesTable = await knex.schema.hasTable('Categories');

  if (hasCategoriesTable) {
    console.log('Categories tables already exist, skipping migration');
    return;
  }

  return knex.schema
    // ===== CATEGORIES TABLE =====
    .createTable('Categories', (table) => {
      table.increments('id');
      table.string('name', 100).notNullable().unique();
      table.text('description');
      table.integer('displayOrder').defaultTo(0);
      table.boolean('isActive').defaultTo(true);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      table.index('name');
      table.index('isActive');
    })

    // ===== SUBCATEGORIES TABLE =====
    .createTable('SubCategories', (table) => {
      table.increments('id');
      table.integer('categoryId').unsigned().notNullable();
      table.string('name', 100).notNullable();
      table.text('description');
      table.integer('displayOrder').defaultTo(0);
      table.boolean('isActive').defaultTo(true);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      table.foreign('categoryId').references('Categories.id').onDelete('CASCADE');
      table.unique(['categoryId', 'name']);
      table.index(['categoryId', 'isActive']);
    });
};

export const down = async function(knex) {
  return knex.schema
    .dropTableIfExists('SubCategories')
    .dropTableIfExists('Categories');
};
