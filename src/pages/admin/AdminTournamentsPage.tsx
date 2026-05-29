import { useEffect, useState } from 'react'
import client from '../../api/client'
import AdminLayout from './AdminLayout'

interface Tournament {
  id: string
  name: string
  sport: string
  status: string
  startDate: string
  endDate: string
  format: string
}

const EMPTY_FORM = { name: '', sport: 'Fútbol', format: 'league', startDate: '', endDate: '' }

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = () => {
    client.get('/tournaments')
      .then(res => setTournaments(res.data))
      .catch(() => setError('Error al cargar torneos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await client.post('/tournaments', form)
      setShowForm(false)
      setForm(EMPTY_FORM)
      fetch()
    } catch {
      setError('Error al crear torneo')
    } finally {
      setSaving(false)
    }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'badge-green', upcoming: 'badge-blue', finished: 'badge-gray'
    }
    return <span className={`badge ${map[status] ?? 'badge-gray'}`}>{status}</span>
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div className="section-title" style={{ fontSize: 36, marginBottom: 0 }}>TORNEOS</div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nuevo torneo'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24, maxWidth: 560 }}>
          <h3 style={{ marginBottom: 20 }}>Nuevo torneo</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input className="form-input" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Deporte</label>
              <input className="form-input" value={form.sport}
                onChange={e => setForm(f => ({ ...f, sport: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Formato</label>
              <select className="form-input" value={form.format}
                onChange={e => setForm(f => ({ ...f, format: e.target.value }))}>
                <option value="league">Liga</option>
                <option value="cup">Copa</option>
                <option value="group+knockout">Grupos + Eliminación</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Fecha inicio</label>
                <input className="form-input" type="date" value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha fin</label>
                <input className="form-input" type="date" value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required />
              </div>
            </div>
            {error && <div className="login-error" style={{ marginBottom: 12 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Crear torneo'}
            </button>
          </form>
        </div>
      )}

      {loading && <div className="state-loading">Cargando...</div>}

      {!loading && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="uf-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Deporte</th>
                <th>Formato</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text)' }}>
                  Sin torneos registrados
                </td></tr>
              )}
              {tournaments.map(t => (
                <tr key={t.id}>
                  <td className="team-name">{t.name}</td>
                  <td>{t.sport}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{t.format}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
                    {new Date(t.startDate).toLocaleDateString('es-MX')}
                  </td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
                    {new Date(t.endDate).toLocaleDateString('es-MX')}
                  </td>
                  <td>{statusBadge(t.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}