import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function StudentLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const prefilledRegNo = location.state?.registerNumber || '';

  const [regNo, setRegNo] = useState(prefilledRegNo);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.state?.preActivated) {
      // Show a hint they can now log in
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const trimmed = regNo.trim().toUpperCase();
    if (!trimmed || !password) {
      setError('Register number and password are required.'); return;
    }
    setLoading(true);
    try {
      const data = await authApi.studentLogin(trimmed, password);
      login(data.token, { role: 'STUDENT', registerNumber: trimmed, name: data.name });
      navigate('/student', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-blob blob-1" />
      <div className="auth-blob blob-2" />

      <div className="auth-card">
        <Link to="/" className="auth-back-link" id="link-student-login-back">
          <ArrowLeft size={16} /> Back to Portal
        </Link>

        <div className="auth-icon student-icon">
          <BookOpen size={32} />
        </div>
        <h1 className="auth-title">Student Sign In</h1>
        <p className="auth-subtitle">Sign in to view your academic records</p>

        {location.state?.preActivated && (
          <div className="auth-info-banner" role="status">
            ✅ Account activated successfully! You can now sign in.
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && (
            <div className="auth-error" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="s-regnumber" className="form-label">Register Number</label>
            <input
              id="s-regnumber"
              type="text"
              className="form-input"
              placeholder="e.g. CS2024001"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              autoFocus={!prefilledRegNo}
              disabled={loading}
              style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="s-password" className="form-label">Password</label>
            <div className="input-with-icon">
              <input
                id="s-password"
                type={showPw ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
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
          </div>

          <button type="submit" className="btn-auth" id="btn-student-login" disabled={loading}>
            {loading ? <><div className="spinner-small" /> Signing in…</> : 'Sign In'}
          </button>

          <p className="auth-alt-link">
            First time?{' '}
            <Link to="/student/activate" id="link-goto-activate">Activate your account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
