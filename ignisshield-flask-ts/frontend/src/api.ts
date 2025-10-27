import type {
  LoginResponse,
  SignupResponse,
  PredictRequest,
  PredictResponse,
  AlertRequest,
  AlertResponse,
  RealtimeFirmsRequest,
  RealtimeFirmsResponse,
  Profile,
} from './types'

const BACKEND_URL = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:8000'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')
  const headers: HeadersInit = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BACKEND_URL}${path}`, { ...options, headers })
  if (!res.ok) throw new Error((await res.text()) || `Request failed: ${res.status}`)
  return res.json()
}

export const api = {
  signup: (data: { name: string; email: string; password: string }) => request<SignupResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) => request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  predict: (data: PredictRequest) => request<PredictResponse>('/predict', { method: 'POST', body: JSON.stringify(data) }),
  alert: (data: AlertRequest) => request<AlertResponse>('/alert', { method: 'POST', body: JSON.stringify(data) }),
  firms: (data: RealtimeFirmsRequest) => request<RealtimeFirmsResponse>('/realtime/firms', { method: 'POST', body: JSON.stringify(data) }),
  getProfiles: () => request<Profile[]>('/realtime/profiles'),
  createProfile: (data: { project_name: string; api_key: string; users: { name: string; email?: string; phone?: string }[] }) => request<Profile>('/realtime/profiles', { method: 'POST', body: JSON.stringify(data) }),
}

