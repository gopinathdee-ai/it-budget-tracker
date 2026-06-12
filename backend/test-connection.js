import sql from 'mssql';

const config = {
  server: 'localhost',
  database: 'ITBudgetDB',
  authentication: {
    type: 'default'
  },
  options: {
    trustServerCertificate: true,
    encrypt: false,
    integratedSecurity: true,
  }
};

async function test() {
  try {
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✅ Connected successfully!');
    const result = await pool.request().query('SELECT 1');
    console.log('✅ Query executed successfully!');
    await pool.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
