import React from "react";
import { Link } from "react-router-dom";

export default function CarList() {
  const cars = [
    {
      id: 1,
      name: "Toyota Avanza",
      plate: "B 1234 ABC",
      status: "Tersedia",
      type: "MPV",
      year: "2022",
    },
    {
      id: 2,
      name: "Mitsubishi Xpander",
      plate: "B 5678 DEF",
      status: "Disewa",
      type: "MPV",
      year: "2021",
    },
    {
      id: 3,
      name: "Honda HR-V",
      plate: "B 9012 GHI",
      status: "Tersedia",
      type: "SUV",
      year: "2023",
    },
    {
      id: 4,
      name: "Suzuki Ertiga",
      plate: "B 4432 JKL",
      status: "Tersedia",
      type: "MPV",
      year: "2022",
    },
  ];

  return (
    /* h-100 dan overflow-hidden agar halaman tidak scroll ke bawah secara keseluruhan */
    <div className="d-flex flex-column vh-100 bg-light p-4 overflow-hidden">
      {/* Header Tetap di Atas */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-shrink-0">
        <div>
          <h4 className="fw-bold text-dark mb-1">Manajemen Armada</h4>
          <p className="text-muted small mb-0">
            Data inventaris kendaraan aktif
          </p>
        </div>
        <Link to="/carlist/create" className="btn btn-primary shadow-sm px-3">
          <i className="fas fa-plus me-2"></i>Tambah Mobil
        </Link>
      </div>

      {/* Card Utama dengan flex-grow agar mengisi sisa layar */}
      <div className="card border-0 shadow-sm d-flex flex-column flex-grow-1 overflow-hidden">
        {/* Toolbar Atas */}
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

        {/* Area Tabel dengan Scroll Internal jika data banyak */}
        <div className="card-body p-0 flex-grow-1 overflow-auto">
          <table
            className="table table-hover align-middle mb-0"
            style={{ fontSize: "0.85rem" }}
          >
            <thead className="sticky-top bg-white" style={{ zIndex: 10 }}>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th
                  className="px-4 py-3 text-secondary fw-bold text-uppercase border-bottom"
                  style={{ width: "60px" }}
                >
                  No
                </th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom">
                  Unit Kendaraan
                </th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom text-center">
                  Plat Nomor
                </th>
                <th className="py-3 text-secondary fw-bold text-uppercase border-bottom text-center">
                  Status
                </th>
                <th
                  className="py-3 text-center text-secondary fw-bold text-uppercase border-bottom"
                  style={{ width: "120px" }}
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car, index) => (
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Tetap di Bawah Card dan Mepet Kanan */}
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
