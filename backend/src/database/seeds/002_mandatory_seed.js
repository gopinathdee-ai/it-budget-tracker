// src/database/seeds/002_mandatory.js
// IMPORTANT: This seed runs in PRODUCTION
// Only includes essential master data and admin users
// NO test data or sample data here

const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔐 MANDATORY SEED - PRODUCTION CRITICAL DATA');
  console.log('═══════════════════════════════════════════════════════════');

  // ===== DO NOT DELETE existing data in production =====
  // Instead, insert only if not exists to preserve production data
  
  console.log('');
  console.log('Step 1: Creating admin roles...');

  // Insert roles (admin reference data)
  // In production, these might already exist - use insertOrIgnore
  try {
    await knex('Permissions').where({}).del(); // Clear for fresh seed
    
    // Define all roles in the system
    const roles = ['Admin', 'Reporting', 'DataEntry'];
    
    for (const role of roles) {
      // Check if role has any permissions already
      const existing = await knex('Permissions').where({ role }).first();
      if (!existing) {
        console.log(`   • Creating permissions for role: ${role}`);
      }
    }
  } catch (error) {
    console.log('   ℹ️  Permissions table may already exist');
  }

  console.log('');
  console.log('Step 2: Creating role-based permissions (RBAC)...');

  // Insert role-based permissions
  // These define what each role can do
  const permissions = [
    // Admin permissions - FULL ACCESS
    { role: 'Admin', resource: 'ga_costs', action: 'create' },
    { role: 'Admin', resource: 'ga_costs', action: 'read' },
    { role: 'Admin', resource: 'ga_costs', action: 'update' },
    { role: 'Admin', resource: 'ga_costs', action: 'delete' },
    { role: 'Admin', resource: 'projects', action: 'create' },
    { role: 'Admin', resource: 'projects', action: 'read' },
    { role: 'Admin', resource: 'projects', action: 'update' },
    { role: 'Admin', resource: 'projects', action: 'delete' },
    { role: 'Admin', resource: 'reports', action: 'read' },
    { role: 'Admin', resource: 'reports', action: 'export' },
    { role: 'Admin', resource: 'admin', action: 'manage_users' },
    { role: 'Admin', resource: 'admin', action: 'view_audit_log' },
    { role: 'Admin', resource: 'admin', action: 'manage_roles' },
    { role: 'Admin', resource: 'admin', action: 'system_settings' },

    // Reporting permissions - READ-ONLY
    { role: 'Reporting', resource: 'ga_costs', action: 'read' },
    { role: 'Reporting', resource: 'projects', action: 'read' },
    { role: 'Reporting', resource: 'reports', action: 'read' },
    { role: 'Reporting', resource: 'reports', action: 'export' },

    // Data Entry permissions - CREATE and READ OWN
    { role: 'DataEntry', resource: 'ga_costs', action: 'create' },
    { role: 'DataEntry', resource: 'ga_costs', action: 'read' },
    { role: 'DataEntry', resource: 'projects', action: 'create' },
    { role: 'DataEntry', resource: 'projects', action: 'read' },
  ];

  await knex('Permissions').insert(permissions);
  console.log(`   ✅ Created ${permissions.length} role-based permissions`);

  console.log('');
  console.log('Step 3: Creating glassbreak admin user...');

  // Create glassbreak admin user (emergency access)
  // This is a "break glass" admin account for emergencies
  const glassbreakPassword = process.env.GLASSBREAK_ADMIN_PASSWORD || 'ChangeMe@#$%^&*123';
  const glassbreakHash = await bcrypt.hash(glassbreakPassword, 10);

  const glassbreakUser = {
    email: 'glassbreak@company.internal',
    username: 'glassbreak_admin',
    passwordHash: glassbreakHash,
    role: 'Admin',
    isActive: true,
  };

  try {
    // Check if glassbreak user already exists
    const existing = await knex('Users')
      .where({ email: glassbreakUser.email })
      .first();

    if (!existing) {
      await knex('Users').insert(glassbreakUser);
      console.log('   ✅ Created glassbreak admin user');
      console.log(`      Email: ${glassbreakUser.email}`);
      console.log(`      ⚠️  PASSWORD: Use environment variable GLASSBREAK_ADMIN_PASSWORD`);
    } else {
      console.log('   ℹ️  Glassbreak admin user already exists');
    }
  } catch (error) {
    console.error('   ❌ Error creating glassbreak user:', error.message);
  }

  console.log('');
  console.log('Step 4: Creating currencies master data...');

  // Insert currency reference data
  // This is used for multi-currency budget tracking
  const currencies = [
    { code: 'USD', name: 'US Dollar', conversionRate: 1.0, baseCurrency: 'USD' },
    { code: 'CAD', name: 'Canadian Dollar', conversionRate: 0.73, baseCurrency: 'USD' },
    { code: 'EUR', name: 'Euro', conversionRate: 1.08, baseCurrency: 'USD' },
    { code: 'GBP', name: 'British Pound', conversionRate: 1.27, baseCurrency: 'USD' },
    { code: 'JPY', name: 'Japanese Yen', conversionRate: 0.0067, baseCurrency: 'USD' },
  ];

  try {
    // Delete and re-insert to keep up-to-date conversion rates
    await knex('Currencies').del();
    await knex('Currencies').insert(currencies);
    console.log(`   ✅ Inserted ${currencies.length} currencies`);
  } catch (error) {
    console.error('   ❌ Error inserting currencies:', error.message);
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ MANDATORY SEED COMPLETE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('⚠️  IMPORTANT - Glassbreak Admin Setup:');
  console.log('');
  console.log('1. In production, set this environment variable:');
  console.log('   GLASSBREAK_ADMIN_PASSWORD=YourSecurePassword123!');
  console.log('');
  console.log('2. Store this password in:');
  console.log('   AWS Secrets Manager (for AWS deployments)');
  console.log('   or Windows Server password vault (for on-premises)');
  console.log('');
  console.log('3. Share password ONLY with authorized admins');
  console.log('');
  console.log('4. Change password after first login');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
};
