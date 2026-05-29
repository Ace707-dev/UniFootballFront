import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function StatsPage() {
  const [userId, setUserId] = useState('')
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (userId.trim()) navigate(`/players/${userId.trim()}`)
  }

  return (
    <>
      <nav className="navbar">
        <span className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          UNI<span>FOOTBALL</span>
        </span>
        <div className="navbar-actions">
          <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="btn btn-danger" onClick={() => { logout(); navigate('/login') }}>Salir</button>
        </div>
      </nav>
      <div className="page">
        <div className="section-title" style={{ fontSize: 36, marginBottom: 8 }}>ESTADÍSTICAS</div>
        <p style={{ color: 'var(--text)', marginBottom: 32, fontFamily: 'var(--mono)', fontSize: 13 }}>
          Busca las estadísticas de un jugador por su ID
        </p>

        <div className="card" style={{ maxWidth: 480 }}>
          <form onSubmit={handleSearch}>
            <div className="form-group">
              <label className="form-label">ID del jugador</label>
              <input
                className="form-input"
                type="text"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
              Ver estadísticas
            </button>
          </form>
        </div>

        <div style={{ marginTop: 48 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>ACCESOS RÁPIDOS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div
              className="match-card"
              onClick={() => navigate('/tournaments')}
            >
              <span style={{ fontSize: 20 }}>🏆</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--heading)', fontWeight: 500 }}>Ver torneos</div>
                <div style={{ fontSize: 12, color: 'var(--text)', fontFamily: 'var(--mono)' }}>
                  Accede a las tablas de posiciones por torneo
                </div>
              </div>
            </div>
            <div
              className="match-card"
              onClick={() => navigate('/matches')}
            >
              <span style={{ fontSize: 20 }}>⚽</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--heading)', fontWeight: 500 }}>Ver partidos</div>
                <div style={{ fontSize: 12, color: 'var(--text)', fontFamily: 'var(--mono)' }}>
                  Resultados y fixtures de todos los partidos
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
