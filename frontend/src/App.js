import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Rooms from "./pages/admin/Rooms";
import RoomTypes from "./pages/admin/RoomTypes";
import Facilities from "./pages/admin/Facilities";
import Bookings from "./pages/admin/Bookings";
import Users from "./pages/admin/Users";

// Customer Views & Layout
import CustomerLayout from "./components/CustomerLayout";
import Home from "./pages/customer/Home";
import About from "./pages/customer/About";
import RoomsList from "./pages/customer/RoomsList";
import RoomDetail from "./pages/customer/RoomDetail";
import CustomerLogin from "./pages/customer/CustomerLogin";
import CustomerRegister from "./pages/customer/CustomerRegister";
import BookingHistory from "./pages/customer/BookingHistory";
import CustomerProfile from "./pages/customer/CustomerProfile";

const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

// Simple protected route helper for customers, redirecting to customer login
function CustomerProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/customer-login" replace />;
  }

  const decoded = parseJwt(token);
  if (!decoded) {
    localStorage.removeItem("token");
    return <Navigate to="/customer-login" replace />;
  }

  // Check expiration
  if (decoded.exp && Math.floor(Date.now() / 1000) >= decoded.exp) {
    localStorage.removeItem("token");
    alert("Sesi Anda telah berakhir. Silakan login kembali.");
    return <Navigate to="/customer-login" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Customer Portal Layout and Routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/rooms-list" element={<RoomsList />} />
          <Route path="/rooms-list/:id" element={<RoomDetail />} />
          <Route path="/customer-login" element={<CustomerLogin />} />
          <Route path="/customer-register" element={<CustomerRegister />} />

          {/* Protected Customer Routes */}
          <Route
            path="/history"
            element={
              <CustomerProtectedRoute>
                <BookingHistory />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <CustomerProtectedRoute>
                <CustomerProfile />
              </CustomerProtectedRoute>
            }
          />
        </Route>

        {/* Authenticated Route: Admin Portal Layout */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/room-types" element={<RoomTypes />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/users" element={<Users />} />
        </Route>

        {/* Unauthenticated Admin Login Route */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Fallback route - redirects to Customer Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;