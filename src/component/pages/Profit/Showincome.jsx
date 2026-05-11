import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { useReactToPrint } from "react-to-print";

export default function ShowIncome() {
  const { id } = useParams(); 
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const filterMonth = queryParams.get("month") || "";

  const [loading, setLoading] = useState(true);
  const [carInfo, setCarInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // --- INISIALISASI REACT-TO-PRINT ---
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Laporan_Pemasukan_${carInfo?.nomor_plat || 'Unit'}`,
    removeAfterPrint: true,
  });

  useEffect(() => {
    if (id) {
      fetchReportData();
    }
  }, [id, filterMonth]);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      // 1. Ambil Informasi Mobil
      const { data: carData, error: carError } = await supabase
        .from("cars")
        .select("*")
        .eq("cars_id", id)
        .single();

      if (carError) throw carError;
      setCarInfo(carData);

      // 2. Tentukan Rentang Tanggal
      let query = supabase
        .from("transactions")
        .select("*")
        .eq("car_id", id)
        .order("tanggal_sewa", { ascending: true });

      if (filterMonth) {
        const [year, month] = filterMonth.split("-");
        const startDate = `${year}-${month}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${month}-${lastDay}`;
        
        query = query.gte("tanggal_sewa", startDate).lte("tanggal_sewa", endDate);
      }

      // 3. Ambil Riwayat Transaksi
      const { data: trxData, error: trxError } = await query;
      if (trxError) throw trxError;
      setTransactions(trxData || []);

    } catch (error) {
      console.error("Gagal memuat laporan:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- HITUNG TOTAL ---
  const totalPemasukan = transactions.reduce((sum, item) => sum + (item.total_pembayaran || 0), 0);
  const totalJalan = transactions.length;

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID").format(angka || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const options = { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString("id-ID", options);
  };

  if (loading) {
    return (
      <div className="h-100 d-flex justify-content-center align-items-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-2" role="status"></div>
          <p className="text-muted">Menyusun laporan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-100 bg-light d-flex flex-column overflow-auto w-100 p-4">
      
      {/* CSS KHUSUS PRINT & SCROLLING WEB */}
      <style>
        {`
          /* Styling Khusus Tampilan Layar Web */
          .web-scroll-table {
            max-height: 400px;
            overflow-y: auto;
          }

          /* Styling Khusus Kertas Print via react-to-print */
          @media print {
            @page { size: A4 portrait; margin: 15mm; }
            body { 
              background-color: white !important; 
              -webkit-print-color-adjust: exact; 
              font-size: 13px !important;
              color: #000 !important;
            }
            .card { 
              border: none !important; 
              box-shadow: none !important; 
              margin: 0 !important; 
              max-width: 100% !important; 
              border-top: 5px solid #0cc2aa !important;
            }
            .card-body { padding: 0 !important; }
            
            /* Mematikan scroll bar saat di print agar tabel memanjang otomatis ke halaman berikutnya */
            .web-scroll-table {
              max-height: none !important;
              overflow-y: visible !important;
              border: none !important;
            }
            
            /* Mencegah baris tabel terpotong di tengah-tengah halaman kertas */
            tr { page-break-inside: avoid !important; }
            .avoid-page-break { page-break-inside: avoid !important; }
            
            .table-light th, .table-light td { background-color: #f8f9fa !important; }
            .d-print-none { display: none !important; }
          }
        `}
      </style>

      {/* HEADER AKSI (Tidak masuk dalam area componentRef sehingga aman tidak ter-print) */}
      <div className="d-flex justify-content-between align-items-center mb-4 mx-auto w-100 d-print-none" style={{ maxWidth: "900px" }}>
        <div>
          <h4 className="fw-bold text-dark m-0">Laporan Rinci Unit</h4>
          <p className="text-muted small mb-0">Klik tombol cetak untuk mengunduh PDF</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary shadow-sm px-3" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left me-2"></i>Kembali
          </button>
          <button 
            className="btn fw-bold text-white shadow-sm px-4 d-flex align-items-center" 
            style={{ backgroundColor: "#0061f2", borderRadius: "8px" }} 
            onClick={handlePrint}
          >
            <i className="fas fa-print me-2"></i>Cetak Laporan
          </button>
        </div>
      </div>

      {/* AREA DOKUMEN LAPORAN YANG AKAN DI-PRINT */}
      <div
        ref={componentRef}
        className="card border-0 shadow-sm mx-auto bg-white mb-5 w-100"
        style={{
          maxWidth: "900px",
          borderRadius: "0px",
          borderTop: "6px solid #0cc2aa",
        }}
      >
        <div className="card-body p-4 p-md-5">
          {/* KOP SURAT */}
          <div className="text-center mb-5 mt-2">
            <h3 className="fw-bold text-uppercase mb-1" style={{ letterSpacing: "1px" }}>
              Laporan Pemasukan Kendaraan
            </h3>
            <h5 className="text-muted mb-3">CV. MITRA JALAN</h5>
            <p className="text-dark fw-bold mb-0">
              Periode: {filterMonth ? new Date(filterMonth).toLocaleDateString("id-ID", { month: 'long', year: 'numeric' }) : "Semua Waktu"}
            </p>
            <hr className="border-2 opacity-50 mt-4" />
          </div>

          {/* INFORMASI UNIT */}
          <div className="row g-4 mb-4 p-3 bg-light rounded-3 border mx-0">
            <div className="col-6">
              <div className="mb-3">
                <label className="text-secondary small fw-bold text-uppercase">Jenis Unit</label>
                <p className="fs-6 fw-bold text-dark mb-0">{carInfo?.jenis_unit || "-"}</p>
              </div>
              <div className="mb-0">
                <label className="text-secondary small fw-bold text-uppercase">Nomor Plat</label>
                <p className="fs-5 fw-bold text-primary mb-0">{carInfo?.nomor_plat || "-"}</p>
              </div>
            </div>
            <div className="col-6">
              <div className="mb-3">
                <label className="text-secondary small fw-bold text-uppercase">Nomor GPS</label>
                <p className="fs-6 fw-bold text-dark mb-0">{carInfo?.no_gps || "Tidak Ada GPS"}</p>
              </div>
              <div className="mb-0">
                <label className="text-secondary small fw-bold text-uppercase">Transmisi</label>
                <p className="fs-6 fw-bold text-dark mb-0">{carInfo?.transmisi || "-"}</p>
              </div>
            </div>
          </div>

          {/* TABEL DETAIL DENGAN SCROLL (web-scroll-table) */}
          <div className="table-responsive web-scroll-table border rounded-3 mb-4">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light sticky-top shadow-sm" style={{ zIndex: 5 }}>
                <tr className="text-center">
                  <th className="py-3 text-secondary fw-bold small border-bottom-0" style={{ width: "10%" }}>No.</th>
                  <th className="py-3 text-secondary fw-bold small border-bottom-0 text-start">Hari / Tanggal Sewa</th>
                  <th className="py-3 text-secondary fw-bold small border-bottom-0 text-start">Rute Perjalanan</th>
                  <th className="py-3 text-secondary fw-bold small border-bottom-0 text-end pe-4">Pemasukan (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((item, index) => (
                    <tr key={item.transaction_id}>
                      <td className="text-center text-muted">{index + 1}</td>
                      <td className="text-start">{formatDate(item.tanggal_sewa)}</td>
                      <td className="text-start">{item.rute || "-"}</td>
                      <td className="text-end fw-bold text-dark pe-4">Rp {formatRupiah(item.total_pembayaran)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted fst-italic">Tidak ada catatan perjalanan pada periode ini.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* RINGKASAN BAWAH */}
          <table className="table table-bordered mb-5">
            <tbody>
              <tr className="table-light">
                <td className="text-end fw-bold py-3 text-uppercase w-75">Total Pemasukan Kotor</td>
                <td className="text-end fw-bold text-success py-3 pe-4" style={{ fontSize: "1.2rem" }}>
                  Rp {formatRupiah(totalPemasukan)}
                </td>
              </tr>
              <tr className="table-light">
                <td className="text-end fw-bold py-3 text-uppercase w-75">Frekuensi Sewa</td>
                <td className="text-end fw-bold text-dark py-3 pe-4">{totalJalan} Kali Jalan</td>
              </tr>
            </tbody>
          </table>

          {/* TANDA TANGAN */}
          <div className="row mt-5 pt-4 text-center avoid-page-break">
            <div className="col-7"></div>
            <div className="col-5">
              <p className="mb-5">
                Makassar, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <div style={{ height: "80px" }}></div>
              <p className="fw-bold border-top border-dark d-inline-block px-4 pt-2">
                Admin Operasional
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}