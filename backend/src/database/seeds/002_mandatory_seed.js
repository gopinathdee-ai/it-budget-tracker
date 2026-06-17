// src/database/seeds/002_mandatory_seed.js
// IMPORTANT: This seed runs in PRODUCTION
// Only includes essential master data and admin users
// NO test data or sample data here

import bcrypt from 'bcryptjs';

export async function seed(knex) {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔐 MANDATORY SEED - PRODUCTION CRITICAL DATA');
  console.log('═══════════════════════════════════════════════════════════');

  // ===== DO NOT DELETE existing data in production =====
  // Instead, insert only if not exists to preserve production data
  
  console.log('');
  console.log('Step 1: Creating role-based permissions (RBAC)...');

  // Define all required default permissions
  // Only insert if they don't already exist (idempotent)
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

  let insertedCount = 0;
  for (const permission of permissions) {
    const existing = await knex('Permissions')
      .where({
        role: permission.role,
        resource: permission.resource,
        action: permission.action
      })
      .first();

    if (!existing) {
      await knex('Permissions').insert(permission);
      insertedCount++;
    }
  }

  if (insertedCount > 0) {
    console.log(`   ✅ Created ${insertedCount} new role-based permissions`);
  } else {
    console.log(`   ℹ️  All ${permissions.length} default permissions already exist`);
  }

  console.log('');
  console.log('Step 2: Creating admin user...');

  // Create primary admin user
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminHash = await bcrypt.hash(adminPassword, 10);

  const adminUser = {
    email: 'admin@local',
    username: 'admin',
    passwordHash: adminHash,
    role: 'Admin',
    isActive: true,
  };

  try {
    // Check if admin user already exists
    const existing = await knex('Users')
      .where({ email: adminUser.email })
      .first();

    if (!existing) {
      await knex('Users').insert(adminUser);
      console.log('   ✅ Created admin user');
      console.log(`      Email: ${adminUser.email}`);
      console.log(`      Password: ${adminPassword}`);
    } else {
      console.log('   ℹ️  Admin user already exists');
    }
  } catch (error) {
    console.error('   ❌ Error creating admin user:', error.message);
  }

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
  console.log('Step 4: Creating base currency (CAD)...');

  // Insert mandatory base currency (CAD only)
  // Other currencies should be added via the Admin Settings UI
  const baseCurrency = { code: 'CAD', name: 'Canadian Dollar', conversionRate: 1.0, baseCurrency: 'CAD' };

  try {
    // Check if CAD already exists
    const existing = await knex('Currencies').where({ code: 'CAD' }).first();

    if (!existing) {
      await knex('Currencies').insert(baseCurrency);
      console.log(`   ✅ Inserted base currency: CAD`);
    } else {
      console.log(`   ℹ️  Base currency CAD already exists`);
    }
  } catch (error) {
    console.error('   ❌ Error inserting base currency:', error.message);
  }

  console.log('');
  console.log('Step 5: Setting system-level app settings...');

  // Insert system-level settings (theme, etc.)
  // Only insert if they don't already exist (idempotent)
  const appSettings = [
    { setting: 'theme', value: 'dark-blue' }
  ];

  try {
    let settingsCount = 0;
    for (const setting of appSettings) {
      const existing = await knex('AppSettings')
        .where({ setting: setting.setting })
        .first();

      if (!existing) {
        await knex('AppSettings').insert(setting);
        settingsCount++;
      }
    }

    if (settingsCount > 0) {
      console.log(`   ✅ Initialized ${settingsCount} new app settings`);
    } else {
      console.log(`   ℹ️  All default app settings already exist`);
    }
  } catch (error) {
    console.error('   ❌ Error setting app settings:', error.message);
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
}
