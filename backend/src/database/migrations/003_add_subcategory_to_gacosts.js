// src/database/migrations/003_add_subcategory_to_gacosts.js
// Adds optional subCategoryId field to GACosts table

export const up = async function(knex) {
  const hasSubCategoryColumn = await knex.schema.hasColumn('GACosts', 'subCategoryId');

  if (hasSubCategoryColumn) {
    console.log('subCategoryId column already exists, skipping migration');
    return;
  }

  return knex.schema.table('GACosts', (table) => {
    // Add optional subCategoryId field
    table.integer('subCategoryId').unsigned().nullable();
    table.foreign('subCategoryId').references('SubCategories.id').onDelete('SET NULL');
    table.index('subCategoryId');
  });
};

export const down = async function(knex) {
  const hasSubCategoryColumn = await knex.schema.hasColumn('GACosts', 'subCategoryId');

  if (!hasSubCategoryColumn) {
    return;
  }

  return knex.schema.table('GACosts', (table) => {
    table.dropColumn('subCategoryId');
  });
};
