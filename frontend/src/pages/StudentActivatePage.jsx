import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Step A: enter register number
// Step B: set password (first-time)
// Step C: already active → redirect to login

const MIN_PW = 8;

export default function StudentActivatePage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState('check'); // 'check' | 'setPassword' | 'done'
  const [regNo, setRegNo] = useState('');
  const [studentName, setStudentName] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ─── Step 1: Check register number ──────────────────────────────────────────
  const handleCheckStatus = async (e) => {
    e.preventDefault();
    setError('');
    const trimmed = regNo.trim().toUpperCase();
    if (!trimmed) { setError('Register number is required.'); return; }
    setLoading(true);
    try {
      const data = await authApi.studentCheckStatus(trimmed);
      setRegNo(trimmed);
      setStudentName(data.fullName || '');
      if (data.activated) {
        // Already activated → go to login
        navigate('/student/login', { state: { registerNumber: trimmed, preActivated: true } });
      } else {
        setStep('setPassword');
      }
    } catch (err) {
      setError(err.message || 'Register number not found. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Set password ────────────────────────────────────────────────────
  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < MIN_PW) {
      setError(`Password must be at least ${MIN_PW} characters.`); return;
    }
    if (password !== confirmPw) {
      setError('Passwords do not match.'); return;
    }
    setLoading(true);
    try {
      const data = await authApi.studentSetPassword(regNo, password, confirmPw);
      // Auto-login after activation
      login(data.token, {
        role: 'STUDENT',
        registerNumber: regNo,
        name: data.fullName,
        studentId: data.studentId,
      });
      navigate('/student', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to set password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = password.length === 0 ? null
    : password.length < MIN_PW ? 'weak'
    : password.length < 12 ? 'medium'
    : 'strong';

  return (
    <div className="auth-page">
      <div className="auth-blob blob-1" />
      <div className="auth-blob blob-2" />

      <div className="auth-card">
        <Link to="/" className="auth-back-link" id="link-activate-back">
          <ArrowLeft size={16} /> Back to Portal
        </Link>

        <div className="auth-icon student-icon">
          <BookOpen size={32} />
        </div>

        {step === 'check' ? (
          <>
            <h1 className="auth-title">Activate Student Account</h1>
            <p className="auth-subtitle">Enter your college register number to get started</p>

            <form onSubmit={handleCheckStatus} className="auth-form" noValidate>
              {error && (
                <div className="auth-error" role="alert">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
              <div className="form-group">
                <label htmlFor="student-regnumber" className="form-label">Register Number</label>
                <input
                  id="student-regnumber"
                  type="text"
                  className="form-input"
                  placeholder="e.g. CS2024001"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  autoFocus
                  disabled={loading}
                  style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
              </div>
              <button type="submit" className="btn-auth" id="btn-check-register" disabled={loading}>
                {loading ? <><div className="spinner-small" /> Checking…</> : 'Continue'}
              </button>
              <p className="auth-alt-link">
                Already activated?{' '}
                <Link to="/student/login" id="link-goto-student-login">Sign in here</Link>
              </p>
            </form>
          </>
        ) : (
          <>
            <div className="auth-success-row">
              <CheckCircle2 size={20} color="var(--success)" />
              <span>Found: <strong>{studentName}</strong> ({regNo})</span>
            </div>
            <h1 className="auth-title">Set Your Password</h1>
            <p className="auth-subtitle">Create a secure password to activate your account</p>

            <form onSubmit={handleSetPassword} className="auth-form" noValidate>
              {error && (
                <div className="auth-error" role="alert">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
              <div className="form-group">
                <label htmlFor="new-password" className="form-label">New Password</label>
                <div className="input-with-icon">
                  <input
                    id="new-password"
                    type={showPw ? 'text' : 'password'}
                    className="form-input"
                    placeholder={`At least ${MIN_PW} characters`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="input-eye-btn"
                    onClick={() => setShowPw(!showPw)}
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {pwStrength && (
                  <div className="pw-strength-bar">
                    <div className={`pw-strength-fill pw-${pwStrength}`} />
                    <span className="pw-strength-label">{pwStrength}</span>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="confirm-password" className="form-label">Confirm Password</label>
                <input
                  id="confirm-password"
                  type={showPw ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Re-enter your password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  disabled={loading}
                />
              </div>
              <button type="submit" className="btn-auth" id="btn-set-password" disabled={loading}>
                {loading ? <><div className="spinner-small" /> Activating…</> : 'Activate & Sign In'}
              </button>
              <button
                type="button"
                className="btn-auth btn-auth-ghost"
                onClick={() => { setStep('check'); setError(''); setPassword(''); setConfirmPw(''); }}
              >
                ← Change Register Number
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
