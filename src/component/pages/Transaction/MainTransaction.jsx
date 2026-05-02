import React from "react";

export default function MainTransaction() {
  const transactions = Array(10).fill({
    waktu: "17 Oktober 2025 13:00",
    mobil: "DD 2020 RR",
    rute: "DALAM KOTA",
    keterangan: "Lunas",
    total: "10.000",
    dibuat: "12 Okt 2020",
  });

  return (
    <div className="d-flex flex-column h-100 bg-light overflow-hidden">
      <div className="p-4 flex-grow-1 d-flex flex-column overflow-hidden">
        <div className="d-flex justify-content-end mb-3 flex-shrink-0">
          <button
            className="btn text-white px-4 py-2 shadow-sm"
            style={{ backgroundColor: "#0cc2aa", borderRadius: "12px" }}
          >
            Tambah
          </button>
        </div>
        <div
          className="card border-0 shadow-sm flex-grow-1 d-flex flex-column overflow-hidden"
          style={{ borderRadius: "15px" }}
        >
          {/* Filter Bar */}
          <div className="card-header bg-white py-4 border-0 flex-shrink-0">
            <div className="row g-3">
              <div className="col-md-7">
                <input
                  type="text"
                  className="form-control shadow-none"
                  placeholder="Plat..."
                />
              </div>
              <div className="col-md-2">
                <input
                  type="text"
                  className="form-control text-muted shadow-none"
                  placeholder="Customer rute..."
                />
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control text-muted shadow-none"
                  placeholder="Dibuat pada..."
                />
              </div>
            </div>
          </div>
          <div className="card-body p-0 flex-grow-1 overflow-auto">
            <table
              className="table table-hover align-middle mb-0 text-center"
              style={{ fontSize: "0.85rem" }}
            >
              <thead className="sticky-top" style={{ zIndex: 10 }}>
                <tr style={{ backgroundColor: "#d9d9d9" }}>
                  <th className="py-3 text-secondary fw-bold">NO</th>
                  <th className="py-3 text-secondary fw-bold">
                    WAKTU/TANGGAL PEMINJAMAN{" "}
                  </th>
                  <th className="py-3 text-secondary fw-bold">MOBIL/PLAT</th>
                  <th className="py-3 text-secondary fw-bold">CUSTOMER RUTE</th>
                  <th className="py-3 text-secondary fw-bold">KETERANGAN</th>
                  <th className="py-3 text-secondary fw-bold">
                    TOTAL PEMBAYARAN
                  </th>
                  <th className="py-3 text-secondary fw-bold">DIBUAT PADA</th>
                  <th className="py-3 text-secondary fw-bold">AKSI</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {transactions.map((item, index) => (
                  <tr key={index} className="border-bottom">
                    <td className="text-muted py-3">{index + 1}</td>
                    <td>{item.waktu}</td>
                    <td className="fw-bold text-danger">{item.mobil}</td>
                    <td>
                      <span
                        className="badge px-3 py-2 text-white"
                        style={{
                          backgroundColor: "#0cc2aa",
                          borderRadius: "6px",
                        }}
                      >
                        {item.rute}
                      </span>
                    </td>
                    <td>{item.keterangan}</td>
                    <td>{item.total}</td>
                    <td>{item.dibuat}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-1">
                        <button
                          className="btn btn-sm p-1 shadow-sm"
                          style={{
                            backgroundColor: "#ffb366",
                            color: "white",
                            borderRadius: "4px",
                          }}
                        >
                          <i className="fas fa-edit p-1"></i>
                        </button>
                        <button
                          className="btn btn-sm p-1 shadow-sm"
                          style={{
                            backgroundColor: "#ff4d4d",
                            color: "white",
                            borderRadius: "4px",
                          }}
                        >
                          <i className="fas fa-trash p-1"></i>
                        </button>
                        <button
                          className="btn btn-sm p-1 shadow-sm"
                          style={{
                            backgroundColor: "#0cc2aa",
                            color: "white",
                            borderRadius: "4px",
                          }}
                        >
                          <i className="fas fa-copy p-1"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-footer bg-white border-top py-3 px-4 flex-shrink-0">
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted small">
                Showing 1 to 5 of 50 entries
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
