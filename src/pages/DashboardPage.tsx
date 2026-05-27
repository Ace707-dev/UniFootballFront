import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <nav className="navbar">
        <span className="navbar-brand">UNI<span>FOOTBALL</span></span>
        <div className="navbar-actions">
          <button className="btn btn-danger" onClick={handleLogout}>Salir</button>
        </div>
      </nav>
      <div className="page">
        <div className="dashboard-hero">
          <h1>DASHBOARD</h1>
          <p>Bienvenido al sistema de torneos universitarios</p>
        </div>
        <div className="dashboard-grid">
          <div className="dashboard-action" onClick={() => navigate('/tournaments')}>
            <span className="action-icon">🏆</span>
            <div className="action-title">Torneos</div>
            <div className="action-desc">Ver todos los torneos activos</div>
          </div>
          <div className="dashboard-action">
            <span className="action-icon">⚽</span>
            <div className="action-title">Partidos</div>
            <div className="action-desc">Resultados y fixtures</div>
          </div>
          <div className="dashboard-action">
            <span className="action-icon">📊</span>
            <div className="action-title">Estadísticas</div>
            <div className="action-desc">Goles, asistencias y tarjetas</div>
          </div>
          <div className="dashboard-action">
            <span className="action-icon">🔴</span>
            <div className="action-title">En vivo</div>
            <div className="action-desc">Seguimiento en tiempo real</div>
          </div>
        </div>
      </div>
    </>
  )
}
