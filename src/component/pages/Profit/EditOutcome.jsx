import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../supabaseClient";

export default function EditOutcome() {
  const { id } = useParams(); // Ambil expense_id dari URL
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // State untuk menampung input form
  const [formData, setFormData] = useState({
    tanggal_pengeluaran: "",
    jenis_pengeluaran: "",
    keterangan: "",
    total_pengeluaran: "",
  });

  // --- AMBIL DATA EXISTING SAAT HALAMAN DIBUKA ---
  useEffect(() => {
    if (id) {
      fetchExpenseData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchExpenseData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("expense_id", id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          tanggal_pengeluaran: data.tanggal_pengeluaran || "",
          jenis_pengeluaran: data.jenis_pengeluaran || "",
          keterangan: data.keterangan || "",
          total_pengeluaran: data.total_pengeluaran || "",
        });
      }
    } catch (error) {
      console.error("Gagal mengambil data pengeluaran:", error.message);
      alert("Data tidak ditemukan atau terjadi kesalahan.");
      navigate("/outcome");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi sederhana
    if (!formData.tanggal_pengeluaran || !formData.jenis_pengeluaran || !formData.total_pengeluaran) {
      alert("Harap lengkapi field yang wajib diisi!");
      return;
    }

    setIsSubmitting(true);

    try {
      // Update ke tabel expenses di Supabase
      const { error } = await supabase
        .from("expenses")
        .update({
          tanggal_pengeluaran: formData.tanggal_pengeluaran,
          jenis_pengeluaran: formData.jenis_pengeluaran,
          keterangan: formData.keterangan || null,
          total_pengeluaran: parseInt(formData.total_pengeluaran),
          updated_at: new Date().toISOString(), // Update timestamp jika ada
        })
        .eq("expense_id", id);

      if (error) throw error;

      // Tampilkan modal sukses
      setShowSuccessModal(true);
      setIsSubmitting(false);

      // Redirect kembali ke halaman list setelah 2 detik
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/outcome");
      }, 2000);

    } catch (error) {
      console.error("Error updating expense:", error.message);
      alert("Gagal memperbarui data pengeluaran: " + error.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-100 d-flex justify-content-center align-items-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-2" role="status"></div>
          <p className="text-muted">Memuat data pengeluaran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-100 bg-light d-flex flex-column">
      <div className="flex-grow-1 overflow-auto p-4">
        
        <div className="d-flex justify-content-between align-items-center mb-4 mx-auto" style={{ maxWidth: "1000px" }}>
          <div>
            <h4 className="fw-bold text-dark mb-1">Edit Pengeluaran</h4>
            <p className="text-muted small mb-0">Perbarui rincian biaya operasional atau perawatan.</p>
          </div>
          <Link to="/outcome" className="btn btn-outline-secondary shadow-sm px-3">
            <i className="fas fa-arrow-left me-2"></i>Kembali
          </Link>
        </div>

        <div className="card shadow-sm border-0 rounded-3 mb-5 mx-auto" style={{ maxWidth: "1000px" }}>
          <div className="card-body p-4 p-lg-5">
            <form onSubmit={handleSubmit}>
              
              <h6 className="fw-bold text-warning mb-4 border-bottom pb-2">
                <i className="fas fa-edit me-2"></i>Edit Rincian Biaya
              </h6>
              
              <div className="row g-4 mb-4">
                
                {/* Kolom Kiri */}
                <div className="col-md-6">
                  <div className="mb-4">
                    <label className="form-label text-secondary small fw-bold">Tanggal Pengeluaran <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      name="tanggal_pengeluaran"
                      value={formData.tanggal_pengeluaran}
                      onChange={handleChange}
                      className="form-control bg-light border-0 py-2 shadow-none"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label text-secondary small fw-bold">Jenis Pengeluaran <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      name="jenis_pengeluaran"
                      value={formData.jenis_pengeluaran}
                      onChange={handleChange}
                      className="form-control bg-light border-0 py-2 shadow-none"
                      placeholder="Misal: BBM, Cuci Mobil, Ganti Oli..."
                      required
                    />
                  </div>
                </div>

                {/* Kolom Kanan */}
                <div className="col-md-6">
                  <div className="mb-4">
                    <label className="form-label text-secondary small fw-bold">Total Pengeluaran (Rp) <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0 text-muted">Rp</span>
                      <input
                        type="number"
                        name="total_pengeluaran"
                        value={formData.total_pengeluaran}
                        onChange={handleChange}
                        className="form-control bg-light border-0 py-2 shadow-none"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4 h-100">
                    <label className="form-label text-secondary small fw-bold">Keterangan Tambahan</label>
                    <textarea
                      name="keterangan"
                      value={formData.keterangan}
                      onChange={handleChange}
                      className="form-control bg-light border-0 shadow-none"
                      rows="3"
                      placeholder="Catatan khusus, nota, atau detail item yang dibeli..."
                    ></textarea>
                  </div>
                </div>

              </div>

              <div className="d-flex justify-content-end gap-3 mt-5 border-top pt-4">
                <Link
                  to="/outcome"
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

      </div>

      {/* --- MODAL POP UP SUKSES --- */}
      {showSuccessModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(5px)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
              <div className="modal-body p-4 text-center">
                <div className="mx-auto mb-4 d-flex align-items-center justify-content-center bg-success-subtle text-success" style={{ width: "64px", height: "64px", borderRadius: "50%" }}>
                  <i className="fas fa-check fs-2"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Pembaruan Berhasil!</h5>
                <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                  Data pengeluaran berhasil diperbarui.
                </p>
                <div className="d-flex align-items-center justify-content-center text-muted small">
                  <div className="spinner-border spinner-border-sm me-2" role="status" style={{ width: "12px", height: "12px" }}></div>
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