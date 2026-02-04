const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'loadbuck-secret-key-dev';

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// SQLite Database Setup
const dbPath = path.join(dataDir, 'loadbuck.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Settings table
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    user_id TEXT PRIMARY KEY,
    break_even_rate REAL DEFAULT 2.0,
    mpg REAL DEFAULT 7.0,
    fuel_tank_size REAL DEFAULT 150,
    maintenance_reserve REAL DEFAULT 0.15,
    driver_pay_rate REAL DEFAULT 0.65,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Trips table
  db.run(`CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    rate_offered REAL NOT NULL,
    loaded_miles REAL NOT NULL,
    deadhead_miles REAL DEFAULT 0,
    origin TEXT,
    destination TEXT,
    fuel_price REAL NOT NULL,
    mpg REAL NOT NULL,
    tolls REAL DEFAULT 0,
    maintenance_reserve REAL DEFAULT 0,
    fuel_cost REAL NOT NULL,
    total_profit REAL NOT NULL,
    profit_per_mile REAL NOT NULL,
    break_even_rate REAL NOT NULL,
    recommendation TEXT NOT NULL,
    notes TEXT,
    actual_profit REAL,
    status TEXT DEFAULT 'calculated',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Calculate profit endpoint (no auth required for quick calculations)
app.post('/api/calculate', async (req, res) => {
  try {
    const {
      rate_offered,
      loaded_miles,
      deadhead_miles = 0,
      fuel_price,
      mpg,
      break_even_rate = 2.0,
      tolls = 0,
      maintenance_reserve = 0.15
    } = req.body;

    // Validate required fields
    if (!rate_offered || !loaded_miles || !fuel_price || !mpg) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate total miles
    const totalMiles = parseFloat(loaded_miles) + parseFloat(deadhead_miles);

    // Calculate fuel cost
    const gallonsNeeded = totalMiles / parseFloat(mpg);
    const fuelCost = gallonsNeeded * parseFloat(fuel_price);

    // Calculate maintenance reserve
    const maintenanceCost = totalMiles * parseFloat(maintenance_reserve);

    // Total expenses
    const totalExpenses = fuelCost + parseFloat(tolls) + maintenanceCost;

    // Calculate profit
    const totalProfit = parseFloat(rate_offered) - totalExpenses;
    const profitPerMile = totalProfit / totalMiles;

    // Determine recommendation
    let recommendation;
    const profitMargin = profitPerMile / parseFloat(break_even_rate);

    if (profitPerMile >= parseFloat(break_even_rate) * 1.1) {
      recommendation = 'YES';
    } else if (profitPerMile >= parseFloat(break_even_rate)) {
      recommendation = 'BORDERLINE';
    } else {
      recommendation = 'NO';
    }

    res.json({
      rate_offered: parseFloat(rate_offered),
      loaded_miles: parseFloat(loaded_miles),
      deadhead_miles: parseFloat(deadhead_miles),
      total_miles: totalMiles,
      fuel_price: parseFloat(fuel_price),
      mpg: parseFloat(mpg),
      tolls: parseFloat(tolls),
      maintenance_reserve: parseFloat(maintenance_reserve),
      fuel_cost: parseFloat(fuelCost.toFixed(2)),
      maintenance_cost: parseFloat(maintenanceCost.toFixed(2)),
      total_expenses: parseFloat(totalExpenses.toFixed(2)),
      total_profit: parseFloat(totalProfit.toFixed(2)),
      profit_per_mile: parseFloat(profitPerMile.toFixed(2)),
      break_even_rate: parseFloat(break_even_rate),
      recommendation,
      profit_margin_vs_break_even: parseFloat(((profitPerMile / break_even_rate - 1) * 100).toFixed(1))
    });
  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({ error: 'Calculation failed' });
  }
});

// Estimate tolls endpoint (mock implementation)
app.post('/api/estimate-tolls', (req, res) => {
  const { origin, destination, route_miles } = req.body;
  
  // Mock toll estimation based on common toll corridors
  // In production, this would integrate with Google Maps or similar API
  const tollEstimate = Math.min(route_miles * 0.15, 150); // Max $150 in tolls
  
  res.json({
    origin,
    destination,
    estimated_tolls: parseFloat(tollEstimate.toFixed(2)),
    note: 'Estimated based on typical toll rates'
  });
});

// Get fuel prices (mock implementation)
app.get('/api/fuel-prices', (req, res) => {
  // Mock fuel prices by region
  const mockPrices = {
    national_avg: 3.85,
    regions: {
      northeast: 3.95,
      southeast: 3.65,
      midwest: 3.75,
      southwest: 3.55,
      northwest: 4.15,
      california: 4.85
    }
  };
  
  res.json(mockPrices);
});

// AUTH ROUTES

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    db.run(
      'INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)',
      [userId, email, hashedPassword, name],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already registered' });
          }
          throw err;
        }

        // Create default settings
        db.run(
          'INSERT INTO settings (user_id) VALUES (?)',
          [userId]
        );

        const token = jwt.sign({ userId, email }, JWT_SECRET);
        res.json({ token, user: { id: userId, email, name } });
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  db.get(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    }
  );
});

// SETTINGS ROUTES

// Get user settings
app.get('/api/settings', authenticateToken, (req, res) => {
  db.get(
    'SELECT * FROM settings WHERE user_id = ?',
    [req.user.userId],
    (err, settings) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!settings) {
        // Create default settings if not exists
        db.run(
          'INSERT INTO settings (user_id) VALUES (?)',
          [req.user.userId],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to create settings' });
            }
            res.json({
              break_even_rate: 2.0,
              mpg: 7.0,
              fuel_tank_size: 150,
              maintenance_reserve: 0.15,
              driver_pay_rate: 0.65
            });
          }
        );
      } else {
        res.json(settings);
      }
    }
  );
});

// Update settings
app.put('/api/settings', authenticateToken, (req, res) => {
  const {
    break_even_rate,
    mpg,
    fuel_tank_size,
    maintenance_reserve,
    driver_pay_rate
  } = req.body;

  db.run(
    `INSERT INTO settings (user_id, break_even_rate, mpg, fuel_tank_size, maintenance_reserve, driver_pay_rate)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       break_even_rate = excluded.break_even_rate,
       mpg = excluded.mpg,
       fuel_tank_size = excluded.fuel_tank_size,
       maintenance_reserve = excluded.maintenance_reserve,
       driver_pay_rate = excluded.driver_pay_rate`,
    [
      req.user.userId,
      break_even_rate,
      mpg,
      fuel_tank_size,
      maintenance_reserve,
      driver_pay_rate
    ],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to update settings' });
      }
      res.json({ message: 'Settings updated' });
    }
  );
});

// TRIPS ROUTES

// Save a trip
app.post('/api/trips', authenticateToken, (req, res) => {
  const tripId = uuidv4();
  const {
    rate_offered,
    loaded_miles,
    deadhead_miles,
    origin,
    destination,
    fuel_price,
    mpg,
    tolls,
    maintenance_reserve,
    fuel_cost,
    total_profit,
    profit_per_mile,
    break_even_rate,
    recommendation,
    notes
  } = req.body;

  db.run(
    `INSERT INTO trips (
      id, user_id, rate_offered, loaded_miles, deadhead_miles, origin, destination,
      fuel_price, mpg, tolls, maintenance_reserve, fuel_cost, total_profit,
      profit_per_mile, break_even_rate, recommendation, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      tripId, req.user.userId, rate_offered, loaded_miles, deadhead_miles,
      origin, destination, fuel_price, mpg, tolls, maintenance_reserve,
      fuel_cost, total_profit, profit_per_mile, break_even_rate,
      recommendation, notes
    ],
    (err) => {
      if (err) {
        console.error('Save trip error:', err);
        return res.status(500).json({ error: 'Failed to save trip' });
      }
      res.json({ id: tripId, message: 'Trip saved' });
    }
  );
});

