import { useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../api'
import type { PredictResponse } from '../types'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function Predict() {
  const [temperature, setTemperature] = useState(32)
  const [humidity, setHumidity] = useState(20)
  const [windSpeed, setWindSpeed] = useState(12)
  const [vi, setVi] = useState(0.7)
  const [result, setResult] = useState<PredictResponse | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.predict({ temperature, humidity, wind_speed: windSpeed, vegetation_index: vi })
      setResult(res)
    } finally { setLoading(false) }
  }

  async function sendAlert() {
    if (!result) return
    const subject = 'High Fire Risk Alert'
    const message = `Predicted HIGH risk with probability ${result.probability.toFixed(3)}`
    await api.alert({ subject, message, source: 'realtime' as any })
    alert('Alert dispatched')
  }

  return (
    <div className="grid md:grid-cols-2 gap-4 mt-6">
      <form onSubmit={onSubmit} className="card grid gap-2">
        <div className="font-semibold text-[rgb(100,25,25)]">Input</div>
        <label className="text-sm text-[rgb(80,80,80)]">Temperature (°C)</label>
        <input className="border rounded-lg p-2" type="number" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} />
        <label className="text-sm text-[rgb(80,80,80)]">Humidity (%)</label>
        <input className="border rounded-lg p-2" type="number" value={humidity} onChange={e => setHumidity(parseFloat(e.target.value))} />
        <label className="text-sm text-[rgb(80,80,80)]">Wind Speed (km/h)</label>
        <input className="border rounded-lg p-2" type="number" value={windSpeed} onChange={e => setWindSpeed(parseFloat(e.target.value))} />
        <label className="text-sm text-[rgb(80,80,80)]">Vegetation Index (0–1)</label>
        <input className="border rounded-lg p-2" type="number" step="0.01" value={vi} onChange={e => setVi(parseFloat(e.target.value))} />
        <button className="btn mt-2" disabled={loading}>{loading ? 'Predicting...' : 'Predict'}</button>
      </form>

      <div className="card">
        <div className="font-semibold text-[rgb(100,25,25)]">Result</div>
        {!result && <div className="text-sm text-[rgb(80,80,80)]">Submit inputs to see prediction.</div>}
        {result && (
          <div>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-[rgb(100,25,25)]">{result.risk}</div>
              <div className="text-sm text-[rgb(80,80,80)]">Probability: {result.probability.toFixed(3)}</div>
            </div>
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.feature_importance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 1]} tickFormatter={v => `${Math.round((v as number) * 100)}%`} />
                  <YAxis type="category" dataKey="feature" width={120} />
                  <Tooltip formatter={(v: any) => `${Math.round((v as number) * 100)}%`} />
                  <Bar dataKey="importance" fill="#AF3E3E" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {result.risk === 'HIGH' && (
              <motion.button whileHover={{ scale: 1.02 }} className="btn btn-danger mt-3 shadow-glow" onClick={sendAlert}>Send Alert 🚨</motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

