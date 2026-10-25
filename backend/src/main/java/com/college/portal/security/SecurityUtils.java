package com.college.portal.security;

import com.college.portal.exception.ResourceNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            return (UserPrincipal) authentication.getPrincipal();
        }
        return null;
    }

    public static Long getAuthenticatedStudentId() {
        UserPrincipal user = getCurrentUser();
        if (user == null || !"ROLE_STUDENT".equalsIgnoreCase(user.getRole())) {
            throw new AccessDeniedException("Access denied. Authenticated student credentials required.");
        }
        if (user.getId() == null) {
            throw new ResourceNotFoundException("Student ID not found in security context.");
        }
        return user.getId();
    }

    public static String getAuthenticatedUsername() {
        UserPrincipal user = getCurrentUser();
        return user != null ? user.getUsername() : null;
    }

    public static boolean isAdmin() {
        UserPrincipal user = getCurrentUser();
        return user != null && "ROLE_ADMIN".equalsIgnoreCase(user.getRole());
    }
}
