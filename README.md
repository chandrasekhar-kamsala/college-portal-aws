# 🎓 College Portal - Complete Full-Stack Web Application

A full-stack, containerized **College Administration and Student Management Information System** built using **React (Vite)**, **Java 17 (Spring Boot 3)**, **MySQL 8.0**, **Nginx**, and **Docker Compose**.

Designed for high reliability, security, responsive user experience, and beginner-friendly deployment on both local development environments and **Ubuntu on AWS EC2**.

## Current authentication and data policy

- Compose reads all database, admin, and JWT secrets from a local `.env` file. Copy
  `.env.example` to `.env` and replace every placeholder before starting.
- The backend creates one initial admin account on first startup only. Existing admin
  credentials are preserved on restart; there is no public admin-registration endpoint.
- Students are created by an authenticated admin and remain inactive until they use
  the first-time password setup flow. The password is stored as a BCrypt hash.
- The initial activation flow intentionally uses the register number without OTP,
  email, or identity verification. Knowing a register number is therefore not proof
  of identity and the flow must not be treated as takeover-resistant.
- No demo students, marks, attendance, or hall tickets are created automatically.
  Add real records through the admin portal.

### Safe Docker workflow

```bash
cp .env.example .env
# edit .env and replace all placeholders
docker compose config
docker compose up -d --build
docker compose ps
docker compose logs --tail=200
```

Stop and restart with `docker compose down` and `docker compose up -d`; do not use
`docker compose down -v`, because the named MySQL volume contains application data.

---

