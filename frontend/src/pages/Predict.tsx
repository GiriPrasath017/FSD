import { useState } from 'react'
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
    } finally {
      setLoading(false)
    }
  }

  async function sendAlert() {
    if (!result) return
    const subject = 'High Fire Risk Alert'
    const message = `Predicted HIGH risk with probability ${(result.probability).toFixed(3)}`
    await api.alert({ subject, message, source: 'predict' })
    alert('Mock alert sent!')
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      <form onSubmit={onSubmit} className="space-y-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60">
        <h2 className="text-lg font-semibold mb-2">Input</h2>
        <label className="block text-sm">Temperature (°C)</label>
        <input type="number" className="w-full bg-slate-900 border border-slate-700 p-2 rounded" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} />
        <label className="block text-sm">Humidity (%)</label>
        <input type="number" className="w-full bg-slate-900 border border-slate-700 p-2 rounded" value={humidity} onChange={e => setHumidity(parseFloat(e.target.value))} />
        <label className="block text-sm">Wind Speed (km/h)</label>
        <input type="number" className="w-full bg-slate-900 border border-slate-700 p-2 rounded" value={windSpeed} onChange={e => setWindSpeed(parseFloat(e.target.value))} />
        <label className="block text-sm">Vegetation Index (0–1)</label>
        <input type="number" step="0.01" className="w-full bg-slate-900 border border-slate-700 p-2 rounded" value={vi} onChange={e => setVi(parseFloat(e.target.value))} />
        <button disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 transition rounded p-2 mt-2">{loading ? 'Predicting...' : 'Predict'}</button>
      </form>

      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
        <h2 className="text-lg font-semibold mb-2">Result</h2>
        {!result && <div className="text-sm text-slate-400">Submit inputs to see prediction.</div>}
        {result && (
          <div>
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold">{result.risk}</div>
              <div className="text-sm text-slate-400">Probability: {result.probability.toFixed(3)}</div>
            </div>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.feature_importance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                  <YAxis type="category" dataKey="feature" width={120} />
                  <Tooltip formatter={(v: number) => `${Math.round(v * 100)}%`} />
                  <Bar dataKey="importance" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {result.risk === 'HIGH' && (
              <button onClick={sendAlert} className="mt-4 w-full bg-red-600 hover:bg-red-500 transition rounded p-2 animate-pulse-strong">Send Alert 🚨</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

