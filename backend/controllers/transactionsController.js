const { pool } = require('../db');
const { Parser } = require('json2csv');

const buildWhereClause = (filters) => {
  const conditions = [];
  const params = [];
  let paramIdx = 1;

  const { startDate, endDate, category, region, search } = filters;

  if (startDate) {
    conditions.push(`transaction_date >= $${paramIdx++}`);
    params.push(startDate);
  }
  if (endDate) {
    conditions.push(`transaction_date <= $${paramIdx++}`);
    params.push(endDate);
  }
  if (category && category !== 'all') {
    conditions.push(`category = $${paramIdx++}`);
    params.push(category);
  }
  if (region && region !== 'all') {
    conditions.push(`region = $${paramIdx++}`);
    params.push(region);
  }
  if (search) {
    conditions.push(`(
      LOWER(customer_name) LIKE $${paramIdx} OR
      LOWER(product_name) LIKE $${paramIdx} OR
      LOWER(transaction_id) LIKE $${paramIdx}
    )`);
    params.push(`%${search.toLowerCase()}%`);
    paramIdx++;
  }

  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
    nextIdx: paramIdx,
  };
};

const getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'transaction_date',
      sortOrder = 'DESC',
      startDate,
      endDate,
      category,
      region,
      search,
    } = req.query;

    const allowedSortFields = ['transaction_date', 'amount', 'customer_name', 'transaction_id', 'status', 'category'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'transaction_date';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { whereClause, params, nextIdx } = buildWhereClause({ startDate, endDate, category, region, search });

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM transactions ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const dataParams = [...params, parseInt(limit), offset];

    const result = await pool.query(
      `SELECT 
        transaction_id, customer_name, product_name, category, region,
        amount, status, transaction_date
       FROM transactions 
       ${whereClause}
       ORDER BY ${sortField} ${order}
       LIMIT $${nextIdx} OFFSET $${nextIdx + 1}`,
      dataParams
    );

    res.json({
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

const getSummary = async (req, res) => {
  try {
    const { startDate, endDate, category, region } = req.query;
    const { whereClause, params } = buildWhereClause({ startDate, endDate, category, region });

    const [summary, topCategory, topRegion] = await Promise.all([
      pool.query(
        `SELECT 
          COUNT(*) AS total_orders,
          COALESCE(SUM(CASE WHEN status = 'Completed' THEN amount ELSE 0 END), 0) AS total_revenue,
          COALESCE(AVG(CASE WHEN status = 'Completed' THEN amount END), 0) AS avg_order_value,
          COUNT(DISTINCT customer_name) AS total_customers
         FROM transactions ${whereClause}`,
        params
      ),
      pool.query(
        `SELECT category, SUM(amount) AS revenue
         FROM transactions ${whereClause} ${whereClause ? 'AND' : 'WHERE'} status = 'Completed'
         GROUP BY category ORDER BY revenue DESC LIMIT 1`,
        params
      ).catch(() => pool.query(
        `SELECT category, SUM(amount) AS revenue
         FROM transactions WHERE status = 'Completed'
         GROUP BY category ORDER BY revenue DESC LIMIT 1`
      )),
      pool.query(
        `SELECT region, SUM(amount) AS revenue
         FROM transactions ${whereClause} ${whereClause ? 'AND' : 'WHERE'} status = 'Completed'
         GROUP BY region ORDER BY revenue DESC LIMIT 1`,
        params
      ).catch(() => pool.query(
        `SELECT region, SUM(amount) AS revenue
         FROM transactions WHERE status = 'Completed'
         GROUP BY region ORDER BY revenue DESC LIMIT 1`
      )),
    ]);

    // Re-do top category and region with correct logic
    const topCatWhere = whereClause ? `${whereClause} AND status = 'Completed'` : `WHERE status = 'Completed'`;
    const [topCatResult, topRegResult] = await Promise.all([
      pool.query(`SELECT category, SUM(amount) AS revenue FROM transactions ${topCatWhere} GROUP BY category ORDER BY revenue DESC LIMIT 1`, params),
      pool.query(`SELECT region, SUM(amount) AS revenue FROM transactions ${topCatWhere} GROUP BY region ORDER BY revenue DESC LIMIT 1`, params),
    ]);

    const s = summary.rows[0];
    res.json({
      totalOrders: parseInt(s.total_orders),
      totalRevenue: parseFloat(s.total_revenue),
      avgOrderValue: parseFloat(s.avg_order_value),
      totalCustomers: parseInt(s.total_customers),
      topCategory: topCatResult.rows[0]?.category || 'N/A',
      topRegion: topRegResult.rows[0]?.region || 'N/A',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
};

const getChartData = async (req, res) => {
  try {
    const { startDate, endDate, category, region } = req.query;
    const { whereClause, params } = buildWhereClause({ startDate, endDate, category, region });
    const completedWhere = whereClause ? `${whereClause} AND status = 'Completed'` : `WHERE status = 'Completed'`;

    const [revenueTrend, byCategory, byRegion, byStatus] = await Promise.all([
      pool.query(
        `SELECT TO_CHAR(transaction_date, 'YYYY-MM') AS month, SUM(amount) AS revenue, COUNT(*) AS orders
         FROM transactions ${completedWhere}
         GROUP BY month ORDER BY month ASC`,
        params
      ),
      pool.query(
        `SELECT category, SUM(amount) AS revenue, COUNT(*) AS orders
         FROM transactions ${completedWhere}
         GROUP BY category ORDER BY revenue DESC`,
        params
      ),
      pool.query(
        `SELECT region, SUM(amount) AS revenue, COUNT(*) AS orders
         FROM transactions ${completedWhere}
         GROUP BY region ORDER BY revenue DESC`,
        params
      ),
      pool.query(
        `SELECT status, COUNT(*) AS count
         FROM transactions ${whereClause}
         GROUP BY status`,
        params
      ),
    ]);

    res.json({
      revenueTrend: revenueTrend.rows,
      byCategory: byCategory.rows,
      byRegion: byRegion.rows,
      byStatus: byStatus.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
};

const exportCSV = async (req, res) => {
  try {
    const { startDate, endDate, category, region, search, sortBy = 'transaction_date', sortOrder = 'DESC' } = req.query;
    const { whereClause, params } = buildWhereClause({ startDate, endDate, category, region, search });

    const allowedSortFields = ['transaction_date', 'amount', 'customer_name', 'transaction_id', 'status', 'category'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'transaction_date';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const result = await pool.query(
      `SELECT transaction_id, customer_name, product_name, category, region, amount, status, transaction_date
       FROM transactions ${whereClause}
       ORDER BY ${sortField} ${order}`,
      params
    );

    const fields = [
      { label: 'Transaction ID', value: 'transaction_id' },
      { label: 'Customer Name', value: 'customer_name' },
      { label: 'Product Name', value: 'product_name' },
      { label: 'Category', value: 'category' },
      { label: 'Region', value: 'region' },
      { label: 'Amount (₹)', value: 'amount' },
      { label: 'Status', value: 'status' },
      { label: 'Transaction Date', value: 'transaction_date' },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(result.rows);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=transactions_${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
};

const getFilters = async (req, res) => {
  try {
    const [categories, regions] = await Promise.all([
      pool.query('SELECT DISTINCT category FROM transactions ORDER BY category'),
      pool.query('SELECT DISTINCT region FROM transactions ORDER BY region'),
    ]);
    res.json({
      categories: categories.rows.map(r => r.category),
      regions: regions.rows.map(r => r.region),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
};

module.exports = { getTransactions, getSummary, getChartData, exportCSV, getFilters };
