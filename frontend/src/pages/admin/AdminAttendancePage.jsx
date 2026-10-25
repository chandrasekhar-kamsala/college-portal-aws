import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Trash2, CalendarDays, Search, BookOpen, Users, Zap, X } from 'lucide-react';
import { api, attendanceApi, subjectApi } from '../../services/api';
import { ToastContext } from './AdminLayout';

const STATUSES = ['PRESENT', 'ABSENT', 'LATE'];

function AttendanceForm({ studentId, subject, subjects, onSaved, onCancel }) {
  const { addToast } = useContext(ToastContext);
  const [form, setForm] = useState({
    attendanceDate: new Date().toISOString().slice(0, 10),
    subjectCode: subject.subjectCode,
    subjectName: subject.subjectName,
    semester: subject.semester,
    sessionName: 'Daily',
    status: 'PRESENT',
    remarks: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.attendanceDate) {
      addToast('Attendance date is required.', 'error', 'Validation'); return;
    }
    setSaving(true);
    try {
      await attendanceApi.add({
        studentId,
        ...form,
        subjectCode: form.subjectCode.trim().toUpperCase(),
        subjectName: form.subjectName.trim(),
        semester: form.semester.trim(),
        sessionName: form.sessionName.trim(),
      });
      addToast('Attendance record added.', 'success', 'Saved');
      onSaved();
    } catch (err) {
      addToast(err.message || 'Failed to save.', 'error', 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <span className="form-readonly-label"><BookOpen size={15} /> {subject.subjectCode} · {subject.subjectName} · {subject.semester}</span>
      <input type="date" className="form-input" value={form.attendanceDate} onChange={e => setForm({...form, attendanceDate: e.target.value})} required />
      <select className="select-dropdown" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <input type="text" className="form-input" placeholder="Remarks (optional)" value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} />
      <button type="submit" className="btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Add'}</button>
      <button type="button" className="btn-secondary btn-sm" onClick={onCancel}><X size={14} /></button>
    </form>
  );
}

export default function AdminAttendancePage() {
  const { addToast } = useContext(ToastContext);
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    attendanceDate: new Date().toISOString().slice(0, 10),
    subjectCode: '',
    subjectName: '',
    semester: 'Semester 7',
    sessionName: 'Daily',
    remarks: '',
  });
  const [bulkStatuses, setBulkStatuses] = useState({});
  const [bulkSaving, setBulkSaving] = useState(false);
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);

  useEffect(() => {
    api.getStudents().then(setStudents).catch(() => {});
  }, []);

  const loadRecords = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const [recs, sum] = await Promise.all([
        attendanceApi.getByStudent(id),
        attendanceApi.getSummary(id),
      ]);
      setRecords(recs);
      setSummary(sum);
    } catch (err) {
      addToast(err.message || 'Failed to load attendance.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const handleStudentChange = (id) => {
    setSelectedId(id);
    setShowForm(false);
    setRecords([]);
    setSummary(null);
    setSubjects([]);
    setSelectedSubject(null);
    setEnrolledSubjects([]);
    if (id) {
      loadRecords(id);
      subjectApi.getStudentSubjects(id).then((subjectsForStudent) => {
        setEnrolledSubjects(subjectsForStudent);
        setSubjects(subjectsForStudent);
        setBulkForm(current => ({
          ...current,
          subjectCode: subjectsForStudent[0]?.subjectCode || '',
          subjectName: subjectsForStudent[0]?.subjectName || '',
          semester: subjectsForStudent[0]?.semester || '',
        }));
      }).catch(err => addToast(err.message || 'Failed to load enrolled subjects.', 'error', 'Error'));
    }
  };

  const openBulkMode = () => {
    if (!selectedId) {
      addToast('Select a student first so the enrolled semester subjects can be loaded.', 'error', 'Student required');
      return;
    }
    setBulkMode(true);
    setShowForm(false);
    setBulkStatuses(Object.fromEntries(students.map((student) => [student.id, 'PRESENT'])));
  };

  const updateBulkStatus = (studentId, status) => {
    setBulkStatuses((current) => ({ ...current, [studentId]: status }));
  };

  const saveBulkAttendance = async (event) => {
    event.preventDefault();
    const subjectCode = bulkForm.subjectCode.trim().toUpperCase();
    const subjectName = bulkForm.subjectName.trim();
    const semester = bulkForm.semester.trim();
    if (!bulkForm.attendanceDate || !subjectCode || !subjectName || !semester) {
      addToast('Date, subject code, subject name, and semester are required.', 'error', 'Validation');
      return;
    }

    setBulkSaving(true);
    try {
      const selectedStudents = students.filter((student) => bulkStatuses[student.id]);
      await Promise.all(selectedStudents.map((student) => attendanceApi.add({
        studentId: student.id,
        attendanceDate: bulkForm.attendanceDate,
        subjectCode,
        subjectName,
        semester,
        sessionName: bulkForm.sessionName.trim() || 'Daily',
        status: bulkStatuses[student.id],
        remarks: bulkForm.remarks.trim(),
      })));
      addToast(`Attendance saved for ${selectedStudents.length} students.`, 'success', 'Bulk attendance saved');
      setBulkMode(false);
      if (selectedId) loadRecords(selectedId);
    } catch (err) {
      addToast(err.message || 'Some attendance records could not be saved.', 'error', 'Bulk save failed');
    } finally {
      setBulkSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await attendanceApi.delete(id);
      addToast('Record deleted.', 'success', 'Deleted');
      loadRecords(selectedId);
    } catch (err) {
      addToast(err.message || 'Failed to delete.', 'error', 'Error');
    }
  };

  const selectedStudent = students.find(s => String(s.id) === String(selectedId));
  const visibleRecords = selectedSubject
    ? records.filter(record => record.subjectCode === selectedSubject.subjectCode)
    : records;
  const subjectRecords = selectedSubject ? visibleRecords : [];
  const subjectPresent = subjectRecords.filter(record => record.status === 'PRESENT').length;
  const subjectAbsent = subjectRecords.filter(record => record.status === 'ABSENT').length;
  const subjectLate = subjectRecords.filter(record => record.status === 'LATE').length;

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <h2 className="page-title">Attendance Management</h2>
          <p className="page-subtitle">Record and manage student attendance</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-secondary" onClick={() => setBulkMode(!bulkMode)} id="btn-bulk-attendance">
            <Zap size={17} /> {bulkMode ? 'Individual Entry' : 'Bulk Mark Class'}
          </button>
        </div>
      </div>

      {bulkMode && (
        <form className="section-card bulk-attendance-card" onSubmit={saveBulkAttendance}>
          <div className="section-card-header">
            <div>
              <h3><Users size={18} /> Bulk mark attendance</h3>
              <p className="page-subtitle">Set one subject and date, then adjust individual statuses before saving.</p>
            </div>
          </div>
          <div className="bulk-attendance-form">
            <input type="date" className="form-input" value={bulkForm.attendanceDate} onChange={e => setBulkForm({...bulkForm, attendanceDate: e.target.value})} required />
          <select className="select-dropdown" value={bulkForm.subjectCode} onChange={e => {
            const subject = subjects.find(item => item.subjectCode === e.target.value);
            setBulkForm({...bulkForm, subjectCode: subject?.subjectCode || '', subjectName: subject?.subjectName || '', semester: subject?.semester || ''});
          }} required>
            <option value="">Select enrolled subject</option>
            {subjects.map(subject => <option key={subject.subjectCode} value={subject.subjectCode}>{subject.subjectCode} — {subject.subjectName}</option>)}
          </select>
          <input className="form-input" placeholder="Subject name" value={bulkForm.subjectName} readOnly required />
          <input className="form-input" placeholder="Semester" value={bulkForm.semester} readOnly required />
            <input className="form-input" placeholder="Session (optional)" value={bulkForm.sessionName} onChange={e => setBulkForm({...bulkForm, sessionName: e.target.value})} />
            <input className="form-input" placeholder="Remarks (optional)" value={bulkForm.remarks} onChange={e => setBulkForm({...bulkForm, remarks: e.target.value})} />
          </div>
          {subjects.length === 0 && (
            <div className="form-help">
              No enrolled subjects are available for the selected student. Ask the student to register subjects first.
            </div>
          )}
          <div className="bulk-attendance-toolbar">
            <strong>{students.length} students selected</strong>
            <div className="bulk-attendance-actions">
              <button type="button" className="btn-secondary btn-sm" onClick={() => setBulkStatuses(Object.fromEntries(students.map(s => [s.id, 'PRESENT'])))}>All Present</button>
              <button type="button" className="btn-secondary btn-sm" onClick={() => setBulkStatuses(Object.fromEntries(students.map(s => [s.id, 'ABSENT'])))}>All Absent</button>
            </div>
          </div>
          <div className="table-responsive bulk-attendance-table">
            <table className="data-table">
              <thead><tr><th>Student</th><th>Register No.</th><th>Department</th><th>Status</th></tr></thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td>{student.fullName}</td>
                    <td>{student.registerNumber || '—'}</td>
                    <td>{student.department}</td>
                    <td>
                      <select className="select-dropdown" value={bulkStatuses[student.id] || 'PRESENT'} onChange={e => updateBulkStatus(student.id, e.target.value)}>
                        {STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-footer bulk-attendance-footer">
            <button type="button" className="btn-secondary" onClick={() => setBulkMode(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={bulkSaving}>{bulkSaving ? 'Saving attendance…' : `Save ${students.length} Records`}</button>
          </div>
        </form>
      )}

      {/* Student selector */}
      {!bulkMode ? <div className="section-card">
        <div className="student-picker">
          <Search size={16} className="search-icon" />
          <select
            className="select-dropdown student-select"
            value={selectedId}
            onChange={(e) => handleStudentChange(e.target.value)}
            id="select-attendance-student"
          >
            <option value="">— Select a student —</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.fullName} {s.registerNumber ? `(${s.registerNumber})` : ''} — {s.department}
              </option>
            ))}
          </select>
        </div>

        {selectedId && subjects.length > 0 && (
          <div className="subject-attendance-list">
            {subjects.map(subject => (
              <button key={subject.subjectCode} className={`subject-attendance-card ${selectedSubject?.subjectCode === subject.subjectCode ? 'active' : ''}`} onClick={() => { setSelectedSubject(subject); setShowForm(true); }}>
                <BookOpen size={17} />
                <span><strong>{subject.subjectCode}</strong><small>{subject.subjectName}</small><small>{subject.semester}</small></span>
              </button>
            ))}
          </div>
        )}
        {selectedId && subjects.length === 0 && !loading && (
          <div className="form-help">
            No enrolled subjects found for {selectedStudent?.fullName}. Register subjects in the student portal before recording attendance.
          </div>
        )}
        {selectedSubject && (
          <div className="summary-pills subject-summary-pills">
            <span className="pill pill-success">Present: {subjectPresent}</span>
            <span className="pill pill-danger">Absent: {subjectAbsent}</span>
            <span className="pill pill-warning">Late: {subjectLate}</span>
            <span className="pill pill-info">Total: {subjectRecords.length}</span>
            <span className="pill pill-primary">
              Attendance: {subjectRecords.length ? ((subjectPresent / subjectRecords.length) * 100).toFixed(1) : '0.0'}%
            </span>
          </div>
        )}

        {/* Inline add form */}
        {showForm && selectedId && selectedSubject && (
          <div style={{ marginTop: '1rem' }}>
            <AttendanceForm
              studentId={selectedId}
              subject={selectedSubject}
              subjects={enrolledSubjects}
              onSaved={() => { setShowForm(false); loadRecords(selectedId); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}
      </div> : null}

      {/* Records table */}
      {selectedId && (
        <div className="section-card table-card">
          {loading ? (
            <div className="skeleton-list">{[...Array(5)].map((_, i) => <div key={i} className="skeleton-row" />)}</div>
          ) : visibleRecords.length === 0 ? (
            <div className="empty-state">
              <CalendarDays size={40} />
              <p>No attendance records for {selectedStudent?.fullName}.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleRecords.map(r => (
                  <tr key={r.id}>
                    <td>{r.attendanceDate}</td>
                    <td>{r.subjectName || r.subjectCode}</td>
                    <td>
                      <span className={`status-chip ${r.status === 'PRESENT' ? 'chip-success' : r.status === 'LATE' ? 'chip-warning' : 'chip-danger'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>{r.remarks || '—'}</td>
                    <td>
                      <button className="btn-icon danger" title="Delete" onClick={() => handleDelete(r.id)} id={`btn-del-att-${r.id}`}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
