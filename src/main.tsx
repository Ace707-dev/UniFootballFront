import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TournamentsPage from './pages/TournamentsPage'
import TournamentDetailPage from './pages/TournamentDetailPage'
import MatchesPage from './pages/MatchesPage'
import MatchLivePage from './pages/MatchLivePage'
import StatsPage from './pages/StatsPage'
import PlayerStatsPage from './pages/PlayerStatsPage'
import LivePage from './pages/LivePage'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import AdminMetricsPage from './pages/admin/AdminMetricsPage'
import AdminTournamentsPage from './pages/admin/AdminTournamentsPage'
import AdminMatchesPage from './pages/admin/AdminMatchesPage'
import AdminTeamsPage from './pages/admin/AdminTeamsPage'
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage'
import AdminGraphPage from './pages/admin/AdminGraphPage'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard"              element={<DashboardPage />} />
            <Route path="/tournaments"            element={<TournamentsPage />} />
            <Route path="/tournaments/:id"        element={<TournamentDetailPage />} />
            <Route path="/matches"                element={<MatchesPage />} />
            <Route path="/matches/:matchId/live"  element={<MatchLivePage />} />
            <Route path="/stats"                  element={<StatsPage />} />
            <Route path="/players/:userId"        element={<PlayerStatsPage />} />
            <Route path="/live"                   element={<LivePage />} />
            <Route element={<AdminRoute />}>
            <Route path="/admin"                    element={<AdminMetricsPage />} />
            <Route path="/admin/tournaments"        element={<AdminTournamentsPage />} />
            <Route path="/admin/matches"            element={<AdminMatchesPage />} />
            <Route path="/admin/teams"              element={<AdminTeamsPage />} />
            <Route path="/admin/notifications"      element={<AdminNotificationsPage />} />
            <Route path="/admin/graph"              element={<AdminGraphPage />} />
        </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
)
