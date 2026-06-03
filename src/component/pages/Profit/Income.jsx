import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import * as XLSX from "xlsx";
import { useReactToPrint } from "react-to-print";

export default function Income() {
  // --- STATE UNTUK SUPABASE ---
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE UNTUK FILTER ---
  const [searchPlat, setSearchPlat] = useState("");
  const [searchUnit, setSearchUnit] = useState("");
  const [filterMonth, setFilterMonth] = useState(""); 

  // --- STATE UNTUK PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- INISIALISASI REACT-TO-PRINT ---
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Rekap_Pendapatan_${filterMonth || "Semua_Waktu"}`,
    removeAfterPrint: true,
  });

  // --- AMBIL DATA DARI SUPABASE ---
  useEffect(() => {
    fetchProfits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMonth]);

  const fetchProfits = async () => {
    try {
      setLoading(true);

      let start_date = null;
      let end_date = null;

      if (filterMonth) {
        const [year, month] = filterMonth.split("-");
        start_date = `${year}-${month}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        end_date = `${year}-${month}-${lastDay}`;
      }

      const { data, error } = await supabase.rpc("get_profits", {
        start_date: start_date,
        end_date: end_date,
      });

      if (error) throw error;
      setIncomes(data || []);
    } catch (error) {
      console.error("Error fetching profits:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIKA FILTER PENCARIAN ---
  const filteredIncomes = incomes.filter((item) => {
    const matchPlat = (item.nomor_plat || "").toLowerCase().includes(searchPlat.toLowerCase());
    const matchUnit = (item.jenis_unit || "").toLowerCase().includes(searchUnit.toLowerCase());
    return matchPlat && matchUnit;
  });

  // --- MENGHITUNG GRAND TOTAL ---
  const grandTotalPenghasilan = filteredIncomes.reduce(
    (sum, item) => sum + (Number(item.total_penghasilan) || 0), 0
  );
  
  const grandTotalJalan = filteredIncomes.reduce(
    (sum, item) => sum + (Number(item.total_jalan) || 0), 0
  );

  const grandTotalHari = filteredIncomes.reduce(
    (sum, item) => sum + (Number(item.total_hari) || 0), 0
  );

  // --- LOGIKA PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredIncomes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredIncomes.length / itemsPerPage);

  // --- FUNGSI BANTUAN FORMAT UANG ---
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID").format(angka || 0);
  };

  // --- FUNGSI EXPORT KE EXCEL ---
  const exportToExcel = () => {
    if (filteredIncomes.length === 0) {
      alert("Tidak ada data untuk di-export!");
      return;
    }

    const fileName = filterMonth 
      ? `Laporan_Pendapatan_${filterMonth}.xlsx` 
      : "Laporan_Pendapatan_Semua_Waktu.xlsx";

    const headers = [
      "No",
      "Jenis Unit",
      "Nomor Plat",
      "Total Jalan (Kali)",
      "Total Hari (Hari)",
      "Total Penghasilan (Rp)"
    ];

    const rows = filteredIncomes.map((item, index) => [
      index + 1,
      item.jenis_unit || "-",
      item.nomor_plat || "-",
      item.total_jalan || 0,
      item.total_hari || 0,
      item.total_penghasilan || 0,
    ]);

    // Tambahkan baris Grand Total di akhir file Excel
    const grandTotalRow = [
      "",
      "TOTAL KESELURUHAN",
      "",
      grandTotalJalan,
      grandTotalHari,
      grandTotalPenghasilan
    ];

    const dataToExport = [headers, ...rows, [], grandTotalRow];

    const worksheet = XLSX.utils.aoa_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Pendapatan");

    const wscols = [
      { wch: 5 },  // No
      { wch: 30 }, // Jenis Unit
      { wch: 15 }, // Nomor Plat
      { wch: 20 }, // Total Jalan
      { wch: 20 }, // Total Hari
      { wch: 25 }, // Total Penghasilan
    ];
    worksheet["!cols"] = wscols;

    XLSX.writeFile(workbook, fileName);
  };

  const resetFilters = () => {
    setSearchPlat("");
    setSearchUnit("");
    setFilterMonth(""); 
    setCurrentPage(1);
  };

  return (
    <div className="h-100 bg-light d-flex flex-column w-100">
      
      {/* CSS KHUSUS PRINT */}
      <style>
        {`
          @media print {
            @page { size: A4 portrait; margin: 15mm; }
            body { background-color: white !important; -webkit-print-color-adjust: exact; }
            .h-100 { height: auto !important; }
            .overflow-auto { overflow: visible !important; }
            .card { border: none !important; box-shadow: none !important; }
            .d-print-none { display: none !important; }
            .d-print-block { display: block !important; }
            .d-print-flex { display: flex !important; }
            
            /* Tampilkan semua baris tanpa terpotong pagination */
            .print-all-rows { display: table-row-group !important; }
            .screen-only-rows { display: none !important; }
            
            .table-light th, .table-light td { background-color: #f8f9fa !important; }
            tr { page-break-inside: avoid; }
          }
        `}
      </style>

      <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column">
        
        {/* Header Halaman (Hanya Layar) */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-shrink-0 d-print-none">
          <div>
            <h4 className="fw-bold text-dark mb-1">Laporan Pendapatan</h4>
            <p className="text-muted small mb-0">Rekapitulasi pemasukan dan total jalan armada Mitra Jalan</p>
          </div>

          <div className="d-flex gap-2">
            <button onClick={exportToExcel} className="btn btn-success shadow-sm px-3 d-flex align-items-center" title="Export data ke Excel">
              <i className="fas fa-file-excel me-2"></i>Export Excel
            </button>
            <button onClick={handlePrint} className="btn text-white shadow-sm px-3 d-flex align-items-center" style={{ backgroundColor: "#17a2b8" }} title="Cetak Rekap (PDF)">
              <i className="fas fa-print me-2"></i>Cetak Rekap
            </button>
          </div>
        </div>

        {/* Card Utama */}
        <div className="card border-0 shadow-sm d-flex flex-column flex-grow-1">
          
          {/* Toolbar Pencarian / Filter (Hanya Layar) */}
          <div className="card-header bg-white py-3 border-bottom-0 flex-shrink-0 d-print-none">
            <div className="row g-2 align-items-center">
              
              <div className="col-md-3">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="fas fa-car text-muted"></i>
                  </span>
                  <input 
                    type="text" 
                    className="form-control bg-light border-start-0 shadow-none" 
                    placeholder="Cari Jenis Mobil..." 
                    value={searchUnit}
                    onChange={(e) => {
                      setSearchUnit(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="fas fa-barcode text-muted"></i>
                  </span>
                  <input 
                    type="text" 
                    className="form-control bg-light border-start-0 shadow-none" 
                    placeholder="Cari Plat Nomor..." 
                    value={searchPlat}
                    onChange={(e) => {
                      setSearchPlat(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="fas fa-calendar-alt text-muted"></i>
                  </span>
                  <input 
                    type={filterMonth ? "month" : "text"} 
                    onFocus={(e) => (e.target.type = "month")}
                    onBlur={(e) => {
                      if (!filterMonth) e.target.type = "text";
                    }}
                    className="form-control bg-light border-start-0 shadow-none text-muted" 
                    placeholder="Pilih Bulan & Tahun..."
                    value={filterMonth}
                    onChange={(e) => {
                      setFilterMonth(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              <div className="col-md-2">
                {(searchUnit || searchPlat || filterMonth) && (
                  <button 
                    className="btn btn-sm btn-light border w-100 shadow-sm" 
                    onClick={resetFilters}
                  >
                    <i className="fas fa-times me-1"></i>Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Area Tabel (Digunakan sebagai target ref untuk print) */}
          <div className="card-body p-0 flex-grow-1 overflow-auto bg-white" ref={componentRef}>
            
            {/* --- KOP SURAT (Hanya Tampil Saat Print) --- */}
            <div className="d-none d-print-block px-4 pt-5 pb-3">
              <img src="/Image/kop_surat.png" alt="" className="w-100 h-100" />
              <div className="text-center pb-3 mb-4">
                <h3
                  className="fw-bold text-uppercase mb-1"
                  style={{ letterSpacing: "1px" }}
                >
                  Rekapitulasi Pendapatan
                </h3>
                <p className="text-dark fw-bold mb-0">
                  Periode:{" "}
                  {filterMonth
                    ? new Date(filterMonth).toLocaleDateString("id-ID", {
                        month: "long",
                        year: "numeric",
                      })
                    : "Semua Waktu"}
                </p>
              </div>
            </div>

            <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.85rem" }}>
              <thead className="sticky-top bg-white shadow-sm table-light" style={{ zIndex: 10 }}>
                <tr>
                  <th className="px-3 py-3 text-secondary fw-bold text-uppercase border-bottom text-center" style={{ width: "5%" }}>No</th>
                  <th className="px-3 py-3 text-secondary fw-bold text-uppercase border-bottom text-start" style={{ width: "20%" }}>Jenis Mobil</th>
                  <th className="px-3 py-3 text-secondary fw-bold text-uppercase border-bottom text-center" style={{ width: "15%" }}>Nomor Plat</th>
                  <th className="px-3 py-3 text-secondary fw-bold text-uppercase border-bottom text-center" style={{ width: "10%" }}>Total Jalan</th>
                  <th className="px-3 py-3 text-secondary fw-bold text-uppercase border-bottom text-center" style={{ width: "10%" }}>Total Hari</th>
                  <th className="px-3 py-3 text-secondary fw-bold text-uppercase border-bottom text-end" style={{ width: "30%" }}>Total Pemasukan</th>
                  <th className="px-3 py-3 text-secondary fw-bold text-uppercase border-bottom text-center d-print-none" style={{ width: "10%" }}>Aksi</th>
                </tr>
              </thead>
              
              {/* --- TAMPILAN LAYAR (PAGINATED) --- */}
              <tbody className="screen-only-rows d-print-none">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Memuat data laporan...
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <i className="fas fa-box-open fs-2 mb-3 d-block opacity-50"></i>
                      Tidak ada data pendapatan yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item, index) => (
                    <tr key={item.car_id || index}>
                      <td className="px-3 text-muted text-center">{indexOfFirstItem + index + 1}</td>
                      <td className="px-3 text-start"><div className="fw-bold text-dark text-uppercase">{item.jenis_unit || "-"}</div></td>
                      <td className="px-3 text-center">
                        <span className="badge border text-dark bg-white px-2 py-1 shadow-sm text-nowrap" style={{ letterSpacing: "1px" }}>
                          {item.nomor_plat || "-"}
                        </span>
                      </td>
                      <td className="px-3 text-center">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fs-6">
                          {item.total_jalan || 0} Kali
                        </span>
                      </td>
                      <td className="px-3 text-center">
                        <span className="text-dark fw-medium">
                          {item.total_hari || 0} Hari
                        </span>
                      </td>
                      <td className="px-3 text-end fw-bold text-success text-nowrap fs-6">
                        Rp {formatRupiah(item.total_penghasilan)}
                      </td>
                      <td className="px-3 text-center d-print-none">
                        <Link
                          to={`/income/show/${item.car_id}?month=${filterMonth}`}
                          className="btn btn-sm shadow-sm d-inline-flex align-items-center justify-content-center"
                          title="Lihat Detail Pemasukan"
                          style={{ backgroundColor: "#0cc2aa", color: "white", borderRadius: "6px", width: "32px", height: "32px" }}
                        >
                          <i className="fas fa-file-alt"></i>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* --- TAMPILAN PRINT (FULL DATA) --- */}
              <tbody className="print-all-rows d-none">
                {filteredIncomes.map((item, index) => (
                  <tr key={item.car_id || index}>
                    <td className="px-3 text-muted text-center border-bottom">{index + 1}</td>
                    <td className="px-3 text-start fw-bold text-dark text-uppercase border-bottom">{item.jenis_unit || "-"}</td>
                    <td className="px-3 text-center border-bottom">{item.nomor_plat || "-"}</td>
                    <td className="px-3 text-center border-bottom">{item.total_jalan || 0} Kali</td>
                    <td className="px-3 text-center border-bottom">{item.total_hari || 0} Hari</td>
                    <td className="px-3 text-end fw-bold text-success text-nowrap border-bottom">Rp {formatRupiah(item.total_penghasilan)}</td>
                  </tr>
                ))}
              </tbody>

              {/* --- GRAND TOTAL (TAMPIL DI LAYAR & PRINT) --- */}
              {!loading && filteredIncomes.length > 0 && (
                <tfoot className="table-light sticky-bottom shadow-sm" style={{ zIndex: 9 }}>
                  <tr>
                    <td colSpan="3" className="px-3 py-3 text-end fw-bold text-dark text-uppercase border-top">
                      TOTAL KESELURUHAN
                    </td>
                    <td className="px-3 py-3 text-center fw-bold text-primary fs-6 border-top">
                      {grandTotalJalan} Kali
                    </td>
                    <td className="px-3 py-3 text-center fw-bold text-dark fs-6 border-top">
                      {grandTotalHari} Hari
                    </td>
                    <td className="px-3 py-3 text-end fw-bold text-success fs-5 border-top text-nowrap">
                      Rp {formatRupiah(grandTotalPenghasilan)}
                    </td>
                    <td className="border-top d-print-none"></td>
                  </tr>
                </tfoot>
              )}
            </table>

            {/* --- TANDA TANGAN (Hanya Tampil Saat Print) --- */}
            <div className="d-none d-print-flex row mt-5 pt-4 px-4 text-center" style={{ pageBreakInside: "avoid" }}>
              <div className="col-8"></div>
              <div className="col-4">
                <p className="mb-5 text-dark">
                  Makassar, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <div style={{ height: "70px" }}></div>
                <p className="fw-bold border-top border-dark d-inline-block px-4 pt-2 text-dark">
                  Manager Operasional
                </p>
              </div>
            </div>

          </div>

          {/* Footer & Pagination (Hanya Layar) */}
          <div className="card-footer bg-white border-top py-3 px-4 flex-shrink-0 d-print-none">
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted small">
                Showing {filteredIncomes.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredIncomes.length)} of {filteredIncomes.length} entries
              </span>
              
              {totalPages > 1 && (
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link border-0 text-muted bg-transparent" 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      >
                        Prev
                      </button>
                    </li>
                    
                    {Array.from({ length: totalPages }, (_, i) => (
                      <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                        <button
                          className={`page-link border-0 rounded mx-1 shadow-sm px-3 ${currentPage === i + 1 ? 'text-white' : 'text-dark'}`}
                          style={{ backgroundColor: currentPage === i + 1 ? "#0061f2" : "transparent" }}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link border-0 text-primary bg-transparent"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}