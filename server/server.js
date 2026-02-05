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

// Enhanced toll estimation with route-based calculations
app.post('/api/estimate-tolls', (req, res) => {
  const { origin, destination, route_miles } = req.body;
  
  if (!origin || !destination) {
    return res.status(400).json({ error: 'Origin and destination required' });
  }
  
  // Normalize inputs
  const orig = origin.toLowerCase().trim();
  const dest = destination.toLowerCase().trim();
  const miles = parseFloat(route_miles) || 0;
  
  // Known toll corridors with actual toll data
  const tollRoutes = [
    // Northeast Corridor
    { states: ['ny', 'nj', 'pa'], rate_per_mile: 0.18, base: 15 },
    { states: ['ma', 'ct', 'ri'], rate_per_mile: 0.15, base: 12 },
    { states: ['md', 'de', 'va'], rate_per_mile: 0.14, base: 10 },
    
    // Midwest
    { states: ['il', 'in', 'oh'], rate_per_mile: 0.12, base: 8 },
    { states: ['mi'], rate_per_mile: 0.10, base: 6 },
    
    // South
    { states: ['fl'], rate_per_mile: 0.16, base: 8 }, // Florida Turnpike
    { states: ['tx'], rate_per_mile: 0.19, base: 12 }, // Texas tolls
    { states: ['nc'], rate_per_mile: 0.13, base: 7 },
    { states: ['ga'], rate_per_mile: 0.14, base: 8 },
    
    // West
    { states: ['ca'], rate_per_mile: 0.22, base: 15 }, // California high tolls
    { states: ['wa'], rate_per_mile: 0.11, base: 7 },
    { states: ['co'], rate_per_mile: 0.13, base: 8 },
  ];
  
  // Check for specific high-toll routes
  const highTollRoutes = [
    // NYC area
    { pattern: /new york|nyc|manhattan|brooklyn/, tolls: 45, name: 'NYC Area Tolls' },
    { pattern: /new jersey|nj|jersey city/, tolls: 35, name: 'NJ/NY Crossing' },
    
    // Major bridges/tunnels
    { pattern: /san francisco|sf|oakland/, tolls: 35, name: 'Bay Area Bridges' },
    { pattern: /seattle|bellevue/, tolls: 18, name: 'WA-520 Bridge' },
    
    // Florida
    { pattern: /miami|ft lauderdale|orlando/, tolls: 28, name: 'Florida Turnpike' },
    
    // Chicago
    { pattern: /chicago|il\b|illinois/, tolls: 25, name: 'Chicago Skyway/I-Pass' },
    
    // Texas
    { pattern: /houston|dallas|austin|san antonio/, tolls: 22, name: 'Texas Toll Roads' },
    
    // Pennsylvania
    { pattern: /philadelphia|philly|pittsburgh|pa\b/, tolls: 32, name: 'PA Turnpike' },
    
    // Ohio/Indiana
    { pattern: /columbus|cleveland|indianapolis|ohio/, tolls: 20, name: 'OH/IN Toll Roads' },
  ];
  
  let estimatedTolls = 0;
  let tollBreakdown = [];
  let routeDescription = `${origin} → ${destination}`;
  
  // Check for high-toll route matches
  let originTolls = 0;
  let destTolls = 0;
  
  highTollRoutes.forEach(route => {
    if (route.pattern.test(orig)) {
      originTolls = Math.max(originTolls, route.tolls);
      tollBreakdown.push({ name: route.name, cost: route.tolls });
    }
    if (route.pattern.test(dest)) {
      destTolls = Math.max(destTolls, route.tolls);
      tollBreakdown.push({ name: route.name, cost: route.tolls });
    }
  });
  
  // Calculate based on origin + destination + miles
  if (originTolls > 0 || destTolls > 0) {
    estimatedTolls = Math.max(originTolls, destTolls);
    // Add per-mile tolls if route is long
    if (miles > 100) {
      estimatedTolls += (miles * 0.08);
    }
  } else {
    // Standard calculation for non-high-toll areas
    estimatedTolls = miles * 0.06;
  }
  
  // Cap at reasonable max
  estimatedTolls = Math.min(estimatedTolls, 180);
  
  // Round to 2 decimals
  estimatedTolls = Math.round(estimatedTolls * 100) / 100;
  
  // If no specific breakdown, add generic line items
  if (tollBreakdown.length === 0) {
    if (miles > 0) {
      tollBreakdown.push({ name: 'Estimated Highway Tolls', cost: estimatedTolls });
    }
  }
  
  res.json({
    origin,
    destination,
    route_miles: miles,
    estimated_tolls: estimatedTolls,
    route_description: routeDescription,
    toll_breakdown: tollBreakdown,
    note: miles > 0 ? 'Based on typical commercial truck toll rates' : 'Enter route miles for more accurate estimate'
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

// Demo Account - Auto-login with pre-filled data
app.post('/api/auth/demo', async (req, res) => {
  try {
    const demoEmail = 'demo@loadbuck.app';
    const demoPassword = 'demo123';
    const demoName = 'Demo Driver';
    
    // Check if demo user exists
    db.get(
      'SELECT * FROM users WHERE email = ?',
      [demoEmail],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        let userId;
        
        if (!user) {
          // Create demo user
          const hashedPassword = await bcrypt.hash(demoPassword, 10);
          userId = uuidv4();
          
          db.run(
            'INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)',
            [userId, demoEmail, hashedPassword, demoName],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Failed to create demo user' });
              }
              
              // Create demo settings
              db.run(
                'INSERT INTO settings (user_id, break_even_rate, mpg, fuel_tank_size, maintenance_reserve) VALUES (?, 2.0, 7.5, 150, 0.15)',
                [userId]
              );
              
              // Add some sample trips
              addSampleTrips(userId);
            }
          );
        } else {
          userId = user.id;
        }

        const token = jwt.sign(
          { userId: userId, email: demoEmail },
          JWT_SECRET
        );

        res.json({
          token,
          user: {
            id: userId,
            email: demoEmail,
            name: demoName
          }
        });
      }
    );
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ error: 'Demo login failed' });
  }
});

