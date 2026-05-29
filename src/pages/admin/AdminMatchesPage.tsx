import { useEffect, useState } from 'react'
import client from '../../api/client'
import AdminLayout from './AdminLayout'

interface Tournament { id: string; name: string }
interface Team { id: string; name: string }
interface Match {
  id: string
  scheduledAt: string
  venue: string | null
  homeTeam: { name: string }
  awayTeam: { name: string }
  tournament?: { name: string }
  result?: { homeScore: number; awayScore: number; status: string }
}

const EMPTY_FORM = {
  tournamentId: '', homeTeamId: '', awayTeamId: '',
  scheduledAt: '', venue: '',
}
const EMPTY_RESULT = { homeScore: '', awayScore: '' }

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultMatch, setResultMatch] = useState<Match | null>(null)
  const [result, setResult] = useState(EMPTY_RESULT)

  const fetchAll = () => {
    Promise.all([
      client.get('/matches'),
      client.get('/tournaments'),
      client.get('/teams'),
    ])
      .then(([mRes, tRes, teamRes]) => {
        setMatches(mRes.data)
        setTournaments(tRes.data)
        setTeams(teamRes.data)
      })
      .catch(() => setError('Error al cargar datos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await client.post('/matches', form)
      setShowForm(false)
      setForm(EMPTY_FORM)
      fetchAll()
    } catch {
      setError('Error al crear partido')
    } finally {
      setSaving(false)
    }
  }

  const handleResult = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resultMatch) return
    setSaving(true)
    try {
      await client.patch(`/matches/${resultMatch.id}/result`, {
        homeScore: Number(result.homeScore),
        awayScore: Number(result.awayScore),
        status: 'played',
      })
      setResultMatch(null)
      setResult(EMPTY_RESULT)
      fetchAll()
    } catch {
      setError('Error al registrar resultado')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div className="section-title" style={{ fontSize: 36, marginBottom: 0 }}>PARTIDOS</div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nuevo partido'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24, maxWidth: 560 }}>
          <h3 style={{ marginBottom: 20 }}>Nuevo partido</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Torneo</label>
              <select className="form-input" value={form.tournamentId}
                onChange={e => setForm(f => ({ ...f, tournamentId: e.target.value }))} required>
                <option value="">Selecciona torneo</option>
                {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Equipo local</label>
                <select className="form-input" value={form.homeTeamId}
                  onChange={e => setForm(f => ({ ...f, homeTeamId: e.target.value }))} required>
                  <option value="">Selecciona equipo</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Equipo visitante</label>
                <select className="form-input" value={form.awayTeamId}
                  onChange={e => setForm(f => ({ ...f, awayTeamId: e.target.value }))} required>
                  <option value="">Selecciona equipo</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Fecha y hora</label>
              <input className="form-input" type="datetime-local" value={form.scheduledAt}
                onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Sede (opcional)</label>
              <input className="form-input" placeholder="Cancha principal" value={form.venue}
                onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} />
            </div>
            {error && <div className="login-error" style={{ marginBottom: 12 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Crear partido'}
            </button>
          </form>
        </div>
      )}

      {resultMatch && (
        <div className="card" style={{ marginBottom: 24, maxWidth: 400 }}>
          <h3 style={{ marginBottom: 4 }}>Registrar resultado</h3>
          <p style={{ color: 'var(--text)', fontSize: 13, fontFamily: 'var(--mono)', marginBottom: 20 }}>
            {resultMatch.homeTeam.name} vs {resultMatch.awayTeam.name}
          </p>
          <form onSubmit={handleResult}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">{resultMatch.homeTeam.name}</label>
                <input className="form-input" type="number" min="0" value={result.homeScore}
                  onChange={e => setResult(r => ({ ...r, homeScore: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">{resultMatch.awayTeam.name}</label>
                <input className="form-input" type="number" min="0" value={result.awayScore}
                  onChange={e => setResult(r => ({ ...r, awayScore: e.target.value }))} required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Confirmar'}
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => setResultMatch(null)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <div className="state-loading">Cargando...</div>}

      {!loading && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="uf-table">
            <thead>
              <tr>
                <th>Local</th>
                <th>Resultado</th>
                <th>Visitante</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {matches.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text)' }}>
                  Sin partidos registrados
                </td></tr>
              )}
              {matches.map(m => (
                <tr key={m.id}>
                  <td className="team-name">{m.homeTeam.name}</td>
                  <td className="pts">
                    {m.result?.status === 'played'
                      ? `${m.result.homeScore} - ${m.result.awayScore}`
                      : '— vs —'}
                  </td>
                  <td className="team-name">{m.awayTeam.name}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
                    {new Date(m.scheduledAt).toLocaleDateString('es-MX')}
                  </td>
                  <td>
                    <span className={`badge ${m.result?.status === 'played' ? 'badge-green' : 'badge-gray'}`}>
                      {m.result?.status ?? 'pending'}
                    </span>
                  </td>
                  <td>
                    {(!m.result || m.result.status !== 'played') && (
                      <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}
                        onClick={() => { setResultMatch(m); setResult(EMPTY_RESULT) }}>
                        Registrar resultado
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}