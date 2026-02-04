import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Landing from './pages/Landing'
import Calculator from './pages/Calculator'
import TripHistory from './pages/TripHistory'
import Settings from './pages/Settings'
import Login from './pages/Login'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [showNav, setShowNav] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('loadbuck_token')
    const savedUser = localStorage.getItem('loadbuck_user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogin = (data) => {
    localStorage.setItem('loadbuck_token', data.token)
    localStorage.setItem('loadbuck_user', JSON.stringify(data.user))
    setUser(data.user)
  }

  const handleLogout = () => {
    localStorage.removeItem('loadbuck_token')
    localStorage.removeItem('loadbuck_user')
    setUser(null)
  }

  const hideNavOnRoutes = ['/']
  const shouldShowNav = user && !hideNavOnRoutes.includes(location.pathname)

  return (
    <div className="app">
      {shouldShowNav && (
        <nav className="bottom-nav">
          <Link to="/calculator" className={location.pathname === '/calculator' ? 'active' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>Calc</span>
          </Link>
          <Link to="/history" className={location.pathname === '/history' ? 'active' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>History</span>
          </Link>
          <Link to="/settings" className={location.pathname === '/settings' ? 'active' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </Link>
        </nav>
      )}

      <main className="main-content">
        <Routes>
          <Route path="/" element={
            user ? <Calculator user={user} /> : <Landing onLogin={() => setShowNav(true)} />
          } />
          <Route path="/calculator" element={
            user ? <Calculator user={user} /> : <Login onLogin={handleLogin} />
          } />
          <Route path="/history" element={
            user ? <TripHistory user={user} /> : <Login onLogin={handleLogin} />
          } />
          <Route path="/settings" element={
            user ? <Settings user={user} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />
          } />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
