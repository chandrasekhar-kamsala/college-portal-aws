import React, { useEffect, useState, useContext, useCallback } from 'react';
import { PlusCircle, Trash2, BookMarked, Search, X } from 'lucide-react';
import { api, marksApi, subjectApi } from '../../services/api';
import { ToastContext } from './AdminLayout';

const EXAM_TYPES = ['MID_TERM', 'END_TERM', 'ASSIGNMENT', 'PRACTICAL', 'QUIZ'];

function MarkForm({ studentId, student, subjects, onSaved, onCancel }) {
  const { addToast } = useContext(ToastContext);
  const [form, setForm] = useState({ subjectCode: subjects[0]?.subjectCode || '', subjectName: subjects[0]?.subjectName || '', examType: 'MID_TERM', score: '', maxScore: '100', credits: String(subjects[0]?.credits || 3), semester: subjects[0]?.semester || student?.semester || '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const score = parseFloat(form.score);
    const maxScore = parseFloat(form.maxScore);
    const credits = parseInt(form.credits, 10);
    if (!form.subjectCode.trim() || !form.subjectName.trim() || !form.semester.trim() || isNaN(score) || isNaN(maxScore) || isNaN(credits)) {
      addToast('Subject code, subject name, semester, marks, and credits are required.', 'error', 'Validation'); return;
    }
    if (score < 0 || score > maxScore) {
      addToast(`Score must be between 0 and ${maxScore}.`, 'error', 'Validation'); return;
    }
    setSaving(true);
    try {
      await marksApi.add({ studentId, subjectCode: form.subjectCode.trim().toUpperCase(), subjectName: form.subjectName.trim(), examType: form.examType, score, maxScore, credits, semester: form.semester.trim() });
      addToast('Mark record added.', 'success', 'Saved');
      onSaved();
    } catch (err) {
      addToast(err.message || 'Failed to save.', 'error', 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <select className="select-dropdown" value={form.subjectCode} onChange={e => {
        const subject = subjects.find(item => item.subjectCode === e.target.value);
        if (!subject) return;
        setForm({...form, subjectCode: subject.subjectCode, subjectName: subject.subjectName, credits: String(subject.credits), semester: subject.semester});
      }} required>
        <option value="">Select enrolled subject</option>
        {subjects.map(subject => <option key={subject.id} value={subject.subjectCode}>{subject.subjectCode} — {subject.subjectName}</option>)}
      </select>
      <select className="select-dropdown" value={form.examType} onChange={e => setForm({...form, examType: e.target.value})}>
        {EXAM_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
      </select>
      <input type="number" className="form-input form-input-sm" placeholder="Score" min="0" value={form.score} onChange={e => setForm({...form, score: e.target.value})} required />
      <input type="number" className="form-input form-input-sm" placeholder="Max score" min="1" value={form.maxScore} onChange={e => setForm({...form, maxScore: e.target.value})} required />
      <input type="number" className="form-input form-input-sm" placeholder="Credits" value={form.credits} readOnly required />
      <input type="text" className="form-input form-input-sm" placeholder="Semester" value={form.semester} readOnly required />
      <button type="submit" className="btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Add'}</button>
      <button type="button" className="btn-secondary btn-sm" onClick={onCancel}><X size={14} /></button>
    </form>
  );
}

function gradeFor(pct) {
  if (pct >= 90) return { g: 'O', cls: 'chip-success' };
  if (pct >= 80) return { g: 'A+', cls: 'chip-success' };
  if (pct >= 70) return { g: 'A', cls: 'chip-success' };
  if (pct >= 60) return { g: 'B+', cls: 'chip-info' };
  if (pct >= 50) return { g: 'B', cls: 'chip-info' };
  if (pct >= 40) return { g: 'C', cls: 'chip-warning' };
  return { g: 'F', cls: 'chip-danger' };
}

export default function AdminMarksPage() {
  const { addToast } = useContext(ToastContext);
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    api.getStudents().then(setStudents).catch(() => {});
  }, []);

  const loadMarks = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      setMarks(await marksApi.getByStudent(id));
    } catch (err) {
      addToast(err.message || 'Failed to load marks.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const handleStudentChange = (id) => {
    setSelectedId(id);
    setShowForm(false);
    setMarks([]);
    setEnrolledSubjects([]);
    if (id) {
      loadMarks(id);
      subjectApi.getStudentSubjects(id).then(setEnrolledSubjects).catch(err => addToast(err.message || 'Failed to load enrolled subjects.', 'error', 'Error'));
    }
  };

  const handleDelete = async (id) => {
    try {
      await marksApi.delete(id);
      addToast('Mark deleted.', 'success', 'Deleted');
      loadMarks(selectedId);
    } catch (err) {
      addToast(err.message || 'Failed to delete.', 'error', 'Error');
    }
  };

  const selectedStudent = students.find(s => String(s.id) === String(selectedId));
  const filteredStudents = students.filter((student) => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) return true;
    return [student.fullName, student.registerNumber, student.department, student.email]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <h2 className="page-title">Marks Management</h2>
          <p className="page-subtitle">Record examination marks and view grades</p>
        </div>
        <div className="page-header-actions">
          {selectedId && (
            <button className="btn-primary" onClick={() => setShowForm(!showForm)} id="btn-add-mark">
              <PlusCircle size={17} /> Add Mark
            </button>
          )}
        </div>
      </div>

      <div className="section-card">
        <div className="student-picker">
          <Search size={16} className="search-icon" />
          <input
            type="search"
            className="form-input student-search-input"
            placeholder="Search student by name or register number"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            aria-label="Search students"
          />
          <select
            className="select-dropdown student-select"
            value={selectedId}
            onChange={(e) => handleStudentChange(e.target.value)}
            id="select-marks-student"
          >
            <option value="">— Select a student —</option>
            {filteredStudents.map(s => (
              <option key={s.id} value={s.id}>
                {s.fullName} {s.registerNumber ? `(${s.registerNumber})` : ''} — {s.department}
              </option>
            ))}
          </select>
        </div>

        {showForm && selectedId && (
          <div style={{ marginTop: '1rem' }}>
            <MarkForm
              studentId={selectedId}
              student={selectedStudent}
              subjects={enrolledSubjects}
              onSaved={() => { setShowForm(false); loadMarks(selectedId); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}
      </div>

      {selectedId && (
        <div className="section-card table-card">
          {loading ? (
            <div className="skeleton-list">{[...Array(5)].map((_, i) => <div key={i} className="skeleton-row" />)}</div>
          ) : marks.length === 0 ? (
            <div className="empty-state">
              <BookMarked size={40} />
              <p>No marks recorded for {selectedStudent?.fullName}.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Exam Type</th>
                  <th>Sem</th>
                  <th>Marks</th>
                  <th>%</th>
                  <th>Grade</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {marks.map(m => {
                  const pct = m.maxScore > 0 ? (m.score / m.maxScore) * 100 : 0;
                  const { g, cls } = gradeFor(pct);
                  return (
                    <tr key={m.id}>
                      <td>{m.subjectName || m.subjectCode}</td>
                      <td><span className="pill pill-info">{m.examType?.replace('_', ' ')}</span></td>
                      <td>{m.semester || '—'}</td>
                      <td>{m.score} / {m.maxScore}</td>
                      <td>{pct.toFixed(1)}%</td>
                      <td><span className={`status-chip ${cls}`}>{g}</span></td>
                      <td>
                        <button className="btn-icon danger" title="Delete" onClick={() => handleDelete(m.id)} id={`btn-del-mark-${m.id}`}>
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
