# Smart Attendance System — Project Overview

## What Is This?

A **full-stack MERN attendance management system** with real-time employee tracking. Employees punch in/out with a **selfie + GPS location**, managers oversee their teams, and admins have global visibility. The system enforces **geofencing** (checks if employee is within 500m of the office before marking attendance).

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite, TailwindCSS, Redux Toolkit + RTK Query, React Router v7, Recharts, Lucide React |
| **Backend** | Node.js + Express 5, Mongoose (MongoDB), JWT Auth, bcryptjs, Winston logging, Morgan HTTP logs |
| **Reports** | ExcelJS (Excel export), PDFKit (PDF export) |
| **File Upload** | Multer |
| **Security** | Helmet, CORS, JWT Bearer tokens |

---

## Project Structure

```
attendance-system/
├── backend/
│   ├── app.js               ← Express app config (routes, middleware)
│   ├── server.js            ← Entry point (DB connect + listen)
│   ├── config/              ← DB config
│   ├── models/              ← Mongoose schemas
│   │   ├── User.js
│   │   ├── Attendance.js
│   │   ├── Overtime.js
│   │   └── Leave.js
│   ├── controllers/         ← Business logic
│   │   ├── authController.js
│   │   ├── attendanceController.js
│   │   ├── dashboardController.js
│   │   ├── overtimeController.js
│   │   ├── leaveController.js
│   │   └── reportController.js
│   ├── routes/              ← Express route handlers
│   ├── middleware/
│   │   ├── authMiddleware.js   ← JWT protect + authorize
│   │   └── roleMiddleware.js
│   └── utils/
│       ├── geofence.js         ← Haversine formula distance check
│       ├── generateToken.js
│       └── logger.js           ← Winston logger
│
└── frontend/
    └── src/
        ├── App.jsx              ← Routes + ProtectedRoute
        ├── main.jsx
        ├── app/
        │   ├── store.js         ← Redux store
        │   └── authSlice.js     ← Auth state (userInfo + token)
        ├── api/
        │   ├── apiSlice.js      ← RTK Query base + endpoints
        │   ├── attendanceApi.js
        │   ├── dashboardApi.js
        │   └── overtimeApi.js
        ├── pages/
        │   ├── Auth.jsx         ← Login + Register
        │   ├── Dashboard.jsx    ← Role-aware dashboard
        │   ├── Attendance.jsx   ← Punch In/Out with selfie+GPS
        │   ├── Overtime.jsx
        │   ├── Reports.jsx
        │   ├── Team.jsx         ← Manager view of team
        │   ├── Users.jsx        ← Admin/Manager user list
        │   ├── UserDetails.jsx
        │   ├── AddUser.jsx
        │   └── EditUser.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx
        │   └── ProtectedRoute.jsx
        └── layout/
            └── MainLayout.jsx
```

---

## Data Models

### User
| Field | Type | Notes |
|---|---|---|
| `name` | String | required |
| `email` | String | unique, required |
| `password` | String | hashed with bcrypt, hidden from queries |
| `role` | String | `employee` / `manager` / `admin` |
| `manager` | ObjectId → User | self-referencing (who manages this user) |

### Attendance
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User | |
| `date` | Date | |
| `punchIn` | Object | `{time, location{lat,lng}, selfie, geoStatus}` |
| `punchOut` | Object | `{time, location{lat,lng}, selfie, geoStatus}` |
| `workingHours` | Number | calculated at punch-out |
| `status` | String | `Completed` (≥8h) / `Incomplete` |
| `overtimeHours` | Number | |
| `overtimeApproved` | Boolean | |

### Overtime
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User | |
| `date` | Date | |
| `requestedHours` | Number | min: 1 |
| `reason` | String | |
| `status` | String | `Pending` / `Approved` / `Rejected` |
| `approvedBy` | ObjectId → User | |

### Leave
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User | |
| `fromDate` / `toDate` | String | |
| `reason` | String | |
| `status` | String | `Pending` / `Approved` / `Rejected` |

---

