import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import * as XLSX from "xlsx"; // TAMBAHAN: Import library Excel

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- STATE UNTUK PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("nama_pelanggan", { ascending: true });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id, name, nik) => {
    setCustomerToDelete({ id, name, nik });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("customer_id", customerToDelete.id);

      if (error) throw error;

      setShowDeleteModal(false);
      fetchCustomers();
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        setCustomerToDelete(null);
      }, 2000);
    } catch (error) {
      console.error("Error deleting customer:", error.message);
      alert("Gagal menghapus data pelanggan. Silakan coba lagi.");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCustomerToDelete(null);
  };

  // --- LOGIKA PENCARIAN (Dipindah ke atas agar bisa dipakai oleh fungsi Excel) ---
  const filteredCustomers = customers.filter((cust) => {
    const searchLower = searchTerm.toLowerCase();
    const matchName = (cust.nama_pelanggan || "")
      .toLowerCase()
      .includes(searchLower);
    const matchNik = (cust.nik || "").toLowerCase().includes(searchLower);
    return matchName || matchNik;
  });

  // --- FUNGSI EXPORT KE EXCEL ---
  const exportToExcel = () => {
    const headers = [
      "No",
      "Nama Pelanggan",
      "NIK",
      "Kontak",
      "Alamat (Domisili)",
      "Kota Rental",
      "Total Rental",
      "Status",
    ];

    const rows = filteredCustomers.map((cust, index) => {
      const displayStatus =
        cust.status === "active"
          ? "Aktif"
          : cust.status === "blacklist"
            ? "Blacklist"
            : cust.status || "-";

      // Bersih dari karakter ekstra karena Excel sudah menanganinya otomatis
      return [
        index + 1,
        cust.nama_pelanggan || "-",
        cust.nik || "-",
        cust.kontak || "-",
        cust.alamat || "-",
        cust.kota || "-",
        cust.total_rental || 0,
        displayStatus,
      ];
    });

    const dataToExport = [headers, ...rows];

    // Membuat Worksheet dan Workbook Excel
    const worksheet = XLSX.utils.aoa_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pelanggan");

    // Mengatur lebar kolom agar langsung rapi saat dibuka di Excel
    const wscols = [
      { wch: 5 }, // No
      { wch: 30 }, // Nama Pelanggan
      { wch: 20 }, // NIK
      { wch: 15 }, // Kontak
      { wch: 40 }, // Alamat
      { wch: 15 }, // Kota Rental
      { wch: 15 }, // Total Rental
      { wch: 15 }, // Status
    ];
    worksheet["!cols"] = wscols;

    // Trigger Download File Excel
    XLSX.writeFile(
      workbook,
      `Data_Pelanggan_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  // --- LOGIKA PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  return (
    <div className="d-flex flex-column vh-100 bg-light p-4 overflow-hidden">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-shrink-0">
        <div>
          <h4 className="fw-bold text-dark mb-1">Manajemen Pelanggan</h4>
          <p className="text-muted small mb-0">
            Data informasi dan riwayat penyewa
          </p>
        </div>

        <div className="d-flex gap-2">
          {/* PERBAIKAN: Tombol dipanggil ke exportToExcel */}
          <button
            onClick={exportToExcel}
            className="btn btn-success shadow-sm px-3"
            title="Export data ke Excel"
          >
            <i className="fas fa-file-excel me-2"></i>Export Excel
          </button>
          <Link
            to="/customers/create"
            className="btn btn-primary shadow-sm px-3"
          >
            <i className="fas fa-plus me-2"></i>Tambah Pelanggan
          </Link>
        </div>
      </div>

      {/* Card Utama */}
      {/* Card Utama */}
      <div
        className="card border-0 shadow-sm rounded-3 d-flex flex-column flex-grow-1 overflow-hidden"
        style={{ backgroundColor: "#ffffff" }}
      >
        {/* Toolbar Pencarian */}
        <div
          className="card-header bg-white py-3 border-bottom flex-shrink-0"
          style={{ borderColor: "#e2e8f0" }}
        >
          <div className="row align-items-center g-2">
            <div className="col-12 col-md-5 col-lg-4">
              <div className="input-group input-group-sm shadow-sm rounded border border-light-subtle">
                <span className="input-group-text bg-light border-0 text-secondary ps-3">
                  <i className="fas fa-search" style={{ color: "#64748b" }}></i>
                </span>
                <input
                  type="text"
                  className={`form-control bg-light border-0 ${searchTerm ? "border-end-0" : ""} py-2`}
                  placeholder="Cari nama atau NIK pelanggan..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset ke halaman 1 saat mencari
                  }}
                  style={{
                    fontSize: "0.85rem",
                    letterSpacing: "0.2px",
                    color: "#1e293b",
                  }}
                />
                {searchTerm && (
                  <button
                    className="btn btn-light border-0 text-muted px-3"
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setCurrentPage(1);
                    }}
                    title="Hapus pencarian"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Area Data Berbasis Responsif (Tabel Desktop / Card List Mobile) */}
        <div
          className="card-body p-0 flex-grow-1 overflow-auto"
          style={{ backgroundColor: "#f8fafc" }}
        >
          {loading ? (
            <div className="text-center py-5 text-muted bg-white h-100 d-flex flex-column align-items-center justify-content-center">
              <div
                className="spinner-border spinner-border-sm text-primary mb-2"
                role="status"
              ></div>
              <span
                className="fw-medium text-secondary"
                style={{ fontSize: "0.85rem" }}
              >
                Memuat data pelanggan...
              </span>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="text-center py-5 text-muted bg-white h-100 d-flex flex-column align-items-center justify-content-center">
              <div className="mb-2">
                <i
                  className="fas fa-folder-open text-mutedopacity"
                  style={{ fontSize: "2rem", color: "#cbd5e1" }}
                ></i>
              </div>
              <span
                className="text-secondary fw-medium"
                style={{ fontSize: "0.85rem" }}
              >
                {searchTerm
                  ? `Pelanggan dengan kata kunci "${searchTerm}" tidak ditemukan.`
                  : "Belum ada data pelanggan yang didaftarkan."}
              </span>
            </div>
          ) : (
            <>
              {/* TAMPILAN DESKTOP & TABLET: Tradisional ERP Table */}
              <div className="d-none d-md-block bg-white">
                <table
                  className="table table-hover align-middle mb-0 text-nowrap"
                  style={{ fontSize: "0.85rem" }}
                >
                  <thead className="sticky-top" style={{ zIndex: 10 }}>
                    <tr
                      style={{
                        backgroundColor: "#f1f5f9",
                        borderBottom: "2px solid #e2e8f0",
                      }}
                    >
                      <th
                        className="px-4 py-3 text-uppercase fw-semibold border-0"
                        style={{
                          width: "60px",
                          color: "#475569",
                          fontSize: "0.75rem",
                          letterSpacing: "0.5px",
                        }}
                      >
                        No
                      </th>
                      <th
                        className="py-3 text-uppercase fw-semibold border-0"
                        style={{
                          color: "#475569",
                          fontSize: "0.75rem",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Nama Pelanggan
                      </th>
                      <th
                        className="py-3 text-uppercase fw-semibold border-0 text-center"
                        style={{
                          color: "#475569",
                          fontSize: "0.75rem",
                          letterSpacing: "0.5px",
                        }}
                      >
                        NIK
                      </th>
                      <th
                        className="py-3 text-uppercase fw-semibold border-0 text-center"
                        style={{
                          color: "#475569",
                          fontSize: "0.75rem",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Kontak
                      </th>
                      <th
                        className="py-3 text-uppercase fw-semibold border-0"
                        style={{
                          color: "#475569",
                          fontSize: "0.75rem",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Alamat (Domisili)
                      </th>
                      <th
                        className="py-3 text-uppercase fw-semibold border-0"
                        style={{
                          color: "#475569",
                          fontSize: "0.75rem",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Kota Rental
                      </th>
                      <th
                        className="py-3 text-uppercase fw-semibold border-0 text-center"
                        style={{
                          color: "#475569",
                          fontSize: "0.75rem",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Total Rental
                      </th>
                      <th
                        className="py-3 text-uppercase fw-semibold border-0 text-center"
                        style={{
                          color: "#475569",
                          fontSize: "0.75rem",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Status
                      </th>
                      <th
                        className="py-3 text-center text-uppercase fw-semibold border-0"
                        style={{
                          color: "#475569",
                          fontSize: "0.75rem",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((cust, index) => {
                      const isActive = cust.status === "active";
                      const isBlacklist = cust.status === "blacklist";

                      return (
                        <tr
                          key={cust.customer_id}
                          style={{ borderBottom: "1px solid #f1f5f9" }}
                        >
                          <td className="px-4 text-secondary fw-medium">
                            {indexOfFirstItem + index + 1}
                          </td>
                          <td>
                            <div
                              className="fw-semibold text-dark"
                              style={{ color: "#0f172a" }}
                            >
                              {cust.nama_pelanggan || "-"}
                            </div>
                          </td>
                          <td className="text-center">
                            <span
                              className="badge text-secondary fw-mono bg-light border border-light-subtle px-2 py-1.5 rounded"
                              style={{ fontSize: "0.8rem" }}
                            >
                              {cust.nik || "-"}
                            </span>
                          </td>
                          <td className="text-center">
                            <div
                              className="text-success fw-medium"
                              style={{ fontSize: "0.825rem" }}
                            >
                              <i className="fab fa-whatsapp me-1.5"></i>
                              {cust.kontak || "-"}
                            </div>
                          </td>
                          <td
                            className="text-wrap text-secondary"
                            style={{
                              minWidth: "200px",
                              maxWidth: "300px",
                              fontSize: "0.825rem",
                              lineHeight: "1.4",
                            }}
                          >
                            {cust.alamat || "-"}
                          </td>
                          <td className="text-secondary fw-medium">
                            {cust.kota || "-"}
                          </td>
                          <td className="text-center">
                            <span className="badge bg-body-secondary text-dark-emphasis fw-medium px-2.5 py-1.5 border border-light-subtle rounded-2">
                              {cust.total_rental || 0} Kali
                            </span>
                          </td>
                          <td className="text-center">
                            <span
                              className="badge rounded-1 px-2.5 py-1.5 border fw-semibold d-inline-flex align-items-center gap-1.5"
                              style={{
                                fontSize: "0.75rem",
                                backgroundColor: isActive
                                  ? "#f0fdf4"
                                  : isBlacklist
                                    ? "#fef2f2"
                                    : "#f8fafc",
                                borderColor: isActive
                                  ? "#bbf7d0"
                                  : isBlacklist
                                    ? "#fecaca"
                                    : "#e2e8f0",
                              }}
                            >
                              <i
                                className="fas fa-circle"
                                style={{
                                  fontSize: "5px",
                                  color: isActive
                                    ? "#16a34a"
                                    : isBlacklist
                                      ? "#dc2626"
                                      : "#64748b",
                                }}
                              ></i>{" "}
                              <span
                                style={{
                                  color: isActive
                                    ? "#15803d"
                                    : isBlacklist
                                      ? "#991b1b"
                                      : "#475569",
                                }}
                              >
                                {isActive
                                  ? "Aktif"
                                  : isBlacklist
                                    ? "Blacklist"
                                    : cust.status || "-"}
                              </span>
                            </span>
                          </td>
                          <td className="text-center">
                            <div className="btn-group rounded shadow-sm">
                              <Link
                                to={`/customers/edit/${cust.customer_id}`}
                                className="btn btn-sm btn-white border border-light-subtle text-primary px-2.5"
                              >
                                <i className="fas fa-edit"></i>
                              </Link>
                              <button
                                onClick={() =>
                                  handleDeleteClick(
                                    cust.customer_id,
                                    cust.nama_pelanggan,
                                    cust.nik,
                                  )
                                }
                                className="btn btn-sm btn-white border border-light-subtle border-start-0 text-danger px-2.5"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* TAMPILAN MOBILE: Stacked Cards (Otomatis Aktif di < md) */}
              <div className="d-block d-md-none p-3">
                <div className="row g-3">
                  {currentItems.map((cust, index) => {
                    const isActive = cust.status === "active";
                    const isBlacklist = cust.status === "blacklist";

                    return (
                      <div className="col-12" key={`mob-${cust.customer_id}`}>
                        <div className="card border border-light-subtle shadow-sm rounded-3 bg-white p-3">
                          {/* Header Atas Card Mobile */}
                          <div
                            className="d-flex justify-content-between align-items-start border-bottom pb-2 mb-2"
                            style={{ borderColor: "#f1f5f9" }}
                          >
                            <div>
                              <span className="text-muted small fw-medium me-2">
                                #{indexOfFirstItem + index + 1}
                              </span>
                              <span
                                className="fw-bold text-dark"
                                style={{ fontSize: "0.95rem" }}
                              >
                                {cust.nama_pelanggan || "-"}
                              </span>
                            </div>
                            <span
                              className="badge rounded-1 px-2 py-1 border fw-semibold d-inline-flex align-items-center gap-1"
                              style={{
                                fontSize: "0.7rem",
                                backgroundColor: isActive
                                  ? "#f0fdf4"
                                  : isBlacklist
                                    ? "#fef2f2"
                                    : "#f8fafc",
                                borderColor: isActive
                                  ? "#bbf7d0"
                                  : isBlacklist
                                    ? "#fecaca"
                                    : "#e2e8f0",
                              }}
                            >
                              <span
                                style={{
                                  color: isActive
                                    ? "#15803d"
                                    : isBlacklist
                                      ? "#991b1b"
                                      : "#475569",
                                }}
                              >
                                {isActive
                                  ? "Aktif"
                                  : isBlacklist
                                    ? "Blacklist"
                                    : cust.status || "-"}
                              </span>
                            </span>
                          </div>

                          {/* Detail Konten Grid Mobile */}
                          <div
                            className="row g-2"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <div className="col-6">
                              <div className="text-muted small">NIK</div>
                              <div className="fw-semibold text-secondary mt-0.5">
                                {cust.nik || "-"}
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="text-muted small">Kontak</div>
                              <div className="text-success fw-medium mt-0.5">
                                <i className="fab fa-whatsapp me-1"></i>
                                {cust.kontak || "-"}
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="text-muted small">
                                Kota Rental
                              </div>
                              <div className="fw-medium text-dark-emphasis mt-0.5">
                                {cust.kota || "-"}
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="text-muted small">
                                Total Rental
                              </div>
                              <div className="mt-0.5">
                                <span className="badge bg-body-secondary text-dark-emphasis border px-2 py-0.5 rounded-1">
                                  {cust.total_rental || 0} Kali
                                </span>
                              </div>
                            </div>
                            <div className="col-12">
                              <div className="text-muted small">
                                Alamat Domisili
                              </div>
                              <div
                                className="text-secondary text-wrap mt-0.5"
                                style={{ lineHeight: "1.3" }}
                              >
                                {cust.alamat || "-"}
                              </div>
                            </div>
                          </div>

                          {/* Tombol Aksi Mobile */}
                          <div
                            className="d-flex justify-content-end gap-2 border-top pt-2 mt-3"
                            style={{ borderColor: "#f1f5f9" }}
                          >
                            <Link
                              to={`/customers/edit/${cust.customer_id}`}
                              className="btn btn-sm btn-light border text-primary px-3 d-flex align-items-center gap-1.5"
                              style={{ fontSize: "0.75rem" }}
                            >
                              <i className="fas fa-edit"></i> Edit
                            </Link>
                            <button
                              onClick={() =>
                                handleDeleteClick(
                                  cust.customer_id,
                                  cust.nama_pelanggan,
                                  cust.nik,
                                )
                              }
                              className="btn btn-sm btn-light border text-danger px-3 d-flex align-items-center gap-1.5"
                              style={{ fontSize: "0.75rem" }}
                            >
                              <i className="fas fa-trash"></i> Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Dinamis & Kontrol Pagination */}
        <div
          className="card-footer bg-white border-top py-3 px-3 px-sm-4 flex-shrink-0"
          style={{ borderColor: "#e2e8f0" }}
        >
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
            <span className="text-secondary small text-center text-sm-start fw-medium">
              Showing {filteredCustomers.length > 0 ? indexOfFirstItem + 1 : 0}{" "}
              to {Math.min(indexOfLastItem, filteredCustomers.length)} of{" "}
              {filteredCustomers.length} entries
            </span>

            {totalPages > 1 && (
              <nav className="w-100 w-sm-auto d-flex justify-content-center">
                <ul className="pagination pagination-sm mb-0 align-items-center flex-wrap justify-content-center gap-1">
                  <li
                    className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                  >
                    <button
                      className="page-link border border-light-subtle rounded text-secondary bg-white px-2.5 py-1.5 shadow-sm d-flex align-items-center"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      style={{ fontSize: "0.75rem" }}
                    >
                      <i
                        className="fas fa-chevron-left me-1"
                        style={{ fontSize: "0.65rem" }}
                      ></i>{" "}
                      Prev
                    </button>
                  </li>

                  {Array.from({ length: totalPages }, (_, i) => {
                    // Optimasi pagination mobile jika total halaman terlalu banyak
                    if (
                      totalPages > 5 &&
                      Math.abs(currentPage - (i + 1)) > 1 &&
                      i !== 0 &&
                      i !== totalPages - 1
                    ) {
                      if (i === 1 || i === totalPages - 2) {
                        return (
                          <li key={i} className="px-1 text-muted small">
                            ...
                          </li>
                        );
                      }
                      return null;
                    }

                    return (
                      <li
                        key={i + 1}
                        className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                      >
                        <button
                          className={`page-link border rounded mx-0.5 shadow-sm px-3 py-1.5 fw-semibold ${
                            currentPage === i + 1
                              ? "text-white border-primary"
                              : "text-dark bg-white border-light-subtle"
                          }`}
                          style={{
                            fontSize: "0.75rem",
                            backgroundColor:
                              currentPage === i + 1 ? "#0284c7" : "transparent", // Pronto Blue-Sky Accent
                          }}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    );
                  })}

                  <li
                    className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                  >
                    <button
                      className="page-link border border-light-subtle rounded text-primary bg-white px-2.5 py-1.5 shadow-sm d-flex align-items-center"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      style={{ fontSize: "0.75rem", color: "#0284c7" }}
                    >
                      Next{" "}
                      <i
                        className="fas fa-chevron-right ms-1"
                        style={{ fontSize: "0.65rem" }}
                      ></i>
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
      {showDeleteModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.4)", // Slate-900 overlay khas ERP
            backdropFilter: "blur(4px)",
            zIndex: 1050,
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: "400px" }}
          >
            <div
              className="modal-content border-0 shadow-sm"
              style={{ borderRadius: "8px", backgroundColor: "#ffffff" }}
            >
              {/* Header Modal - Garis Tipis Enterprise */}
              <div
                className="modal-header border-bottom px-4 py-3 d-flex align-items-center justify-content-between"
                style={{ borderColor: "#e2e8f0" }}
              >
                <div
                  className="d-flex align-items-center gap-2 text-danger fw-semibold"
                  style={{ fontSize: "0.95rem" }}
                >
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>Konfirmasi Penghapusan</span>
                </div>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  style={{ fontSize: "0.75rem" }}
                  onClick={cancelDelete}
                ></button>
              </div>

              {/* Konten Utama */}
              <div className="modal-body p-4 text-center">
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "6px",
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                  }}
                >
                  <i className="fas fa-trash-alt fs-4 text-danger"></i>
                </div>

                <h6
                  className="fw-bold text-dark mb-2"
                  style={{ fontSize: "1rem", color: "#0f172a" }}
                >
                  Hapus Data Pelanggan?
                </h6>

                <p
                  className="text-secondary mb-4 px-2"
                  style={{ fontSize: "0.85rem", lineHeight: "1.5" }}
                >
                  Sistem akan menghapus entitas data operasional untuk pelanggan
                  berikut secara permanen:
                  <span
                    className="d-block fw-bold text-dark mt-2"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {customerToDelete?.name}
                  </span>
                  <span
                    className="badge text-secondary fw-mono bg-light border border-light-subtle mt-1 px-2.5 py-1.5 rounded"
                    style={{ fontSize: "0.75rem" }}
                  >
                    NIK: {customerToDelete?.nik}
                  </span>
                </p>

                {/* Banner Peringatan Fungsional */}
                <div
                  className="alert border-0 p-2.5 rounded-2 mb-4 text-start d-flex align-items-start gap-2"
                  style={{
                    fontSize: "0.8rem",
                    backgroundColor: "#fffbeb",
                    borderLeft: "3px solid #d97706",
                    color: "#92400e",
                  }}
                >
                  <i
                    className="fas fa-info-circle mt-0.5"
                    style={{ color: "#d97706" }}
                  ></i>
                  <span>
                    <strong>Perhatian:</strong> Tindakan ini tidak dapat
                    dibatalkan. Seluruh riwayat yang melekat pada NIK ini akan
                    ikut terarsip otomatis.
                  </span>
                </div>

                {/* Tombol Aksi - Gaya Komponen ERP Form */}
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-white border border-light-subtle w-50 fw-semibold text-secondary py-2"
                    style={{ borderRadius: "6px", fontSize: "0.825rem" }}
                    onClick={cancelDelete}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger w-50 fw-semibold py-2 shadow-sm"
                    style={{
                      borderRadius: "6px",
                      fontSize: "0.825rem",
                      backgroundColor: "#dc2626",
                      borderColor: "#dc2626",
                    }}
                    onClick={confirmDelete}
                  >
                    Ya, Hapus Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL POP UP SUKSES HAPUS (AUTO CLOSE) --- */}
      {showSuccessModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.4)", // Slate-900 overlay standar ERP
            backdropFilter: "blur(4px)",
            zIndex: 1050,
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: "360px" }}
          >
            <div
              className="modal-content border-0 shadow-sm"
              style={{ borderRadius: "8px", backgroundColor: "#ffffff" }}
            >
              <div className="modal-body p-4 text-center">
                {/* Ikon Box Sukses Berbasis Grid ERP */}
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "6px",
                    backgroundColor: "#f0fdf4", // Emerald-50
                    border: "1px solid #bbf7d0", // Emerald-200
                  }}
                >
                  <i
                    className="fas fa-check fs-4"
                    style={{ color: "#16a34a" }}
                  ></i>
                </div>

                {/* Judul Status */}
                <h6
                  className="fw-bold text-dark mb-2"
                  style={{ fontSize: "1rem", color: "#0f172a" }}
                >
                  Data Berhasil Dihapus
                </h6>

                {/* Deskripsi Entitas Terhapus */}
                <p
                  className="text-secondary mb-4 px-2"
                  style={{ fontSize: "0.85rem", lineHeight: "1.5" }}
                >
                  Log data untuk pelanggan
                  <span
                    className="d-block fw-bold text-dark my-1"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {customerToDelete?.name || "-"}
                  </span>
                  telah dibersihkan secara aman dari master data.
                </p>

                {/* Proses Sync State / Refresh Data */}
                <div
                  className="d-flex align-items-center justify-content-center py-2 px-3 rounded-2 mx-auto"
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    width: "fit-content",
                    fontSize: "0.775rem",
                  }}
                >
                  <div
                    className="spinner-border text-primary me-2"
                    role="status"
                    style={{
                      width: "12px",
                      height: "12px",
                      borderWidth: "2px",
                      color: "#0284c7",
                    }}
                  ></div>
                  <span className="text-secondary fw-medium">
                    Sinkronisasi data tabel...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
