import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { useReactToPrint } from "react-to-print";

export default function Outcome() {
  // --- STATE UNTUK SUPABASE ---
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE UNTUK FILTER & SORT ---
  const [searchJenis, setSearchJenis] = useState("");
  const [searchTanggal, setSearchTanggal] = useState("");
  const [filterMonth, setFilterMonth] = useState(""); // Filter Bulan & Tahun
  const [sortOrder, setSortOrder] = useState("desc");

  // --- STATE UNTUK PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- STATE UNTUK MODAL ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- INISIALISASI REACT-TO-PRINT ---
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Rekap_Pengeluaran_${filterMonth || "Semua_Waktu"}`,
    removeAfterPrint: true,
  });

  // --- AMBIL DATA DARI SUPABASE ---
  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder, filterMonth]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("expenses")
        .select("*")
        .order("tanggal_pengeluaran", { ascending: sortOrder === "asc" });

      // Jika filter bulan aktif, terapkan query range tanggal
      if (filterMonth) {
        const [year, month] = filterMonth.split("-");
        const startDate = `${year}-${month}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${month}-${lastDay}`;

        query = query
          .gte("tanggal_pengeluaran", startDate)
          .lte("tanggal_pengeluaran", endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIKA FILTER PENCARIAN (Client-Side) ---
  const filteredExpenses = expenses.filter((item) => {
    const matchJenis = (item.jenis_pengeluaran || "")
      .toLowerCase()
      .includes(searchJenis.toLowerCase());
    const matchTanggal =
      searchTanggal === "" || item.tanggal_pengeluaran === searchTanggal;
    return matchJenis && matchTanggal;
  });

  // --- HITUNG GRAND TOTAL ---
  const grandTotal = filteredExpenses.reduce(
    (sum, item) => sum + (item.total_pengeluaran || 0),
    0
  );

  // --- LOGIKA PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredExpenses.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

  // --- FUNGSI HAPUS DATA ---
  const handleDeleteClick = (id, jenis) => {
    setExpenseToDelete({ id, jenis });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("expense_id", expenseToDelete.id);

      if (error) throw error;

      setShowDeleteModal(false);
      fetchExpenses();
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        setExpenseToDelete(null);
      }, 2000);
    } catch (error) {
      console.error("Error deleting expense:", error.message);
      alert("Gagal menghapus data.");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setExpenseToDelete(null);
  };

  // --- FUNGSI BANTUAN ---
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID").format(angka || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const exportToCSV = () => {
    if (filteredExpenses.length === 0) {
      alert("Tidak ada data untuk di-export!");
      return;
    }

    const fileName = filterMonth
      ? `Laporan_Pengeluaran_${filterMonth}.csv`
      : "Laporan_Pengeluaran_Semua_Waktu.csv";

    const headers = [
      "No",
      "Tanggal",
      "Jenis Pengeluaran",
      "Keterangan",
      "Total Pengeluaran (Rp)",
    ];
    const rows = filteredExpenses.map((item, index) => [
      index + 1,
      `"${item.tanggal_pengeluaran || "-"}"`,
      `"${item.jenis_pengeluaran || "-"}"`,
      `"${item.keterangan || "-"}"`,
      item.total_pengeluaran || 0,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((e) => e.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearchJenis("");
    setSearchTanggal("");
    setFilterMonth("");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  return (
    <div className="h-100 bg-light d-flex flex-column">
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
            
            /* Tampilkan semua baris data, hilangkan batasan pagination saat di-print */
            .print-all-rows { display: table-row-group !important; }
            .screen-only-rows { display: none !important; }
            
            .table-light th, .table-light td { background-color: #f8f9fa !important; }
            tr { page-break-inside: avoid; }
          }
        `}
      </style>

      <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column">
        {/* Header Halaman */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-shrink-0 d-print-none">
          <div>
            <h4 className="fw-bold text-dark mb-1">Manajemen Pengeluaran</h4>
            <p className="text-muted small mb-0">
              Pencatatan biaya operasional dan perawatan
            </p>
          </div>

          <div className="d-flex gap-2">
            <button
              onClick={exportToCSV}
              className="btn btn-success text-white shadow-sm px-3"
              title="Export CSV"
            >
              <i className="fas fa-file-excel me-2"></i>Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="btn text-white shadow-sm px-3"
              style={{ backgroundColor: "#17a2b8" }}
            >
              <i className="fas fa-print me-2"></i>Cetak Rekap
            </button>
            <Link
              to="/outcome/create"
              className="btn btn-primary shadow-sm px-3"
            >
              <i className="fas fa-plus me-2"></i>Tambah Data
            </Link>
          </div>
        </div>

        {/* Card Utama */}
        <div className="card border-0 shadow-sm d-flex flex-column flex-grow-1">
          {/* Toolbar Pencarian / Filter */}
          <div className="card-header bg-white py-3 border-bottom-0 flex-shrink-0 d-print-none">
            <div className="row g-2 align-items-center">
              <div className="col-md-3">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="fas fa-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light border-start-0 shadow-none"
                    placeholder="Jenis Pengeluaran..."
                    value={searchJenis}
                    onChange={(e) => {
                      setSearchJenis(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              {/* FILTER: BULAN & TAHUN */}
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
                    placeholder="Pilih Bulan..."
                    value={filterMonth}
                    onChange={(e) => {
                      setFilterMonth(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              {/* FILTER: SORT ASC/DESC */}
              <div className="col-md-3">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="fas fa-sort-amount-down text-muted"></i>
                  </span>
                  <select
                    className="form-select bg-light border-start-0 shadow-none text-muted"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="desc">Terbaru → Terlama (Desc)</option>
                    <option value="asc">Terlama → Terbaru (Asc)</option>
                  </select>
                </div>
              </div>

              <div className="col-md-2">
                {(searchJenis ||
                  searchTanggal ||
                  filterMonth ||
                  sortOrder !== "desc") && (
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

          {/* Area Laporan & Tabel (Ref untuk Print) */}
          <div
            className="card-body p-0 flex-grow-1 overflow-auto bg-white"
            ref={componentRef}
          >
            {/* KOP SURAT (Hanya muncul saat di-print) */}
            <div className="d-none d-print-block px-4 pt-5 pb-3">
              <div className="text-center border-bottom border-dark border-2 pb-3 mb-4">
                <h3
                  className="fw-bold text-uppercase mb-1"
                  style={{ letterSpacing: "1px" }}
                >
                  Rekapitulasi Pengeluaran
                </h3>
                <h5 className="text-muted mb-2">CV. MITRA JALAN</h5>
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

            <table
              className="table table-hover align-middle mb-0"
              style={{ fontSize: "0.85rem" }}
            >
              <thead
                className="sticky-top shadow-sm table-light"
                style={{ zIndex: 10 }}
              >
                <tr>
                  <th
                    className="px-4 py-3 text-secondary fw-bold text-uppercase border-bottom text-center"
                    style={{ width: "5%" }}
                  >
                    No
                  </th>
                  <th
                    className="px-3 py-3 text-secondary fw-bold text-uppercase border-bottom text-start"
                    style={{ width: "15%" }}
                  >
                    Tanggal
                  </th>
                  <th
                    className="px-3 py-3 text-secondary fw-bold text-uppercase border-bottom text-start"
                    style={{ width: "25%" }}
                  >
                    Jenis Pengeluaran
                  </th>
                  <th
                    className="px-3 py-3 text-secondary fw-bold text-uppercase border-bottom text-start"
                    style={{ width: "25%" }}
                  >
                    Keterangan
                  </th>
                  <th
                    className="px-4 py-3 text-secondary fw-bold text-uppercase border-bottom text-end text-nowrap"
                    style={{ width: "15%" }}
                  >
                    Total (Rp)
                  </th>
                  <th
                    className="px-4 py-3 text-center text-secondary fw-bold text-uppercase border-bottom d-print-none"
                    style={{ width: "15%" }}
                  >
                    Aksi
                  </th>
                </tr>
              </thead>

              {/* BODY UNTUK TAMPILAN LAYAR (Dengan Pagination, TANPA Grand Total) */}
              <tbody className="screen-only-rows d-print-none">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <div
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></div>
                      Memuat data...
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <i className="fas fa-receipt fs-2 mb-3 d-block opacity-50"></i>
                      Tidak ada catatan pengeluaran.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item, index) => (
                    <tr key={item.expense_id}>
                      <td className="px-4 text-muted text-center">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-3 text-start text-dark fw-bold">
                        {formatDate(item.tanggal_pengeluaran)}
                      </td>
                      <td className="px-3 text-start">
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 text-uppercase">
                          {item.jenis_pengeluaran || "-"}
                        </span>
                      </td>
                      <td
                        className="px-3 text-start text-wrap text-muted"
                        style={{ minWidth: "150px" }}
                      >
                        {item.keterangan || "-"}
                      </td>
                      <td className="px-4 text-end fw-bold text-danger text-nowrap">
                        Rp {formatRupiah(item.total_pengeluaran)}
                      </td>
                      <td className="px-4 text-center d-print-none">
                        <div className="btn-group shadow-sm">
                          <Link
                            to={`/outcome/show/${item.expense_id}`}
                            className="btn btn-sm btn-white border text-info"
                            title="Detail BKK"
                          >
                            <i className="fas fa-file-invoice-dollar"></i>
                          </Link>
                          <Link
                            to={`/outcome/edit/${item.expense_id}`}
                            className="btn btn-sm btn-white border text-primary"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            onClick={() =>
                              handleDeleteClick(
                                item.expense_id,
                                item.jenis_pengeluaran
                              )
                            }
                            className="btn btn-sm btn-white border text-danger"
                            title="Hapus"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* BODY UNTUK KERTAS PRINT (Semua Data Muncul Tanpa Pagination + Muncul Grand Total) */}
              <tbody className="print-all-rows d-none">
                {filteredExpenses.map((item, index) => (
                  <tr key={item.expense_id}>
                    <td className="px-4 text-muted text-center border-bottom">
                      {index + 1}
                    </td>
                    <td className="px-3 text-start text-dark fw-bold border-bottom">
                      {formatDate(item.tanggal_pengeluaran)}
                    </td>
                    <td className="px-3 text-start border-bottom text-uppercase">
                      {item.jenis_pengeluaran || "-"}
                    </td>
                    <td className="px-3 text-start text-wrap text-muted border-bottom">
                      {item.keterangan || "-"}
                    </td>
                    <td className="px-4 text-end fw-bold text-danger border-bottom text-nowrap">
                      Rp {formatRupiah(item.total_pengeluaran)}
                    </td>
                  </tr>
                ))}

                {/* GRAND TOTAL HANYA MUNCUL DI PRINT */}
                <tr className="table-light">
                  <td
                    colSpan="4"
                    className="text-end py-3 fw-bold text-uppercase border-bottom-0"
                  >
                    Grand Total Pengeluaran
                  </td>
                  <td
                    className="text-end py-3 fw-bold text-danger border-bottom-0 text-nowrap"
                    style={{ fontSize: "1.1rem" }}
                  >
                    Rp {formatRupiah(grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* TANDA TANGAN (Hanya muncul saat di-print) */}
            <div
              className="d-none d-print-flex row mt-5 pt-4 px-4 text-center"
              style={{ pageBreakInside: "avoid" }}
            >
              <div className="col-8"></div>
              <div className="col-4">
                <p className="mb-5 text-dark">
                  Makassar,{" "}
                  {new Date().toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <div style={{ height: "70px" }}></div>
                <p className="fw-bold border-top border-dark d-inline-block px-4 pt-2 text-dark">
                  Manager Operasional
                </p>
              </div>
            </div>
          </div>

          {/* Footer Pagination (Hanya di Layar) */}
          <div className="card-footer bg-white border-top py-3 px-4 flex-shrink-0 d-print-none">
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted small">
                Showing {filteredExpenses.length > 0 ? indexOfFirstItem + 1 : 0}{" "}
                to {Math.min(indexOfLastItem, filteredExpenses.length)} of{" "}
                {filteredExpenses.length} entries
              </span>
              {totalPages > 1 && (
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link border-0 text-muted bg-transparent"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                      >
                        Prev
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <li
                        key={i + 1}
                        className={`page-item ${
                          currentPage === i + 1 ? "active" : ""
                        }`}
                      >
                        <button
                          className={`page-link border-0 rounded mx-1 shadow-sm px-3 ${
                            currentPage === i + 1 ? "text-white" : "text-dark"
                          }`}
                          style={{
                            backgroundColor:
                              currentPage === i + 1
                                ? "#0061f2"
                                : "transparent",
                          }}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link border-0 text-primary bg-transparent"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
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

      {/* --- MODAL HAPUS --- */}
      {showDeleteModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(5px)",
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: "16px" }}
            >
              <div className="modal-body p-4 text-center">
                <div
                  className="mx-auto mb-4 d-flex align-items-center justify-content-center bg-danger-subtle text-danger"
                  style={{ width: "64px", height: "64px", borderRadius: "50%" }}
                >
                  <i className="fas fa-trash-alt fs-3"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Hapus?</h5>
                <p className="text-muted mb-4 small">
                  Menghapus data <b>{expenseToDelete?.jenis}</b>
                </p>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-light w-50 border"
                    onClick={cancelDelete}
                  >
                    Batal
                  </button>
                  <button
                    className="btn btn-danger w-50"
                    onClick={confirmDelete}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL POP UP SUKSES HAPUS --- */}
      {showSuccessModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(5px)",
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: "16px" }}
            >
              <div className="modal-body p-4 text-center">
                <div
                  className="mx-auto mb-4 d-flex align-items-center justify-content-center bg-success-subtle text-success"
                  style={{ width: "64px", height: "64px", borderRadius: "50%" }}
                >
                  <i className="fas fa-check fs-2"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Berhasil Dihapus!</h5>
                <div className="d-flex align-items-center justify-content-center text-muted small">
                  <div
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    style={{ width: "12px", height: "12px" }}
                  ></div>
                  Memperbarui tabel...
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}