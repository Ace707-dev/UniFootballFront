import {useState } from 'react'
import client from '../../api/client'
import AdminLayout from './AdminLayout'

interface Notification {
  _id: string
  userId: string
  title: string
  message: string
  type: string
  read: boolean
  matchId?: string
  tournamentId?: string
  createdAt: string
}

const EMPTY_FORM = {
  userId: '',
  title: '',
  message: '',
  type: 'info',
  matchId: '',
  tournamentId: '',
}

const TYPE_BADGE: Record<string, string> = {
  goal:        'badge-green',
  match_start: 'badge-blue',
  match_end:   'badge-gray',
  info:        'badge-blue',
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [userId, setUserId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = (uid: string) => {
    if (!uid.trim()) return
    setLoading(true)
    client.get(`/notifications/user/${uid}`)
      .then(res => setNotifications(res.data))
      .catch(() => setError('Error al cargar notificaciones'))
      .finally(() => setLoading(false))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchNotifications(userId)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await client.post('/notifications', {
        ...form,
        matchId:      form.matchId      || undefined,
        tournamentId: form.tournamentId || undefined,
      })
      setShowForm(false)
      setForm(EMPTY_FORM)
      if (form.userId === userId) fetchNotifications(userId)
    } catch {
      setError('Error al enviar notificación')
    } finally {
      setSaving(false)
    }
  }

  const handleMarkAllRead = async () => {
    if (!userId.trim()) return
    await client.patch(`/notifications/user/${userId}/read-all`)
    fetchNotifications(userId)
  }

  const handleMarkRead = async (id: string) => {
    await client.patch(`/notifications/${id}/read`)
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, read: true } : n)
    )
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div className="section-title" style={{ fontSize: 36, marginBottom: 0 }}>NOTIFICACIONES</div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nueva notificación'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24, maxWidth: 560 }}>
          <h3 style={{ marginBottom: 20 }}>Enviar notificación</h3>
          <form onSubmit={handleSend}>
            <div className="form-group">
              <label className="form-label">ID del usuario</label>
              <input className="form-input" placeholder="uuid del usuario"
                value={form.userId}
                onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Título</label>
              <input className="form-input" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Mensaje</label>
              <input className="form-input" value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select className="form-input" value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="info">Info</option>
                <option value="goal">Gol</option>
                <option value="match_start">Inicio de partido</option>
                <option value="match_end">Fin de partido</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Match ID (opcional)</label>
                <input className="form-input" placeholder="uuid"
                  value={form.matchId}
                  onChange={e => setForm(f => ({ ...f, matchId: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Tournament ID (opcional)</label>
                <input className="form-input" placeholder="uuid"
                  value={form.tournamentId}
                  onChange={e => setForm(f => ({ ...f, tournamentId: e.target.value }))} />
              </div>
            </div>
            {error && <div className="login-error" style={{ marginBottom: 12 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ marginBottom: 24, maxWidth: 480 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <input className="form-input" placeholder="Buscar por user ID"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            style={{ flex: 1 }} />
          <button className="btn btn-primary" type="submit">Buscar</button>
        </form>
      </div>

      {loading && <div className="state-loading">Cargando...</div>}

      {!loading && notifications.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="btn btn-ghost" onClick={handleMarkAllRead}>
              Marcar todas como leídas
            </button>
          </div>
          <div className="event-list">
            {notifications.map(n => (
              <div key={n._id} className="event-item"
                style={{ opacity: n.read ? 0.5 : 1, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`badge ${TYPE_BADGE[n.type] ?? 'badge-gray'}`}>{n.type}</span>
                  <div>
                    <div className="event-text" style={{ fontWeight: 500 }}>{n.title}</div>
                    <div className="event-team">{n.message}</div>
                    <div className="event-team">
                      {new Date(n.createdAt).toLocaleString('es-MX')}
                    </div>
                  </div>
                </div>
                {!n.read && (
                  <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}
                    onClick={() => handleMarkRead(n._id)}>
                    Marcar leída
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && notifications.length === 0 && userId && (
        <div className="state-empty">Sin notificaciones para este usuario.</div>
      )}
    </AdminLayout>
  )
}