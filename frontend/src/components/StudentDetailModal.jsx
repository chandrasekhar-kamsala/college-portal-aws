import React from 'react';
import { X, Edit2, Mail, Phone, Building2, Calendar, Clock, Award } from 'lucide-react';

export default function StudentDetailModal({ isOpen, onClose, student, onEdit }) {
  if (!isOpen || !student) return null;

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-detail-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="id-badge">
              STU-{String(student.id).padStart(4, '0')}
            </span>
            <h3 className="modal-title" id="modal-detail-title">
              Student Profile
            </h3>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Avatar Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div
              className="avatar-circle"
              style={{ width: '56px', height: '56px', fontSize: '1.25rem' }}
            >
              {student.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                {student.fullName}
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {student.department} • {student.academicYear}
              </p>
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">
                <Mail size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Email Address
              </span>
              <a
                href={`mailto:${student.email}`}
                className="detail-value"
                style={{ color: '#818cf8' }}
              >
                {student.email}
              </a>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                <Phone size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Phone Number
              </span>
              <span className="detail-value">{student.phoneNumber || 'Not provided'}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                <Building2 size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Faculty Department
              </span>
              <span className="detail-value">{student.department}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                <Award size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Academic Standing
              </span>
              <span className="detail-value">{student.academicYear}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Enrollment Date
              </span>
              <span className="detail-value">{formatDate(student.createdAt)}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                <Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Last Record Update
              </span>
              <span className="detail-value">{formatDate(student.updatedAt)}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} id="btn-close-detail">
            Close
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              onClose();
              onEdit(student);
            }}
            id="btn-edit-from-detail"
          >
            <Edit2 size={16} />
            <span>Edit Information</span>
          </button>
        </div>
      </div>
    </div>
  );
}
