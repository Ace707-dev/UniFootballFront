import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

interface Match {
  id: string
  scheduledAt: string
  venue: string | null
  homeTeam: { name: string }
  awayTeam: { name: string }
  tournament?: { name: string }
  result?: { homeScore: number; awayScore: number; status: string }
}

type Filter = 'all' | 'pending' | 'played'

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    client.get('/matches')
      .then(res => setMatches(res.data))
      .catch(() => setError('Error al cargar partidos'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = matches.filter(m => {
    if (filter === 'all') return true
    if (filter === 'played') return m.result?.status === 'played'
    if (filter === 'pending') return !m.result || m.result.status === 'pending'
    return true
  })

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
        <div className="section-title" style={{ fontSize: 36, marginBottom: 24 }}>PARTIDOS</div>

        <div className="tabs">
          <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>TODOS</button>
          <button className={`tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>PENDIENTES</button>
          <button className={`tab ${filter === 'played' ? 'active' : ''}`} onClick={() => setFilter('played')}>JUGADOS</button>
        </div>

        {loading && <div className="state-loading">Cargando partidos...</div>}
        {error && <div className="state-error">{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="state-empty">No hay partidos en esta categoría.</div>
        )}

        {!loading && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(m => (
              <div
                key={m.id}
                className="match-card"
                onClick={() => navigate(`/matches/${m.id}/live`)}
              >
                <div className="match-teams">
                  <span>{m.homeTeam.name}</span>
                </div>

                {m.result && m.result.status === 'played' ? (
                  <div className="match-score">
                    {m.result.homeScore} - {m.result.awayScore}
                  </div>
                ) : (
                  <div className="match-vs">VS</div>
                )}

                <div className="match-teams" style={{ justifyContent: 'flex-end' }}>
                  <span>{m.awayTeam.name}</span>
                </div>

                <div className="match-meta">
                  {new Date(m.scheduledAt).toLocaleDateString('es-MX')}
                  {m.venue && <><br />{m.venue}</>}
                  {m.tournament && <><br /><span style={{ color: 'var(--accent2)' }}>{m.tournament.name}</span></>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
