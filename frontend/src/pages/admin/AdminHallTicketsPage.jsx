import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import { PlusCircle, Trash2, FileText, Search, X, Download } from 'lucide-react';
import { api, hallTicketApi } from '../../services/api';
import { ToastContext } from './AdminLayout';

function HallTicketForm({ studentId, student, onSaved, onCancel }) {
  const { addToast } = useContext(ToastContext);
  const [form, setForm] = useState({ hallTicketNumber: '', examName: '', examDate: '', examCenter: '', semester: student?.semester || '', academicYear: student?.academicYear || '', instructions: '', published: true });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.hallTicketNumber.trim() || !form.examName.trim() || !form.examDate || !form.examCenter.trim() || !form.semester.trim() || !form.academicYear.trim()) {
      addToast('Hall ticket number, exam name, date, center, semester, and academic year are required.', 'error', 'Validation'); return;
    }
    setSaving(true);
    try {
      await hallTicketApi.generate({
        studentId,
        hallTicketNumber: form.hallTicketNumber.trim(),
        examName: form.examName.trim(),
        examDate: form.examDate,
        examCenter: form.examCenter.trim(),
        semester: form.semester.trim(),
        academicYear: form.academicYear.trim(),
        instructions: form.instructions.trim() || null,
        published: form.published,
      });
      addToast('Hall ticket generated.', 'success', 'Generated');
      onSaved();
    } catch (err) {
      addToast(err.message || 'Failed to generate.', 'error', 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="inline-form inline-form-wrap" onSubmit={handleSubmit}>
      <input type="text" className="form-input" placeholder="Hall ticket number" value={form.hallTicketNumber} onChange={e => setForm({...form, hallTicketNumber: e.target.value})} required />
      <input type="text" className="form-input" placeholder="Exam Name" value={form.examName} onChange={e => setForm({...form, examName: e.target.value})} required />
      <input type="date" className="form-input" value={form.examDate} onChange={e => setForm({...form, examDate: e.target.value})} required />
      <input type="text" className="form-input" placeholder="Exam center" value={form.examCenter} onChange={e => setForm({...form, examCenter: e.target.value})} required />
      <input type="text" className="form-input form-input-sm" placeholder="Semester" value={form.semester} onChange={e => setForm({...form, semester: e.target.value})} required />
      <input type="text" className="form-input form-input-sm" placeholder="Academic year" value={form.academicYear} onChange={e => setForm({...form, academicYear: e.target.value})} required />
      <input type="text" className="form-input" placeholder="Instructions" value={form.instructions} onChange={e => setForm({...form, instructions: e.target.value})} />
      <label className="publish-option">
        <input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} />
        Publish for students
      </label>
      <button type="submit" className="btn-primary btn-sm" disabled={saving}>{saving ? 'Generating…' : 'Generate'}</button>
      <button type="button" className="btn-secondary btn-sm" onClick={onCancel}><X size={14} /></button>
    </form>
  );
}

export default function AdminHallTicketsPage() {
  const { addToast } = useContext(ToastContext);
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const ticketsSectionRef = useRef(null);

  useEffect(() => {
    api.getStudents().then(setStudents).catch(() => {});
  }, []);

  const loadTickets = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      setTickets(await hallTicketApi.getByStudent(id));
    } catch (err) {
      addToast(err.message || 'Failed to load hall tickets.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const handleStudentChange = (id) => {
    setSelectedId(id);
    setShowForm(false);
    setTickets([]);
    if (id) loadTickets(id);
  };

  const handleTicketSaved = () => {
    setShowForm(false);
    loadTickets(selectedId).then(() => {
      window.requestAnimationFrame(() => {
        ticketsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  const handleDelete = async (id) => {
    try {
      await hallTicketApi.delete(id);
      addToast('Hall ticket deleted.', 'success', 'Deleted');
      loadTickets(selectedId);
    } catch (err) {
      addToast(err.message || 'Failed to delete.', 'error', 'Error');
    }
  };

  const handlePublish = async (ticket) => {
    try {
      await hallTicketApi.publish(ticket.id, !ticket.published);
      addToast(ticket.published ? 'Hall ticket hidden from student view.' : 'Hall ticket published for the student.', 'success', 'Updated');
      loadTickets(selectedId);
    } catch (err) {
      addToast(err.message || 'Failed to update hall ticket visibility.', 'error', 'Error');
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
          <h2 className="page-title">Hall Tickets</h2>
          <p className="page-subtitle">Generate and manage examination hall tickets</p>
        </div>
        <div className="page-header-actions">
          {selectedId && (
            <button className="btn-primary" onClick={() => setShowForm(!showForm)} id="btn-generate-ticket">
              <PlusCircle size={17} /> Generate Ticket
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
            id="select-ticket-student"
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
            <HallTicketForm
              studentId={selectedId}
              student={selectedStudent}
              onSaved={handleTicketSaved}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}
      </div>

      {selectedId && (
        <div className="section-card hall-tickets-section" ref={ticketsSectionRef}>
          {loading ? (
            <div className="skeleton-list">{[...Array(4)].map((_, i) => <div key={i} className="skeleton-row" />)}</div>
          ) : tickets.length === 0 ? (
            <div className="empty-state">
              <FileText size={40} />
              <p>No hall tickets for {selectedStudent?.fullName}.</p>
            </div>
          ) : (
            <div className="ticket-grid">
              {tickets.map(t => (
                <div className="hall-ticket-card" key={t.id}>
                  <div className="hall-ticket-header">
                    <div>
                      <div className="hall-ticket-exam">{t.examName}</div>
                      <div className="hall-ticket-meta">
                        {selectedStudent?.fullName} &bull; {selectedStudent?.registerNumber || 'N/A'}
                      </div>
                    </div>
                    <button className="btn-icon danger" onClick={() => handleDelete(t.id)} title="Delete" id={`btn-del-ticket-${t.id}`}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="hall-ticket-details">
                    <span><strong>Date:</strong> {t.examDate}</span>
                    {t.examCenter && <span><strong>Exam center:</strong> {t.examCenter}</span>}
                    {t.semester && <span><strong>Semester:</strong> {t.semester}</span>}
                  </div>
                  {t.instructions && (
                    <p className="hall-ticket-instructions">{t.instructions}</p>
                  )}
                  <div className="hall-ticket-footer">
                    <span className={`status-chip ${t.published ? 'chip-success' : 'chip-warning'}`}>
                      {t.published ? 'Published' : 'Hidden'}
                    </span>
                    <button className="btn-secondary btn-sm" onClick={() => handlePublish(t)}>
                      {t.published ? 'Hide' : 'Publish'}
                    </button>
                    <span className="hall-ticket-id">#{t.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
