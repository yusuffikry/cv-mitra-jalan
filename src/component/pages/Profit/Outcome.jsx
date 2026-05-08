import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Outcome() {
  // Data dummy untuk tabel pendapatan
  const [incomes] = useState([
    {
      id: 1,
      jenis_unit: "12/2/2026",
      nomor_plat: "Oli Mesin",
      total_penghasilan: "Penggantian oli mesin",
      total_jalan: "Rp50.000",
    },
  ]);

  // Fungsi hapus (simulasi)
  const handleDelete = (plat) => {
    const isConfirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus data pendapatan untuk mobil plat ${plat}?`,
    );
    if (isConfirmed) {
      alert(`Data pendapatan mobil ${plat} berhasil dihapus!`);
    }
  };

  // Fungsi Export CSV
  const exportToCSV = () => {
    const headers = [
      "No",
      "Jenis Unit",
      "Nomor Plat",
      "Total Penghasilan (Rp)",
      "Total Jalan (Kali)",
    ];

    const rows = incomes.map((item, index) => [
      index + 1,
      `"${item.jenis_unit}"`,
      `"${item.nomor_plat}"`,
      `"${item.total_penghasilan}"`,
      item.total_jalan,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Laporan_Pendapatan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="d-flex flex-column h-100 bg-light overflow-hidden">
      <div className="p-4 flex-grow-1 d-flex flex-column overflow-hidden">
        {/* Top Bar: Pencarian & Tombol Aksi */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-shrink-0">
          <div className="d-flex gap-3">
            <input
              type="text"
              className="form-control shadow-sm border-0"
              placeholder="Cari Plat Nomor..."
              style={{ minWidth: "200px", borderRadius: "8px" }}
            />
            <input
              type="text"
              className="form-control shadow-sm border-0"
              placeholder="Cari Jenis Mobil..."
              style={{ minWidth: "200px", borderRadius: "8px" }}
            />
          </div>

          <div className="d-flex gap-2">
            <button
              onClick={exportToCSV}
              className="btn btn-outline-success px-4 py-2 shadow-sm bg-white d-flex align-items-center"
              title="Export data ke Excel/CSV"
              style={{ borderRadius: "8px" }}
            >
              <i className="fas fa-file-excel me-2"></i>Export CSV
            </button>
            <Link
              to="/outcome/create"
              className="btn text-white px-4 py-2 shadow-sm d-flex align-items-center"
              style={{ backgroundColor: "#0cc2aa", borderRadius: "8px" }}
            >
              <i className="fas fa-plus me-2"></i>Tambah
            </Link>
          </div>
        </div>

        {/* Card Tabel Pendapatan */}
        <div
          className="card border-0 shadow-sm flex-grow-1 d-flex flex-column overflow-hidden"
          style={{ borderRadius: "15px" }}
        >
          <div className="card-body p-0 flex-grow-1 overflow-auto">
            <table
              className="table table-hover align-middle mb-0 text-center text-nowrap"
              style={{ fontSize: "0.9rem" }}
            >
              <thead className="sticky-top" style={{ zIndex: 10 }}>
                <tr style={{ backgroundColor: "#e2e2e2" }}>
                  <th className="py-3 text-secondary fw-bold border-bottom-0">
                    No.
                  </th>
                  <th className="py-3 text-secondary fw-bold border-bottom-0">
                    Tanggal Pengeluaran
                  </th>
                  <th className="py-3 text-secondary fw-bold border-bottom-0">
                    Jenis Pengeluaran
                  </th>
                  <th className="py-3 text-secondary fw-bold border-bottom-0">
                    Keterangan
                  </th>
                  <th className="py-3 text-secondary fw-bold border-bottom-0">
                    Total Pengeluaran
                  </th>
                  <th className="py-3 text-secondary fw-bold border-bottom-0">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {incomes.map((item, index) => (
                  <tr key={item.id} className="border-bottom">
                    <td className="text-dark fw-bold py-3">{index + 1}</td>
                    <td className="text-dark">{item.jenis_unit}</td>
                    <td className="fw-bold" style={{ color: "#0cc2aa" }}>
                      {item.nomor_plat}
                    </td>
                    <td className="text-dark">{item.total_penghasilan}</td>
                    <td className="text-dark">{item.total_jalan}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        {/* Tombol Edit (Kuning) */}
                        <button
                          className="btn btn-sm p-1 shadow-sm d-flex align-items-center justify-content-center"
                          title="Edit Data"
                          style={{
                            backgroundColor: "#ffb366",
                            color: "white",
                            borderRadius: "4px",
                            width: "28px",
                            height: "28px",
                          }}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        {/* Tombol Hapus (Merah) */}
                        <button
                          onClick={() => handleDelete(item.nomor_plat)}
                          className="btn btn-sm p-1 shadow-sm d-flex align-items-center justify-content-center"
                          title="Hapus Data"
                          style={{
                            backgroundColor: "#ff4d4d",
                            color: "white",
                            borderRadius: "4px",
                            width: "28px",
                            height: "28px",
                          }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                        {/* Tombol Detail/Copy (Hijau) */}
                        <Link
                          to="/outcome/show"
                          className="btn btn-sm p-1 shadow-sm d-flex align-items-center justify-content-center"
                          title="Detail Rekap"
                          style={{
                            backgroundColor: "#0cc2aa",
                            color: "white",
                            borderRadius: "4px",
                            width: "28px",
                            height: "28px",
                          }}
                        >
                          <i className="fas fa-file-alt"></i>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          <div className="card-footer bg-white border-top py-3 px-4 flex-shrink-0">
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted small">
                Showing 1 to {incomes.length} of 50 entries
              </span>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className="page-item disabled">
                    <span className="page-link border-0 text-muted">
                      Previous
                    </span>
                  </li>
                  <li className="page-item active">
                    <span
                      className="page-link border-0 shadow-sm mx-1 rounded"
                      style={{ backgroundColor: "#5493ff" }}
                    >
                      1
                    </span>
                  </li>
                  <li className="page-item">
                    <span className="page-link border-0 text-primary mx-1">
                      2
                    </span>
                  </li>
                  <li className="page-item">
                    <span className="page-link border-0 text-primary mx-1">
                      3
                    </span>
                  </li>
                  <li className="page-item">
                    <span className="page-link border-0 text-primary">
                      Next
                    </span>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
