## Development Notes: 
Angular integrated monorepo with esbuild bundler (fastest and simplest)
and CSS
No SSR or Static Site Generation (SSG/Prerendering)
CSR with JWT auth, fast API calls to Nest JS backend,
responsive UI with state management, role-based UI rendering (show/hide based on permissions)
NX local caching enabled for fast rebuilds
Build/test operations are cached automatically
-Was having issues getting Jest test files to work so I pasted my tests for CRUD/RBAC at the bottom
-npx nx serve api was not working
Avoided  nx and skipped building, ran TypeScript directly:
bash
cd C:\Users\sabri\Documents\GitHub\turbovets-taskmanager\taskmanager\apps\api
npx ts-node -P tsconfig.app.json src/main.ts
-.env file is in apps/api


# Taskmanager

# Task Manager Platform


A full-stack **Task Management System** built using **NX Monorepo**, featuring a **modern Angular 20 + TailwindCSS frontend**, and a **Node.js + Express backend** with **JWT authentication** and **role-based access control (RBAC)**.  
All required and bonus features are implemented — including charts, dark mode, keyboard shortcuts, and search.





---


## Table of Contents


1. [Setup Instructions](#setup-instructions)  
2. [Architecture Overview](#architecture-overview)  
3. [Data Model Explanation](#data-model-explanation)  
4. [Access Control Implementation](#access-control-implementation)  
5. [API Documentation](#api-documentation)  
6. [Future Considerations](#future-considerations)  


---


## Setup Instructions


### 1. Prerequisites
- Node.js v18+  
- npm v9+  
- PostgreSQL 14+  
- NX CLI (`npm install -g nx`)


---


### 2. Clone Repository
```bash
git clone https://github.com/kwakaflocka/taskmanager_transfer.git
cd taskmanager_transfer


3. Environment Setup


Create a .env file in the root of the repository and populate it as follows:
Backend .env


# Server
PORT=3000
JWT_SECRET=supersecretkey123
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=refreshsecretkey123
REFRESH_TOKEN_EXPIRES_IN=7d


# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=taskmanager


Frontend .env


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
🏗️ Architecture Overview
NX Monorepo Layout


taskmanager_transfer/
│
├── apps/
│   ├── api/              # Express backend
│   └── dashboard/        # Angular 20 frontend
│
├── libs/
│   ├── shared/           # Shared models, interfaces
│   ├── auth/             # Auth utilities (JWT helpers)
│   └── db/               # Database schema, Prisma/TypeORM config
│
├── tools/                # NX generators/scripts
└── nx.json


Rationale


    Shared Libraries reduce duplication (shared DTOs, types, validation).


    Monorepo Consistency ensures single source of truth for interfaces across front & back ends.


    Scalability: Future microservices or apps can easily be added under /apps.


Data Model Explanation
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


🔐 Access Control Implementation
Role Hierarchy
Role  Capabilities
Owner Full control over organization, users, and tasks
Admin Manage tasks and team members, but not organization ownership
Viewer  Read-only access to tasks
Permissions Example
Action  Owner Admin Viewer
Create Task ✅ ✅ ❌
Edit Task ✅ ✅ ❌
Delete Task ✅ ✅ ❌
View Tasks  ✅ ✅ ✅
Manage Users  ✅ ❌ ❌
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


API Documentation
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
Future Considerations
Advanced Role Delegation


    Custom role creation (e.g., "Project Manager")


    Role inheritance (Viewer → Admin → Owner)


    Permission templates per organization


Production Security


    JWT Refresh Tokens for long sessions


    CSRF Protection on stateful requests


    RBAC Caching in Redis for performance


    Rate Limiting for login and API routes


    HTTPS & CORS configuration for production


Scaling Permission Checks


    Centralized AccessPolicyService for evaluating roles


    Caching permissions using Redis


    Batch task authorization for list endpoints


    Future migration to microservices-ready policy engine (e.g., OPA or Casbin)


Summary



Built with:


    Angular 20


    TailwindCSS


    Chart.js


    Express.js + PostgreSQL


    NX Monorepo






### Testing:
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









