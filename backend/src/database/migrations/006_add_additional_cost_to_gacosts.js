export async function up(knex) {
  return knex.schema.table('GACosts', (table) => {
    table.decimal('additionalCost', 12, 2).defaultTo(0).comment('Optional additional cost field');
  });
}

export async function down(knex) {
  return knex.schema.table('GACosts', (table) => {
    table.dropColumn('additionalCost');
  });
}
