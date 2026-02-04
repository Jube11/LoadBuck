# LoadBuck - Trip Profit Calculator for Truck Drivers

> **Know your profit before you haul**

LoadBuck is a mobile-first web application that helps truck drivers calculate trip profitability before booking loads. Stop guessing and start earning with data-driven decisions.

## ✨ Features

### Core Calculator
- **Rate Offered** - Total payment for the load
- **Mileage** - Loaded and deadhead miles
- **Route Info** - Origin and destination (with toll estimation)
- **Fuel Costs** - Current fuel price and truck MPG
- **Maintenance Reserve** - Set aside for repairs
- **Tolls** - Estimated toll costs

### Smart Recommendations
- **YES** ✅ - Profit exceeds break-even by 10%+
- **BORDERLINE** ⚠️ - Profit meets break-even
- **NO** ❌ - Profit below break-even

### Trip History
- Save and track all your trips
- Compare estimated vs actual profit
- Add notes to each trip
- View statistics and trends

### User Settings
- Custom break-even rate
- Truck specs (MPG, fuel tank size)
- Maintenance reserve per mile

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and navigate to the project:**
```bash
cd loadbuck
```

2. **Install server dependencies:**
```bash
cd server
npm install
```

3. **Install client dependencies:**
```bash
cd ../client
npm install
```

4. **Start the backend server:**
```bash
cd ../server
npm start
# Server runs on http://localhost:3001
```

5. **Start the frontend (in a new terminal):**
```bash
cd client
npm run dev
# App runs on http://localhost:5173
```

6. **Open your browser:**
Navigate to `http://localhost:5173`

## 📱 Usage

### Quick Calculate (No Account)
1. Visit the landing page
2. Click "Try Calculator Free"
3. Enter trip details
4. Get instant profit analysis

### With Account (Save Trips)
1. Create an account or sign in
2. Set your break-even rate in Settings
3. Calculate trips
4. Save trips to history
5. Track actual vs estimated profit

## 🛠️ Tech Stack

**Frontend:**
- React 18
- React Router
- Vite
- Vanilla CSS (mobile-first)

**Backend:**
- Node.js
- Express
- SQLite
- JWT Authentication

**API Integrations:**
- Mock toll estimation (ready for Google Maps Distance Matrix API)
- Mock fuel prices (ready for real fuel price API)

## 📁 Project Structure

```
loadbuck/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   │   ├── Landing.jsx
│   │   │   ├── Calculator.jsx
│   │   │   ├── TripHistory.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Login.jsx
│   │   ├── App.jsx
│   │   └── ...
│   └── package.json
├── server/                 # Express backend
│   ├── server.js          # Main server file
│   ├── data/              # SQLite database
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables (Server)
Create a `.env` file in the `server/` directory:

```env
PORT=3001
JWT_SECRET=your-secret-key-here
```

### API Keys (Optional)
To add real toll estimation, integrate:
- Google Maps Distance Matrix API
- Fuel price API (e.g., GasBuddy, EIA)

## 🎨 Design System

**Colors:**
- Primary: `#1e3a5f` (Deep Blue)
- Accent: `#e07b39` (Orange)
- Success: `#22c55e` (Green)
- Warning: `#f59e0b` (Yellow)
- Danger: `#ef4444` (Red)

**Typography:**
- Font: Inter (Google Fonts)
- Mobile-optimized sizing

## 📊 Profit Calculation Formula

```
Total Miles = Loaded Miles + Deadhead Miles
Gallons Needed = Total Miles / MPG
Fuel Cost = Gallons Needed × Fuel Price
Maintenance = Total Miles × Maintenance Reserve
Total Expenses = Fuel Cost + Tolls + Maintenance
Profit = Rate Offered - Total Expenses
Profit Per Mile = Profit / Total Miles
```

## 🔒 Authentication

- JWT-based authentication
- Passwords hashed with bcrypt
- Protected routes for trip history and settings

## 📱 Mobile Optimization

- Touch-friendly buttons (min 44px)
- Bottom navigation for easy thumb access
- Responsive design (works on all screen sizes)
- Fast load times

## 🚧 Future Enhancements

- [ ] Real-time fuel price API integration
- [ ] Google Maps route planning
- [ ] IFTA tax calculations
- [ ] Multi-stop trip planning
- [ ] Export reports (PDF/Excel)
- [ ] Push notifications
- [ ] Offline mode with service workers

## 📄 License

MIT License - Built for truckers, by people who care.

## 🤝 Contributing

This is an MVP project. Feel free to fork and enhance!

## 💬 Support

Questions? The calculator works offline - your data stays with you.

---

**Made with ❤️ for the trucking community**
