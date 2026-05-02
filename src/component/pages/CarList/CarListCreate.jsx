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
                    Unit Kendaraan
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
                    Plat Nomor
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
                    Status GPS
                  </label>
                  <select
                    name=""
                    className="form-select bg-light border-0 py-2"
                    id=""
                  >
                    <option value="">-- Pilih Status --</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Non-Aktif">Blacklist</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">
                    Transmisi
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
                    Status
                  </label>
                  <select
                    name=""
                    className="form-select bg-light border-0 py-2"
                    id=""
                  >
                    <option value="">-- Pilih Status --</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Non-Aktif">Blacklist</option>
                  </select>
                </div>
              </div>

              {/* Kolom Kanan */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">
                    Tanggal Servis
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
                    Tanggal Pajak
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
                    GPS
                  </label>
                  <select
                    name=""
                    className="form-select bg-light border-0 py-2"
                    id=""
                  >
                    <option value="">-- Pilih GPS --</option>
                    <option value="GPS-101">GPS-101</option>
                    <option value="GPS-102">GPS-102</option>
                    <option value="GPS-103">GPS-103</option>
                    <option value="GPS-104">GPS-104</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label text-secondary small fw-bold">
                    Jatuh Tempo
                  </label>
                  <input
                    type="text"
                    className="form-control bg-light border-0 py-2"
                    placeholder="Masukkan jenis unit..."
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Keluhan Unit
                    </label>
                    <textarea
                      className="form-control bg-light border-0"
                      rows="3"
                      placeholder="Masukkan keluhan unit..."
                    ></textarea>
                  </div>
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
