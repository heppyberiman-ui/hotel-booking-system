import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";

function CustomerRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterHovered, setIsRegisterHovered] = useState(false);
  const [isGoogleHovered, setIsGoogleHovered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Inject the Google Client script dynamically if not present
    if (!document.getElementById("google-gsi-script")) {
      const script = document.createElement("script");
      script.id = "google-gsi-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert("Semua field wajib diisi!");
      return;
    }

    if (password !== confirmPassword) {
      alert("Konfirmasi password tidak cocok!");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        role: "customer"
      });
      alert("Registrasi berhasil! Silakan masuk menggunakan akun baru Anda.");
      navigate("/customer-login");
    } catch (err) {
      console.error("Registrasi customer gagal:", err);
      alert(err.response?.data?.message || "Registrasi gagal, silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    if (!window.google) {
      alert("Google Login Client sedang disiapkan. Silakan coba sebentar lagi.");
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE",
      scope: "openid profile email",
      callback: async (tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
          setIsLoading(true);
          try {
            const res = await api.post("/auth/google-login", { access_token: tokenResponse.access_token });
            localStorage.setItem("token", res.data.token);
            alert("Registrasi dan Login Google berhasil! Selamat datang.");
            
            // Decode role from token to redirect dynamically
            const base64Url = res.data.token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const decoded = JSON.parse(window.atob(base64));
            
            if (decoded.role === "admin" || decoded.role === "receptionist") {
              navigate("/dashboard");
            } else {
              navigate("/");
            }
            window.location.reload();
          } catch (err) {
            console.error("Registrasi Google gagal:", err);
            alert(err.response?.data?.message || "Gagal mendaftar menggunakan akun Google.");
          } finally {
            setIsLoading(false);
          }
        }
      },
    });
    client.requestAccessToken();
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "85vh",
        background: "linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1920&auto=format&fit=crop') center/cover no-repeat",
        fontFamily: "'Inter', sans-serif",
        padding: "40px 20px",
        overflowX: "hidden",
        overflowY: "auto"
      }}
    >
      {/* Glowing Blur Orbs for visual depth */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0) 70%)",
          filter: "blur(50px)",
          zIndex: 1,
          pointerEvents: "none"
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251, 146, 60, 0.15) 0%, rgba(251, 146, 60, 0) 70%)",
          filter: "blur(60px)",
          zIndex: 1,
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "24px",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.35)",
          padding: "28px 24px",
          boxSizing: "border-box",
          zIndex: 2
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span style={{ fontSize: "32px" }}>📝</span>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#ffffff", margin: "10px 0 6px 0" }}>
            Registrasi Tamu
          </h2>
          <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>
            Buat akun tamu untuk mulai memesan kamar impian Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "700",
                color: "#f59e0b",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
            >
              Nama Lengkap
            </label>
            <input
              type="text"
              placeholder="Sarah Wijaya"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
                transition: "all 0.2s"
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "700",
                color: "#f59e0b",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
            >
              Alamat Email
            </label>
            <input
              type="email"
              placeholder="sarah@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
                transition: "all 0.2s"
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "700",
                color: "#f59e0b",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
            >
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
                transition: "all 0.2s"
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "700",
                color: "#f59e0b",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
            >
              Konfirmasi Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
                transition: "all 0.2s"
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            onMouseEnter={() => setIsRegisterHovered(true)}
            onMouseLeave={() => setIsRegisterHovered(false)}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#b45309",
              color: "#fff",
              fontSize: "14px",
              fontWeight: "700",
              cursor: isLoading ? "not-allowed" : "pointer",
              boxShadow: isRegisterHovered ? "0 6px 20px rgba(180, 83, 9, 0.5)" : "0 4px 12px rgba(0, 0, 0, 0.2)",
              transform: isRegisterHovered ? "translateY(-2px)" : "translateY(0)",
              transition: "all 0.3s ease",
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? "Memproses..." : "Daftar Akun"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", margin: "16px 0", gap: "10px" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255, 255, 255, 0.15)" }} />
          <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>atau</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255, 255, 255, 0.15)" }} />
        </div>

        <button
          type="button"
          onClick={handleGoogleRegister}
          onMouseEnter={() => setIsGoogleHovered(true)}
          onMouseLeave={() => setIsGoogleHovered(false)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            backgroundColor: isGoogleHovered ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.08)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            transform: isGoogleHovered ? "translateY(-2px)" : "translateY(0)",
            boxShadow: isGoogleHovered ? "0 4px 12px rgba(0, 0, 0, 0.12)" : "none",
            transition: "all 0.3s ease"
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.1-.828 2.033-1.764 2.659v2.21h2.857c1.671-1.537 2.637-3.8 2.637-6.51Z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.857-2.21c-.792.53-1.807.844-3.099.844-2.384 0-4.404-1.61-5.124-3.774H.934v2.283A8.992 8.992 0 0 0 9 18Z" fill="#34A853"/>
            <path d="M3.876 10.68c-.18-.53-.282-1.096-.282-1.68 0-.584.102-1.15.282-1.68V5.037H.934a8.992 8.992 0 0 0 0 7.926l2.942-2.283Z" fill="#FBBC05"/>
            <path d="M9 3.58c1.32 0 2.507.454 3.44 1.346l2.58-2.58C13.463.886 11.426 0 9 0A8.992 8.992 0 0 0 .934 5.037l2.942 2.283c.72-2.164 2.74-3.74 5.124-3.74Z" fill="#EA4335"/>
          </svg>
          Daftar dengan Google
        </button>

        <div style={{ textAlign: "center", marginTop: "18px", fontSize: "13px", color: "#cbd5e1" }}>
          Sudah memiliki akun?{" "}
          <Link to="/customer-login" style={{ color: "#f59e0b", fontWeight: "700", textDecoration: "none" }}>
            Sign In di sini
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CustomerRegister;
