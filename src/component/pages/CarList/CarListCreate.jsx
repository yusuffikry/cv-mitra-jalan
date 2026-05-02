import React from "react";
import { useNavigate } from "react-router-dom";

export default function CarListCreate() {
  const navigate = useNavigate();

  return (
    <div className="container-fluid py-4">
      {/* Container tengah agar form tidak terlalu lebar */}
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          {/* Card Bootstrap */}
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-body p-4 p-md-5">
              {/* Header Form */}
              <div className="text-center mb-4">
                <h3 className="fw-bold text-dark">Tambah Mobil Baru</h3>
                <p className="text-muted small">
                  Masukkan detail informasi armada CV Mitra Jalan
                </p>
              </div>

              {/* Form Input */}
              <form>
                <div className="mb-3">
                  <label htmlFor="car_name" className="form-label fw-semibold">
                    Nama Mobil
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="car_name"
                    placeholder="Contoh: Avanza Veloz"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="plate" className="form-label fw-semibold">
                    Nomor Plat
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="plate"
                    placeholder="DD 1234 XX"
                    required
                  />
                </div>

                {/* Tombol Aksi */}
                <div className="d-grid gap-2 d-md-flex justify-content-md-end pt-2">
                  <button
                    type="button"
                    className="btn btn-light border px-4"
                    onClick={() => navigate("/carlist")}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    style={{
                      backgroundColor: "#5493ff",
                      borderColor: "#5493ff",
                    }}
                  >
                    Simpan Data
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
