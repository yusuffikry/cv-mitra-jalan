import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function EditCustomer() {
  const navigate = useNavigate();
  // useParams digunakan untuk menangkap ID dari URL (misal: /customers/edit/1)
  // const { id } = useParams(); 

  // State untuk menyimpan data form pelanggan (tambahkan total_rental)
  const [formData, setFormData] = useState({
    name: "",
    nik: "",
    contact: "",
    city: "",
    rental_city: "",
    total_rental: 0, // State baru
    status: "Aktif",
  });

  // Simulasi pengambilan data (fetching) berdasarkan ID
  useEffect(() => {
    // Pada aplikasi nyata, di sini kamu akan memanggil API seperti:
    // fetch(`/api/customers/${id}`).then(...)
    
    // Untuk saat ini, kita gunakan data dummy dari daftar pelanggan sebelumnya
    const dummyData = {
      id: 1,
      name: "Andi Herlambang",
      nik: "73710123456789",
      contact: "08123456789",
      city: "Makassar",
      rental_city: "Maros",
      total_rental: 5, // Data dummy baru
      status: "Aktif",
    };

    setFormData(dummyData);
  }, []); 

  // Fungsi untuk menangani perubahan input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Fungsi untuk menangani submit form (menyimpan perubahan)
  const handleSubmit = (e) => {
    e.preventDefault();
    // Di sini kamu akan mengirim data ke backend menggunakan API (PUT/PATCH request)
    console.log("Data Pelanggan Diperbarui:", formData);
    
    // Setelah berhasil disimpan, arahkan kembali ke halaman daftar pelanggan
    alert("Data berhasil diperbarui!");
    navigate("/customers"); 
  };

  return (
    <div className="container-fluid bg-light min-vh-100 p-4">
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

      {/* Card Formulir Edit */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              
              {/* Kolom Kiri */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary small">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary small">
                    Nomor Induk Kependudukan (NIK)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="nik"
                    value={formData.nik}
                    onChange={handleChange}
                    placeholder="Masukkan NIK 16 digit"
                    pattern="[0-9]{16}"
                    title="NIK harus berupa 16 digit angka"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary small">
                    Nomor WhatsApp / Kontak
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="fab fa-whatsapp text-success"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      placeholder="Contoh: 08123456789"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Kolom Kanan */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary small">
                    Kota Domisili
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Masukkan kota domisili asal"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary small">
                    Kota Rental (Tujuan)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="rental_city"
                    value={formData.rental_city}
                    onChange={handleChange}
                    placeholder="Masukkan kota tempat merental"
                    required
                  />
                </div>

                {/* Tambahan Form Input Total Rental */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold text-secondary small">
                      Total Rental
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        name="total_rental"
                        value={formData.total_rental}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        required
                      />
                      <span className="input-group-text bg-light">Kali</span>
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold text-secondary small">
                      Status Pelanggan
                    </label>
                    <select
                      className="form-select"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Tidak Aktif">Tidak Aktif</option>
                      <option value="Blacklist">Blacklist</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>

            {/* Tombol Aksi */}
            <hr className="my-4 text-muted" />
            <div className="d-flex justify-content-end gap-2">
              <Link to="/customers" className="btn btn-light border px-4">
                Batal
              </Link>
              <button type="submit" className="btn btn-primary px-4 shadow-sm">
                <i className="fas fa-save me-2"></i>Simpan Perubahan
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}