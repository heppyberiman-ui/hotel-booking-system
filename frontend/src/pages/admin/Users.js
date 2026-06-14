import { useState, useEffect } from "react";
import api from "../../services/api";

function Users() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Gagal mengambil data user:", err);
      setError("Gagal memuat data user dari server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("customer");
    setCurrentEditId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setName(user.name);
    setEmail(user.email);
    setPassword(""); // Leave blank unless changing password
    setRole(user.role);
    setCurrentEditId(user.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || (!currentEditId && !password)) {
      alert("Name, email, dan password (untuk user baru) wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        email,
        role
      };

      if (password) {
        payload.password = password;
      }

      if (currentEditId) {
        await api.put(`/users/${currentEditId}`, payload);
        alert("User berhasil diperbarui!");
      } else {
        await api.post("/users", payload);
        alert("User berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error("Gagal menyimpan data user:", err);
      alert(err.response?.data?.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      try {
        await api.delete(`/users/${id}`);
        alert("User berhasil dihapus!");
        fetchUsers();
      } catch (err) {
        console.error("Gagal menghapus user:", err);
        alert(err.response?.data?.message || "Gagal menghapus user.");
      }
    }
  };

  const getRoleBadgeStyle = (userRole) => {
    const baseStyle = {
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      display: "inline-block",
      textTransform: "capitalize"
    };

    switch (userRole?.toLowerCase()) {
      case "admin":
      case "administrator":
        return { ...baseStyle, backgroundColor: "rgba(244, 63, 94, 0.1)", color: "#f43f5e" };
      case "receptionist":
      case "staff":
        return { ...baseStyle, backgroundColor: "rgba(99, 102, 241, 0.1)", color: "#6366f1" };
      case "customer":
        return { ...baseStyle, backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981" };
      default:
        return { ...baseStyle, backgroundColor: "rgba(100, 116, 139, 0.1)", color: "#64748b" };
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <div style={{ fontSize: "16px", color: "#64748b", fontWeight: "500" }}>Memuat Akun Pengguna...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", backgroundColor: "rgba(244, 63, 94, 0.08)", border: "1px solid rgba(244, 63, 94, 0.2)", color: "#e11d48", borderRadius: "12px" }}>
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Header and Add Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>
            Kelola data akun pengguna, administrator, resepsionis/staf, dan tamu customer.
          </p>
        </div>
        <button
          onClick={openAddModal}
          style={{
            padding: "12px 24px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "#6366f1",
            color: "#fff",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <span>+</span> Tambah User
        </button>
      </div>

      {/* Users Table */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "20px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
          overflow: "hidden"
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "18px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>Nama Lengkap</th>
              <th style={{ padding: "18px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>Email</th>
              <th style={{ padding: "18px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>Role</th>
              <th style={{ padding: "18px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                  Belum ada data user terdaftar.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "18px 24px", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                    {u.name}
                  </td>
                  <td style={{ padding: "18px 24px", fontSize: "14px", color: "#334155" }}>
                    {u.email}
                  </td>
                  <td style={{ padding: "18px 24px" }}>
                    <span style={getRoleBadgeStyle(u.role)}>{u.role}</span>
                  </td>
                  <td style={{ padding: "18px 24px", textAlign: "right" }}>
                    <button
                      onClick={() => openEditModal(u)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#fff",
                        color: "#334155",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        marginRight: "8px"
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "rgba(244, 63, 94, 0.08)",
                        color: "#f43f5e",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Popup Modal Form */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 200
          }}
        >
          <div
            style={{
              width: "450px",
              backgroundColor: "#fff",
              borderRadius: "24px",
              padding: "40px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
              border: "1px solid #e2e8f0"
            }}
          >
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px 0" }}>
              {currentEditId ? "Edit Pengguna" : "Tambah Pengguna Baru"}
            </h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 28px 0" }}>
              Isi data detail informasi akun di bawah ini secara lengkap.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="budi@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>
                  Password {currentEditId && <span style={{ textTransform: "none", color: "#94a3b8" }}>(Biarkan kosong jika tidak ingin diubah)</span>}
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
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  required={!currentEditId}
                />
              </div>

              <div style={{ marginBottom: "32px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>
                  Role Akun
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    backgroundColor: "#fff",
                    boxSizing: "border-box"
                  }}
                  required
                >
                  <option value="customer">Customer</option>
                  <option value="receptionist">Receptionist / Staff</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#fff",
                    color: "#475569",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer"
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "12px",
                    border: "none",
                    backgroundColor: "#6366f1",
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: isSubmitting ? "not-allowed" : "pointer"
                  }}
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
