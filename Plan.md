# Garage Application - Implementation Plan

## Overview
A full-stack garage management application with React frontend, NestJS backend, and SQLite database. Supports three user roles: Admin, Mechanic, and Client.

## Tech Stack
- **Frontend**: React + Vite + TypeScript + TailwindCSS + Zustand + React Router v6
- **Backend**: NestJS + Prisma ORM + SQLite + Passport JWT
- **Auth**: JWT with role-based guards (Admin, Mechanic, Client)

## Database Entities
- **User** — id, email, password, name, phone, role (ADMIN/MECHANIC/CLIENT)
- **Vehicle** — id, clientId, make, model, year, licensePlate, vin
- **Repair** — id, vehicleId, mechanicId, description, status, cost
- **RepairHistory** — id, repairId, fromStatus, toStatus, changedAt
- **Appointment** — id, clientId, mechanicId, vehicleId, dateTime, status
- **Comment** — id, content, authorId, repairId?, appointmentId?

## Role-Based Access

| Action | Admin | Mechanic | Client |
|---|---|---|---|
| CRUD mechanics | ✅ | ❌ | ❌ |
| CRUD clients | ✅ | ❌ | ❌ |
| CRUD repairs | ✅ | ❌ | ❌ |
| CRUD appointments | ✅ | ❌ | ❌ |
| View all repairs/appointments | ✅ | ❌ | ❌ |
| Update own repair status | ✅ | ✅ (own only) | ❌ |
| Update own appointment status | ✅ | ✅ (own only) | ❌ |
| Book appointment | ✅ | ❌ | ✅ (own) |
| View own appointment status | ✅ | ✅ (own) | ✅ (own) |
| Add comments | ✅ | ✅ (assigned) | ✅ (own) |

## Implementation Steps (13 Steps)

### Phase 1: Backend
1. Scaffold NestJS project + Prisma + SQLite
2. Auth module (register, login, JWT, roles guard)
3. Users module (CRUD — admin only)
4. Vehicles module (CRUD)
5. Repairs module (CRUD + status transitions + history auto-logging)
6. Appointments module (CRUD + status transitions)
7. Comments module (CRUD scoped to repair/appointment)

### Phase 2: Frontend
8. Scaffold React + Vite + Tailwind + Router + Zustand
9. Auth pages + Zustand store + protected routes
10. Admin pages (user management, repair management, appointment management)
11. Mechanic pages (my repairs, my appointments)
12. Client pages (book appointment, my appointments)
13. Polish (error handling, loading states, UX)

## .env Configuration

### Backend (`backend/.env`)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="garage-jwt-secret-change-in-production"
JWT_EXPIRATION="7d"
PORT=3000
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:3000
```