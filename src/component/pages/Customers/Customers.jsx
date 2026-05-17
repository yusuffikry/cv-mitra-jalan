import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../supabaseClient";

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

  const exportToCSV = () => {
    const headers = [
      "No", "Nama Pelanggan", "NIK", "Kontak", 
      "Alamat (Domisili)", "Kota Rental", "Total Rental", "Status",
    ];

    const rows = customers.map((cust, index) => {
      const displayStatus = cust.status === 'active' ? 'Aktif' : cust.status === 'blacklist' ? 'Blacklist' : cust.status;
      
      return [
        index + 1,
        `"${cust.nama_pelanggan || "-"}"`, 
        `'${cust.nik || "-"}`, 
        `'${cust.kontak || "-"}`, 
        `"${cust.alamat || "-"}"`,
        `"${cust.kota || "-"}"`,
        cust.total_rental || 0,
        displayStatus,
      ];
    });

    const csvContent = [
      headers.join(","), 
      ...rows.map((row) => row.join(",")), 
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Data_Pelanggan.csv"); 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- LOGIKA PENCARIAN ---
  const filteredCustomers = customers.filter((cust) => {
    const searchLower = searchTerm.toLowerCase();
    const matchName = (cust.nama_pelanggan || "").toLowerCase().includes(searchLower);
    const matchNik = (cust.nik || "").toLowerCase().includes(searchLower);
    return matchName || matchNik;
  });

  // --- LOGIKA PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  return (
    <div className="d-flex flex-column vh-100 bg-light p-4 overflow-hidden">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-shrink-0">
        <div>
          <h4 className="fw-bold text-dark mb-1">Manajemen Pelanggan</h4>
          <p className="text-muted small mb-0">Data informasi dan riwayat penyewa</p>
        </div>

        <div className="d-flex gap-2">
          <button onClick={exportToCSV} className="btn btn-success shadow-sm px-3" title="Export data ke Excel/CSV">
            <i className="fas fa-file-excel me-2"></i>Export CSV
          </button>
          <Link to="/customers/create" className="btn btn-primary shadow-sm px-3">
            <i className="fas fa-plus me-2"></i>Tambah Pelanggan
          </Link>
        </div>
      </div>

      {/* Card Utama */}
      <div className="card border-0 shadow-sm d-flex flex-column flex-grow-1 overflow-hidden">
        
        {/* Toolbar Pencarian */}
        <div className="card-header bg-white py-3 border-bottom-0 flex-shrink-0">
          <div className="row">
            <div className="col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="fas fa-search text-muted"></i>
                </span>
                <input 
                  type="text" 
                  className={`form-control bg-light ${searchTerm ? 'border-end-0' : ''} border-start-0`} 
                  placeholder="Cari nama atau NIK pelanggan..." 
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset ke halaman 1 saat mencari
                  }}
                />
                {searchTerm && (
                  <button 
                    className="btn btn-light border border-start-0" 
                    type="button" 
                    onClick={() => {
                      setSearchTerm("");
                      setCurrentPage(1);
                    }}
                    title="Hapus pencarian"
                  >
                    <i className="fas fa-times text-muted"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Area Tabel */}
        <div className="card-body p-0 flex-grow-1 overflow-auto">
          <table className="table table-hover align-middle mb-0 text-nowrap" style={{ fontSize: "0.85rem" }}>
            <thead className="sticky-top bg-white" style={{ zIndex: 10 }}>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th className="px-4 py-3 text-secondary fw-bold text-uppercase border-bottom" style={{ width: "60px" }}>No</th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom">Nama Pelanggan</th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom text-center">NIK</th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom text-center">Kontak</th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom">Alamat (Domisili)</th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom">Kota Rental</th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom text-center">Total Rental</th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom text-center">Status</th>
                <th className="py-3 text-center text-secondary fw-bold text-uppercase border-bottom">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    Memuat data pelanggan...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted">
                    {searchTerm ? `Pelanggan dengan kata kunci "${searchTerm}" tidak ditemukan.` : "Belum ada data pelanggan yang didaftarkan."}
                  </td>
                </tr>
              ) : (
                currentItems.map((cust, index) => {
                  const isActive = cust.status === "active";
                  const isBlacklist = cust.status === "blacklist";

                  return (
                    <tr key={cust.customer_id}>
                      {/* Nomor urut disesuaikan dengan halaman */}
                      <td className="px-4 text-muted">{indexOfFirstItem + index + 1}</td>
                      <td>
                        <div className="fw-bold text-dark">{cust.nama_pelanggan || "-"}</div>
                      </td>
                      <td className="text-center">
                        <span className="badge border text-dark fw-bold bg-white px-2 py-1" style={{ letterSpacing: "1px" }}>
                          {cust.nik || "-"}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="text-primary fw-medium">
                          <i className="fab fa-whatsapp me-2"></i>
                          {cust.kontak || "-"}
                        </div>
                      </td>
                      
                      <td className="text-wrap text-muted" style={{ minWidth: "200px", maxWidth: "300px" }}>
                        {cust.alamat || "-"}
                      </td>
                      
                      <td>{cust.kota || "-"}</td>

                      <td className="text-center">
                        <span className="badge bg-light text-dark border px-2 py-1">
                          {cust.total_rental || 0} Kali
                        </span>
                      </td>
                      
                      <td className="text-center">
                        <span
                          className={`badge rounded-pill px-3 py-2 border ${
                            isActive
                              ? "bg-success-subtle text-success border-success-subtle"
                              : isBlacklist
                              ? "bg-danger-subtle text-danger border-danger-subtle"
                              : "bg-secondary-subtle text-secondary border-secondary-subtle"
                          }`}
                        >
                          <i className="fas fa-circle me-1" style={{ fontSize: "6px" }}></i>{" "}
                          {isActive ? "Aktif" : isBlacklist ? "Blacklist" : cust.status || "-"}
                        </span>
                      </td>

                      <td className="text-center">
                        <div className="btn-group shadow-sm">
                          <Link to={`/customers/edit/${cust.customer_id}`} className="btn btn-sm btn-white border text-primary">
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(cust.customer_id, cust.nama_pelanggan, cust.nik)}
                            className="btn btn-sm btn-white border text-danger"
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

        {/* Footer Dinamis */}
        <div className="card-footer bg-white border-top py-3 px-4 flex-shrink-0">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted small">
              Showing {filteredCustomers.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredCustomers.length)} of {filteredCustomers.length} entries
            </span>
            
            {totalPages > 1 && (
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button 
                      className="page-link border-0 bg-transparent text-muted" 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      Prev
                    </button>
                  </li>
                  
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li key={i + 1} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                      <button
                        className={`page-link border-0 rounded mx-1 shadow-sm px-3 ${currentPage === i + 1 ? "text-white" : "text-dark"}`}
                        style={{ backgroundColor: currentPage === i + 1 ? "#0061f2" : "transparent" }}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button 
                      className="page-link border-0 bg-transparent text-primary" 
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

      {/* MODAL HAPUS */}
      {showDeleteModal && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
              <div className="modal-body p-4 text-center">
                
                <div 
                  className="mx-auto mb-4 d-flex align-items-center justify-content-center bg-danger-subtle text-danger" 
                  style={{ width: "64px", height: "64px", borderRadius: "50%" }}
                >
                  <i className="fas fa-trash-alt fs-3"></i>
                </div>

                <h5 className="fw-bold text-dark mb-2">Hapus Data Pelanggan?</h5>
                <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                  Anda akan menghapus data pelanggan <br />
                  <span className="fw-bold text-dark fs-6">{customerToDelete?.name}</span> <br />
                  <span className="badge bg-light border text-dark mt-2 px-3 py-2" style={{ letterSpacing: "1px" }}>
                    NIK: {customerToDelete?.nik}
                  </span>
                </p>

                <div className="alert alert-warning border-0 bg-warning-subtle text-warning-emphasis p-2 rounded-3 mb-4 text-start d-flex align-items-center" style={{ fontSize: "0.8rem" }}>
                  <i className="fas fa-exclamation-triangle me-2 fs-6"></i>
                  Data ini tidak dapat dikembalikan setelah dihapus.
                </div>

                <div className="d-flex gap-2">
                  <button 
                    type="button" 
                    className="btn btn-light w-50 fw-bold border shadow-sm" 
                    style={{ borderRadius: "10px" }}
                    onClick={cancelDelete}
                  >
                    Batal
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger w-50 fw-bold shadow-sm" 
                    style={{ borderRadius: "10px" }}
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
                
                <div 
                  className="mx-auto mb-4 d-flex align-items-center justify-content-center bg-success-subtle text-success" 
                  style={{ width: "64px", height: "64px", borderRadius: "50%" }}
                >
                  <i className="fas fa-check fs-2"></i>
                </div>

                <h5 className="fw-bold text-dark mb-2">Berhasil Dihapus!</h5>
                <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                  Data pelanggan <span className="fw-bold text-dark">{customerToDelete?.name}</span> telah berhasil dihapus dari sistem.
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