import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

interface PlayerStat {
  id: string
  matchId: string
  match: {
    scheduledAt: string
    homeTeam: { name: string }
    awayTeam: { name: string }
  }
  goals: number
  assists: number
  yellowCards: number
  redCards: number
  minutesPlayed: number
}

export default function PlayerStatsPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [stats, setStats] = useState<PlayerStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    client.get(`/players-stats/user/${userId}`)
      .then(res => setStats(res.data))
      .catch(() => setError('Error al cargar estadísticas'))
      .finally(() => setLoading(false))
  }, [userId])

  const totals = stats.reduce(
    (acc, s) => ({
      goals:        acc.goals + s.goals,
      assists:      acc.assists + s.assists,
      yellowCards:  acc.yellowCards + s.yellowCards,
      redCards:     acc.redCards + s.redCards,
      minutesPlayed: acc.minutesPlayed + s.minutesPlayed,
    }),
    { goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0 }
  )

  return (
    <>
      <nav className="navbar">
        <span className="navbar-brand" style={{cursor:'pointer'}} onClick={() => navigate('/dashboard')}>
          UNI<span>FOOTBALL</span>
        </span>
        <div className="navbar-actions">
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Volver</button>
          <button className="btn btn-danger" onClick={() => { logout(); navigate('/login') }}>Salir</button>
        </div>
      </nav>
      <div className="page">
        <div className="section-title" style={{fontSize: 36, marginBottom: 24}}>ESTADÍSTICAS</div>

        {loading && <div className="state-loading">Cargando...</div>}
        {error   && <div className="state-error">{error}</div>}

        {!loading && !error && (
          <>
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-value">{totals.goals}</div>
                <div className="stat-label">Goles</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{color:'var(--accent2)'}}>{totals.assists}</div>
                <div className="stat-label">Asistencias</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{color:'var(--yellow)'}}>{totals.yellowCards}</div>
                <div className="stat-label">T. Amarillas</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{color:'var(--red)'}}>{totals.redCards}</div>
                <div className="stat-label">T. Rojas</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{fontSize:28}}>{totals.minutesPlayed}</div>
                <div className="stat-label">Minutos</div>
              </div>
            </div>

            <div className="section-title" style={{marginTop: 32, marginBottom: 16}}>POR PARTIDO</div>

            {stats.length === 0 ? (
              <div className="state-empty">Sin estadísticas registradas.</div>
            ) : (
              <div className="card" style={{padding: 0, overflow: 'hidden'}}>
                <table className="uf-table">
                  <thead>
                    <tr>
                      <th>Partido</th>
                      <th>Fecha</th>
                      <th>Goles</th>
                      <th>Asist</th>
                      <th>TA</th>
                      <th>TR</th>
                      <th>Min</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map(s => (
                      <tr key={s.id}>
                        <td className="team-name">{s.match.homeTeam.name} vs {s.match.awayTeam.name}</td>
                        <td style={{fontFamily:'var(--mono)', fontSize:12}}>
                          {new Date(s.match.scheduledAt).toLocaleDateString('es-MX')}
                        </td>
                        <td className="pts">{s.goals}</td>
                        <td style={{color:'var(--accent2)'}}>{s.assists}</td>
                        <td style={{color:'var(--yellow)'}}>{s.yellowCards}</td>
                        <td style={{color:'var(--red)'}}>{s.redCards}</td>
                        <td style={{fontFamily:'var(--mono)'}}>{s.minutesPlayed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
