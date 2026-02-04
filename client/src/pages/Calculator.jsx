import React, { useState, useEffect } from 'react'
import './Calculator.css'

const API_URL = '/api'

function Calculator({ user }) {
  const [formData, setFormData] = useState({
    rate_offered: '',
    loaded_miles: '',
    deadhead_miles: '',
    origin: '',
    destination: '',
    fuel_price: '3.85',
    mpg: '7.0',
    tolls: '',
    maintenance_reserve: '0.15'
  })

  const [userSettings, setUserSettings] = useState({
    break_even_rate: 2.0,
    mpg: 7.0
  })

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserSettings()
    }
  }, [user])

  const fetchUserSettings = async () => {
    try {
      const token = localStorage.getItem('loadbuck_token')
      const response = await fetch(`${API_URL}/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const settings = await response.json()
        setUserSettings(settings)
        setFormData(prev => ({
          ...prev,
          mpg: settings.mpg.toString(),
          maintenance_reserve: settings.maintenance_reserve?.toString() || '0.15'
        }))
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setSaved(false)
  }

  const calculateProfit = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`${API_URL}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          break_even_rate: userSettings.break_even_rate
        })
      })

      if (!response.ok) {
        throw new Error('Calculation failed')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('Failed to calculate. Please check your inputs.')
    } finally {
      setLoading(false)
    }
  }

  const saveTrip = async () => {
    if (!result || !user) return

    setSaving(true)
    try {
      const token = localStorage.getItem('loadbuck_token')
      const response = await fetch(`${API_URL}/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          ...result
        })
      })

      if (response.ok) {
        setSaved(true)
      }
    } catch (err) {
      console.error('Failed to save trip:', err)
    } finally {
      setSaving(false)
    }
  }

  const estimateTolls = async () => {
    if (!formData.origin || !formData.destination) {
      setError('Please enter origin and destination')
      return
    }

    try {
      const response = await fetch(`${API_URL}/estimate-tolls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: formData.origin,
          destination: formData.destination,
          route_miles: parseFloat(formData.loaded_miles) || 500
        })
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, tolls: data.estimated_tolls.toString() }))
      }
    } catch (err) {
      console.error('Failed to estimate tolls:', err)
    }
  }

  const getRecommendationColor = (rec) => {
    switch (rec) {
      case 'YES': return 'result-yes'
      case 'BORDERLINE': return 'result-borderline'
      case 'NO': return 'result-no'
      default: return ''
    }
  }

  return (
    <div className="calculator-page">
      <div className="container">
        <div className="page-header">
          <h1>Trip Calculator</h1>
          <p>Calculate your profit before you book</p>
        </div>

        <div className="card">
          <div className="input-group">
            <label htmlFor="rate_offered">💰 Rate Offered ($)</label>
            <input
              type="number"
              id="rate_offered"
              name="rate_offered"
              value={formData.rate_offered}
              onChange={handleChange}
              placeholder="2500"
              min="0"
              step="0.01"
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="loaded_miles">📏 Loaded Miles</label>
              <input
                type="number"
                id="loaded_miles"
                name="loaded_miles"
                value={formData.loaded_miles}
                onChange={handleChange}
                placeholder="500"
                min="0"
              />
            </div>

            <div className="input-group">
              <label htmlFor="deadhead_miles">🚛 Deadhead</label>
              <input
                type="number"
                id="deadhead_miles"
                name="deadhead_miles"
                value={formData.deadhead_miles}
                onChange={handleChange}
                placeholder="50"
                min="0"
              />
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="origin">📍 Origin</label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                placeholder="Chicago, IL"
              />
            </div>

            <div className="input-group">
              <label htmlFor="destination">🏁 Destination</label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="Dallas, TX"
              />
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="fuel_price">⛽ Fuel Price ($/gal)</label>
              <input
                type="number"
                id="fuel_price"
                name="fuel_price"
                value={formData.fuel_price}
                onChange={handleChange}
                placeholder="3.85"
                min="0"
                step="0.01"
              />
            </div>

            <div className="input-group">
              <label htmlFor="mpg">📊 Truck MPG</label>
              <input
                type="number"
                id="mpg"
                name="mpg"
                value={formData.mpg}
                onChange={handleChange}
                placeholder="7.0"
                min="1"
                step="0.1"
              />
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="tolls">🛣️ Tolls ($)</label>
              <input
                type="number"
                id="tolls"
                name="tolls"
                value={formData.tolls}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div className="input-group">
              <label htmlFor="maintenance_reserve">🔧 Maint ($/mi)</label>
              <input
                type="number"
                id="maintenance_reserve"
                name="maintenance_reserve"
                value={formData.maintenance_reserve}
                onChange={handleChange}
                placeholder="0.15"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <button 
            className="btn btn-accent btn-lg"
            onClick={calculateProfit}
            disabled={loading}
          >
            {loading ? 'Calculating...' : (
              <>
                Calculate Profit
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {result && (
          <div className="results-section animate-slide-up">
            <div className={`result-card ${getRecommendationColor(result.recommendation)}`}>
              <div className="result-badge">
                {result.recommendation}
              </div>
              <div className="result-amount">
                ${result.total_profit.toLocaleString()}
              </div>
              <div className="result-per-mile">
                ${result.profit_per_mile}/mi
              </div>
              <div className="result-break-even">
                vs ${userSettings.break_even_rate}/mi break-even
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">💵 Profit Breakdown</div>
              </div>
              
              <div className="breakdown-table">
                <div className="breakdown-row">
                  <span className="breakdown-label">Rate Offered</span>
                  <span className="breakdown-value text-success">+${result.rate_offered.toLocaleString()}</span>
                </div>
                <div className="breakdown-row">
                  <span className="breakdown-label">Total Miles</span>
                  <span className="breakdown-value">{result.total_miles.toLocaleString()} mi</span>
                </div>
                <div className="breakdown-row">
                  <span className="breakdown-label">⛽ Fuel Cost ({(result.total_miles / result.mpg).toFixed(1)} gal)</span>
                  <span className="breakdown-value text-danger">-${result.fuel_cost.toLocaleString()}</span>
                </div>
                <div className="breakdown-row">
                  <span className="breakdown-label">🛣️ Tolls</span>
                  <span className="breakdown-value text-danger">-${result.tolls.toLocaleString()}</span>
                </div>
                <div className="breakdown-row">
                  <span className="breakdown-label">🔧 Maintenance Reserve</span>
                  <span className="breakdown-value text-danger">-${result.maintenance_cost.toLocaleString()}</span>
                </div>
                <div className="breakdown-row total">
                  <span className="breakdown-label">💰 YOUR PROFIT</span>
                  <span className="breakdown-value text-success">${result.total_profit.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {user && (
              <button
                className="btn btn-primary"
                onClick={saveTrip}
                disabled={saving || saved}
              >
                {saved ? '✓ Saved to History' : (saving ? 'Saving...' : 'Save to Trip History')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Calculator
