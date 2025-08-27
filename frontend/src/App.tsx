import { Route, Routes, Navigate, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Predict from './pages/Predict'
import Realtime from './pages/Realtime'

function useAuth() {
  const token = localStorage.getItem('token')
  return Boolean(token)
}

function Protected({ children }: { children: JSX.Element }) {
  const authed = useAuth()
  const loc = useLocation()
  if (!authed) return <Navigate to="/login" replace state={{ from: loc }} />
  return children
}

export default function App() {
  const location = useLocation()
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 sticky top-0 bg-slate-950/70 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          <Link to="/" className="font-semibold">IgnisShield</Link>
          <nav className="space-x-4 text-sm">
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            <Link to="/predict" className="hover:underline">Predict</Link>
            <Link to="/realtime" className="hover:underline">Realtime</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
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

