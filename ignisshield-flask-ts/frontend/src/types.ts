export type User = { id: string; name: string; email: string }
export type LoginResponse = { access_token: string; token_type: 'bearer'; expires_in: number; user: User }
export type SignupResponse = { ok: boolean; user: User }

export type PredictRequest = { temperature: number; humidity: number; wind_speed: number; vegetation_index: number }
export type FeatureImportanceItem = { feature: string; importance: number }
export type PredictResponse = { probability: number; risk: 'HIGH' | 'LOW'; feature_importance: FeatureImportanceItem[]; explanation: string }

export type AlertRequest = { to_emails?: string[]; to_phones?: string[]; subject: string; message: string; source: 'predict' | 'realtime' }
export type AlertDelivery = { to: string; channel: 'email' | 'sms'; status: 'SENT' | 'QUEUED' }
export type AlertResponse = { ok: boolean; delivered_count: number; delivered: AlertDelivery[] }

export type RealtimeUser = { name: string; email?: string; phone?: string }
export type Hotspot = { id: string; latitude: number; longitude: number; brightness: number; acq_date: string; satellite: 'A' | 'T' }
export type RealtimeFirmsRequest = { project_name: string; api_key: string; users: RealtimeUser[] }
export type RealtimeFirmsResponse = { ok: boolean; hotspots: Hotspot[]; alerts_sent: boolean; triggered_hotspots: Hotspot[] }

export type Profile = { id: string; project_name: string; api_key: string; users: RealtimeUser[] }
