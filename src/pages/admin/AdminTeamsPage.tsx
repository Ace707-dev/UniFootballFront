import { useEffect, useState } from 'react'
import client from '../../api/client'
import AdminLayout from './AdminLayout'

interface Team {
  id: string
  name: string
  sport: string
  members?: { id: string; name: string; role: string }[]
}

const EMPTY_TEAM = { name: '', sport: 'Fútbol' }
const EMPTY_MEMBER = { userId: '', role: 'player' }

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_TEAM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [memberForm, setMemberForm] = useState(EMPTY_MEMBER)

  const fetchTeams = () => {
    client.get('/teams')
      .then(res => setTeams(res.data))
      .catch(() => setError('Error al cargar equipos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTeams() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await client.post('/teams', form)
      setShowForm(false)
      setForm(EMPTY_TEAM)
      fetchTeams()
    } catch {
      setError('Error al crear equipo')
    } finally {
      setSaving(false)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeam) return
    setSaving(true)
    try {
      await client.post(`/teams/${selectedTeam.id}/members`, memberForm)
      setMemberForm(EMPTY_MEMBER)
      fetchTeams()
    } catch {
      setError('Error al agregar miembro')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div className="section-title" style={{ fontSize: 36, marginBottom: 0 }}>EQUIPOS</div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setSelectedTeam(null) }}>
          {showForm ? 'Cancelar' : '+ Nuevo equipo'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24, maxWidth: 480 }}>
          <h3 style={{ marginBottom: 20 }}>Nuevo equipo</h3>
          <form onSubmit={handleCreate}>
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
            {error && <div className="login-error" style={{ marginBottom: 12 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Crear equipo'}
            </button>
          </form>
        </div>
      )}

      {selectedTeam && (
        <div className="card" style={{ marginBottom: 24, maxWidth: 480 }}>
          <h3 style={{ marginBottom: 4 }}>Agregar miembro</h3>
          <p style={{ color: 'var(--text)', fontSize: 13, fontFamily: 'var(--mono)', marginBottom: 20 }}>
            {selectedTeam.name}
          </p>
          <form onSubmit={handleAddMember}>
            <div className="form-group">
              <label className="form-label">ID del usuario</label>
              <input className="form-input" placeholder="uuid del usuario"
                value={memberForm.userId}
                onChange={e => setMemberForm(m => ({ ...m, userId: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Rol</label>
              <select className="form-input" value={memberForm.role}
                onChange={e => setMemberForm(m => ({ ...m, role: e.target.value }))}>
                <option value="player">Jugador</option>
                <option value="captain">Capitán</option>
                <option value="coach">Entrenador</option>
              </select>
            </div>
            {error && <div className="login-error" style={{ marginBottom: 12 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Agregar'}
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => setSelectedTeam(null)}>
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
                <th>Equipo</th>
                <th>Deporte</th>
                <th>Miembros</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {teams.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text)' }}>
                  Sin equipos registrados
                </td></tr>
              )}
              {teams.map(t => (
                <tr key={t.id}>
                  <td className="team-name">{t.name}</td>
                  <td>{t.sport}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
                    {t.members?.length ?? 0}
                  </td>
                  <td>
                    <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}
                      onClick={() => { setSelectedTeam(t); setShowForm(false) }}>
                      + Miembro
                    </button>
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