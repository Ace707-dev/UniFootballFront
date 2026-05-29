import { useState } from 'react'
import client from '../../api/client'
import AdminLayout from './AdminLayout'

type QueryType = 'opponents' | 'players' | 'tournaments'

interface GraphNode { id: string; name: string }

const QUERY_OPTIONS = [
  { value: 'opponents',   label: 'Equipos rivales',         desc: 'Equipos que han enfrentado a este equipo' },
  { value: 'players',     label: 'Jugadores del equipo',    desc: 'Jugadores que han jugado con este equipo' },
  { value: 'tournaments', label: 'Torneos del equipo',      desc: 'Torneos en los que ha participado el equipo' },
]

const EMPTY_SYNC = {
  tournamentId: '', tournamentName: '',
  homeTeamId: '', homeTeamName: '',
  awayTeamId: '', awayTeamName: '',
  playerIds: '',
}

export default function AdminGraphPage() {
  const [queryType, setQueryType] = useState<QueryType>('opponents')
  const [teamId, setTeamId] = useState('')
  const [results, setResults] = useState<GraphNode[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSync, setShowSync] = useState(false)
  const [syncForm, setSyncForm] = useState(EMPTY_SYNC)
  const [syncing, setSyncing] = useState(false)
  const [syncSuccess, setSyncSuccess] = useState(false)

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamId.trim()) return
    setLoading(true)
    setError(null)
    setResults([])
    try {
      const res = await client.get(`/graph/teams/${teamId}/${queryType}`)
      setResults(res.data)
    } catch {
      setError('Error al consultar el grafo. Verifica que Neo4j esté conectado.')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault()
    setSyncing(true)
    setSyncSuccess(false)
    setError(null)
    try {
      const playerIds = syncForm.playerIds
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      const playerNames: Record<string, string> = {}
      playerIds.forEach(id => { playerNames[id] = id })

      await client.post('/graph/sync', {
        tournamentId:   syncForm.tournamentId,
        tournamentName: syncForm.tournamentName,
        homeTeamId:     syncForm.homeTeamId,
        homeTeamName:   syncForm.homeTeamName,
        awayTeamId:     syncForm.awayTeamId,
        awayTeamName:   syncForm.awayTeamName,
        playerIds,
        playerNames,
      })
      setSyncSuccess(true)
      setSyncForm(EMPTY_SYNC)
      setShowSync(false)
    } catch {
      setError('Error al sincronizar. Verifica que Neo4j esté conectado.')
    } finally {
      setSyncing(false)
    }
  }

  const NODE_ICON: Record<QueryType, string> = {
    opponents:   '⚔️',
    players:     '👤',
    tournaments: '🏆',
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div className="section-title" style={{ fontSize: 36, marginBottom: 0 }}>GRAFOS NEO4J</div>
        <button className="btn btn-ghost" onClick={() => { setShowSync(!showSync); setSyncSuccess(false) }}>
          {showSync ? 'Cancelar' : '🔄 Sincronizar partido'}
        </button>
      </div>

      {syncSuccess && (
        <div style={{
          padding: '12px 16px', background: 'var(--accent-dim)', border: '1px solid var(--accent)',
          borderRadius: 'var(--radius)', marginBottom: 24, color: 'var(--accent)',
          fontFamily: 'var(--mono)', fontSize: 13
        }}>
          ✓ Nodos y relaciones sincronizados correctamente en Neo4j
        </div>
      )}

      {showSync && (
        <div className="card" style={{ marginBottom: 24, maxWidth: 560 }}>
          <h3 style={{ marginBottom: 4 }}>Sincronizar partido a Neo4j</h3>
          <p style={{ color: 'var(--text)', fontSize: 12, fontFamily: 'var(--mono)', marginBottom: 20 }}>
            Crea nodos Player / Team / Tournament y relaciones PLAYED_WITH, FACED, BELONGS_TO
          </p>
          <form onSubmit={handleSync}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Tournament ID</label>
                <input className="form-input" placeholder="uuid"
                  value={syncForm.tournamentId}
                  onChange={e => setSyncForm(f => ({ ...f, tournamentId: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Nombre del torneo</label>
                <input className="form-input" placeholder="Liga Universitaria"
                  value={syncForm.tournamentName}
                  onChange={e => setSyncForm(f => ({ ...f, tournamentName: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Home Team ID</label>
                <input className="form-input" placeholder="uuid"
                  value={syncForm.homeTeamId}
                  onChange={e => setSyncForm(f => ({ ...f, homeTeamId: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Nombre equipo local</label>
                <input className="form-input" placeholder="Tigres FC"
                  value={syncForm.homeTeamName}
                  onChange={e => setSyncForm(f => ({ ...f, homeTeamName: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Away Team ID</label>
                <input className="form-input" placeholder="uuid"
                  value={syncForm.awayTeamId}
                  onChange={e => setSyncForm(f => ({ ...f, awayTeamId: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Nombre equipo visitante</label>
                <input className="form-input" placeholder="Pumas FC"
                  value={syncForm.awayTeamName}
                  onChange={e => setSyncForm(f => ({ ...f, awayTeamName: e.target.value }))} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Player IDs (separados por coma)</label>
              <input className="form-input" placeholder="uuid1, uuid2, uuid3"
                value={syncForm.playerIds}
                onChange={e => setSyncForm(f => ({ ...f, playerIds: e.target.value }))} />
            </div>
            {error && <div className="login-error" style={{ marginBottom: 12 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={syncing}>
              {syncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Consultar relaciones</h3>
        <div className="tabs" style={{ marginBottom: 20 }}>
          {QUERY_OPTIONS.map(q => (
            <button
              key={q.value}
              className={`tab ${queryType === q.value ? 'active' : ''}`}
              onClick={() => { setQueryType(q.value as QueryType); setResults([]) }}
            >
              {q.label}
            </button>
          ))}
        </div>
        <p style={{ color: 'var(--text)', fontSize: 12, fontFamily: 'var(--mono)', marginBottom: 16 }}>
          {QUERY_OPTIONS.find(q => q.value === queryType)?.desc}
        </p>
        <form onSubmit={handleQuery} style={{ display: 'flex', gap: 8 }}>
          <input className="form-input" placeholder="Team ID (uuid)"
            value={teamId}
            onChange={e => setTeamId(e.target.value)}
            style={{ flex: 1 }} required />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Consultando...' : 'Consultar'}
          </button>
        </form>
      </div>

      {error && !showSync && <div className="state-error">{error}</div>}

      {results.length > 0 && (
        <>
          <div className="section-title" style={{ marginBottom: 12 }}>
            {results.length} resultado{results.length !== 1 ? 's' : ''}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {results.map(node => (
              <div key={node.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px',
                background: 'var(--bg2)',
                border: '1px solid var(--border2)',
                borderRadius: 'var(--radius)',
              }}>
                <span>{NODE_ICON[queryType]}</span>
                <div>
                  <div style={{ color: 'var(--heading)', fontWeight: 500, fontSize: 14 }}>{node.name}</div>
                  <div style={{ color: 'var(--text)', fontSize: 11, fontFamily: 'var(--mono)' }}>{node.id}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && results.length === 0 && teamId && !error && (
        <div className="state-empty">Sin resultados para este equipo.</div>
      )}
    </AdminLayout>
  )
}