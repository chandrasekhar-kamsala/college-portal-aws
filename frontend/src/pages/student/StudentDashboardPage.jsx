import React, { useEffect, useState, useContext } from 'react';
import { User, Mail, Phone, BookOpen, GraduationCap, CalendarDays, BookMarked, FileText, TrendingUp } from 'lucide-react';
import { studentApi } from '../../services/api';
import { StudentToastContext } from './StudentLayout';
import { useAuth } from '../../context/AuthContext';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="info-row">
      <Icon size={16} className="info-icon" />
      <span className="info-label">{label}</span>
      <span className="info-value">{value || '—'}</span>
    </div>
  );
}

function QuickCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="stat-card" style={{ '--accent': accent }}>
      <div className="stat-card-icon"><Icon size={22} /></div>
      <div className="stat-card-body">
        <span className="stat-card-label">{label}</span>
        <span className="stat-card-value">{value ?? '—'}</span>
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  const { addToast } = useContext(StudentToastContext);
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [attSummary, setAttSummary] = useState(null);
  const [semResults, setSemResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [p, a, s] = await Promise.all([
          studentApi.getProfile(),
          studentApi.getAttendanceSummary(),
          studentApi.getSemesterResults(),
        ]);
        if (!cancelled) { setProfile(p); setAttSummary(a); setSemResults(s); }
      } catch (err) {
        if (!cancelled) addToast(err.message || 'Failed to load dashboard.', 'error', 'Error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [addToast]);

  if (loading) {
    return (
      <div className="page-section">
        <div className="skeleton-list">{[...Array(8)].map((_, i) => <div key={i} className="skeleton-row" />)}</div>
      </div>
    );
  }

  const latestSem = semResults?.[semResults.length - 1];

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <h2 className="page-title">Welcome back, {profile?.fullName?.split(' ')[0] || user?.name}!</h2>
          <p className="page-subtitle">{profile?.registerNumber} · {profile?.department} · {profile?.academicYear}</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="stats-grid">
        <QuickCard icon={CalendarDays} label="Attendance" value={attSummary ? `${attSummary.overallPercentage?.toFixed(1)}%` : '—'} accent="var(--accent-cyan)" />
        <QuickCard icon={BookMarked}   label="Latest GPA"  value={latestSem?.gpa?.toFixed(2) || '—'}   accent="var(--primary)" />
        <QuickCard icon={TrendingUp}   label="Total Classes" value={attSummary?.totalSessions ?? '—'} accent="var(--success)" />
        <QuickCard icon={FileText}     label="Semester"     value={profile?.semester || '—'} accent="var(--warning)" />
      </div>

      {/* Profile card */}
      <div className="section-card">
        <div className="section-card-header">
          <h3>My Profile</h3>
        </div>
        <div className="info-grid profile-info-grid">
          <InfoRow icon={User}          label="Full Name"       value={profile?.fullName} />
          <InfoRow icon={Mail}          label="Email"           value={profile?.email} />
          <InfoRow icon={Phone}         label="Phone"           value={profile?.phoneNumber} />
          <InfoRow icon={BookOpen}      label="Register No."    value={profile?.registerNumber} />
          <InfoRow icon={GraduationCap} label="Department"      value={profile?.department} />
          <InfoRow icon={CalendarDays}  label="Academic Year"   value={profile?.academicYear} />
        </div>
      </div>

      {/* Attendance summary */}
      {attSummary && (
        <div className="section-card">
          <div className="section-card-header"><h3>Attendance Summary</h3></div>
          <div className="summary-pills">
            <span className="pill pill-success">Present: {attSummary.presentSessions}</span>
            <span className="pill pill-danger">Absent: {attSummary.absentSessions}</span>
            <span className="pill pill-warning">Late: {attSummary.lateSessions}</span>
            <span className="pill pill-info">Total: {attSummary.totalSessions}</span>
          </div>
          {/* Attendance bar */}
          <div className="att-bar-container">
            <div
              className="att-bar-fill"
              style={{
                width: `${Math.min(attSummary.overallPercentage || 0, 100)}%`,
                background: attSummary.overallPercentage >= 75 ? 'var(--success)' : 'var(--danger)',
              }}
            />
          </div>
          <p className="att-bar-label">
            {attSummary.overallPercentage?.toFixed(1)}% — {attSummary.overallPercentage >= 75 ? '✅ Good standing' : '⚠️ Below 75% threshold'}
          </p>
        </div>
      )}

      {/* Semester results */}
      {semResults?.length > 0 && (
        <div className="section-card">
          <div className="section-card-header"><h3>Semester Results</h3></div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Semester</th>
                <th>GPA</th>
                <th>Total Marks</th>
                <th>Max Marks</th>
                <th>%</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {semResults.map((r) => (
                <tr key={r.semester}>
                  <td>{r.semester}</td>
                  <td><strong>{r.gpa?.toFixed(2)}</strong></td>
                  <td>{r.totalMarksObtained}</td>
                  <td>{r.totalMaxMarks}</td>
                  <td>{r.percentage?.toFixed(1)}%</td>
                  <td>
                    <span className={`status-chip ${r.passed ? 'chip-success' : 'chip-danger'}`}>
                      {r.resultStatus === 'PASS' ? 'Pass' : r.resultStatus || 'No data'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
