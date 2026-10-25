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
    `register_number` VARCHAR(50) NULL,
    `course` VARCHAR(80) NULL,
    `semester` VARCHAR(20) NULL,
    `academic_year` VARCHAR(30) NOT NULL,
    `phone_number` VARCHAR(30) NULL,
    `activated` BOOLEAN NOT NULL DEFAULT FALSE,
    `password` VARCHAR(255) NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_student_email` (`email`),
    UNIQUE KEY `uk_student_register_number` (`register_number`),
    INDEX `idx_student_department` (`department`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
