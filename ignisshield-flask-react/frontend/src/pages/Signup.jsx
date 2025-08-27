import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Signup() {
  const nav = useNavigate()
  const [name, setName] = useState('Demo User')
  const [email, setEmail] = useState('demo2@example.com')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    if (!email.includes('@')) return setError('Enter a valid email')
    if (password.length < 6) return setError('Password min 6 chars')
    setError('')
    setLoading(true)
    try {
      await api.signup({ name, email, password })
      const login = await api.login({ email, password })
      localStorage.setItem('token', login.access_token)
      localStorage.setItem('user', JSON.stringify(login.user))
      nav('/dashboard')
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6" style={{ maxWidth: 420, marginInline: 'auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>Sign up</h1>
      <form onSubmit={onSubmit} className="card" style={{ gap: 8, display: 'grid' }}>
        <label className="label">Name</label>
        <input className="input" value={name} onChange={e => setName(e.target.value)} />
        <label className="label">Email</label>
        <input className="input" value={email} onChange={e => setEmail(e.target.value)} />
        <label className="label">Password</label>
        <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div className="muted" style={{ color: '#fca5a5' }}>{error}</div>}
        <button className="btn mt-2" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
      </form>
      <div className="muted mt-2">Have an account? <Link to="/login">Login</Link></div>
    </div>
  )
}

