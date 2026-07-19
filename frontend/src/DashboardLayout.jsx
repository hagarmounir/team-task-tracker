import { Routes, Route, NavLink } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LayoutDashboard, CheckSquare, Settings, LogOut, User as UserIcon } from 'lucide-react';
import Projects from './Projects';
import TaskBoard from './TaskBoard';
import SettingsPage from './Settings';

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>
        <div style={{ paddingBottom: '32px', borderBottom: '1px solid var(--glass-border)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--accent-primary)', padding: '8px', borderRadius: '8px' }}>
              <CheckSquare size={24} color="white" />
            </div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Task Tracker</h2>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <NavLink to="/" end className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-ghost'}`} style={{ justifyContent: 'flex-start' }}>
            <LayoutDashboard size={20} /> Projects
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-ghost'}`} style={{ justifyContent: 'flex-start' }}>
            <Settings size={20} /> Settings
          </NavLink>
        </nav>

        {/* User Profile Footer */}
        <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '50%' }}>
              <UserIcon size={20} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.email}</div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={logout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', color: '#fca5a5' }}>
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Projects />} />
          <Route path="/projects/:projectId/tasks" element={<TaskBoard />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
