import { Link } from 'react-router-dom'

function Card({ title, to, color }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ boxShadow: `0 0 0 ${color}` }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>{title}</div>
        <div className="muted" style={{ marginTop: 6 }}>Go to {title}</div>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  return (
    <div className="grid grid-2 mt-6">
      <Card title="Single Prediction" to="/predict" color="rgba(16,185,129,0.25)" />
      <Card title="Realtime Monitoring" to="/realtime" color="rgba(239,68,68,0.25)" />
    </div>
  )
}

