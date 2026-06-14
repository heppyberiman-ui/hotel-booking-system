import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

// Safe JWT Decoder helper
const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
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

function CustomerProfile() {
  const navigate = useNavigate();
  const user = getUserFromToken();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProfileData = async () => {
    if (!user) {
      navigate("/customer-login");
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.get("/users");
      const currentProfile = res.data.find((u) => String(u.id) === String(user.id));
      if (currentProfile) {
        setName(currentProfile.name);
        setEmail(currentProfile.email);
      }
    } catch (err) {
      console.error("Gagal memuat profil pengguna:", err);
      alert("Gagal memuat informasi profil dari server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      alert("Nama dan email wajib diisi!");
      return;
    }

    if (password && password !== confirmPassword) {
      alert("Konfirmasi password baru tidak cocok!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name,
        email: email,
        role: "customer"
      };

      if (password) {
        payload.password = password;
      }

      await api.put(`/users/${user.id}`, payload);
      alert("Profil Anda berhasil diperbarui!");
      setPassword("");
      setConfirmPassword("");

      // If the email or name changed, let's inform the user to re-login to update token
      if (email !== user.email || name !== user.name) {
        alert("Informasi akun berubah. Silakan lakukan login ulang.");
        localStorage.removeItem("token");
        navigate("/customer-login");
        window.location.reload();
      } else {
        fetchProfileData();
      }
    } catch (err) {
      console.error("Gagal mengupdate profil:", err);
      alert(err.response?.data?.message || "Terjadi kesalahan saat memperbarui profil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "#78716c" }}>
        <h3>Memuat Informasi Profil...</h3>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#fafaf9", minHeight: "80vh", padding: "60px 20px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "40px", textAlign: "center" }}>
          <span style={{ fontSize: "40px" }}>👤</span>
          <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#1c1917", margin: "16px 0 8px 0" }}>
            Pengaturan Profil Tamu
          </h2>
          <p style={{ color: "#78716c", margin: 0, fontSize: "14px" }}>
            Perbarui data pribadi Anda, kelola email, atau ubah kata sandi akun Anda.
          </p>
        </div>

        {/* Profile Card */}
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e7e5e4",
            borderRadius: "24px",
            padding: "40px",
            boxShadow: "0 10px 30px rgba(28, 25, 23, 0.03)"
          }}
        >
          <form onSubmit={handleUpdateProfile}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1c1917", borderBottom: "1px solid #f5f5f4", paddingBottom: "12px", marginBottom: "24px" }}>
              Informasi Pribadi
            </h3>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#57534e", marginBottom: "8px", textTransform: "uppercase" }}>
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1px solid #d6d3d1",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  backgroundColor: "#fff"
                }}
                required
              />
            </div>

            <div style={{ marginBottom: "32px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#57534e", marginBottom: "8px", textTransform: "uppercase" }}>
                Alamat Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1px solid #d6d3d1",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  backgroundColor: "#fff"
                }}
                required
              />
            </div>

            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1c1917", borderBottom: "1px solid #f5f5f4", paddingBottom: "12px", marginBottom: "24px" }}>
              Ubah Password <span style={{ fontSize: "12px", color: "#a8a29e", fontWeight: "500" }}>(Biarkan kosong jika tidak diubah)</span>
            </h3>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#57534e", marginBottom: "8px", textTransform: "uppercase" }}>
                Password Baru
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1px solid #d6d3d1",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  backgroundColor: "#fff"
                }}
              />
            </div>

            <div style={{ marginBottom: "36px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#57534e", marginBottom: "8px", textTransform: "uppercase" }}>
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1px solid #d6d3d1",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  backgroundColor: "#fff"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: "#b45309",
                color: "#fff",
                fontSize: "15px",
                fontWeight: "700",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(180, 83, 9, 0.15)",
                transition: "opacity 0.2s"
              }}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CustomerProfile;
