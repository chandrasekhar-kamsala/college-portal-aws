import React, { useEffect, useState, useContext } from 'react';
import { FileText, Printer } from 'lucide-react';
import { studentApi } from '../../services/api';
import { StudentToastContext } from './StudentLayout';
import { useAuth } from '../../context/AuthContext';

export default function StudentHallTicketsPage() {
  const { addToast } = useContext(StudentToastContext);
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const printTickets = () => {
    window.print();
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [loadedTickets, loadedProfile] = await Promise.all([
          studentApi.getHallTickets(),
          studentApi.getProfile(),
        ]);
        setTickets(loadedTickets);
        setProfile(loadedProfile);
      } catch (err) {
        addToast(err.message || 'Failed to load hall tickets.', 'error', 'Error');
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
          <h2 className="page-title">Hall Tickets</h2>
          <p className="page-subtitle">Your examination admission tickets</p>
        </div>
        {tickets.length > 0 && (
          <button className="btn-primary no-print" onClick={printTickets} type="button">
            <Printer size={17} /> Print / Save PDF
          </button>
        )}
      </div>

      {loading ? (
        <div className="skeleton-list">{[...Array(4)].map((_, i) => <div key={i} className="skeleton-row" style={{ height: '7rem' }} />)}</div>
      ) : tickets.length === 0 ? (
        <div className="section-card">
          <div className="empty-state">
            <FileText size={40} />
            <p>No hall tickets issued yet. Contact your administrator.</p>
          </div>
        </div>
      ) : (
        <div className="ticket-grid">
          {tickets.map((t) => (
            <div className="hall-ticket-card" key={t.id}>
              <div className="hall-ticket-header">
                <div>
                  <div className="hall-ticket-exam">{t.examName}</div>
                  <div className="hall-ticket-meta">
                    {profile?.fullName || user?.name || user?.registerNumber} &bull; {profile?.registerNumber || user?.registerNumber}
                  </div>
                </div>
                <span className="status-chip chip-success">
                  ✓ Published
                </span>
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
                <span className="hall-ticket-id">Ticket #{t.id}</span>
              </div>
              <table className="hall-ticket-print-table">
                <tbody>
                  <tr><th colSpan="2">College Portal - Examination Hall Ticket</th></tr>
                  <tr>
                    <th>Student Photo</th>
                    <td>{profile?.photoData ? <img className="hall-ticket-print-photo" src={profile.photoData} alt="Student" /> : '—'}</td>
                  </tr>
                  <tr><th>Student Name</th><td>{profile?.fullName || user?.name || t.studentName || '—'}</td></tr>
                  <tr><th>Register Number</th><td>{profile?.registerNumber || user?.registerNumber || t.registerNumber || '—'}</td></tr>
                  <tr><th>Examination</th><td>{t.examName || '—'}</td></tr>
                  <tr><th>Hall Ticket Number</th><td>{t.hallTicketNumber || '—'}</td></tr>
                  <tr><th>Exam Date</th><td>{t.examDate || '—'}</td></tr>
                  <tr><th>Exam Center</th><td>{t.examCenter || '—'}</td></tr>
                  <tr><th>Semester</th><td>{t.semester || '—'}</td></tr>
                  <tr><th>Academic Year</th><td>{t.academicYear || '—'}</td></tr>
                  <tr><th>Instructions</th><td>{t.instructions || '—'}</td></tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
