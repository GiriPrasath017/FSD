import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useState } from 'react'
import { api } from '../api'
import type { Hotspot, RealtimeUser } from '../types'

const OSM = import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

export default function Realtime() {
  const [projectName, setProjectName] = useState('California Watch')
  const [users, setUsers] = useState<RealtimeUser[]>([{ name: 'Alice', email: 'alice@example.com', phone: '+15550001' }])
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [loading, setLoading] = useState(false)

  function updateUser(i: number, key: keyof RealtimeUser, value: string) {
    setUsers(prev => prev.map((u, idx) => idx === i ? { ...u, [key]: value } : u))
  }

  function addUser() {
    setUsers(prev => [...prev, { name: '', email: '', phone: '' }])
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.firms({ project_name: projectName, api_link: '/realtime/firms', users })
      setHotspots(res.hotspots)
      if (res.alerts_sent) {
        alert(`Mock alerts sent for ${res.triggered_hotspots.length} hotspots!`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      <form onSubmit={onSubmit} className="space-y-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60">
        <h2 className="text-lg font-semibold mb-2">Project</h2>
        <input className="w-full bg-slate-900 border border-slate-700 p-2 rounded" placeholder="Project name" value={projectName} onChange={e => setProjectName(e.target.value)} />
        <div className="text-sm text-slate-400">Users</div>
        {users.map((u, i) => (
          <div key={i} className="grid grid-cols-3 gap-2">
            <input className="bg-slate-900 border border-slate-700 p-2 rounded" placeholder="Name" value={u.name} onChange={e => updateUser(i, 'name', e.target.value)} />
            <input className="bg-slate-900 border border-slate-700 p-2 rounded" placeholder="Email" value={u.email || ''} onChange={e => updateUser(i, 'email', e.target.value)} />
            <input className="bg-slate-900 border border-slate-700 p-2 rounded" placeholder="Phone" value={u.phone || ''} onChange={e => updateUser(i, 'phone', e.target.value)} />
          </div>
        ))}
        <button type="button" onClick={addUser} className="text-sm underline">Add user</button>
        <button disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 transition rounded p-2">{loading ? 'Simulating...' : 'Start Simulation'}</button>
      </form>

      <div className="p-2 rounded-xl border border-slate-800 bg-slate-900/60">
        <MapContainer center={[36.5, -119.5]} zoom={6} scrollWheelZoom className="leaflet-container rounded-lg overflow-hidden">
          <TileLayer url={OSM} attribution="&copy; OpenStreetMap contributors" />
          {hotspots.map(h => (
            h.brightness > 330 ? (
              <CircleMarker key={h.id} center={[h.latitude, h.longitude]} radius={8} pathOptions={{ color: '#ef4444' }} className="animate-pulse-strong">
                <Popup>
                  <div className="text-sm">
                    <div><b>ID</b>: {h.id}</div>
                    <div><b>Brightness</b>: {h.brightness}</div>
                    <div><b>Date</b>: {h.acq_date}</div>
                    <div><b>Sat</b>: {h.satellite}</div>
                  </div>
                </Popup>
              </CircleMarker>
            ) : (
              <Marker key={h.id} position={[h.latitude, h.longitude]}>
                <Popup>
                  <div className="text-sm">
                    <div><b>ID</b>: {h.id}</div>
                    <div><b>Brightness</b>: {h.brightness}</div>
                    <div><b>Date</b>: {h.acq_date}</div>
                    <div><b>Sat</b>: {h.satellite}</div>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