// Get all trips for user
app.get('/api/trips', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM trips WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.userId],
    (err, trips) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(trips);
    }
  );
});

// Get single trip
app.get('/api/trips/:id', authenticateToken, (req, res) => {
  db.get(
    'SELECT * FROM trips WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.userId],
    (err, trip) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!trip) {
        return res.status(404).json({ error: 'Trip not found' });
      }
      res.json(trip);
    }
  );
});

// Update trip (add actual profit, notes, status)
app.put('/api/trips/:id', authenticateToken, (req, res) => {
  const { actual_profit, notes, status } = req.body;

  db.run(
    'UPDATE trips SET actual_profit = ?, notes = ?, status = ? WHERE id = ? AND user_id = ?',
    [actual_profit, notes, status, req.params.id, req.user.userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to update trip' });
      }
      res.json({ message: 'Trip updated' });
    }
  );
});

// Delete trip
app.delete('/api/trips/:id', authenticateToken, (req, res) => {
  db.run(
    'DELETE FROM trips WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete trip' });
      }
      res.json({ message: 'Trip deleted' });
    }
  );
});

// Get trip statistics
app.get('/api/trips/stats/summary', authenticateToken, (req, res) => {
  db.get(
    `SELECT 
      COUNT(*) as total_trips,
      AVG(total_profit) as avg_profit,
      AVG(profit_per_mile) as avg_profit_per_mile,
      SUM(CASE WHEN recommendation = 'YES' THEN 1 ELSE 0 END) as yes_count,
      SUM(CASE WHEN recommendation = 'BORDERLINE' THEN 1 ELSE 0 END) as borderline_count,
      SUM(CASE WHEN recommendation = 'NO' THEN 1 ELSE 0 END) as no_count
    FROM trips WHERE user_id = ?`,
    [req.user.userId],
    (err, stats) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(stats);
    }
  );
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`LoadBuck API server running on port ${PORT}`);
});

module.exports = app;
