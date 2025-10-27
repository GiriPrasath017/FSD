import type { SignupRequest, SignupResponse, LoginRequest, LoginResponse, PredictRequest, PredictResponse, AlertRequest, AlertResponse, RealtimeFirmsRequest, RealtimeFirmsResponse } from './types'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BACKEND_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const api = {
  signup: (data: SignupRequest) => request<SignupResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: LoginRequest) => request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  predict: (data: PredictRequest) => request<PredictResponse>('/predict', { method: 'POST', body: JSON.stringify(data) }),
  alert: (data: AlertRequest) => request<AlertResponse>('/alert', { method: 'POST', body: JSON.stringify(data) }),
  firms: (data: RealtimeFirmsRequest) => request<RealtimeFirmsResponse>('/realtime/firms', { method: 'POST', body: JSON.stringify(data) }),
}

