import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { setTokenProvider } from './services/api';
import { RequireAuth, RedirectIfAuth } from './components/RouteGuards';

// Pages
import LandingPage          from './pages/LandingPage';
import AdminLoginPage       from './pages/AdminLoginPage';
import StudentActivatePage  from './pages/StudentActivatePage';
import StudentLoginPage     from './pages/StudentLoginPage';

// Admin shell + pages
import AdminLayout          from './pages/admin/AdminLayout';
import AdminDashboardPage   from './pages/admin/AdminDashboardPage';
import AdminStudentsPage    from './pages/admin/AdminStudentsPage';
import AdminAttendancePage  from './pages/admin/AdminAttendancePage';
import AdminMarksPage       from './pages/admin/AdminMarksPage';
import AdminHallTicketsPage from './pages/admin/AdminHallTicketsPage';

// Student shell + pages
import StudentLayout         from './pages/student/StudentLayout';
import StudentDashboardPage  from './pages/student/StudentDashboardPage';
import StudentAttendancePage from './pages/student/StudentAttendancePage';
import StudentMarksPage      from './pages/student/StudentMarksPage';
import StudentHallTicketsPage from './pages/student/StudentHallTicketsPage';
import StudentSubjectsPage from './pages/student/StudentSubjectsPage';

import './App.css';

/** Wire token provider so api.js always sends the latest JWT. */
function TokenWirer() {
  const { token } = useAuth();
  useEffect(() => {
    setTokenProvider(() => token);
  }, [token]);
  return null;
}

function AppRoutes() {
  return (
    <>
      <TokenWirer />
      <Routes>
        {/* Landing */}
        <Route path="/" element={<RedirectIfAuth><LandingPage /></RedirectIfAuth>} />

        {/* Auth pages */}
        <Route path="/admin/login"      element={<RedirectIfAuth><AdminLoginPage /></RedirectIfAuth>} />
        <Route path="/student/activate" element={<RedirectIfAuth><StudentActivatePage /></RedirectIfAuth>} />
        <Route path="/student/login"    element={<RedirectIfAuth><StudentLoginPage /></RedirectIfAuth>} />

        {/* Admin portal */}
        <Route path="/admin" element={<RequireAuth role="ADMIN"><AdminLayout /></RequireAuth>}>
          <Route index             element={<AdminDashboardPage />} />
          <Route path="students"   element={<AdminStudentsPage />} />
          <Route path="attendance" element={<AdminAttendancePage />} />
          <Route path="marks"      element={<AdminMarksPage />} />
          <Route path="hall-tickets" element={<AdminHallTicketsPage />} />
        </Route>

        {/* Student portal */}
        <Route path="/student" element={<RequireAuth role="STUDENT"><StudentLayout /></RequireAuth>}>
          <Route index              element={<StudentDashboardPage />} />
          <Route path="attendance"  element={<StudentAttendancePage />} />
          <Route path="marks"       element={<StudentMarksPage />} />
          <Route path="hall-tickets" element={<StudentHallTicketsPage />} />
          <Route path="subjects" element={<StudentSubjectsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
