import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditTransaction() {
  const navigate = useNavigate();
  // const { id } = useParams(); // Buka komentar ini saat sudah menggunakan backend/API untuk mengambil ID dari URL

  // State untuk menangani input form
  const [formData, setFormData] = useState({
    waktu: "",
    nama_customer: "",
    rute: "",
    jumlah_hari: "",
    mobil: "",
    merek: "",
    tipe_unit: "",
    transmisi: "",
    dp: "",
    sisa_pembayaran: "",
    total_pembayaran: "",
    keterangan: "",
  });

  // Simulasi fetching data berdasarkan ID yang diklik
  useEffect(() => {
    // Pada aplikasi nyata, panggil API di sini: fetch(`/api/transactions/${id}`)
    const dummyTransactionData = {
      id: "TRX-001",
      waktu: "2025-10-17T13:00", // Format datetime-local standar (YYYY-MM-DDTHH:mm)
      nama_customer: "Andi Herlambang",
      rute: "Dalam Kota",
      jumlah_hari: 3,
      mobil: "DD 2020 RR",
      merek: "Toyota",
      tipe_unit: "Avanza G",
      transmisi: "MANUAL",
      dp: "200000",
      sisa_pembayaran: "700000",
      total_pembayaran: "900000",
      keterangan: "Lunas. Diambil di bandara.",
    };

    setFormData(dummyTransactionData);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    // File dihandle terpisah
    console.log(`File diupload untuk ${name}:`, files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Data Transaksi Diperbarui:", formData);
    
    // TODO: Tambahkan logika PUT/PATCH ke API di sini
    
    alert("Data transaksi berhasil diperbarui!");
    navigate("/transaction");
  };

  return (
    <div className="h-100 bg-light d-flex flex-column">
      <div className="flex-grow-1 overflow-auto p-4">
        
        {/* Header Halaman */}
        <div className="mb-4">
          <h4 className="fw-bold text-dark mb-1">Edit Transaksi</h4>
          <p className="text-muted small">
            Perbarui informasi atau rincian pembayaran untuk transaksi ini.
          </p>
        </div>

        <div className="card shadow-sm border-0 rounded-3 mb-4 mx-auto" style={{ maxWidth: "1200px" }}>
          <div className="card-body p-4 p-lg-5">
            <form onSubmit={handleSubmit}>
              
              {/* BAGIAN 1: INFORMASI CUSTOMER & PEMINJAMAN */}
              <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">Informasi Peminjaman</h6>
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Nama Customer</label>
                    <input
                      type="text"
                      name="nama_customer"
                      value={formData.nama_customer}
                      onChange={handleChange}
                      className="form-control bg-light border-0 py-2"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Waktu/Tanggal Peminjaman</label>
                    <input
                      type="datetime-local"
                      name="waktu"
                      value={formData.waktu}
                      onChange={handleChange}
                      className="form-control bg-light border-0 py-2"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Rute Perjalanan</label>
                    <select
                      name="rute"
                      value={formData.rute}
                      onChange={handleChange}
                      className="form-select bg-light border-0 py-2"
                      required
                    >
                      <option value="">-- Pilih Rute --</option>
                      <option value="Dalam Kota">Dalam Kota</option>
                      <option value="Luar Kota">Luar Kota</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Jumlah Hari</label>
                    <div className="input-group">
                      <input
                        type="number"
                        name="jumlah_hari"
                        value={formData.jumlah_hari}
                        onChange={handleChange}
                        className="form-control bg-light border-0 py-2"
                        min="1"
                        required
                      />
                      <span className="input-group-text bg-light border-0">Hari</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BAGIAN 2: DATA KENDARAAN */}
              <h6 className="fw-bold text-danger mb-3 border-bottom pb-2">Data Kendaraan Terpilih</h6>
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Mobil (Plat Nomor)</label>
                    <select
                      name="mobil"
                      value={formData.mobil}
                      onChange={handleChange}
                      className="form-select bg-light border-0 py-2"
                      required
                    >
                      <option value="">-- Plat yang Terdaftar --</option>
                      <option value="DD 2020 RR">DD 2020 RR</option>
                      <option value="B 1234 ABC">B 1234 ABC</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Merek Kendaraan</label>
                    <input
                      type="text"
                      name="merek"
                      value={formData.merek}
                      onChange={handleChange}
                      className="form-control bg-light border-0 py-2"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Jenis Unit</label>
                    <input
                      type="text"
                      name="tipe_unit"
                      value={formData.tipe_unit}
                      onChange={handleChange}
                      className="form-control bg-light border-0 py-2"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Transmisi</label>
                    <select
                      name="transmisi"
                      value={formData.transmisi}
                      onChange={handleChange}
                      className="form-select bg-light border-0 py-2"
                      required
                    >
                      <option value="">-- Pilih Transmisi --</option>
                      <option value="MANUAL">Manual</option>
                      <option value="OTOMATIS">Otomatis</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BAGIAN 3: RINCIAN PEMBAYARAN */}
              <h6 className="fw-bold text-success mb-3 border-bottom pb-2">Rincian Pembayaran</h6>
              <div className="row g-4 mb-4">
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Total Pembayaran</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">Rp</span>
                      <input
                        type="number"
                        name="total_pembayaran"
                        value={formData.total_pembayaran}
                        onChange={handleChange}
                        className="form-control bg-light border-0 py-2"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Uang Muka (DP)</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">Rp</span>
                      <input
                        type="number"
                        name="dp"
                        value={formData.dp}
                        onChange={handleChange}
                        className="form-control bg-light border-0 py-2"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Sisa Pembayaran</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">Rp</span>
                      <input
                        type="number"
                        name="sisa_pembayaran"
                        value={formData.sisa_pembayaran}
                        onChange={handleChange}
                        className="form-control bg-light border-0 py-2"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* BAGIAN 4: DOKUMENTASI & KETERANGAN */}
              <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">Dokumentasi & Keterangan</h6>
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Perbarui Foto (Opsional)</label>
                    <input
                      type="file"
                      name="foto_mobil"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="form-control bg-light border-0 py-2"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Perbarui Video (Opsional)</label>
                    <input
                      type="file"
                      name="video_mobil"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="form-control bg-light border-0 py-2"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3 h-100">
                    <label className="form-label text-secondary small fw-bold">Keterangan Tambahan</label>
                    <textarea
                      name="keterangan"
                      value={formData.keterangan}
                      onChange={handleChange}
                      className="form-control bg-light border-0"
                      rows="5"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="d-flex justify-content-end gap-3 mt-5">
                <button
                  type="button"
                  className="btn px-5 py-2 fw-bold text-white shadow-sm"
                  style={{ backgroundColor: "#ff9a90", border: "none", borderRadius: "12px" }}
                  onClick={() => navigate("/transaction")}
                >
                  Batal
                </button>
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
    </div>
  );
}