# Job Portal & Recruitment Management System

A Java Full Stack web application that connects job seekers with recruiters through a centralized recruitment platform. The system supports user authentication, job posting, job searching, applications, resume management, application status tracking, and administrative management.

## 🚀 Features

### 👤 Job Seeker
- Register and login securely
- Search and filter available jobs
- View job details
- Apply for jobs
- Upload resume in PDF format
- Download/manage submitted resume
- Track application status
- View application history

### 🏢 Recruiter
- Register and login securely
- Create job postings
- View posted jobs
- Update job details
- Deactivate job postings
- View applicants for posted jobs
- View applicant details
- Download applicant resumes
- Update application status

### 🛡️ Admin
- Secure admin access
- View total users
- View job seekers
- View recruiters
- View active jobs
- View registered users
- Monitor platform activity

## 🔐 Authentication & Security

- Spring Security
- JWT-based authentication
- BCrypt password hashing
- Role-based authorization
- Protected REST APIs
- Separate access for Job Seeker, Recruiter, and Admin
- Sensitive configuration excluded from Git using `.gitignore`

## 🛠️ Technologies Used

### Backend
- Java 21
- Spring Boot 4.1.2
- Spring WebMVC
- Spring Data JPA
- Spring Security
- JWT
- Maven

### Frontend
- HTML5
- CSS3
- JavaScript
- Bootstrap 5.3.3
- Bootstrap Icons
- Thymeleaf

### Database
- MySQL 8

### Development Tools
- Visual Studio Code
- Postman
- Git
- GitHub

## 🏗️ System Architecture

The application follows a layered architecture:

```text
Frontend
HTML + CSS + JavaScript + Bootstrap + Thymeleaf
                    │
                    ▼
              REST Controllers
                    │
                    ▼
                 Services
                    │
                    ▼
              Spring Data JPA
                    │
                    ▼
                 MySQL
```

Security flow:

```text
User Login
    │
    ▼
Authentication
    │
    ▼
JWT Token
    │
    ▼
Role-Based Authorization
    │
    ├── JOB_SEEKER
    ├── RECRUITER
    └── ADMIN
```

## 👥 User Roles

| Role | Main Responsibilities |
|---|---|
| Job Seeker | Search jobs, apply, upload resume, track applications |
| Recruiter | Post jobs, manage jobs, view applicants, update application status |
| Admin | Monitor users, recruiters, job seekers, and active jobs |

## 📌 Main Modules

### Authentication Module
Handles registration, login, password hashing, JWT generation, and role-based access control.

### Job Management Module
Allows recruiters to create, update, view, and deactivate job postings.

### Job Search Module
Allows job seekers and public users to search jobs by title and location.

### Application Management Module
Allows job seekers to apply for jobs and recruiters to manage applications.

### Resume Management Module
Supports PDF resume upload and authorized resume download.

### Admin Management Module
Provides statistics and user management functionality for administrators.

## 🔗 Important API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Jobs

```text
GET    /api/jobs
GET    /api/jobs/search/title?title=
GET    /api/jobs/search/location?location=

POST   /api/recruiter/jobs
GET    /api/recruiter/jobs
PUT    /api/recruiter/jobs/{id}
DELETE /api/recruiter/jobs/{id}
```

### Applications

```text
POST /api/seeker/jobs/{jobId}/apply
GET  /api/seeker/applications

GET /api/recruiter/jobs/{jobId}/applications
PUT /api/recruiter/applications/{applicationId}/status
```

### Resume

```text
POST /api/seeker/applications/{applicationId}/resume
GET  /api/recruiter/applications/{applicationId}/resume
```

### Admin

```text
GET /api/admin/stats
GET /api/admin/users
```

## 🗄️ Database

The application uses MySQL with the following major entities:

```text
users
  │
  ├──────────────┐
  │              │
  ▼              ▼
jobs       job_applications
  │              │
  └──────┬───────┘
         │
         ▼
       users
```

### Main Tables

- `users`
- `jobs`
- `job_applications`

The application uses JPA/Hibernate for object-relational mapping.

## 📂 Project Structure

```text
Job-Portal/
│
├── .mvn/
├── src/
│   ├── main/
│   │   ├── java/com/jobportal/
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── entity/
│   │   │   ├── exception/
│   │   │   ├── repository/
│   │   │   └── service/
│   │   │
│   │   └── resources/
│   │       ├── static/
│   │       │   ├── css/
│   │       │   └── js/
│   │       └── templates/
│   │
│   └── test/
│
├── .gitignore
├── pom.xml
├── mvnw
├── mvnw.cmd
└── README.md
```

## ▶️ How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/bhavanakn12/Job-Portal.git
cd Job-Portal
```

### 2. Configure MySQL

Create the database:

```sql
CREATE DATABASE job_portal_db;
```

Configure your local database credentials and JWT secret in:

```text
src/main/resources/application.properties
```

> The `application.properties` file is intentionally excluded from Git to protect database credentials and application secrets.

### 3. Run the application

Using Maven Wrapper:

**Windows:**

```powershell
.\mvnw.cmd spring-boot:run
```

Or build the project:

```powershell
.\mvnw.cmd clean package
```

### 4. Open the application

```text
http://localhost:8080
```

## 🧪 Testing

The project was tested using:

- Spring Boot application startup
- MySQL database verification
- Postman API testing
- User registration and login
- JWT authentication
- Job creation and management
- Job search
- Job applications
- Resume PDF upload/download
- Application status updates
- Seeker dashboard
- Recruiter dashboard
- Admin dashboard

## 📊 Application Workflow

```text
                    ┌──────────────┐
                    │    User      │
                    └──────┬───────┘
                           │
                    Register / Login
                           │
                           ▼
                    ┌──────────────┐
                    │ JWT Security │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        Job Seeker      Recruiter      Admin
              │            │            │
              ▼            ▼            ▼
        Search Jobs    Post Jobs     Manage Users
              │         Manage Jobs   View Statistics
              ▼         View Apps
        Apply Jobs      Update Status
              │
              ▼
        Upload Resume
              │
              ▼
        Track Status
```

## 🔮 Future Enhancements

- Email notifications for application status
- Advanced recruiter search and filtering
- Candidate profile management
- Job recommendations
- Resume parsing
- AI-based job matching
- Interview scheduling
- Cloud deployment
- Docker containerization
- Advanced analytics dashboard

## 📸 Screenshots

Screenshots of the application can be added here:

```text
Home Page
Login Page
Registration Page
Job Search
Job Seeker Dashboard
Recruiter Dashboard
Admin Dashboard
Application Management
```

## 🎯 Project Objective

The objective of this project is to develop a secure and user-friendly recruitment management platform that simplifies the interaction between job seekers, recruiters, and administrators while demonstrating practical implementation of Java Full Stack development concepts.

## 👩‍💻 Author

**Bhavana K N**

Computer Science (Data Science)

GitHub: `https://github.com/bhavanakn12`

---

⭐ If you find this project useful, consider giving the repository a star.