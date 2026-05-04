import React from "react";
import { useNavigate } from "react-router-dom";

export default function CustomersCreate() {
  const navigate = useNavigate();
  return (
    <>
      <div className="container-fluid py-4 bg-light min-vh-100">
        {/* Header Halaman */}
        <div className="mb-4">
          <h4 className="fw-bold text-dark mb-1">Customers Baru</h4>
          <p className="text-muted small">
            Lengkapi formulir di bawah ini untuk menambahkan pelanggan baru
          </p>
        </div>

        <div className="card shadow-sm border-0 rounded-3">
          <div className="card-body p-4 p-lg-5">
            <form>
              <div className="row g-4">
                {/* Kolom Kiri */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Nama Pelanggan
                    </label>
                    <input
                      type="text"
                      className="form-control bg-light border-0 py-2"
                      placeholder="Masukkan nama pelanggan..."
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      NIK
                    </label>
                    <input
                      type="number"
                      className="form-control bg-light border-0 py-2"
                      placeholder="Masukkan NIK pelanggan..."
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Kota Rental
                    </label>
                    <input
                      type="text"
                      className="form-control bg-light border-0 py-2"
                      placeholder="Masukkan kota rental..."
                      required
                    />
                  </div>
                  
                  {/* Tambahan Kolom Input Total Rental */}
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Total Rental Awal
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control bg-light border-0 py-2"
                        placeholder="0"
                        min="0"
                        defaultValue={0} // Nilai default untuk user baru
                        required
                      />
                      <span className="input-group-text bg-light border-0">Kali</span>
                    </div>
                  </div>
                  
                </div>

                {/* Kolom Kanan */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Kontak / WhatsApp
                    </label>
                    <input
                      type="text"
                      className="form-control bg-light border-0 py-2"
                      placeholder="Masukkan kontak pelanggan..."
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Domisili
                    </label>
                    <input
                      type="text"
                      className="form-control bg-light border-0 py-2"
                      placeholder="Masukkan domisili pelanggan..."
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Status
                    </label>
                    <select
                      name=""
                      className="form-select bg-light border-0 py-2"
                      id=""
                      required
                    >
                      <option value="">-- Pilih Status --</option>
                      <option value="Aktif">Aktif</option>
                      <option value="Blacklist">Blacklist</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tombol Aksi - Mepet Kanan sesuai Gambar */}
              <div className="d-flex justify-content-end gap-3 mt-5">
                <button
                  type="button"
                  className="btn px-5 py-2 fw-bold text-white shadow-sm"
                  style={{
                    backgroundColor: "#ff9a90",
                    border: "none",
                    borderRadius: "12px",
                  }}
                  onClick={() => navigate("/customers")} // Diperbaiki dari /carlist menjadi /customers
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn px-5 py-2 fw-bold text-white shadow-sm"
                  style={{
                    backgroundColor: "#0cc2aa",
                    border: "none",
                    borderRadius: "12px",
                  }}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}