// Helper to add sample trips for demo
function addSampleTrips(userId) {
  const sampleTrips = [
    {
      id: uuidv4(),
      rate_offered: 2850,
      loaded_miles: 850,
      deadhead_miles: 45,
      origin: 'Chicago, IL',
      destination: 'New York, NY',
      fuel_price: 3.85,
      mpg: 7.5,
      tolls: 57,
      maintenance_reserve: 0.15,
      fuel_cost: 457.67,
      total_profit: 2080.58,
      profit_per_mile: 2.32,
      break_even_rate: 2.0,
      recommendation: 'YES',
      status: 'completed',
      actual_profit: 2050
    },
    {
      id: uuidv4(),
      rate_offered: 1200,
      loaded_miles: 600,
      deadhead_miles: 80,
      origin: 'Dallas, TX',
      destination: 'Houston, TX',
      fuel_price: 3.45,
      mpg: 7.5,
      tolls: 22,
      maintenance_reserve: 0.15,
      fuel_cost: 312.80,
      total_profit: 748.20,
      profit_per_mile: 1.09,
      break_even_rate: 2.0,
      recommendation: 'NO',
      status: 'skipped'
    },
    {
      id: uuidv4(),
      rate_offered: 3200,
      loaded_miles: 1100,
      deadhead_miles: 0,
      origin: 'Los Angeles, CA',
      destination: 'Phoenix, AZ',
      fuel_price: 4.25,
      mpg: 7.5,
      tolls: 15,
      maintenance_reserve: 0.15,
      fuel_cost: 623.33,
      total_profit: 2397.67,
      profit_per_mile: 2.18,
      break_even_rate: 2.0,
      recommendation: 'YES',
      status: 'calculated'
    }
  ];
  
  sampleTrips.forEach(trip => {
    db.run(
      `INSERT INTO trips (
        id, user_id, rate_offered, loaded_miles, deadhead_miles, origin, destination,
        fuel_price, mpg, tolls, maintenance_reserve, fuel_cost, total_profit,
        profit_per_mile, break_even_rate, recommendation, status, actual_profit
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trip.id, userId, trip.rate_offered, trip.loaded_miles, trip.deadhead_miles,
        trip.origin, trip.destination, trip.fuel_price, trip.mpg, trip.tolls,
        trip.maintenance_reserve, trip.fuel_cost, trip.total_profit, trip.profit_per_mile,
        trip.break_even_rate, trip.recommendation, trip.status, trip.actual_profit
      ]
    );
  });
}

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
