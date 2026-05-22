import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import * as XLSX from "xlsx";

export default function CarList() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("car-rent");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const filteredCars = (
    activeTab === "car-rent"
      ? cars
      : [
          {
            cars_id: "dummy-1",
            jenis_unit: "Innova Zenix Dummy",
            tipe_kendaraan: "MPV",
            tahun_produksi: "2024",
            nomor_plat: "DD 1234 XX",
            transmisi: "Automatic",
            tgl_jatuh_tempo: "2026-10-10",
            tgl_pergantian_oli: "2026-06-15",
            tgl_mati_pajak: "2027-01-01",
            no_gps: "081234567890",
            status_gps: "Aktif",
            keluhan_unit: "Tidak ada keluhan",
            status_mobil: "Tersedia",
          },
          {
            cars_id: "dummy-2",
            jenis_unit: "Avanza Veloz Dummy",
            tipe_kendaraan: "MPV",
            tahun_produksi: "2023",
            nomor_plat: "DD 9999 YY",
            transmisi: "Manual",
            tgl_jatuh_tempo: "2026-08-22",
            tgl_pergantian_oli: "2026-05-30",
            tgl_mati_pajak: "2026-12-25",
            no_gps: "087765432100",
            status_gps: "Tidak Aktif",
            keluhan_unit: "Bunyi bising di rem belakang",
            status_mobil: "Pemeliharaan",
          },
        ]
  ).filter((car) => {
    const searchLower = searchTerm.toLowerCase();
    const matchName = (car.jenis_unit || "")
      .toLowerCase()
      .includes(searchLower);
    const matchPlate = (car.nomor_plat || "")
      .toLowerCase()
      .includes(searchLower);

    return matchName || matchPlate;
  });

  const exportToExcel = () => {
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
      "No GPS 1",
      "Masa Aktif GPS 1",
      "Status GPS 1",
      "No GPS 2",
      "Masa Aktif GPS 2",
      "Status GPS 2",
      "Keluhan",
      "Status",
    ];

    const rows = filteredCars.map((car, index) => {
      const gps1Nomor = car.no_gps || car.no_gps_1 || "-";
      const gps1Aktif = car.masa_aktif_gps || car.masa_aktif_gps_1 || "-";
      const gps1Status = car.status_gps || car.status_gps_1 || "-";

      const gps2Nomor = car.no_gps2 || car.no_gps_2 || "-";
      const gps2Aktif = car.masa_aktif_gps2 || car.masa_aktif_gps_2 || "-";
      const gps2Status = car.status_gps2 || car.status_gps_2 || "-";

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
        gps1Nomor,
        gps1Aktif,
        gps1Status,
        gps2Nomor,
        gps2Aktif,
        gps2Status,
        car.keluhan_unit || "-",
        car.status_mobil || "-",
      ];
    });

    const dataToExport = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Armada");

    const wscols = [
      { wch: 5 },
      { wch: 25 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 40 },
      { wch: 15 },
    ];
    worksheet["!cols"] = wscols;

    XLSX.writeFile(
      workbook,
      `Data_Armada_Rental_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCars.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);

  return (
    <div className="p-4 bg-light">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Manajemen Armada</h4>
          <p className="text-muted small mb-0">
            Data inventaris kendaraan aktif di dalam sistem
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            onClick={exportToExcel}
            className="btn btn-success shadow-sm px-3"
            title="Export data ke Excel"
          >
            <i className="fas fa-file-excel me-2"></i>Export Excel
          </button>
          <Link to="/carlist/create" className="btn btn-primary shadow-sm px-3">
            <i className="fas fa-plus me-2"></i>Tambah Mobil
          </Link>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white pt-3 pb-0 border-bottom-0">
          <ul className="nav nav-pills mb-3 gap-2" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link fw-bold small ${
                  activeTab === "car-rent"
                    ? "text-white"
                    : "text-dark bg-transparent border-0"
                }`}
                style={{
                  backgroundColor:
                    activeTab === "car-rent" ? "#0052cc" : "transparent",
                  borderRadius: "4px",
                  padding: "6px 12px",
                  fontSize: "0.85rem",
                  transition: "none",
                }}
                onClick={() => {
                  setActiveTab("car-rent");
                  setCurrentPage(1);
                }}
                type="button"
              >
                <i
                  className="fas fa-car me-1.5"
                  style={{ fontSize: "0.85rem" }}
                ></i>{" "}
                Rental Internal
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link fw-bold small ${
                  activeTab === "rent-to-rent"
                    ? "text-white"
                    : "text-dark bg-transparent border-0"
                }`}
                style={{
                  backgroundColor:
                    activeTab === "rent-to-rent" ? "#0052cc" : "transparent",
                  borderRadius: "4px",
                  padding: "6px 12px",
                  fontSize: "0.85rem",
                  transition: "none",
                }}
                onClick={() => {
                  setActiveTab("rent-to-rent");
                  setCurrentPage(1);
                }}
                type="button"
              >
                <i
                  className="fas fa-exchange-alt me-1.5"
                  style={{ fontSize: "0.85rem" }}
                ></i>{" "}
                Rental Eksernal
              </button>
            </li>
          </ul>

          <hr className="text-muted opacity-25 my-2" />

          <div className="row pt-2">
            <div className="col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="fas fa-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className={`form-control bg-light ${searchTerm ? "border-end-0" : ""} border-start-0 shadow-none`}
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

        <div className="card-body p-3">
          <table
            className="table table-hover align-middle mb-0 w-100"
            style={{
              fontSize: "0.75rem",
              tableLayout: "fixed",
              wordWrap: "break-word",
            }}
          >
            <thead className="bg-white">
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th
                  className="p-2 text-secondary fw-bold text-uppercase border-bottom text-center"
                  style={{ width: "4%" }}
                >
                  No
                </th>
                <th
                  className="p-2 text-secondary fw-bold text-uppercase border-bottom"
                  style={{ width: "12%" }}
                >
                  Kendaraan
                </th>
                <th
                  className="p-2 text-secondary fw-bold text-uppercase border-bottom text-center"
                  style={{ width: "8%" }}
                >
                  Plat
                </th>
                <th
                  className="p-2 text-secondary fw-bold text-uppercase border-bottom text-center"
                  style={{ width: "9%" }}
                >
                  Transmisi
                </th>
                <th
                  className="p-2 text-secondary fw-bold text-uppercase border-bottom text-center"
                  style={{ width: "8%" }}
                >
                  Tempo
                </th>
                <th
                  className="p-2 text-secondary fw-bold text-uppercase border-bottom text-center"
                  style={{ width: "8%" }}
                >
                  Servis
                </th>
                <th
                  className="p-2 text-secondary fw-bold text-uppercase border-bottom text-center"
                  style={{ width: "8%" }}
                >
                  Pajak
                </th>
                <th
                  className="p-2 text-secondary fw-bold text-uppercase border-bottom"
                  style={{ width: "11%" }}
                >
                  GPS Utama
                </th>
                <th
                  className="p-2 text-secondary fw-bold text-uppercase border-bottom"
                  style={{ width: "11%" }}
                >
                  GPS Cadangan
                </th>
                <th
                  className="p-2 text-secondary fw-bold text-uppercase border-bottom"
                  style={{ width: "10%" }}
                >
                  Keluhan
                </th>
                <th
                  className="p-2 text-secondary fw-bold text-uppercase border-bottom text-center"
                  style={{ width: "7%" }}
                >
                  Status
                </th>
                <th
                  className="p-2 text-center text-secondary fw-bold text-uppercase border-bottom"
                  style={{ width: "5%" }}
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && activeTab === "car-rent" ? (
                <tr>
                  <td colSpan="12" className="text-center py-5 text-muted">
                    <div
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></div>
                    Memuat data armada...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-5 text-muted">
                    {searchTerm
                      ? `Kendaraan dengan kata kunci "${searchTerm}" tidak ditemukan.`
                      : "Belum ada data kendaraan yang didaftarkan."}
                  </td>
                </tr>
              ) : (
                currentItems.map((car, index) => {
                  const gps1Nomor = car.gps_nomor || car.no_gps;
                  const gps1Aktif = car.masa_aktif_gps || car.masa_aktif_gps_1;
                  const gps1Status = car.status_gps || car.status_gps_1;

                  const gps2Nomor = car.no_gps2 || car.no_gps_2;
                  const gps2Aktif = car.masa_aktif_gps2 || car.masa_aktif_gps_2;
                  const gps2Status = car.status_gps2 || car.status_gps_2;

                  return (
                    <tr key={car.cars_id}>
                      <td className="p-2 text-muted text-center">
                        {indexOfFirstItem + index + 1}
                      </td>

                      <td className="p-2">
                        <div className="fw-bold text-dark">
                          {car.jenis_unit || "-"}
                        </div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "0.65rem" }}
                        >
                          {car.tipe_kendaraan || "-"} <br />
                          {car.tahun_produksi || "-"}
                        </div>
                      </td>

                      <td className="text-center p-2">
                        <span
                          className="badge border text-dark fw-bold bg-white p-1"
                          style={{
                            letterSpacing: "0.5px",
                            fontSize: "0.65rem",
                          }}
                        >
                          {car.nomor_plat || "-"}
                        </span>
                      </td>

                      <td className="text-center text-primary fw-medium p-2">
                        {car.transmisi || "-"}
                      </td>

                      <td className="text-center text-secondary p-2">
                        {car.tgl_jatuh_tempo || "-"}
                      </td>
                      <td className="text-center text-secondary p-2">
                        {car.tgl_pergantian_oli || "-"}
                      </td>
                      <td className="text-center text-secondary p-2">
                        {car.tgl_mati_pajak || "-"}
                      </td>

                      <td className="p-2 align-middle">
                        <div
                          className="fw-bold text-dark"
                          style={{ fontSize: "0.7rem" }}
                        >
                          <i className="fas fa-map-marker-alt text-primary me-1"></i>
                          {gps1Nomor || "Belum didaftarkan"}
                        </div>
                        {gps1Aktif && (
                          <div className="mt-1">
                            <div
                              className="text-muted mb-1"
                              style={{ fontSize: "0.65rem" }}
                            >
                              s/d {gps1Aktif}
                            </div>
                            <span
                              className={`badge rounded-pill p-1 ${gps1Status === "Aktif" ? "bg-success-subtle text-success border border-success-subtle" : "bg-danger-subtle text-danger border border-danger-subtle"}`}
                              style={{ fontSize: "0.6rem", fontWeight: "600" }}
                            >
                              {gps1Status === "Aktif"
                                ? "✓ Aktif"
                                : "✗ Tidak Aktif"}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="p-2 align-middle">
                        {gps2Nomor || gps2Aktif ? (
                          <>
                            <div
                              className="fw-bold text-dark"
                              style={{ fontSize: "0.7rem" }}
                            >
                              <i className="fas fa-map-marker-alt text-secondary me-1"></i>
                              {gps2Nomor || "-"}
                            </div>
                            {gps2Aktif && (
                              <div className="mt-1">
                                <div
                                  className="text-muted mb-1"
                                  style={{ fontSize: "0.65rem" }}
                                >
                                  s/d {gps2Aktif}
                                </div>
                                <span
                                  className={`badge rounded-pill p-1 ${gps2Status === "Aktif" ? "bg-success-subtle text-success border border-success-subtle" : "bg-danger-subtle text-danger border border-danger-subtle"}`}
                                  style={{
                                    fontSize: "0.6rem",
                                    fontWeight: "600",
                                  }}
                                >
                                  {gps2Status === "Aktif"
                                    ? "✓ Aktif"
                                    : "✗ Tidak Aktif"}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-muted small fst-italic">-</span>
                        )}
                      </td>

                      <td
                        className="text-muted p-2"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {car.keluhan_unit || "-"}
                      </td>

                      <td className="text-center align-middle p-2">
                        <span
                          className={`badge rounded-pill p-1 border ${
                            car.status_mobil === "Tersedia"
                              ? "bg-success-subtle text-success border-success-subtle"
                              : car.status_mobil === "Pemeliharaan"
                                ? "bg-warning-subtle text-warning border-warning-subtle"
                                : "bg-secondary-subtle text-secondary border-secondary-subtle"
                          }`}
                          style={{ fontSize: "0.6rem" }}
                        >
                          {car.status_mobil || "?"}
                        </span>
                      </td>

                      <td className="text-center p-2 align-middle">
                        <div className="d-flex flex-column gap-1 align-items-center">
                          <Link
                            to={`/carlist/edit/${car.cars_id}`}
                            className="btn btn-sm btn-white border text-primary w-100 p-1"
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
                            className="btn btn-sm btn-white border text-danger w-100 p-1"
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

        <div className="card-footer bg-white border-top py-3 px-4">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted small">
              Showing {filteredCars.length > 0 ? indexOfFirstItem + 1 : 0} to{" "}
              {Math.min(indexOfLastItem, filteredCars.length)} of{" "}
              {filteredCars.length} entries
            </span>

            {totalPages > 1 && (
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li
                    className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                  >
                    <button
                      className="page-link border-0 bg-transparent text-muted"
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
                      className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                    >
                      <button
                        className={`page-link border-0 rounded mx-1 shadow-sm px-3 ${currentPage === i + 1 ? "text-white" : "text-dark"}`}
                        style={{
                          backgroundColor:
                            currentPage === i + 1 ? "#0061f2" : "transparent",
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
                      className="page-link border-0 bg-transparent text-primary"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
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
                <h5 className="fw-bold text-dark mb-2">Hapus Data Unit?</h5>
                <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                  Anda akan menghapus data kendaraan <br />
                  <span className="fw-bold text-dark fs-6">
                    {carToDelete?.name}
                  </span>{" "}
                  <br />
                  <span
                    className="badge bg-light border text-dark mt-2 px-3 py-2"
                    style={{ letterSpacing: "1px" }}
                  >
                    Plat: {carToDelete?.plate}
                  </span>
                </p>
                <div
                  className="alert alert-warning border-0 bg-warning-subtle text-warning-emphasis p-2 rounded-3 mb-4 text-start d-flex align-items-center"
                  style={{ fontSize: "0.8rem" }}
                >
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
                <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                  Kendaraan{" "}
                  <span className="fw-bold text-dark">{carToDelete?.name}</span>{" "}
                  telah berhasil dihapus dari sistem.
                </p>
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
