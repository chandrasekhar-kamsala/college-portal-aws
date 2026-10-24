package com.college.portal.config;

import com.college.portal.model.Student;
import com.college.portal.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Seeds initial demo data on application startup if the database is empty.
 * Runs in development and production environments, disabled in test profile.
 */
@Component
@Profile("!test")
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final StudentRepository repository;

    public DataInitializer(StudentRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() == 0) {
            log.info("No student records found in database. Seeding initial demo data...");

            repository.save(new Student(
                    "Aarav Sharma",
                    "aarav.sharma@college.edu",
                    "Computer Science",
                    "3rd Year",
                    "+1-555-0192"
            ));

            repository.save(new Student(
                    "Sophia Chen",
                    "sophia.chen@college.edu",
                    "Information Technology",
                    "4th Year",
                    "+1-555-0144"
            ));

            repository.save(new Student(
                    "Marcus Johnson",
                    "marcus.j@college.edu",
                    "Mechanical Engineering",
                    "2nd Year",
                    "+1-555-0188"
            ));

            repository.save(new Student(
                    "Priya Patel",
                    "priya.patel@college.edu",
                    "Electrical Engineering",
                    "1st Year",
                    "+1-555-0173"
            ));

            repository.save(new Student(
                    "Elena Rodriguez",
                    "elena.r@college.edu",
                    "Civil Engineering",
                    "3rd Year",
                    "+1-555-0165"
            ));

            log.info("Seeded 5 demo students into database.");
        } else {
            log.info("Database contains {} student records. Skipping data initialization.", repository.count());
        }
    }
}
