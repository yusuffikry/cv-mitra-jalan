import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";

export default function CarListCreate() {
  const navigate = useNavigate();

  // State untuk indikator loading saat submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk menampilkan modal sukses
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // State untuk menyimpan data form pendaftaran mobil baru
  const [formData, setFormData] = useState({
    name: "",
    plate: "",
    status: "Tersedia",
    type: "MPV",
    year: "",
    dueDate: "",
    serviceDate: "",
    taxDate: "",
    gpsNumber: "",
    gpsActiveDate: "",
    transmission: "Manual",
    complaints: "",
  });

  // Fungsi untuk menangani perubahan input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fungsi untuk menangani submit form ke Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Mulai proses loading
    
    try {
      // Mapping state formData ke nama kolom Supabase
      const { error } = await supabase
        .from("cars")
        .insert([
          {
            jenis_unit: formData.name,
            nomor_plat: formData.plate,
            tahun_produksi: formData.year,
            tipe_kendaraan: formData.type,
            transmisi: formData.transmission,
            status_mobil: formData.status,
            keluhan_unit: formData.complaints || null, // Kosongkan jadi null jika tidak ada keluhan
            tgl_jatuh_tempo: formData.dueDate,
            tgl_mati_pajak: formData.taxDate,
            tgl_pergantian_oli: formData.serviceDate,
            no_gps: formData.gpsNumber,
            masa_aktif_gps: formData.gpsActiveDate,
          }
        ]);

      if (error) throw error; // Lempar error jika gagal insert

      // Tampilkan modal sukses alih-alih menggunakan alert bawaan
      setShowSuccessModal(true);

      // Tunggu 2 detik sebelum redirect ke halaman armada
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/carlist");
      }, 2000);

    } catch (error) {
      console.error("Error inserting car:", error.message);
      alert("Gagal menambahkan kendaraan: " + error.message);
    } finally {
      setIsSubmitting(false); // Matikan loading tombol submit
    }
  };

  return (
    <div className="container-fluid py-4 bg-light min-vh-100 position-relative">
      {/* Header Halaman */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Registrasi Kendaraan Baru</h4>
          <p className="text-muted small mb-0">
            Lengkapi formulir di bawah ini untuk menambahkan unit ke armada.
          </p>
        </div>
        <Link to="/carlist" className="btn btn-outline-secondary shadow-sm px-3">
          <i className="fas fa-arrow-left me-2"></i>Kembali
        </Link>
      </div>

      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-body p-4 p-lg-5">
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              
              {/* === KOLOM KIRI: Data Spesifikasi === */}
              <div className="col-md-6">
                <h6 className="fw-bold text-primary mb-3">Informasi Kendaraan</h6>
                
                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">Unit Kendaraan</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control bg-light border-0 py-2"
                    placeholder="Contoh: Toyota Avanza"
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-secondary small fw-bold">Plat Nomor</label>
                    <input
                      type="text"
                      name="plate"
                      value={formData.plate}
                      onChange={handleChange}
                      className="form-control bg-light border-0 py-2"
                      placeholder="Contoh: B 1234 ABC"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-secondary small fw-bold">Tahun Produksi</label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="form-control bg-light border-0 py-2"
                      placeholder="Contoh: 2022"
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-secondary small fw-bold">Tipe Kendaraan</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="form-select bg-light border-0 py-2"
                      required
                    >
                      <option value="MPV">MPV</option>
                      <option value="SUV">SUV</option>
                      <option value="Sedan">Sedan</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Minibus">Minibus</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-secondary small fw-bold">Transmisi</label>
                    <select
                      name="transmission"
                      value={formData.transmission}
                      onChange={handleChange}
                      className="form-select bg-light border-0 py-2"
                      required
                    >
                      <option value="Manual">Manual</option>
                      <option value="Matic">Matic</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">Status Ketersediaan Awal</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-select bg-light border-0 py-2"
                    required
                  >
                    {/* PERBAIKAN: Opsi 'Disewa' dihapus karena status harus otomatis berdasarkan transaksi */}
                    <option value="Tersedia">Tersedia</option>
                    <option value="Pemeliharaan">Pemeliharaan</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">Keluhan / Catatan Unit Awal</label>
                  <textarea
                    name="complaints"
                    value={formData.complaints}
                    onChange={handleChange}
                    className="form-control bg-light border-0 py-2"
                    rows="3"
                    placeholder="Opsional: Tuliskan catatan fisik kendaraan saat didaftarkan..."
                  ></textarea>
                </div>
              </div>

              {/* === KOLOM KANAN: Data Administrasi & GPS === */}
              <div className="col-md-6">
                <h6 className="fw-bold text-success mb-3">Administrasi & Monitoring</h6>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">Tanggal Jatuh Tempo (Asuransi/Kontrak)</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="form-control bg-light border-0 py-2"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">Tanggal Pajak Tahunan</label>
                  <input
                    type="date"
                    name="taxDate"
                    value={formData.taxDate}
                    onChange={handleChange}
                    className="form-control bg-light border-0 py-2"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">Jadwal Servis Rutin</label>
                  <input
                    type="date"
                    name="serviceDate"
                    value={formData.serviceDate}
                    onChange={handleChange}
                    className="form-control bg-light border-0 py-2"
                    required
                  />
                </div>

                <div className="p-3 bg-light rounded-3 mt-4 border">
                  <h6 className="fw-bold text-dark mb-3">
                    <i className="fas fa-satellite-dish me-2 text-primary"></i>Perangkat GPS
                  </h6>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Nomor / ID GPS</label>
                    <input
                      type="text"
                      name="gpsNumber"
                      value={formData.gpsNumber}
                      onChange={handleChange}
                      className="form-control py-2"
                      placeholder="Contoh: GPS-101"
                      required
                    />
                  </div>
                  <div className="mb-0">
                    <label className="form-label text-secondary small fw-bold">Batas Masa Aktif GPS</label>
                    <input
                      type="date"
                      name="gpsActiveDate"
                      value={formData.gpsActiveDate}
                      onChange={handleChange}
                      className="form-control py-2"
                      required
                    />
                    <small className="text-muted mt-1 d-block" style={{ fontSize: "0.75rem" }}>
                      *Status Aktif/Tidak Aktif akan dikalkulasi otomatis oleh sistem berdasarkan tanggal ini.
                    </small>
                  </div>
                </div>

              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="d-flex justify-content-end gap-3 mt-5 border-top pt-4">
              <Link
                to="/carlist"
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
                  "Submit Kendaraan"
                )}
              </button>
            </div>
            
          </form>
        </div>
      </div>

      {/* --- MODAL POP UP SUKSES TAMBAH (AUTO CLOSE) --- */}
      {showSuccessModal && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
              <div className="modal-body p-4 text-center">
                
                {/* Ikon Centang Hijau */}
                <div 
                  className="mx-auto mb-4 d-flex align-items-center justify-content-center bg-success-subtle text-success" 
                  style={{ width: "64px", height: "64px", borderRadius: "50%" }}
                >
                  <i className="fas fa-check fs-2"></i>
                </div>

                <h5 className="fw-bold text-dark mb-2">Berhasil Ditambahkan!</h5>
                <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                  Data kendaraan <span className="fw-bold text-dark">{formData.name}</span> telah berhasil disimpan ke sistem.
                </p>

                {/* Indikator Redirect */}
                <div className="d-flex align-items-center justify-content-center text-muted small">
                  <div className="spinner-border spinner-border-sm me-2" role="status" style={{ width: '12px', height: '12px' }}></div>
                  Mengalihkan halaman...
                </div>
                
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}