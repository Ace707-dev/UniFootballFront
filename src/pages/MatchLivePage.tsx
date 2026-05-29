import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

interface MatchEvent {
  _id: string
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'foul'
  minute: number
  playerName: string
  teamName: string
  description?: string | null
}

interface MatchResult {
  homeScore: number
  awayScore: number
  status: string
}

interface LiveData {
  homeTeamName?: string
  awayTeamName?: string
  events: MatchEvent[]
  result: MatchResult | null
}

const EVENT_ICON: Record<MatchEvent['type'], string> = {
  goal:         '⚽',
  yellow_card:  '🟨',
  red_card:     '🟥',
  substitution: '🔄',
  foul:         '⚠️',
}

export default function MatchLivePage() {
  const { matchId } = useParams<{ matchId: string }>()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [data, setData] = useState<LiveData>({ events: [], result: null })
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchData = () => {
    client.get(`/matches/${matchId}/live`)
      .then(res => setData({
        homeTeamName: res.data.homeTeamName,
        awayTeamName: res.data.awayTeamName,
        events:       res.data.events ?? [],
        result:       res.data.result ?? null,
      }))
      .catch(() => setError('Error al cargar el partido'))
  }

  useEffect(() => {
    fetchData()
    intervalRef.current = setInterval(fetchData, 5000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [matchId])

  const { result, events, homeTeamName, awayTeamName } = data
  const isLive = result?.status === 'in_progress'

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
        <div className="section-title" style={{fontSize: 36, marginBottom: 24}}>
          {isLive && <span className="live-dot" />}
          {isLive ? 'EN VIVO' : 'PARTIDO'}
        </div>

        {error && <div className="state-error">{error}</div>}

        {result && (
          <div className="scoreboard">
            <div className="scoreboard-score">
              {result.homeScore} — {result.awayScore}
            </div>
            <div className="scoreboard-teams">
              <span>{homeTeamName ?? 'Local'}</span>
              <span className="badge badge-gray" style={{alignSelf:'center'}}>
                {result.status === 'played' ? 'Finalizado' : result.status === 'in_progress' ? 'En curso' : 'Pendiente'}
              </span>
              <span>{awayTeamName ?? 'Visitante'}</span>
            </div>
          </div>
        )}

        <div className="section-title" style={{marginBottom: 16}}>EVENTOS</div>

        {events.length === 0 ? (
          <div className="state-empty">Sin eventos aún...</div>
        ) : (
          <div className="event-list">
            {[...events]
              .sort((a, b) => a.minute - b.minute)
              .map(e => (
                <div key={e._id} className="event-item">
                  <span className="event-minute">{e.minute}'</span>
                  <span className="event-icon">{EVENT_ICON[e.type]}</span>
                  <div>
                    <div className="event-text">{e.playerName}</div>
                    <div className="event-team">{e.teamName}</div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  )
}
