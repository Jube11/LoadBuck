import React from 'react'
import { Link } from 'react-router-dom'
import './Landing.css'

function Landing() {
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-logo">
          <svg viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 10 85 Q 25 60, 50 65 L 80 70 Q 100 75, 110 60 L 125 40 Q 135 25, 155 30 L 180 35 Q 200 40, 210 55 L 220 75 Q 225 85, 215 90 L 190 95 Q 170 98, 150 95 L 100 90 Q 70 88, 40 92 L 15 95 Q 5 96, 10 85 Z" fill="#ff6d00"/>
            <path d="M 95 45 L 125 30 L 140 35 L 145 55 L 140 75 L 120 80 L 95 75 L 90 60 Z" fill="#1a237e"/>
            <rect x="50" y="50" width="55" height="35" rx="5" fill="#1a237e"/>
            <text x="75" y="78" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="#00c853" textAnchor="middle">$</text>
            <circle cx="65" cy="92" r="10" fill="#1a237e"/>
            <circle cx="65" cy="92" r="5" fill="#fff"/>
            <circle cx="125" cy="92" r="10" fill="#1a237e"/>
            <circle cx="125" cy="92" r="5" fill="#fff"/>
            <text x="230" y="72" fontFamily="Arial, sans-serif" fontSize="42" fontWeight="800" fill="#1a237e" letterSpacing="-1">Load</text>
            <text x="328" y="72" fontFamily="Arial, sans-serif" fontSize="42" fontWeight="800" fill="#ff6d00" letterSpacing="-1">Buck</text>
            <line x1="230" y1="85" x2="300" y2="85" stroke="#1a237e" strokeWidth="1"/>
            <text x="315" y="88" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="500" fill="#00c853" fontStyle="italic">Know if your load pays</text>
            <line x1="330" y1="85" x2="400" y2="85" stroke="#1a237e" strokeWidth="1"/>
          </svg>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-content">
          <h1>Know your profit before you haul</h1>
          <p className="hero-tagline">
            Stop guessing. Start earning. Calculate your trip profit in seconds, 
            not hours.
          </p>
          
          <div className="hero-cta">
            <Link to="/calculator" className="btn btn-accent btn-lg">
              Try Calculator Free
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <p className="hero-note">No account required to calculate</p>
          </div>
        </div>

        <div className="hero-visual">
          <div className="calculator-preview">
            <div className="preview-header">
              <span>Trip Calculator</span>
            </div>
            <div className="preview-row">
              <span>Rate Offered</span>
              <span>$2,450</span>
            </div>
            <div className="preview-row">
              <span>Total Miles</span>
              <span>650 mi</span>
            </div>
            <div className="preview-row">
              <span>Fuel Cost</span>
              <span>-$371</span>
            </div>
            <div className="preview-row">
              <span>Tolls</span>
              <span>-$85</span>
            </div>
            <div className="preview-total">
              <span>Your Profit</span>
              <span className="profit">$1,897</span>
            </div>
            <div className="preview-recommendation yes">
              <span>✓ TAKE THIS LOAD</span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <h2>Built for Truck Drivers</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3>Instant Calculations</h3>
            <p>Know your profit per mile before you book the load</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3>Trip History</h3>
            <p>Track all your loads and compare estimated vs actual profit</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3>Smart Recommendations</h3>
            <p>YES / BORDERLINE / NO - Clear guidance on every load</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3>Mobile First</h3>
            <p>Big buttons, simple UI - works great on your phone</p>
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <h2>Ready to Maximize Your Profits?</h2>
        <p>Join thousands of truckers who know their numbers</p>
        
        <Link to="/calculator" className="btn btn-accent btn-lg">
          Get Started Free
        </Link>
      </section>

      <footer className="landing-footer">
        <p>© 2024 LoadBuck. Built for truckers, by people who care.</p>
        <div className="footer-links">
          <Link to="/login">Sign In</Link>
          <span>•</span>
          <Link to="/calculator">Calculator</Link>
        </div>
      </footer>
    </div>
  )
}

export default Landing
