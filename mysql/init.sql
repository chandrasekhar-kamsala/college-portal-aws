-- College Portal Database Initialization Script
-- Executed on container startup if data volume is newly initialized

CREATE DATABASE IF NOT EXISTS `college_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `college_db`;

-- Create students table
CREATE TABLE IF NOT EXISTS `students` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(120) NOT NULL,
    `department` VARCHAR(80) NOT NULL,
    `academic_year` VARCHAR(30) NOT NULL,
    `phone_number` VARCHAR(30) NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_student_email` (`email`),
    INDEX `idx_student_department` (`department`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert initial sample student records if table is currently empty
INSERT INTO `students` (`full_name`, `email`, `department`, `academic_year`, `phone_number`, `created_at`, `updated_at`)
SELECT * FROM (
    SELECT 'Aarav Sharma' AS full_name, 'aarav.sharma@college.edu' AS email, 'Computer Science' AS department, '3rd Year' AS academic_year, '+1-555-0192' AS phone_number, NOW() AS created_at, NOW() AS updated_at
    UNION ALL
    SELECT 'Sophia Chen', 'sophia.chen@college.edu', 'Information Technology', '4th Year', '+1-555-0144', NOW(), NOW()
    UNION ALL
    SELECT 'Marcus Johnson', 'marcus.j@college.edu', 'Mechanical Engineering', '2nd Year', '+1-555-0188', NOW(), NOW()
    UNION ALL
    SELECT 'Priya Patel', 'priya.patel@college.edu', 'Electrical Engineering', '1st Year', '+1-555-0173', NOW(), NOW()
    UNION ALL
    SELECT 'Elena Rodriguez', 'elena.r@college.edu', 'Civil Engineering', '3rd Year', '+1-555-0165', NOW(), NOW()
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `students` LIMIT 1);
