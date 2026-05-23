import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient"; // Pastikan path ini benar!

export default function CustomersCreate() {
  const navigate = useNavigate();

  // State untuk indikator loading saat submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State baru untuk menampilkan Modal Sukses
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // State untuk menyimpan data form pelanggan baru
  const [formData, setFormData] = useState({
    name: "",
    nik: "",
    contact: "",
    address: "",
    city: "",
    status: "active", // PENTING: Harus "active" agar sesuai aturan DB, bukan "Aktif"
  });

  // Fungsi untuk menangani perubahan input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fungsi untuk mengirim data ke Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("customers").insert([
        {
          nama_pelanggan: formData.name,
          nik: formData.nik,
          kontak: formData.contact,
          alamat: formData.address,
          kota: formData.city,
          status: formData.status,
        },
      ]);

      if (error) throw error;

      // 1. Tampilkan Modal Sukses
      setShowSuccessModal(true);
      setIsSubmitting(false);

      // 2. Set Timer 2 Detik sebelum otomatis pindah halaman
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/customers");
      }, 2000);
    } catch (error) {
      console.error("Error inserting customer:", error.message);
      alert("Gagal menambahkan pelanggan: " + error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="container-fluid py-4 min-vh-100"
      style={{ backgroundColor: "#f8fafc" }}
    >
      {/* Header Halaman */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h5
            className="fw-bold text-dark mb-1"
            style={{ color: "#0f172a", letterSpacing: "-0.2px" }}
          >
            Registrasi Pelanggan Baru
          </h5>
        </div>
        <Link
          to="/customers"
          className="btn btn-sm btn-white border border-light-subtle text-secondary shadow-sm px-3 py-2 fw-medium"
          style={{
            borderRadius: "6px",
            fontSize: "0.825rem",
            backgroundColor: "#ffffff",
          }}
        >
          <i
            className="fas fa-arrow-left me-2"
            style={{ fontSize: "0.75rem" }}
          ></i>
          Kembali
        </Link>
      </div>

      {/* Form Card Utama */}
      <div
        className="card shadow-sm border-0"
        style={{ borderRadius: "8px", backgroundColor: "#ffffff" }}
      >
        <div className="card-body p-4 p-md-5">
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* === KOLOM KIRI: Data Identitas Pelanggan === */}
              <div className="col-12 col-md-6 pe-md-4">
                <div
                  className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom"
                  style={{ borderColor: "#f1f5f9" }}
                >
                  <i
                    className="fas fa-user-id-card text-secondary"
                    style={{ fontSize: "0.9rem", color: "#64748b" }}
                  ></i>
                  <h6
                    className="fw-bold text-uppercase mb-0"
                    style={{
                      color: "#475569",
                      fontSize: "0.75rem",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Identitas Pelanggan
                  </h6>
                </div>

                <div className="mb-3">
                  <label
                    className="form-label text-dark small fw-semibold"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control border border-light-subtle shadow-none py-2"
                    style={{
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      color: "#1e293b",
                      backgroundColor: "#ffffff",
                    }}
                    placeholder="Masukkan nama lengkap pelanggan sesuai kartu identitas..."
                    required
                  />
                </div>

                <div className="mb-3">
                  <label
                    className="form-label text-dark small fw-semibold"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Nomor Induk Kependudukan (NIK)
                  </label>
                  <input
                    type="number"
                    name="nik"
                    value={formData.nik}
                    onChange={handleChange}
                    className="form-control border border-light-subtle shadow-none py-2 fw-mono"
                    style={{
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      color: "#1e293b",
                      backgroundColor: "#ffffff",
                    }}
                    placeholder="Masukkan 16 digit angka NIK..."
                    required
                  />
                </div>

                <div className="mb-3">
                  <label
                    className="form-label text-dark small fw-semibold"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Kontak / WhatsApp
                  </label>
                  <div className="input-group">
                    <span
                      className="input-group-text bg-light text-secondary border border-light-subtle"
                      style={{ fontSize: "0.85rem" }}
                    >
                      <i className="fab fa-whatsapp text-success"></i>
                    </span>
                    <input
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      className="form-control border border-light-subtle shadow-none py-2"
                      style={{
                        borderRadius: "0 6px 6px 0",
                        fontSize: "0.85rem",
                        color: "#1e293b",
                        backgroundColor: "#ffffff",
                      }}
                      placeholder="Contoh: 081234567890"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* === KOLOM KANAN: Lokasi & Administrasi === */}
              <div
                className="col-12 col-md-6 ps-md-4 border-start-md"
                style={{ borderLeft: "1px solid #f1f5f9" }}
              >
                <div
                  className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom"
                  style={{ borderColor: "#f1f5f9" }}
                >
                  <i
                    className="fas fa-map-marker-alt text-secondary"
                    style={{ fontSize: "0.9rem", color: "#64748b" }}
                  ></i>
                  <h6
                    className="fw-bold text-uppercase mb-0"
                    style={{
                      color: "#475569",
                      fontSize: "0.75rem",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Lokasi & Administrasi
                  </h6>
                </div>

                <div className="mb-3">
                  <label
                    className="form-label text-dark small fw-semibold"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Alamat Lengkap (Domisili)
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-control border border-light-subtle shadow-none py-2"
                    rows="3"
                    style={{
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      color: "#1e293b",
                      backgroundColor: "#ffffff",
                      resize: "none",
                    }}
                    placeholder="Masukkan alamat domisili operasional saat ini..."
                    required
                  ></textarea>
                </div>

                <div className="row">
                  <div className="col-12 col-sm-6 mb-3">
                    <label
                      className="form-label text-dark small fw-semibold"
                      style={{ fontSize: "0.8rem" }}
                    >
                      Kota
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="form-control border border-light-subtle shadow-none py-2"
                      style={{
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        color: "#1e293b",
                        backgroundColor: "#ffffff",
                      }}
                      placeholder="Contoh: Makassar"
                      required
                    />
                  </div>
                  <div className="col-12 col-sm-6 mb-3">
                    <label
                      className="form-label text-dark small fw-semibold"
                      style={{ fontSize: "0.8rem" }}
                    >
                      Status Operasional
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="form-select border border-light-subtle shadow-none py-2 fw-semibold"
                      style={{
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        color:
                          formData.status === "blacklist"
                            ? "#dc2626"
                            : "#15803d",
                        backgroundColor: "#ffffff",
                      }}
                      required
                    >
                      <option value="active" style={{ color: "#15803d" }}>
                        🟢 Aktif
                      </option>
                      <option value="blacklist" style={{ color: "#dc2626" }}>
                        🔴 Blacklist
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Baris Tombol Aksi Form */}
            <div
              className="d-flex justify-content-end gap-2 mt-5 border-top pt-4"
              style={{ borderColor: "#f1f5f9" }}
            >
              <Link
                to="/customers"
                className="btn btn-sm btn-white border border-light-subtle px-4 py-2 fw-semibold text-secondary"
                style={{ borderRadius: "6px", fontSize: "0.825rem" }}
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-sm text-white px-4 py-2 fw-semibold shadow-sm d-flex align-items-center gap-2"
                style={{
                  borderRadius: "6px",
                  fontSize: "0.825rem",
                  backgroundColor: "#0284c7", // Pronto Corporate Sky-Blue
                  borderColor: "#0284c7",
                  opacity: isSubmitting ? 0.75 : 1,
                }}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                      style={{ width: "14px", height: "14px" }}
                    ></span>
                    <span>Memproses Data...</span>
                  </>
                ) : (
                  <>
                    <i
                      className="fas fa-save"
                      style={{ fontSize: "0.75rem" }}
                    ></i>
                    <span>Kirim</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* --- MODAL POP UP SUKSES (AUTO CLOSE) --- */}
      {showSuccessModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 1050,
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: "360px" }}
          >
            <div
              className="modal-content border-0 shadow-sm"
              style={{ borderRadius: "8px", backgroundColor: "#ffffff" }}
            >
              <div className="modal-body p-4 text-center">
                {/* Ikon Box Sukses Terbuka */}
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "6px",
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <i
                    className="fas fa-check fs-4"
                    style={{ color: "#16a34a" }}
                  ></i>
                </div>

                <h6
                  className="fw-bold text-dark mb-2"
                  style={{ fontSize: "1rem", color: "#0f172a" }}
                >
                  Berhasil Ditambahkan!
                </h6>
                <p
                  className="text-secondary mb-4 px-1"
                  style={{ fontSize: "0.85rem", lineHeight: "1.5" }}
                >
                  Entitas pelanggan baru bernama
                  <span
                    className="d-block fw-bold text-dark my-1"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {formData.name}
                  </span>
                  telah berhasil dicatatkan ke dalam sistem database.
                </p>

                {/* Indikator Redirection */}
                <div
                  className="d-flex align-items-center justify-content-center py-2 px-3 rounded-2 mx-auto"
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    width: "fit-content",
                    fontSize: "0.775rem",
                  }}
                >
                  <div
                    className="spinner-border text-primary me-2"
                    role="status"
                    style={{
                      width: "12px",
                      height: "12px",
                      borderWidth: "2px",
                      color: "#0284c7",
                    }}
                  ></div>
                  <span className="text-secondary fw-medium">
                    Mengalihkan halaman...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
