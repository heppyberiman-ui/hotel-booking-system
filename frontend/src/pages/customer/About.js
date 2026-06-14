import React from "react";

function About() {
  const stats = [
    { label: "Kamar Mewah", value: "120+" },
    { label: "Kolam Renang Infinity", value: "2" },
    { label: "Restoran Bintang Lima", value: "3" },
    { label: "Penghargaan Hotel", value: "15+" }
  ];

  const testimonials = [
    {
      name: "Rian Dwi",
      role: "Family Traveler",
      avatar: "R",
      comment: "Menginap di Grand Horizon adalah pengalaman terbaik untuk keluarga saya. Pelayanan butler 24 jam sangat membantu, dan pemandangan dari kamar benar-benar tidak tertandingi!",
      rating: 5
    },
    {
      name: "Sarah Wijaya",
      role: "Honeymoon Couple",
      avatar: "S",
      comment: "Hotel paling romantis di Bali. Kolam renang infinity rooftop sangat indah, terutama saat matahari terbenam. Kami pasti akan kembali lagi tahun depan!",
      rating: 5
    },
    {
      name: "Marcus Aurelius",
      role: "Business Traveler",
      avatar: "M",
      comment: "Fasilitas gym dan spa yang sangat lengkap. Koneksi internet cepat dan area lounge di lantai 16 sangat nyaman untuk bekerja sembari bersantai.",
      rating: 5
    }
  ];

  return (
    <div style={{ animation: "fadeIn 0.6s ease", backgroundColor: "#fafaf9", color: "#1c1917" }}>
      {/* Mini Hero Section */}
      <section
        style={{
          position: "relative",
          height: "300px",
          background: "linear-gradient(rgba(28, 25, 23, 0.7), rgba(28, 25, 23, 0.5)), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600&auto=format&fit=crop') center/cover no-repeat",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          textAlign: "center",
          padding: "0 20px"
        }}
      >
        <h2 style={{ fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "3px", color: "#f59e0b", marginBottom: "12px" }}>
          Tentang Kami
        </h2>
        <h1 style={{ fontSize: "36px", fontWeight: "800", margin: 0, letterSpacing: "-1px" }}>
          Grand Horizon Hotel & Resort
        </h1>
      </section>

      {/* Story Section */}
      <section style={{ padding: "80px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#b45309", textTransform: "uppercase", letterSpacing: "2px" }}>
              Kisah Kami
            </span>
            <h2 style={{ fontSize: "28px", fontWeight: "800", margin: "12px 0 20px 0", lineHeight: "1.3" }}>
              Menghadirkan Seni Keramahan Terbaik Sejak 2020
            </h2>
            <p style={{ color: "#57534e", fontSize: "15px", lineHeight: "1.7", marginBottom: "20px" }}>
              Didirikan dengan visi untuk menciptakan tempat perlindungan pesisir pantai yang mewah, Grand Horizon memadukan warisan budaya lokal Bali yang kaya dengan kenyamanan modern berstandar internasional.
            </p>
            <p style={{ color: "#57534e", fontSize: "15px", lineHeight: "1.7", marginBottom: "30px" }}>
              Kami berkomitmen untuk memberikan pengalaman yang dipersonalisasi untuk setiap tamu. Mulai dari penjemputan bandara VIP hingga butler pribadi yang siap memenuhi kebutuhan Anda, kami memastikan setiap momen menginap Anda dipenuhi oleh kehangatan dan kesempurnaan.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ borderLeft: "4px solid #b45309", paddingLeft: "16px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 6px 0" }}>Visi Kami</h4>
                <p style={{ fontSize: "13px", color: "#78716c", margin: 0, lineHeight: "1.5" }}>
                  Menjadi destinasi resort luxury nomor satu di Asia dengan pelayanan terintegrasi dan berkelanjutan.
                </p>
              </div>
              <div style={{ borderLeft: "4px solid #b45309", paddingLeft: "16px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 6px 0" }}>Misi Kami</h4>
                <p style={{ fontSize: "13px", color: "#78716c", margin: 0, lineHeight: "1.5" }}>
                  Menyediakan akomodasi berkelas tinggi dengan tetap menjaga kelestarian alam dan budaya Bali.
                </p>
              </div>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <img
              src="https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800&auto=format&fit=crop"
              alt="Lobby Grand Horizon"
              style={{ width: "100%", height: "450px", objectFit: "cover", borderRadius: "24px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.08)" }}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ backgroundColor: "#1c1917", color: "#fff", padding: "60px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "40px", textAlign: "center" }}>
          {stats.map((stat, idx) => (
            <div key={idx}>
              <div style={{ fontSize: "40px", fontWeight: "800", color: "#f59e0b", marginBottom: "8px" }}>{stat.value}</div>
              <div style={{ fontSize: "14px", color: "#a8a29e", fontWeight: "500" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services & Facilities Details */}
      <section style={{ padding: "80px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#b45309", textTransform: "uppercase", letterSpacing: "2px" }}>
            Nilai Keunggulan
          </span>
          <h2 style={{ fontSize: "28px", fontWeight: "800", margin: "10px 0 0 0" }}>
            Mengapa Memilih Kami?
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "30px" }}>
          <div style={{ backgroundColor: "#fff", padding: "40px", borderRadius: "20px", border: "1px solid #e7e5e4", textAlign: "center" }}>
            <span style={{ fontSize: "40px" }}>🛎️</span>
            <h3 style={{ fontSize: "18px", fontWeight: "700", margin: "20px 0 10px 0" }}>Layanan Butler 24 Jam</h3>
            <p style={{ fontSize: "14px", color: "#57534e", lineHeight: "1.6", margin: 0 }}>
              Setiap tamu mendapatkan asisten pribadi yang siap membantu pemesanan restoran, aktivitas luar ruangan, hingga setrika pakaian.
            </p>
          </div>

          <div style={{ backgroundColor: "#fff", padding: "40px", borderRadius: "20px", border: "1px solid #e7e5e4", textAlign: "center" }}>
            <span style={{ fontSize: "40px" }}>🌊</span>
            <h3 style={{ fontSize: "18px", fontWeight: "700", margin: "20px 0 10px 0" }}>Akses Pantai Privat</h3>
            <p style={{ fontSize: "14px", color: "#57534e", lineHeight: "1.6", margin: 0 }}>
              Nikmati keindahan pasir putih bersih Bali langsung dari resort tanpa keramaian pengunjung publik.
            </p>
          </div>

          <div style={{ backgroundColor: "#fff", padding: "40px", borderRadius: "20px", border: "1px solid #e7e5e4", textAlign: "center" }}>
            <span style={{ fontSize: "40px" }}>🍳</span>
            <h3 style={{ fontSize: "18px", fontWeight: "700", margin: "20px 0 10px 0" }}>Kuliner Kelas Dunia</h3>
            <p style={{ fontSize: "14px", color: "#57534e", lineHeight: "1.6", margin: 0 }}>
              Santapan lezat buatan koki bintang Michelin yang menggabungkan cita rasa lokal dengan resep khas barat.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ backgroundColor: "#f5f5f4", padding: "80px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#b45309", textTransform: "uppercase", letterSpacing: "2px" }}>
              Ulasan Tamu
            </span>
            <h2 style={{ fontSize: "28px", fontWeight: "800", margin: "10px 0 0 0" }}>
              Apa Kata Mereka Tentang Kami
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "30px" }}>
            {testimonials.map((test, idx) => (
              <div key={idx} style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "20px", border: "1px solid #e7e5e4", display: "flex", flexDirection: "column", justifyContext: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: "14px", color: "#57534e", lineHeight: "1.6", fontStyle: "italic", margin: "0 0 20px 0" }}>
                  "{test.comment}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#b45309", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
                    {test.avatar}
                  </div>
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: "700", margin: 0 }}>{test.name}</h4>
                    <span style={{ fontSize: "12px", color: "#78716c" }}>{test.role}</span>
                  </div>
                  <div style={{ marginLeft: "auto", color: "#f59e0b", fontSize: "14px" }}>
                    {"★".repeat(test.rating)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map and Location Section */}
      <section style={{ padding: "80px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#b45309", textTransform: "uppercase", letterSpacing: "2px" }}>
              Lokasi Kami
            </span>
            <h2 style={{ fontSize: "28px", fontWeight: "800", margin: "10px 0 20px 0" }}>
              Sangat Mudah Dijangkau
            </h2>
            <p style={{ color: "#57534e", fontSize: "15px", lineHeight: "1.7", marginBottom: "20px" }}>
              Grand Horizon Hotel & Resort berlokasi strategis di kawasan eksklusif Nusa Dua, Bali. Hanya berjarak 20 menit berkendara dari Bandara Internasional Ngurah Rai (DPS).
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", color: "#57534e" }}>
              <div>📍 <strong>Alamat:</strong> Jl. Horizon Indah No. 88, Bali, Indonesia</div>
              <div>📞 <strong>Telepon:</strong> +62 21 9999 8888</div>
              <div>✉️ <strong>Email:</strong> info@grandhorizon.com</div>
            </div>
          </div>

          {/* Map Mockup */}
          <div style={{ height: "350px", border: "1px solid #e7e5e4", borderRadius: "24px", overflow: "hidden", position: "relative", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
            <div style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#e2e8f0",
              backgroundImage: "radial-gradient(#cbd5e1 2px, transparent 2px)",
              backgroundSize: "24px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b"
            }}>
              <span style={{ fontSize: "48px", animation: "bounce 2s infinite" }}>📍</span>
              <div style={{ fontWeight: "700", fontSize: "16px", color: "#334155", marginTop: "10px" }}>Grand Horizon Hotel & Resort</div>
              <div style={{ fontSize: "12px" }}>Kawasan Pesisir Nusa Dua, Bali</div>
              
              {/* Fake Map Elements for premium look */}
              <div style={{ position: "absolute", top: "10%", left: "15%", width: "120px", height: "6px", backgroundColor: "#cbd5e1", transform: "rotate(15deg)", borderRadius: "4px" }}></div>
              <div style={{ position: "absolute", bottom: "20%", right: "10%", width: "160px", height: "6px", backgroundColor: "#cbd5e1", transform: "rotate(-30deg)", borderRadius: "4px" }}></div>
              <div style={{ position: "absolute", top: "40%", right: "20%", width: "80px", height: "6px", backgroundColor: "#cbd5e1", transform: "rotate(45deg)", borderRadius: "4px" }}></div>
              <div style={{ position: "absolute", bottom: "40%", left: "30%", width: "6px", height: "120px", backgroundColor: "#cbd5e1", borderRadius: "4px" }}></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
