import { Navigate } from 'react-router-dom'

export default function Protected({ children }) {
  const authed = Boolean(localStorage.getItem('token'))
  if (!authed) return <Navigate to="/login" replace />
  return children
}

