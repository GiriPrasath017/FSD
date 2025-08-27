import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../api'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.login({ email, password })
      localStorage.setItem('token', res.access_token)
      localStorage.setItem('user', JSON.stringify(res.user))
      nav('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-semibold mb-4 text-[rgb(100,25,25)]">Login</h1>
      <form onSubmit={onSubmit} className="card grid gap-2">
        <label className="text-sm text-[rgb(80,80,80)]">Email</label>
        <input className="border rounded-lg p-2" value={email} onChange={e => setEmail(e.target.value)} />
        <label className="text-sm text-[rgb(80,80,80)]">Password</label>
        <input className="border rounded-lg p-2" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <motion.div initial={{ scale: .98 }} animate={{ scale: 1 }} className="text-[rgb(175,62,62)] text-sm">{error}</motion.div>}
        <button className="btn mt-2" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
      </form>
      <div className="text-sm text-[rgb(80,80,80)] mt-2">No account? <Link className="underline" to="/signup">Sign up</Link></div>
    </motion.div>
  )
}

