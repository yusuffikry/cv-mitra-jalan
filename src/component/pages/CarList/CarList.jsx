import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import * as XLSX from "xlsx"; 

export default function CarList() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);
  
  // State untuk Modal Sukses
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- STATE UNTUK PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .order("jenis_unit", { ascending: true });

      if (error) throw error;
      setCars(data || []);
    } catch (error) {
      console.error("Error fetching cars:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk cek apakah tanggal hari ini sudah melewati masa aktif
  const checkGpsStatus = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const activeUntil = new Date(expiryDate);
    today.setHours(0, 0, 0, 0);
    activeUntil.setHours(0, 0, 0, 0);
    return activeUntil >= today;
  };

  const handleDeleteClick = (id, name, plate) => {
    setCarToDelete({ id, name, plate });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!carToDelete) return;
    try {
      const { error } = await supabase
        .from("cars")
        .delete()
        .eq("cars_id", carToDelete.id);
      if (error) throw error;
      
      setShowDeleteModal(false);
      fetchCars();
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        setCarToDelete(null); 
      }, 2000);

    } catch (error) {
      console.error("Error deleting car:", error.message);
      alert("Gagal menghapus data mobil. Silakan coba lagi.");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCarToDelete(null);
  };

  const filteredCars = cars.filter((car) => {
    const searchLower = searchTerm.toLowerCase();
    const matchName = (car.jenis_unit || "").toLowerCase().includes(searchLower);
    const matchPlate = (car.nomor_plat || "").toLowerCase().includes(searchLower);

    return matchName || matchPlate;
  });

  // Export ke Excel (Diperbarui untuk 2 GPS)
  const exportToExcel = () => {
    const headers = [
      "No", "Nama Kendaraan", "Tipe", "Tahun", "Plat Nomor", "Transmisi",
      "Jatuh Tempo", "Tanggal Servis", "Tanggal Pajak", 
      "No GPS 1", "Masa Aktif GPS 1", "Status GPS 1",
      "No GPS 2", "Masa Aktif GPS 2", "Status GPS 2", 
      "Keluhan", "Status",
    ];

    const rows = filteredCars.map((car, index) => {
      // Evaluasi status GPS murni berdasarkan tanggal
      const isGps1Active = car.masa_aktif_gps_1 && checkGpsStatus(car.masa_aktif_gps_1) ? "Aktif" : "Tidak Aktif";
      const isGps2Active = car.masa_aktif_gps_2 ? (checkGpsStatus(car.masa_aktif_gps_2) ? "Aktif" : "Tidak Aktif") : "-";
      
      const keluhan = car.keluhan_unit || "-";

      return [
        index + 1,
        car.jenis_unit || "-",
        car.tipe_kendaraan || "-",
        car.tahun_produksi || "-",
        car.nomor_plat || "-",
        car.transmisi || "-",
        car.tgl_jatuh_tempo || "-",
        car.tgl_pergantian_oli || "-",
        car.tgl_mati_pajak || "-",
        car.no_gps_1 || "-",
        car.masa_aktif_gps_1 || "-",
        isGps1Active,
        car.no_gps_2 || "-",
        car.masa_aktif_gps_2 || "-",
        isGps2Active,
        keluhan,
        car.status_mobil || "-",
      ];
    });

    const dataToExport = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Armada");

    const wscols = [
      { wch: 5 },  // No
      { wch: 25 }, // Nama Kendaraan
      { wch: 15 }, // Tipe
      { wch: 10 }, // Tahun
      { wch: 15 }, // Plat Nomor
      { wch: 15 }, // Transmisi
      { wch: 15 }, // Jatuh Tempo
      { wch: 15 }, // Tgl Servis
      { wch: 15 }, // Tgl Pajak
      { wch: 20 }, // No GPS 1
      { wch: 15 }, // Masa Aktif GPS 1
      { wch: 15 }, // Status GPS 1
      { wch: 20 }, // No GPS 2
      { wch: 15 }, // Masa Aktif GPS 2
      { wch: 15 }, // Status GPS 2
      { wch: 40 }, // Keluhan
      { wch: 15 }, // Status
    ];
    worksheet["!cols"] = wscols;

    XLSX.writeFile(workbook, `Data_Armada_Rental_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // --- LOGIKA PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCars.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);

  return (
    <div className="d-flex flex-column vh-100 bg-light p-4 overflow-hidden">
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-shrink-0">
        <div>
          <h4 className="fw-bold text-dark mb-1">Manajemen Armada</h4>
          <p className="text-muted small mb-0">Data inventaris kendaraan aktif di dalam sistem</p>
        </div>

        <div className="d-flex gap-2">
          <button onClick={exportToExcel} className="btn btn-success shadow-sm px-3" title="Export data ke Excel">
            <i className="fas fa-file-excel me-2"></i>Export Excel
          </button>
          <Link to="/carlist/create" className="btn btn-primary shadow-sm px-3">
            <i className="fas fa-plus me-2"></i>Tambah Mobil
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
                  className={`form-control bg-light ${searchTerm ? 'border-end-0' : ''} border-start-0 shadow-none`} 
                  placeholder="Cari nama unit atau plat..." 
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); 
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
                <th className="px-3 py-3 text-secondary fw-bold text-uppercase border-bottom text-center" style={{ width: "40px" }}>No</th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom">Unit Kendaraan</th>
                <th className="py-3 px-2 text-secondary fw-bold text-uppercase border-bottom text-center">Plat Nomor</th>
                <th className="py-3 px-2 text-secondary fw-bold text-uppercase border-bottom text-center">Transmisi</th>
                <th className="py-3 px-2 text-secondary fw-bold text-uppercase border-bottom text-center">Jatuh Tempo</th>
                <th className="py-3 px-2 text-secondary fw-bold text-uppercase border-bottom text-center">Tgl Servis</th>
                <th className="py-3 px-2 text-secondary fw-bold text-uppercase border-bottom text-center">Tgl Pajak</th>
                <th className="py-3 px-3 text-secondary fw-bold text-uppercase border-bottom">GPS & Masa Aktif</th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom">Keluhan Unit</th>
                <th className="py-3 px-2 text-secondary fw-bold text-uppercase border-bottom text-center">Status</th>
                <th className="py-3 px-3 text-center text-secondary fw-bold text-uppercase border-bottom">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    Memuat data armada...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-5 text-muted">
                    {searchTerm ? `Kendaraan dengan kata kunci "${searchTerm}" tidak ditemukan.` : "Belum ada data kendaraan yang didaftarkan."}
                  </td>
                </tr>
              ) : (
                currentItems.map((car, index) => {
                  const isGps1Active = checkGpsStatus(car.masa_aktif_gps_1);
                  const isGps2Active = car.masa_aktif_gps_2 ? checkGpsStatus(car.masa_aktif_gps_2) : null;

                  return (
                    <tr key={car.cars_id}>
                      <td className="px-3 text-muted text-center">{indexOfFirstItem + index + 1}</td>
                      
                      <td>
                        <div className="fw-bold text-dark">{car.jenis_unit || "-"}</div>
                        <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
                          {car.tipe_kendaraan || "-"} <span className="text-black-50">•</span> {car.tahun_produksi || "-"}
                        </div>
                      </td>
                      
                      <td className="text-center">
                        <span className="badge border text-dark fw-bold bg-white px-2 py-1" style={{ letterSpacing: "1px" }}>
                          {car.nomor_plat || "-"}
                        </span>
                      </td>
                      
                      <td className="text-center text-primary fw-medium">
                        {car.transmisi || "-"}
                      </td>
                      
                      <td className="text-center text-secondary">
                        {car.tgl_jatuh_tempo || "-"}
                      </td>
                      <td className="text-center text-secondary">
                        {car.tgl_pergantian_oli || "-"}
                      </td>
                      <td className="text-center text-secondary">
                        {car.tgl_mati_pajak || "-"}
                      </td>

                      {/* KOLOM GPS (Merender GPS 1 dan GPS 2 secara bersusun) */}
                      <td className="px-3 align-top">
                        {/* Area GPS 1 */}
                        <div className="mb-2 pb-1">
                          <div className="fw-bold text-dark" style={{ fontSize: "0.8rem" }}>
                            <i className="fas fa-map-marker-alt text-primary me-1"></i> {car.no_gps_1 || "Belum didaftarkan"}
                          </div>
                          {car.masa_aktif_gps_1 && (
                            <div className="d-flex align-items-center mt-1">
                              <span className="text-muted me-2" style={{ fontSize: "0.72rem" }}>
                                s/d {car.masa_aktif_gps_1}
                              </span>
                              <span
                                className={`badge rounded-pill px-2 py-1 ${isGps1Active ? "bg-success-subtle text-success border border-success-subtle" : "bg-danger-subtle text-danger border border-danger-subtle"}`}
                                style={{ fontSize: "0.65rem", fontWeight: "600" }}
                              >
                                {isGps1Active ? "✓ Aktif" : "✗ Tidak Aktif"}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Area GPS 2 (Hanya dirender jika ada datanya) */}
                        {(car.no_gps_2 || car.masa_aktif_gps_2) && (
                          <div className="pt-2 border-top border-light">
                            <div className="fw-bold text-dark" style={{ fontSize: "0.8rem" }}>
                              <i className="fas fa-map-marker-alt text-secondary me-1"></i> {car.no_gps_2 || "-"}
                            </div>
                            {car.masa_aktif_gps_2 && (
                              <div className="d-flex align-items-center mt-1">
                                <span className="text-muted me-2" style={{ fontSize: "0.72rem" }}>
                                  s/d {car.masa_aktif_gps_2}
                               </span>
                                <span
                                  className={`badge rounded-pill px-2 py-1 ${isGps2Active ? "bg-success-subtle text-success border border-success-subtle" : "bg-danger-subtle text-danger border border-danger-subtle"}`}
                                  style={{ fontSize: "0.65rem", fontWeight: "600" }}
                                >
                                  {isGps2Active ? "✓ Aktif" : "✗ Tidak Aktif"}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="text-muted text-wrap" style={{ minWidth: "150px" }}>
                        {car.keluhan_unit || "-"}
                      </td>

                      <td className="text-center align-middle">
                        <span
                          className={`badge rounded-pill px-3 py-2 border ${
                            car.status_mobil === "Tersedia"
                              ? "bg-success-subtle text-success border-success-subtle"
                              : car.status_mobil === "Pemeliharaan"
                              ? "bg-warning-subtle text-warning border-warning-subtle"
                              : "bg-secondary-subtle text-secondary border-secondary-subtle"
                          }`}
                        >
                          <i className="fas fa-circle me-1" style={{ fontSize: "6px" }}></i>{" "}
                          {car.status_mobil || "Tidak Diketahui"}
                        </span>
                      </td>

                      <td className="text-center px-3 align-middle">
                        <div className="btn-group shadow-sm">
                          <Link to={`/carlist/edit/${car.cars_id}`} className="btn btn-sm btn-white border text-primary">
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(car.cars_id, car.jenis_unit, car.nomor_plat)}
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

        {/* Footer Dinamis Pagination */}
        <div className="card-footer bg-white border-top py-3 px-4 flex-shrink-0">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted small">
              Showing {filteredCars.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredCars.length)} of {filteredCars.length} entries
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

                <h5 className="fw-bold text-dark mb-2">Hapus Data Unit?</h5>
                <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                  Anda akan menghapus data kendaraan <br />
                  <span className="fw-bold text-dark fs-6">{carToDelete?.name}</span> <br />
                  <span className="badge bg-light border text-dark mt-2 px-3 py-2" style={{ letterSpacing: "1px" }}>
                    Plat: {carToDelete?.plate}
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
                  Kendaraan <span className="fw-bold text-dark">{carToDelete?.name}</span> telah berhasil dihapus dari sistem.
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