import React, { useState, useEffect } from 'react'
import './Settings.css'

const API_URL = '/api'

function Settings({ user, onLogout }) {
  const [settings, setSettings] = useState({
    break_even_rate: 2.0,
    mpg: 7.0,
    fuel_tank_size: 150,
    maintenance_reserve: 0.15,
    driver_pay_rate: 0.65
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('loadbuck_token')
      const response = await fetch(`${API_URL}/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setSettings({
          break_even_rate: data.break_even_rate ?? 2.0,
          mpg: data.mpg ?? 7.0,
          fuel_tank_size: data.fuel_tank_size ?? 150,
          maintenance_reserve: data.maintenance_reserve ?? 0.15,
          driver_pay_rate: data.driver_pay_rate ?? 0.65
        })
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({ ...prev, [name]: value }))
    setSaved(false)
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('loadbuck_token')
      const response = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...settings,
          break_even_rate: parseFloat(settings.break_even_rate),
          mpg: parseFloat(settings.mpg),
          fuel_tank_size: parseFloat(settings.fuel_tank_size),
          maintenance_reserve: parseFloat(settings.maintenance_reserve),
          driver_pay_rate: parseFloat(settings.driver_pay_rate)
        })
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (err) {
      console.error('Failed to save settings:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="settings-page">
      <div className="container">
        <div className="page-header">
          <h1>Settings</h1>
          <p>Customize your truck and preferences</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">💰 Break-Even Settings</div>
          </div>

          <div className="input-group">
            <label htmlFor="break_even_rate">Break-Even Rate ($/mile)</label>
            <input
              type="number"
              id="break_even_rate"
              name="break_even_rate"
              value={settings.break_even_rate}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
            <p className="help-text">
              Minimum profit per mile you'll accept. Below this = NO recommendation.
            </p>
          </div>

          <div className="input-group">
            <label htmlFor="driver_pay_rate">Driver Pay Rate ($/mile)</label>
            <input
              type="number"
              id="driver_pay_rate"
              name="driver_pay_rate"
              value={settings.driver_pay_rate}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
            <p className="help-text">
              What you pay yourself per mile (for reference)
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">🚛 Truck Specifications</div>
          </div>

          <div className="input-group">
            <label htmlFor="mpg">Fuel Economy (MPG)</label>
            <input
              type="number"
              id="mpg"
              name="mpg"
              value={settings.mpg}
              onChange={handleChange}
              min="1"
              step="0.1"
            />
            <p className="help-text">
              Average miles per gallon for your truck
            </p>
          </div>

          <div className="input-group">
            <label htmlFor="fuel_tank_size">Fuel Tank Size (gallons)</label>
            <input
              type="number"
              id="fuel_tank_size"
              name="fuel_tank_size"
              value={settings.fuel_tank_size}
              onChange={handleChange}
              min="1"
              step="1"
            />
            <p className="help-text">
              Total fuel capacity (for range calculations)
            </p>
          </div>

          <div className="input-group">
            <label htmlFor="maintenance_reserve">Maintenance Reserve ($/mile)</label>
            <input
              type="number"
              id="maintenance_reserve"
              name="maintenance_reserve"
              value={settings.maintenance_reserve}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
            <p className="help-text">
              Amount to set aside per mile for maintenance and repairs
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">📊 Recommendations Explained</div>
          </div>

          <div className="recommendation-help">
            <div className="rec-item">
              <span className="rec-badge yes">YES</span>
              <span>Profit is 10% or more above your break-even rate</span>
            </div>
            <div className="rec-item">
              <span className="rec-badge borderline">BORDERLINE</span>
              <span>Profit meets or is slightly above break-even</span>
            </div>
            <div className="rec-item">
              <span className="rec-badge no">NO</span>
              <span>Profit is below your break-even rate</span>
            </div>
          </div>
        </div>

        <button
          className={`btn btn-primary ${saved ? 'btn-success' : ''}`}
          onClick={saveSettings}
          disabled={saving}
        >
          {saved ? '✓ Settings Saved!' : (saving ? 'Saving...' : 'Save Settings')}
        </button>

        <div className="account-section">
          <div className="user-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div>
              <div className="user-name">{user?.name || user?.email}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>

          <button className="btn btn-outline" onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
