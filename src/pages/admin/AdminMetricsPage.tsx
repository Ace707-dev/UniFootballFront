import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../../api/client'
import AdminLayout from './AdminLayout'

interface Metrics {
  tournaments: number
  matches: number
  teams: number
  players: number
  goals: number
  notifications: number
}

export default function AdminMetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      client.get('/tournaments'),
      client.get('/matches'),
      client.get('/teams'),
    ])
      .then(([tRes, mRes, teamRes]) => {
        const matches: any[] = mRes.data
        const goals = matches.reduce((acc: number, m: any) =>
          acc + (m.result?.homeScore ?? 0) + (m.result?.awayScore ?? 0), 0)
        const played = matches.filter((m: any) => m.result?.status === 'played').length

        setMetrics({
          tournaments: tRes.data.length,
          matches:     played,
          teams:       teamRes.data.length,
          players:     0,
          goals,
          notifications: 0,
        })
      })
      .catch(() => setMetrics(null))
      .finally(() => setLoading(false))
  }, [])

  const cards = metrics ? [
    { label: 'Torneos',         value: metrics.tournaments, icon: '🏆', color: 'var(--accent)',  route: '/admin/tournaments' },
    { label: 'Partidos jugados',value: metrics.matches,     icon: '⚽', color: 'var(--accent2)', route: '/admin/matches' },
    { label: 'Equipos',         value: metrics.teams,       icon: '👥', color: 'var(--yellow)',  route: '/admin/teams' },
    { label: 'Goles totales',   value: metrics.goals,       icon: '🥅', color: 'var(--accent)',  route: null },
  ] : []

  return (
    <AdminLayout>
      <div className="section-title" style={{ fontSize: 36, marginBottom: 32 }}>MÉTRICAS</div>

      {loading && <div className="state-loading">Cargando métricas...</div>}

      {!loading && metrics && (
        <>
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
            {cards.map(c => (
              <div
                key={c.label}
                className="stat-card"
                onClick={() => c.route && navigate(c.route)}
                style={{ cursor: c.route ? 'pointer' : 'default', transition: 'all 0.15s' }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
                <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
                <div className="stat-label">{c.label}</div>
              </div>
            ))}
          </div>

          <div className="section-title" style={{ marginBottom: 16 }}>ACCIONES RÁPIDAS</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/admin/tournaments')}>
              + Nuevo torneo
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/admin/matches')}>
              + Nuevo partido
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/admin/teams')}>
              + Nuevo equipo
            </button>
          </div>
        </>
      )}

      {!loading && !metrics && (
        <div className="state-error">Error al cargar métricas. Verifica la conexión con el backend.</div>
      )}
    </AdminLayout>
  )
}