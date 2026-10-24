import React from 'react';
import { Search, Filter, Eye, Edit2, Trash2, PlusCircle, AlertCircle, RefreshCw, X } from 'lucide-react';

const DEPARTMENTS = [
  'ALL',
  'Computer Science',
  'Information Technology',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
  'Business Administration',
  'Data Science',
];

export default function StudentTable({
  students,
  loading,
  error,
  departmentFilter,
  setDepartmentFilter,
  searchTerm,
  setSearchTerm,
  onRefresh,
  onOpenAddModal,
  onViewStudent,
  onEditStudent,
  onDeleteStudent,
}) {
  return (
    <div className="students-view">
      <div className="page-header">
        <div className="page-title-group">
          <h2>Student Directory</h2>
          <p>Search, filter, inspect, edit, and manage enrolled college students.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn-secondary"
            onClick={onRefresh}
            title="Refresh student list"
            id="btn-refresh-students"
          >
            <RefreshCw size={16} className={loading ? 'spinner' : ''} aria-hidden="true" />
            <span>Refresh</span>
          </button>
          <button
            className="btn-primary"
            onClick={onOpenAddModal}
            id="btn-add-student-table"
          >
            <PlusCircle size={18} aria-hidden="true" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Search and Filter */}
      <div className="toolbar-card">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" aria-hidden="true" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by student name or email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="input-search-student"
            aria-label="Search students by name or email"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
              aria-label="Clear search query"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filter-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--text-muted)" aria-hidden="true" />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Department:</span>
          </div>
          <select
            className="select-dropdown"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            id="select-filter-department"
            aria-label="Filter students by department"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'ALL' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="table-card">
        {loading ? (
          <div className="state-container">
            <div className="spinner" role="status" aria-label="Loading student records"></div>
            <p className="state-title">Loading Students...</p>
            <p className="state-desc">Fetching records from MySQL database.</p>
          </div>
        ) : error ? (
          <div className="state-container">
            <div className="state-icon-box" style={{ color: 'var(--danger)' }}>
              <AlertCircle size={32} />
            </div>
            <p className="state-title">Failed to Load Students</p>
            <p className="state-desc">{error}</p>
            <button className="btn-secondary" onClick={onRefresh} id="btn-retry-students">
              Retry
            </button>
          </div>
        ) : students.length === 0 ? (
          <div className="state-container">
            <div className="state-icon-box">
              <Search size={32} />
            </div>
            <p className="state-title">No Students Found</p>
            <p className="state-desc">
              {searchTerm || departmentFilter !== 'ALL'
                ? 'No student matches your current search or department filter criteria.'
                : 'The student database is currently empty.'}
            </p>
            {searchTerm || departmentFilter !== 'ALL' ? (
              <button
                className="btn-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setDepartmentFilter('ALL');
                }}
              >
                Clear Filters
              </button>
            ) : (
              <button className="btn-primary" onClick={onOpenAddModal}>
                <PlusCircle size={18} aria-hidden="true" />
                <span>Add Your First Student</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table" aria-label="Enrolled Students Table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Department</th>
                    <th>Academic Year</th>
                    <th>Phone</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <span className="id-badge">
                          STU-{String(student.id).padStart(4, '0')}
                        </span>
                      </td>
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
                          <span style={{ fontWeight: 600 }}>{student.fullName}</span>
                        </div>
                      </td>
                      <td>
                        <a
                          href={`mailto:${student.email}`}
                          style={{ color: '#818cf8', textDecoration: 'none' }}
                          title={`Email ${student.fullName}`}
                        >
                          {student.email}
                        </a>
                      </td>
                      <td>
                        <span className="badge-department">{student.department}</span>
                      </td>
                      <td>
                        <span className="badge-year">{student.academicYear}</span>
                      </td>
                      <td>
                        <span style={{ color: student.phoneNumber ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {student.phoneNumber || '—'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons" style={{ justifyContent: 'center' }}>
                          <button
                            className="btn-icon view"
                            onClick={() => onViewStudent(student)}
                            title="View Student Details"
                            aria-label={`View details of ${student.fullName}`}
                          >
                            <Eye size={17} />
                          </button>
                          <button
                            className="btn-icon edit"
                            onClick={() => onEditStudent(student)}
                            title="Edit Student"
                            aria-label={`Edit ${student.fullName}`}
                          >
                            <Edit2 size={17} />
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() => onDeleteStudent(student)}
                            title="Delete Student"
                            aria-label={`Delete ${student.fullName}`}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <span>
                Showing <strong>{students.length}</strong> {students.length === 1 ? 'student record' : 'student records'}
              </span>
              <span>College Portal Database • MySQL 8.0</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