## API Routes

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Employee self-registration only |
| POST | `/api/auth/login` | Public | Returns JWT token |
| GET | `/api/auth/profile` | All | Get own profile |
| GET | `/api/auth/users` | Admin/Manager | List users (manager sees only team) |
| GET | `/api/auth/managers` | Admin | List all managers |
| GET | `/api/auth/users/:id/details` | Admin/Manager/Self | User + attendance history |
| PUT | `/api/auth/users/:id` | Admin/Manager | Update user |
| POST | `/api/users` | Admin/Manager | Create user |
| POST | `/api/attendance/punch-in` | All | Punch in with GPS+selfie |
| POST | `/api/attendance/punch-out` | All | Punch out with GPS+selfie |
| GET | `/api/attendance` | All | Get attendance (scoped by role) |
| GET | `/api/dashboard/me` | Employee | Personal dashboard stats |
| GET | `/api/dashboard/team` | Manager | Team attendance overview |
| GET | `/api/dashboard/admin` | Admin | Global dashboard |
| POST/GET/PUT | `/api/overtime` | All | Request / manage overtime |
| POST/GET/PUT | `/api/leaves` | All | Request / manage leaves |
| GET | `/api/reports` | Admin/Manager | Generate reports (Excel/PDF) |

---

## Role-Based Access

```
Employee:   punch-in/out, view own attendance, request overtime/leave, personal dashboard
Manager:    everything employee + view/manage team, approve overtime for their team
Admin:      everything + global view, create any role, all reports
```

### Frontend Route Guards
- `ProtectedRoute` checks Redux auth state + `allowedRoles` prop
- `/team` and `/users` → Manager + Admin only  
- `/reports` → Protected (admin/manager scoped server-side)
- `/overtime` → All authenticated roles

---

## Key Features

### 🔐 Authentication
- Self-registration creates `employee` only (security rule)
- Admin/Manager create users via dashboard with any role
- JWT tokens stored in `localStorage`, auto-attached to all API calls via RTK Query `prepareHeaders`

### 📍 Geofencing
- Uses the **Haversine formula** to calculate distance between employee GPS coords and office location (`22.673989, 75.877022` — hardcoded)
- Radius: **500m** — marks `IN_RANGE` or `OUT_OF_RANGE` on each punch
- Does NOT block attendance, only records geo status

### 📊 Dashboard (Role-Aware)
- **Employee**: totalDays, totalHours, overtimeCount, approved/pending leaves
- **Manager**: totalEmployees, presentToday, totalHours, leave summary per user
- **Admin**: totalUsers, totalEmployees, totalManagers, presentToday, all leave stats

### 📄 Reports
- ExcelJS for Excel export
- PDFKit for PDF export
- Filterable by date, role, status, geo, overtime

---

## State Management (Frontend)

- **Redux Toolkit** (`authSlice`) — stores `userInfo` + `token`, persisted in `localStorage`
- **RTK Query** (`apiSlice`) — handles all API calls with caching, invalidation, and tag-based refetching
- Tag types: `User`, `Attendance`, `Overtime`, `Report`

---

## Known Gaps / Areas to Improve

> [!WARNING]
> These are potential issues observed during code review:

1. **Hardcoded office location** — `OFFICE_LAT/LNG` in `attendanceController.js` is not configurable
2. **Selfie storage** — selfie is stored as a raw base64 string in MongoDB (not ideal for large images; should use cloud storage like S3/Cloudinary)
3. **No leave API endpoints** in the frontend API files yet (leaveController exists on backend, but no `leaveApi.js` in frontend)
4. **`user._doc` usage** — some controllers use `user._doc` directly which may be fragile with newer Mongoose; prefer `.toObject()`
5. **No input sanitization** on selfie field — any string is accepted as a selfie
6. **CORS is fully open** (`app.use(cors())`) — should restrict to frontend origin in production
7. **No refresh token mechanism** — JWT expires and user gets logged out without a smooth refresh flow
8. **`console.log` left in production code** — `attendanceController.js` line 24 has a `console.log("call puch in")`

---

## How to Run

### Backend
```bash
cd backend
npm run dev     # uses nodemon
# Requires: .env with MONGO_URI, JWT_SECRET, PORT
```

### Frontend
```bash
cd frontend
npm run dev     # Vite dev server
# Set VITE_API_URL in .env (defaults to http://localhost:5000/api)
```
