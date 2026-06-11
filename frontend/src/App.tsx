import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import InventoryManagementPage from "./pages/admin/InventoryManagementPage";
import AppointmentManagementPage from "./pages/admin/AppointmentManagementPage";
import AppointmentDetailPage from "./pages/admin/AppointmentDetailPage";
import HomeDashboardPage from "./pages/admin/HomeDashboardPage";
import MechanicAppointmentsPage from "./pages/mechanic/MyAppointmentsPage";
import ClientAppointmentsPage from "./pages/client/MyAppointmentsPage";
import BookAppointmentPage from "./pages/client/BookAppointmentPage";
import VehicleManagementPage from "./pages/admin/VehicleManagementPage";
import MyVehiclesPage from "./pages/client/MyVehiclesPage";
import LandingPage from "./pages/LandingPage";
import NewsPage from "./pages/NewsPage";

import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./stores/authStore";

/**
 * Handles landing page redirection based on user role.
 * Admins land on the Admin Dashboard, others on their respective task lists.
 */
const DashboardLanding = () => {
  const user = useAuthStore((state) => state.user);

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
  if (user.role === "MECHANIC")
    return <Navigate to="/mechanic/appointments" replace />;
  return <Navigate to="/client/appointments" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{ className: "dark:bg-gray-800 dark:text-white" }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes with Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardLanding />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <HomeDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <InventoryManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AppointmentManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/appointments/:id"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AppointmentDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vehicles"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <VehicleManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mechanic/appointments"
            element={
              <ProtectedRoute roles={["MECHANIC"]}>
                <MechanicAppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/appointments"
            element={
              <ProtectedRoute roles={["CLIENT"]}>
                <ClientAppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/vehicles"
            element={
              <ProtectedRoute roles={["CLIENT"]}>
                <MyVehiclesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/book"
            element={
              <ProtectedRoute roles={["CLIENT", "ADMIN", "MECHANIC"]}>
                <BookAppointmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/news"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <NewsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mechanic/news"
            element={
              <ProtectedRoute roles={["MECHANIC"]}>
                <NewsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/news"
            element={
              <ProtectedRoute roles={["CLIENT"]}>
                <NewsPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
