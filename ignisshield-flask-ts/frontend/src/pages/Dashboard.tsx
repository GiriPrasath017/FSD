import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function Card({ title, to, color }: { title: string; to: string; color: string }) {
  return (
    <Link to={to} className="block">
      <motion.div whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(205,86,86,0.5)' }} className="card">
        <h3 className="text-xl font-semibold text-[rgb(100,25,25)]">{title}</h3>
        <p className="muted mt-1">Go to {title}</p>
      </motion.div>
    </Link>
  )
}

export default function Dashboard() {
  return (
    <div className="grid md:grid-cols-2 gap-4 mt-6">
      <Card title="Single Prediction" to="/predict" color="#CD5656" />
      <Card title="Realtime Monitoring" to="/realtime" color="#AF3E3E" />
    </div>
  )
}

