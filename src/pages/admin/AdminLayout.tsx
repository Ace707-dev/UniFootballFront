import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { ReactNode } from 'react'

const NAV_ITEMS = [
  { path: '/admin',               label: 'Métricas',    icon: '📈' },
  { path: '/admin/tournaments',   label: 'Torneos',     icon: '🏆' },
  { path: '/admin/matches',       label: 'Partidos',    icon: '⚽' },
  { path: '/admin/teams',         label: 'Equipos',     icon: '👥' },
  { path: '/admin/notifications', label: 'Notificaciones', icon: '🔔' },
  { path: '/admin/graph',         label: 'Grafos',      icon: '🕸️' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAuth()

  return (
    <>
      <nav className="navbar">
        <span className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin')}>
          UNI<span>FOOTBALL</span>
          <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--accent2)', marginLeft: 8 }}>
            ADMIN
          </span>
        </span>
        <div className="navbar-actions">
          <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text)', marginRight: 8 }}>
            {user?.name}
          </span>
          <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>App</button>
          <button className="btn btn-danger" onClick={() => { logout(); navigate('/login') }}>Salir</button>
        </div>
      </nav>

      <div style={{ display: 'flex', minHeight: 'calc(100svh - 56px)' }}>
        <aside style={{
          width: 200,
          background: 'var(--bg2)',
          borderRight: '1px solid var(--border)',
          padding: '24px 0',
          flexShrink: 0,
        }}>
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 20px',
                  cursor: 'pointer',
                  color: active ? 'var(--accent)' : 'var(--text2)',
                  background: active ? 'var(--accent-dim)' : 'transparent',
                  borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                  fontSize: 14,
                  fontWeight: active ? 500 : 400,
                  transition: 'all 0.15s',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            )
          })}
        </aside>

        <main style={{ flex: 1, padding: '32px 32px 64px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </>
  )
}