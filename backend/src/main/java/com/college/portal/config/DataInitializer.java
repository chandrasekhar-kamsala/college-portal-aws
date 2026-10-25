package com.college.portal.config;

import com.college.portal.model.Admin;
import com.college.portal.model.Student;
import com.college.portal.repository.AdminRepository;
import com.college.portal.repository.StudentRepository;
import com.college.portal.repository.SubjectRepository;
import com.college.portal.model.Subject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Initializes the single admin account idempotently and migrates legacy student rows.
 * Runs in development and production environments, disabled in test profile.
 */
@Component
@Profile("!test")
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final AdminRepository adminRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username:admin}")
    private String adminUsername;

    @Value("${app.admin.password:AdminSecurePass2026!}")
    private String adminPassword;

    @Value("${app.admin.email:admin@college.edu}")
    private String adminEmail;

    public DataInitializer(AdminRepository adminRepository,
                           StudentRepository studentRepository,
                           SubjectRepository subjectRepository,
                           PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        initializeAdmin();
        initializeSubjectCatalog();
        migrateExistingStudents();
    }

    private void initializeSubjectCatalog() {
        if (subjectRepository.count() > 0) {
            return;
        }
        List<String> departments = List.of(
                "Computer Science", "Information Technology", "Mechanical Engineering",
                "Electrical Engineering", "Civil Engineering", "Business Administration", "Data Science"
        );
        for (String department : departments) {
            String prefix = department.equals("Computer Science") ? "CS"
                    : department.equals("Information Technology") ? "IT"
                    : department.equals("Mechanical Engineering") ? "ME"
                    : department.equals("Electrical Engineering") ? "EE"
                    : department.equals("Civil Engineering") ? "CE"
                    : department.equals("Business Administration") ? "BA" : "DS";
            for (int semester = 1; semester <= 8; semester++) {
                String sem = "Semester " + semester;
                subjectRepository.save(new Subject(department, sem, prefix + semester + "01", department + " Core " + semester + "A", 4));
                subjectRepository.save(new Subject(department, sem, prefix + semester + "02", department + " Core " + semester + "B", 4));
                subjectRepository.save(new Subject(department, sem, prefix + semester + "03", "Professional Practice " + semester, 3));
                subjectRepository.save(new Subject(department, sem, prefix + semester + "04", "Communication Skills " + semester, 3));
            }
        }
        log.info("Initialized starter subject catalog for {} departments across Semesters 1-8.", departments.size());
    }

    /**
     * Creates the single authorized admin account idempotently if none exists.
     * Preserves existing admin account and password on restarts.
     */
    private void initializeAdmin() {
        if (adminRepository.count() == 0) {
            log.info("No admin account detected. Bootstrapping initial administrative account '{}'...", adminUsername);
            String encodedPassword = passwordEncoder.encode(adminPassword);
            Admin admin = new Admin(adminUsername.trim(), adminEmail.trim(), encodedPassword);
            adminRepository.save(admin);
            log.info("Initial admin account created successfully with username '{}'.", adminUsername);
        } else {
            log.info("Admin account already exists in database. Preserving existing admin credentials.");
        }
    }

    /**
     * Ensures any student records existing prior to this upgrade have a valid unique register number and fields.
     */
    private void migrateExistingStudents() {
        List<Student> students = studentRepository.findAll();
        boolean migratedAny = false;

        for (Student s : students) {
            boolean changed = false;
            if (s.getRegisterNumber() == null || s.getRegisterNumber().trim().isEmpty()) {
                String reg = "REG-2026-" + String.format("%04d", s.getId());
                s.setRegisterNumber(reg);
                changed = true;
            }
            if (s.getCourse() == null || s.getCourse().trim().isEmpty()) {
                s.setCourse("B.Tech " + s.getDepartment());
                changed = true;
            }
            if (s.getSemester() == null || s.getSemester().trim().isEmpty()
                    || "Semester 1".equalsIgnoreCase(s.getSemester().trim())
                    || "Semester 3".equalsIgnoreCase(s.getSemester().trim())) {
                s.setSemester("Semester 7");
                changed = true;
            }
            if (s.getActivated() == null) {
                s.setActivated(false);
                changed = true;
            }
            if (changed) {
                studentRepository.save(s);
                migratedAny = true;
            }
        }

        if (migratedAny) {
            log.info("Migrated legacy student records with unique register numbers and academic details.");
        }
    }

}
