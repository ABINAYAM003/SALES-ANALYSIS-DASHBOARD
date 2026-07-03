# SalesIQ — Sales Analytics Dashboard

A full-stack analytics dashboard built to handle 10,000+ transaction records efficiently using server-side pagination, filtering, and sorting.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS, Recharts, TanStack Query |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |

---

## Project Structure

```
sales-dashboard/
├── frontend/          # React app
│   └── src/
│       ├── components/
│       │   ├── charts/    # Summary cards + chart widgets
│       │   ├── filters/   # Filter bar
│       │   ├── table/     # Transactions table
│       │   └── ui/        # Error boundary
│       ├── pages/         # Dashboard page
│       └── utils/         # API client + formatters
└── backend/           # Express API
    ├── controllers/   # Business logic
    ├── db/            # Schema + seed script
    ├── routes/        # API routes
    └── server.js
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Database Setup

```sql
CREATE DATABASE sales_dashboard;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials

npm install
npm run seed        # Seeds 12,000 transactions
npm run dev         # Start on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm start           # Start on http://localhost:3000
```

---

## Database Schema

```sql
CREATE TABLE transactions (
  id               SERIAL PRIMARY KEY,
  transaction_id   VARCHAR(20) UNIQUE NOT NULL,
  customer_name    VARCHAR(100) NOT NULL,
  product_name     VARCHAR(150) NOT NULL,
  category         VARCHAR(50) NOT NULL,
  region           VARCHAR(50) NOT NULL,
  amount           DECIMAL(10,2) NOT NULL,
  status           VARCHAR(20) NOT NULL CHECK (status IN ('Completed','Pending','Cancelled','Refunded')),
  transaction_date DATE NOT NULL,
  created_at       TIMESTAMP DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_transactions_date     ON transactions(transaction_date);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_region   ON transactions(region);
CREATE INDEX idx_transactions_status   ON transactions(status);
```

---

## API Documentation

Base URL: `http://localhost:5000/api`

### GET /summary
Returns KPI metrics.

**Query params:** `startDate`, `endDate`, `category`, `region`

```json
{
  "totalRevenue": 4821053.00,
  "totalOrders": 12000,
  "avgOrderValue": 612.34,
  "totalCustomers": 960,
  "topCategory": "Electronics",
  "topRegion": "North"
}
```

---

### GET /charts
Returns chart data for all four visualisations.

**Query params:** same as `/summary`

```json
{
  "revenueTrend": [{ "month": "2023-01", "revenue": "421000", "orders": "520" }],
  "byCategory":  [{ "category": "Electronics", "revenue": "1200000", "orders": "1400" }],
  "byRegion":    [{ "region": "North", "revenue": "950000", "orders": "1100" }],
  "byStatus":    [{ "status": "Completed", "count": "7800" }]
}
```

---

### GET /transactions
Paginated, filterable, sortable transaction list.

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| page | number | 1 | Page number |
| limit | number | 20 | Records per page |
| sortBy | string | transaction_date | Field to sort |
| sortOrder | string | DESC | ASC or DESC |
| startDate | date | — | Filter from date |
| endDate | date | — | Filter to date |
| category | string | — | Category filter |
| region | string | — | Region filter |
| search | string | — | Full-text search |

```json
{
  "data": [...],
  "pagination": {
    "total": 12000,
    "page": 1,
    "limit": 20,
    "totalPages": 600
  }
}
```

---

### GET /export
Streams filtered data as a CSV file. Accepts same query params as `/transactions`.

---

### GET /filters
Returns distinct categories and regions for filter dropdowns.

```json
{
  "categories": ["Automotive", "Beauty", "Books", ...],
  "regions": ["Central", "East", "North", ...]
}
```

---

## Features

- **12,000 mock records** across 8 categories, 8 regions, 4 statuses
- **Server-side** pagination, filtering, sorting, search, CSV export
- **6 KPI cards** — revenue, orders, AOV, customers, top category, best region
- **4 charts** — area trend, horizontal bar (category), donut (region), bar (status)
- **Loading skeletons**, empty state, error state, error boundary
- **Responsive** layout — works on mobile, tablet, desktop
