import React, { useEffect, useState, useContext } from 'react';
import { BookMarked } from 'lucide-react';
import { studentApi } from '../../services/api';
import { StudentToastContext } from './StudentLayout';

function gradeFor(pct) {
  if (pct >= 90) return { g: 'O',  cls: 'chip-success' };
  if (pct >= 80) return { g: 'A+', cls: 'chip-success' };
  if (pct >= 70) return { g: 'A',  cls: 'chip-success' };
  if (pct >= 60) return { g: 'B+', cls: 'chip-info' };
  if (pct >= 50) return { g: 'B',  cls: 'chip-info' };
  if (pct >= 40) return { g: 'C',  cls: 'chip-warning' };
  return { g: 'F', cls: 'chip-danger' };
}

export default function StudentMarksPage() {
  const { addToast } = useContext(StudentToastContext);
  const [marks, setMarks] = useState([]);
  const [semResults, setSemResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('marks');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [m, s] = await Promise.all([studentApi.getMarks(), studentApi.getSemesterResults()]);
        setMarks(m);
        setSemResults(s);
      } catch (err) {
        addToast(err.message || 'Failed to load marks.', 'error', 'Error');
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
          <h2 className="page-title">Marks & Results</h2>
          <p className="page-subtitle">View your examination marks and semester GPA</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === 'marks' ? 'active' : ''}`}
          onClick={() => setActiveTab('marks')}
          id="tab-marks"
        >
          Examination Marks
        </button>
        <button
          className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
          id="tab-results"
        >
          Semester Results
        </button>
      </div>

      <div className="section-card table-card">
        {loading ? (
          <div className="skeleton-list">{[...Array(6)].map((_, i) => <div key={i} className="skeleton-row" />)}</div>
        ) : activeTab === 'marks' ? (
          marks.length === 0 ? (
            <div className="empty-state">
              <BookMarked size={40} />
              <p>No marks recorded yet.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Exam Type</th>
                  <th>Semester</th>
                  <th>Marks</th>
                  <th>%</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {marks.map((m) => {
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : (
          semResults.length === 0 ? (
            <div className="empty-state">
              <BookMarked size={40} />
              <p>No semester results yet.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Semester</th>
                  <th>GPA</th>
                  <th>Marks Obtained</th>
                  <th>Max Marks</th>
                  <th>Percentage</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {semResults.map((r) => (
                  <tr key={r.semester}>
                    <td><strong>Semester {r.semester}</strong></td>
                    <td><strong>{r.gpa?.toFixed(2)}</strong></td>
                    <td>{r.totalMarksObtained}</td>
                    <td>{r.totalMaxMarks}</td>
                    <td>{r.percentage?.toFixed(1)}%</td>
                    <td>
                      <span className={`status-chip ${r.passed ? 'chip-success' : 'chip-danger'}`}>
                        {r.passed ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}
