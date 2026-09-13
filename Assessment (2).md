# Helpdesk Management System - Technical Assessment

## Project Overview

Build a helpdesk ticketing system where employees can report issues, technical staff resolve them, and managers coordinate assignments.

---

## Business Requirements

### User Roles

**Manager**

- View all tickets
- Assign tickets to technical employees
- Change ticket priority/status
- View team workload

**Technical Employee**

- View tickets assigned to them
- Update ticket status
- Add comments/updates to tickets
- Resolve tickets

**Employee**

- Create tickets (title, description, priority, category)
- View their tickets
- Confirm resolution

---

### Ticket Workflow

**Status Flow:**

1. **Open** → Employee creates ticket
2. **Assigned** → Manager assigns to technical employee
3. **In Progress** → Technical employee starts working
4. **Resolved** → Technical employee fixes issue
5. **Closed** → Employee confirms resolution

**Status Transitions:**

- **Employee**: Can create (Open), confirm (Close)
- **Technical**: Can move Assigned → In Progress → Resolved
- **Manager**: Can assign, update any status

---

### Ticket Fields

**Required Fields:**

- Title (short summary)
- Description (problem details)
- Category (IT Support, Facilities, HR, Other)
- Priority (Low, Medium, High, Critical)

**Auto-generated:**

- Ticket ID (e.g., TKT-001)
- Created date
- Created by (current user)

**System-managed:**

- Status (starts at Open)
- Assigned to (technical employee)

---

### Pages

**1. Dashboard**

- Role-specific view:
  - **Manager**: All tickets, by priority, by status
  - **Technical**: My tickets, my open tickets
  - **Employee**: My tickets, tickets awaiting action
- Quick stats cards

**2. Ticket List**

- Filter by status, priority, assigned to, category
- Sort by date, priority, status
- Search by title
- Role-appropriate actions

**3. Ticket Detail**

- Full ticket information
- Activity timeline (creation → updates → resolution)
- Comment/update section
- Role-based action buttons

**4. Ticket Creation**

- Form with all required fields
- Submit creates ticket with Open status

---

### Preseeded Data

**Users:**

Managers (2):

- manager1@company.com / password123
- manager2@company.com / password123

Technical Staff (3):

- tech1@company.com / password123
- tech2@company.com / password123
- tech3@company.com / password123

Employees (3):

- emp1@company.com / password123
- emp2@company.com / password123
- emp3@company.com / password123

**Sample Tickets:** Seed 10-15 tickets in various states with realistic data.

**Categories:** IT Support, Facilities, HR, Other

**Priorities:** Low, Medium, High, Critical

---

## Technical Requirements

### Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **ORM**: Prisma (PostgreSQL)
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Styling**: Your choice
- **Authentication**: JWT with cookies

### Constraints

- No API routes (use Server Actions)
- Server Components for data fetching
- Client Components only for interactivity
- Always validate on server
- Share validation schemas between client/server

### Deliverables

1. Working authentication (login/register)
2. Role-based access control
3. Full ticket CRUD with workflow
4. Dashboard with stats
5. Ticket filtering and search
6. Activity timeline with comments
7. Preseeded data with seed script

---

## Submission

1. Push code to a public GitHub repo
2. Share repository link
3. Include `.env.example`
4. Provide setup instructions in `README.md`
5. Include seed script for preseeded data

---

_Time: 1.5 hours_
_Focus on functionality, role-based access, and clean ticket workflow._

