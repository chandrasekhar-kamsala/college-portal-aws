/**
 * API Service for College Portal
 * Uses relative paths (/api/...) so Nginx in production or Vite dev proxy
 * routes requests without hardcoded hostnames or ports.
 */

const BASE_URL = '/api';

/**
 * Helper to process Fetch API responses and parse JSON or extract descriptive error messages.
 */
async function handleResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    if (isJson && data) {
      if (data.message) {
        errorMessage = data.message;
      }
      if (data.validationErrors) {
        const details = Object.entries(data.validationErrors)
          .map(([field, msg]) => `${field}: ${msg}`)
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

export const api = {
  /**
   * Fetch all students with optional department filtering and search term.
   */
  async getStudents(department = '', search = '') {
    const params = new URLSearchParams();
    if (department && department !== 'ALL') {
      params.append('department', department);
    }
    if (search && search.trim() !== '') {
      params.append('search', search.trim());
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${BASE_URL}/students${queryString}`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse(res);
  },

  /**
   * Fetch dashboard aggregate metrics and recent student list.
   */
  async getDashboardStats() {
    const res = await fetch(`${BASE_URL}/students/stats`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse(res);
  },

  /**
   * Fetch a single student record by their primary ID.
   */
  async getStudentById(id) {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse(res);
  },

  /**
   * Create a new student record.
   */
  async createStudent(studentData) {
    const res = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(studentData),
    });
    return handleResponse(res);
  },

  /**
   * Update an existing student record by ID.
   */
  async updateStudent(id, studentData) {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(studentData),
    });
    return handleResponse(res);
  },

  /**
   * Delete a student record by ID.
   */
  async deleteStudent(id) {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse(res);
  },

  /**
   * Check Spring Boot backend Actuator health endpoint.
   */
  async checkHealth() {
    try {
      const res = await fetch('/actuator/health');
      if (res.ok) {
        const data = await res.json();
        return data.status === 'UP';
      }
      return false;
    } catch {
      return false;
    }
  },
};
