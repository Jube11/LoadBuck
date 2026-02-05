import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Login.css'

const API_URL = '/api'

function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register'
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      onLogin(data)
      navigate('/calculator')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/auth/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Demo login failed')
      }

      onLogin(data)
      navigate('/calculator')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <Link to="/" className="login-logo">
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
          </Link>
          <h1>{isLogin ? 'Welcome back' : 'Create account'}</h1>
          <p>{isLogin ? 'Sign in to save your trips' : 'Start tracking your profits today'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">{error}</div>
          )}

          {!isLogin && (
            <div className="input-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required={!isLogin}
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength="6"
            />
          </div>

          <button type="submit" className="btn btn-accent btn-lg" disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            {' '}
            <button
              type="button"
              className="btn-link"
              onClick={() => {
                setIsLogin(!isLogin)
                setError(null)
              }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <div className="demo-option">
            <button 
              type="button"
              className="btn btn-primary"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Try Demo Account'}
            </button>
            <p className="demo-note">Test with sample data instantly</p>
          </div>

          <div className="guest-option">
            <Link to="/calculator" className="btn btn-outline">
              Continue as Guest
            </Link>
            <p className="guest-note">Calculations work without an account. Sign in to save trips.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login