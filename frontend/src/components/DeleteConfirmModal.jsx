import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, student }) {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !student) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm(student.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-delete-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !deleting) onClose();
      }}
    >
      <div className="modal-content" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                backgroundColor: 'var(--danger-light)',
                color: 'var(--danger)',
                padding: '0.4rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <h3 className="modal-title" id="modal-delete-title">
              Delete Student Record
            </h3>
          </div>
          <button className="btn-icon" onClick={onClose} disabled={deleting} aria-label="Cancel">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
            Are you sure you want to permanently delete the student record for:
          </p>
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
            }}
          >
            <div style={{ fontWeight: 700, color: '#ffffff' }}>{student.fullName}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {student.email} • ID: STU-{String(student.id).padStart(4, '0')}
            </div>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            This action cannot be undone and will permanently remove this record from MySQL.
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={deleting}
            id="btn-cancel-delete"
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={handleDelete}
            disabled={deleting}
            id="btn-confirm-delete"
          >
            {deleting ? (
              <>
                <div className="spinner-small" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Delete Permanently</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
