import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../supabaseClient";

export default function CarList() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);

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

  const checkGpsStatus = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const activeUntil = new Date(expiryDate);
    today.setHours(0, 0, 0, 0);
    activeUntil.setHours(0, 0, 0, 0);
    return activeUntil >= today;
  };

  // --- FUNGSI BARU: Menampilkan Modal Hapus ---
  const handleDeleteClick = (id, name, plate) => {
    setCarToDelete({ id, name, plate }); // Simpan data mobil sementara
    setShowDeleteModal(true);            // Tampilkan modal
  };

  // --- FUNGSI BARU: Mengeksekusi Hapus ke Supabase ---
  const confirmDelete = async () => {
    if (!carToDelete) return;
    
    try {
      const { error } = await supabase
        .from("cars")
        .delete()
        .eq("cars_id", carToDelete.id);

      if (error) throw error;

      // Tutup modal dan bersihkan state
      setShowDeleteModal(false);
      setCarToDelete(null);
      
      // Refresh tabel
      fetchCars();
      
      // Pesan sukses (bisa kamu ganti pakai Toast nanti kalau mau lebih estetik)
      alert(`Kendaraan ${carToDelete.name} (${carToDelete.plate}) berhasil dihapus!`);
    } catch (error) {
      console.error("Error deleting car:", error.message);
      alert("Gagal menghapus data mobil. Silakan coba lagi.");
    }
  };

  // --- FUNGSI BARU: Membatalkan Hapus ---
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCarToDelete(null);
  };

  const exportToCSV = () => {
    const headers = [
      "No", "Nama Kendaraan", "Tipe", "Tahun", "Plat Nomor", "Transmisi", 
      "Jatuh Tempo", "Tanggal Servis", "Tanggal Pajak", "No GPS", 
      "Masa Aktif GPS", "Status GPS", "Keluhan", "Status",
    ];

    const rows = cars.map((car, index) => {
      const isGpsActive = checkGpsStatus(car.masa_aktif_gps) && car.status_gps === 'Aktif' 
        ? "Aktif" 
        : "Tidak Aktif";

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
        car.no_gps || "-",
        car.masa_aktif_gps || "-",
        isGpsActive,
        `"${car.keluhan_unit || ""}"`,  
        car.status_mobil || "-",
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
    link.setAttribute("download", "Data_Armada_Rental.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="d-flex flex-column vh-100 bg-light p-4 overflow-hidden">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-shrink-0">
        <div>
          <h4 className="fw-bold text-dark mb-1">Manajemen Armada</h4>
          <p className="text-muted small mb-0">Data inventaris kendaraan aktif</p>
        </div>

        <div className="d-flex gap-2">
          <button onClick={exportToCSV} className="btn btn-success shadow-sm px-3" title="Export data ke Excel/CSV">
            <i className="fas fa-file-excel me-2"></i>Export CSV
          </button>
          <Link to="/carlist/create" className="btn btn-primary shadow-sm px-3">
            <i className="fas fa-plus me-2"></i>Tambah Mobil
          </Link>
        </div>
      </div>

      {/* Card Utama */}
      <div className="card border-0 shadow-sm d-flex flex-column flex-grow-1 overflow-hidden">
        {/* Toolbar (Pencarian dll) */}
        <div className="card-header bg-white py-3 border-bottom-0 flex-shrink-0">
          <div className="row">
            <div className="col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="fas fa-search text-muted"></i>
                </span>
                <input type="text" className="form-control bg-light border-start-0" placeholder="Cari unit..." />
              </div>
            </div>
          </div>
        </div>

        {/* Area Tabel */}
        <div className="card-body p-0 flex-grow-1 overflow-auto">
          <table className="table table-hover align-middle mb-0 text-nowrap" style={{ fontSize: "0.85rem" }}>
            <thead className="sticky-top bg-white" style={{ zIndex: 10 }}>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th className="px-4 py-3 text-secondary fw-bold text-uppercase border-bottom">No</th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom">Unit Kendaraan</th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom text-center">Plat Nomor</th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom text-center">Transmisi</th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom text-center">Jatuh Tempo</th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom text-center">Tgl Servis</th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom text-center">Tgl Pajak</th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom text-center">GPS & Masa Aktif</th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom">Keluhan Unit</th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom text-center">Status</th>
                <th className="py-3 text-center text-secondary fw-bold text-uppercase border-bottom">Aksi</th>
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
              ) : cars.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-5 text-muted">
                    Tidak ada data kendaraan yang ditemukan.
                  </td>
                </tr>
              ) : (
                cars.map((car, index) => {
                  const isGpsActive = checkGpsStatus(car.masa_aktif_gps) && car.status_gps === 'Aktif';

                  return (
                    <tr key={car.cars_id}>
                      <td className="px-4 text-muted">{index + 1}</td>
                      <td>
                        <div className="fw-bold text-dark">{car.jenis_unit || "Belum ada nama"}</div>
                        <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
                          {car.tipe_kendaraan || "-"} • {car.tahun_produksi || "-"}
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="badge border text-dark fw-bold bg-white px-2 py-1" style={{ letterSpacing: "1px" }}>
                          {car.nomor_plat || "-"}
                        </span>
                      </td>
                      <td className="text-center">{car.transmisi || "-"}</td>
                      <td className="text-center">{car.tgl_jatuh_tempo || "-"}</td>
                      <td className="text-center">{car.tgl_pergantian_oli || "-"}</td>
                      <td className="text-center">{car.tgl_mati_pajak || "-"}</td>

                      <td className="text-center">
                        <div className="fw-bold text-dark">{car.no_gps || "-"}</div>
                        <div className="text-muted mb-1" style={{ fontSize: "0.75rem" }}>
                          s/d {car.masa_aktif_gps || "-"}
                        </div>
                        <span
                          className={`badge rounded-pill px-2 py-1 ${
                            isGpsActive ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"
                          }`}
                          style={{ fontSize: "0.7rem" }}
                        >
                          {isGpsActive ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </td>

                      <td className="text-wrap" style={{ maxWidth: "150px" }}>
                        <span className="text-muted">{car.keluhan_unit || "-"}</span>
                      </td>

                      <td className="text-center">
                        <span
                          className={`badge rounded-pill px-3 py-2 ${
                            car.status_mobil === "Tersedia"
                              ? "bg-success-subtle text-success"
                              : car.status_mobil === "Pemeliharaan" 
                              ? "bg-danger-subtle text-danger"
                              : "bg-warning-subtle text-warning"
                          }`}
                        >
                          <i className="fas fa-circle me-1" style={{ fontSize: "6px" }}></i>{" "}
                          {car.status_mobil || "Tidak Diketahui"}
                        </span>
                      </td>
                      
                      <td className="text-center">
                        <div className="btn-group shadow-sm">
                          <Link to={`/carlist/edit/${car.cars_id}`} className="btn btn-sm btn-white border text-primary">
                            <i className="fas fa-edit"></i>
                          </Link>
                          {/* --- TOMBOL TRASH DIUBAH MEMANGGIL handleDeleteClick --- */}
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

        {/* Footer */}
        <div className="card-footer bg-white border-top py-3 px-4 flex-shrink-0">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted small">
              Total: <strong>{cars.length}</strong> unit
            </span>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className="page-item disabled">
                  <span className="page-link border-0 bg-transparent">Prev</span>
                </li>
                <li className="page-item active">
                  <span className="page-link border-0 rounded mx-1 shadow-sm px-3" style={{ backgroundColor: "#0061f2" }}>
                    1
                  </span>
                </li>
                <li className="page-item">
                  <span className="page-link border-0 text-dark mx-1">2</span>
                </li>
                <li className="page-item">
                  <span className="page-link border-0 bg-transparent text-primary">Next</span>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* --- KODE UI POP UP MODAL HAPUS --- */}
      {showDeleteModal && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-danger">Konfirmasi Hapus</h5>
                <button type="button" className="btn-close" onClick={cancelDelete}></button>
              </div>
              <div className="modal-body py-4">
                <p className="mb-0 text-center fs-5">
                  Apakah Anda yakin ingin menghapus mobil <br/>
                  <strong>{carToDelete?.name}</strong> (<strong>{carToDelete?.plate}</strong>)?
                </p>
                <p className="text-center text-muted small mt-2 mb-0">
                  Data yang dihapus akan hilang secara permanen dari sistem.
                </p>
              </div>
              <div className="modal-footer border-top-0 pt-0 justify-content-center gap-2">
                <button type="button" className="btn btn-light px-4 border" onClick={cancelDelete}>
                  Batal
                </button>
                <button type="button" className="btn btn-danger px-4" onClick={confirmDelete}>
                  Ya, Hapus Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}