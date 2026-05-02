import React from "react";
import { Link } from "react-router-dom";

export default function CarList() {
  // Data dummy diperbarui dengan kolom tambahan
  const cars = [
    {
      id: 1,
      name: "Toyota Avanza",
      plate: "B 1234 ABC",
      status: "Tersedia",
      type: "MPV",
      year: "2022",
      dueDate: "2026-06-15",
      serviceDate: "2026-05-20",
      taxDate: "2027-01-10",
      gpsNumber: "GPS-101",
      gpsActiveDate: "2026-04-30", // Contoh tanggal kedaluwarsa (berubah menjadi Tidak Aktif)
      transmission: "Otomatis",
      complaints: "AC kurang dingin",
    },
    {
      id: 2,
      name: "Mitsubishi Xpander",
      plate: "B 5678 DEF",
      status: "Disewa",
      type: "MPV",
      year: "2021",
      dueDate: "2026-05-10",
      serviceDate: "2026-06-01",
      taxDate: "2026-11-20",
      gpsNumber: "GPS-102",
      gpsActiveDate: "2026-12-31", // Contoh tanggal aktif
      transmission: "Manual",
      complaints: "Tidak ada",
    },
    {
      id: 3,
      name: "Honda HR-V",
      plate: "B 9012 GHI",
      status: "Tersedia",
      type: "SUV",
      year: "2023",
      dueDate: "2026-07-01",
      serviceDate: "2026-07-15",
      taxDate: "2027-03-05",
      gpsNumber: "GPS-103",
      gpsActiveDate: "2026-05-01", // Contoh tanggal kedaluwarsa
      transmission: "Otomatis",
      complaints: "Wiper bunyi",
    },
    {
      id: 4,
      name: "Suzuki Ertiga",
      plate: "B 4432 JKL",
      status: "Tersedia",
      type: "MPV",
      year: "2022",
      dueDate: "2026-05-25",
      serviceDate: "2026-05-10",
      taxDate: "2026-09-12",
      gpsNumber: "GPS-104",
      gpsActiveDate: "2026-08-15", // Contoh tanggal aktif
      transmission: "Manual",
      complaints: "Cek rem depan",
    },
  ];

  // Fungsi pembantu untuk mengecek apakah GPS masih aktif
  const checkGpsStatus = (expiryDate) => {
    const today = new Date();
    const activeUntil = new Date(expiryDate);

    // Set jam ke 00:00:00 agar perbandingan adil hanya berdasarkan tanggal
    today.setHours(0, 0, 0, 0);
    activeUntil.setHours(0, 0, 0, 0);

    return activeUntil >= today;
  };

  // Fungsi untuk mengekspor data ke file CSV
  const exportToCSV = () => {
    // 1. Buat Header Kolom
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

    // 2. Map data ke dalam bentuk baris (array of strings)
    const rows = cars.map((car, index) => {
      const isGpsActive = checkGpsStatus(car.gpsActiveDate)
        ? "Aktif"
        : "Tidak Aktif";

      return [
        index + 1,
        car.name,
        car.type,
        car.year,
        car.plate,
        car.transmission,
        car.dueDate,
        car.serviceDate,
        car.taxDate,
        car.gpsNumber,
        car.gpsActiveDate,
        isGpsActive,
        `"${car.complaints}"`, // Dibungkus tanda kutip agar koma di dalam keluhan tidak merusak format CSV
        car.status,
      ];
    });

    // 3. Gabungkan Header dan Baris menggunakan koma dan enter (\n)
    const csvContent = [
      headers.join(","), // Menggabungkan header
      ...rows.map((row) => row.join(",")), // Menggabungkan setiap baris data
    ].join("\n");

    // 4. Buat Blob dan tautan (link) untuk proses download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Data_Armada_Rental.csv"); // Nama file
    document.body.appendChild(link);
    link.click();

    // Bersihkan memori setelah download
    document.body.removeChild(link);
  };

  return (
    <div className="d-flex flex-column vh-100 bg-light p-4 overflow-hidden">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-shrink-0">
        <div>
          <h4 className="fw-bold text-dark mb-1">Manajemen Armada</h4>
          <p className="text-muted small mb-0">
            Data inventaris kendaraan aktif
          </p>
        </div>

        {/* Tambahan Dropdown / Button Export di sini */}
        <div className="d-flex gap-2">
          <button
            onClick={exportToCSV}
            className="btn btn-success shadow-sm px-3"
            title="Export data ke Excel/CSV"
          >
            <i className="fas fa-file-excel me-2"></i>Export CSV
          </button>

          <Link to="/carlist/create" className="btn btn-primary shadow-sm px-3">
            <i className="fas fa-plus me-2"></i>Tambah Mobil
          </Link>
        </div>
      </div>

      {/* Card Utama */}
      <div className="card border-0 shadow-sm d-flex flex-column flex-grow-1 overflow-hidden">
        {/* Toolbar */}
        <div className="card-header bg-white py-3 border-bottom-0 flex-shrink-0">
          <div className="row">
            <div className="col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="fas fa-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Cari unit..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Area Tabel */}
        <div className="card-body p-0 flex-grow-1 overflow-auto">
          <table
            className="table table-hover align-middle mb-0 text-nowrap"
            style={{ fontSize: "0.85rem" }}
          >
            <thead className="sticky-top bg-white" style={{ zIndex: 10 }}>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th className="px-4 py-3 text-secondary fw-bold text-uppercase border-bottom">
                  No
                </th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom">
                  Unit Kendaraan
                </th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom text-center">
                  Plat Nomor
                </th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom text-center">
                  Transmisi
                </th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom text-center">
                  Jatuh Tempo
                </th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom text-center">
                  Tgl Servis
                </th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom text-center">
                  Tgl Pajak
                </th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom text-center">
                  GPS & Masa Aktif
                </th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom">
                  Keluhan Unit
                </th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom text-center">
                  Status
                </th>
                <th className="py-3 text-center text-secondary fw-bold text-uppercase border-bottom">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car, index) => {
                const isGpsActive = checkGpsStatus(car.gpsActiveDate);

                return (
                  <tr key={car.id}>
                    <td className="px-4 text-muted">{index + 1}</td>
                    <td>
                      <div className="fw-bold text-dark">{car.name}</div>
                      <div
                        className="text-muted small"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {car.type} • {car.year}
                      </div>
                    </td>
                    <td className="text-center">
                      <span
                        className="badge border text-dark fw-bold bg-white px-2 py-1"
                        style={{ letterSpacing: "1px" }}
                      >
                        {car.plate}
                      </span>
                    </td>
                    <td className="text-center">{car.transmission}</td>
                    <td className="text-center">{car.dueDate}</td>
                    <td className="text-center">{car.serviceDate}</td>
                    <td className="text-center">{car.taxDate}</td>

                    {/* Kolom GPS dengan Logika Aktif/Tidak Aktif */}
                    <td className="text-center">
                      <div className="fw-bold text-dark">{car.gpsNumber}</div>
                      <div
                        className="text-muted mb-1"
                        style={{ fontSize: "0.75rem" }}
                      >
                        s/d {car.gpsActiveDate}
                      </div>
                      <span
                        className={`badge rounded-pill px-2 py-1 ${
                          isGpsActive
                            ? "bg-success-subtle text-success"
                            : "bg-danger-subtle text-danger"
                        }`}
                        style={{ fontSize: "0.7rem" }}
                      >
                        {isGpsActive ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </td>

                    <td className="text-wrap" style={{ maxWidth: "150px" }}>
                      <span className="text-muted">{car.complaints}</span>
                    </td>

                    <td className="text-center">
                      <span
                        className={`badge rounded-pill px-3 py-2 ${
                          car.status === "Tersedia"
                            ? "bg-success-subtle text-success"
                            : "bg-warning-subtle text-warning"
                        }`}
                      >
                        <i
                          className="fas fa-circle me-1"
                          style={{ fontSize: "6px" }}
                        ></i>{" "}
                        {car.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="btn-group shadow-sm">
                        <button className="btn btn-sm btn-white border text-primary">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-sm btn-white border text-danger">
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

        {/* Footer */}
        <div className="card-footer bg-white border-top py-3 px-4 flex-shrink-0">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted small">
              Total: <strong>{cars.length}</strong> unit
            </span>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className="page-item disabled">
                  <span className="page-link border-0 bg-transparent">
                    Prev
                  </span>
                </li>
                <li className="page-item active">
                  <span
                    className="page-link border-0 rounded mx-1 shadow-sm px-3"
                    style={{ backgroundColor: "#0061f2" }}
                  >
                    1
                  </span>
                </li>
                <li className="page-item">
                  <span className="page-link border-0 text-dark mx-1">2</span>
                </li>
                <li className="page-item">
                  <span className="page-link border-0 bg-transparent text-primary">
                    Next
                  </span>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
