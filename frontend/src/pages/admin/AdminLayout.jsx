import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap, LayoutDashboard, Users, CalendarDays,
  BookMarked, FileText, LogOut, ShieldCheck, Menu, X, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Toast from '../../components/Toast';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',    icon: LayoutDashboard, path: '/admin' },
  { id: 'students',  label: 'Students',     icon: Users,           path: '/admin/students' },
  { id: 'attendance',label: 'Attendance',   icon: CalendarDays,    path: '/admin/attendance' },
  { id: 'marks',     label: 'Marks',        icon: BookMarked,      path: '/admin/marks' },
  { id: 'tickets',   label: 'Hall Tickets', icon: FileText,        path: '/admin/hall-tickets' },
];

export const ToastContext = React.createContext(null);

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const addToast = useCallback((message, type = 'success', title = '') => {
    const id = Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type, title }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const check = async () => setIsBackendOnline(await api.checkHealth());
    check();
    const iv = setInterval(check, 30000);
    return () => clearInterval(iv);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const activeId = NAV_ITEMS.find(n =>
    n.path === location.pathname ||
    (n.id !== 'dashboard' && location.pathname.startsWith(n.path))
  )?.id || 'dashboard';

  return (
    <ToastContext.Provider value={{ addToast }}>
      <div className="admin-shell">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${mobileNavOpen ? 'open' : ''}`}>
          <div className="sidebar-brand">
            <GraduationCap size={28} />
            <div>
              <span className="sidebar-brand-name">College Portal</span>
              <span className="sidebar-brand-role"><ShieldCheck size={11} /> Admin</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => (
              <button
                key={id}
                className={`sidebar-nav-item ${activeId === id ? 'active' : ''}`}
                onClick={() => { navigate(path); setMobileNavOpen(false); }}
                id={`sidebar-nav-${id}`}
              >
                <Icon size={19} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">{(user?.name || user?.username || 'A')[0].toUpperCase()}</div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user?.name || user?.username}</span>
                <span className="sidebar-user-role">Administrator</span>
              </div>
            </div>
            <button className="sidebar-logout" onClick={handleLogout} id="btn-admin-logout">
              <LogOut size={18} />
            </button>
          </div>
        </aside>

        {/* Mobile overlay */}
        {mobileNavOpen && (
          <div className="sidebar-overlay" onClick={() => setMobileNavOpen(false)} />
        )}

        {/* Main content */}
        <div className="admin-main">
          {/* Top bar */}
          <header className="admin-topbar">
            <button className="topbar-menu-btn" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Toggle menu">
              {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="topbar-title">
              {NAV_ITEMS.find(n => n.id === activeId)?.label || 'Admin'}
            </div>
            <div className={`topbar-status ${isBackendOnline ? 'online' : 'offline'}`}>
              {isBackendOnline
                ? <><CheckCircle2 size={14} /> Online</>
                : <><AlertCircle size={14} /> Connecting…</>
              }
            </div>
          </header>

          <main className="admin-content">
            <Outlet />
          </main>
        </div>

        <Toast toasts={toasts} onDismiss={dismissToast} />
      </div>
    </ToastContext.Provider>
  );
}
