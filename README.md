# LoadBuck - Trip Profit Calculator

**Know your profit before you haul.**

A web application for truck drivers to calculate trip profitability before booking loads.

## Features

- ✅ Calculate profit per trip BEFORE booking
- ✅ Breakdown: fuel cost, tolls, maintenance
- ✅ Break-even threshold comparison
- ✅ Trip history tracking
- ✅ Mobile-optimized design
- ✅ Works offline for calculations

## Quick Deploy Options

### Option 1: Render (Recommended - Free)

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click "New +" → "Blueprint"
3. Connect your GitHub repo
4. Render will auto-deploy both backend and frontend

### Option 2: Vercel (Frontend Only)

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Set root directory to `client/`
4. Deploy

### Option 3: Railway

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Add PostgreSQL database
4. Deploy

## Local Development

```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Start backend (port 3001)
cd server && npm start

# Start frontend (port 5173)
cd client && npm run dev
```

Open http://localhost:5173

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** SQLite
- **Auth:** JWT

## Environment Variables

Create `.env` in server/:
```
PORT=3001
JWT_SECRET=your-secret-key
DB_PATH=./data/loadbuck.db
```

## License

MIT