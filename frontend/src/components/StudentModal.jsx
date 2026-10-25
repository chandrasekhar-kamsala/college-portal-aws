import React, { useState, useEffect } from 'react';
import { X, Save, UserPlus, AlertCircle } from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
  'Business Administration',
  'Data Science',
];

const ACADEMIC_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Graduate',
];

export default function StudentModal({
  isOpen,
  onClose,
  onSubmit,
  student, // null if Add mode, student object if Edit mode
}) {
  const isEdit = Boolean(student);

  const [formData, setFormData] = useState({
    registerNumber: '',
    fullName: '',
    email: '',
    department: 'Computer Science',
    academicYear: '1st Year',
    semester: 'Semester 7',
    phoneNumber: '',
    photoData: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (student) {
      setFormData({
        registerNumber: student.registerNumber || '',
        fullName: student.fullName || '',
        email: student.email || '',
        department: student.department || 'Computer Science',
        academicYear: student.academicYear || '1st Year',
        semester: student.semester || '',
        phoneNumber: student.phoneNumber || '',
        photoData: student.photoData || '',
      });
    } else {
      setFormData({
        registerNumber: '',
        fullName: '',
        email: '',
        department: 'Computer Science',
        academicYear: '1st Year',
        semester: 'Semester 7',
        phoneNumber: '',
        photoData: '',
      });
    }
    setErrors({});
    setServerError('');
  }, [student, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.registerNumber.trim()) {
      newErrors.registerNumber = 'College register number is required';
    } else if (formData.registerNumber.trim().length < 3) {
      newErrors.registerNumber = 'Register number must be at least 3 characters';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.academicYear.trim()) {
      newErrors.academicYear = 'Academic year is required';
    }

    if (!formData.semester.trim()) {
      newErrors.semester = 'Semester is required';
    }

    if (formData.phoneNumber && formData.phoneNumber.trim().length > 0) {
      if (!/^[+0-9\s\-().]{7,25}$/.test(formData.phoneNumber.trim())) {
        newErrors.phoneNumber = 'Please provide a valid phone number format (e.g. +1-555-0192)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        registerNumber: formData.registerNumber.trim().toUpperCase(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        department: formData.department.trim(),
        academicYear: formData.academicYear.trim(),
        semester: formData.semester.trim() || null,
        phoneNumber: formData.phoneNumber.trim() || null,
        photoData: formData.photoData || null,
      });
      onClose();
    } catch (err) {
      setServerError(err.message || 'An error occurred while saving student record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-student-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title" id="modal-student-title">
            {isEdit ? 'Edit Student Details' : 'Enroll New Student'}
          </h3>
          <button
            className="btn-icon"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close dialog"
            id="btn-close-modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {serverError && (
              <div
                style={{
                  backgroundColor: 'var(--danger-light)',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  color: '#fecdd3',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={18} color="var(--danger)" />
                <span>{serverError}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="student-registerNumber" className="form-label">
                College Register Number <span className="required">*</span>
              </label>
              <input
                id="student-registerNumber"
                type="text"
                className={`form-input ${errors.registerNumber ? 'error' : ''}`}
                placeholder="e.g. CSE2026001"
                value={formData.registerNumber}
                onChange={(e) => {
                  setFormData({ ...formData, registerNumber: e.target.value.toUpperCase() });
                  if (errors.registerNumber) setErrors({ ...errors, registerNumber: null });
                }}
                disabled={submitting}
                autoFocus={!isEdit}
              />
              {errors.registerNumber && <span className="form-error">{errors.registerNumber}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="student-fullName" className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                id="student-fullName"
                type="text"
                className={`form-input ${errors.fullName ? 'error' : ''}`}
                placeholder="e.g. Alexander Hamilton"
                value={formData.fullName}
                onChange={(e) => {
                  setFormData({ ...formData, fullName: e.target.value });
                  if (errors.fullName) setErrors({ ...errors, fullName: null });
                }}
                disabled={submitting}
                autoFocus={isEdit}
              />
              {errors.fullName && <span className="form-error">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="student-email" className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <input
                id="student-email"
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="e.g. alexander@college.edu"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                disabled={submitting}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="student-department" className="form-label">
                Department <span className="required">*</span>
              </label>
              <select
                id="student-department"
                className={`select-dropdown ${errors.department ? 'error' : ''}`}
                style={{ width: '100%' }}
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                disabled={submitting}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && <span className="form-error">{errors.department}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="student-academicYear" className="form-label">
                Academic Year <span className="required">*</span>
              </label>
              <select
                id="student-academicYear"
                className={`select-dropdown ${errors.academicYear ? 'error' : ''}`}
                style={{ width: '100%' }}
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                disabled={submitting}
              >
                {ACADEMIC_YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
              {errors.academicYear && <span className="form-error">{errors.academicYear}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="student-semester" className="form-label">
                Semester <span className="required">*</span>
              </label>
              <input
                id="student-semester"
                type="text"
                className={`form-input ${errors.semester ? 'error' : ''}`}
                placeholder="e.g. Semester 1"
                value={formData.semester}
                onChange={(e) => {
                  setFormData({ ...formData, semester: e.target.value });
                  if (errors.semester) setErrors({ ...errors, semester: null });
                }}
                disabled={submitting}
              />
              {errors.semester && <span className="form-error">{errors.semester}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="student-phone" className="form-label">
                Phone Number <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
              </label>
              <input
                id="student-phone"
                type="tel"
                className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                placeholder="e.g. +1-555-0192"
                value={formData.phoneNumber}
                onChange={(e) => {
                  setFormData({ ...formData, phoneNumber: e.target.value });
                  if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: null });
                }}
                disabled={submitting}
              />
              {errors.phoneNumber && <span className="form-error">{errors.phoneNumber}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="student-photo" className="form-label">
                Student Photo <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional, JPG/PNG/WEBP up to 3 MB)</span>
              </label>
              <input
                id="student-photo"
                type="file"
                className={`form-input ${errors.photoData ? 'error' : ''}`}
                accept="image/jpeg,image/png,image/webp"
                disabled={submitting}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 3 * 1024 * 1024) {
                    setErrors({ ...errors, photoData: 'Photo must be smaller than 3 MB' });
                    e.target.value = '';
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => {
                    setFormData({ ...formData, photoData: reader.result });
                    setErrors({ ...errors, photoData: null });
                  };
                  reader.onerror = () => setErrors({ ...errors, photoData: 'Unable to read this photo' });
                  reader.readAsDataURL(file);
                }}
              />
              {formData.photoData && (
                <img className="student-photo-preview" src={formData.photoData} alt="Student preview" />
              )}
              {errors.photoData && <span className="form-error">{errors.photoData}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
              id="btn-cancel-student"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              id="btn-submit-student"
            >
              {submitting ? (
                <>
                  <div className="spinner-small" />
                  <span>Saving...</span>
                </>
              ) : isEdit ? (
                <>
                  <Save size={16} />
                  <span>Update Student</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Save Student</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
