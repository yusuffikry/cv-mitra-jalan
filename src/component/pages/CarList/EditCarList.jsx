import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../supabaseClient"; // Pastikan path ini benar

export default function EditCarList() {
  const navigate = useNavigate();
  const { id } = useParams(); // Mengambil ID dari URL (/carlist/edit/:id)

  // State loading untuk fetching dan submitting
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk menampilkan modal sukses
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // State untuk menyimpan data armada
  const [formData, setFormData] = useState({
    name: "",
    plate: "",
    status: "Tersedia",
    type: "MPV",
    year: "",
    dueDate: "",
    serviceDate: "",
    taxDate: "",
    // State GPS diubah menjadi 2 buah
    gpsNumber1: "",
    gpsActiveDate1: "",
    gpsNumber2: "",
    gpsActiveDate2: "",
    transmission: "Manual",
    complaints: "",
  });

  // 1. Fetch data spesifik berdasarkan ID saat komponen dimuat
  useEffect(() => {
    const fetchCarData = async () => {
      try {
        const { data, error } = await supabase
          .from("cars")
          .select("*")
          .eq("cars_id", id) // Cari berdasarkan Primary Key
          .single(); // Ambil hanya 1 baris

        if (error) throw error;

        // Jika data ditemukan, masukkan ke state formData
        if (data) {
          setFormData({
            name: data.jenis_unit || "",
            plate: data.nomor_plat || "",
            status: data.status_mobil || "Tersedia",
            type: data.tipe_kendaraan || "MPV",
            year: data.tahun_produksi || "",
            dueDate: data.tgl_jatuh_tempo || "",
            serviceDate: data.tgl_pergantian_oli || "",
            taxDate: data.tgl_mati_pajak || "",
            // Mapping data untuk 2 GPS
            gpsNumber1: data.no_gps_1 || "",
            gpsActiveDate1: data.masa_aktif_gps_1 || "",
            gpsNumber2: data.no_gps_2 || "",
            gpsActiveDate2: data.masa_aktif_gps_2 || "",
            transmission: data.transmisi || "Manual",
            complaints: data.keluhan_unit || "",
          });
        }
      } catch (error) {
        console.error("Error fetching car details:", error.message);
        alert("Gagal memuat data kendaraan.");
        navigate("/carlist"); // Tendang balik jika error/ID tidak valid
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 2. Fungsi untuk mengirim perintah UPDATE ke Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("cars")
        .update({
          jenis_unit: formData.name,
          nomor_plat: formData.plate,
          tahun_produksi: formData.year,
          tipe_kendaraan: formData.type,
          transmisi: formData.transmission,
          status_mobil: formData.status,
          keluhan_unit: formData.complaints || null,
          tgl_jatuh_tempo: formData.dueDate,
          tgl_mati_pajak: formData.taxDate,
          tgl_pergantian_oli: formData.serviceDate,
          // Update mapping 2 perangkat GPS
          no_gps_1: formData.gpsNumber1,
          masa_aktif_gps_1: formData.gpsActiveDate1,
          no_gps_2: formData.gpsNumber2 || null, // Nilai null jika kosong
          masa_aktif_gps_2: formData.gpsActiveDate2 || null,
        })
        .eq("cars_id", id); // PENTING: Jangan lupa klausa WHERE

      if (error) throw error;

      // Tampilkan modal sukses alih-alih menggunakan alert bawaan
      setShowSuccessModal(true);

      // Tunggu 2 detik sebelum redirect ke halaman armada
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/carlist");
      }, 2000);

    } catch (error) {
      console.error("Error updating car:", error.message);
      alert("Gagal memperbarui data: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tampilkan loading spinner jika data masih ditarik dari database
  if (isLoading) {
    return (
      <div className="container-fluid py-4 bg-light min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center text-muted">
          <div className="spinner-border mb-2" role="status"></div>
          <p>Memuat data kendaraan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 bg-light min-vh-100 position-relative">
      {/* Header Halaman */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Edit Data Kendaraan</h4>
          <p className="text-muted small mb-0">
            Perbarui spesifikasi dan status administrasi unit kendaraan.
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
                  <label className="form-label text-secondary small fw-bold">Status Ketersediaan</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-select bg-light border-0 py-2"
                    required
                  >
                    {/* PERBAIKAN: Opsi 'Disewa' dihapus */}
                    <option value="Tersedia">Tersedia</option>
                    <option value="Pemeliharaan">Pemeliharaan</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">Keluhan / Catatan Unit</label>
                  <textarea
                    name="complaints"
                    value={formData.complaints}
                    onChange={handleChange}
                    className="form-control bg-light border-0 py-2"
                    rows="3"
                    placeholder="Tuliskan keluhan atau catatan fisik kendaraan..."
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

                  {/* GPS 1 (Utama) */}
                  <div className="border-bottom pb-3 mb-3">
                    <p className="fw-bold text-primary small mb-2">GPS Utama (1)</p>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-bold mb-1">Nomor / ID GPS</label>
                        <input
                          type="text"
                          name="gpsNumber1"
                          value={formData.gpsNumber1}
                          onChange={handleChange}
                          className="form-control py-2"
                          placeholder="Contoh: GPS-101"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-bold mb-1">Batas Masa Aktif</label>
                        <input
                          type="date"
                          name="gpsActiveDate1"
                          value={formData.gpsActiveDate1}
                          onChange={handleChange}
                          className="form-control py-2"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* GPS 2 (Cadangan) */}
                  <div className="mb-0">
                    <p className="fw-bold text-secondary small mb-2">GPS Cadangan (2) - <span className="text-muted fw-normal">Opsional</span></p>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-bold mb-1">Nomor / ID GPS</label>
                        <input
                          type="text"
                          name="gpsNumber2"
                          value={formData.gpsNumber2}
                          onChange={handleChange}
                          className="form-control py-2"
                          placeholder="Contoh: GPS-102"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-bold mb-1">Batas Masa Aktif</label>
                        <input
                          type="date"
                          name="gpsActiveDate2"
                          value={formData.gpsActiveDate2}
                          onChange={handleChange}
                          className="form-control py-2"
                        />
                      </div>
                    </div>
                    <small className="text-muted mt-2 d-block" style={{ fontSize: "0.75rem" }}>
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
                  "Simpan Perubahan"
                )}
              </button>
            </div>
            
          </form>
        </div>
      </div>

      {/* --- MODAL POP UP SUKSES EDIT (AUTO CLOSE) --- */}
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

                <h5 className="fw-bold text-dark mb-2">Berhasil Diperbarui!</h5>
                <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                  Data kendaraan <span className="fw-bold text-dark">{formData.name}</span> telah berhasil diperbarui di sistem.
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