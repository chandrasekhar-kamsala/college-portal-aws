import React, { useEffect, useState, useContext } from 'react';
import { BookOpen, Check, Plus, Trash2 } from 'lucide-react';
import { studentApi } from '../../services/api';
import { StudentToastContext } from './StudentLayout';
import { useAuth } from '../../context/AuthContext';

const SEMESTERS = Array.from({ length: 8 }, (_, index) => `Semester ${index + 1}`);

export default function StudentSubjectsPage() {
  const { addToast } = useContext(StudentToastContext);
  const { user } = useAuth();
  const [semester, setSemester] = useState(user?.semester || 'Semester 7');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      setSubjects(await studentApi.getSubjectCatalog(semester));
    } catch (err) {
      addToast(err.message || 'Failed to load subjects.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSubjects(); }, [semester]);

  const updateEnrollment = async (subject) => {
    setSavingId(subject.id);
    try {
      if (subject.enrolled) await studentApi.unenrollSubject(subject.id);
      else await studentApi.enrollSubject(subject.id);
      await loadSubjects();
      addToast(subject.enrolled ? 'Subject removed.' : 'Subject enrolled successfully.', 'success', 'Subjects updated');
    } catch (err) {
      addToast(err.message || 'Failed to update enrollment.', 'error', 'Error');
    } finally {
      setSavingId(null);
    }
  };

  const enrolledCount = subjects.filter(subject => subject.enrolled).length;

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <h2 className="page-title">Subject Registration</h2>
          <p className="page-subtitle">Choose your semester and enroll in the subjects you are studying.</p>
        </div>
        <div className="subject-semester-control">
          <label htmlFor="student-subject-semester">Semester</label>
          <select id="student-subject-semester" className="select-dropdown" value={semester} onChange={e => setSemester(e.target.value)}>
            {SEMESTERS.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
      </div>

      <div className="section-card subject-registration-summary">
        <BookOpen size={20} />
        <span><strong>{enrolledCount}</strong> subjects enrolled for {semester}</span>
      </div>

      {loading ? (
        <div className="skeleton-list">{[...Array(4)].map((_, i) => <div key={i} className="skeleton-row" />)}</div>
      ) : subjects.length === 0 ? (
        <div className="section-card empty-state"><BookOpen size={40} /><p>No subjects are available for this semester.</p></div>
      ) : (
        <div className="subject-registration-grid">
          {subjects.map(subject => (
            <div className={`subject-registration-card ${subject.enrolled ? 'enrolled' : ''}`} key={subject.id}>
              <div className="subject-registration-icon"><BookOpen size={20} /></div>
              <div className="subject-registration-info">
                <strong>{subject.subjectCode}</strong>
                <span>{subject.subjectName}</span>
                <small>{subject.credits} credits · {subject.semester}</small>
              </div>
              <button className={subject.enrolled ? 'btn-secondary btn-sm' : 'btn-primary btn-sm'} onClick={() => updateEnrollment(subject)} disabled={savingId === subject.id}>
                {subject.enrolled ? <><Trash2 size={14} /> Drop</> : <><Plus size={14} /> Enroll</>}
              </button>
              {subject.enrolled && <span className="subject-enrolled-badge"><Check size={13} /> Enrolled</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
