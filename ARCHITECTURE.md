# Garage Application - Architecture

## Folder Structure

```
garage/
├── backend/                          # NestJS Backend
│   ├── prisma/
│   │   └── schema.prisma             # Database schema
│   ├── src/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.module.ts
│   │   │   └── users.service.ts
│   │   ├── vehicles/
│   │   │   ├── vehicles.controller.ts
│   │   │   ├── vehicles.module.ts
│   │   │   └── vehicles.service.ts
│   │   ├── repairs/
│   │   │   ├── repairs.controller.ts
│   │   │   ├── repairs.module.ts
│   │   │   └── repairs.service.ts
│   │   ├── appointments/
│   │   │   ├── appointments.controller.ts
│   │   │   ├── appointments.module.ts
│   │   │   └── appointments.service.ts
│   │   ├── comments/
│   │   │   ├── comments.controller.ts
│   │   │   ├── comments.module.ts
│   │   │   └── comments.service.ts
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   │   ├── roles.decorator.ts
│   │   │   │   └── current-user.decorator.ts
│   │   │   └── dto/
│   │   │       └── pagination.dto.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── CommentSection.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── admin/
│   │   │   │   ├── UserManagementPage.tsx
│   │   │   │   ├── RepairManagementPage.tsx
│   │   │   │   └── AppointmentManagementPage.tsx
│   │   │   ├── mechanic/
│   │   │   │   ├── MyRepairsPage.tsx
│   │   │   │   └── MyAppointmentsPage.tsx
│   │   │   └── client/
│   │   │       ├── MyAppointmentsPage.tsx
│   │   │       └── BookAppointmentPage.tsx
│   │   ├── stores/
│   │   │   ├── authStore.ts
│   │   │   ├── repairStore.ts
│   │   │   ├── appointmentStore.ts
│   │   │   └── commentStore.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── Plan.md
└── ARCHITECTURE.md
```

## Data Flow

```
React (Axios) → NestJS Controller → PrismaService → SQLite
                    ↑
              Passport JWT AuthGuard + RolesGuard
```

## Zustand Stores

- **useAuthStore** — user, token, login/logout actions
- **useRepairStore** — repairs list, CRUD actions
- **useAppointmentStore** — appointments list, CRUD actions
- **useCommentStore** — comments for a given repair/appointment

## API Endpoints

### Auth
- `POST /auth/register` — Register new client
- `POST /auth/login` — Login, returns JWT

### Users (Admin only)
- `GET /users` — List all users
- `GET /users/:id` — Get user by ID
- `PATCH /users/:id` — Update user
- `DELETE /users/:id` — Delete user

### Vehicles
- `GET /vehicles` — List vehicles (admin: all, client: own)
- `GET /vehicles/:id` — Get vehicle
- `POST /vehicles` — Create vehicle
- `PATCH /vehicles/:id` — Update vehicle
- `DELETE /vehicles/:id` — Delete vehicle

### Repairs
- `GET /repairs` — List repairs (admin: all, mechanic: assigned)
- `GET /repairs/:id` — Get repair
- `POST /repairs` — Create repair (admin)
- `PATCH /repairs/:id` — Update repair (admin)
- `PATCH /repairs/:id/status` — Update status (admin, assigned mechanic)
- `GET /repairs/:id/history` — Get repair history
- `DELETE /repairs/:id` — Delete repair (admin)

### Appointments
- `GET /appointments` — List appointments (admin: all, client: own, mechanic: assigned)
- `GET /appointments/:id` — Get appointment
- `POST /appointments` — Create appointment (client, admin)
- `PATCH /appointments/:id` — Update appointment (admin)
- `PATCH /appointments/:id/status` — Update status (admin, assigned mechanic)
- `DELETE /appointments/:id` — Delete appointment (admin)

### Comments
- `GET /comments?repairId=&appointmentId=` — List comments
- `POST /comments` — Create comment
- `DELETE /comments/:id` — Delete comment (author or admin)