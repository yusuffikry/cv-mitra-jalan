import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ShowTransaction from "./ShowTransaction";
import { supabase } from "../../../supabaseClient";
import * as XLSX from "xlsx";

export default function MainTransaction() {
  const [selectedData, setSelectedData] = useState(null);

  // State untuk Supabase
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk Filter
  const [searchPlat, setSearchPlat] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [searchDate, setSearchDate] = useState("");

  // State untuk Modal Hapus & Sukses
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // State untuk Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          *,
          cars (nomor_plat, jenis_unit, transmisi),
          customers (nama_pelanggan, nik)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((trx) => {
    const matchPlat = (trx.cars?.nomor_plat || "")
      .toLowerCase()
      .includes(searchPlat.toLowerCase());
    const matchCustomer = (trx.customers?.nama_pelanggan || "")
      .toLowerCase()
      .includes(searchCustomer.toLowerCase());
    const matchDate = searchDate === "" || trx.tanggal_sewa === searchDate;

    return matchPlat && matchCustomer && matchDate;
  });

  // Logika Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const handleViewDetails = (trx) => {
    // PERBAIKAN: Konversi ke string terlebih dahulu sebelum menggunakan substring agar ID terbaca sempurna
    const txIdString = trx.transaction_id ? trx.transaction_id.toString() : "";
    const displayId = txIdString.includes("-")
      ? txIdString.split("-")[0].toUpperCase() // Jika UUID, ambil blok pertama
      : txIdString.substring(0, 8).toUpperCase();

    const formattedData = {
      id: displayId || "-",
      waktu: `${trx.tanggal_sewa || "-"} ${trx.jam_sewa || ""}`,
      waktu_pengembalian: `${trx.tanggal_pengembalian || "-"} ${trx.jam_pengembalian || ""}`,
      mobil: trx.cars?.nomor_plat || "-",
      merek: trx.cars?.jenis_unit?.split(" ")[0] || "-",
      tipe_unit: trx.cars?.jenis_unit || "-",
      transmisi: trx.cars?.transmisi || "-",
      nama_customer: trx.customers?.nama_pelanggan || "-",
      rute: trx.rute || "-",
      jumlah_hari: trx.jumlah_hari || 0,
      dp: formatRupiah(trx.dp || 0),
      sisa_pembayaran: formatRupiah(trx.sisa_pembayaran || 0),
      total_pembayaran: formatRupiah(trx.total_pembayaran || 0),
      status_pembayaran: trx.status_pembayaran || "Belum Lunas",
      keterangan: trx.keterangan || "Tidak ada keterangan.",
      dibuat: new Date(trx.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      foto_mobil: trx.foto_mobil || "",
      video_mobil: trx.video_mobil || "",
    };
    setSelectedData(formattedData);
  };

  const handleDeleteClick = (id, customer) => {
    setTransactionToDelete({ id, customer });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("transaction_id", transactionToDelete.id);

      if (error) throw error;

      setShowDeleteModal(false);
      fetchTransactions();
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        setTransactionToDelete(null);
      }, 2000);
    } catch (error) {
      console.error("Error deleting transaction:", error.message);
      alert("Gagal menghapus data transaksi.");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTransactionToDelete(null);
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID").format(angka);
  };

  // --- FUNGSI EXPORT KE EXCEL ---
  const exportToExcel = () => {
    const headers = [
      "No",
      "ID Transaksi",
      "Dibuat Pada",
      "Waktu Peminjaman",
      "Nama Customer",
      "Merek Mobil",
      "Tipe Unit",
      "Plat Nomor",
      "Transmisi",
      "Rute",
      "Jumlah Hari",
      "DP (Rp)",
      "Sisa Pembayaran (Rp)",
      "Total Pembayaran (Rp)",
      "Status Pembayaran",
      "Keterangan",
    ];

    const rows = filteredTransactions.map((trx, index) => {
      const txIdString = trx.transaction_id
        ? trx.transaction_id.toString()
        : "";
      const displayId = txIdString.includes("-")
        ? txIdString.split("-")[0].toUpperCase()
        : txIdString.substring(0, 8).toUpperCase();

      return [
        index + 1,
        `TRX-${displayId}`,
        new Date(trx.created_at).toLocaleDateString("id-ID"),
        `${trx.tanggal_sewa} ${trx.jam_sewa || ""}`,
        trx.customers?.nama_pelanggan || "-",
        trx.cars?.jenis_unit?.split(" ")[0] || "-",
        trx.cars?.jenis_unit || "-",
        trx.cars?.nomor_plat || "-",
        trx.cars?.transmisi || "-",
        trx.rute || "-",
        trx.jumlah_hari || 0,
        trx.dp || 0,
        trx.sisa_pembayaran || 0,
        trx.total_pembayaran || 0,
        trx.status_pembayaran || "-",
        trx.keterangan || "-",
      ];
    });

    const dataToExport = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Transaksi");

    const wscols = [
      { wch: 5 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 25 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 18 },
      { wch: 30 },
    ];
    worksheet["!cols"] = wscols;

    XLSX.writeFile(
      workbook,
      `Data_Transaksi_Rental_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  const resetFilters = () => {
    setSearchPlat("");
    setSearchCustomer("");
    setSearchDate("");
    setCurrentPage(1);
  };

  if (selectedData) {
    return (
      <ShowTransaction
        data={selectedData}
        onBack={() => setSelectedData(null)}
      />
    );
  }

  return (
    <div
      className="container-fluid py-3 bg-white d-flex flex-column"
      style={{ fontSize: "0.825rem", color: "#333333" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
        <div>
          <h5 className="fw-bold text-dark mb-0">
            Manajemen Transaksi Operasional
          </h5>
          <p className="text-muted mb-0" style={{ fontSize: "0.775rem" }}>
            Data lengkap berkas penyewaan, penagihan, dan status peminjaman
            armada.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            onClick={exportToExcel}
            className="btn btn-sm btn-success fw-bold px-3 py-1.5"
            style={{ borderRadius: "3px" }}
            title="Export data ke Excel"
          >
            <i className="fas fa-file-excel me-1.5 small"></i>Export Excel
          </button>
          <Link
            to="/transaction/create"
            className="btn btn-sm text-white px-3 py-1.5 fw-bold"
            style={{ backgroundColor: "#0052cc", borderRadius: "3px" }}
          >
            <i className="fas fa-plus me-1.5 small"></i>Buat Transaksi
          </Link>
        </div>
      </div>

      {/* Toolbar Pencarian / Filter Bar Multi-Input */}
      <div
        className="card bg-light border mb-3"
        style={{ borderRadius: "3px" }}
      >
        <div className="card-body p-2">
          <div className="row g-2 align-items-center">
            <div className="col-md-4">
              <div className="input-group input-group-sm">
                <span
                  className="input-group-text bg-white border-end-0 text-muted"
                  style={{ fontSize: "0.75rem" }}
                >
                  Pelanggan
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  style={{ borderRadius: "3px" }}
                  placeholder="Cari nama penyewa..."
                  value={searchCustomer}
                  onChange={(e) => {
                    setSearchCustomer(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            <div className="col-md-3">
              <div className="input-group input-group-sm">
                <span
                  className="input-group-text bg-white border-end-0 text-muted"
                  style={{ fontSize: "0.75rem" }}
                >
                  Plat Nomor
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 font-mono"
                  style={{ borderRadius: "3px" }}
                  placeholder="B 1234 XYZ..."
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
                <span
                  className="input-group-text bg-white border-end-0 text-muted"
                  style={{ fontSize: "0.75rem" }}
                >
                  Tanggal
                </span>
                <input
                  type="date"
                  className="form-control border-start-0 font-mono text-muted"
                  style={{ borderRadius: "3px" }}
                  value={searchDate}
                  onChange={(e) => {
                    setSearchDate(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {(searchCustomer || searchPlat || searchDate) && (
              <div className="col-md-2 d-grid">
                <button
                  className="btn btn-sm btn-white border text-secondary fw-bold"
                  type="button"
                  style={{ borderRadius: "3px" }}
                  onClick={resetFilters}
                >
                  <i className="fas fa-times me-1 small"></i>Reset
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kontainer Tabel Utama */}
      <div
        className="card border flex-grow-1 d-flex flex-column overflow-hidden"
        style={{ borderRadius: "3px" }}
      >
        <div className="table-responsive flex-grow-1 overflow-auto">
          <table className="table table-sm table-hover align-middle mb-0 text-nowrap">
            <thead>
              <tr style={{ borderBottom: "2px solid #dee2e6" }}>
                <th
                  className="text-center py-2 text-dark border-bottom"
                  style={{
                    width: "50px",
                    backgroundColor: "#f1f3f5",
                    fontSize: "0.725rem",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                  }}
                >
                  No
                </th>
                <th
                  className="py-2 text-dark border-bottom text-center"
                  style={{
                    width: "130px",
                    backgroundColor: "#f1f3f5",
                    fontSize: "0.725rem",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                  }}
                >
                  Waktu Pinjam
                </th>
                <th
                  className="py-2 text-dark border-bottom"
                  style={{
                    backgroundColor: "#f1f3f5",
                    fontSize: "0.725rem",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                  }}
                >
                  Armada Kendaraan
                </th>
                <th
                  className="py-2 text-dark border-bottom text-center"
                  style={{
                    width: "120px",
                    backgroundColor: "#f1f3f5",
                    fontSize: "0.725rem",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                  }}
                >
                  Plat Nomor
                </th>
                <th
                  className="py-2 text-dark border-bottom"
                  style={{
                    backgroundColor: "#f1f3f5",
                    fontSize: "0.725rem",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                  }}
                >
                  Nama Customer
                </th>
                <th
                  className="py-2 text-dark border-bottom text-center"
                  style={{
                    width: "100px",
                    backgroundColor: "#f1f3f5",
                    fontSize: "0.725rem",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                  }}
                >
                  Rute
                </th>
                <th
                  className="py-2 text-dark border-bottom"
                  style={{
                    backgroundColor: "#f1f3f5",
                    fontSize: "0.725rem",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                  }}
                >
                  Keterangan
                </th>
                <th
                  className="py-2 text-dark border-bottom text-end"
                  style={{
                    width: "140px",
                    backgroundColor: "#f1f3f5",
                    fontSize: "0.725rem",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                  }}
                >
                  Total Bayar
                </th>
                <th
                  className="py-2 text-dark border-bottom text-center"
                  style={{
                    width: "110px",
                    backgroundColor: "#f1f3f5",
                    fontSize: "0.725rem",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                  }}
                >
                  Status
                </th>
                <th
                  className="text-center py-2 text-dark border-bottom"
                  style={{
                    width: "90px",
                    backgroundColor: "#f1f3f5",
                    fontSize: "0.725rem",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                  }}
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="10"
                    className="text-center py-4 text-muted"
                    style={{ fontFamily: "monospace" }}
                  >
                    <div
                      className="spinner-border spinner-border-sm me-2 text-secondary"
                      role="status"
                    ></div>
                    Memuat berkas data transaksi...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-muted">
                    Tidak ada riwayat transaksi sewa yang ditemukan.
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => {
                  const isLunas = item.status_pembayaran === "Lunas";

                  return (
                    <tr key={item.transaction_id}>
                      <td
                        className="text-center text-muted py-2"
                        style={{
                          fontFamily: "SFMono-Regular, Menlo, monospace",
                        }}
                      >
                        {String(indexOfFirstItem + index + 1).padStart(2, "0")}
                      </td>

                      <td className="text-center text-secondary font-mono small">
                        <div className="fw-bold text-dark">
                          {item.tanggal_sewa || "-"}
                        </div>
                        <div style={{ fontSize: "0.7rem" }}>
                          {item.jam_sewa || "-"}
                        </div>
                      </td>

                      <td>
                        <div className="fw-bold text-dark text-uppercase">
                          {item.cars?.jenis_unit || "-"}
                        </div>
                      </td>

                      <td className="text-center">
                        <span
                          className="badge bg-light text-dark border px-2 py-1 font-mono d-block mx-auto"
                          style={{ fontSize: "0.75rem", maxWidth: "100px" }}
                        >
                          {item.cars?.nomor_plat || "-"}
                        </span>
                      </td>

                      <td>
                        <div className="fw-bold text-primary">
                          {item.customers?.nama_pelanggan || "-"}
                        </div>
                      </td>

                      <td className="text-center">
                        <span
                          className="badge border px-2 py-1 text-dark bg-light text-uppercase"
                          style={{ borderRadius: "2px", fontSize: "0.7rem" }}
                        >
                          {item.rute || "-"}
                        </span>
                      </td>

                      <td
                        className="text-wrap text-muted small"
                        style={{ maxWidth: "180px", fontSize: "0.8rem" }}
                      >
                        {item.keterangan || "-"}
                      </td>

                      <td className="text-end fw-bold text-dark font-mono">
                        Rp {formatRupiah(item.total_pembayaran || 0)}
                      </td>

                      <td className="text-center">
                        <span
                          className="fw-bold d-block mx-auto text-center py-1 rounded-1"
                          style={{
                            maxWidth: "100px",
                            fontSize: "0.75rem",
                            backgroundColor: isLunas ? "#e6f4ea" : "#fce8e6",
                            color: isLunas ? "#137333" : "#c5221f",
                            border: `1px solid ${isLunas ? "#c4eed0" : "#fad2cf"}`,
                          }}
                        >
                          {item.status_pembayaran || "Belum Lunas"}
                        </span>
                      </td>

                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="btn btn-light border text-primary"
                            title="Lihat Detail"
                            style={{ borderRadius: "3px 0 0 3px" }}
                          >
                            <i className="fas fa-eye small"></i>
                          </button>
                          <Link
                            to={`/transaction/edit/${item.transaction_id}`}
                            className="btn btn-light border text-secondary"
                            title="Ubah Berkas"
                          >
                            <i className="fas fa-edit small"></i>
                          </Link>
                          <button
                            onClick={() =>
                              handleDeleteClick(
                                item.transaction_id,
                                item.customers?.nama_pelanggan,
                              )
                            }
                            className="btn btn-light border text-danger"
                            title="Hapus"
                            style={{ borderRadius: "0 3px 3px 0" }}
                          >
                            <i className="fas fa-trash small"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Kontrol */}
        <div className="card-footer bg-light border-top p-2 d-flex justify-content-between align-items-center">
          <div className="text-muted" style={{ fontSize: "0.75rem" }}>
            Menampilkan{" "}
            <span className="fw-bold text-dark">
              {filteredTransactions.length > 0 ? indexOfFirstItem + 1 : 0}
            </span>
            -
            <span className="fw-bold text-dark">
              {Math.min(indexOfLastItem, filteredTransactions.length)}
            </span>{" "}
            dari{" "}
            <span className="fw-bold text-dark">
              {filteredTransactions.length}
            </span>{" "}
            data entri
          </div>

          {totalPages > 1 && (
            <nav aria-label="Page navigation" className="mb-0">
              <ul className="pagination pagination-sm mb-0">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link px-2 py-1 text-secondary bg-transparent border-0"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                  >
                    Sebelumnya
                  </button>
                </li>

                {Array.from({ length: totalPages }, (_, i) => (
                  <li
                    key={i + 1}
                    className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                  >
                    <button
                      className="page-link px-2.5 py-1 mx-0.5 border"
                      style={{
                        backgroundColor:
                          currentPage === i + 1 ? "#0052cc" : "#ffffff",
                        borderColor:
                          currentPage === i + 1 ? "#0052cc" : "#dee2e6",
                        color: currentPage === i + 1 ? "#ffffff" : "#333333",
                        borderRadius: "3px",
                        fontWeight: currentPage === i + 1 ? "bold" : "normal",
                      }}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                >
                  <button
                    className="page-link px-2 py-1 text-secondary bg-transparent border-0"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                  >
                    Selanjutnya
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>

      {/* MODAL KONFIRMASI HAPUS */}
      {showDeleteModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div
              className="modal-content border bg-white"
              style={{ borderRadius: "3px" }}
            >
              <div className="modal-body p-3 text-center">
                <div
                  className="mx-auto mb-2 d-flex align-items-center justify-content-center bg-danger text-white shadow-sm"
                  style={{ width: "42px", height: "42px", borderRadius: "50%" }}
                >
                  <i className="fas fa-trash-alt small"></i>
                </div>

                <h6 className="fw-bold text-dark mb-1">Hapus Transaksi?</h6>
                <p className="text-muted mb-2" style={{ fontSize: "0.75rem" }}>
                  Anda akan menghapus berkas order milik customer: <br />
                  <span className="fw-bold text-dark">
                    {transactionToDelete?.customer}
                  </span>
                </p>

                <div
                  className="alert alert-warning border p-1.5 text-start mb-3"
                  style={{ fontSize: "0.7rem", borderRadius: "2px" }}
                >
                  <i className="fas fa-exclamation-triangle me-1"></i> Data
                  terpilih tidak bisa dikembalikan setelah dihapus.
                </div>

                <div className="d-flex gap-2 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-sm btn-light border px-3"
                    style={{ borderRadius: "3px" }}
                    onClick={cancelDelete}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger px-3"
                    style={{ borderRadius: "3px" }}
                    onClick={confirmDelete}
                  >
                    Ya, Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL POP UP SUKSES HAPUS */}
      {showSuccessModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div
              className="modal-content border bg-white"
              style={{ borderRadius: "3px" }}
            >
              <div className="modal-body p-3 text-center">
                <div
                  className="mx-auto mb-2 d-flex align-items-center justify-content-center bg-success text-white shadow-sm"
                  style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                >
                  <i className="fas fa-check small"></i>
                </div>
                <h6 className="fw-bold text-dark mb-1">Berhasil Dihapus</h6>
                <p className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                  Data transaksi sewa armada telah berhasil dikeluarkan dari
                  sistem.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
