import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../api'
import type { Profile, Hotspot } from '../types'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const TILE = (import.meta as any).env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

export default function Realtime() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [creating, setCreating] = useState(false)
  const [projectName, setProjectName] = useState('CA Watch')
  const [apiKey, setApiKey] = useState('')
  const [users, setUsers] = useState<{ name: string; email?: string; phone?: string }[]>([{ name: 'Alice', email: 'alice@example.com', phone: '+1555' }])
  const [selected, setSelected] = useState<Profile | null>(null)
  const [hotspots, setHotspots] = useState<Hotspot[]>([])

  useEffect(() => { api.getProfiles().then(setProfiles).catch(() => {}) }, [])

  function updateUser(i: number, key: 'name' | 'email' | 'phone', value: string) {
    setUsers(prev => prev.map((u, idx) => idx === i ? { ...u, [key]: value } : u))
  }
  function addUser() { setUsers(prev => [...prev, { name: '', email: '', phone: '' }]) }

  async function saveProfile() {
    const p = await api.createProfile({ project_name: projectName, api_key: apiKey, users })
    setProfiles(prev => [...prev, p]); setCreating(false); setUsers([{ name: 'Alice', email: 'alice@example.com', phone: '+1555' }]); setProjectName(''); setApiKey('')
  }

  async function startMonitoring(profile: Profile) {
    setSelected(profile)
    const res = await api.firms({ project_name: profile.project_name, api_key: profile.api_key, users: profile.users })
    setHotspots(res.hotspots)
    if (res.alerts_sent) alert(`Alerts dispatched for ${res.triggered_hotspots.length} hotspots`)
  }

  if (!selected) {
    return (
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="card">
          <div className="font-semibold text-[rgb(100,25,25)] mb-2">Profiles</div>
          {profiles.length === 0 && <div className="text-sm text-[rgb(80,80,80)]">No profiles yet.</div>}
          <div className="grid gap-2">
            {profiles.map(p => (
              <motion.div whileHover={{ scale: 1.01 }} key={p.id} className="border rounded-lg p-3 cursor-pointer" onClick={() => startMonitoring(p)}>
                <div className="font-semibold">{p.project_name}</div>
                <div className="text-xs text-[rgb(80,80,80)]">Users: {p.users.length}</div>
              </motion.div>
            ))}
          </div>
          <button className="btn mt-3" onClick={() => setCreating(true)}>Add profile</button>
        </div>
        {creating && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card grid gap-2">
            <div className="font-semibold text-[rgb(100,25,25)]">New profile</div>
            <input className="border rounded-lg p-2" placeholder="Project name" value={projectName} onChange={e => setProjectName(e.target.value)} />
            <input className="border rounded-lg p-2" placeholder="API key" value={apiKey} onChange={e => setApiKey(e.target.value)} />
            <div className="text-sm text-[rgb(80,80,80)]">Users</div>
            {users.map((u, i) => (
              <div className="grid grid-cols-3 gap-2" key={i}>
                <input className="border rounded-lg p-2" placeholder="Name" value={u.name} onChange={e => updateUser(i, 'name', e.target.value)} />
                <input className="border rounded-lg p-2" placeholder="Email" value={u.email || ''} onChange={e => updateUser(i, 'email', e.target.value)} />
                <input className="border rounded-lg p-2" placeholder="Phone" value={u.phone || ''} onChange={e => updateUser(i, 'phone', e.target.value)} />
              </div>
            ))}
            <button onClick={addUser} className="text-sm underline text-[rgb(80,80,80)]">+ Add user</button>
            <div className="flex gap-2">
              <button className="btn" onClick={saveProfile}>Save</button>
              <button className="btn btn-danger" onClick={() => setCreating(false)}>Cancel</button>
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-4 mt-6">
      <div className="card">
        <div className="font-semibold text-[rgb(100,25,25)] mb-2">Monitoring – {selected.project_name}</div>
        <button className="btn" onClick={() => startMonitoring(selected!)}>Refresh</button>
      </div>
      <div className="card">
        <MapContainer center={[36.5, -119.5]} zoom={6} scrollWheelZoom className="leaflet-container">
          <TileLayer url={TILE} attribution="&copy; OpenStreetMap contributors" />
          {hotspots.map(h => (
            h.brightness > 330 ? (
              <CircleMarker key={h.id} center={[h.latitude, h.longitude]} radius={8} pathOptions={{ color: '#AF3E3E', fillColor: '#AF3E3E' }} className="pulse">
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

