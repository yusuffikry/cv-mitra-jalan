import React from "react";

// Menerima props 'data' dan 'onBack' dari MainTransaction
export default function ShowTransaction({ data, onBack }) {
  // Jika tidak ada data yang dikirim, tampilkan pesan error
  if (!data) {
    return <div className="p-5 text-center">Data transaksi tidak ditemukan.</div>;
  }

  return (
    /* Wrapper Utama: Tinggi 100% dari parent, background light, menggunakan flex kolom */
    <div className="h-100 bg-light d-flex flex-column">
      
      {/* Area yang bisa di-scroll: Mengisi sisa ruang (flex-grow-1) dan scroll otomatis (overflow-auto) */}
      <div className="flex-grow-1 overflow-auto p-4">
        
        {/* Tombol Kembali */}
        <button
          onClick={onBack}
          className="btn btn-sm btn-outline-secondary mb-3 shadow-sm border-0 bg-white px-3"
        >
          <i className="fas fa-arrow-left me-2"></i>Kembali
        </button>

        {/* Lembar Transaksi Card */}
        <div
          className="card shadow-sm border-0 mx-auto mb-4"
          style={{ maxWidth: "900px", borderRadius: "12px" }}
        >
          <div className="card-body p-4 p-md-5 text-dark">
            {/* Judul & Garis Pemisah */}
            <div className="text-center mb-4">
              <h2 className="fw-bold text-uppercase tracking-wider text-primary">
                Lembar Transaksi
              </h2>
              <hr className="mt-4 mb-2" style={{ opacity: "0.1" }} />
            </div>

            {/* Tanggal & ID Dibuat di Kanan */}
            <div className="d-flex justify-content-between mb-5">
              <div>
                <span className="badge bg-light text-dark border p-2">
                  ID: {data.id}
                </span>
              </div>
              <div className="text-end text-muted small">
                Dibuat pada: <span className="fw-bold text-dark">{data.dibuat}</span>
              </div>
            </div>

            {/* Bagian DATA KENDARAAN */}
            <div className="mb-5">
              <h6
                className="text-secondary fw-bold mb-3 border-bottom pb-2"
                style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
              >
                <i className="fas fa-car me-2"></i>DATA KENDARAAN
              </h6>
              <div className="row g-3 px-3">
                <div className="col-md-6">
                  <div className="row mb-2">
                    <div className="col-5 text-muted">Merek</div>
                    <div className="col-7 fw-bold">: {data.merek}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5 text-muted">Nomor Plat</div>
                    <div className="col-7 fw-bold text-danger">: {data.mobil}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="row mb-2">
                    <div className="col-5 text-muted">Transmisi</div>
                    <div className="col-7 fw-bold">: {data.transmisi}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5 text-muted">Jenis Unit</div>
                    <div className="col-7 fw-bold">: {data.tipe_unit}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian DATA TRANSAKSI */}
            <div className="mb-5">
              <h6
                className="text-secondary fw-bold mb-3 border-bottom pb-2"
                style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
              >
                <i className="fas fa-file-invoice-dollar me-2"></i>DATA TRANSAKSI
              </h6>
              <div className="row g-3 px-3">
                <div className="col-md-6">
                  <div className="row mb-2">
                    <div className="col-5 text-muted">Nama Customer</div>
                    <div className="col-7 fw-bold text-primary">: {data.nama_customer}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5 text-muted">Waktu Peminjaman</div>
                    <div className="col-7 fw-bold">: {data.waktu}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5 text-muted">Rute Perjalanan</div>
                    <div className="col-7 fw-bold">: {data.rute}</div>
                  </div>
                  <div className="row mb-2 mt-3">
                    <div className="col-5 text-muted">Jumlah Hari</div>
                    <div className="col-7 fw-bold">: {data.jumlah_hari} Hari</div>
                  </div>
                </div>

                {/* Kolom Pembayaran */}
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded border">
                    <div className="row mb-2">
                      <div className="col-5 text-muted">Uang Muka (DP)</div>
                      <div className="col-7 fw-bold">: Rp {data.dp}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-5 text-muted">Sisa Pembayaran</div>
                      <div className="col-7 fw-bold text-danger">: Rp {data.sisa_pembayaran}</div>
                    </div>
                    <hr className="my-2" />
                    <div className="row mb-2">
                      <div className="col-5 text-muted fw-bold">Total Payout</div>
                      <div className="col-7 fw-bold text-success fs-5">: Rp {data.total_pembayaran}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian KETERANGAN */}
            <div className="mb-5">
              <h6
                className="text-secondary fw-bold mb-3 border-bottom pb-2"
                style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
              >
                <i className="fas fa-align-left me-2"></i>KETERANGAN TAMBAHAN
              </h6>
              <div className="p-4 bg-light rounded mx-md-3" style={{ border: "1px solid #eee" }}>
                <p className="text-dark mb-0">{data.keterangan || "Tidak ada keterangan."}</p>
              </div>
            </div>

            {/* Bagian MEDIA (FOTO & VIDEO) */}
            <div className="mb-5">
              <h6
                className="text-secondary fw-bold mb-3 border-bottom pb-2"
                style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
              >
                <i className="fas fa-camera me-2"></i>DOKUMENTASI KENDARAAN
              </h6>
              <div className="row g-4 px-md-3">
                {/* Box Foto Mobil */}
                <div className="col-md-6">
                  <p className="fw-bold small text-muted mb-2">Foto Serah Terima:</p>
                  {data.foto_mobil ? (
                    <div className="ratio ratio-4x3 rounded overflow-hidden shadow-sm border bg-dark">
                      <img src={data.foto_mobil} alt={`Foto ${data.mobil}`} style={{ objectFit: "cover" }} />
                    </div>
                  ) : (
                    <div className="bg-light d-flex align-items-center justify-content-center rounded border" style={{ height: "200px" }}>
                      <span className="text-muted small">Tidak ada foto</span>
                    </div>
                  )}
                </div>

                {/* Box Video Mobil */}
                <div className="col-md-6">
                  <p className="fw-bold small text-muted mb-2">Video Keliling (360°):</p>
                  {data.video_mobil ? (
                    <div className="ratio ratio-4x3 rounded overflow-hidden shadow-sm border bg-dark">
                      <video controls controlsList="nodownload">
                        <source src={data.video_mobil} type="video/mp4" />
                        Browser Anda tidak mendukung tag video.
                      </video>
                    </div>
                  ) : (
                    <div className="bg-light d-flex align-items-center justify-content-center rounded border" style={{ height: "200px" }}>
                      <span className="text-muted small">Tidak ada video terlampir</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons di Bawah Kanan */}
            <div className="d-flex justify-content-end gap-3 pt-4 border-top">
              <button
                className="btn px-5 py-2 fw-bold text-white shadow-sm"
                style={{ backgroundColor: "#ffb366", border: "none", borderRadius: "8px" }}
                onClick={() => window.print()} // Bisa langsung print halaman web!
              >
                <i className="fas fa-print me-2"></i>Cetak Struk
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}