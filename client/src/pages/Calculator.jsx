import React, { useState, useEffect, useCallback } from 'react'
import './Calculator.css'

const API_URL = '/api'

// Major US cities with states for auto-suggest
const US_CITIES = [
  // Major metros
  { city: 'New York', state: 'NY', full: 'New York, NY' },
  { city: 'Los Angeles', state: 'CA', full: 'Los Angeles, CA' },
  { city: 'Chicago', state: 'IL', full: 'Chicago, IL' },
  { city: 'Houston', state: 'TX', full: 'Houston, TX' },
  { city: 'Phoenix', state: 'AZ', full: 'Phoenix, AZ' },
  { city: 'Philadelphia', state: 'PA', full: 'Philadelphia, PA' },
  { city: 'San Antonio', state: 'TX', full: 'San Antonio, TX' },
  { city: 'San Diego', state: 'CA', full: 'San Diego, CA' },
  { city: 'Dallas', state: 'TX', full: 'Dallas, TX' },
  { city: 'San Jose', state: 'CA', full: 'San Jose, CA' },
  { city: 'Austin', state: 'TX', full: 'Austin, TX' },
  { city: 'Jacksonville', state: 'FL', full: 'Jacksonville, FL' },
  { city: 'Fort Worth', state: 'TX', full: 'Fort Worth, TX' },
  { city: 'Columbus', state: 'OH', full: 'Columbus, OH' },
  { city: 'Charlotte', state: 'NC', full: 'Charlotte, NC' },
  { city: 'Indianapolis', state: 'IN', full: 'Indianapolis, IN' },
  { city: 'San Francisco', state: 'CA', full: 'San Francisco, CA' },
  { city: 'Seattle', state: 'WA', full: 'Seattle, WA' },
  { city: 'Denver', state: 'CO', full: 'Denver, CO' },
  { city: 'Oklahoma City', state: 'OK', full: 'Oklahoma City, OK' },
  { city: 'Nashville', state: 'TN', full: 'Nashville, TN' },
  { city: 'El Paso', state: 'TX', full: 'El Paso, TX' },
  { city: 'Detroit', state: 'MI', full: 'Detroit, MI' },
  { city: 'Boston', state: 'MA', full: 'Boston, MA' },
  { city: 'Memphis', state: 'TN', full: 'Memphis, TN' },
  { city: 'Portland', state: 'OR', full: 'Portland, OR' },
  { city: 'Oklahoma City', state: 'OK', full: 'Oklahoma City, OK' },
  { city: 'Las Vegas', state: 'NV', full: 'Las Vegas, NV' },
  { city: 'Louisville', state: 'KY', full: 'Louisville, KY' },
  { city: 'Baltimore', state: 'MD', full: 'Baltimore, MD' },
  { city: 'Milwaukee', state: 'WI', full: 'Milwaukee, WI' },
  { city: 'Albuquerque', state: 'NM', full: 'Albuquerque, NM' },
  { city: 'Tucson', state: 'AZ', full: 'Tucson, AZ' },
  { city: 'Fresno', state: 'CA', full: 'Fresno, CA' },
  { city: 'Sacramento', state: 'CA', full: 'Sacramento, CA' },
  { city: 'Kansas City', state: 'MO', full: 'Kansas City, MO' },
  { city: 'Mesa', state: 'AZ', full: 'Mesa, AZ' },
  { city: 'Atlanta', state: 'GA', full: 'Atlanta, GA' },
  { city: 'Omaha', state: 'NE', full: 'Omaha, NE' },
  { city: 'Colorado Springs', state: 'CO', full: 'Colorado Springs, CO' },
  { city: 'Raleigh', state: 'NC', full: 'Raleigh, NC' },
  { city: 'Virginia Beach', state: 'VA', full: 'Virginia Beach, VA' },
  { city: 'Miami', state: 'FL', full: 'Miami, FL' },
  { city: 'Oakland', state: 'CA', full: 'Oakland, CA' },
  { city: 'Minneapolis', state: 'MN', full: 'Minneapolis, MN' },
  { city: 'Tulsa', state: 'OK', full: 'Tulsa, OK' },
  { city: 'Cleveland', state: 'OH', full: 'Cleveland, OH' },
  { city: 'Wichita', state: 'KS', full: 'Wichita, KS' },
  { city: 'Arlington', state: 'TX', full: 'Arlington, TX' },
  { city: 'New Orleans', state: 'LA', full: 'New Orleans, LA' },
  { city: 'Bakersfield', state: 'CA', full: 'Bakersfield, CA' },
  { city: 'Tampa', state: 'FL', full: 'Tampa, FL' },
  { city: 'Honolulu', state: 'HI', full: 'Honolulu, HI' },
  { city: 'Anaheim', state: 'CA', full: 'Anaheim, CA' },
  { city: 'Aurora', state: 'CO', full: 'Aurora, CO' },
  { city: 'Santa Ana', state: 'CA', full: 'Santa Ana, CA' },
  { city: 'St. Louis', state: 'MO', full: 'St. Louis, MO' },
  { city: 'Pittsburgh', state: 'PA', full: 'Pittsburgh, PA' },
  { city: 'Cincinnati', state: 'OH', full: 'Cincinnati, OH' },
  { city: 'Anchorage', state: 'AK', full: 'Anchorage, AK' },
  { city: 'Henderson', state: 'NV', full: 'Henderson, NV' },
  { city: 'Greensboro', state: 'NC', full: 'Greensboro, NC' },
  { city: 'Plano', state: 'TX', full: 'Plano, TX' },
  { city: 'Newark', state: 'NJ', full: 'Newark, NJ' },
  { city: 'Lincoln', state: 'NE', full: 'Lincoln, NE' },
  { city: 'Orlando', state: 'FL', full: 'Orlando, FL' },
  { city: 'Irvine', state: 'CA', full: 'Irvine, CA' },
  { city: 'Toledo', state: 'OH', full: 'Toledo, OH' },
  { city: 'Jersey City', state: 'NJ', full: 'Jersey City, NJ' },
  { city: 'Chula Vista', state: 'CA', full: 'Chula Vista, CA' },
  { city: 'Durham', state: 'NC', full: 'Durham, NC' },
  { city: 'Fort Wayne', state: 'IN', full: 'Fort Wayne, IN' },
  { city: 'St. Petersburg', state: 'FL', full: 'St. Petersburg, FL' },
  { city: 'Laredo', state: 'TX', full: 'Laredo, TX' },
  { city: 'Buffalo', state: 'NY', full: 'Buffalo, NY' },
  { city: 'Madison', state: 'WI', full: 'Madison, WI' },
  { city: 'Lubbock', state: 'TX', full: 'Lubbock, TX' },
  { city: 'Chandler', state: 'AZ', full: 'Chandler, AZ' },
  { city: 'Scottsdale', state: 'AZ', full: 'Scottsdale, AZ' },
  { city: 'Reno', state: 'NV', full: 'Reno, NV' },
  { city: 'Glendale', state: 'AZ', full: 'Glendale, AZ' },
  { city: 'Gilbert', state: 'AZ', full: 'Gilbert, AZ' },
  { city: 'North Las Vegas', state: 'NV', full: 'North Las Vegas, NV' },
  { city: 'Winston-Salem', state: 'NC', full: 'Winston-Salem, NC' },
  { city: 'Chesapeake', state: 'VA', full: 'Chesapeake, VA' },
  { city: 'Norfolk', state: 'VA', full: 'Norfolk, VA' },
  { city: 'Fremont', state: 'CA', full: 'Fremont, CA' },
  { city: 'Garland', state: 'TX', full: 'Garland, TX' },
  { city: 'Irving', state: 'TX', full: 'Irving, TX' },
  { city: 'Hialeah', state: 'FL', full: 'Hialeah, FL' },
  { city: 'Richmond', state: 'VA', full: 'Richmond, VA' },
  { city: 'Boise', state: 'ID', full: 'Boise, ID' },
  { city: 'Spokane', state: 'WA', full: 'Spokane, WA' },
  { city: 'Baton Rouge', state: 'LA', full: 'Baton Rouge, LA' },
  { city: 'Des Moines', state: 'IA', full: 'Des Moines, IA' },
  { city: 'Tacoma', state: 'WA', full: 'Tacoma, WA' },
  { city: 'San Bernardino', state: 'CA', full: 'San Bernardino, CA' },
  { city: 'Modesto', state: 'CA', full: 'Modesto, CA' },
  { city: 'Fontana', state: 'CA', full: 'Fontana, CA' },
  { city: 'Santa Clarita', state: 'CA', full: 'Santa Clarita, CA' },
  { city: 'Birmingham', state: 'AL', full: 'Birmingham, AL' },
  { city: 'Oxnard', state: 'CA', full: 'Oxnard, CA' },
  { city: 'Fayetteville', state: 'NC', full: 'Fayetteville, NC' },
  { city: 'Rochester', state: 'NY', full: 'Rochester, NY' },
  { city: 'Moreno Valley', state: 'CA', full: 'Moreno Valley, CA' },
  { city: 'Glendale', state: 'CA', full: 'Glendale, CA' },
  { city: 'Yonkers', state: 'NY', full: 'Yonkers, NY' },
  { city: 'Huntington Beach', state: 'CA', full: 'Huntington Beach, CA' },
  { city: 'Aurora', state: 'IL', full: 'Aurora, IL' },
  { city: 'Salt Lake City', state: 'UT', full: 'Salt Lake City, UT' },
  { city: 'Amarillo', state: 'TX', full: 'Amarillo, TX' },
  { city: 'Montgomery', state: 'AL', full: 'Montgomery, AL' },
  { city: 'Little Rock', state: 'AR', full: 'Little Rock, AR' },
  { city: 'Akron', state: 'OH', full: 'Akron, OH' },
  { city: 'Augusta', state: 'GA', full: 'Augusta, GA' },
  { city: 'Grand Rapids', state: 'MI', full: 'Grand Rapids, MI' },
  { city: 'Shreveport', state: 'LA', full: 'Shreveport, LA' },
  { city: 'Mobile', state: 'AL', full: 'Mobile, AL' },
  { city: 'Knoxville', state: 'TN', full: 'Knoxville, TN' },
  { city: 'Worcester', state: 'MA', full: 'Worcester, MA' },
  { city: 'Columbia', state: 'SC', full: 'Columbia, SC' },
  { city: 'Syracuse', state: 'NY', full: 'Syracuse, NY' },
  { city: 'Dayton', state: 'OH', full: 'Dayton, OH' },
  { city: 'Springfield', state: 'MO', full: 'Springfield, MO' },
  { city: 'Kansas City', state: 'KS', full: 'Kansas City, KS' },
  { city: 'Fort Lauderdale', state: 'FL', full: 'Fort Lauderdale, FL' },
]

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
  const [tollLoading, setTollLoading] = useState(false)
  const [tollInfo, setTollInfo] = useState(null)
  const [autoTollEnabled, setAutoTollEnabled] = useState(true)
  
  // Auto-suggest states
  const [originSuggestions, setOriginSuggestions] = useState([])
  const [destSuggestions, setDestSuggestions] = useState([])
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false)
  const [showDestSuggestions, setShowDestSuggestions] = useState(false)
  const [selectedOriginIndex, setSelectedOriginIndex] = useState(-1)
  const [selectedDestIndex, setSelectedDestIndex] = useState(-1)

  useEffect(() => {
    if (user) {
      fetchUserSettings()
    }
  }, [user])

  // Auto-calculate everything when inputs change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const hasRequiredFields = formData.rate_offered && formData.loaded_miles
      if (hasRequiredFields) {
        calculateProfit(true)
      }
    }, 800)

    return () => clearTimeout(delayDebounce)
  }, [formData.rate_offered, formData.loaded_miles, formData.deadhead_miles, formData.fuel_price, formData.mpg, formData.tolls, formData.maintenance_reserve])

  // Auto-calculate tolls when origin and destination are filled
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (autoTollEnabled && formData.origin && formData.destination && formData.origin.length > 2 && formData.destination.length > 2) {
        estimateTolls(true)
      }
    }, 1000)

    return () => clearTimeout(delayDebounce)
  }, [formData.origin, formData.destination, formData.loaded_miles, autoTollEnabled])

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

  // City auto-suggest functions
  const getCitySuggestions = (input) => {
    if (!input || input.length < 2) return []
    const lowerInput = input.toLowerCase()
    return US_CITIES.filter(city => 
      city.city.toLowerCase().includes(lowerInput) ||
      city.full.toLowerCase().includes(lowerInput)
    ).slice(0, 5)
  }

  const handleOriginChange = (e) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, origin: value }))
    setSaved(false)
    
    const suggestions = getCitySuggestions(value)
    setOriginSuggestions(suggestions)
    setShowOriginSuggestions(suggestions.length > 0)
    setSelectedOriginIndex(-1)
  }

  const handleDestChange = (e) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, destination: value }))
    setSaved(false)
    
    const suggestions = getCitySuggestions(value)
    setDestSuggestions(suggestions)
    setShowDestSuggestions(suggestions.length > 0)
    setSelectedDestIndex(-1)
  }

  const selectOriginCity = (city) => {
    setFormData(prev => ({ ...prev, origin: city.full }))
    setShowOriginSuggestions(false)
    setOriginSuggestions([])
  }

  const selectDestCity = (city) => {
    setFormData(prev => ({ ...prev, destination: city.full }))
    setShowDestSuggestions(false)
    setDestSuggestions([])
  }

  const handleOriginKeyDown = (e) => {
    if (!showOriginSuggestions) return
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedOriginIndex(prev => 
          prev < originSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedOriginIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedOriginIndex >= 0) {
          selectOriginCity(originSuggestions[selectedOriginIndex])
        }
        break
      case 'Escape':
        setShowOriginSuggestions(false)
        break
    }
  }

  const handleDestKeyDown = (e) => {
    if (!showDestSuggestions) return
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedDestIndex(prev => 
          prev < destSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedDestIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedDestIndex >= 0) {
          selectDestCity(destSuggestions[selectedDestIndex])
        }
        break
      case 'Escape':
        setShowDestSuggestions(false)
        break
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setSaved(false)
  }

  const calculateProfit = async (isAuto = false) => {
    // Only require rate and miles
    if (!formData.rate_offered || !formData.loaded_miles) {
      return
    }

    if (!isAuto) {
      setLoading(true)
    }
    setError(null)

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
      if (!isAuto) {
        setError('Failed to calculate. Please check your inputs.')
      }
    } finally {
      if (!isAuto) {
        setLoading(false)
      }
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

  const estimateTolls = async (isAuto = false) => {
    if (!formData.origin || !formData.destination) {
      return
    }

    setTollLoading(true)

    try {
      const response = await fetch(`${API_URL}/estimate-tolls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: formData.origin,
          destination: formData.destination,
          route_miles: parseFloat(formData.loaded_miles) || 0
        })
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, tolls: data.estimated_tolls.toString() }))
        setTollInfo(data)
      }
    } catch (err) {
      console.error('Failed to estimate tolls:', err)
    } finally {
      setTollLoading(false)
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
          <p>Enter details to see your profit instantly</p>
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
            <div className="input-group autocomplete-group">
              <label htmlFor="origin">📍 Origin</label>
              <div className="autocomplete-wrapper">
                <input
                  type="text"
                  id="origin"
                  name="origin"
                  value={formData.origin}
                  onChange={handleOriginChange}
                  onKeyDown={handleOriginKeyDown}
                  onBlur={() => setTimeout(() => setShowOriginSuggestions(false), 200)}
                  placeholder="Start typing city..."
                  autoComplete="off"
                />
                {showOriginSuggestions && (
                  <ul className="suggestions-list">
                    {originSuggestions.map((city, index) => (
                      <li
                        key={index}
                        className={index === selectedOriginIndex ? 'selected' : ''}
                        onClick={() => selectOriginCity(city)}
                        onMouseEnter={() => setSelectedOriginIndex(index)}
                      >
                        <span className="city-name">{city.city}</span>
                        <span className="state-code">{city.state}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="input-group autocomplete-group">
              <label htmlFor="destination">🏁 Destination</label>
              <div className="autocomplete-wrapper">
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleDestChange}
                  onKeyDown={handleDestKeyDown}
                  onBlur={() => setTimeout(() => setShowDestSuggestions(false), 200)}
                  placeholder="Start typing city..."
                  autoComplete="off"
                />
                {showDestSuggestions && (
                  <ul className="suggestions-list">
                    {destSuggestions.map((city, index) => (
                      <li
                        key={index}
                        className={index === selectedDestIndex ? 'selected' : ''}
                        onClick={() => selectDestCity(city)}
                        onMouseEnter={() => setSelectedDestIndex(index)}
                      >
                        <span className="city-name">{city.city}</span>
                        <span className="state-code">{city.state}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
            <div className="input-group toll-group">
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
                className={tollLoading ? 'input-loading' : ''}
              />
              {tollInfo && formData.origin && formData.destination && (
                <div className="toll-info">
                  <small>{tollInfo.route_description || `Route: ${tollInfo.origin} → ${tollInfo.destination}`}</small>
                  {tollInfo.toll_breakdown && tollInfo.toll_breakdown.length > 0 && (
                    <div className="toll-breakdown">
                      {tollInfo.toll_breakdown.map((toll, idx) => (
                        <span key={idx} className="toll-item">{toll.name}: ${toll.cost}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
            type="button"
            className="btn btn-accent btn-lg calculate-btn"
            onClick={() => calculateProfit(false)}
            disabled={loading || !formData.rate_offered || !formData.loaded_miles}
          >
            {loading ? 'Calculating...' : '💰 Calculate Profit'}
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