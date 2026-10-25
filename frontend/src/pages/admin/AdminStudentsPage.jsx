import React, { useEffect, useState, useContext, useCallback } from 'react';
import { PlusCircle, RefreshCw, Pencil, Trash2, Eye, Search, ChevronDown } from 'lucide-react';
import { api } from '../../services/api';
import { ToastContext } from './AdminLayout';
import StudentModal from '../../components/StudentModal';
import StudentDetailModal from '../../components/StudentDetailModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

const DEPARTMENTS = [
  'ALL', 'Computer Science', 'Information Technology', 'Mechanical Engineering',
  'Electrical Engineering', 'Civil Engineering', 'Business Administration', 'Data Science',
];

export default function AdminStudentsPage() {
  const { addToast } = useContext(ToastContext);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const [studentModal, setStudentModal] = useState({ isOpen: false, student: null });
  const [detailModal, setDetailModal] = useState({ isOpen: false, student: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, student: null });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getStudents(departmentFilter, searchTerm);
      setStudents(data);
    } catch (err) {
      addToast(err.message || 'Failed to load students.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  }, [departmentFilter, searchTerm, addToast]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (studentData) => {
    if (studentModal.student) {
      await api.updateStudent(studentModal.student.id, studentData);
      addToast(`Updated record for "${studentData.fullName}".`, 'success', 'Student Updated');
    } else {
      await api.createStudent(studentData);
      addToast(`Enrolled "${studentData.fullName}".`, 'success', 'Student Enrolled');
    }
    load();
  };

  const handleDelete = async (id) => {
    const name = deleteModal.student?.fullName || 'record';
    try {
      await api.deleteStudent(id);
      addToast(`"${name}" has been removed.`, 'success', 'Deleted');
      load();
    } catch (err) {
      addToast(err.message || 'Failed to delete.', 'error', 'Delete Failed');
      throw err;
    }
  };

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <h2 className="page-title">Students Directory</h2>
          <p className="page-subtitle">Manage all enrolled student records</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-icon-outline" onClick={load} title="Refresh" id="btn-students-refresh">
            <RefreshCw size={17} />
          </button>
          <button className="btn-primary" onClick={() => setStudentModal({ isOpen: true, student: null })} id="btn-add-student">
            <PlusCircle size={17} /> New Student
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by name or email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="input-student-search"
          />
        </div>
        <div className="select-wrapper">
          <select
            className="select-dropdown"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            id="select-dept-filter"
          >
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown size={16} className="select-arrow" />
        </div>
      </div>

      {/* Table */}
      <div className="section-card table-card">
        {loading ? (
          <div className="skeleton-list">{[...Array(6)].map((_, i) => <div key={i} className="skeleton-row" />)}</div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <Search size={40} />
            <p>No students found matching your criteria.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Register No.</th>
                <th>Email</th>
                <th>Department</th>
                <th>Year</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="td-name">{s.fullName}</td>
                  <td><code className="reg-no">{s.registerNumber || '—'}</code></td>
                  <td className="td-email">{s.email}</td>
                  <td>{s.department}</td>
                  <td>{s.academicYear}</td>
                  <td>
                    <span className={`status-chip ${s.activated ? 'chip-success' : 'chip-warning'}`}>
                      {s.activated ? 'Active' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon" title="View" onClick={() => setDetailModal({ isOpen: true, student: s })} id={`btn-view-${s.id}`}><Eye size={16} /></button>
                      <button className="btn-icon" title="Edit" onClick={() => setStudentModal({ isOpen: true, student: s })} id={`btn-edit-${s.id}`}><Pencil size={16} /></button>
                      <button className="btn-icon delete" title="Delete" aria-label={`Delete ${s.fullName}`} onClick={() => setDeleteModal({ isOpen: true, student: s })} id={`btn-delete-${s.id}`}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <StudentModal
        isOpen={studentModal.isOpen}
        onClose={() => setStudentModal({ isOpen: false, student: null })}
        onSubmit={handleSave}
        student={studentModal.student}
      />
      <StudentDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, student: null })}
        student={detailModal.student}
        onEdit={(s) => setStudentModal({ isOpen: true, student: s })}
      />
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, student: null })}
        onConfirm={handleDelete}
        student={deleteModal.student}
      />
    </div>
  );
}
