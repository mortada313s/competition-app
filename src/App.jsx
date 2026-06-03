import { Routes, Route } from 'react-router-dom'
import AgentPage from './pages/AgentPage'
import ChallengePage from './pages/ChallengePage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AgentPage />} />
      <Route path="/challenge/:token" element={<ChallengePage />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  )
}
