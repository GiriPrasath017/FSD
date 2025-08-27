import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Predict from './pages/Predict'
import Realtime from './pages/Realtime'

function useAuth() {
  return Boolean(localStorage.getItem('token'))
}

function Protected({ children }: { children: JSX.Element }) {
  const authed = useAuth()
  if (!authed) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const location = useLocation()
  return (
    <div className="min-h-screen palette-bg">
      <header className="sticky top-0 z-10 bg-[#EAEBD0]/80 backdrop-blur border-b border-[rgba(175,62,62,0.3)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          <Link to="/" className="font-semibold text-[rgb(80,20,20)]">IgnisShield</Link>
          <nav className="space-x-4 text-sm">
            <Link className="hover:underline" to="/dashboard">Dashboard</Link>
            <Link className="hover:underline" to="/predict">Predict</Link>
            <Link className="hover:underline" to="/realtime">Realtime</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <Routes location={location}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
              <Route path="/predict" element={<Protected><Predict /></Protected>} />
              <Route path="/realtime" element={<Protected><Realtime /></Protected>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

