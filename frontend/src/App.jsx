import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import StudentTable from './components/StudentTable';
import StudentModal from './components/StudentModal';
import StudentDetailModal from './components/StudentDetailModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import Toast from './components/Toast';
import { api } from './services/api';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Modals state
  const [studentModal, setStudentModal] = useState({ isOpen: false, student: null });
  const [detailModal, setDetailModal] = useState({ isOpen: false, student: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, student: null });

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', title = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type, title }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch student directory data
  const loadStudents = useCallback(async () => {
    try {
      const data = await api.getStudents(departmentFilter, searchTerm);
      setStudents(data);
      setIsBackendOnline(true);
    } catch (err) {
      console.error('Failed to load students:', err);
      setIsBackendOnline(false);
      throw err;
    }
  }, [departmentFilter, searchTerm]);

  // Fetch dashboard statistics
  const loadStats = useCallback(async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
      setIsBackendOnline(true);
    } catch (err) {
      console.error('Failed to load stats:', err);
      setIsBackendOnline(false);
      throw err;
    }
  }, []);

  // Comprehensive refresh
  const refreshAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadStudents(), loadStats()]);
    } catch (err) {
      setError(err.message || 'Could not connect to College Portal Backend Service.');
    } finally {
      setLoading(false);
    }
  }, [loadStudents, loadStats]);

  // Initial load
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Periodic health check ping
  useEffect(() => {
    const interval = setInterval(async () => {
      const healthy = await api.checkHealth();
      setIsBackendOnline(healthy);
    }, 25000);
    return () => clearInterval(interval);
  }, []);

  // Modal handlers
  const handleOpenAddModal = () => {
    setStudentModal({ isOpen: true, student: null });
  };

  const handleOpenEditModal = (student) => {
    setStudentModal({ isOpen: true, student });
  };

  const handleOpenDetailModal = (student) => {
    setDetailModal({ isOpen: true, student });
  };

  const handleOpenDeleteModal = (student) => {
    setDeleteModal({ isOpen: true, student });
  };

  // Student CRUD submissions
  const handleSaveStudent = async (studentData) => {
    if (studentModal.student) {
      // Update existing
      await api.updateStudent(studentModal.student.id, studentData);
      addToast(
        `Successfully updated record for "${studentData.fullName}".`,
        'success',
        'Student Updated'
      );
    } else {
      // Create new
      await api.createStudent(studentData);
      addToast(
        `Enrolled new student "${studentData.fullName}" in ${studentData.department}.`,
        'success',
        'Student Enrolled'
      );
    }

    // Refresh UI after modification
    await Promise.all([loadStudents(), loadStats()]);
  };

  const handleConfirmDelete = async (id) => {
    const studentToDelete = deleteModal.student;
    try {
      await api.deleteStudent(id);
      addToast(
        `Student "${studentToDelete?.fullName || 'record'}" has been permanently removed.`,
        'success',
        'Record Deleted'
      );
      // Refresh UI after delete
      await Promise.all([loadStudents(), loadStats()]);
    } catch (err) {
      addToast(
        err.message || 'Failed to delete student record.',
        'error',
        'Delete Failed'
      );
      throw err;
    }
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
        isBackendOnline={isBackendOnline}
      />

      {/* Main Page Content */}
      <main className="main-content">
        {activeTab === 'dashboard' ? (
          <Dashboard
            stats={stats}
            loading={loading}
            error={error}
            onRefresh={refreshAllData}
            onOpenAddModal={handleOpenAddModal}
            onViewStudent={handleOpenDetailModal}
            onNavigateToStudents={() => setActiveTab('students')}
          />
        ) : (
          <StudentTable
            students={students}
            loading={loading}
            error={error}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onRefresh={loadStudents}
            onOpenAddModal={handleOpenAddModal}
            onViewStudent={handleOpenDetailModal}
            onEditStudent={handleOpenEditModal}
            onDeleteStudent={handleOpenDeleteModal}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="portal-footer">
        <div>
          <strong>College Portal</strong> • Higher Education Information Management System
        </div>
        <div>
          Powered by React 18, Spring Boot 3, MySQL 8 &amp; Docker
        </div>
      </footer>

      {/* Modals */}
      <StudentModal
        isOpen={studentModal.isOpen}
        onClose={() => setStudentModal({ isOpen: false, student: null })}
        onSubmit={handleSaveStudent}
        student={studentModal.student}
      />

      <StudentDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, student: null })}
        student={detailModal.student}
        onEdit={handleOpenEditModal}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, student: null })}
        onConfirm={handleConfirmDelete}
        student={deleteModal.student}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
