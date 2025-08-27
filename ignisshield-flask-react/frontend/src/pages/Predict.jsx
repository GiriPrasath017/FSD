import { useState } from 'react'
import { api } from '../api'
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Predict() {
  const [temperature, setTemperature] = useState(32)
  const [humidity, setHumidity] = useState(20)
  const [windSpeed, setWindSpeed] = useState(12)
  const [vi, setVi] = useState(0.7)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.predict({ temperature, humidity, wind_speed: windSpeed, vegetation_index: vi })
      setResult(res)
    } finally {
      setLoading(false)
    }
  }

  async function sendAlert() {
    if (!result) return
    const subject = 'High Fire Risk Alert'
    const message = `Predicted HIGH risk with probability ${result.probability.toFixed(3)}`
    await api.alert({ subject, message, source: 'predict' })
    alert('Mock alert sent!')
  }

  return (
    <div className="grid grid-2 mt-6">
      <form onSubmit={onSubmit} className="card" style={{ display: 'grid', gap: 8 }}>
        <div style={{ fontWeight: 600 }}>Input</div>
        <label className="label">Temperature (°C)</label>
        <input className="input" type="number" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} />
        <label className="label">Humidity (%)</label>
        <input className="input" type="number" value={humidity} onChange={e => setHumidity(parseFloat(e.target.value))} />
        <label className="label">Wind Speed (km/h)</label>
        <input className="input" type="number" value={windSpeed} onChange={e => setWindSpeed(parseFloat(e.target.value))} />
        <label className="label">Vegetation Index (0–1)</label>
        <input className="input" step="0.01" type="number" value={vi} onChange={e => setVi(parseFloat(e.target.value))} />
        <button className="btn mt-2" disabled={loading}>{loading ? 'Predicting...' : 'Predict'}</button>
      </form>

      <div className="card">
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Result</div>
        {!result && <div className="muted">Submit inputs to see prediction.</div>}
        {result && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{result.risk}</div>
              <div className="muted">Probability: {result.probability.toFixed(3)}</div>
            </div>
            <div style={{ height: 260, marginTop: 12 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.feature_importance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                  <YAxis type="category" dataKey="feature" width={120} />
                  <Tooltip formatter={(v) => `${Math.round(v * 100)}%`} />
                  <Bar dataKey="importance" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {result.risk === 'HIGH' && (
              <button onClick={sendAlert} className="btn btn-danger mt-2 pulse">Send Alert 🚨</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

