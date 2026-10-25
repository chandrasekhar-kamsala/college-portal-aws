import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Users, UserCheck, UserX, TrendingUp, PlusCircle, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { ToastContext } from './AdminLayout';
import { useNavigate } from 'react-router-dom';

function StatCard({ icon: Icon, label, value, accent, loading }) {
  return (
    <div className="stat-card" style={{ '--accent': accent }}>
      <div className="stat-card-icon"><Icon size={22} /></div>
      <div className="stat-card-body">
        <span className="stat-card-label">{label}</span>
        {loading ? <div className="skeleton-line wide" /> : <span className="stat-card-value">{value ?? '—'}</span>}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { addToast } = useContext(ToastContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      addToast(err.message || 'Failed to load dashboard stats.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Overview of all student records and academic data</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-icon-outline" onClick={load} title="Refresh" id="btn-dash-refresh">
            <RefreshCw size={17} />
          </button>
          <button className="btn-primary" onClick={() => navigate('/admin/students')} id="btn-dash-manage-students">
            <Users size={17} /> Manage Students
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        <StatCard icon={Users}     label="Total Students"     value={stats?.totalStudents}     accent="var(--primary)"       loading={loading} />
        <StatCard icon={UserCheck} label="Active Students"    value={stats?.activatedStudents}  accent="var(--success)"       loading={loading} />
        <StatCard icon={UserX}     label="Pending Activation" value={stats?.pendingActivation}  accent="var(--warning)"       loading={loading} />
        <StatCard icon={TrendingUp}label="Departments"        value={stats?.totalDepartments}   accent="var(--accent-cyan)"   loading={loading} />
      </div>

      {/* Recent students */}
      <div className="section-card">
        <div className="section-card-header">
          <h3>Recent Students</h3>
          <button className="btn-link" onClick={() => navigate('/admin/students')} id="btn-dash-view-all">
            View all →
          </button>
        </div>
        {loading ? (
          <div className="skeleton-list">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton-row" />)}
          </div>
        ) : stats?.recentStudents?.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Register No.</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentStudents.map((s) => (
                <tr key={s.id}>
                  <td>{s.fullName}</td>
                  <td><code className="reg-no">{s.registerNumber || '—'}</code></td>
                  <td>{s.department}</td>
                  <td>
                    <span className={`status-chip ${s.activated ? 'chip-success' : 'chip-warning'}`}>
                      {s.activated ? 'Active' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <Users size={40} />
            <p>No students enrolled yet.</p>
            <button className="btn-primary" onClick={() => navigate('/admin/students')} id="btn-dash-add-first">
              <PlusCircle size={16} /> Add First Student
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
