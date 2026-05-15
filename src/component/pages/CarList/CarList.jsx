import React, { useState, useEffect } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import { supabase } from "../../../supabaseClient";

export default function CarList() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);

  useEffect(() => {
    fetchCars();
  }, []);
  useEffect(() => {
    if (!loading && filteredCars.length > 0) {
      gsap.killTweensOf(".table-row-animate");
      gsap.set(".table-row-animate", { opacity: 0, y: 12 });
      gsap.to(".table-row-animate", {
        y: 0,
        opacity: 1,
        duration: 0.35,
        stagger: 0.03,
        ease: "power2.out",
      });
    }
  }, [loading, searchTerm, cars]);

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
      setCarToDelete(null);
      fetchCars();
      alert(
        `Kendaraan ${carToDelete.name} (${carToDelete.plate}) berhasil dihapus!`,
      );
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
    const matchName = (car.jenis_unit || "")
      .toLowerCase()
      .includes(searchLower);
    const matchPlate = (car.nomor_plat || "")
      .toLowerCase()
      .includes(searchLower);

    return matchName || matchPlate;
  });

  const exportToCSV = () => {
    const headers = [
      "No",
      "Nama Kendaraan",
      "Tipe",
      "Tahun",
      "Plat Nomor",
      "Transmisi",
      "Jatuh Tempo",
      "Tanggal Servis",
      "Tanggal Pajak",
      "No GPS",
      "Masa Aktif GPS",
      "Status GPS",
      "Keluhan",
      "Status",
    ];

    const rows = filteredCars.map((car, index) => {
      const isGpsActive =
        checkGpsStatus(car.masa_aktif_gps) && car.status_gps === "Aktif"
          ? "Aktif"
          : "Tidak Aktif";
      const keluhanClean = (car.keluhan_unit || "")
        .replace(/,/g, " ")
        .replace(/\n/g, " ");

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
        `"${keluhanClean}"`,
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
    link.setAttribute(
      "download",
      `Data_Armada_Rental_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="d-flex flex-column vh-100 bg-light p-3 overflow-hidden w-100">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-shrink-0 w-100">
        <div>
          <h4
            className="fw-extrabold text-dark mb-1 tracking-tight"
            style={{ fontWeight: 800 }}
          >
            Manajemen Armada
          </h4>
          <p className="text-muted small mb-0">
            Data inventaris kendaraan aktif di dalam sistem
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            onClick={exportToCSV}
            className="btn btn-outline-success shadow-sm px-3 d-flex align-items-center fw-semibold"
            style={{ borderRadius: "8px", fontSize: "0.875rem" }}
            title="Export data ke Excel/CSV"
          >
            <i className="fas fa-file-excel me-2"></i>Export CSV
          </button>
          <Link
            to="/carlist/create"
            className="btn btn-primary shadow-sm px-3 d-flex align-items-center fw-semibold"
            style={{
              borderRadius: "8px",
              fontSize: "0.875rem",
              backgroundColor: "#3b82f6",
              borderColor: "#3b82f6",
            }}
          >
            <i className="fas fa-plus me-2"></i>Tambah Mobil
          </Link>
        </div>
      </div>
      <div
        className="card border-0 shadow-sm d-flex flex-column flex-grow-1 overflow-hidden w-100"
        style={{ borderRadius: "12px" }}
      >
        <div className="card-header bg-white py-3 border-bottom-0 flex-shrink-0">
          <div className="d-flex justify-content-between align-items-center w-100">
            <div
              className="input-group input-group-sm border rounded-3"
              style={{ overflow: "hidden", maxWidth: "360px" }}
            >
              <span className="input-group-text bg-white border-0">
                <i className="fas fa-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control bg-white border-0 ps-1 py-2"
                placeholder="Cari nama unit atau plat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ boxShadow: "none" }}
              />
              {searchTerm && (
                <button
                  className="btn btn-white border-0 text-muted"
                  type="button"
                  onClick={() => setSearchTerm("")}
                  title="Hapus pencarian"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            <div className="small text-muted d-none d-sm-block">
              Status:{" "}
              <span className="badge bg-secondary-subtle text-secondary rounded-pill">
                Semua Unit
              </span>
            </div>
          </div>
        </div>
        <div className="card-body p-0 flex-grow-1 overflow-auto custom-scrollbar w-100">
          <table
            className="table table-hover align-middle mb-0 text-nowrap table-custom w-100"
            style={{ fontSize: "0.85rem" }}
          >
            <thead
              className="sticky-top bg-white border-bottom shadow-sm-bottom"
              style={{ zIndex: 10 }}
            >
              <tr>
                <th
                  className="px-4 py-3 text-secondary fw-semibold text-uppercase"
                  style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                >
                  No
                </th>
                <th
                  className="py-3 text-secondary fw-semibold text-uppercase"
                  style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                >
                  Unit Kendaraan
                </th>
                <th
                  className="py-3 text-secondary fw-semibold text-uppercase text-center"
                  style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                >
                  Plat Nomor
                </th>
                <th
                  className="py-3 text-secondary fw-semibold text-uppercase text-center"
                  style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                >
                  Transmisi
                </th>
                <th
                  className="py-3 text-secondary fw-semibold text-uppercase text-center"
                  style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                >
                  Jatuh Tempo
                </th>
                <th
                  className="py-3 text-secondary fw-semibold text-uppercase text-center"
                  style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                >
                  Tgl Servis
                </th>
                <th
                  className="py-3 text-secondary fw-semibold text-uppercase text-center"
                  style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                >
                  Tgl Pajak
                </th>
                <th
                  className="py-3 text-secondary fw-semibold text-uppercase text-center"
                  style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                >
                  GPS & Masa Aktif
                </th>
                <th
                  className="py-3 text-secondary fw-semibold text-uppercase"
                  style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                >
                  Keluhan Unit
                </th>
                <th
                  className="py-3 text-secondary fw-semibold text-uppercase text-center"
                  style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                >
                  Status
                </th>
                <th
                  className="py-3 text-center text-secondary fw-semibold text-uppercase"
                  style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" className="text-center py-5 text-muted">
                    <div
                      className="spinner-border spinner-border-sm text-primary me-2"
                      role="status"
                    ></div>
                    Memuat data armada...
                  </td>
                </tr>
              ) : cars.length === 0 ? (
                <tr>
                  <td
                    colSpan="11"
                    className="text-center py-5 text-muted fw-medium"
                  >
                    Tidak ada data kendaraan yang ditemukan.
                  </td>
                </tr>
              ) : filteredCars.length === 0 ? (
                <tr>
                  <td
                    colSpan="11"
                    className="text-center py-5 text-muted fw-medium"
                  >
                    Kendaraan dengan kata kunci "{searchTerm}" tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredCars.map((car, index) => {
                  const isGpsActive =
                    checkGpsStatus(car.masa_aktif_gps) &&
                    car.status_gps === "Aktif";

                  return (
                    <tr
                      key={car.cars_id}
                      className="table-row-animate"
                      style={{ opacity: 0 }}
                    >
                      <td className="px-4 text-muted fw-medium">{index + 1}</td>
                      <td>
                        <div className="fw-bold text-dark mb-0.5">
                          {car.jenis_unit || "Belum ada nama"}
                        </div>
                        <div
                          className="text-muted small"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {car.tipe_kendaraan || "-"}{" "}
                          <span className="text-black-50">•</span>{" "}
                          {car.tahun_production || car.tahun_produksi || "-"}
                        </div>
                      </td>
                      <td className="text-center">
                        <span
                          className="badge text-dark fw-bold bg-light px-2 py-1.5 border"
                          style={{
                            letterSpacing: "0.5px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                          }}
                        >
                          {car.nomor_plat || "-"}
                        </span>
                      </td>
                      <td className="text-center fw-medium text-secondary">
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

                      <td className="text-center">
                        <div
                          className="fw-bold text-dark"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {car.no_gps || "-"}
                        </div>
                        <div
                          className="text-muted mb-1"
                          style={{ fontSize: "0.72rem" }}
                        >
                          s/d {car.masa_aktif_gps || "-"}
                        </div>
                        <span
                          className={`badge rounded-pill px-2 py-1 ${isGpsActive ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}
                          style={{ fontSize: "0.65rem", fontWeight: "600" }}
                        >
                          {isGpsActive ? "✓ Aktif" : "✗ Tidak Aktif"}
                        </span>
                      </td>

                      <td className="text-wrap" style={{ maxWidth: "200px" }}>
                        <span className="text-secondary small d-block text-truncate-custom">
                          {car.keluhan_unit || "-"}
                        </span>
                      </td>

                      <td className="text-center">
                        <span
                          className={`badge px-2.5 py-1.5 rounded-3 fw-semibold ${
                            car.status_mobil === "Tersedia"
                              ? "bg-success-subtle text-success border border-success-subtle"
                              : car.status_mobil === "Pemeliharaan"
                                ? "bg-danger-subtle text-danger border border-danger-subtle"
                                : "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
                          }`}
                          style={{ fontSize: "0.75rem" }}
                        >
                          <i
                            className="fas fa-circle me-1"
                            style={{ fontSize: "5px", verticalAlign: "middle" }}
                          ></i>{" "}
                          {car.status_mobil || "Tidak Diketahui"}
                        </span>
                      </td>

                      <td className="text-center">
                        <div className="btn-group rounded-2 shadow-xs">
                          <Link
                            to={`/carlist/edit/${car.cars_id}`}
                            className="btn btn-sm btn-light border-end text-primary"
                            style={{ padding: "0.35rem 0.5rem" }}
                            title="Edit Unit"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            onClick={() =>
                              handleDeleteClick(
                                car.cars_id,
                                car.jenis_unit,
                                car.nomor_plat,
                              )
                            }
                            className="btn btn-sm btn-light text-danger"
                            style={{ padding: "0.35rem 0.5rem" }}
                            title="Hapus Unit"
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
        <div className="card-footer bg-white border-top py-3 px-4 flex-shrink-0">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted small">
              Menampilkan <strong>{filteredCars.length}</strong> dari{" "}
              <strong>{cars.length}</strong> unit
            </span>

            <nav>
              <ul className="pagination pagination-sm mb-0 align-items-center">
                <li className="page-item disabled">
                  <span
                    className="page-link border-0 bg-transparent text-muted small"
                    style={{ pointerEvents: "none" }}
                  >
                    Prev
                  </span>
                </li>
                <li className="page-item active">
                  <span
                    className="page-link border-0 rounded-2 mx-1 shadow-xs px-2.5 py-1 text-white small"
                    style={{ backgroundColor: "#3b82f6" }}
                  >
                    1
                  </span>
                </li>
                {filteredCars.length > 10 && (
                  <li className="page-item">
                    <span
                      className="page-link border-0 text-dark mx-1 rounded-2 px-2.5 py-1 small hover-bg-light"
                      style={{ cursor: "pointer" }}
                    >
                      2
                    </span>
                  </li>
                )}
                <li
                  className={`page-item ${filteredCars.length <= 10 ? "disabled" : ""}`}
                >
                  <span
                    className={`page-link border-0 bg-transparent small fw-semibold ${filteredCars.length <= 10 ? "text-muted" : "text-primary"}`}
                    style={{
                      cursor: filteredCars.length <= 10 ? "default" : "pointer",
                    }}
                  >
                    Next
                  </span>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
      {showDeleteModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div
              className="modal-content border-0 shadow-xl"
              style={{ borderRadius: "16px" }}
            >
              <div className="modal-body p-4 text-center">
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-danger-subtle text-danger"
                  style={{ width: "56px", height: "56px", borderRadius: "50%" }}
                >
                  <i className="fas fa-trash-alt fs-4"></i>
                </div>

                <h5 className="fw-bold text-dark mb-1">Hapus Data Unit?</h5>
                <p className="text-muted mb-3 small">
                  Anda akan menghapus data kendaraan <br />
                  <span className="fw-bold text-dark d-block mt-1">
                    {carToDelete?.name}
                  </span>
                  <span className="badge bg-light border text-dark mt-1 px-2 py-1 small">
                    {carToDelete?.plate}
                  </span>
                </p>

                <div
                  className="alert alert-warning border-0 bg-warning-subtle text-warning-emphasis p-2 rounded-3 mb-3 text-start d-flex align-items-start"
                  style={{ fontSize: "0.75rem", lineHeight: "1.3" }}
                >
                  <i
                    className="fas fa-exclamation-triangle me-2 mt-0.5"
                    style={{ fontSize: "0.85rem" }}
                  ></i>
                  <span>Tindakan ini permanen dan tidak dapat dibatalkan.</span>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-light w-50 fw-semibold border text-secondary"
                    style={{ borderRadius: "8px", fontSize: "0.85rem" }}
                    onClick={cancelDelete}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger w-50 fw-semibold shadow-sm"
                    style={{ borderRadius: "8px", fontSize: "0.85rem" }}
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
      <style>{`
      .table-custom thead tr th {
        background-color: #f8fafc !important;
        border-bottom: 1px solid #e2e8f0 !important;
        color: #64748b !important;
      }
      .table-custom tbody tr {
        transition: background-color 0.2s ease;
      }
      .table-custom tbody tr:hover {
        background-color: #f1f5f9 !important;
      }
      .table-custom td {
        border-bottom: 1px solid #f1f5f9;
        padding-top: 0.75rem;
        padding-bottom: 0.75rem;
      }
      .shadow-sm-bottom {
        box-shadow: 0 2px 4px -1px rgba(0,0,0,0.03);
      }
      .shadow-xs {
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      }
      .hover-bg-light:hover {
        background-color: #f1f5f9;
      }
      .text-truncate-custom {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;  
        overflow: hidden;
        white-space: normal;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
    `}</style>
    </div>
  );
}
