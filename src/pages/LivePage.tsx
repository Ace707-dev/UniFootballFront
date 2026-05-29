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

export default function LivePage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { logout } = useAuth()

  const fetchMatches = () => {
    client.get('/matches')
      .then(res => setMatches(res.data))
      .catch(() => setError('Error al cargar partidos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMatches()
    const interval = setInterval(fetchMatches, 10000)
    return () => clearInterval(interval)
  }, [])

  const live    = matches.filter(m => m.result?.status === 'in_progress')
  const pending = matches.filter(m => !m.result || m.result.status === 'pending')

  const MatchRow = ({ m }: { m: Match }) => {
    const isLive = m.result?.status === 'in_progress'
    return (
      <div className="match-card" onClick={() => navigate(`/matches/${m.id}/live`)}>
        {isLive && <span className="live-dot" />}
        <div className="match-teams"><span>{m.homeTeam.name}</span></div>
        {m.result && m.result.status === 'in_progress' ? (
          <div className="match-score">{m.result.homeScore} - {m.result.awayScore}</div>
        ) : (
          <div className="match-vs">VS</div>
        )}
        <div className="match-teams" style={{ justifyContent: 'flex-end' }}>
          <span>{m.awayTeam.name}</span>
        </div>
        <div className="match-meta">
          {new Date(m.scheduledAt).toLocaleDateString('es-MX')}
          {m.venue && <><br />{m.venue}</>}
        </div>
      </div>
    )
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
        <div className="section-title" style={{ fontSize: 36, marginBottom: 4 }}>
          <span className="live-dot" />EN VIVO
        </div>
        <p style={{ color: 'var(--text)', marginBottom: 32, fontFamily: 'var(--mono)', fontSize: 12 }}>
          Actualización automática cada 10 segundos
        </p>

        {loading && <div className="state-loading">Cargando partidos...</div>}
        {error   && <div className="state-error">{error}</div>}

        {!loading && !error && (
          <>
            <div className="section-title" style={{ marginBottom: 12 }}>EN CURSO</div>
            {live.length === 0 ? (
              <div className="state-empty" style={{ padding: '24px' }}>No hay partidos en curso ahora mismo.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
                {live.map(m => <MatchRow key={m.id} m={m} />)}
              </div>
            )}

            <div className="section-title" style={{ marginBottom: 12 }}>PRÓXIMOS</div>
            {pending.length === 0 ? (
              <div className="state-empty" style={{ padding: '24px' }}>No hay partidos pendientes.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pending.slice(0, 5).map(m => <MatchRow key={m.id} m={m} />)}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
