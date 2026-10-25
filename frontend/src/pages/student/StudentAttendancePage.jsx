import React, { useEffect, useState, useContext } from 'react';
import { CalendarDays } from 'lucide-react';
import { studentApi } from '../../services/api';
import { StudentToastContext } from './StudentLayout';

export default function StudentAttendancePage() {
  const { addToast } = useContext(StudentToastContext);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [recs, sum] = await Promise.all([
          studentApi.getAttendance(),
          studentApi.getAttendanceSummary(),
        ]);
        setRecords(recs);
        setSummary(sum);
      } catch (err) {
        addToast(err.message || 'Failed to load attendance.', 'error', 'Error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [addToast]);

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <h2 className="page-title">My Attendance</h2>
          <p className="page-subtitle">View your class attendance records</p>
        </div>
      </div>

      {summary && (
        <div className="section-card">
          <div className="summary-pills">
            <span className="pill pill-success">Present: {summary.presentSessions}</span>
            <span className="pill pill-danger">Absent: {summary.absentSessions}</span>
            <span className="pill pill-warning">Late: {summary.lateSessions}</span>
            <span className="pill pill-info">Total: {summary.totalSessions}</span>
          </div>
          <div className="att-bar-container">
            <div
              className="att-bar-fill"
              style={{
                width: `${Math.min(summary.overallPercentage || 0, 100)}%`,
                background: summary.overallPercentage >= 75 ? 'var(--success)' : 'var(--danger)',
              }}
            />
          </div>
          <p className="att-bar-label">
            {summary.overallPercentage?.toFixed(1)}% attendance
            {summary.overallPercentage >= 75 ? ' ✅ Good standing' : ' ⚠️ Below 75%'}
          </p>
        </div>
      )}

      <div className="section-card table-card">
        {loading ? (
          <div className="skeleton-list">{[...Array(6)].map((_, i) => <div key={i} className="skeleton-row" />)}</div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <CalendarDays size={40} />
            <p>No attendance records found.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{r.attendanceDate}</td>
                  <td>{r.subjectName || r.subjectCode}</td>
                  <td>
                    <span className={`status-chip ${r.status === 'PRESENT' ? 'chip-success' : r.status === 'LATE' ? 'chip-warning' : 'chip-danger'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>{r.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
