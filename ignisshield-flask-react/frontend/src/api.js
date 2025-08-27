const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BACKEND_URL}${path}`, { ...options, headers })
  if (!res.ok) throw new Error((await res.text()) || `Request failed: ${res.status}`)
  return res.json()
}

export const api = {
  signup: (data) => request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  predict: (data) => request('/predict', { method: 'POST', body: JSON.stringify(data) }),
  alert: (data) => request('/alert', { method: 'POST', body: JSON.stringify(data) }),
  firms: (data) => request('/realtime/firms', { method: 'POST', body: JSON.stringify(data) }),
}

