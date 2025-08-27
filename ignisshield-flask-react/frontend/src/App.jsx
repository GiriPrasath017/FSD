import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Predict from './pages/Predict'
import Realtime from './pages/Realtime'

function useAuth() {
  return Boolean(localStorage.getItem('token'))
}

function Protected({ children }) {
  const authed = useAuth()
  if (!authed) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const location = useLocation()
  return (
    <div>
      <header className="header">
        <div className="header-inner container">
          <Link to="/" style={{ textDecoration: 'none', color: 'white', fontWeight: 600 }}>IgnisShield</Link>
          <nav className="nav">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/predict">Predict</Link>
            <Link to="/realtime">Realtime</Link>
          </nav>
        </div>
      </header>
      <main className="container page">
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/predict" element={<Protected><Predict /></Protected>} />
          <Route path="/realtime" element={<Protected><Realtime /></Protected>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

