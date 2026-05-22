import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";

export default function ShowTransaction({ data, onBack }) {
  const componentRef = useRef(null);

  // Fungsi react-to-print versi terbaru
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Struk_Transaksi_${data?.id || "Rental"}`,
    removeAfterPrint: true,
  });

  if (!data) {
    return (
      <div
        className="min-vh-100 d-flex justify-content-center align-items-center bg-light"
        style={{ fontSize: "0.85rem", color: "#333333" }}
      >
        <div
          className="text-center text-muted border p-4 bg-white"
          style={{ borderRadius: "3px", maxWidth: "400px" }}
        >
          <i
            className="fas fa-file-invoice-dollar text-secondary mb-3"
            style={{ fontSize: "2rem" }}
          ></i>
          <h6 className="fw-bold text-dark">Data transaksi tidak ditemukan.</h6>
          <button
            onClick={onBack}
            className="btn btn-sm btn-primary mt-3 px-3"
            style={{ borderRadius: "3px", backgroundColor: "#0052cc" }}
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // Helper untuk menentukan URL Media (Google Drive Embed atau Rute Lokal Internal)
  const renderMediaUrl = (fileIdOrPath) => {
    if (!fileIdOrPath) return null;
    if (fileIdOrPath.startsWith("http")) return fileIdOrPath;
    return `/view-storage/${fileIdOrPath}`;
  };

  const isLunas = data.status_pembayaran === "Lunas";

  return (
    <div
      className="min-vh-100 bg-light py-4"
      style={{ fontSize: "0.85rem", color: "#333333" }}
    >
      {/* HEADER UTAMA (GAMBAR HEAD ASLI DI-RETAIN) */}
      <div className="container mb-4 no-print" style={{ maxWidth: "900px" }}>
        <div
          className="d-flex justify-content-between align-items-center bg-white p-3 border"
          style={{ borderRadius: "3px" }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="p-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center"
              style={{ borderRadius: "3px" }}
            >
              <i
                className="fas fa-file-invoice-dollar"
                style={{ fontSize: "1.75rem", color: "#0052cc" }}
              ></i>
            </div>
            <div>
              <h5 className="fw-bold text-dark mb-1">
                Detail Transaksi Pelanggan
              </h5>
              <p className="text-muted mb-0 small">
                Menampilkan data lengkap peminjaman unit armada dan administrasi
                keuangan.
              </p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="btn btn-sm btn-outline-secondary fw-bold px-3 py-1.5"
            style={{ borderRadius: "3px" }}
          >
            <i className="fas fa-arrow-left me-1.5"></i>Kembali
          </button>
        </div>
      </div>

      {/* AREA DOKUMEN INVOICE UNTUK PRINT */}
      <div
        className="container bg-white p-4 border mb-4"
        ref={componentRef}
        style={{ maxWidth: "900px", borderRadius: "3px" }}
      >
        {/* Header Nota Cetak */}
        {/* Header Nota Cetak dengan Kop Surat */}
        {/* GAMBAR KOP SURAT UTAMA - MELEBAR COMPACT 100% (FULL WIDTH) */}
        <div className="w-100 mb-4 border-bottom pb-3">
          <img
            src="/Image/kop_surat.png" // Path file gambar kop surat melebar Anda
            alt="Kop Surat Resmi Pronto ERP Operasional"
            className="w-100"
            style={{
              height: "auto",
              maxHeight: "140px", // Membatasi tinggi maksimal agar proporsional saat dicetak di kertas
              objectFit: "contain",
              borderRadius: "3px",
            }}
            onError={(e) => {
              // Menyediakan struktur teks alternatif cadangan yang rapi dan kaku jika berkas gambar gagal dimuat
              e.target.style.display = "none";
              e.target.parentNode.innerHTML = `
                <div class="p-3 bg-light border text-center" style="border-radius: 3px;">
                  <h4 class="fw-bold text-dark mb-1 style-tracking" style="letter-spacing: 0.5px;">PRONTO ERP OPERASIONAL</h4>
                  <p class="text-muted mb-0 small" style="font-size: 0.75rem;">Sistem Manajemen Kontrol Fleet & Logistik Invoice Pembukuan Otomatis</p>
                </div>
              `;
            }}
          />
        </div>

        {/* DATA IDENTIFIKASI ARSIP INVOICE (PAS DI BAWAH KOP SURAT MELEBAR) */}
        <div className="row pb-2 mb-3 align-items-center">
          <div className="col-6">
            <span
              className="badge border px-2 py-1 text-secondary bg-light font-mono text-uppercase"
              style={{ fontSize: "0.7rem", borderRadius: "2px" }}
            >
              Arsip Dokumen Negara
            </span>
          </div>
          <div className="col-6 text-end">
            <h5 className="fw-bold text-dark mb-0 font-mono">TRX-{data.id}</h5>
            <small
              className="text-muted d-block"
              style={{ fontSize: "0.725rem" }}
            >
              Tanggal Entri: {data.dibuat}
            </small>
          </div>
        </div>

        {/* Kotak Parameter Status Keuangan */}
        <div className="row g-2 mb-4">
          <div className="col-md-4">
            <div
              className="card bg-light border p-2"
              style={{ borderRadius: "3px" }}
            >
              <span
                className="text-muted d-block mb-0.5 fw-bold"
                style={{ fontSize: "0.7" }}
              >
                STATUS PEMBAYARAN BUKU
              </span>
              <span
                className="fw-bold d-inline-block text-center py-0.5 px-2 rounded-1"
                style={{
                  fontSize: "0.75rem",
                  backgroundColor: isLunas ? "#e6f4ea" : "#fce8e6",
                  color: isLunas ? "#137333" : "#c5221f",
                  border: `1px solid ${isLunas ? "#c4eed0" : "#fad2cf"}`,
                  width: "fit-content",
                }}
              >
                {data.status_pembayaran || "Belum Lunas"}
              </span>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="card bg-light border p-2"
              style={{ borderRadius: "3px" }}
            >
              <span
                className="text-muted d-block mb-0.5 fw-bold"
                style={{ fontSize: "0.7rem" }}
              >
                TOTAL TAGIHAN (IDR)
              </span>
              <span
                className="fw-bold text-dark font-mono"
                style={{ fontSize: "1.05rem" }}
              >
                Rp {data.total_pembayaran || 0}
              </span>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="card bg-light border p-2"
              style={{ borderRadius: "3px" }}
            >
              <span
                className="text-muted d-block mb-0.5 fw-bold"
                style={{ fontSize: "0.7rem" }}
              >
                DURASI MASA SEWA
              </span>
              <span
                className="fw-bold text-primary"
                style={{ fontSize: "1.05rem" }}
              >
                {data.jumlah_hari || 0} Hari Operasional
              </span>
            </div>
          </div>
        </div>

        {/* Blok Grid Data Detail Transaksi */}
        <div className="row g-3">
          {/* Kolom Kiri: Parameter Logistik Sewa */}
          <div className="col-md-6">
            <div className="card border h-100" style={{ borderRadius: "3px" }}>
              <div className="card-header bg-light py-2 px-3 border-bottom">
                <span
                  className="fw-bold text-dark"
                  style={{ fontSize: "0.775rem", letterSpacing: "0.5px" }}
                >
                  I. RENCANA OPERASIONAL & UNIT ARMADA
                </span>
              </div>
              <div className="card-body p-3">
                <table className="table table-sm table-borderless mb-0 align-middle">
                  <tbody>
                    <tr>
                      <td
                        className="text-muted py-1.5"
                        style={{ width: "140px" }}
                      >
                        Nama Customer
                      </td>
                      <td className="py-1.5 text-dark fw-bold">
                        : {data.nama_customer || "-"}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted py-1.5">Merek & Tipe Unit</td>
                      <td className="py-1.5 text-dark fw-bold text-uppercase">
                        : {data.tipe_unit || "-"}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted py-1.5">Plat Nomor Armada</td>
                      <td className="py-1.5">
                        :
                        <span className="badge bg-light text-dark border px-2 py-0.5 font-mono ms-1.5 small">
                          {data.mobil || "-"}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted py-1.5">Sistem Transmisi</td>
                      <td className="py-1.5 text-secondary">
                        : {data.transmisi || "-"}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted py-1.5">Rute Wilayah Tujuan</td>
                      <td className="py-1.5 text-dark fw-bold text-uppercase">
                        : {data.rute || "-"}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted py-1.5">Waktu Mulai Pinjam</td>
                      <td className="py-1.5 text-secondary font-mono small">
                        : {data.waktu || "-"}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted py-1.5">Waktu Pengembalian</td>
                      <td className="py-1.5 text-secondary font-mono small">
                        : {data.waktu_pengembalian || "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Rincian Keuangan & Parameter Kas */}
          <div className="col-md-6">
            <div className="card border h-100" style={{ borderRadius: "3px" }}>
              <div className="card-header bg-light py-2 px-3 border-bottom">
                <span
                  className="fw-bold text-dark"
                  style={{ fontSize: "0.775rem", letterSpacing: "0.5px" }}
                >
                  II. RINCIAN PERHITUNGAN BUKU KEUANGAN
                </span>
              </div>
              <div className="card-body p-3">
                <table className="table table-sm table-borderless mb-0 align-middle">
                  <tbody>
                    <tr>
                      <td
                        className="text-muted py-1.5"
                        style={{ width: "140px" }}
                      >
                        Total Harga Sewa
                      </td>
                      <td className="py-1.5 text-dark fw-bold font-mono text-end">
                        Rp {data.total_pembayaran || 0}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted py-1.5">Uang Muka / DP</td>
                      <td className="py-1.5 text-success font-mono text-end">
                        - Rp {data.dp || 0}
                      </td>
                    </tr>
                    <tr style={{ borderTop: "1px dashed #dee2e6" }}>
                      <td className="text-dark fw-bold py-2">
                        Sisa Tagihan / Buku
                      </td>
                      <td
                        className="py-2 text-danger fw-bold font-mono text-end"
                        style={{ fontSize: "0.95rem" }}
                      >
                        Rp {data.sisa_pembayaran || 0}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted py-1.5">Catatan Log Catat</td>
                      <td
                        className="py-1.5 text-muted text-wrap style-italic small"
                        style={{ fontSize: "0.8rem" }}
                      >
                        : {data.keterangan || "Tidak ada instruksi khusus."}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Baris Lampiran Fisik Berkas Dokumen (Disembunyikan otomatis saat Cetak) */}
        <div className="row g-3 mt-2 no-print">
          {/* Box Lampiran Foto Kondisi Mobil */}
          <div className="col-md-6">
            <div className="card border" style={{ borderRadius: "3px" }}>
              <div className="card-header bg-light py-1.5 px-3 border-bottom">
                <span className="fw-bold text-dark small">
                  <i className="fas fa-image me-1.5 text-primary"></i>Lampiran
                  Foto Fisik Unit (Serah Terima)
                </span>
              </div>
              <div className="card-body p-2 bg-white text-center">
                {data.foto_mobil ? (
                  <div
                    className="bg-light border overflow-hidden d-flex align-items-center justify-content-center"
                    style={{ height: "200px", borderRadius: "2px" }}
                  >
                    <img
                      src={renderMediaUrl(data.foto_mobil)}
                      alt="Kondisi Fisik Kendaraan Berkas"
                      className="img-fluid"
                      style={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                        objectFit: "contain",
                      }}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.parentNode.innerHTML = `<div className="p-3 text-muted small"><i className="fas fa-exclamation-circle text-danger d-block mb-1"></i>Gagal memuat berkas gambar eksternal</div>`;
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="bg-light d-flex flex-column align-items-center justify-content-center border"
                    style={{
                      height: "200px",
                      borderStyle: "dashed",
                      borderRadius: "2px",
                    }}
                  >
                    <i
                      className="fas fa-image text-muted mb-1 opacity-50"
                      style={{ fontSize: "1.5rem" }}
                    ></i>
                    <span
                      className="text-muted small"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Tidak ada lampiran foto
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Box Lampiran Bukti Video Kondisi Mobil */}
          <div className="col-md-6">
            <div className="card border" style={{ borderRadius: "3px" }}>
              <div className="card-header bg-light py-1.5 px-3 border-bottom">
                <span className="fw-bold text-dark small">
                  <i className="fas fa-video me-1.5 text-danger"></i>Lampiran
                  Video Pemeriksaan Unit
                </span>
              </div>
              <div className="card-body p-2 bg-white text-center">
                {data.video_mobil ? (
                  <div
                    className="bg-light border overflow-hidden d-flex align-items-center justify-content-center"
                    style={{ height: "200px", borderRadius: "2px" }}
                  >
                    {data.video_mobil.includes("drive.google.com") ? (
                      <iframe
                        src={data.video_mobil.replace("/view", "/preview")}
                        width="100%"
                        height="100%"
                        title="Pratinjau Video Fleet"
                        style={{ border: "none" }}
                        loading="lazy"
                      />
                    ) : (
                      <video
                        controls
                        style={{ maxHeight: "100%", maxWidth: "100%" }}
                      >
                        <source
                          src={renderMediaUrl(data.video_mobil)}
                          type="video/mp4"
                        />
                        Platform browser tidak mendukung pemutaran log video.
                      </video>
                    )}
                  </div>
                ) : (
                  <div
                    className="bg-light d-flex flex-column align-items-center justify-content-center border"
                    style={{
                      height: "200px",
                      borderStyle: "dashed",
                      borderRadius: "2px",
                    }}
                  >
                    <i
                      className="fas fa-video-slash text-muted mb-1 opacity-50"
                      style={{ fontSize: "1.5rem" }}
                    ></i>
                    <span
                      className="text-muted small"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Tidak ada lampiran video
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tanda Tangan Validitas Pembukuan (Hanya Muncul waktu dicetak / Print) */}
        <div className="print-only mt-5 pt-3">
          <div className="row text-center" style={{ fontSize: "0.8rem" }}>
            <div className="col-4">
              <p className="mb-5 text-uppercase text-muted">
                Petugas Operasional
              </p>
              <div
                className="mx-auto border-bottom"
                style={{ width: "150px" }}
              ></div>
              <small className="text-muted">Staf Administrasi</small>
            </div>
            <div className="col-4"></div>
            <div className="col-4">
              <p className="mb-5 text-uppercase text-muted">
                Penyewa / Customer
              </p>
              <div
                className="mx-auto border-bottom"
                style={{ width: "150px" }}
              ></div>
              <small className="text-muted">Tanda Tangan Penuh</small>
            </div>
          </div>

          <div
            className="text-muted text-center mt-5 pt-4 border-top"
            style={{ fontSize: "0.7rem" }}
          >
            <i className="fas fa-info-circle me-1"></i> Lembar berkas ini sah
            dan dicetak otomatis melalui Subsistem ERP Pronto Operasional pada{" "}
            {new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            .
          </div>
        </div>
      </div>

      {/* TOMBOL CETAK BOTTOM BAR (DISUBSTITUSI DI BAWAH KONTAINER) */}
      <div
        className="container d-flex justify-content-end gap-3 mx-auto w-100 pb-4 no-print"
        style={{ maxWidth: "900px" }}
      >
        <button
          className="btn px-4 py-2 fw-bold text-white d-flex align-items-center"
          style={{ backgroundColor: "#0052cc", borderRadius: "3px" }}
          onClick={handlePrint}
        >
          <i className="fas fa-print me-2"></i>Cetak Lembar Transaksi
        </button>
      </div>
    </div>
  );
}
