# Royal Garage Management System

A comprehensive full-stack garage management application designed to streamline automotive repair service operations. Built with modern web technologies, featuring role-based access control for administrators, mechanics, and clients.

## 🎯 Project Overview

This system solves the common challenges faced by automotive repair shops: managing appointments, tracking repairs, handling inventory, and maintaining clear communication between all stakeholders. It provides a centralized platform where clients can book appointments, mechanics can manage their assigned tasks, and administrators can oversee all operations with real-time analytics.

### Key Problems Solved

- **Appointment Scheduling**: Eliminates manual booking errors and double-bookings
- **Role-Based Workflow**: Ensures each user type (Admin, Mechanic, Client) has appropriate access and functionality
- **Inventory Tracking**: Real-time parts management with approval workflows
- **Communication Gap**: Built-in comment system for seamless communication between clients and mechanics
- **Payment Tracking**: Integrated payment status and total amount calculation
- **Data Analytics**: Admin dashboard with insights into business performance

## ✨ Features

### For Administrators
- Comprehensive dashboard with analytics and charts
- User management (create, update, delete users)
- Appointment oversight and assignment
- Inventory management with category tracking
- Vehicle management system
- Real-time notifications

### For Mechanics
- Personalized dashboard with assigned appointments
- Update appointment status workflow
- Request parts from inventory
- Comment on appointments for client communication
- Track repair history

### For Clients
- intuitive booking interface with image uploads
- View appointment status and history
- Track repair progress through comments
- Manage personal vehicles
- Receive notifications on appointment updates

### Technical Features
- JWT-based authentication with refresh token support
- Role-based guards (Admin, Mechanic, Client)
- Image upload for appointment documentation
- Pagination support for list endpoints
- Input validation using class-validator
- Type-safe development with TypeScript
- Responsive UI with Tailwind CSS
- State management with Zustand
- Smooth animations with Framer Motion

## 🛠 Tech Stack

### Backend
- **Framework**: NestJS 10.x (Node.js)
- **Language**: TypeScript
- **ORM**: Prisma with SQLite (easily configurable for PostgreSQL/MySQL)
- **Authentication**: Passport.js + JWT
- **Password Hashing**: bcryptjs
- **Validation**: class-validator, class-transformer

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom violet/gold theme
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **UI Components**: Framer Motion (animations), Lucide React (icons)
- **Charts**: ApexCharts for analytics dashboard
- **Notifications**: React Hot Toast
- **Drag & Drop**: @hello-pangea/dnd

## 📊 Database Schema

The application uses a relational database structure with the following main entities:

- **User**: Authentication and role management (ADMIN, MECHANIC, CLIENT)
- **Vehicle**: Client vehicle information with make, model, year, license plate
- **Appointment**: Repair appointments with status tracking and image support
- **InventoryItem**: Parts and materials with quantity tracking
- **UsedPart**: Junction table linking appointments with inventory items
- **Comment**: Communication system for appointments
- **Notification**: Real-time notification system

## 🏗 Project Architecture

```
TestGarage/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/           # Authentication module (JWT, Guards)
│   │   ├── users/          # User management
│   │   ├── vehicles/       # Vehicle management
│   │   ├── appointments/   # Appointment scheduling
│   │   ├── comments/       # Comment system
│   │   ├── inventory/      # Parts inventory
│   │   ├── dashboard/      # Analytics and reporting
│   │   ├── prisma/         # Database service
│   │   └── common/         # Shared decorators and DTOs
│   └── prisma/             # Schema and migrations
│
└── frontend/               # React Frontend
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Route pages by role
    │   ├── stores/         # Zustand state management
    │   ├── services/       # API integration
    │   └── types/          # TypeScript definitions
```

### Architecture Highlights

- **Modular Design**: Each feature is encapsulated in its own NestJS module
- **Guard-Based Security**: JWT authentication with role-based access control
- **DTO Validation**: Input validation at the controller level
- **Repository Pattern**: Prisma ORM for type-safe database queries
- **Component-Based UI**: Reusable React components with TypeScript
- **State Management**: Zustand for efficient client-side state

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- SQLite (included)

### Backend Setup

```bash
cd backend
npm install
npx prisma migrate dev
npx prisma generate
npm run start:dev
```

The backend will run on `http://localhost:3000` by default.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` by default.

### Environment Variables

**Backend** (`.env`):
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRATION="1d"
PORT=3000
```

**Frontend** (`.env`):
```
VITE_API_URL=http://localhost:3000
```

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register new client
- `POST /auth/login` - Login and receive JWT

### Users (Admin only)
- `GET /users` - List all users
- `GET /users/:id` - Get user details
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Vehicles
- `GET /vehicles` - List vehicles (filtered by role)
- `POST /vehicles` - Register new vehicle
- `PATCH /vehicles/:id` - Update vehicle
- `DELETE /vehicles/:id` - Delete vehicle

### Appointments
- `GET /appointments` - List appointments (role-filtered)
- `POST /appointments` - Create appointment
- `PATCH /appointments/:id` - Update appointment
- `PATCH /appointments/:id/status` - Update status
- `DELETE /appointments/:id` - Delete appointment

### Inventory (Admin only)
- `GET /inventory` - List inventory items
- `POST /inventory` - Add inventory item
- `PATCH /inventory/:id` - Update item
- `DELETE /inventory/:id` - Delete item

### Comments
- `GET /comments` - List comments for appointment
- `POST /comments` - Add comment
- `DELETE /comments/:id` - Delete comment

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation and sanitization
- Protected API endpoints with guards
- Environment variable configuration

## 🎨 UI/UX Features

- Responsive design for mobile and desktop
- Dark/Light theme support
- Interactive dashboard with charts
- Drag-and-drop functionality
- Smooth page transitions
- Loading states and error handling
- Toast notifications for user feedback

## 📈 Future Enhancements

- Email notifications for appointment updates
- PDF invoice generation
- Customer feedback and ratings
- Multi-language support
- Mobile application (React Native)
- Integration with accounting software
- Advanced reporting and analytics

## 👨‍💻 Author

**Harison**

A full-stack developer passionate about building efficient, scalable web applications with modern technologies.

## 📄 License

This project is private and was created for demonstration and educational purposes.

---

**Note**: This project demonstrates proficiency in:
- Full-stack TypeScript development
- REST API design and implementation
- Database modeling and ORM usage
- Authentication and authorization
- State management in React
- Modern UI/UX design principles
- Code organization and best practices
