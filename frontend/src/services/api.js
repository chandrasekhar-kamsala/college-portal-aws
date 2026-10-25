/**
 * API Service for College Portal — extended with auth + academic endpoints.
 * Uses relative paths (/api/...) so Nginx in production or Vite dev proxy
 * routes requests without hardcoded hostnames or ports.
 */

const BASE_URL = '/api';

let _getToken = () => null;
export function setTokenProvider(fn) { _getToken = fn; }

function authHeaders(extra = {}) {
  const token = _getToken();
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function handleResponse(response) {
  response = await response;

  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    if (isJson && data) {
      if (data.message) errorMessage = data.message;
      if (data.validationErrors) {
        const details = Object.entries(data.validationErrors)
          .map(([f, m]) => `${f}: ${m}`)
          .join(', ');
        errorMessage = `${errorMessage} (${details})`;
      }
    } else if (typeof data === 'string' && data.length > 0) {
      errorMessage = data;
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

// ─── Authentication ──────────────────────────────────────────────────────────

export const authApi = {
  adminLogin: (username, password) =>
    handleResponse(fetch(`${BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ username, password }),
    })),

  studentCheckStatus: (registerNumber) =>
    handleResponse(fetch(`${BASE_URL}/auth/student/check-status`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ registerNumber }),
    })),

  studentSetPassword: (registerNumber, password, confirmPassword) =>
    handleResponse(fetch(`${BASE_URL}/auth/student/activate`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ registerNumber, password, confirmPassword }),
    })),

  studentLogin: (registerNumber, password) =>
    handleResponse(fetch(`${BASE_URL}/auth/student/login`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ registerNumber, password }),
    })),
};

// ─── Admin: Students CRUD ─────────────────────────────────────────────────────

export const api = {
  async getStudents(department = '', search = '') {
    const params = new URLSearchParams();
    if (department && department !== 'ALL') params.append('department', department);
    if (search && search.trim() !== '') params.append('search', search.trim());
    const qs = params.toString() ? `?${params.toString()}` : '';
    return handleResponse(fetch(`${BASE_URL}/students${qs}`, { headers: authHeaders() }));
  },

  async getDashboardStats() {
    return handleResponse(fetch(`${BASE_URL}/students/stats`, { headers: authHeaders() }));
  },

  async getStudentById(id) {
    return handleResponse(fetch(`${BASE_URL}/students/${id}`, { headers: authHeaders() }));
  },

  async createStudent(studentData) {
    return handleResponse(fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(studentData),
    }));
  },

  async updateStudent(id, studentData) {
    return handleResponse(fetch(`${BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(studentData),
    }));
  },

  async deleteStudent(id) {
    return handleResponse(fetch(`${BASE_URL}/students/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }));
  },

  async checkHealth() {
    try {
      const res = await fetch('/actuator/health');
      if (res.ok) {
        const data = await res.json();
        return data.status === 'UP';
      }
      return false;
    } catch { return false; }
  },
};

// ─── Admin: Attendance ────────────────────────────────────────────────────────

export const attendanceApi = {
  getByStudent: (studentId) =>
    handleResponse(fetch(`${BASE_URL}/admin/attendance?studentId=${encodeURIComponent(studentId)}`, { headers: authHeaders() })),

  getSummary: (studentId) =>
    handleResponse(fetch(`${BASE_URL}/admin/attendance/student/${encodeURIComponent(studentId)}/summary`, { headers: authHeaders() })),

  add: (record) =>
    handleResponse(fetch(`${BASE_URL}/admin/attendance`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(record),
    })),

  update: (id, record) =>
    handleResponse(fetch(`${BASE_URL}/admin/attendance/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(record),
    })),

  delete: (id) =>
    handleResponse(fetch(`${BASE_URL}/admin/attendance/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })),
};

export const subjectApi = {
  getStudentSubjects: (studentId, semester) => {
    const query = semester ? `?semester=${encodeURIComponent(semester)}` : '';
    return handleResponse(fetch(`${BASE_URL}/admin/subjects/student/${studentId}${query}`, { headers: authHeaders() }));
  },
};

// ─── Admin: Marks ─────────────────────────────────────────────────────────────

export const marksApi = {
  getByStudent: (studentId) =>
    handleResponse(fetch(`${BASE_URL}/admin/marks?studentId=${encodeURIComponent(studentId)}`, { headers: authHeaders() })),

  add: (mark) =>
    handleResponse(fetch(`${BASE_URL}/admin/marks`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(mark),
    })),

  update: (id, mark) =>
    handleResponse(fetch(`${BASE_URL}/admin/marks/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(mark),
    })),

  delete: (id) =>
    handleResponse(fetch(`${BASE_URL}/admin/marks/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })),
};

// ─── Admin: Hall Tickets ──────────────────────────────────────────────────────

export const hallTicketApi = {
  getByStudent: async (studentId) => {
    const tickets = await handleResponse(fetch(`${BASE_URL}/admin/hall-tickets`, { headers: authHeaders() }));
    return tickets.filter((ticket) => String(ticket.studentId) === String(studentId));
  },

  generate: (ticket) =>
    handleResponse(fetch(`${BASE_URL}/admin/hall-tickets`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(ticket),
    })),

  publish: (id, published) =>
    handleResponse(fetch(`${BASE_URL}/admin/hall-tickets/${id}/publish?published=${published}`, {
      method: 'PATCH',
      headers: authHeaders(),
    })),

  delete: (id) =>
    handleResponse(fetch(`${BASE_URL}/admin/hall-tickets/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })),
};

// ─── Student Self-Service ─────────────────────────────────────────────────────

export const studentApi = {
  getProfile: () =>
    handleResponse(fetch(`${BASE_URL}/student/me/profile`, { headers: authHeaders() })),

  getAttendance: async () => {
    const summary = await handleResponse(fetch(`${BASE_URL}/student/me/attendance`, { headers: authHeaders() }));
    return summary.records || [];
  },

  getAttendanceSummary: () =>
    handleResponse(fetch(`${BASE_URL}/student/me/attendance`, { headers: authHeaders() })),

  getMarks: () =>
    handleResponse(fetch(`${BASE_URL}/student/me/marks`, { headers: authHeaders() })),

  getSemesterResults: () =>
    handleResponse(fetch(`${BASE_URL}/student/me/results`, { headers: authHeaders() })),

  getGrades: () =>
    handleResponse(fetch(`${BASE_URL}/student/me/grades`, { headers: authHeaders() })),

  getCourses: () =>
    handleResponse(fetch(`${BASE_URL}/student/me/courses`, { headers: authHeaders() })),

  getSubjectCatalog: (semester) =>
    handleResponse(fetch(`${BASE_URL}/student/me/subjects/catalog?semester=${encodeURIComponent(semester)}`, { headers: authHeaders() })),

  getEnrolledSubjects: (semester) => {
    const query = semester ? `?semester=${encodeURIComponent(semester)}` : '';
    return handleResponse(fetch(`${BASE_URL}/student/me/subjects${query}`, { headers: authHeaders() }));
  },

  enrollSubject: (subjectId) =>
    handleResponse(fetch(`${BASE_URL}/student/me/subjects/${subjectId}`, {
      method: 'POST',
      headers: authHeaders(),
    })),

  unenrollSubject: (subjectId) =>
    handleResponse(fetch(`${BASE_URL}/student/me/subjects/${subjectId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })),

  getHallTickets: () =>
    handleResponse(fetch(`${BASE_URL}/student/me/hall-tickets`, { headers: authHeaders() })),
};
