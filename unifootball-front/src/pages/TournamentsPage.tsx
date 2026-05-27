import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

interface Tournament {
  id: string
  name: string
  sport: string
  status: string
  startDate: string
  endDate: string
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'active':    return <span className="badge badge-green">Activo</span>
    case 'upcoming':  return <span className="badge badge-blue">Próximo</span>
    case 'finished':  return <span className="badge badge-gray">Finalizado</span>
    default:          return <span className="badge badge-gray">{status}</span>
  }
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    client.get('/tournaments')
      .then(res => setTournaments(res.data))
      .catch(() => setError('Error al cargar torneos'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <nav className="navbar">
        <span className="navbar-brand" style={{cursor:'pointer'}} onClick={() => navigate('/dashboard')}>
          UNI<span>FOOTBALL</span>
        </span>
        <div className="navbar-actions">
          <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="btn btn-danger" onClick={() => { logout(); navigate('/login') }}>Salir</button>
        </div>
      </nav>
      <div className="page">
        <div className="section-title" style={{fontSize: 36, marginBottom: 24}}>TORNEOS</div>

        {loading && <div className="state-loading">Cargando torneos...</div>}
        {error   && <div className="state-error">{error}</div>}

        {!loading && !error && tournaments.length === 0 && (
          <div className="state-empty">No hay torneos registrados.</div>
        )}

        <div className="tournament-grid">
          {tournaments.map(t => (
            <div
              key={t.id}
              className="tournament-item"
              onClick={() => navigate(`/tournaments/${t.id}`)}
            >
              <div>
                <div className="tournament-name">{t.name}</div>
                <div className="tournament-meta">
                  {t.sport} · {new Date(t.startDate).toLocaleDateString('es-MX')} – {new Date(t.endDate).toLocaleDateString('es-MX')}
                </div>
              </div>
              {statusBadge(t.status)}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
