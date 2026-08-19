# Mobius
## Overview

Möbius is an operational intelligence platform built for private academies to manage students, instructors, staff, and financial workflows.  
It unifies scheduling, payroll, and analytics in one system, all backed by a multi-tenant PostgreSQL architecture that isolates each academy’s data at the database level.

Each academy runs as an independent tenant, connected through a global control database that manages metadata and routing for all institutional connections.

---

## Architecture Summary

Möbius is designed for scalability, modularity, and strict data isolation.

| Layer | Stack |
|-------|-------|
| Frontend | React (Vite) + TailwindCSS |
| Backend | Node.js + Express.js |
| Database | PostgreSQL (Multi-Tenant Design) |
| Authentication | JWT Sessions + Bcrypt Password Hashing |
| Infrastructure | Render (App + Static) and Azure PostgreSQL Flexible Server |
| Visualization | Chart.js / Recharts + Mermaid ERD |
| Version Control | GitHub + GitHub Actions CI/CD |

---
## System Design
Möbius follows a **three-tier architecture**:

1. **Frontend (React)**  
   - Handles UI and state management for different user roles (student, staff, instructor, admin).  
   - Communicates with the backend via authenticated REST API requests.  
   - Hosted on **Render Static Sites**, optimized for fast global delivery.  

2. **Backend (Node.js + Express)**  
   - Serves REST APIs for user management, scheduling, payroll, and analytics.  
   - Uses custom middleware layers for:
     - **Tenant resolution** — determines the correct database connection from the institution code.
     - **JWT authentication** — validates tokens for each request.
     - **Role-based access control** — verifies user permissions per route.
     - **Validation middleware** — enforces request body and parameter schemas.
     - **Error handler** — catches, logs, and standardizes API responses.  
   - Deployed on **Render Web Services** for auto-scaling.

3. **Database Layer (Azure PostgreSQL Flexible Server)**  
   - Uses a **global control database** (`institutions` table) to store metadata and connection strings for each tenant.
   - Each tenant has its own dedicated PostgreSQL instance.
   - Connections are dynamically created at request time based on the authenticated institution code.

---

## Multi-Tenant Database Design

The system uses a global control database that manages connection information for each academy. Every academy (tenant) has its own PostgreSQL database instance, providing complete isolation between clients.

## Request Flow
React Client → Express Server → Middleware Stack → Tenant PostgreSQL DB

## Example: Scheduling a Class Session
1. The user (staff or instructor) submits a request via React frontend.
```POST /api/sessions
Authorization: Bearer <JWT>
Body: {
  "institutionCode": "UW123",
  "studentId": 42,
  "instructorId": 8,
  "subjectId": 3,
  "sessionStart": "2025-10-08T18:00:00Z",
  "sessionEnd": "2025-10-08T19:00:00Z"
}
```
2. Express Middleware Stack
- authMiddleware → Verifies JWT and extracts user info.
- tenantMiddleware → Connects to the tenant DB using institutionCode.
- validateSessionPayload → Validates request body.
- errorHandler → Normalizes any error responses.

3. Controller
- Inserts the session record into the tenant’s class_sessions table.
- Returns confirmation to frontend.
4. Frontend
- Updates the calendar in real time using WebSocket or refetch triggers.


## When a user logs in:
1. The system verifies their institution code (for example, UW123) in the control database.
2. Möbius retrieves the tenant’s connection string and connects to that specific PostgreSQL instance.
3. All data operations, including scheduling, payroll, and analytics, occur strictly within that tenant’s schema.
This architecture ensures:
- Data isolation across institutions
- Independent scalability and backup policies
- Centralized control for system management


## Entity-Relationship Model
### Global Control Schema (Institutions)
<img width="2378" height="729" alt="Mobius - Page 1" src="https://github.com/user-attachments/assets/ba25042d-5884-4081-b5a2-c8dbcf92fe9e" />
Each institution acts as a gateway to its own tenant database, managing linked operational entities such as users, students, instructors, staff, and financial records.


### Tenant Database Schema
<img width="6921" height="2910" alt="Mobius - Page 1 (1)" src="https://github.com/user-attachments/assets/c7f6bde8-d91d-4b53-ac51-7facc3db5a46" />

Each tenant database encapsulates the complete operational structure of an academy, including:
- Academy Operations: Students, Guardians, Instructors, and Staff
- Scheduling System: Class Series, Class Sessions, Attendance, Availability, and Assignments
- Financial Layer: Payments, Invoices, Refunds, Operating Expenses, and Payroll
- Time Tracking: Staff time logs and automated deductions from purchased student time packages
- Audit and Compliance: Full timestamp tracking with TIMESTAMPTZ for every event
This design allows for complex relationships between operational, academic, and financial entities while maintaining referential integrity across more than twenty-four normalized tables.

## Middleware Architecture
| Middleware         | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| `authMiddleware`   | Authenticates users with JWT tokens and extracts roles |
| `tenantMiddleware` | Routes each request to the correct tenant database     |
| `roleMiddleware`   | Checks user permissions for protected routes           |
| `validateRequest`  | Validates JSON payloads and query parameters           |
| `errorHandler`     | Logs and returns standardized error responses          |

## Cloud Hosting & Deployment
Render (Application Hosting)
- Backend Service: Express server with autoscaling and environment variables.
- Frontend Service: React static site, deployed through Render Build & Deploy pipeline.
- Domains: mobiusapp.io and custom academy subdomains in progress.
## Azure (Database Layer)
- Control Database: Stores institutions metadata.
- Tenant Databases: Each academy’s isolated PostgreSQL instance (Flexible Server).
- Storage Accounts: Used for static media and potential backup automation.
## CI/CD
- Automated deployments via GitHub Actions.
- Pull Requests trigger preview environments for testing.
- main branch commits deploy to production automatically.

## Engineering Highlights
- Dynamic connection routing that securely isolates tenant databases.
- Normalized schema design optimized for data integrity and scalability.
- Automated payroll processing through integration of time logs and class sessions.
- Rescheduling workflows using JSONB for proposed time updates and audit history.
- Data-driven financial insights through PostgreSQL analytics and visualization layers.

## Vision
Möbius aims to become the operational backbone for private academies, enabling data-driven decision-making across education businesses.
It provides actionable insights into student engagement, instructor efficiency, and institutional profitability while offering a foundation for multi-location and global scalability.

 Role | Email | Notes |
|---|---|---|
| Staff | `staff@test.com` | Full operations access (Roster, Scheduling, Wallets, Financial dashboard, etc.) |
| Instructor | `instructor@demo.com` | Kim Soyeon — teaches Algebra |
| Student | `alice@demo.com` | Alice Park — healthy wallet balance |
| Student | `ben@demo.com` | Ben Lee — low/negative wallet balance (for testing delinquency states) |
| Student | `charlie@demo.com` | Charlie Adult — no linked guardian |
| Guardian | `grace@demo.com` | Grace Park — Alice's parent/guardian |
| Admin | `admin@mobius.com` | Platform admin (Mobius employee) — admin console |

**Sandbox setup**: `node server/scripts/dev/sandbox.js` boots the real server against an in-memory PGlite database seeded with the accounts above. Client dev server runs on `:5173`, API on `:5001`.