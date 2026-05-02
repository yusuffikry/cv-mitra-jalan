import React from "react";
import { useNavigate } from "react-router-dom";

export default function ShowTransaction() {
  const navigate = useNavigate();

  return (
    <div className="container-fluid py-4 bg-light min-vh-100 overflow-auto">
      {/* Tombol Kembali (Opsional untuk navigasi ERP) */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-sm btn-outline-secondary mb-3 shadow-sm border-0 bg-white"
      >
        <i className="fas fa-arrow-left me-2"></i>Kembali
      </button>

      {/* Lembar Transaksi Card */}
      <div
        className="card shadow-sm border-0 mx-auto"
        style={{ maxWidth: "900px", borderRadius: "0" }}
      >
        <div className="card-body p-5 text-dark">
          {/* Judul & Garis Pemisah */}
          <div className="text-center mb-4">
            <h2 className="fw-bold text-uppercase tracking-wider">
              Lembar Transaksi
            </h2>
            <hr className="mt-4 mb-2" style={{ opacity: "0.1" }} />
          </div>

          {/* Tanggal di Kanan */}
          <div className="text-end mb-5">
            <span className="fw-bold">12 Oktober 2020</span>
          </div>

          {/* Bagian DATA KENDARAAN */}
          <div className="mb-5">
            <h6
              className="text-secondary fw-bold mb-3"
              style={{ fontSize: "0.75rem", letterSpacing: "1px" }}
            >
              DATA KENDARAAN
            </h6>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="row mb-2">
                  <div className="col-5 text-muted">Code</div>
                  <div className="col-7 fw-bold">: CR001</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 text-muted">Merek</div>
                  <div className="col-7 fw-bold">: Toyota</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 text-muted">Nomor Plat</div>
                  <div className="col-7 fw-bold">: DD 123 UR</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="row mb-2">
                  <div className="col-5 text-muted">Transmisi</div>
                  <div className="col-7 fw-bold">: MANUAL</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 text-muted">Jenis Unit</div>
                  <div className="col-7 fw-bold">: Hilux 4x</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bagian DATA TRANSAKSI */}
          <div className="mb-5">
            <h6
              className="text-secondary fw-bold mb-3"
              style={{ fontSize: "0.75rem", letterSpacing: "1px" }}
            >
              DATA TRANSAKSI
            </h6>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="row mb-2">
                  <div className="col-5 text-muted">Customer</div>
                  <div className="col-7 fw-bold text-primary">: Adnan</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 text-muted">Rute</div>
                  <div className="col-7 fw-bold">: DALKOT</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 text-muted">Status DP</div>
                  <div className="col-7 fw-bold">: -</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="row mb-2">
                  <div className="col-5 text-muted">Payment Sisa</div>
                  <div className="col-7 fw-bold">: 500.000</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 text-muted">Jumlah Hari</div>
                  <div className="col-7 fw-bold">: 5</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 text-muted">Total Pembayaran</div>
                  <div className="col-7 fw-bold text-success">: 500.000</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bagian KETERANGAN */}
          <div className="mb-5">
            <h6
              className="text-secondary fw-bold mb-3"
              style={{ fontSize: "0.75rem", letterSpacing: "1px" }}
            >
              KETERANGAN
            </h6>
            <div
              className="p-4 bg-light rounded"
              style={{ minHeight: "150px", border: "1px solid #eee" }}
            >
              <p className="text-muted small">Tidak ada keterangan tambahan.</p>
            </div>
          </div>

          {/* Action Buttons di Bawah Kanan */}
          <div className="d-flex justify-content-end gap-3 pt-4">
            <button
              className="btn px-5 py-2 fw-bold text-white shadow-sm"
              style={{
                backgroundColor: "#ff9a90",
                border: "none",
                borderRadius: "12px",
              }}
            >
              Delete
            </button>
            <button
              className="btn px-5 py-2 fw-bold text-white shadow-sm"
              style={{
                backgroundColor: "#ffb366",
                border: "none",
                borderRadius: "12px",
              }}
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
