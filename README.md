# Royal Garage Management System

A full-stack garage management application for automotive repair services with role-based access control for Admins, Mechanics, and Clients.

## Features
- JWT authentication with role-based access (Admin/Mechanic/Client)
- Vehicle, appointment, and inventory management
- Interactive admin dashboard with analytics
- Appointment scheduling with image uploads
- Comment system for appointment communication
- Parts tracking and usage linking to appointments

## Tech Stack
### Backend (NestJS)
- NestJS 10.x, TypeScript, Prisma ORM, SQLite, Passport + JWT, bcryptjs

### Frontend (React)
- React 18, TypeScript, Vite, TailwindCSS (violet/gold theme), Zustand, React Router v6, Axios, Framer Motion, ApexCharts

## Project Structure
```
backend/          # NestJS backend (current)
frontend/         # React frontend (current)
controllers/      # Legacy Express.js (deprecated)
models/           # Legacy MongoDB models (deprecated)
routes/           # Legacy Express routes (deprecated)
public/           # Legacy HTML files (deprecated)
```

## Setup
### Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment
- Backend: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRATION`, `PORT`
- Frontend: `VITE_API_URL`
