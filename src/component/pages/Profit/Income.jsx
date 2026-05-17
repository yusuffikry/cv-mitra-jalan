import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import * as XLSX from "xlsx"; // TAMBAHAN: Import library Excel

export default function Income() {
  // State untuk Supabase
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk Filter
  const [searchPlat, setSearchPlat] = useState("");
  const [searchUnit, setSearchUnit] = useState("");
  const [filterMonth, setFilterMonth] = useState(""); 

  // State untuk Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- AMBIL DATA DARI FUNCTION SUPABASE ---
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

  // --- LOGIKA FILTER PENCARIAN (Client-Side) ---
  const filteredIncomes = incomes.filter((item) => {
    const matchPlat = (item.nomor_plat || "").toLowerCase().includes(searchPlat.toLowerCase());
    const matchUnit = (item.jenis_unit || "").toLowerCase().includes(searchUnit.toLowerCase());
    return matchPlat && matchUnit;
  });

  // --- LOGIKA PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredIncomes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredIncomes.length / itemsPerPage);

  // --- FUNGSI BANTUAN ---
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
      "Total Penghasilan (Rp)",
      "Total Jalan (Kali)"
    ];

    const rows = filteredIncomes.map((item, index) => [
      index + 1,
      item.jenis_unit || "-",
      item.nomor_plat || "-",
      item.total_penghasilan || 0,
      item.total_jalan || 0,
    ]);

    const dataToExport = [headers, ...rows];

    // Membuat Worksheet dan Workbook Excel
    const worksheet = XLSX.utils.aoa_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Pendapatan");

    // Mengatur lebar kolom agar langsung rapi saat dibuka di Excel
    const wscols = [
      { wch: 5 },  // No
      { wch: 30 }, // Jenis Unit
      { wch: 15 }, // Nomor Plat
      { wch: 25 }, // Total Penghasilan
      { wch: 20 }, // Total Jalan
    ];
    worksheet["!cols"] = wscols;

    // Trigger Download File Excel
    XLSX.writeFile(workbook, fileName);
  };

  const resetFilters = () => {
    setSearchPlat("");
    setSearchUnit("");
    setFilterMonth(""); 
    setCurrentPage(1);
  };

  return (
    <div className="h-100 bg-light d-flex flex-column">
      
      <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column">
        
        {/* Header Halaman */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-shrink-0">
          <div>
            <h4 className="fw-bold text-dark mb-1">Laporan Pendapatan</h4>
            <p className="text-muted small mb-0">Rekapitulasi pemasukan dan total jalan armada Mitra Jalan</p>
          </div>

          <div className="d-flex gap-2">
            <button onClick={exportToExcel} className="btn btn-success shadow-sm px-3" title="Export data ke Excel">
              <i className="fas fa-file-excel me-2"></i>Export Excel
            </button>
          </div>
        </div>

        {/* Card Utama */}
        <div className="card border-0 shadow-sm d-flex flex-column flex-grow-1">
          
          {/* Toolbar Pencarian / Filter */}
          <div className="card-header bg-white py-3 border-bottom-0 flex-shrink-0">
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

              {/* FILTER: BULAN & TAHUN DENGAN TRIK PLACEHOLDER */}
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

              {/* TOMBOL RESET */}
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

          {/* Area Tabel */}
          <div className="card-body p-0 flex-grow-1 overflow-auto">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.85rem" }}>
              <thead className="sticky-top bg-white shadow-sm" style={{ zIndex: 10 }}>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th className="px-4 py-3 text-secondary fw-bold text-uppercase border-bottom text-center" style={{ width: "5%" }}>No</th>
                  <th className="px-4 py-3 text-secondary fw-bold text-uppercase border-bottom text-start" style={{ width: "20%" }}>Jenis Mobil</th>
                  <th className="px-4 py-3 text-secondary fw-bold text-uppercase border-bottom text-center" style={{ width: "15%" }}>Nomor Plat</th>
                  <th className="px-4 py-3 text-secondary fw-bold text-uppercase border-bottom text-center" style={{ width: "15%" }}>Total Jalan</th>
                  <th className="px-4 py-3 text-secondary fw-bold text-uppercase border-bottom text-end" style={{ width: "35%" }}>Total Pemasukan</th>
                  <th className="px-4 py-3 text-secondary fw-bold text-uppercase border-bottom text-center" style={{ width: "10%" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Memuat data laporan...
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <i className="fas fa-box-open fs-2 mb-3 d-block opacity-50"></i>
                      Tidak ada data pendapatan yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item, index) => {
                    return (
                      <tr key={item.car_id || index}>
                        <td className="px-4 text-muted text-center">{indexOfFirstItem + index + 1}</td>
                        
                        <td className="px-4 text-start">
                          <div className="fw-bold text-dark text-uppercase">{item.jenis_unit || "-"}</div>
                        </td>

                        <td className="px-4 text-center">
                          <span className="badge border text-dark bg-white px-2 py-1 shadow-sm text-nowrap" style={{ letterSpacing: "1px" }}>
                            {item.nomor_plat || "-"}
                          </span>
                        </td>

                        <td className="px-4 text-center">
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fs-6">
                            {item.total_jalan || 0} Kali
                          </span>
                        </td>

                        <td className="px-4 text-end fw-bold text-success text-nowrap fs-6">
                          Rp {formatRupiah(item.total_penghasilan)}
                        </td>
                        
                        {/* TOMBOL NAVIGASI KE SHOW INCOME */}
                        <td className="px-4 text-center">
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer & Pagination */}
          <div className="card-footer bg-white border-top py-3 px-4 flex-shrink-0">
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