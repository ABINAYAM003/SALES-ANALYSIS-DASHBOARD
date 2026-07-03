const { pool, createSchema } = require('./index');

const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Food & Beverage', 'Beauty', 'Automotive'];
const regions = ['North', 'South', 'East', 'West', 'Central', 'Northeast', 'Southeast', 'Northwest'];
const statuses = ['Completed', 'Pending', 'Cancelled', 'Refunded'];
const statusWeights = [0.65, 0.20, 0.10, 0.05];

const firstNames = ['Aarav', 'Priya', 'Rahul', 'Ananya', 'Vikram', 'Sneha', 'Arjun', 'Kavya', 'Rohit', 'Meera',
  'Aditya', 'Pooja', 'Karthik', 'Divya', 'Suresh', 'Lakshmi', 'Manish', 'Nisha', 'Deepak', 'Sunita',
  'James', 'Sarah', 'Michael', 'Emily', 'Robert', 'Jessica', 'William', 'Ashley', 'David', 'Amanda',
  'Rajesh', 'Sita', 'Mohan', 'Geetha', 'Vinod', 'Radha', 'Ashok', 'Usha', 'Ganesh', 'Parvathi'];

const lastNames = ['Kumar', 'Sharma', 'Patel', 'Singh', 'Reddy', 'Nair', 'Menon', 'Iyer', 'Pillai', 'Rao',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Taylor',
  'Gupta', 'Shah', 'Mehta', 'Joshi', 'Verma', 'Mishra', 'Srivastava', 'Tiwari', 'Pandey', 'Chauhan'];

const products = {
  Electronics: ['iPhone 15 Pro', 'Samsung Galaxy S24', 'MacBook Air M3', 'Dell XPS 15', 'Sony WH-1000XM5', 
    'iPad Pro', 'Apple Watch Series 9', 'LG OLED TV 55"', 'Canon EOS R6', 'Bose SoundLink'],
  Clothing: ['Nike Air Max', 'Adidas Ultraboost', 'Levi 501 Jeans', 'Zara Formal Shirt', 'H&M Summer Dress',
    'Puma Running Shorts', 'Reebok Classic', 'Tommy Hilfiger Polo', 'Calvin Klein T-Shirt', 'Gap Hoodie'],
  'Home & Garden': ['Dyson V15 Vacuum', 'Instant Pot Duo', 'KitchenAid Mixer', 'Roomba i7', 'Philips Hue Kit',
    'IKEA Bookshelf', 'Garden Hose Set', 'Smart Thermostat', 'Coffee Maker Pro', 'Air Purifier HEPA'],
  Sports: ['Yoga Mat Premium', 'Resistance Band Set', 'Dumbbell Set 20kg', 'Treadmill T500', 'Cycling Helmet',
    'Tennis Racket Pro', 'Football Official', 'Swimming Goggles', 'Badminton Racket', 'Jump Rope'],
  Books: ['Atomic Habits', 'The Lean Startup', 'Zero to One', 'Deep Work', 'Rich Dad Poor Dad',
    'Thinking Fast Slow', 'The Psychology of Money', 'Sapiens', 'Clean Code', 'Design Patterns'],
  'Food & Beverage': ['Organic Green Tea', 'Protein Powder 2kg', 'Whey Isolate Chocolate', 'Multivitamin Pack',
    'Omega-3 Capsules', 'Almond Butter Jar', 'Cold Brew Coffee', 'Energy Bar Box', 'Turmeric Latte', 'Collagen Powder'],
  Beauty: ['Serum Vitamin C', 'Retinol Night Cream', 'Hyaluronic Acid', 'SPF 50 Sunscreen', 'Lip Plumper Gloss',
    'Foundation Matte', 'Mascara Waterproof', 'Eye Shadow Palette', 'Hair Serum Argan', 'Face Wash Gentle'],
  Automotive: ['Car Phone Mount', 'Dash Cam 4K', 'Tire Pressure Gauge', 'Car Vacuum Cleaner', 'LED Headlights',
    'Seat Cushion Memory', 'Car Air Freshener', 'Jump Starter Pack', 'Steering Cover', 'OBD2 Scanner'],
};

const weightedRandom = (items, weights) => {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) return items[i];
  }
  return items[items.length - 1];
};

const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateTransactions = (count) => {
  const transactions = [];
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2024-12-31');

  for (let i = 1; i <= count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const productList = products[category];
    const product = productList[Math.floor(Math.random() * productList.length)];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    const status = weightedRandom(statuses, statusWeights);
    const date = randomDate(startDate, endDate);
    
    let amount;
    switch (category) {
      case 'Electronics': amount = (Math.random() * 1500 + 200).toFixed(2); break;
      case 'Clothing': amount = (Math.random() * 200 + 20).toFixed(2); break;
      case 'Home & Garden': amount = (Math.random() * 800 + 50).toFixed(2); break;
      case 'Sports': amount = (Math.random() * 500 + 30).toFixed(2); break;
      case 'Books': amount = (Math.random() * 50 + 10).toFixed(2); break;
      case 'Food & Beverage': amount = (Math.random() * 150 + 15).toFixed(2); break;
      case 'Beauty': amount = (Math.random() * 200 + 20).toFixed(2); break;
      case 'Automotive': amount = (Math.random() * 300 + 25).toFixed(2); break;
      default: amount = (Math.random() * 500 + 50).toFixed(2);
    }

    transactions.push({
      transaction_id: `TXN${String(i).padStart(7, '0')}`,
      customer_name: `${firstName} ${lastName}`,
      product_name: product,
      category,
      region,
      amount: parseFloat(amount),
      status,
      transaction_date: date.toISOString().split('T')[0],
    });
  }
  return transactions;
};

const seed = async () => {
  try {
    await createSchema();
    
    const count = await pool.query('SELECT COUNT(*) FROM transactions');
    if (parseInt(count.rows[0].count) > 0) {
      console.log('Data already seeded. Skipping...');
      process.exit(0);
    }

    console.log('Generating 12,000 transactions...');
    const transactions = generateTransactions(12000);
    
    const BATCH_SIZE = 500;
    for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
      const batch = transactions.slice(i, i + BATCH_SIZE);
      const values = batch.map((t, idx) => {
        const base = idx * 8;
        return `($${base+1}, $${base+2}, $${base+3}, $${base+4}, $${base+5}, $${base+6}, $${base+7}, $${base+8})`;
      }).join(', ');
      
      const params = batch.flatMap(t => [
        t.transaction_id, t.customer_name, t.product_name, t.category,
        t.region, t.amount, t.status, t.transaction_date
      ]);
      
      await pool.query(
        `INSERT INTO transactions (transaction_id, customer_name, product_name, category, region, amount, status, transaction_date) VALUES ${values}`,
        params
      );
      console.log(`Inserted ${Math.min(i + BATCH_SIZE, transactions.length)} / ${transactions.length}`);
    }
    
    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
