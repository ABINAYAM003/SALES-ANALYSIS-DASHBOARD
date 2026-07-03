const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

const createSchema = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        transaction_id VARCHAR(20) UNIQUE NOT NULL,
        customer_name VARCHAR(100) NOT NULL,
        product_name VARCHAR(150) NOT NULL,
        category VARCHAR(50) NOT NULL,
        region VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('Completed', 'Pending', 'Cancelled', 'Refunded')),
        transaction_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
      CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
      CREATE INDEX IF NOT EXISTS idx_transactions_region ON transactions(region);
      CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    `);
    console.log('Schema created successfully');
  } finally {
    client.release();
  }
};

module.exports = { pool, createSchema };
