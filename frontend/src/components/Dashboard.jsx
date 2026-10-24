import React from 'react';
import { Users, Building2, Calendar, Database, ArrowRight, UserPlus, Eye } from 'lucide-react';
import StatsCard from './StatsCard';

export default function Dashboard({
  stats,
  loading,
  error,
  onRefresh,
  onOpenAddModal,
  onViewStudent,
  onNavigateToStudents,
}) {
  if (loading) {
    return (
      <div className="state-container">
        <div className="spinner" role="status" aria-label="Loading dashboard metrics"></div>
        <p className="state-title">Loading Dashboard...</p>
        <p className="state-desc">Fetching live analytics and department summaries from MySQL.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container">
        <div className="state-icon-box" style={{ color: 'var(--danger)' }}>
          <Users size={32} />
        </div>
        <p className="state-title">Unable to Load Dashboard Data</p>
        <p className="state-desc">{error}</p>
        <button className="btn-secondary" onClick={onRefresh} id="btn-retry-dashboard">
          Retry Request
        </button>
      </div>
    );
  }

  const totalStudents = stats?.totalStudents || 0;
  const deptCounts = stats?.departmentCounts || [];
  const recentStudents = stats?.recentStudents || [];

  return (
    <div className="dashboard-view">
      <div className="page-header">
        <div className="page-title-group">
          <h2>Administrative Overview</h2>
          <p>Real-time metrics, student enrollment distribution, and recently registered students.</p>
        </div>
        <button className="btn-primary" onClick={onOpenAddModal} id="btn-quick-add-student">
          <UserPlus size={18} aria-hidden="true" />
          <span>Enroll Student</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <StatsCard
          title="Total Students"
          value={totalStudents}
          subtext="Enrolled across all programs"
          icon={Users}
          colorClass="icon-purple"
        />
        <StatsCard
          title="Active Departments"
          value={deptCounts.length}
          subtext="Academic faculties"
          icon={Building2}
          colorClass="icon-cyan"
        />
        <StatsCard
          title="Recent Additions"
          value={recentStudents.length}
          subtext="Latest enrolled students"
          icon={Calendar}
          colorClass="icon-green"
        />
        <StatsCard
          title="Database Status"
          value="Connected"
          subtext="MySQL 8.0 Engine"
          icon={Database}
          colorClass="icon-amber"
        />
      </div>

      {/* Two Column Layout: Department Distribution & Recent Students */}
      <div className="dashboard-columns">
        {/* Department Distribution */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">
              <Building2 size={20} color="var(--accent-cyan)" aria-hidden="true" />
              <span>Department Distribution</span>
            </div>
          </div>

          {deptCounts.length === 0 ? (
            <p className="state-desc" style={{ padding: '1rem 0' }}>
              No department data available. Add students to see distribution statistics.
            </p>
          ) : (
            <div className="dept-list">
              {deptCounts.map((dept) => {
                const percentage = totalStudents > 0 ? Math.round((dept.count / totalStudents) * 100) : 0;
                return (
                  <div key={dept.department} className="dept-item">
                    <div className="dept-item-top">
                      <span className="dept-name">{dept.department}</span>
                      <span className="dept-count-badge">
                        {dept.count} {dept.count === 1 ? 'student' : 'students'} ({percentage}%)
                      </span>
                    </div>
                    <div className="dept-progress-track">
                      <div
                        className="dept-progress-fill"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                        role="progressbar"
                        aria-valuenow={percentage}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Students Table */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">
              <Users size={20} color="#818cf8" aria-hidden="true" />
              <span>Recently Enrolled Students</span>
            </div>
            <button
              className="btn-secondary"
              onClick={onNavigateToStudents}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
              id="btn-view-all-students"
            >
              <span>View All</span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>

          {recentStudents.length === 0 ? (
            <div className="state-container" style={{ padding: '2rem 1rem' }}>
              <p className="state-desc">No students recorded yet.</p>
              <button className="btn-primary" onClick={onOpenAddModal} style={{ marginTop: '0.5rem' }}>
                Add First Student
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Department</th>
                    <th>Year</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className="student-name-cell">
                          <div className="avatar-circle">
                            {student.fullName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{student.fullName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge-department">{student.department}</span>
                      </td>
                      <td>
                        <span className="badge-year">{student.academicYear}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn-icon view"
                          onClick={() => onViewStudent(student)}
                          title="View Details"
                          aria-label={`View details for ${student.fullName}`}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
