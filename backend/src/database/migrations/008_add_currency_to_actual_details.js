// src/database/migrations/008_add_currency_to_actual_details.js
// Add currency field to GACostsActualDetails to support multi-currency actuals

export const up = async function(knex) {
  const hasColumn = await knex.schema.hasColumn('GACostsActualDetails', 'currency');
  if (hasColumn) {
    console.log('GACostsActualDetails.currency column already exists, skipping migration');
    return;
  }

  return knex.schema.alterTable('GACostsActualDetails', (table) => {
    table.string('currency', 3).defaultTo('CAD').notNullable();
  });
};

export const down = async function(knex) {
  return knex.schema.alterTable('GACostsActualDetails', (table) => {
    table.dropColumn('currency');
  });
};
