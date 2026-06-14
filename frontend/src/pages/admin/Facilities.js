import { useState, useEffect } from "react";
import api from "../../services/api";

function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [facilityName, setFacilityName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get("/facilities");
      setFacilities(res.data);
    } catch (err) {
      console.error("Gagal mengambil data fasilitas:", err);
      setError("Gagal memuat data fasilitas dari server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setFacilityName("");
    setDescription("");
    setImage("");
    setCurrentEditId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (facility) => {
    setFacilityName(facility.facility_name);
    setDescription(facility.description || "");
    setImage(facility.image || "");
    setCurrentEditId(facility.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!facilityName) {
      alert("Nama fasilitas wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        facility_name: facilityName,
        description: description,
        image: image
      };

      if (currentEditId) {
        await api.put(`/facilities/${currentEditId}`, payload);
        alert("Fasilitas berhasil diperbarui!");
      } else {
        await api.post("/facilities", payload);
        alert("Fasilitas berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Gagal menyimpan data fasilitas:", err);
      alert(err.response?.data?.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus fasilitas ini?")) {
      try {
        await api.delete(`/facilities/${id}`);
        alert("Fasilitas berhasil dihapus!");
        fetchData();
      } catch (err) {
        console.error("Gagal menghapus fasilitas:", err);
        alert(err.response?.data?.message || "Gagal menghapus fasilitas.");
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <div style={{ fontSize: "16px", color: "#64748b", fontWeight: "500" }}>Memuat Fasilitas...</div>
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
            Kelola data fasilitas penunjang hotel, deskripsi lokasi, dan lampiran URL gambar.
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
          <span>+</span> Tambah Fasilitas
        </button>
      </div>

      {/* Facilities Table */}
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
              <th style={{ padding: "18px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>Gambar</th>
              <th style={{ padding: "18px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>Nama Fasilitas</th>
              <th style={{ padding: "18px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>Deskripsi</th>
              <th style={{ padding: "18px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {facilities.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                  Belum ada data fasilitas terdaftar. Silakan tambahkan fasilitas baru.
                </td>
              </tr>
            ) : (
              facilities.map((fac) => (
                <tr key={fac.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "18px 24px" }}>
                    {fac.image ? (
                      <img
                        src={fac.image}
                        alt={fac.facility_name}
                        style={{ width: "64px", height: "48px", objectFit: "cover", borderRadius: "8px" }}
                      />
                    ) : (
                      <div style={{ width: "64px", height: "48px", backgroundColor: "#e2e8f0", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#94a3b8" }}>
                        No Image
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "18px 24px", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                    {fac.facility_name}
                  </td>
                  <td style={{ padding: "18px 24px", fontSize: "14px", color: "#64748b", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {fac.description || "-"}
                  </td>
                  <td style={{ padding: "18px 24px", textAlign: "right" }}>
                    <button
                      onClick={() => openEditModal(fac)}
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
                      onClick={() => handleDelete(fac.id)}
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
              {currentEditId ? "Edit Fasilitas" : "Tambah Fasilitas Baru"}
            </h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 28px 0" }}>
              Isi data detail informasi fasilitas di bawah ini secara lengkap.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>
                  Nama Fasilitas
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Infinity Pool"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
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
                  URL Gambar Fasilitas
                </label>
                <input
                  type="text"
                  placeholder="Contoh: https://link-ke-gambar.com/pool.jpg"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "32px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>
                  Deskripsi / Lokasi
                </label>
                <textarea
                  placeholder="Contoh: Terletak di Rooftop Lantai 15. Buka pukul 06:00 - 21:00."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: "100%",
                    height: "100px",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    resize: "none",
                    boxSizing: "border-box"
                  }}
                />
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

export default Facilities;
