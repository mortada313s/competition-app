import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const auth = localStorage.getItem('admin_auth')
  if (!auth) return <Navigate to="/admin" replace />
  return children
}
