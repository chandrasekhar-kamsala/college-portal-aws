import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, BookOpen, ArrowRight, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Animated background blobs */}
      <div className="landing-blob blob-1" />
      <div className="landing-blob blob-2" />
      <div className="landing-blob blob-3" />

      <div className="landing-inner">
        {/* Hero */}
        <div className="landing-hero">
          <div className="landing-logo">
            <GraduationCap size={48} />
          </div>
          <h1 className="landing-title">College Portal</h1>
          <p className="landing-subtitle">
            Higher Education Information Management System
          </p>
          <div className="landing-badges">
            <span className="landing-badge"><Star size={13} /> Spring Boot 3</span>
            <span className="landing-badge"><Star size={13} /> React 18</span>
            <span className="landing-badge"><Star size={13} /> MySQL 8</span>
            <span className="landing-badge"><Star size={13} /> Docker</span>
          </div>
        </div>

        {/* Portal selection cards */}
        <div className="portal-cards">
          <Link to="/admin/login" className="portal-card admin-card" id="btn-goto-admin">
            <div className="portal-card-icon">
              <ShieldCheck size={36} />
            </div>
            <div className="portal-card-content">
              <h2>Admin Portal</h2>
              <p>Manage students, attendance, marks, grades, and hall tickets. Full administrative access.</p>
            </div>
            <div className="portal-card-arrow">
              <ArrowRight size={22} />
            </div>
          </Link>

          <Link to="/student/activate" className="portal-card student-card" id="btn-goto-student-activate">
            <div className="portal-card-icon">
              <BookOpen size={36} />
            </div>
            <div className="portal-card-content">
              <h2>Student Portal</h2>
              <p>View your profile, attendance, marks, semester results, and hall tickets.</p>
            </div>
            <div className="portal-card-arrow">
              <ArrowRight size={22} />
            </div>
          </Link>
        </div>

        <p className="landing-already-login">
          Already have a student account?{' '}
          <Link to="/student/login" id="link-student-login">Sign in here</Link>
        </p>

        <footer className="landing-footer">
          College Portal &mdash; Higher Education Information Management System &bull; Powered by React 18, Spring Boot 3 &amp; MySQL 8
        </footer>
      </div>
    </div>
  );
}
