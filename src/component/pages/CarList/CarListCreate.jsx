import React from "react";
import { useNavigate } from "react-router-dom";

export default function CarListCreate() {
  const navigate = useNavigate();

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      {/* Header Halaman */}
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Registrasi Kendaraan Baru</h4>
        <p className="text-muted small">
          Lengkapi formulir di bawah ini untuk menambahkan unit ke armada
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
                    KODE
                  </label>
                  <input
                    type="text"
                    className="form-control bg-light border-0 py-2"
                    placeholder="Masukkan kode kendaraan..."
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">
                    MEREK
                  </label>
                  <input
                    type="text"
                    className="form-control bg-light border-0 py-2"
                    placeholder="Masukkan merek mobil..."
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">
                    NOMOR PLAT
                  </label>
                  <input
                    type="text"
                    className="form-control bg-light border-0 py-2"
                    placeholder="Masukkan plat nomor..."
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">
                    KELUHAN
                  </label>
                  <textarea
                    className="form-control bg-light border-0 py-2"
                    rows="3"
                    placeholder="Masukkan keluhan unit..."
                  ></textarea>
                </div>
              </div>

              {/* Kolom Kanan */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">
                    JENIS UNIT
                  </label>
                  <input
                    type="text"
                    className="form-control bg-light border-0 py-2"
                    placeholder="Masukkan jenis unit..."
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">
                    TRANSMISI
                  </label>
                  <select className="form-select bg-light border-0 py-2 text-muted">
                    <option value="">--Pilih transmisi--</option>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
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
                onClick={() => navigate("/carlist")}
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
  );
}
