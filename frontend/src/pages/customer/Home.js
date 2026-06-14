import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function Home() {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const galleryItems = [
    {
      url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop",
      caption: "Lobby Mewah & Hangat",
      category: "Lobby"
    },
    {
      url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop",
      caption: "Restoran Fine Dining",
      category: "Restoran"
    },
    {
      url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop",
      caption: "Kolam Renang Rooftop",
      category: "Kolam Renang"
    },
    {
      url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop",
      caption: "Pusat Kebugaran Premium",
      category: "Gym"
    },
    {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
      caption: "Pantai Pribadi Eksotis",
      category: "Pantai"
    },
    {
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop",
      caption: "Eksterior Depan Malam Hari",
      category: "Eksterior"
    }
  ];

  const featuredFacilities = [
    {
      name: "Infinity Pool",
      location: "Rooftop (Lantai 15)",
      hours: "06:00 - 21:00",
      description: "Kolam renang tanpa batas di puncak hotel dengan pemandangan laut 180 derajat yang memukau.",
      emoji: "🏊‍♂️",
      gradient: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
      url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop"
    },
    {
      name: "Horizon Spa & Gym",
      location: "Lantai 2",
      hours: "08:00 - 22:00",
      description: "Pusat relaksasi tubuh dan kebugaran dengan peralatan modern serta terapis profesional.",
      emoji: "💆‍♀️",
      gradient: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
      url: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop"
    },
    {
      name: "Aurora Sky Lounge",
      location: "Lantai 16",
      hours: "16:00 - 02:00",
      description: "Nikmati malam berbintang dengan iringan live music dan koktail signature buatan bartender ahli kami.",
      emoji: "🍸",
      gradient: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
      url: "https://images.unsplash.com/photo-1560624052-449f5ddf0c31?q=80&w=1200&auto=format&fit=crop"
    }
  ];

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/rooms");
      // Get only available rooms
      const available = res.data.filter((r) => r.status === "available");
      // Show first 3 rooms as featured
      setFeaturedRooms(available.slice(0, 3));
    } catch (err) {
      console.error("Gagal mengambil data kamar terunggul:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(num);
  };

  return (
    <div style={{ animation: "fadeIn 0.6s ease", backgroundColor: "#fafaf9", fontFamily: "'Inter', sans-serif" }}>
      {/* Fullscreen Hero Section */}
      <section
        style={{
          position: "relative",
          height: "calc(100vh - 80px)",
          background: "linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.45)), url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1920&auto=format&fit=crop') center/cover no-repeat",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          color: "#fff",
          padding: "0 20px"
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "3px", color: "#f59e0b", marginBottom: "16px" }}>
          Grand Horizon Hotel & Resort
        </span>
        <h1 style={{ fontSize: "48px", fontWeight: "900", margin: "0 0 24px 0", maxWidth: "900px", lineHeight: "1.2", letterSpacing: "-1px" }}>
          Kemewahan Tanpa Batas di Tepian Samudera Eksotis Bali
        </h1>
        <p style={{ fontSize: "18px", color: "#e2e8f0", maxWidth: "650px", margin: "0 0 40px 0", lineHeight: "1.6" }}>
          Nikmati kenyamanan berkelas bintang lima dengan pelayanan butler pribadi 24 jam dan pemandangan laut 180 derajat yang memukau.
        </p>
        <Link
          to="/rooms-list"
          style={{
            padding: "16px 40px",
            borderRadius: "12px",
            backgroundColor: "#b45309",
            color: "#fff",
            textDecoration: "none",
            fontWeight: "700",
            fontSize: "16px",
            boxShadow: "0 10px 20px rgba(180, 83, 9, 0.4)",
            transform: "translateY(0)",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.backgroundColor = "#d97706";
            e.currentTarget.style.boxShadow = "0 15px 25px rgba(180, 83, 9, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.backgroundColor = "#b45309";
            e.currentTarget.style.boxShadow = "0 10px 20px rgba(180, 83, 9, 0.4)";
          }}
        >
          Lihat Kamar & Booking Sekarang
        </Link>
      </section>

      {/* Hotel Statistics Bar */}
      <section
        style={{
          backgroundColor: "#1e1b4b",
          color: "#fff",
          padding: "40px 20px",
          borderBottom: "4px solid #f59e0b"
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "30px", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: "36px", fontWeight: "800", color: "#f59e0b" }}>150+</div>
            <div style={{ fontSize: "14px", color: "#cbd5e1", marginTop: "4px", fontWeight: "500" }}>Kamar & Suite Mewah</div>
          </div>
          <div>
            <div style={{ fontSize: "36px", fontWeight: "800", color: "#f59e0b" }}>45k+</div>
            <div style={{ fontSize: "14px", color: "#cbd5e1", marginTop: "4px", fontWeight: "500" }}>Tamu Puas & Setia</div>
          </div>
          <div>
            <div style={{ fontSize: "36px", fontWeight: "800", color: "#f59e0b" }}>4.9 / 5</div>
            <div style={{ fontSize: "14px", color: "#cbd5e1", marginTop: "4px", fontWeight: "500" }}>Rating Ulasan Booking.com</div>
          </div>
          <div>
            <div style={{ fontSize: "36px", fontWeight: "800", color: "#f59e0b" }}>15+</div>
            <div style={{ fontSize: "14px", color: "#cbd5e1", marginTop: "4px", fontWeight: "500" }}>Penghargaan Internasional</div>
          </div>
        </div>
      </section>

      {/* Welcome & Overview section */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #fbfaf7 0%, #f4eff2 50%, #eae5df 100%)",
          padding: "100px 20px",
          borderBottom: "1px solid #e7e5e4"
        }}
      >
        {/* Glow Blobs */}
        <div
          className="glow-blob animate-float-1"
          style={{
            top: "10%",
            right: "5%",
            width: "350px",
            height: "350px",
            background: "rgba(245, 158, 11, 0.15)"
          }}
        />
        <div
          className="glow-blob animate-float-2"
          style={{
            bottom: "10%",
            left: "5%",
            width: "400px",
            height: "400px",
            background: "rgba(224, 169, 109, 0.12)"
          }}
        />

        <div style={{ maxWidth: "1200px", margin: "auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#b45309",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  backgroundColor: "rgba(180, 83, 9, 0.08)",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  display: "inline-block",
                  marginBottom: "8px"
                }}
              >
                Tentang Hotel Kami
              </span>
              <h2 style={{ fontSize: "38px", fontWeight: "800", color: "#1c1917", margin: "12px 0 20px 0", lineHeight: "1.25", letterSpacing: "-0.5px" }}>
                Destinasi Sempurna untuk Menemukan Kedamaian Jiwa
              </h2>
              <p style={{ color: "#57534e", fontSize: "15px", lineHeight: "1.8", margin: "0 0 20px 0" }}>
                Didirikan di atas tebing pesisir pantai pulau dewata, Grand Horizon menggabungkan arsitektur modern kelas atas dengan kemegahan alam tropis. Pelayanan hangat khas Bali kami menjamin liburan Anda tak akan pernah terlupakan.
              </p>
              <p style={{ color: "#57534e", fontSize: "15px", lineHeight: "1.8", margin: "0 0 32px 0" }}>
                Setiap sudut resor dirancang secara cermat. Dari infinity pool rooftop hingga restoran tepi pantai kami, setiap detik di Grand Horizon didedikasikan untuk kenyamanan mutlak Anda.
              </p>
              <Link
                to="/about"
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#b45309",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(4px)";
                  e.currentTarget.style.color = "#d97706";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.color = "#b45309";
                }}
              >
                Pelajari Lebih Lengkap <span>→</span>
              </Link>
            </div>

            <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div
                style={{
                  position: "absolute",
                  width: "105%",
                  height: "105%",
                  borderRadius: "28px",
                  background: "radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)",
                  zIndex: -1
                }}
              />
              <img
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop"
                alt="Resort View"
                style={{ width: "100%", height: "420px", objectFit: "cover", borderRadius: "24px", boxShadow: "0 25px 50px rgba(0,0,0,0.12)", border: "1px solid rgba(255,255,255,0.4)" }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-20px",
                  left: "-20px",
                  backgroundColor: "rgba(255, 255, 255, 0.85)",
                  backdropFilter: "blur(16px)",
                  padding: "20px 30px",
                  borderRadius: "20px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.6)",
                  transition: "transform 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03) translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1) translateY(0)";
                }}
              >
                <div style={{ fontSize: "30px", fontWeight: "900", color: "#b45309", letterSpacing: "-0.5px" }}>9.8/10</div>
                <div style={{ fontSize: "12px", color: "#78716c", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "2px" }}>Skor Ulasan Tamu</div>
                <div style={{ fontSize: "11px", color: "#a8a29e", fontWeight: "500", marginTop: "1px" }}>(Luar Biasa)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms Section */}
      {!isLoading && featuredRooms.length > 0 && (
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(180deg, #0f172a 0%, #020617 100%)",
            padding: "100px 20px",
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
          }}
        >
          {/* Subtle warm glow blobs for dark mode depth */}
          <div
            className="glow-blob animate-float-1"
            style={{
              top: "20%",
              left: "10%",
              width: "450px",
              height: "450px",
              background: "rgba(245, 158, 11, 0.04)"
            }}
          />
          <div
            className="glow-blob animate-float-2"
            style={{
              bottom: "10%",
              right: "5%",
              width: "500px",
              height: "500px",
              background: "rgba(59, 130, 246, 0.03)"
            }}
          />

          <div style={{ maxWidth: "1200px", margin: "auto", position: "relative", zIndex: 1 }}>
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#fbbf24",
                  textTransform: "uppercase",
                  letterSpacing: "2.5px",
                  backgroundColor: "rgba(245, 158, 11, 0.12)",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  display: "inline-block",
                  marginBottom: "8px"
                }}
              >
                Akomodasi Unggulan
              </span>
              <h2
                style={{
                  fontSize: "38px",
                  fontWeight: "900",
                  color: "#ffffff",
                  margin: "12px 0 0 0",
                  letterSpacing: "-0.5px",
                  textShadow: "0 2px 10px rgba(0,0,0,0.3)"
                }}
              >
                Pilihan Kamar Terpopuler
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" }}>
              {featuredRooms.map((room) => (
                <div
                  key={room.id}
                  style={{
                    backgroundColor: "rgba(30, 41, 59, 0.4)",
                    backdropFilter: "blur(12px)",
                    borderRadius: "24px",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.25)";
                    e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 25px rgba(245, 158, 11, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                    e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.2)";
                  }}
                >
                  <div style={{ position: "relative", height: "240px", overflow: "hidden" }}>
                    <img
                      src={room.image_url || room.image || "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600&auto=format&fit=crop"}
                      alt={`Room ${room.room_number}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    />
                  </div>
                  <div style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#fbbf24", textTransform: "uppercase", letterSpacing: "1px" }}>
                          {room.type_name || "Standard Room"}
                        </span>
                        <span style={{ fontSize: "11px", backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#fef08a", padding: "3px 10px", borderRadius: "12px", fontWeight: "700", letterSpacing: "0.5px" }}>
                          Promo Spesial
                        </span>
                      </div>
                      <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#ffffff", margin: "0 0 12px 0", letterSpacing: "-0.3px" }}>
                        Kamar {room.room_number}
                      </h3>
                      <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6", margin: "0 0 16px 0", height: "48px", overflow: "hidden" }}>
                        {room.description || "Kamar premium dengan tempat tidur nyaman, AC, smart TV, kamar mandi privat, dan Wi-Fi."}
                      </p>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "18px", marginTop: "16px" }}>
                      <div>
                        <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tarif Permalam</span>
                        <div style={{ fontSize: "20px", fontWeight: "800", color: "#fbbf24", marginTop: "2px" }}>{formatRupiah(room.price)}</div>
                      </div>
                      <Link
                        to={`/rooms-list/${room.id}`}
                        style={{
                          padding: "11px 22px",
                          borderRadius: "10px",
                          backgroundColor: "#b45309",
                          color: "#fff",
                          textDecoration: "none",
                          fontSize: "13.5px",
                          fontWeight: "700",
                          boxShadow: "0 4px 12px rgba(180, 83, 9, 0.25)",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#d97706";
                          e.currentTarget.style.boxShadow = "0 6px 18px rgba(180, 83, 9, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#b45309";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(180, 83, 9, 0.25)";
                        }}
                      >
                        Pesan Sekarang
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Keunggulan Hotel Section */}
      <section style={{ backgroundColor: "#1e1b4b", color: "#fff", padding: "80px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "2px" }}>
              Mengapa Memilih Kami
            </span>
            <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#ffffff", margin: "12px 0 0 0" }}>
              Keunggulan Eksklusif Grand Horizon
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "30px" }}>
            <div style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "30px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>🏖️</div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#f59e0b", margin: "0 0 10px 0" }}>Pantai Pribadi Eksotis</h3>
              <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: "1.6", margin: 0 }}>
                Akses langsung ke pasir putih pantai pribadi yang bersih dan sunset terbaik Bali sepanjang 1 km.
              </p>
            </div>
            <div style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "30px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>🤵</div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#f59e0b", margin: "0 0 10px 0" }}>Butler Pribadi 24 Jam</h3>
              <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: "1.6", margin: 0 }}>
                Pelayanan butler eksklusif siap memenuhi segala kebutuhan bersantai dan liburan Anda sepanjang hari.
              </p>
            </div>
            <div style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "30px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>🍳</div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#f59e0b", margin: "0 0 10px 0" }}>Kuliner Kelas Dunia</h3>
              <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: "1.6", margin: 0 }}>
                Restoran fine dining dengan koki peraih bintang Michelin menyajikan hidangan lokal & internasional terbaik.
              </p>
            </div>
            <div style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "30px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>💆</div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#f59e0b", margin: "0 0 10px 0" }}>Spa Tradisional Bali</h3>
              <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: "1.6", margin: 0 }}>
                Perawatan spa eksklusif di tebing pantai dengan aromaterapi lokal menenangkan jiwa dan raga Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hotel Gallery Section */}
      <section style={{ background: "linear-gradient(180deg, #ffffff 0%, #fbfaf7 100%)", padding: "80px 20px", borderTop: "1px solid #e7e5e4" }}>
        <div style={{ maxWidth: "1200px", margin: "auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#b45309", textTransform: "uppercase", letterSpacing: "2px" }}>
              Galeri Visual
            </span>
            <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#1c1917", margin: "12px 0 16px 0" }}>
              Kemewahan Grand Horizon
            </h2>
            <p style={{ color: "#78716c", maxWidth: "600px", margin: "0 auto", fontSize: "15px", lineHeight: "1.6" }}>
              Intip sudut-sudut kenyamanan terbaik yang kami sediakan untuk pengalaman berlibur impian Anda.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
            {galleryItems.map((item, index) => (
              <div
                key={index}
                onClick={() => setSelectedImage(item)}
                style={{
                  position: "relative",
                  borderRadius: "16px",
                  overflow: "hidden",
                  height: "230px",
                  cursor: "zoom-in",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                  transition: "all 0.3s ease",
                  backgroundColor: "#f5f5f4"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.boxShadow = "0 12px 24px rgba(0, 0, 0, 0.15)";
                  const overlay = e.currentTarget.querySelector(".gallery-overlay");
                  if (overlay) overlay.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.05)";
                  const overlay = e.currentTarget.querySelector(".gallery-overlay");
                  if (overlay) overlay.style.opacity = "0";
                }}
              >
                <img src={item.url} alt={item.caption} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div
                  className="gallery-overlay"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(15, 23, 42, 0.5)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    padding: "20px",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                    boxSizing: "border-box"
                  }}
                >
                  <span style={{ fontSize: "11px", color: "#f59e0b", textTransform: "uppercase", fontWeight: "700", letterSpacing: "1px", marginBottom: "4px" }}>
                    {item.category}
                  </span>
                  <h4 style={{ color: "#ffffff", margin: 0, fontSize: "16px", fontWeight: "700" }}>{item.caption}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimoni Pelanggan Section */}
      <section style={{ background: "linear-gradient(135deg, #fbfbfa 0%, #f5f2eb 100%)", padding: "80px 20px", borderTop: "1px solid #e7e5e4" }}>
        <div style={{ maxWidth: "1200px", margin: "auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#b45309", textTransform: "uppercase", letterSpacing: "2px" }}>
              Ulasan Tamu
            </span>
            <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#1c1917", margin: "12px 0 0 0" }}>
              Apa Kata Tamu Kami
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
            <div style={{ backgroundColor: "#fff", border: "1px solid #e7e5e4", borderRadius: "20px", padding: "30px", boxShadow: "0 4px 6px rgba(0,0,0,0.01)" }}>
              <div style={{ color: "#f59e0b", fontSize: "16px", marginBottom: "12px" }}>⭐⭐⭐⭐⭐</div>
              <p style={{ color: "#57534e", fontSize: "14.5px", lineHeight: "1.6", margin: "0 0 20px 0" }}>
                "Sangat menakjubkan! Pemandangan kamar ke arah samudera langsung begitu indah. Butler pribadi sangat ramah dan membantu memesankan sunset dinner romantis di pantai."
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#b45309", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
                  H
                </div>
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#1c1917", margin: 0 }}>Hendry Wijaya</h4>
                  <span style={{ fontSize: "12px", color: "#78716c" }}>Keluarga • Menginap di Suite Room</span>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: "#fff", border: "1px solid #e7e5e4", borderRadius: "20px", padding: "30px", boxShadow: "0 4px 6px rgba(0,0,0,0.01)" }}>
              <div style={{ color: "#f59e0b", fontSize: "16px", marginBottom: "12px" }}>⭐⭐⭐⭐⭐</div>
              <p style={{ color: "#57534e", fontSize: "14.5px", lineHeight: "1.6", margin: "0 0 20px 0" }}>
                "Kolam renang infinity rooftop hotel ini adalah yang terbaik di Bali. Menu sarapannya sangat bervariasi dan rasanya lezat kelas dunia. Pasti akan kembali ke Grand Horizon lagi."
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#1e1b4b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
                  A
                </div>
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#1c1917", margin: 0 }}>Anisa Rahmawati</h4>
                  <span style={{ fontSize: "12px", color: "#78716c" }}>Pasangan • Menginap di Deluxe Room</span>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: "#fff", border: "1px solid #e7e5e4", borderRadius: "20px", padding: "30px", boxShadow: "0 4px 6px rgba(0,0,0,0.01)" }}>
              <div style={{ color: "#f59e0b", fontSize: "16px", marginBottom: "12px" }}>⭐⭐⭐⭐⭐</div>
              <p style={{ color: "#57534e", fontSize: "14.5px", lineHeight: "1.6", margin: "0 0 20px 0" }}>
                "Proses check-in sangat mulus, kamarnya wangi, bersih, dan sangat luas. Lokasi hotel sangat strategis dan memiliki area pantai privat sehingga suasananya tenang dan tidak ramai."
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#0f766e", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
                  R
                </div>
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#1c1917", margin: 0 }}>Rizky Pratama</h4>
                  <span style={{ fontSize: "12px", color: "#78716c" }}>Solo Traveler • Menginap di Super Deluxe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps Location Section */}
      <section style={{ backgroundColor: "#fbfaf7", padding: "80px 20px", borderTop: "1px solid #e7e5e4" }}>
        <div style={{ maxWidth: "1200px", margin: "auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#b45309", textTransform: "uppercase", letterSpacing: "2px" }}>
              Lokasi Hotel
            </span>
            <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#1c1917", margin: "12px 0 16px 0" }}>
              Peta Petunjuk Lokasi
            </h2>
            <p style={{ color: "#78716c", maxWidth: "600px", margin: "0 auto", fontSize: "15px", lineHeight: "1.6" }}>
              Terletak strategis di kawasan wisata Nusa Dua, Bali, sangat mudah dijangkau dari Bandara Internasional Ngurah Rai (25 menit).
            </p>
          </div>

          <div style={{ width: "100%", height: "450px", borderRadius: "24px", overflow: "hidden", border: "1px solid #e7e5e4", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)" }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15771.597652758408!2d115.21637775535359!3d-8.807897291244837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd244bf38f8cfc9%3A0xe54ef9861614f885!2sNusa%20Dua%20Beach!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Grand Horizon Location"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Lightbox / Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            cursor: "zoom-out",
            animation: "fadeIn 0.2s ease-out"
          }}
        >
          <div style={{ position: "relative", maxWidth: "90%", maxHeight: "85vh", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.url}
              alt={selectedImage.caption}
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: "12px",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                border: "1px solid rgba(255, 255, 255, 0.1)"
              }}
            />
            <h4 style={{ color: "#ffffff", marginTop: "16px", fontSize: "18px", fontWeight: "600", letterSpacing: "0.5px", marginBottom: "4px" }}>
              {selectedImage.caption}
            </h4>
            <span style={{ color: "#f59e0b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>
              {selectedImage.category}
            </span>
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: "absolute",
                top: "-40px",
                right: "0px",
                background: "none",
                border: "none",
                color: "#ffffff",
                fontSize: "30px",
                cursor: "pointer"
              }}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
