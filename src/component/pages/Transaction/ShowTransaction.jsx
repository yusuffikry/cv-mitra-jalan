import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";

// --- Fungsi Ekstrak ID Google Drive ---
const getDriveId = (url) => {
  if (!url) return null;
  const regex = /[-\w]{25,}/; 
  const match = url.match(regex);
  return match ? match[0] : null;
};

export default function ShowTransaction({ data, onBack }) {
  // 1. Inisialisasi useRef dengan null
  const componentRef = useRef(null);

  // 2. Gunakan contentRef untuk react-to-print versi terbaru
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Struk_Transaksi_TRX-${data?.id || 'Rental'}`,
    removeAfterPrint: true,
  });

  if (!data) {
    return (
      <div className="h-100 d-flex justify-content-center align-items-center bg-light">
        <div className="text-center text-muted">
          <i className="fas fa-file-invoice-dollar fs-1 mb-3"></i>
          <h5>Data transaksi tidak ditemukan.</h5>
          <button onClick={onBack} className="btn btn-primary mt-3">Kembali</button>
        </div>
      </div>
    );
  }

  // --- PROSES LINK MEDIA ---
  const photoId = getDriveId(data.foto_mobil);
  // Perbaikan penulisan variabel: tambahkan tanda $ sebelum kurung kurawal
  const renderPhotoUrl = photoId 
    ? `https://lh3.googleusercontent.com/d/${photoId}`
    : data.foto_mobil;

  const videoId = getDriveId(data.video_mobil);

  return (
    <div className="p-4 bg-light h-100 overflow-auto w-100">
      
      <style>
        {`
          @media print {
            @page { size: A4 portrait; margin: 15mm; }
            .no-print { display: none !important; }
            #printable-receipt {
              box-shadow: none !important;
              border: none !important;
              background-color: transparent !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            #printable-receipt .card-body { padding: 0 !important; }
            .page-break-section {
              page-break-before: always !important; 
              break-before: page !important;
            }
            body, .small, p, span, div { font-size: 13px !important; color: #000 !important; }
            h3 { font-size: 20px !important; }
            h6 { font-size: 14px !important; margin-bottom: 10px !important; }
            .mb-5 { margin-bottom: 2rem !important; }
            .mb-4 { margin-bottom: 1.5rem !important; }
            .p-4.bg-light { 
              padding: 20px !important; 
              background-color: #f8f9fa !important; 
              border: 1px solid #e9ecef !important;
            }
            .print-photo-center {
              margin: 0 auto !important;
              max-width: 500px !important; 
              width: 100% !important;
              flex: 0 0 100% !important;
            }
            .ratio-4x3, .border-dashed {
              height: 250px !important; 
              min-height: 250px !important;
            }
            .ratio-4x3 img {
              max-height: 250px !important;
              object-fit: cover !important;
            }
          }
        `}
      </style>

      {/* Header Halaman */}
      <div className="d-flex justify-content-between align-items-center mb-4 mx-auto" style={{ maxWidth: "900px" }}>
        <div>
          <h4 className="fw-bold text-dark mb-1">Detail Transaksi</h4>
          <p className="text-muted small mb-0">Informasi lengkap penyewaan armada</p>
        </div>
        <button onClick={onBack} className="btn btn-outline-secondary shadow-sm px-3">
          <i className="fas fa-arrow-left me-2"></i>Kembali ke Daftar
        </button>
      </div>

      {/* Bagian yang akan di-print */}
      <div 
        className="card border-0 shadow-sm rounded-3 mb-4 mx-auto bg-white" 
        ref={componentRef}
        id="printable-receipt"
        style={{ maxWidth: "900px" }}
      >
        <div className="card-body p-4 p-md-5">
          
          <div className="text-center mb-5">
            <h3 className="fw-bold text-uppercase tracking-wider" style={{ color: "#0061f2", letterSpacing: "2px" }}>
              Lembar Transaksi
            </h3>
            <hr className="mt-3 mx-auto" style={{ width: "100px", borderTop: "3px solid #0061f2", opacity: 1 }} />
          </div>

          <div className="d-flex justify-content-between align-items-end mb-5 pb-3 border-bottom">
            <div>
              <p className="text-muted small fw-bold mb-1">ID TRANSAKSI</p>
              <span className="badge bg-light text-dark border px-3 py-2 fs-6 shadow-sm" style={{ letterSpacing: "1px" }}>
                TRX-{data.id}
              </span>
            </div>
            <div className="text-end">
              <p className="text-muted small mb-1">Dibuat pada:</p>
              <span className="fw-bold text-dark fs-6">{data.dibuat}</span>
            </div>
          </div>

          {/* DATA KENDARAAN */}
          <div className="mb-5">
            <h6 className="text-primary fw-bold mb-3 pb-2 border-bottom d-inline-block" style={{ letterSpacing: "1px" }}>
              <i className="fas fa-car me-2"></i>DATA KENDARAAN
            </h6>
            <div className="row g-4 px-2 mt-1">
              <div className="col-md-6">
                <div className="d-flex mb-3">
                  <div className="text-muted w-50">Merek/Brand</div>
                  <div className="fw-bold w-50 text-dark">{data.merek}</div>
                </div>
                <div className="d-flex mb-3">
                  <div className="text-muted w-50">Nomor Plat</div>
                  <div className="fw-bold w-50">
                    <span className="badge border text-dark bg-light px-2 py-1">{data.mobil}</span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex mb-3">
                  <div className="text-muted w-50">Jenis Unit</div>
                  <div className="fw-bold w-50 text-dark">{data.tipe_unit}</div>
                </div>
                <div className="d-flex mb-3">
                  <div className="text-muted w-50">Transmisi</div>
                  <div className="fw-bold w-50 text-dark">{data.transmisi}</div>
                </div>
              </div>
            </div>
          </div>

          {/* DATA PENYEWAAN */}
          <div className="mb-5">
            <h6 className="text-success fw-bold mb-3 pb-2 border-bottom d-inline-block" style={{ letterSpacing: "1px" }}>
              <i className="fas fa-file-invoice-dollar me-2"></i>DATA PENYEWAAN
            </h6>
            <div className="row g-4 px-2 mt-1">
              <div className="col-md-6">
                <div className="d-flex mb-3">
                  <div className="text-muted w-50">Nama Pelanggan</div>
                  <div className="fw-bold w-50 text-primary">{data.nama_customer}</div>
                </div>
                <div className="d-flex mb-3">
                  <div className="text-muted w-50">Jadwal Ambil</div>
                  <div className="fw-bold w-50 text-dark">{data.waktu}</div>
                </div>
                <div className="d-flex mb-3">
                  <div className="text-muted w-50">Jadwal Kembali</div>
                  <div className="fw-bold w-50 text-dark">{data.waktu_pengembalian}</div>
                </div>
                <div className="d-flex mb-3">
                  <div className="text-muted w-50">Rute Perjalanan</div>
                  <div className="fw-bold w-50 text-dark">{data.rute}</div>
                </div>
                <div className="d-flex mb-3">
                  <div className="text-muted w-50">Durasi</div>
                  <div className="fw-bold w-50 text-dark">
                    <span className="badge bg-secondary-subtle text-secondary px-2 py-1 border">{data.jumlah_hari} Hari</span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="p-4 bg-light rounded-3 border border-2 border-white shadow-sm">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Uang Muka (DP)</span>
                    <span className="fw-bold text-dark">Rp {data.dp}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Sisa Pembayaran</span>
                    <span className="fw-bold text-danger">Rp {data.sisa_pembayaran}</span>
                  </div>
                  <hr className="border-secondary opacity-25" />
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <span className="text-muted fw-bold">TOTAL BIAYA</span>
                    <span className="fw-bold text-success fs-5">Rp {data.total_pembayaran}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <h6 className="text-secondary fw-bold mb-3 pb-2 border-bottom d-inline-block" style={{ letterSpacing: "1px" }}>
              <i className="fas fa-align-left me-2"></i>KETERANGAN TAMBAHAN
            </h6>
            <div className="p-3 bg-light rounded-3 text-muted" style={{ borderLeft: "4px solid #ced4da" }}>
              {data.keterangan || "Tidak ada catatan khusus untuk transaksi ini."}
            </div>
          </div>

          {/* DOKUMENTASI */}
          <div className="page-break-section">
            <h6 className="text-secondary fw-bold mb-4 pb-2 border-bottom d-inline-block" style={{ letterSpacing: "1px" }}>
              <i className="fas fa-paperclip me-2"></i>LAMPIRAN DOKUMENTASI
            </h6>
            <div className="row g-4 mt-1 justify-content-center">
              <div className="col-md-6 print-photo-center">
                <p className="fw-bold small text-muted mb-2 text-center"><i className="fas fa-image me-2"></i>Foto Serah Terima Kendaraan</p>
                {data.foto_mobil ? (
                  <div className="ratio ratio-4x3 rounded-3 overflow-hidden shadow-sm border bg-dark mx-auto">
                    <img 
                      src={renderPhotoUrl} 
                      alt="Dokumentasi Mobil" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/400x300/eeeeee/999999?text=Izin+Akses+Ditolak";
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-light d-flex flex-column align-items-center justify-content-center rounded-3 border border-dashed" style={{ height: "200px" }}>
                    <i className="fas fa-image text-muted fs-3 mb-2 opacity-50"></i>
                    <span className="text-muted small">Tidak ada foto terlampir</span>
                  </div>
                )}
              </div>

              <div className="col-md-6 no-print">
                <p className="fw-bold small text-muted mb-2 text-center">
                  <i className="fas fa-video me-2"></i>
                  Video Kondisi Kendaraan
                </p>

                {data.video_mobil ? (
                  <div className="ratio ratio-4x3 rounded-3 overflow-hidden shadow-sm border bg-dark mx-auto">
                    {videoId ? (
                      <iframe
                        src={`https://drive.google.com/file/d/${videoId}/preview`}
                        width="100%"
                        height="100%"
                        title="Video Mobil"
                        style={{ border: "none" }}
                        loading="lazy"
                      />
                    ) : (
                      <video controls>
                        <source src={data.video_mobil} type="video/mp4" />
                      </video>
                    )}
                  </div>
                ) : (
                  <div
                    className="bg-light d-flex flex-column align-items-center justify-content-center rounded-3 border border-dashed"
                    style={{ height: "200px" }}
                  >
                    <i className="fas fa-video-slash text-muted fs-3 mb-2 opacity-50"></i>
                    <span className="text-muted small">Tidak ada video terlampir</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Tombol Cetak */}
      <div className="d-flex justify-content-end gap-3 mx-auto w-100 pb-5" style={{ maxWidth: "900px" }}>
        <button
          className="btn px-4 py-2 fw-bold text-white shadow-sm d-flex align-items-center"
          style={{ backgroundColor: "#0061f2", borderRadius: "10px" }}
          onClick={handlePrint}
        >
          <i className="fas fa-print me-2"></i>Cetak Lembar Transaksi
        </button>
      </div>

    </div>
  );
}