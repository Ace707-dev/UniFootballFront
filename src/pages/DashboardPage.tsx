import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'


export default function DashboardPage() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  return (
    <>
      <nav className="navbar">
        <span className="navbar-brand">UNI<span>FOOTBALL</span></span>
        <div className="navbar-actions">
          <button className="btn btn-danger" onClick={() => { logout(); navigate('/login') }}>Salir</button>
        </div>
      </nav>
      <div className="page">
        <div className="dashboard-hero">
          <h1>DASHBOARD</h1>
          <p>Bienvenido al sistema de torneos universitarios</p>
        </div>
        <div className="dashboard-grid">
          {user?.role === 'admin' && (
  <div className="dashboard-action" onClick={() => navigate('/admin')}>
    <span className="action-icon">⚙️</span>
    <div className="action-title">Admin</div>
    <div className="action-desc">Panel de administración</div>
  </div>
)}
          <div className="dashboard-action" onClick={() => navigate('/tournaments')}>
            <span className="action-icon">🏆</span>
            <div className="action-title">Torneos</div>
            <div className="action-desc">Ver todos los torneos activos</div>
          </div>
          <div className="dashboard-action" onClick={() => navigate('/matches')}>
            <span className="action-icon">⚽</span>
            <div className="action-title">Partidos</div>
            <div className="action-desc">Resultados y fixtures</div>
          </div>
          <div className="dashboard-action" onClick={() => navigate('/stats')}>
            <span className="action-icon">📊</span>
            <div className="action-title">Estadísticas</div>
            <div className="action-desc">Goles, asistencias y tarjetas</div>
          </div>
          <div className="dashboard-action" onClick={() => navigate('/live')}>
            <span className="action-icon">🔴</span>
            <div className="action-title">En vivo</div>
            <div className="action-desc">Seguimiento en tiempo real</div>
          </div>
        </div>
      </div>
    </>
  )
}
