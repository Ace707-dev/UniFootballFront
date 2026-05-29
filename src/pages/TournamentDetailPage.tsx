import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

interface Standing {
  id: string
  teamId: string
  team: { name: string }
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

interface Match {
  id: string
  scheduledAt: string
  venue: string | null
  homeTeam: { name: string }
  awayTeam: { name: string }
  result?: { homeScore: number; awayScore: number; status: string }
}

type Tab = 'standings' | 'fixture'

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [standings, setStandings] = useState<Standing[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('standings')

  useEffect(() => {
    Promise.all([
      client.get(`/stats/standings/${id}`),
      client.get(`/matches?tournament_id=${id}`),
    ])
      .then(([sRes, mRes]) => { setStandings(sRes.data); setMatches(mRes.data) })
      .catch(() => setError('Error al cargar el torneo'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <>
      <nav className="navbar">
        <span className="navbar-brand" style={{cursor:'pointer'}} onClick={() => navigate('/dashboard')}>
          UNI<span>FOOTBALL</span>
        </span>
        <div className="navbar-actions">
          <button className="btn btn-ghost" onClick={() => navigate('/tournaments')}>← Torneos</button>
          <button className="btn btn-danger" onClick={() => { logout(); navigate('/login') }}>Salir</button>
        </div>
      </nav>
      <div className="page">
        {loading && <div className="state-loading">Cargando...</div>}
        {error   && <div className="state-error">{error}</div>}

        {!loading && !error && (
          <>
            <div className="section-title" style={{fontSize: 36, marginBottom: 24}}>TORNEO</div>

            <div className="tabs">
              <button className={`tab ${tab === 'standings' ? 'active' : ''}`} onClick={() => setTab('standings')}>
                POSICIONES
              </button>
              <button className={`tab ${tab === 'fixture' ? 'active' : ''}`} onClick={() => setTab('fixture')}>
                FIXTURE
              </button>
            </div>

            {tab === 'standings' && (
              <>
                {standings.length === 0 ? (
                  <div className="state-empty">Sin datos de posiciones aún.</div>
                ) : (
                  <div className="card" style={{padding: 0, overflow: 'hidden'}}>
                    <table className="uf-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Equipo</th>
                          <th>PJ</th>
                          <th>G</th>
                          <th>E</th>
                          <th>P</th>
                          <th>GF</th>
                          <th>GC</th>
                          <th>Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings
                          .sort((a, b) => b.points - a.points)
                          .map((s, i) => (
                            <tr key={s.id}>
                              <td className="rank">{i + 1}</td>
                              <td className="team-name">{s.team.name}</td>
                              <td>{s.played}</td>
                              <td>{s.won}</td>
                              <td>{s.drawn}</td>
                              <td>{s.lost}</td>
                              <td>{s.goalsFor}</td>
                              <td>{s.goalsAgainst}</td>
                              <td className="pts">{s.points}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {tab === 'fixture' && (
              <>
                {matches.length === 0 ? (
                  <div className="state-empty">Sin partidos programados.</div>
                ) : (
                  <div style={{display:'flex', flexDirection:'column', gap: 8}}>
                    {matches.map(m => (
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
                        <div className="match-teams" style={{justifyContent:'flex-end'}}>
                          <span>{m.awayTeam.name}</span>
                        </div>
                        <div className="match-meta">
                          {new Date(m.scheduledAt).toLocaleDateString('es-MX')}
                          {m.venue && <><br />{m.venue}</>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}
