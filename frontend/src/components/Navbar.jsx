import React from 'react';
import { GraduationCap, LayoutDashboard, Users, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAddModal, isBackendOnline }) {
  return (
    <nav className="navbar" role="navigation" aria-label="Main Navigation">
      <div className="nav-brand">
        <div className="brand-icon-wrapper">
          <GraduationCap size={24} aria-hidden="true" />
        </div>
        <div className="brand-text">
          <h1>College Portal</h1>
          <span>Administration &amp; Student Information System</span>
        </div>
      </div>

      <div className="nav-links" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'dashboard'}
          className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
          id="nav-tab-dashboard"
        >
          <LayoutDashboard size={18} aria-hidden="true" />
          <span>Dashboard</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'students'}
          className={`nav-link ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
          id="nav-tab-students"
        >
          <Users size={18} aria-hidden="true" />
          <span>Students Directory</span>
        </button>
      </div>

      <div className="nav-actions">
        <div
          className={`status-badge ${isBackendOnline ? 'online' : 'offline'}`}
          title={isBackendOnline ? 'Backend API is connected and responding' : 'Attempting to reach Backend API'}
        >
          <span className="status-dot"></span>
          <span>{isBackendOnline ? 'System Online' : 'Connecting...'}</span>
        </div>

        <button
          className="btn-primary"
          onClick={onOpenAddModal}
          id="btn-add-student-nav"
          aria-label="Add new student"
        >
          <PlusCircle size={18} aria-hidden="true" />
          <span>New Student</span>
        </button>
      </div>
    </nav>
  );
}
