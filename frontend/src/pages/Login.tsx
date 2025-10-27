import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full bg-slate-900 border border-slate-700 p-2 rounded" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full bg-slate-900 border border-slate-700 p-2 rounded" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <button disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 transition rounded p-2">{loading ? 'Signing in...' : 'Login'}</button>
      </form>
      <p className="text-sm mt-3">No account? <Link to="/signup" className="underline">Sign up</Link></p>
    </div>
  )
}

