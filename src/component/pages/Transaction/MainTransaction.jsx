import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ShowTransaction from "./ShowTransaction";
import { supabase } from "../../../supabaseClient";

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
        .select(`
          *,
          cars (nomor_plat, jenis_unit, transmisi),
          customers (nama_pelanggan, nik)
        `)
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
    const matchPlat = (trx.cars?.nomor_plat || "").toLowerCase().includes(searchPlat.toLowerCase());
    const matchCustomer = (trx.customers?.nama_pelanggan || "").toLowerCase().includes(searchCustomer.toLowerCase());
    const matchDate = searchDate === "" || trx.tanggal_sewa === searchDate;
    
    return matchPlat && matchCustomer && matchDate;
  });

  // Logika Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const handleViewDetails = (trx) => {
    const formattedData = {
      id: trx.transaction_id?.substring(0, 8).toUpperCase(),
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
      keterangan: trx.keterangan || "Tidak ada keterangan.",
      dibuat: new Date(trx.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }),
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

  const exportToCSV = () => {
    const headers = [
      "No", "ID Transaksi", "Dibuat Pada", "Waktu Peminjaman", "Nama Customer",
      "Merek Mobil", "Tipe Unit", "Plat Nomor", "Transmisi", "Rute",
      "Jumlah Hari", "DP (Rp)", "Sisa Pembayaran (Rp)", "Total Pembayaran (Rp)", "Keterangan"
    ];

    const rows = filteredTransactions.map((trx, index) => [
      index + 1,
      `"TRX-${trx.transaction_id?.substring(0, 8).toUpperCase()}"`,
      `"${new Date(trx.created_at).toLocaleDateString("id-ID")}"`,
      `"${trx.tanggal_sewa} ${trx.jam_sewa || ""}"`,
      `"${trx.customers?.nama_pelanggan || "-"}"`,
      `"${trx.cars?.jenis_unit?.split(" ")[0] || "-"}"`,
      `"${trx.cars?.jenis_unit || "-"}"`,
      `"${trx.cars?.nomor_plat || "-"}"`,
      `"${trx.cars?.transmisi || "-"}"`,
      `"${trx.rute || "-"}"`,
      trx.jumlah_hari || 0,
      trx.dp || 0,
      trx.sisa_pembayaran || 0,
      trx.total_pembayaran || 0,
      `"${trx.keterangan || "-"}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Data_Transaksi_Rental.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearchPlat("");
    setSearchCustomer("");
    setSearchDate("");
    setCurrentPage(1);
  };

  // Render halaman Detail jika ada data yang di-klik
  if (selectedData) {
    return (
      <ShowTransaction
        data={selectedData}
        onBack={() => setSelectedData(null)}
      />
    );
  }

  return (
    <div className="d-flex flex-column vh-100 bg-light p-4 overflow-hidden">
      {/* Header Halaman */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-shrink-0">
        <div>
          <h4 className="fw-bold text-dark mb-1">Manajemen Transaksi</h4>
          <p className="text-muted small mb-0">Data penyewaan dan pembayaran armada</p>
        </div>

        <div className="d-flex gap-2">
          <button onClick={exportToCSV} className="btn btn-success shadow-sm px-3" title="Export data ke Excel/CSV">
            <i className="fas fa-file-excel me-2"></i>Export CSV
          </button>
          <Link to="/transaction/create" className="btn btn-primary shadow-sm px-3">
            <i className="fas fa-plus me-2"></i>Buat Transaksi
          </Link>
        </div>
      </div>

      {/* Card Utama */}
      <div className="card border-0 shadow-sm d-flex flex-column flex-grow-1 overflow-hidden">
        
        {/* Toolbar Pencarian / Filter */}
        <div className="card-header bg-white py-3 border-bottom-0 flex-shrink-0">
          <div className="row g-2 align-items-center">
            <div className="col-md-3">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="fas fa-user text-muted"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control bg-light border-start-0 shadow-none" 
                  placeholder="Cari Pelanggan..." 
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="fas fa-car text-muted"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control bg-light border-start-0 shadow-none" 
                  placeholder="Cari Plat Mobil..." 
                  value={searchPlat}
                  onChange={(e) => setSearchPlat(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="fas fa-calendar-alt text-muted"></i>
                </span>
                <input 
                  type="date" 
                  className="form-control bg-light border-start-0 shadow-none text-muted" 
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-2">
              {(searchCustomer || searchPlat || searchDate) && (
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

        {/* Area Tabel (Scrollable dengan Spacing Presisi) */}
        <div className="card-body p-0 flex-grow-1 overflow-auto">
          {/* HAPUS text-center dari <table> utama agar bisa di-custom per kolom */}
          <table className="table table-hover align-middle mb-0 text-nowrap" style={{ fontSize: "0.85rem" }}>
            <thead className="sticky-top bg-white" style={{ zIndex: 10 }}>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th className="px-4 py-3 text-secondary fw-bold text-uppercase border-bottom text-center" style={{ width: "5%" }}>No</th>
                <th className="px-3 py-3 text-secondary fw-bold text-uppercase border-bottom text-start" style={{ width: "15%" }}>Waktu Peminjaman</th>
                <th className="px-3 py-3 text-secondary fw-bold text-uppercase border-bottom text-start" style={{ width: "20%" }}>Mobil/Plat</th>
                <th className="px-3 py-3 text-secondary fw-bold text-uppercase border-bottom text-start" style={{ width: "15%" }}>Nama Customer</th>
                <th className="px-3 py-3 text-secondary fw-bold text-uppercase border-bottom text-center" style={{ width: "10%" }}>Rute</th>
                <th className="px-3 py-3 text-secondary fw-bold text-uppercase border-bottom text-start" style={{ width: "15%" }}>Keterangan</th>
                <th className="px-4 py-3 text-secondary fw-bold text-uppercase border-bottom text-end" style={{ width: "15%" }}>Total Pembayaran</th>
                <th className="px-4 py-3 text-center text-secondary fw-bold text-uppercase border-bottom" style={{ width: "5%" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    Memuat data transaksi...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    Tidak ada transaksi yang ditemukan.
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => {
                  return (
                    <tr key={item.transaction_id}>
                      <td className="px-4 text-muted text-center">{indexOfFirstItem + index + 1}</td>
                      
                      {/* Waktu Peminjaman: Kiri */}
                      <td className="px-3 text-start">
                        <div className="fw-bold text-dark">{item.tanggal_sewa || "-"}</div>
                        <div className="text-muted small" style={{ fontSize: "0.75rem" }}>{item.jam_sewa || "-"}</div>
                      </td>

                      {/* Mobil/Plat: Kiri */}
                      <td className="px-3 text-start">
                        <div className="fw-bold text-dark text-uppercase">{item.cars?.jenis_unit || "-"}</div>
                        <span className="badge border text-dark bg-white px-2 py-1 mt-1 shadow-sm" style={{ letterSpacing: "1px" }}>
                          {item.cars?.nomor_plat || "-"}
                        </span>
                      </td>

                      {/* Nama Customer: Kiri, Biru */}
                      <td className="px-3 text-start">
                        <div className="fw-bold text-primary">{item.customers?.nama_pelanggan || "-"}</div>
                      </td>

                      {/* Rute: Tengah, Badge Biru Muda */}
                      <td className="px-3 text-center">
                        <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1 text-uppercase">
                          {item.rute || "-"}
                        </span>
                      </td>

                      {/* Keterangan: Kiri, Text Muted */}
                      <td className="px-3 text-start text-wrap text-muted" style={{ maxWidth: "200px" }}>
                        {item.keterangan || "-"}
                      </td>

                      {/* Total Pembayaran: Kanan, Hijau */}
                      <td className="px-4 text-end fw-bold text-success">
                        Rp {formatRupiah(item.total_pembayaran || 0)}
                      </td>

                      {/* Aksi: Tengah */}
                      <td className="px-4 text-center">
                        <div className="btn-group shadow-sm">
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="btn btn-sm btn-white border text-info"
                            title="Lihat Detail Transaksi"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <Link
                            to={`/transaction/edit/${item.transaction_id}`}
                            className="btn btn-sm btn-white border text-primary"
                            title="Edit Transaksi"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(item.transaction_id, item.customers?.nama_pelanggan)}
                            className="btn btn-sm btn-white border text-danger"
                            title="Hapus Transaksi"
                          >
                            <i className="fas fa-trash"></i>
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

        {/* Footer & Pagination */}
        <div className="card-footer bg-white border-top py-3 px-4 flex-shrink-0">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted small">
              Total: <strong>{filteredTransactions.length}</strong> transaksi
            </span>
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
          </div>
        </div>
      </div>

      {/* --- MODAL HAPUS KONFIRMASI --- */}
      {showDeleteModal && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
              <div className="modal-body p-4 text-center">
                <div className="mx-auto mb-4 d-flex align-items-center justify-content-center bg-danger-subtle text-danger" style={{ width: "64px", height: "64px", borderRadius: "50%" }}>
                  <i className="fas fa-trash-alt fs-3"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Hapus Transaksi?</h5>
                <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                  Anda akan menghapus riwayat transaksi dari <br />
                  <span className="fw-bold text-dark fs-6">{transactionToDelete?.customer}</span>
                </p>
                <div className="alert alert-warning border-0 bg-warning-subtle text-warning-emphasis p-2 rounded-3 mb-4 text-start d-flex align-items-center" style={{ fontSize: "0.8rem" }}>
                  <i className="fas fa-exclamation-triangle me-2 fs-6"></i>
                  Data ini tidak dapat dikembalikan.
                </div>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-light w-50 fw-bold border shadow-sm" style={{ borderRadius: "10px" }} onClick={cancelDelete}>
                    Batal
                  </button>
                  <button type="button" className="btn btn-danger w-50 fw-bold shadow-sm" style={{ borderRadius: "10px" }} onClick={confirmDelete}>
                    Ya, Hapus
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
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
              <div className="modal-body p-4 text-center">
                <div className="mx-auto mb-4 d-flex align-items-center justify-content-center bg-success-subtle text-success" style={{ width: "64px", height: "64px", borderRadius: "50%" }}>
                  <i className="fas fa-check fs-2"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Berhasil Dihapus!</h5>
                <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                  Data transaksi telah berhasil dihapus dari sistem.
                </p>
                <div className="d-flex align-items-center justify-content-center text-muted small">
                  <div className="spinner-border spinner-border-sm me-2" role="status" style={{ width: '12px', height: '12px' }}></div>
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