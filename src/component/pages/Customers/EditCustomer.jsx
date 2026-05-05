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

      // 1. Tampilkan Modal Sukses
      setShowSuccessModal(true);
      setIsSubmitting(false);

      // 2. Set Timer 2 Detik (2000 ms) sebelum otomatis pindah halaman
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
          <div className="spinner-border mb-2" role="status"></div>
          <p>Memuat data pelanggan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      {/* Header Halaman */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Edit Data Pelanggan</h4>
          <p className="text-muted small mb-0">
            Perbarui informasi detail pelanggan rental.
          </p>
        </div>
        <Link to="/customers" className="btn btn-outline-secondary shadow-sm px-3">
          <i className="fas fa-arrow-left me-2"></i>Kembali
        </Link>
      </div>

      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-body p-4 p-lg-5">
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              
              {/* === KOLOM KIRI === */}
              <div className="col-md-6">
                <h6 className="fw-bold text-primary mb-3">Identitas Pelanggan</h6>
                
                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">Nama Lengkap</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control bg-light border-0 py-2"
                    placeholder="Masukkan nama lengkap pelanggan..."
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">Nomor Induk Kependudukan (NIK)</label>
                  <input
                    type="number"
                    name="nik"
                    value={formData.nik}
                    onChange={handleChange}
                    className="form-control bg-light border-0 py-2"
                    placeholder="Masukkan 16 digit NIK..."
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">Kontak / WhatsApp</label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className="form-control bg-light border-0 py-2"
                    placeholder="Contoh: 081234567890"
                    required
                  />
                </div>
              </div>

              {/* === KOLOM KANAN === */}
              <div className="col-md-6">
                <h6 className="fw-bold text-success mb-3">Lokasi & Administrasi</h6>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">Alamat Lengkap (Domisili)</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-control bg-light border-0 py-2"
                    rows="3"
                    placeholder="Masukkan alamat domisili pelanggan..."
                    required
                  ></textarea>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-secondary small fw-bold">Kota Rental</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="form-control bg-light border-0 py-2"
                      placeholder="Contoh: Makassar"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-secondary small fw-bold">Status Pelanggan</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="form-select bg-light border-0 py-2"
                      required
                    >
                      <option value="active">Aktif</option>
                      <option value="blacklist">Blacklist</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="d-flex justify-content-end gap-3 mt-5 border-top pt-4">
              <Link
                to="/customers"
                className="btn px-5 py-2 fw-bold text-white shadow-sm"
                style={{ backgroundColor: "#ff9a90", border: "none", borderRadius: "12px" }}
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn px-5 py-2 fw-bold text-white shadow-sm"
                style={{ backgroundColor: "#0cc2aa", border: "none", borderRadius: "12px", opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
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
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
              <div className="modal-body p-4 text-center">
                
                {/* Ikon Centang Hijau Soft */}
                <div 
                  className="mx-auto mb-4 d-flex align-items-center justify-content-center bg-success-subtle text-success" 
                  style={{ width: "64px", height: "64px", borderRadius: "50%" }}
                >
                  <i className="fas fa-check fs-2"></i>
                </div>

                <h5 className="fw-bold text-dark mb-2">Berhasil Disimpan!</h5>
                <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                  Data pelanggan <span className="fw-bold text-dark">{formData.name}</span> telah berhasil diperbarui di sistem.
                </p>

                {/* Indikator Loading Kecil */}
                <div className="d-flex align-items-center justify-content-center text-muted small">
                  <div className="spinner-border spinner-border-sm me-2" role="status" style={{ width: '12px', height: '12px' }}></div>
                  Mengalihkan...
                </div>
                
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}