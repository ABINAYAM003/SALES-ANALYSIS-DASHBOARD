const { pool } = require('../db');

const placeOrder = async (req, res) => {
  const { customerName, region, items } = req.body;

  if (!customerName || !region || !items || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const inserted = [];
    for (const item of items) {
      const txnId = `TXN${String(Math.floor(Math.random() * 9000000 + 1000000))}`;
      const date = new Date().toISOString().split('T')[0];

      const result = await client.query(
        `INSERT INTO transactions (transaction_id, customer_name, product_name, category, region, amount, status, transaction_date)
         VALUES ($1, $2, $3, $4, $5, $6, 'Completed', $7)
         ON CONFLICT (transaction_id) DO NOTHING
         RETURNING *`,
        [txnId, customerName, item.productName, item.category, region, item.amount, date]
      );
      if (result.rows[0]) inserted.push(result.rows[0]);
    }

    await client.query('COMMIT');
    res.json({ success: true, transactions: inserted.length, message: `${inserted.length} transaction(s) recorded` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Order error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  } finally {
    client.release();
  }
};

module.exports = { placeOrder };
