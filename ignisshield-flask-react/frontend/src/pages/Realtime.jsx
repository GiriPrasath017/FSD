import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { api } from '../api'

const TILE_URL = import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

export default function Realtime() {
  const [projectName, setProjectName] = useState('California Watch')
  const [users, setUsers] = useState([{ name: 'Alice', email: 'alice@example.com', phone: '+1555' }])
  const [hotspots, setHotspots] = useState([])
  const [loading, setLoading] = useState(false)

  function updateUser(i, key, value) {
    setUsers(prev => prev.map((u, idx) => idx === i ? { ...u, [key]: value } : u))
  }

  function addUser() {
    setUsers(prev => [...prev, { name: '', email: '', phone: '' }])
  }

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.firms({ project_name: projectName, api_link: '/realtime/firms', users })
      setHotspots(res.hotspots)
      if (res.alerts_sent) alert(`Mock alerts sent for ${res.triggered_hotspots.length} hotspots!`)
    } finally { setLoading(false) }
  }

  return (
    <div className="grid grid-2 mt-6">
      <form onSubmit={onSubmit} className="card" style={{ display: 'grid', gap: 8 }}>
        <div style={{ fontWeight: 600 }}>Project</div>
        <input className="input" placeholder="Project name" value={projectName} onChange={e => setProjectName(e.target.value)} />
        <div className="muted">Users</div>
        {users.map((u, i) => (
          <div className="row" key={i}>
            <input className="input" placeholder="Name" value={u.name} onChange={e => updateUser(i, 'name', e.target.value)} />
            <input className="input" placeholder="Email" value={u.email} onChange={e => updateUser(i, 'email', e.target.value)} />
            <input className="input" placeholder="Phone" value={u.phone} onChange={e => updateUser(i, 'phone', e.target.value)} />
          </div>
        ))}
        <button type="button" className="muted" onClick={addUser}>+ Add user</button>
        <button className="btn" disabled={loading}>{loading ? 'Simulating...' : 'Start Simulation'}</button>
      </form>

      <div className="card">
        <MapContainer center={[36.5, -119.5]} zoom={6} scrollWheelZoom className="leaflet-container">
          <TileLayer url={TILE_URL} attribution="&copy; OpenStreetMap contributors" />
          {hotspots.map(h => (
            h.brightness > 330 ? (
              <CircleMarker key={h.id} center={[h.latitude, h.longitude]} radius={8} pathOptions={{ color: '#ef4444', fillColor: '#ef4444' }} className="pulse">
                <Popup>
                  <div className="muted">
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
                  <div className="muted">
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

