import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function EditCarList() {
  const navigate = useNavigate();
  // const { id } = useParams(); // Aktifkan ini jika sudah menggunakan backend

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
    gpsNumber: "",
    gpsActiveDate: "",
    transmission: "Manual",
    complaints: "",
  });

  // Simulasi fetch data berdasarkan ID
  useEffect(() => {
    // Pada implementasi nyata: fetch(`/api/cars/${id}`)
    const dummyCarData = {
      id: 1,
      name: "Toyota Avanza",
      plate: "B 1234 ABC",
      status: "Tersedia",
      type: "MPV",
      year: "2022",
      dueDate: "2026-06-15",
      serviceDate: "2026-05-20",
      taxDate: "2027-01-10",
      gpsNumber: "GPS-101",
      gpsActiveDate: "2026-04-30",
      transmission: "Otomatis",
      complaints: "AC kurang dingin",
    };

    setFormData(dummyCarData);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Data Armada Diperbarui:", formData);
    alert("Data kendaraan berhasil diperbarui!");
    navigate("/carlist"); // Kembali ke halaman utama armada
  };

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
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
                      <option value="Otomatis">Otomatis</option>
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
                    <option value="Tersedia">Tersedia</option>
                    <option value="Disewa">Disewa</option>
                    <option value="Dalam Perbaikan">Dalam Perbaikan</option>
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
                  <h6 className="fw-bold text-dark mb-3"><i className="fas fa-satellite-dish me-2 text-primary"></i>Perangkat GPS</h6>
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
                className="btn px-5 py-2 fw-bold text-white shadow-sm"
                style={{ backgroundColor: "#0cc2aa", border: "none", borderRadius: "12px" }}
              >
                Simpan Perubahan
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}