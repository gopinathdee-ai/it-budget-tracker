// src/database/migrations/003_add_subcategory_to_gacosts.js
// Adds optional subCategoryId field to GACosts table

export const up = async function(knex) {
  return knex.schema.table('GACosts', (table) => {
    table.integer('subCategoryId').unsigned().nullable();
    table.foreign('subCategoryId').references('SubCategories.id').onDelete('SET NULL');
    table.index('subCategoryId');
  });
};

export const down = async function(knex) {
  return knex.schema.table('GACosts', (table) => {
    table.dropColumn('subCategoryId');
  });
};
