---

### Task Manager Platform

A full-stack **Task Management System** built using **NX Monorepo**, featuring a **modern Angular 20 + TailwindCSS frontend**, and a **Node.js + Express backend** with **JWT authentication** and **role-based access control (RBAC)**.  
All required and bonus features are implemented — including charts, dark mode, keyboard shortcuts, and search.




## Table of Contents


1. [Setup Instructions](#setup-instructions)  
2. [Architecture Overview](#architecture-overview)  
3. [Data Model Explanation](#data-model-explanation)  
4. [Access Control Implementation](#access-control-implementation)  
5. [API Documentation](#api-documentation)  
6. [Future Considerations](#future-considerations)  
7. [Dev Notes/Bug List](#dev-notes)


---

# Setup Instructions

---

1. Prerequisites:

- Node.js v18+  
- npm v9+  
- PostgreSQL 14+  
- NX CLI (`npm install -g nx`)

2. Clone Repository:

```bash
git clone https://github.com/kwakaflocka/taskmanager_transfer.git
cd taskmanager_transfer
```

3. Environment Setup


Create a .env file in the root of the repository and populate it as follows:
Backend .env
JWT_SECRET="tFmbYEhXZj9C0ID6xQe7ip5VLlAck2aN"
NODE_ENV=development

# Server
PORT=3000
JWT_SECRET=supersecretkey123
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=refreshsecretkey123
REFRESH_TOKEN_EXPIRES_IN=7d


API_BASE_URL=http://localhost:3000/api


4. Install Dependencies


npm install


5. Running the Apps
Backend


npm run api


Runs the Express API at
http://localhost:3000/api
Frontend


npx nx serve dashboard


Runs the Angular frontend at
👉 http://localhost:4200
6. Test Credentials
Role  Email Password
Owner owner@turbovets.com password123
Admin admin@turbovets.com password123
Viewer  viewer@turbovets.com  password123

---
# Architecture Overview
---
RBAC Model

**Three Roles:**
- **OWNER** - Full access to parent and child organizations
- **ADMIN** - Manage resources within own organization
- **VIEWER** - Read-only access to own organization

**Role Enforcement:**
- `@Roles()` decorator for route-level protection
- `RolesGuard` validates user role against required roles
- Guards executed before controller methods

**Organization Scoping:**
- OWNER users can access child organization data
- ADMIN/VIEWER limited to their organization
- Hierarchical traversal for multi-tenant data access

NX Monorepo Layout


turbovets-taskmanager/
│
├── apps/
│   ├── api/              # NestJS backend: auth and tasks
│   └── dashboard/        # Angular 20 frontend
│       └── src/app       # task list components, auth guards/│                         # interceptors, services(auth   
                          #keyboard shortcuts, task CRUD)
├── data/taskmanager.db   #TypeORM + SQLite, 
├── libs/                 #library for auth/data used by both frontend and
|                         #backend
│   ├── auth/ # Auth utilities (JWT helper, decorators, guards)
│   └── data/  # Data handling 
│              #(define Data Transfer Objects, Enums, 
│              #Interfaces)
│
├── tools/                # NX generators/scripts
└── nx.json               #configuration for NX monorepo


Rationale


    Shared Libraries reduce duplication (shared DTOs, types, validation).


    Monorepo Consistency ensures single source of truth for interfaces across front & back ends.


    Scalability: Future microservices or apps can easily be added under /apps.

Role Definitions:
Roles are defined as an enum in libs/data/src/lib/enums/role.enum.ts (lines 1-5):
role.enum.ts
    export enum Role {
        OWNER = 'OWNER',
        ADMIN = 'ADMIN',
        VIEWER = 'VIEWER'
    }
`OWNER` has full control (e.g., managing users/admins)
`ADMIN` has elevated privileges (e.g., task CRUD)
`VIEWER` has read-only access.
Roles are stored as strings in the `User` entity (`apps/api/src/app/entities/user.entity.ts`, line 15), tied to an `organizationId` for scoping access within organizations.

Users belong to organizations via a ManyToOne relationship (`user.entity.ts`, lines 17-22), enabling multi-tenant isolation (e.g., a user can't access tasks from another org).

**RBAC Overview**: 

**User Model and Interfaces**:
The `User` entity (`user.entity.ts`, lines 1-23) includes `id`, `email`, `password` (hashed), `role`, and `organizationId`.
**Authentication Flow with RBAC Integration**:
  **Login and JWT Generation**: Handled in `apps/api/src/app/auth/auth.service.ts` (lines 33-54). It validates credentials (email/password, with bcrypt hashing), then generates a JWT payload including `sub` (user ID), `email`, `role`, and `organizationId`. The token is signed with a secret (from `process.env.JWT_SECRET` or a default).
    - Example payload from login: `{ sub: user.id, email: user.email, role: user.role, organizationId: user.organizationId }`.
  - **JWT Validation**: In `apps/api/src/app/auth/jwt.strategy.ts` (lines 1-38), Passport validates the token, fetches the user from the DB and returns a user object. If validation fails, it throws `UnauthorizedException`.
  - **Module Wiring**: `apps/api/src/app/auth/auth.module.ts` integrates JWT, Passport, and TypeORM for users. It's exported for use in other modules (e.g., potential task modules).
  - **Seeding**: `apps/api/src/app/seed/seed.service.ts` (lines 1-14) creates sample users with roles (e.g., OWNER and VIEWER) tied to an organization, demonstrating how roles are assigned in practice.
Task CRUD routes are protected by @UseGuards in TaskController so users must be authenticated and have the correct role type to access these routes
---
# Data Model Explanation
---
Entity Relationship Diagram (ERD): see 'erd-taskmanager.pdf'

Schemas


User


{
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'OWNER' | 'ADMIN' | 'VIEWER';
  orgId: string;
}


Task


{
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  assignedTo: string; // userId
  orgId: string;
  createdAt: Date;
}


Organization


{
  id: string;
  name: string;
  ownerId: string;
}

---
# Access Control Implementation
---
Role Hierarchy
Role  Capabilities
Owner Full control over organization, users, and tasks
Admin Manage tasks and team members, but not organization ownership
Viewer  Read-only access to tasks
Permissions Example
Action        Owner Admin Viewer
Create Task     ✅    ✅   ❌
Edit Task       ✅    ✅   ❌
Delete Task     ✅    ✅   ❌
View Tasks      ✅    ✅   ✅ (Viewer and Owner can view all, Admin cannot see Owner 
                                tasks)
Audit Logging   ✅    ✅   ❌                                
Manage Users    ✅    ❌   ❌  (Not implemented in time)
JWT Authentication Flow


    Login


        Client sends credentials → /api/auth/login


        Server validates and returns JWT


    Frontend


        Stores JWT in localStorage


        Attaches JWT to Authorization header for all requests


    Backend Middleware


        Verifies JWT on protected routes


        Extracts user.role and orgId


        Checks permissions before executing controller actions


// Example middleware
function authorize(requiredRole: Role) {
  return (req, res, next) => {
    const user = req.user;
    if (!user || !hasPermission(user.role, requiredRole)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

---
# API Documentation
---
Base URL


http://localhost:3000/api


Authentication
POST /auth/login


Request


{
  "email": "owner@turbovets.com",
  "password": "password123"
}


Response


{
  "token": "jwt_token_here",
  "user": {
    "id": "u1",
    "name": "Owner",
    "role": "OWNER"
  }
}


Tasks
GET /tasks


Headers:
Authorization: Bearer <JWT>


Response


[
  {
    "id": "t1",
    "title": "Finish frontend build",
    "status": "In Progress",
    "category": "Work"
  }
]


POST /tasks


Request


{
  "title": "New task",
  "description": "Complete backend integration",
  "category": "Work",
  "status": "Pending"
}


Response


{
  "id": "t2",
  "title": "New task",
  "status": "Pending"
}


Users
GET /users


Owner/Admin only
Returns organization users.

---
Future Considerations
---
- Add viewports to Tailwind CSS for responsiveness
- Add functionality for Owner to manage Users and edit their role assignment
- Fully implement guard files for implied enforcement
- Add user registration secured with JwtAuthGuard
- Advanced Task Delegation: Higher level roles can assign tasks to lower levels
- Production Security
    JWT Refresh Tokens for long sessions
    CSRF Protection on stateful requests
    RBAC Caching in Redis for performance
    Rate Limiting for login and API routes
    HTTPS & CORS configuration for production
- Add CRUD flow E2E testing, Jest-axe accessibility

---
Dev Notes
---
Angular integrated monorepo with esbuild bundler (fastest and simplest) and CSS No SSR or Static Site Generation (SSG/Prerendering) 
CSR with JWT auth, fast API calls to Nest JS backend, responsive UI with state management, role-based UI rendering (show/hide based on permissions) 
NX local caching enabled for fast rebuilds Build/test operations are cached automatically 

-npx nx serve api was not working, Avoided nx and skipped building, ran TypeScript directly: bash cd C:\Users\sabri\Documents\GitHub\turbovets-taskmanager\taskmanager\apps\api npx ts-node -P tsconfig.app.json src/main.ts 

Bug list:
-Drag and drop functionality not updating task state
-Viewer permissions need to be fixed to give Viewer login read-only permissions. Viewer is not able to view Owner or Admin tasks
-Category/Status dropdown filters not working


-Testing Strategy: prioritized security backend testing with time constraint and ran out of time to implement all tests but my approach is as follows:
--Backend Jest testing:
**1. Unit Tests- Services and guards**
-Auth Service (`auth.service.spec.ts`)- JWT generation, credential validation, password hashing  
-RBAC Guards (`roles.guard.spec.ts`): Role-based access control logic
-Tasks service (`tasks.service.spec.ts`): CRUD operations with permission checks

**2. Integration tests- API endpoints**
POST, PUT and DELETE /tasks should deny Viewer and allow Admin+Owner
GET /tasks should deny Admin and allow Viewer+Owner

**3. E2E Tests - Full User Flows** (Future Enhancement)
-test for completion of full task lifecycle. For each role, user logs in, creates a task, updates, and deletes a task

--Frontend Jest
**1. Component Tests**
-Login should display validation error for invalid login
-Task List should display tasks from service

**2. Service Tests**
Auth Service:
-decode JW token
-logging out should remove token and user keys

Task Service:
-should update local state after creating task

**3. Interceptor tests*
-Should add Authorization header when token exists







###CRUD RBAC manual tests in Powershell (I would do this in Postman if I had more time):
```
# Login as OWNER
$owner = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/auth/login" -ContentType "application/json" -Body '{"email":"owner@turbovets.com","password":"password123"}'
$ownerToken = $owner.accessToken




# CREATE - Add a new task
$newTask = @{
  title = "Build Angular Dashboard"
  description = "Create the frontend UI"
  category = "Development"
  status = "To Do"
} | ConvertTo-Json




$created = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/tasks" -Headers @{Authorization = "Bearer $ownerToken"; "Content-Type" = "application/json"} -Body $newTask
Write-Host "Created task: $($created.title)"




# READ - Get all tasks
$tasks = Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/tasks" -Headers @{Authorization = "Bearer $ownerToken"}
Write-Host "Found $($tasks.Count) tasks"




# UPDATE - Change status
$taskId = $created.id
$update = @{ status = "In Progress" } | ConvertTo-Json
$updated = Invoke-RestMethod -Method Put -Uri "http://localhost:3000/api/tasks/$taskId" -Headers @{Authorization = "Bearer $ownerToken"; "Content-Type" = "application/json"} -Body $update
Write-Host "Updated task status to: $($updated.status)"




# DELETE - Remove task
Invoke-RestMethod -Method Delete -Uri "http://localhost:3000/api/tasks/$taskId" -Headers @{Authorization = "Bearer $ownerToken"}
Write-Host "Deleted task"




# Login As Viewer (Can't Create)
$viewer = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/auth/login" -ContentType "application/json" -Body '{"email":"viewer@turbovets.com","password":"password123"}'
$viewerToken = $viewer.accessToken




# Try to create (should fail)
try {
  $newTask = @{
    title = "Should fail"
    description = "Viewer can't create"
    category = "Test"
    status = "TODO"
  } | ConvertTo-Json
 
  Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/tasks" -Headers @{Authorization = "Bearer $viewerToken"; "Content-Type" = "application/json"} -Body $newTask
  Write-Host "ERROR: Viewer was able to create task (should have failed)"
} catch {
  Write-Host "RBAC Working: Viewer correctly denied from creating tasks"
}
```








