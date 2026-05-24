import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";

export default function CreateOutcome() {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // State untuk menampung input form sesuai kolom tabel expenses
  // Nilai total_pengeluaran disimpan dalam format string bertitik, misal: "1.500.000"
  const [formData, setFormData] = useState({
    tanggal_pengeluaran: "",
    jenis_pengeluaran: "",
    keterangan: "",
    total_pengeluaran: "",
  });

  // --- FUNGSI FORMAT INPUT UANG ---
  // Menghapus semua karakter selain angka (otomatis memblokir tanda minus "-"), lalu menyisipkan titik
  const formatRupiahInput = (value) => {
    if (!value) return "";
    const numberString = value.toString().replace(/\D/g, ""); // Buang semua huruf/simbol/titik lama
    return new Intl.NumberFormat("id-ID").format(numberString); // Format ke gaya Indonesia (titik)
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      let newValue = value;

      // Jika yang diketik adalah total_pengeluaran, otomatis format angkanya
      if (name === "total_pengeluaran") {
        newValue = formatRupiahInput(value);
      }

      return {
        ...prev,
        [name]: newValue,
      };
    });
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
      // Kembalikan format "1.000.000" menjadi angka murni 1000000 sebelum masuk Supabase
      const rawTotalPengeluaran = parseInt(formData.total_pengeluaran.replace(/\./g, "")) || 0;

      // Insert ke tabel expenses di Supabase
      const { error } = await supabase.from("expenses").insert([
        {
          tanggal_pengeluaran: formData.tanggal_pengeluaran,
          jenis_pengeluaran: formData.jenis_pengeluaran,
          keterangan: formData.keterangan || null,
          total_pengeluaran: rawTotalPengeluaran,
        },
      ]);

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
      console.error("Error inserting expense:", error.message);
      alert("Gagal menyimpan data pengeluaran: " + error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-100 bg-light d-flex flex-column">
      <div className="flex-grow-1 overflow-auto p-4">
        
        <div className="d-flex justify-content-between align-items-center mb-4 mx-auto" style={{ maxWidth: "1000px" }}>
          <div>
            <h4 className="fw-bold text-dark mb-1">Tambah Pengeluaran</h4>
            <p className="text-muted small mb-0">Catat biaya operasional dan perawatan armada.</p>
          </div>
          <Link to="/outcome" className="btn btn-outline-secondary shadow-sm px-3">
            <i className="fas fa-arrow-left me-2"></i>Kembali
          </Link>
        </div>

        <div className="card shadow-sm border-0 rounded-3 mb-5 mx-auto" style={{ maxWidth: "1000px" }}>
          <div className="card-body p-4 p-lg-5">
            <form onSubmit={handleSubmit}>
              
              <h6 className="fw-bold text-danger mb-4 border-bottom pb-2">
                <i className="fas fa-receipt me-2"></i>Rincian Biaya
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
                    {/* BAGIAN INI DIUBAH MENJADI DROPDOWN */}
                    <select
                      name="jenis_pengeluaran"
                      value={formData.jenis_pengeluaran}
                      onChange={handleChange}
                      className="form-select bg-light border-0 py-2 shadow-none"
                      required
                    >
                      <option value="" disabled>-- Pilih Jenis Pengeluaran --</option>
                      <option value="Beban BBM">Beban BBM</option>
                      <option value="Beban Gaji">Beban Gaji</option>
                      <option value="Beban Gaji">Beban GPS</option>
                      <option value="Pemeliharaan">Pemeliharaan</option>
                      <option value="Angsuran">Angsuran</option>
                      <option value="Operasional">Operasional</option>
                      <option value="Pajak">Pajak</option>
                      <option value="Beban Lain-lain">Beban Lain-lain</option>
                    </select>
                  </div>
                </div>

                {/* Kolom Kanan */}
                <div className="col-md-6">
                  <div className="mb-4">
                    <label className="form-label text-secondary small fw-bold">Total Pengeluaran (Rp) <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0 text-muted">Rp</span>
                      {/* UBAH DARI type="number" KE type="text" AGAR FORMAT TITIK BISA MUNCUL */}
                      <input
                        type="text"
                        name="total_pengeluaran"
                        value={formData.total_pengeluaran}
                        onChange={handleChange}
                        className="form-control bg-light border-0 py-2 shadow-none"
                        placeholder="0"
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
                    "Simpan Pengeluaran"
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
                <h5 className="fw-bold text-dark mb-2">Berhasil Disimpan!</h5>
                <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                  Data pengeluaran baru berhasil ditambahkan.
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