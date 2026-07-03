const { Pool } = require('pg');
require('dotenv').config();

const createDatabase = async () => {
  // Connect to default postgres database to create our database
  const pool = new Pool({
    connectionString: 'postgresql://postgres:Abi@2003@localhost:5432/postgres',
  });

  try {
    const client = await pool.connect();
    
    // Check if database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'sales_dashboard'"
    );
    
    if (result.rows.length === 0) {
      await client.query('CREATE DATABASE sales_dashboard');
      console.log('Database created successfully');
    } else {
      console.log('Database already exists');
    }
    
    client.release();
    await pool.end();
    console.log('Setup complete!');
  } catch (err) {
    console.error('Error setting up database:', err);
    process.exit(1);
  }
};

createDatabase();
