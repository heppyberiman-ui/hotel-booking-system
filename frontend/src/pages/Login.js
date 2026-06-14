import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Email dan password wajib diisi!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const token = res.data.token;
      const decoded = parseJwt(token);

      if (!decoded || decoded.role !== "admin") {
        alert("Akses ditolak! Akun ini tidak memiliki hak akses Administrator.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      alert("Login berhasil!");
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Email atau password salah!");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1920&auto=format&fit=crop') center/cover no-repeat",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div
        style={{
          width: "380px",
          padding: "40px",
          borderRadius: "24px",
          background: "rgba(30, 41, 59, 0.7)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.3), 0 10px 10px -5px rgb(0 0 0 / 0.3)",
          textAlign: "center",
          color: "#f8fafc"
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏨</div>
        <h1 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 8px 0", color: "#fff" }}>
          Grand Horizon
        </h1>
        <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 32px 0" }}>
          Hotel Management System
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px", textAlign: "left" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="admin@hotel.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backgroundColor: "rgba(15, 23, 42, 0.6)",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.2s ease",
                boxSizing: "border-box"
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "32px", textAlign: "left" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backgroundColor: "rgba(15, 23, 42, 0.6)",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.2s ease",
                boxSizing: "border-box"
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              color: "#fff",
              fontSize: "15px",
              fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
              transition: "transform 0.15s ease, opacity 0.15s ease",
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? "Signing In..." : "Login Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
