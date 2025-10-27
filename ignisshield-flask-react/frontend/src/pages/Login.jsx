import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.login({ email, password })
      localStorage.setItem('token', res.access_token)
      localStorage.setItem('user', JSON.stringify(res.user))
      nav('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6" style={{ maxWidth: 420, marginInline: 'auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>Login</h1>
      <form onSubmit={onSubmit} className="card" style={{ gap: 8, display: 'grid' }}>
        <label className="label">Email</label>
        <input className="input" value={email} onChange={e => setEmail(e.target.value)} />
        <label className="label">Password</label>
        <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div className="muted" style={{ color: '#fca5a5' }}>{error}</div>}
        <button className="btn mt-2" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
      </form>
      <div className="muted mt-2">No account? <Link to="/signup">Sign up</Link></div>
    </div>
  )
}

