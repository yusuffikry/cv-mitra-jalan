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
        // PERBAIKAN: Sesuaikan penarikan data GPS dengan nama kolom di Supabase
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
            // Mapping data untuk 2 GPS sesuai kolom Supabase
            gpsNumber1: data.gps_nomor || data.no_gps || "",
            gpsActiveDate1: data.masa_aktif_gps || data.masa_aktif_gps_1 || "",
            gpsNumber2: data.no_gps2 || data.no_gps_2 || "",
            gpsActiveDate2: data.masa_aktif_gps2 || data.masa_aktif_gps_2 || "",
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
          // PERBAIKAN: Update mapping 2 perangkat GPS ke kolom yang benar
          no_gps: formData.gpsNumber1,
          masa_aktif_gps: formData.gpsActiveDate1,
          no_gps2: formData.gpsNumber2 || null, // Nilai null jika kosong
          masa_aktif_gps2: formData.gpsActiveDate2 || null,
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
    <div className="container-fluid py-3 bg-white min-vh-100 position-relative">
      <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
        <div>
          <h5 className="fw-bold text-dark mb-0">Edit Data Kendaraan</h5>
          <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
            Perbarui spesifikasi dan status administrasi unit kendaraan.
          </p>
        </div>
        <Link
          to="/carlist"
          className="btn btn-sm btn-outline-secondary rounded-1 px-3 py-1"
        >
          <i className="fas fa-arrow-left me-1.5 small"></i>Kembali
        </Link>
      </div>

      <div className="card border rounded-1">
        <div className="card-body p-3">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6 border-end">
                <div className="bg-light p-2 mb-3">
                  <h6 className="fw-bold text-dark mb-0 small">
                    INFORMASI KENDARAAN
                  </h6>
                </div>

                <div className="mb-2">
                  <label className="form-label text-dark small fw-bold mb-1">
                    Unit Kendaraan
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control form-control-sm rounded-1 border"
                    placeholder="Contoh: Toyota Avanza"
                    required
                  />
                </div>

                <div className="row g-2">
                  <div className="col-md-6 mb-2">
                    <label className="form-label text-dark small fw-bold mb-1">
                      Plat Nomor
                    </label>
                    <input
                      type="text"
                      name="plate"
                      value={formData.plate}
                      onChange={handleChange}
                      className="form-control form-control-sm rounded-1 border"
                      placeholder="Contoh: B 1234 ABC"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label text-dark small fw-bold mb-1">
                      Tahun Produksi
                    </label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="form-control form-control-sm rounded-1 border"
                      placeholder="Contoh: 2022"
                      required
                    />
                  </div>
                </div>

                <div className="row g-2">
                  <div className="col-md-6 mb-2">
                    <label className="form-label text-dark small fw-bold mb-1">
                      Tipe Kendaraan
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="form-select form-select-sm rounded-1 border"
                      required
                    >
                      <option value="MPV">MPV</option>
                      <option value="SUV">SUV</option>
                      <option value="Sedan">Sedan</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Minibus">Minibus</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label text-dark small fw-bold mb-1">
                      Transmisi
                    </label>
                    <select
                      name="transmission"
                      value={formData.transmission}
                      onChange={handleChange}
                      className="form-select form-select-sm rounded-1 border"
                      required
                    >
                      <option value="Manual">Manual</option>
                      <option value="Matic">Matic</option>
                    </select>
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label text-dark small fw-bold mb-1">
                    Status Ketersediaan
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-select form-select-sm rounded-1 border"
                    required
                  >
                    <option value="Tersedia">Tersedia</option>
                    <option value="Pemeliharaan">Pemeliharaan</option>
                    <option value="Disewa">Disewa</option>
                  </select>
                </div>

                <div className="mb-2">
                  <label className="form-label text-dark small fw-bold mb-1">
                    Keluhan / Catatan Unit
                  </label>
                  <textarea
                    name="complaints"
                    value={formData.complaints}
                    onChange={handleChange}
                    className="form-control form-control-sm rounded-1 border"
                    rows="2"
                    placeholder="Tuliskan keluhan atau catatan fisik kendaraan..."
                  ></textarea>
                </div>
              </div>

              <div className="col-md-6">
                <div className="bg-light p-2 mb-3">
                  <h6 className="fw-bold text-dark mb-0 small">
                    ADMINISTRASI & MONITORING
                  </h6>
                </div>

                <div className="mb-2">
                  <label className="form-label text-dark small fw-bold mb-1">
                    Tanggal Jatuh Tempo (Asuransi/Kontrak)
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="form-control form-control-sm rounded-1 border"
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label text-dark small fw-bold mb-1">
                    Tanggal Pajak Tahunan
                  </label>
                  <input
                    type="date"
                    name="taxDate"
                    value={formData.taxDate}
                    onChange={handleChange}
                    className="form-control form-control-sm rounded-1 border"
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label text-dark small fw-bold mb-1">
                    Jadwal Servis Rutin
                  </label>
                  <input
                    type="date"
                    name="serviceDate"
                    value={formData.serviceDate}
                    onChange={handleChange}
                    className="form-control form-control-sm rounded-1 border"
                    required
                  />
                </div>

                <div className="p-2 bg-light rounded-1 mt-3 border">
                  <h6 className="fw-bold text-dark mb-2 small border-bottom pb-1">
                    <i className="fas fa-satellite-dish me-1.5 text-primary small"></i>
                    Perangkat GPS
                  </h6>

                  <div className="pb-2 mb-2 border-bottom">
                    <p
                      className="fw-bold text-primary mb-1"
                      style={{ fontSize: "0.75rem" }}
                    >
                      GPS Utama (1)
                    </p>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label
                          className="form-label text-secondary mb-1"
                          style={{ fontSize: "0.7rem", fontWeight: "bold" }}
                        >
                          Nomor / ID GPS
                        </label>
                        <input
                          type="text"
                          name="gpsNumber1"
                          value={formData.gpsNumber1}
                          onChange={handleChange}
                          className="form-control form-control-sm rounded-1 border bg-white"
                          placeholder="GPS-101"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label
                          className="form-label text-secondary mb-1"
                          style={{ fontSize: "0.7rem", fontWeight: "bold" }}
                        >
                          Batas Masa Aktif
                        </label>
                        <input
                          type="date"
                          name="gpsActiveDate1"
                          value={formData.gpsActiveDate1}
                          onChange={handleChange}
                          className="form-control form-control-sm rounded-1 border bg-white"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-0">
                    <p
                      className="fw-bold text-secondary mb-1"
                      style={{ fontSize: "0.75rem" }}
                    >
                      GPS Cadangan (2) -{" "}
                      <span className="text-muted fw-normal">Opsional</span>
                    </p>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label
                          className="form-label text-secondary mb-1"
                          style={{ fontSize: "0.7rem", fontWeight: "bold" }}
                        >
                          Nomor / ID GPS
                        </label>
                        <input
                          type="text"
                          name="gpsNumber2"
                          value={formData.gpsNumber2}
                          onChange={handleChange}
                          className="form-control form-control-sm rounded-1 border bg-white"
                          placeholder="GPS-102"
                        />
                      </div>
                      <div className="col-md-6">
                        <label
                          className="form-label text-secondary mb-1"
                          style={{ fontSize: "0.7rem", fontWeight: "bold" }}
                        >
                          Batas Masa Aktif
                        </label>
                        <input
                          type="date"
                          name="gpsActiveDate2"
                          value={formData.gpsActiveDate2}
                          onChange={handleChange}
                          className="form-control form-control-sm rounded-1 border bg-white"
                        />
                      </div>
                    </div>
                    <small
                      className="text-muted mt-1 d-block"
                      style={{ fontSize: "0.7rem" }}
                    >
                      *Status kalkulasi sistem berdasarkan parameter tanggal
                      yang diinput.
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4 border-top pt-2">
              <Link
                to="/carlist"
                className="btn btn-sm fw-bold text-white px-4 py-1.5"
                style={{
                  backgroundColor: "#6c757d",
                  border: "none",
                  borderRadius: "3px",
                }}
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-sm fw-bold text-white px-4 py-1.5"
                style={{
                  backgroundColor: "#0052cc",
                  border: "none",
                  borderRadius: "3px",
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Memproses...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showSuccessModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border rounded-1">
              <div className="modal-body p-3 text-center">
                <div
                  className="mx-auto mb-2 d-flex align-items-center justify-content-center bg-success text-white"
                  style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                >
                  <i className="fas fa-check small"></i>
                </div>

                <h6 className="fw-bold text-dark mb-1">Berhasil Diperbarui</h6>
                <p className="text-muted mb-2" style={{ fontSize: "0.75rem" }}>
                  Perubahan data unit{" "}
                  <span className="fw-bold text-dark">{formData.name}</span>{" "}
                  telah disimpan ke sistem.
                </p>

                <div
                  className="d-flex align-items-center justify-content-center text-muted"
                  style={{ fontSize: "0.7rem" }}
                >
                  <div
                    className="spinner-border spinner-border-sm me-1.5"
                    role="status"
                    style={{ width: "10px", height: "10px" }}
                  ></div>
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