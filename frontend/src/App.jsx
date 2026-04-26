import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports";
import Overtime from "./pages/Overtime";
import Team from "./pages/Team";
import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";
import EditUser from "./pages/EditUser";
import AddUser from "./pages/AddUser";

// 🔐 Protected Route Component
import ProtectedRoute from "./components/ProtectedRoute";

// 🧱 Layout
import MainLayout from "./layout/MainLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* 🔓 Public Route: No Sidebar/Navbar here */}
        <Route path="/" element={<Auth />} />

        {/* 🔐 Protected Routes: Wrapped in MainLayout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* 📅 Attendance Route */}
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Attendance />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* 📊 Reports Route */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Reports />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/overtime"
          element={
            <ProtectedRoute allowedRoles={["employee", "manager", "admin"]}>
              <MainLayout>
                <Overtime />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/team"
          element={
            <ProtectedRoute allowedRoles={["manager", "admin"]}>
              <MainLayout>
                <Team />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <MainLayout>
                <Users />
              </MainLayout>
            </ProtectedRoute>
          }
        /><Route
          path="/users/add"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <MainLayout>
                <AddUser />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <MainLayout>
                <UserDetails />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <MainLayout>
                <EditUser />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* 404 - Redirect to Dashboard or Login if route not found */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}