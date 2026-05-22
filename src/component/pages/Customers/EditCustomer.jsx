import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../supabaseClient";

export default function EditCustomer() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    nik: "",
    contact: "",
    address: "",
    city: "",
    status: "active",
  });

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const { data, error } = await supabase
          .from("customers")
          .select("*")
          .eq("customer_id", id)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            name: data.nama_pelanggan || "",
            nik: data.nik || "",
            contact: data.kontak || "",
            address: data.alamat || "",
            city: data.kota || "",
            status: data.status || "active",
          });
        }
      } catch (error) {
        console.error("Error fetching customer details:", error.message);
        alert("Gagal memuat data pelanggan.");
        navigate("/customers");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("customers")
        .update({
          nama_pelanggan: formData.name,
          nik: formData.nik,
          kontak: formData.contact,
          alamat: formData.address,
          kota: formData.city,
          status: formData.status,
        })
        .eq("customer_id", id);

      if (error) throw error;

      setShowSuccessModal(true);
      setIsSubmitting(false);

      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/customers");
      }, 2000);
    } catch (error) {
      console.error("Error updating customer:", error.message);
      alert("Gagal memperbarui data: " + error.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container-fluid py-4 bg-light min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center text-muted">
          <div className="spinner-border mb-2 text-warning" role="status"></div>
          <p>Memuat data pelanggan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      {/* Header Halaman */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h4
            className="fw-bold text-dark mb-1"
            style={{ color: "#0f172a", letterSpacing: "-0.2px" }}
          >
            Edit Data Pelanggan
          </h4>
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

      {/* Card Form Utama */}
      <div className="card shadow-sm border-0 rounded-3 bg-white">
        <div className="card-body p-4 p-lg-5">
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* === KOLOM KIRI === */}
              <div className="col-md-6 pe-md-4">
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
                  <label className="form-label text-secondary small fw-bold">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control bg-light border-0 py-2 custom-input"
                    style={{ borderRadius: "6px", color: "#334155" }}
                    placeholder="Masukkan nama lengkap pelanggan..."
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">
                    Nomor Induk Kependudukan (NIK)
                  </label>
                  <input
                    type="number"
                    name="nik"
                    value={formData.nik}
                    onChange={handleChange}
                    className="form-control bg-light border-0 py-2 custom-input"
                    style={{ borderRadius: "6px", color: "#334155" }}
                    placeholder="Masukkan 16 digit NIK..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">
                    Kontak / WhatsApp
                  </label>
                  <div className="input-group">
                    <span
                      className="input-group-text bg-light text-secondary border-0"
                      style={{ fontSize: "0.85rem" }}
                    >
                      <i className="fab fa-whatsapp text-success"></i>
                    </span>
                    <input
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      className="form-control bg-light border-0 py-2 custom-input"
                      style={{ borderRadius: "0 6px 6px 0", color: "#334155" }}
                      placeholder="Contoh: 081234567890"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* === KOLOM KANAN === */}
              <div
                className="col-md-6 ps-md-4 border-start-md"
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
                  <label className="form-label text-secondary small fw-bold">
                    Alamat Lengkap (Domisili)
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-control bg-light border-0 py-2 custom-input"
                    style={{
                      borderRadius: "6px",
                      color: "#334155",
                      resize: "none",
                    }}
                    rows="3"
                    placeholder="Masukkan alamat domisili pelanggan..."
                    required
                  ></textarea>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Kota Rental
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="form-control bg-light border-0 py-2 custom-input"
                      style={{ borderRadius: "6px", color: "#334155" }}
                      placeholder="Contoh: Makassar"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Status Pelanggan
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="form-select bg-light border-0 py-2 custom-input fw-semibold"
                      style={{
                        borderRadius: "6px",
                        color:
                          formData.status === "blacklist"
                            ? "#dc2626"
                            : "#15803d",
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

            {/* Tombol Aksi */}
            <div
              className="d-flex justify-content-end gap-3 mt-5 pt-4"
              style={{ borderTop: "1px solid #e2e8f0" }}
            >
              <Link
                to="/customers"
                className="btn px-4 py-2 fw-bold text-secondary transition-all"
                style={{
                  backgroundColor: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "0.825rem",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e2e8f0")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f1f5f9")
                }
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
                  backgroundColor: "#0284c7",
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

      {/* --- MODAL POP UP SUKSES TEMA TERANG (AUTO CLOSE) --- */}
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
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: "12px", backgroundColor: "#ffffff" }}
            >
              <div className="modal-body p-4 text-center">
                {/* Ikon Centang Oranye Amber */}
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center text-white shadow-sm"
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "#f59e0b",
                  }}
                >
                  <i className="fas fa-check fs-4"></i>
                </div>

                <h5
                  className="fw-bold text-dark mb-2"
                  style={{ fontSize: "1.05rem" }}
                >
                  Berhasil Disimpan!
                </h5>
                <p
                  className="text-muted mb-4"
                  style={{ fontSize: "0.85rem", lineHeight: "1.5" }}
                >
                  Data pelanggan{" "}
                  <span className="fw-bold text-dark">{formData.name}</span>{" "}
                  telah berhasil diperbarui di sistem ERP.
                </p>

                {/* Indikator Loading */}
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
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    style={{
                      width: "12px",
                      height: "12px",
                      color: "#f59e0b",
                      borderWidth: "2px",
                    }}
                  ></div>
                  <span className="text-muted fw-medium">Mengalihkan...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
