import { Navigate } from "react-router-dom";

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

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const decoded = parseJwt(token);
  if (!decoded) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  // Check expiration
  if (decoded.exp && Math.floor(Date.now() / 1000) >= decoded.exp) {
    localStorage.removeItem("token");
    alert("Sesi admin Anda telah berakhir. Silakan login kembali.");
    return <Navigate to="/login" replace />;
  }

  // Strictly allow ONLY admin role
  if (decoded.role !== "admin") {
    alert("Akses ditolak! Halaman ini hanya dapat diakses oleh Administrator.");
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
