package com.college.portal.service;

import com.college.portal.dto.*;

public interface AuthService {

    AuthResponse adminLogin(AdminLoginRequest request);

    StudentStatusResponse checkStudentStatus(String registerNumber);

    AuthResponse activateStudent(StudentSetPasswordRequest request);

    AuthResponse studentLogin(StudentLoginRequest request);

    AuthResponse getCurrentUser();
}
