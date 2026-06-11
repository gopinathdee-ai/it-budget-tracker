// src/database/seeds/003_optional.js
// DEVELOPMENT ONLY - DO NOT RUN IN PRODUCTION
// Creates test users and sample data for testing

const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 OPTIONAL SEED - DEVELOPMENT TEST DATA');
  console.log('═══════════════════════════════════════════════════════════');

  console.log('');
  console.log('⚠️  WARNING: This seed adds TEST DATA for development!');
  console.log('    DO NOT RUN THIS IN PRODUCTION');
  console.log('');

  // Only run in development
  if (process.env.NODE_ENV === 'production') {
    console.log('❌ Refusing to run optional seed in PRODUCTION environment!');
    console.log('   Set NODE_ENV=development to run test data seeds');
    console.log('═══════════════════════════════════════════════════════════');
    return;
  }

  console.log('Step 1: Creating test users...');

  // Delete old test users (but keep glassbreak admin)
  await knex('Users')
    .where('email', '!=', 'glassbreak@company.internal')
    .del();

  // Create test users with known passwords for development
  const testPassword = 'TestPassword123!';
  const hashedPassword = await bcrypt.hash(testPassword, 10);

  const testUsers = [
    {
      email: 'admin@company.internal',
      username: 'admin',
      passwordHash: hashedPassword,
      role: 'Admin',
      isActive: true,
    },
    {
      email: 'reporting@company.internal',
      username: 'reporting',
      passwordHash: hashedPassword,
      role: 'Reporting',
      isActive: true,
    },
    {
      email: 'dataentry@company.internal',
      username: 'dataentry',
      passwordHash: hashedPassword,
      role: 'DataEntry',
      isActive: true,
    },
    {
      email: 'it.leadership@company.internal',
      username: 'it.leadership',
      passwordHash: hashedPassword,
      role: 'Reporting',
      isActive: true,
    },
    {
      email: 'budget.manager@company.internal',
      username: 'budget_manager',
      passwordHash: hashedPassword,
      role: 'DataEntry',
      isActive: true,
    },
  ];

  const insertedUsers = await knex('Users').insert(testUsers);
  console.log(`   ✅ Created ${testUsers.length} test users`);
  console.log('');
  console.log('   Test User Credentials:');
  testUsers.forEach(user => {
    console.log(`      • ${user.email} / ${testPassword}`);
  });

  console.log('');
  console.log('Step 2: Creating sample G&A costs...');

  // Delete old sample G&A costs
  await knex('GACosts').del();

  const currentYear = new Date().getFullYear();

  const gaCosts = [
    {
      year: currentYear,
      category: 'Business Apps',
      costType: 'Retained',
      serviceSoftware: 'Microsoft 365',
      vendor: 'Microsoft',
      version: '16.0',
      currencyCode: 'USD',
      createdByUserId: insertedUsers[0],
    },
    {
      year: currentYear,
      category: 'Business Apps',
      costType: 'Retained',
      serviceSoftware: 'Salesforce CRM',
      vendor: 'Salesforce',
      version: '58.0',
      currencyCode: 'USD',
      createdByUserId: insertedUsers[0],
    },
    {
      year: currentYear,
      category: 'Business Apps',
      costType: 'Distributed',
      serviceSoftware: 'Adobe Creative Cloud',
      vendor: 'Adobe',
      version: '2024',
      currencyCode: 'USD',
      createdByUserId: insertedUsers[0],
    },
    {
      year: currentYear,
      category: 'IT Services',
      costType: 'Distributed',
      serviceSoftware: 'AWS Cloud Services',
      vendor: 'Amazon',
      version: '2024.01',
      currencyCode: 'USD',
      createdByUserId: insertedUsers[0],
    },
    {
      year: currentYear,
      category: 'IT Services',
      costType: 'Retained',
      serviceSoftware: 'Okta Identity Management',
      vendor: 'Okta',
      version: '1.0',
      currencyCode: 'USD',
      createdByUserId: insertedUsers[0],
    },
    {
      year: currentYear,
      category: 'IT Services',
      costType: 'Retained',
      serviceSoftware: 'Datadog Monitoring',
      vendor: 'Datadog',
      version: '3.0',
      currencyCode: 'USD',
      createdByUserId: insertedUsers[0],
    },
    {
      year: currentYear,
      category: 'Other',
      costType: 'Retained',
      serviceSoftware: 'Software Licenses & Maintenance',
      vendor: 'Various',
      version: '2024',
      currencyCode: 'USD',
      createdByUserId: insertedUsers[0],
    },
    {
      year: currentYear,
      category: 'Other',
      costType: 'Distributed',
      serviceSoftware: 'Hardware Maintenance',
      vendor: 'Various',
      version: '2024',
      currencyCode: 'USD',
      createdByUserId: insertedUsers[0],
    },
  ];

  const insertedGACosts = await knex('GACosts').insert(gaCosts);
  console.log(`   ✅ Created ${gaCosts.length} sample G&A costs`);

  console.log('');
  console.log('Step 3: Creating G&A cost budgets and actuals...');

  let gaCostCount = 0;
  for (let i = 0; i < insertedGACosts.length; i++) {
    const gaCostId = insertedGACosts[i];

    // Generate realistic budget amounts
    const maintenanceBudget = Math.floor(Math.random() * 300000) + 50000;
    const newBudget = Math.floor(Math.random() * 100000);
    const totalBudget = maintenanceBudget + newBudget;

    // Actual slightly different from budget (within 10%)
    const maintenanceActual = Math.floor(maintenanceBudget * (0.85 + Math.random() * 0.25));
    const newActual = Math.floor(newBudget * (0.80 + Math.random() * 0.30));
    const totalActual = maintenanceActual + newActual;

    // Insert budget
    await knex('GACostsBudget').insert({
      gaCostId,
      maintenanceAmount: maintenanceBudget,
      newAmount: newBudget,
      totalAmount: totalBudget,
      forecastComplete: Math.floor(totalBudget * (0.95 + Math.random() * 0.10)),
    });

    // Insert actual
    await knex('GACostsActual').insert({
      gaCostId,
      maintenanceAmount: maintenanceActual,
      newAmount: newActual,
      totalAmount: totalActual,
    });

    gaCostCount++;
  }

  console.log(`   ✅ Created budgets and actuals for ${gaCostCount} G&A costs`);

  console.log('');
  console.log('Step 4: Creating sample projects...');

  // Delete old sample projects
  await knex('Projects').del();

  const projects = [
    {
      year: currentYear,
      projectName: 'Cloud Migration to AWS',
      projectType: 'Capital (Growth)',
      status: 'Active',
      owner: 'John Smith',
      description: 'Complete migration of on-premises infrastructure to AWS cloud',
      createdByUserId: insertedUsers[0],
    },
    {
      year: currentYear,
      projectName: 'SQL Server Upgrade',
      projectType: 'Capital (Maintenance)',
      status: 'Active',
      owner: 'Sarah Johnson',
      description: 'Upgrading SQL Server from 2019 to 2022 version',
      createdByUserId: insertedUsers[0],
    },
    {
      year: currentYear,
      projectName: 'IT Budget Tracking Application',
      projectType: 'G&A',
      status: 'Active',
      owner: 'Mike Chen',
      description: 'New application for tracking IT budgets and actuals',
      createdByUserId: insertedUsers[0],
    },
    {
      year: currentYear,
      projectName: 'Network Security Hardening',
      projectType: 'Capital (Maintenance)',
      status: 'Complete',
      owner: 'Lisa Anderson',
      description: 'Enhanced network security controls and segmentation',
      createdByUserId: insertedUsers[0],
    },
    {
      year: currentYear,
      projectName: 'Office 365 Consolidation',
      projectType: 'Capital (Growth)',
      status: 'Complete',
      owner: 'Robert Davis',
      description: 'Consolidating multiple Office 365 tenants into single tenant',
      createdByUserId: insertedUsers[0],
    },
    {
      year: currentYear,
      projectName: 'Disaster Recovery Plan Update',
      projectType: 'G&A',
      status: 'On Hold',
      owner: 'Jennifer Wilson',
      description: 'Updating and testing disaster recovery procedures',
      createdByUserId: insertedUsers[0],
    },
  ];

  const insertedProjects = await knex('Projects').insert(projects);
  console.log(`   ✅ Created ${projects.length} sample projects`);

  console.log('');
  console.log('Step 5: Creating project budgets and actuals...');

  let projectCount = 0;
  for (let i = 0; i < insertedProjects.length; i++) {
    const projectId = insertedProjects[i];

    // Generate realistic cost breakdown
    const internalLabourBudget = Math.floor(Math.random() * 500000) + 100000;
    const externalLabourBudget = Math.floor(Math.random() * 300000);
    const hardwareSoftwareBudget = Math.floor(Math.random() * 500000);
    const otherBudget = Math.floor(Math.random() * 100000);
    const totalBudget = internalLabourBudget + externalLabourBudget + hardwareSoftwareBudget + otherBudget;

    // Actual typically slightly under budget (good project management)
    const costMultiplier = 0.85 + Math.random() * 0.15;
    const internalLabourActual = Math.floor(internalLabourBudget * costMultiplier);
    const externalLabourActual = Math.floor(externalLabourBudget * costMultiplier);
    const hardwareSoftwareActual = Math.floor(hardwareSoftwareBudget * costMultiplier);
    const otherActual = Math.floor(otherBudget * costMultiplier);
    const totalActual = internalLabourActual + externalLabourActual + hardwareSoftwareActual + otherActual;

    // Insert budget
    await knex('ProjectsBudget').insert({
      projectId,
      internalLabour: internalLabourBudget,
      externalLabour: externalLabourBudget,
      hardwareSoftware: hardwareSoftwareBudget,
      other: otherBudget,
      totalAmount: totalBudget,
    });

    // Insert actual
    await knex('ProjectsActual').insert({
      projectId,
      internalLabour: internalLabourActual,
      externalLabour: externalLabourActual,
      hardwareSoftware: hardwareSoftwareActual,
      other: otherActual,
      totalAmount: totalActual,
    });

    projectCount++;
  }

  console.log(`   ✅ Created budgets and actuals for ${projectCount} projects`);

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ OPTIONAL SEED COMPLETE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('Test Data Ready:');
  console.log(`  • ${testUsers.length} test users created`);
  console.log(`  • ${gaCosts.length} sample G&A costs`);
  console.log(`  • ${projects.length} sample projects`);
  console.log(`  • All with realistic budgeted vs actual costs`);
  console.log('');
  console.log('Ready to test the application! 🧪');
  console.log('');
};
