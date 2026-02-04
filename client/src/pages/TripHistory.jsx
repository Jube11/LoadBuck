import React, { useState, useEffect } from 'react'
import './TripHistory.css'

const API_URL = '/api'

function TripHistory({ user }) {
  const [trips, setTrips] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [notes, setNotes] = useState('')
  const [actualProfit, setActualProfit] = useState('')

  useEffect(() => {
    fetchTrips()
    fetchStats()
  }, [])

  const fetchTrips = async () => {
    try {
      const token = localStorage.getItem('loadbuck_token')
      const response = await fetch(`${API_URL}/trips`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setTrips(data)
      }
    } catch (err) {
      console.error('Failed to fetch trips:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('loadbuck_token')
      const response = await fetch(`${API_URL}/trips/stats/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const deleteTrip = async (id) => {
    if (!confirm('Delete this trip?')) return

    try {
      const token = localStorage.getItem('loadbuck_token')
      await fetch(`${API_URL}/trips/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchTrips()
      fetchStats()
    } catch (err) {
      console.error('Failed to delete trip:', err)
    }
  }

  const updateTrip = async () => {
    if (!selectedTrip) return

    try {
      const token = localStorage.getItem('loadbuck_token')
      await fetch(`${API_URL}/trips/${selectedTrip.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          notes,
          actual_profit: actualProfit ? parseFloat(actualProfit) : null,
          status: 'completed'
        })
      })
      setSelectedTrip(null)
      fetchTrips()
    } catch (err) {
      console.error('Failed to update trip:', err)
    }
  }

  const openEditModal = (trip) => {
    setSelectedTrip(trip)
    setNotes(trip.notes || '')
    setActualProfit(trip.actual_profit?.toString() || '')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '-'
    return `$${parseFloat(amount).toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="trip-history-page">
      <div className="container">
        <div className="page-header">
          <h1>Trip History</h1>
          <p>Track your loads and actual profits</p>
        </div>

        {stats && trips.length > 0 && (
          <div className="stats-card card">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{stats.total_trips}</div>
                <div className="stat-label">Total Trips</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{formatCurrency(stats.avg_profit)}</div>
                <div className="stat-label">Avg Profit</div>
              </div>
              <div className="stat-item">
                <div className="stat-value text-success">{stats.yes_count || 0}</div>
                <div className="stat-label">YES Loads</div>
              </div>
              <div className="stat-item">
                <div className="stat-value text-danger">{stats.no_count || 0}</div>
                <div className="stat-label">NO Loads</div>
              </div>
            </div>
          </div>
        )}

        {trips.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3>No trips yet</h3>
            <p>Start calculating and saving your trips to see them here.</p>
          </div>
        ) : (
          <div className="trips-list">
            {trips.map(trip => (
              <div key={trip.id} className={`trip-item ${trip.recommendation.toLowerCase()}`}>
                <div className="trip-header">
                  <div>
                    <div className="trip-route">
                      {trip.origin || 'Unknown'} → {trip.destination || 'Unknown'}
                    </div>
                    <div className="trip-date">{formatDate(trip.created_at)}</div>
                  </div>
                  <span className={`trip-badge ${trip.recommendation.toLowerCase()}`}>
                    {trip.recommendation}
                  </span>
                </div>

                <div className="trip-stats">
                  <div className="trip-stat">
                    <span className="trip-stat-label">Rate</span>
                    <span className="trip-stat-value">{formatCurrency(trip.rate_offered)}</span>
                  </div>
                  <div className="trip-stat">
                    <span className="trip-stat-label">Miles</span>
                    <span className="trip-stat-value">{trip.total_miles}</span>
                  </div>
                  <div className="trip-stat">
                    <span className="trip-stat-label">Est. Profit</span>
                    <span className={`trip-stat-value ${trip.total_profit >= 0 ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency(trip.total_profit)}
                    </span>
                  </div>
                  <div className="trip-stat">
                    <span className="trip-stat-label">Actual</span>
                    <span className={`trip-stat-value ${trip.actual_profit >= 0 ? 'text-success' : ''}`}>
                      {formatCurrency(trip.actual_profit) || '—'}
                    </span>
                  </div>
                </div>

                {trip.notes && (
                  <div className="trip-notes">📝 {trip.notes}</div>
                )}

                <div className="trip-actions">
                  <button 
                    className="btn-text"
                    onClick={() => openEditModal(trip)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-text text-danger"
                    onClick={() => deleteTrip(trip.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTrip && (
          <div className="modal-overlay" onClick={() => setSelectedTrip(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Update Trip</h3>
                <button className="modal-close" onClick={() => setSelectedTrip(null)}>×</button>
              </div>

              <div className="input-group">
                <label>Actual Profit ($)</label>
                <input
                  type="number"
                  value={actualProfit}
                  onChange={(e) => setActualProfit(e.target.value)}
                  placeholder={selectedTrip.total_profit.toString()}
                />
                <p className="help-text">
                  Estimated: ${selectedTrip.total_profit.toLocaleString()}
                </p>
              </div>

              <div className="input-group">
                <label>Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Did you take this load? How did it go?"
                  rows={3}
                />
              </div>

              <button className="btn btn-primary" onClick={updateTrip}>
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TripHistory
