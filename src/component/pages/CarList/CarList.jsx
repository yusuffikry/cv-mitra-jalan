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
      
      let fetchedCars = data || [];

      // ====================================================================
      // LOGIKA OTOMATISASI STATUS: KEMBALI "TERSEDIA" SAAT REFRESH
      // ====================================================================
      const disewaCars = fetchedCars.filter((car) => car.status_mobil === "Disewa");

      if (disewaCars.length > 0) {
        // Ambil semua ID mobil yang sedang disewa
        const disewaCarIds = disewaCars.map((car) => car.cars_id || car.id);

        // Cek data transaksinya di database
        const { data: txData, error: txError } = await supabase
          .from("transactions")
          .select("car_id, tanggal_pengembalian, jam_pengembalian")
          .in("car_id", disewaCarIds);

        if (!txError) {
          const now = new Date();
          const carsToMakeAvailable = [];

          disewaCarIds.forEach((carId) => {
            // Ambil seluruh riwayat transaksi untuk mobil ini
            const carTxs = txData?.filter((tx) => String(tx.car_id) === String(carId)) || [];

            if (carTxs.length === 0) {
              // SKENARIO 1: Data transaksi sudah dihapus, tapi mobil masih berstatus "Disewa"
              carsToMakeAvailable.push(carId);
            } else {
              // SKENARIO 2: Transaksi ada, cari jadwal pengembalian paling akhir
              const latestTx = carTxs.reduce((latest, current) => {
                const currDate = new Date(`${current.tanggal_pengembalian}T${current.jam_pengembalian || "00:00:00"}`);
                const latestDate = new Date(`${latest.tanggal_pengembalian}T${latest.jam_pengembalian || "00:00:00"}`);
                return currDate > latestDate ? current : latest;
              });

              const latestReturnTime = new Date(`${latestTx.tanggal_pengembalian}T${latestTx.jam_pengembalian || "00:00:00"}`);

              // Jika waktu sekarang sudah melewati waktu pengembalian transaksi terakhir
              if (now > latestReturnTime) {
                carsToMakeAvailable.push(carId);
              }
            }
          });

          // Jika ditemukan mobil yang harus dikembalikan statusnya
          if (carsToMakeAvailable.length > 0) {
            const pkColumn = fetchedCars[0].cars_id !== undefined ? "cars_id" : "id";

            // 1. Eksekusi update massal ke Supabase
            await supabase
              .from("cars")
              .update({ status_mobil: "Tersedia" })
              .in(pkColumn, carsToMakeAvailable);

            // 2. Perbarui state lokal secara instan agar tabel di layar langsung berubah
            fetchedCars = fetchedCars.map((car) =>
              carsToMakeAvailable.includes(car.cars_id || car.id)
                ? { ...car, status_mobil: "Tersedia" }
                : car
            );
          }
        }
      }
      // ====================================================================

      setCars(fetchedCars);
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

  // --- FILTER MOBIL BERDASARKAN STATUS ARMADA & PENCARIAN ---
  const filteredCars = cars
    .filter((car) => {
      if (activeTab === "car-rent") {
        return car.status_armada === "Internal" || !car.status_armada;
      } else {
        return car.status_armada === "Eksternal";
      }
    })
    .filter((car) => {
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
    let headers = [];
    let rows = [];
    let wscols = [];

    if (activeTab === "car-rent") {
      headers = [
        "No",
        "Nama Kendaraan",
        "Tipe",
        "Tahun",
        "Plat Nomor",
        "Transmisi",
        "Jatuh Tempo",
        "Tanggal Servis",
        "Tanggal Pajak",
        "No GPS Utama",
        "Masa Aktif GPS Utama",
        "Status GPS Utama",
        "No GPS Cadangan",
        "Masa Aktif GPS Cadangan",
        "Status GPS Cadangan",
        "Keluhan",
        "Status",
      ];

      rows = filteredCars.map((car, index) => {
        const gps1Nomor = car.no_gps || car.gps_nomor || car.no_gps_1 || "-";
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

      wscols = [
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
    } else {
      headers = [
        "No",
        "Nama Kendaraan",
        "Tipe",
        "Plat Nomor",
        "Transmisi",
        "Sumber",
      ];
      rows = filteredCars.map((car, index) => [
        index + 1,
        car.jenis_unit || "-",
        car.tipe_kendaraan || "-",
        car.nomor_plat || "-",
        car.transmisi || "-",
        "Rent-to-Rent",
      ]);
      wscols = [
        { wch: 5 },
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
      ];
    }

    const dataToExport = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(dataToExport);
    worksheet["!cols"] = wscols;

    const workbook = XLSX.utils.book_new();
    const sheetName =
      activeTab === "car-rent"
        ? "Data Armada Internal"
        : "Data Armada Eksternal";
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    XLSX.writeFile(
      workbook,
      `Data_Armada_${activeTab === "car-rent" ? "Internal" : "Eksternal"}_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCars.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);

  return (
    <div
      className="container-fluid py-3 bg-white d-flex flex-column"
      style={{ fontSize: "0.825rem", color: "#333333" }}
    >
      {/* Header Utama */}
      <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
        <div>
          <h5 className="fw-bold text-dark mb-0">Daftar Kendaraan / Armada</h5>
          <p className="text-muted mb-0" style={{ fontSize: "0.775rem" }}>
            Total data unit logistik internal dan eksternal terintegrasi dalam
            sistem ERP.
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

          {activeTab === "car-rent" && (
            <Link
              to="/carlist/create"
              className="btn btn-sm text-white px-3 py-1.5 fw-bold"
              style={{ backgroundColor: "#0052cc", borderRadius: "3px" }}
            >
              <i className="fas fa-plus me-1.5 small"></i>Registrasi Unit
            </Link>
          )}
        </div>
      </div>

      {/* Tabs Kontrol & Search Bar */}
      <div
        className="card bg-light border mb-3"
        style={{ borderRadius: "3px" }}
      >
        <div className="card-body p-2">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <ul className="nav nav-pills gap-1.5" role="tablist">
              <li className="nav-item">
                <button
                  className={`nav-link fw-bold ${activeTab === "car-rent" ? "text-white" : "text-dark bg-white border"}`}
                  style={{
                    backgroundColor:
                      activeTab === "car-rent" ? "#0052cc" : "#ffffff",
                    borderRadius: "3px",
                    padding: "4px 12px",
                    fontSize: "0.775rem",
                  }}
                  onClick={() => {
                    setActiveTab("car-rent");
                    setCurrentPage(1);
                    setSearchTerm("");
                  }}
                  type="button"
                >
                  <i className="fas fa-car me-1.5 small"></i>Rental Internal
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link fw-bold ${activeTab === "rent-to-rent" ? "text-white" : "text-dark bg-white border"}`}
                  style={{
                    backgroundColor:
                      activeTab === "rent-to-rent" ? "#0052cc" : "#ffffff",
                    borderRadius: "3px",
                    padding: "4px 12px",
                    fontSize: "0.775rem",
                  }}
                  onClick={() => {
                    setActiveTab("rent-to-rent");
                    setCurrentPage(1);
                    setSearchTerm("");
                  }}
                  type="button"
                >
                  <i className="fas fa-exchange-alt me-1.5 small"></i>Rental
                  Eksternal
                </button>
              </li>
            </ul>

            <div style={{ minWidth: "280px" }}>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  style={{ borderRadius: "3px" }}
                  placeholder="Cari nama unit atau plat..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                {searchTerm && (
                  <button
                    className="btn btn-white border border-start-0 bg-white"
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setCurrentPage(1);
                    }}
                  >
                    <i className="fas fa-times text-muted"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kontainer Tabel Utama */}
      <div
        className="card border flex-grow-1 d-flex flex-column overflow-hidden"
        style={{ borderRadius: "3px" }}
      >
        <div className="table-responsive flex-grow-1 overflow-auto">
          {activeTab === "car-rent" ? (
            /* ================= TABEL INTERNAL ================= */
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
                    className="py-2 text-dark border-bottom"
                    style={{
                      backgroundColor: "#f1f3f5",
                      fontSize: "0.725rem",
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                    }}
                  >
                    Unit Kendaraan
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
                    Plat Nomor
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
                    Transmisi
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
                    Jatuh Tempo
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
                    Tgl Servis
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
                    Tgl Pajak
                  </th>
                  <th
                    className="py-2 text-dark border-bottom"
                    style={{
                      width: "160px",
                      backgroundColor: "#f1f3f5",
                      fontSize: "0.725rem",
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                    }}
                  >
                    GPS Utama (1)
                  </th>
                  <th
                    className="py-2 text-dark border-bottom"
                    style={{
                      width: "160px",
                      backgroundColor: "#f1f3f5",
                      fontSize: "0.725rem",
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                    }}
                  >
                    GPS Cadangan (2)
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
                    Keluhan Unit
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
                      colSpan="12"
                      className="text-center py-4 text-muted"
                      style={{ fontFamily: "monospace" }}
                    >
                      <div
                        className="spinner-border spinner-border-sm me-2 text-secondary"
                        role="status"
                      ></div>
                      Memuat data armada internal...
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="text-center py-4 text-muted">
                      Belum ada data unit rental internal yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((car, index) => {
                    const gps1Nomor = car.no_gps || car.gps_nomor || car.no_gps_1;
                    const gps1Aktif =
                      car.masa_aktif_gps || car.masa_aktif_gps_1;
                    const gps1Status = car.status_gps || car.status_gps_1;

                    const gps2Nomor = car.no_gps2 || car.no_gps_2;
                    const gps2Aktif =
                      car.masa_aktif_gps2 || car.masa_aktif_gps_2;
                    const gps2Status = car.status_gps2 || car.status_gps_2;

                    const isReady = car.status_mobil === "Tersedia";
                    const isMaintenance = car.status_mobil === "Pemeliharaan";

                    return (
                      <tr key={car.cars_id}>
                        <td
                          className="text-center text-muted py-2"
                          style={{
                            fontFamily: "SFMono-Regular, Menlo, monospace",
                          }}
                        >
                          {String(indexOfFirstItem + index + 1).padStart(
                            2,
                            "0",
                          )}
                        </td>
                        <td>
                          <div className="fw-bold text-dark">
                            {car.jenis_unit || "-"}
                          </div>
                          <div
                            className="text-muted small"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {car.tipe_kendaraan || "-"} •{" "}
                            {car.tahun_produksi || "-"}
                          </div>
                        </td>
                        <td className="text-center">
                          <span
                            className="badge bg-light text-dark border px-2 py-1 font-mono d-block mx-auto"
                            style={{ fontSize: "0.75rem", maxWidth: "100px" }}
                          >
                            {car.nomor_plat || "-"}
                          </span>
                        </td>
                        <td className="text-center text-primary fw-medium">
                          {car.transmisi || "-"}
                        </td>
                        <td className="text-center text-secondary font-mono small">
                          {car.tgl_jatuh_tempo || "-"}
                        </td>
                        <td className="text-center text-secondary font-mono small">
                          {car.tgl_pergantian_oli || "-"}
                        </td>
                        <td className="text-center text-secondary font-mono small">
                          {car.tgl_mati_pajak || "-"}
                        </td>
                        <td>
                          <div className="fw-bold text-dark font-mono small">
                            {gps1Nomor || "-"}
                          </div>
                          {gps1Aktif && (
                            <small
                              className={`font-mono d-block ${gps1Status === "Aktif" ? "text-success" : "text-danger"}`}
                              style={{ fontSize: "0.675rem" }}
                            >
                              <i
                                className={`fas ${gps1Status === "Aktif" ? "fa-circle" : "fa-minus-circle"} me-1 small`}
                              ></i>
                              s/d {gps1Aktif}
                            </small>
                          )}
                        </td>
                        <td>
                          {gps2Nomor || gps2Aktif ? (
                            <>
                              <div className="fw-bold text-dark font-mono small">
                                {gps2Nomor || "-"}
                              </div>
                              {gps2Aktif && (
                                <small
                                  className={`font-mono d-block ${gps2Status === "Aktif" ? "text-success" : "text-muted"}`}
                                  style={{ fontSize: "0.675rem" }}
                                >
                                  <i
                                    className={`fas ${gps2Status === "Aktif" ? "fa-circle" : "fa-minus-circle"} me-1 small`}
                                  ></i>
                                  s/d {gps2Aktif}
                                </small>
                              )}
                            </>
                          ) : (
                            <span className="text-muted small fst-italic">
                              -
                            </span>
                          )}
                        </td>
                        <td
                          className="text-wrap text-muted"
                          style={{
                            minWidth: "150px",
                            maxWidth: "220px",
                            fontSize: "0.8rem",
                          }}
                        >
                          {car.keluhan_unit || "-"}
                        </td>
                        <td className="text-center">
                          <span
                            className="fw-bold d-block mx-auto text-center py-1 rounded-1"
                            style={{
                              maxWidth: "110px",
                              fontSize: "0.75rem",
                              backgroundColor: isReady
                                ? "#e6f4ea"
                                : isMaintenance
                                  ? "#fce8e6"
                                  : "#f1f3f5",
                              color: isReady
                                ? "#137333"
                                : isMaintenance
                                  ? "#c5221f"
                                  : "#6c757d",
                              border: `1px solid ${isReady ? "#c4eed0" : isMaintenance ? "#fad2cf" : "#dee2e6"}`,
                            }}
                          >
                            {car.status_mobil || "-"}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="btn-group btn-group-sm">
                            <Link
                              to={`/carlist/edit/${car.cars_id}`}
                              className="btn btn-light border text-primary"
                              title="Edit"
                              style={{ borderRadius: "3px 0 0 3px" }}
                            >
                              <i className="fas fa-edit small"></i>
                            </Link>
                            <button
                              onClick={() =>
                                handleDeleteClick(
                                  car.cars_id,
                                  car.jenis_unit,
                                  car.nomor_plat,
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
          ) : (
            /* ================= TABEL EKSTERNAL ================= */
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
                    className="py-2 text-dark border-bottom"
                    style={{
                      backgroundColor: "#f1f3f5",
                      fontSize: "0.725rem",
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                    }}
                  >
                    Kendaraan Eksternal
                  </th>
                  <th
                    className="py-2 text-dark border-bottom text-center"
                    style={{
                      width: "180px",
                      backgroundColor: "#f1f3f5",
                      fontSize: "0.725rem",
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                    }}
                  >
                    Plat Nomor
                  </th>
                  <th
                    className="py-2 text-dark border-bottom text-center"
                    style={{
                      width: "150px",
                      backgroundColor: "#f1f3f5",
                      fontSize: "0.725rem",
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                    }}
                  >
                    Transmisi
                  </th>
                  <th
                    className="py-2 text-dark border-bottom text-center"
                    style={{
                      width: "150px",
                      backgroundColor: "#f1f3f5",
                      fontSize: "0.725rem",
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                    }}
                  >
                    Sumber Vendor
                  </th>
                  <th
                    className="text-center py-2 text-dark border-bottom"
                    style={{
                      width: "100px",
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
                      colSpan="6"
                      className="text-center py-4 text-muted"
                      style={{ fontFamily: "monospace" }}
                    >
                      <div
                        className="spinner-border spinner-border-sm me-2 text-secondary"
                        role="status"
                      ></div>
                      Memuat data armada eksternal...
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      Belum ada data sub-kontrak eksternal (Rent-to-Rent).
                    </td>
                  </tr>
                ) : (
                  currentItems.map((car, index) => (
                    <tr key={car.cars_id}>
                      <td
                        className="text-center text-muted py-2.5"
                        style={{
                          fontFamily: "SFMono-Regular, Menlo, monospace",
                        }}
                      >
                        {String(indexOfFirstItem + index + 1).padStart(2, "0")}
                      </td>
                      <td>
                        <div className="fw-bold text-dark">
                          {car.jenis_unit || "-"}
                        </div>
                        <div
                          className="text-muted small"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Tipe: {car.tipe_kendaraan || "-"}
                        </div>
                      </td>
                      <td className="text-center">
                        <span
                          className="badge bg-light text-dark border px-2 py-1 font-mono d-block mx-auto"
                          style={{ fontSize: "0.75rem", maxWidth: "120px" }}
                        >
                          {car.nomor_plat || "-"}
                        </span>
                      </td>
                      <td className="text-center text-primary fw-medium">
                        {car.transmisi || "-"}
                      </td>
                      <td className="text-center">
                        <span
                          className="badge border px-2 py-1 text-secondary bg-light"
                          style={{ borderRadius: "2px" }}
                        >
                          Rent-to-Rent
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() =>
                            handleDeleteClick(
                              car.cars_id,
                              car.jenis_unit,
                              car.nomor_plat,
                            )
                          }
                          className="btn btn-xs btn-light border text-danger px-2 py-1"
                          style={{ borderRadius: "3px" }}
                          title="Hapus Mobil Eksternal"
                        >
                          <i className="fas fa-trash small me-1"></i>Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Pagination Kontrol */}
        <div className="card-footer bg-light border-top p-2 d-flex justify-content-between align-items-center">
          <div className="text-muted" style={{ fontSize: "0.75rem" }}>
            Menampilkan{" "}
            <span className="fw-bold text-dark">
              {filteredCars.length > 0 ? indexOfFirstItem + 1 : 0}
            </span>
            -
            <span className="fw-bold text-dark">
              {Math.min(indexOfLastItem, filteredCars.length)}
            </span>{" "}
            dari{" "}
            <span className="fw-bold text-dark">{filteredCars.length}</span>{" "}
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

                <h6 className="fw-bold text-dark mb-1">Hapus Data Unit?</h6>
                <p className="text-muted mb-2" style={{ fontSize: "0.75rem" }}>
                  Anda akan menghapus permanen data kendaraan: <br />
                  <span className="fw-bold text-dark">
                    {carToDelete?.name}
                  </span>{" "}
                  <br />
                  <small className="font-mono text-secondary">
                    Plat: {carToDelete?.plate}
                  </small>
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
                  Data inventaris unit kendaraan telah berhasil dikeluarkan dari
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