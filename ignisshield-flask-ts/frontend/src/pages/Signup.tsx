import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
    setError(''); setLoading(true)
    try {
      await api.signup({ name, email, password })
      const login = await api.login({ email, password })
      localStorage.setItem('token', login.access_token)
      localStorage.setItem('user', JSON.stringify(login.user))
      nav('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    } finally { setLoading(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-semibold mb-4 text-[rgb(100,25,25)]">Sign up</h1>
      <form onSubmit={onSubmit} className="card grid gap-2">
        <label className="text-sm text-[rgb(80,80,80)]">Name</label>
        <input className="border rounded-lg p-2" value={name} onChange={e => setName(e.target.value)} />
        <label className="text-sm text-[rgb(80,80,80)]">Email</label>
        <input className="border rounded-lg p-2" value={email} onChange={e => setEmail(e.target.value)} />
        <label className="text-sm text-[rgb(80,80,80)]">Password</label>
        <input className="border rounded-lg p-2" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <motion.div initial={{ scale: .98 }} animate={{ scale: 1 }} className="text-[rgb(175,62,62)] text-sm">{error}</motion.div>}
        <button className="btn mt-2" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
      </form>
      <div className="text-sm text-[rgb(80,80,80)] mt-2">Have an account? <Link className="underline" to="/login">Login</Link></div>
    </motion.div>
  )
}