## 📑 Table of Contents
1. [Project Overview & Key Features](#-project-overview--key-features)
2. [Technology Stack](#-technology-stack)
3. [Architecture Diagram](#-architecture-diagram)
4. [Project Directory Structure](#-project-directory-structure)
5. [Prerequisites](#-prerequisites)
6. [Quick Start: Running with Docker (Recommended)](#-quick-start-running-with-docker-recommended)
7. [Running for Local Development (Without Docker)](#-running-for-local-development-without-docker)
8. [Docker Compose Services Explained](#-docker-compose-services-explained)
9. [Verifying & Testing the Application](#-verifying--testing-the-application)
10. [Database Persistence Explained](#-database-persistence-explained)
11. [Git & GitHub Setup Instructions](#-git--github-setup-instructions)
12. [Deploying to AWS EC2 Ubuntu Server](#-deploying-to-aws-ec2-ubuntu-server)
13. [Security Best Practices](#-security-best-practices)
14. [Comprehensive Troubleshooting Guide](#-comprehensive-troubleshooting-guide)

---

## 🌟 Project Overview & Key Features

### A. Administrative Dashboard
* **Metrics Cards:** Real-time counters for Total Students, Active Departments, Recent Enrollments, and Live Database Status.
* **Faculty / Department Distribution:** Visual distribution progress bars tracking enrollment percentage by department.
* **Recently Enrolled Students:** Quick-access table showing latest additions with instant profile preview.
* **Live System Health Indicator:** Real-time heartbeat monitoring connectivity with the backend Actuator service.

### B. Student Management (Full CRUD)
* **Student Directory Table:** Paginated/scrollable view with custom badges (`STU-0001`), user initials avatar, and formatted dates.
* **Real-Time Search:** Instant filtering across student names and email addresses.
* **Department Filter:** Quick category tabs and dropdowns (Computer Science, Information Technology, Mechanical, Electrical, Civil, etc.).
* **Add New Student Modal:** Comprehensive dialog with field validation (name, email, department, academic year, optional phone number).
* **View Student Profile Modal:** Dedicated card inspecting full profile details, contact info, enrollment timestamp, and update history.
* **Edit Student Modal:** Safe pre-populated form allowing full updates with duplicate-email prevention.
* **Permanent Delete with Confirmation:** Safety modal preventing accidental removals.
* **Toast Notification System:** Animated alerts for success, validation warnings, and server errors.

---

## 💻 Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | React + Vite | React 18.3, Vite 5.4 | High-performance Single Page Application (SPA) |
| **Styling** | Vanilla CSS Design System | CSS3 Variables | Sleek dark-mode aesthetic with zero Tailwind overhead |
| **Icons** | Lucide React | 0.441+ | Crisp vector SVG icons |
| **Backend API** | Java Spring Boot | Java 17, Spring Boot 3.3.4 | Robust RESTful microservice API |
| **Data Access** | Spring Data JPA / Hibernate | 6.5.3 | ORM, query abstraction, schema migration |
| **Validation** | Jakarta Bean Validation | 3.0+ | Server-side request constraint verification |
| **Health & Monitoring**| Spring Boot Actuator | 3.3.4 | Production health checks (`/actuator/health`) |
| **Database** | MySQL Server | 8.0 (Community) | ACID-compliant relational data storage |
| **Web Server / Proxy** | Nginx | 1.27 Alpine | High-speed static file serving & reverse proxying |
| **Containerization** | Docker & Docker Compose | Compose V2 | Multi-container automated orchestration |
| **Cloud Host** | AWS EC2 (Ubuntu LTS) | 24.04 / 22.04 | Cloud deployment environment |

---

## 🏗️ Architecture Diagram

```text
[ Browser / Client ]
         │
         ▼ (HTTP Port 80)
┌─────────────────────────────────────────────────────────────┐
│ Docker Host / AWS EC2                                       │
│                                                             │
│   ┌───────────────────────────────────────────────────────┐ │
│   │ "frontend" Container (Nginx 1.27 Alpine)              │ │
│   │                                                       │ │
│   │   • Serves React Single Page App (Static HTML/JS/CSS) │ │
│   │   • try_files $uri $uri/ /index.html (SPA routing)    │ │
│   │   • Reverse Proxies:                                  │ │
│   │       /api/      ──►  http://backend:8080/api/        │ │
│   │       /actuator/ ──►  http://backend:8080/actuator/   │ │
│   └───────────────────────┬───────────────────────────────┘ │
│                           │                                 │
│             college-portal-network (Docker Bridge)          │
│                           │                                 │
│   ┌───────────────────────▼───────────────────────────────┐ │
│   │ "backend" Container (Eclipse Temurin 17 JRE Alpine)   │ │
│   │                                                       │ │
│   │   • Spring Boot 3.3 REST API (Port 8080 - Internal)   │ │
│   │   • Controllers, Services, Repositories               │ │
│   │   • Connects to: mysql:3306                           │ │
│   └───────────────────────┬───────────────────────────────┘ │
│                           │                                 │
│   ┌───────────────────────▼───────────────────────────────┐ │
│   │ "mysql" Container (MySQL 8.0)                         │ │
│   │                                                       │ │
│   │   • Private Database (Port 3306 - NOT exposed publicly) │
│   │   • Schema: college_db                                │ │
│   │   • Persistent Volume: college_mysql_data             │ │
│   └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Directory Structure

```text
college-portal/
├── docker-compose.yml              # Production Docker Compose orchestration
├── docker-compose.dev.yml          # Local developer Compose (exposes 8080 & 3306)
├── .env.example                    # Template for environment secrets
├── .env                            # Active environment configuration (git-ignored)
├── .gitignore                      # Git ignore patterns
├── README.md                       # Comprehensive project documentation
├── docs/
│   └── UBUNTU_EC2_DEPLOYMENT.md    # Beginner step-by-step AWS EC2 deployment guide
├── mysql/
│   └── init.sql                    # Initial database schema and seed student records
├── backend/
│   ├── Dockerfile                  # Multi-stage Maven -> JRE 17 Alpine Dockerfile
│   ├── .dockerignore               # Docker ignore for backend
│   ├── pom.xml                     # Maven project descriptor & dependencies
│   └── src/
│       ├── main/
│       │   ├── java/com/college/portal/
│       │   │   ├── CollegePortalApplication.java
│       │   │   ├── config/
│       │   │   │   ├── CorsConfig.java
│       │   │   │   └── DataInitializer.java
│       │   │   ├── controller/
│       │   │   │   └── StudentController.java
│       │   │   ├── dto/
│       │   │   │   ├── DashboardStatsResponse.java
│       │   │   │   ├── DepartmentCount.java
│       │   │   │   ├── ErrorResponse.java
│       │   │   │   ├── StudentRequest.java
│       │   │   │   └── StudentResponse.java
│       │   │   ├── exception/
│       │   │   │   ├── EmailAlreadyExistsException.java
│       │   │   │   ├── GlobalExceptionHandler.java
│       │   │   │   └── ResourceNotFoundException.java
│       │   │   ├── model/
│       │   │   │   └── Student.java
│       │   │   ├── repository/
│       │   │   │   └── StudentRepository.java
│       │   │   └── service/
│       │   │       ├── StudentService.java
│       │   │       └── StudentServiceImpl.java
│       │   └── resources/
│       │       └── application.properties
│       └── test/
│           ├── java/com/college/portal/
│           │   ├── CollegePortalApplicationTests.java
│           │   ├── controller/StudentControllerTest.java
│           │   └── service/StudentServiceTest.java
│           └── resources/
│               └── application.properties
└── frontend/
    ├── Dockerfile                  # Multi-stage Node build -> Nginx Alpine Dockerfile
    ├── .dockerignore               # Docker ignore for frontend
    ├── nginx.conf                  # Nginx reverse proxy configuration
    ├── package.json                # Frontend package dependencies & scripts
    ├── vite.config.js              # Vite bundler & development proxy configuration
    ├── index.html                  # HTML5 entry with fonts and SEO tags
    └── src/
        ├── main.jsx                # React DOM render entry
        ├── App.jsx                 # Main application state and view router
        ├── index.css               # Design system & CSS root variables
        ├── App.css                 # Component and layout styling
        ├── services/
        │   └── api.js              # REST client using relative paths
        └── components/
            ├── Dashboard.jsx
            ├── DeleteConfirmModal.jsx
            ├── Navbar.jsx
            ├── StatsCard.jsx
            ├── StudentDetailModal.jsx
            ├── StudentModal.jsx
            ├── StudentTable.jsx
            └── Toast.jsx
```

---

## 📋 Prerequisites

### For Running with Docker (Recommended for Windows, Mac, Ubuntu):
* **Windows or Mac:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
* **Ubuntu Server:** Docker Engine and Docker Compose plugin installed (detailed in [docs/UBUNTU_EC2_DEPLOYMENT.md](file:///c:/Users/vinay/college-portal/docs/UBUNTU_EC2_DEPLOYMENT.md)).
* **Git:** Installed on your computer.

### For Running Directly on Host Machine (Without Docker):
* **Java:** JDK 17 or higher (Java 17, 21, or 22).
* **Maven:** Apache Maven 3.8+.
* **Node.js:** Node v18+ and npm v9+.
* **MySQL:** MySQL Server 8.0 installed locally.

---

## 🚀 Quick Start: Running with Docker (Recommended)

### Terminal to Use:
* **Windows:** Windows PowerShell or Command Prompt.
* **macOS / Linux:** Terminal.

### 1. Configure Environment Secrets:
Ensure you are in the root `college-portal` directory:
```bash
# On Linux/macOS/Git Bash:
cp .env.example .env

# On Windows PowerShell:
Copy-Item .env.example .env
```
*(The repository already provides working safe default credentials in `.env` for instant local testing).*

### 2. Validate the Compose Configuration:
```bash
docker compose config
```

### 3. Build Images and Launch Services:
Run from the root directory:
```bash
docker compose up -d --build
```
> **What `--build` does:** Recompiles the source code into fresh Docker images.  
> Once the images are built, you can start the application quickly at any time using:  
> `docker compose up -d`

### 4. Verify Service Health:
```bash
docker compose ps
```
All three services (`college-mysql`, `college-backend`, `college-frontend`) should display `Up` and `(healthy)`.

### 5. Open the Portal:
Open your browser and navigate to:
```
http://localhost
```
You will see the College Portal dashboard loaded with 5 pre-seeded students!

---

## 🛠️ Running for Local Development (Without Docker)

If you are developing features and do not want to run Docker, you can run each service natively:

### Step 1: Start MySQL Database
Ensure local MySQL is running on port 3306, create the database:
```sql
CREATE DATABASE college_db;
```

### Step 2: Start Spring Boot Backend
Open a terminal in `backend/`:
```bash
# On Windows PowerShell:
cd backend
mvn clean spring-boot:run

# On Linux/macOS:
cd backend && ./mvnw spring-boot:run
```
The backend starts on `http://localhost:8080`. Verify health: `http://localhost:8080/actuator/health`.

### Step 3: Start React Frontend
Open a second terminal in `frontend/`:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`. Vite's built-in dev proxy automatically forwards `/api` calls to `http://localhost:8080`.

---

## 📦 Docker Compose Services Explained

### 1. `mysql` Service
* **Image:** `mysql:8.0`
* **Internal Port:** `3306` (isolated inside `college-portal-network`, not accessible from the public internet).
* **Initialization:** Runs `mysql/init.sql` on first boot to create tables and insert demo students.
* **Persistent Storage:** Uses named Docker volume `college_mysql_data`.
* **Health Check:** Issues `mysqladmin ping` every 10 seconds to ensure the database engine is ready to accept connections.

### 2. `backend` Service
* **Build Context:** `backend/Dockerfile` (Multi-stage build).
* **Startup Dependency:** `depends_on: mysql` with `condition: service_healthy`. Spring Boot will not attempt to start until MySQL is completely initialized and accepting queries.
* **Internal Port:** `8080`.
* **Health Check:** Actuator endpoint `http://localhost:8080/actuator/health`.

### 3. `frontend` Service
* **Build Context:** `frontend/Dockerfile` (Multi-stage build).
* **Web Server:** Production Nginx 1.27 Alpine.
* **Published Port:** Maps host port `80` to container port `80`.
* **Routing:** Serves React SPA assets with client-side fallback `try_files $uri $uri/ /index.html;`.
* **Reverse Proxy:** Directs all `/api/*` requests internally to `http://backend:8080/api/*`.

---

## 🧪 Verifying & Testing the Application

### 1. Verify Backend Unit & Integration Tests:
Run the backend test suite:
```bash
cd backend
mvn test
```
* Result: **17 tests executed, 0 failures, 0 errors**. Tests use H2 in-memory DB and MockMvc.

### 2. Verify Frontend Production Build:
Run the frontend bundler test:
```bash
cd frontend
npm run build
```
* Result: Production bundles created in `frontend/dist/` without any warnings.

### 3. Test REST API Endpoints Manually:
You can test the REST endpoints directly using `curl` or Postman:

#### Get all students:
```bash
curl http://localhost/api/students
```

#### Get dashboard statistics:
```bash
curl http://localhost/api/students/stats
```

#### Add a new student:
```bash
curl -X POST http://localhost/api/students \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Robert Frost","email":"robert.f@college.edu","department":"Computer Science","academicYear":"1st Year","phoneNumber":"+1-555-8888"}'
```

#### Update student:
```bash
curl -X PUT http://localhost/api/students/1 \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Aarav Sharma Updated","email":"aarav.sharma@college.edu","department":"Computer Science","academicYear":"4th Year","phoneNumber":"+1-555-0192"}'
```

#### Delete student:
```bash
curl -X DELETE http://localhost/api/students/1
```

---

## 💾 Database Persistence Explained

The application uses a **named Docker volume**:
```yaml
volumes:
  mysql_data:
    name: college_mysql_data
```

### How Data is Preserved:
1. When you run `docker compose down`, Docker removes the container instances, but **preserves the volume `college_mysql_data` on disk**.
2. When you run `docker compose up -d` again, MySQL mounts the existing volume and your modified student records are immediately available.
3. **Data Loss Warning:** Only running `docker compose down -v` (with the `-v` flag) will delete volumes. Never use the `-v` flag in production!

---

## 🐙 Git & GitHub Setup Instructions

Follow these exact steps to publish this project to your GitHub account:

### Step 1: Initialize Git Repository
From the root `college-portal` directory:
```bash
# On Windows PowerShell or Linux terminal:
git init
```

### Step 2: Verify .gitignore
Verify that `.env`, `backend/target/`, and `frontend/node_modules/` are not being tracked:
```bash
git status
```

### Step 3: Stage and Commit Files
```bash
git add .
git commit -m "feat: complete College Portal application with React, Spring Boot, MySQL, and Docker"
```

### Step 4: Create a New GitHub Repository
1. Go to [https://github.com/new](https://github.com/new).
2. Repository name: `college-portal`.
3. Set to **Public** or **Private**.
4. Do **not** check "Initialize with README" (we already have a complete README).
5. Click **Create repository**.

### Step 5: Push to GitHub
Copy your repository URL from GitHub and run:
```bash
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/college-portal.git
git push -u origin main
```

---

## ☁️ Deploying to AWS EC2 Ubuntu Server

For full, beginner-friendly instructions from launching an EC2 instance to going live, consult our dedicated deployment guide:

👉 **[docs/UBUNTU_EC2_DEPLOYMENT.md](file:///c:/Users/vinay/college-portal/docs/UBUNTU_EC2_DEPLOYMENT.md)**

### Summary of EC2 Commands:
```bash
# 1. SSH into your Ubuntu server
ssh -i college-portal-key.pem ubuntu@<EC2_PUBLIC_IP>

# 2. Clone repository
git clone https://github.com/<YOUR_GITHUB_USERNAME>/college-portal.git
cd college-portal

# 3. Configure secrets
cp .env.example .env
nano .env

# 4. Build and start services
docker compose up -d --build

# 5. Access via public IP
http://<EC2_PUBLIC_IP>
```

---

## 🔒 Security Best Practices

1. **Private Database:** Port `3306` is never mapped to host ports in production. Only containers attached to `college-portal-network` can query MySQL.
2. **Secrets Segregation:** Passwords are kept in `.env` (permissions `600`) and never committed to Git.
3. **Non-Root Runtime:** Spring Boot runs as non-privileged `appuser:appgroup`.
4. **EC2 Security Group:** Port 22 (SSH) must be restricted to **My IP** only. Never use `0.0.0.0/0` for SSH.
5. **Nginx Hardening:** Headers `X-Content-Type-Options: nosniff` and `X-Frame-Options: SAMEORIGIN` prevent MIME-sniffing and clickjacking.

---

## 🔧 Comprehensive Troubleshooting Guide

### 1. `docker: command not found` or `Docker daemon not running`
* **Cause:** Docker Desktop is either not installed or not launched.
* **Fix:** Open Docker Desktop from the Start Menu / Applications folder and wait until the whale icon in the taskbar turns solid green.

### 2. Port 80 already in use
* **Cause:** Another web server (e.g. Apache, IIS, or an old Nginx container) is running on port 80.
* **Fix (Windows):** Run in PowerShell as Administrator:
  ```powershell
  Stop-Service W3SVC
  Get-Process -Id (Get-NetTCPConnection -LocalPort 80).OwningProcess
  ```
* **Fix (Linux):** Run `sudo lsof -i :80` or `sudo systemctl stop apache2`.
* **Alternative:** Change port mapping in `docker-compose.yml` to `"8081:80"` and access via `http://localhost:8081`.

### 3. Port 8080 already in use
* **Cause:** A local Java process or Jenkins is running on port 8080.
* **Fix:** In our production `docker-compose.yml`, backend port 8080 is internal only and will NOT conflict with host port 8080! If using `docker-compose.dev.yml`, stop the local service using 8080.

### 4. MySQL healthcheck failure / timeout
* **Cause:** Slow disk on low-resource machines (like `t2.micro`) during initial database creation.
* **Fix:** Check MySQL logs:
  ```bash
  docker compose logs -f mysql
  ```
  Allow 30-40 seconds for MySQL to generate initial InnoDB system tables.

### 5. Backend connection refused (`CommunicationsException` / `Connection refused`)
* **Cause:** The backend attempted to connect before MySQL finished starting up.
* **Fix:** Our `docker-compose.yml` uses `depends_on: mysql: condition: service_healthy`. If MySQL restarted, restart backend:
  ```bash
  docker compose restart backend
  ```

### 6. Nginx 502 Bad Gateway
* **Cause:** Nginx cannot forward traffic to `http://backend:8080` because backend is still compiling or starting up.
* **Fix:** Wait 20 seconds for Spring Boot to finish initialization. Inspect logs with:
  ```bash
  docker compose logs --tail=50 backend
  ```

### 7. Maven build failure in Docker
* **Cause:** Incompatible Java version or broken network download during Maven dependency resolution.
* **Fix:** The provided `Dockerfile` pins `maven:3.9.9-eclipse-temurin-17-alpine` ensuring 100% reproducible builds. Re-run `docker compose build --no-cache backend`.

### 8. Database data missing after reboot
* **Cause:** Containers were destroyed with the `-v` flag (`docker compose down -v`).
* **Fix:** Always shut down with `docker compose down` (without `-v`) to preserve the persistent `college_mysql_data` volume.

---

## 👨‍💻 Maintenance Commands Quick Reference

| Action | Command |
| :--- | :--- |
| **Start in background** | `docker compose up -d` |
| **Rebuild & start** | `docker compose up -d --build` |
| **View live logs** | `docker compose logs -f` |
| **Check service status** | `docker compose ps` |
| **Restart backend** | `docker compose restart backend` |
| **Stop services (keep data)** | `docker compose down` |
| **Inspect database volume** | `docker volume inspect college_mysql_data` |

---

*College Portal • Built with passion for excellence, reliability, and modern full-stack web engineering.*
