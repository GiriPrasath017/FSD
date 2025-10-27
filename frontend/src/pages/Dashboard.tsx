import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function Card({ title, to, color }: { title: string; to: string; color: string }) {
  return (
    <Link to={to} className="block">
      <motion.div whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${color}` }} className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-slate-400 mt-2 text-sm">Go to {title}</p>
      </motion.div>
    </Link>
  )
}

export default function Dashboard() {
  return (
    <div className="grid md:grid-cols-2 gap-6 mt-8">
      <Card title="Single Prediction" to="/predict" color="rgba(16,185,129,0.5)" />
      <Card title="Realtime Monitoring" to="/realtime" color="rgba(239,68,68,0.5)" />
    </div>
  )
}

