import React, { useState, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap, LayoutDashboard, CalendarDays, BookMarked, FileText, LogOut, BookOpen, Menu, X, ListChecks
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';

const NAV = [
  { id: 'dashboard', label: 'Dashboard',        icon: LayoutDashboard, path: '/student' },
  { id: 'attendance',label: 'Attendance',        icon: CalendarDays,    path: '/student/attendance' },
  { id: 'marks',     label: 'Marks & Results',   icon: BookMarked,      path: '/student/marks' },
  { id: 'tickets',   label: 'Hall Tickets',      icon: FileText,        path: '/student/hall-tickets' },
  { id: 'subjects',  label: 'Subject Registration', icon: ListChecks,   path: '/student/subjects' },
];

export const StudentToastContext = React.createContext(null);

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [toasts, setToasts] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const addToast = useCallback((message, type = 'success', title = '') => {
    const id = Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type, title }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const activeId = NAV.find(n =>
    n.path === location.pathname ||
    (n.id !== 'dashboard' && location.pathname.startsWith(n.path))
  )?.id || 'dashboard';

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <StudentToastContext.Provider value={{ addToast }}>
      <div className="admin-shell">
        {/* Sidebar */}
        <aside className={`admin-sidebar student-sidebar ${mobileOpen ? 'open' : ''}`}>
          <div className="sidebar-brand">
            <GraduationCap size={28} />
            <div>
              <span className="sidebar-brand-name">College Portal</span>
              <span className="sidebar-brand-role"><BookOpen size={11} /> Student</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            {NAV.map(({ id, label, icon: Icon, path }) => (
              <button
                key={id}
                className={`sidebar-nav-item ${activeId === id ? 'active' : ''}`}
                onClick={() => { navigate(path); setMobileOpen(false); }}
                id={`student-nav-${id}`}
              >
                <Icon size={19} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="sidebar-user-avatar student-avatar">
                {(user?.name || user?.registerNumber || 'S')[0].toUpperCase()}
              </div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user?.name || user?.registerNumber}</span>
                <span className="sidebar-user-role">Student</span>
              </div>
            </div>
            <button className="sidebar-logout" onClick={handleLogout} id="btn-student-logout">
              <LogOut size={18} />
            </button>
          </div>
        </aside>

        {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

        <div className="admin-main">
          <header className="admin-topbar">
            <button className="topbar-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="topbar-title">
              {NAV.find(n => n.id === activeId)?.label || 'Student Portal'}
            </div>
            <div className="topbar-register-no">
              {user?.registerNumber || ''}
            </div>
          </header>

          <main className="admin-content">
            <Outlet />
          </main>
        </div>

        <Toast toasts={toasts} onDismiss={dismissToast} />
      </div>
    </StudentToastContext.Provider>
  );
}
