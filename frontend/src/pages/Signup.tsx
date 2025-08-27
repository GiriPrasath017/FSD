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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) return setError('Enter a valid email')
    if (password.length < 6) return setError('Password min 6 chars')
    setError('')
    setLoading(true)
    try {
      const res = await api.signup({ name, email, password })
      // immediately login for UX
      const login = await api.login({ email, password })
      localStorage.setItem('token', login.access_token)
      localStorage.setItem('user', JSON.stringify(login.user))
      nav('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-semibold mb-4">Sign up</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full bg-slate-900 border border-slate-700 p-2 rounded" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="w-full bg-slate-900 border border-slate-700 p-2 rounded" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full bg-slate-900 border border-slate-700 p-2 rounded" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <button disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 transition rounded p-2">{loading ? 'Creating...' : 'Create account'}</button>
      </form>
      <p className="text-sm mt-3">Have an account? <Link to="/login" className="underline">Login</Link></p>
    </div>
  )
}

