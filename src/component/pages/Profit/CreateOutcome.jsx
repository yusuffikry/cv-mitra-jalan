import React, { useState } from "react";

export default function CreateOutcome() {
  const [rows, setRows] = useState([
    { id: Date.now(), tanggal: "", jenis: "", keterangan: "", total: "" },
  ]);

  // Tambah baris baru
  const addRow = () => {
    setRows([
      ...rows,
      { id: Date.now(), tanggal: "", jenis: "", keterangan: "", total: "" },
    ]);
  };

  // Hapus baris
  const deleteRow = (id) => {
    if (rows.length > 1) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  // Hitung total keseluruhan
  const calculateGrandTotal = () => {
    return rows.reduce((acc, row) => acc + (Number(row.total) || 0), 0);
  };

  return (
    <div className="container-fluid bg-light min-vh-100 p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-dark m-0">Tambah Pengeluaran</h4>
        <button
          className="btn btn-outline-secondary btn-sm shadow-sm bg-white"
          onClick={() => window.history.back()}
        >
          <i className="fas fa-arrow-left me-2"></i>Kembali
        </button>
      </div>

      <div className="card border-0 shadow-sm" style={{ borderRadius: "15px" }}>
        <div className="card-body p-4">
          <div className="table-responsive">
            <table className="table table-bordered align-middle text-center">
              <thead className="sticky-top" style={{ zIndex: 10 }}>
                <tr style={{ backgroundColor: "#e2e2e2" }}>
                  <th
                    className="py-3 text-secondary fw-bold border-bottom-0"
                    style={{ width: "50px" }}
                  >
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
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>
                      <input
                        type="date"
                        className="form-control border-0 bg-light shadow-sm"
                        style={{ borderRadius: "8px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control border-0 bg-light shadow-sm"
                        placeholder="Misal: BBM, Service"
                        style={{ borderRadius: "8px" }}
                      />
                    </td>
                    <td>
                      <textarea
                        className="form-control border-0 bg-light shadow-sm"
                        rows="1"
                        placeholder="Keterangan singkat..."
                        style={{ borderRadius: "8px" }}
                      ></textarea>
                    </td>
                    <td>
                      <div
                        className="input-group shadow-sm"
                        style={{ borderRadius: "8px", overflow: "hidden" }}
                      >
                        <span className="input-group-text border-0 bg-secondary text-white">
                          Rp
                        </span>
                        <input
                          type="number"
                          className="form-control border-0 bg-light"
                          placeholder="0"
                          onChange={(e) => {
                            const newRows = [...rows];
                            newRows[index].total = e.target.value;
                            setRows(newRows);
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          onClick={addRow}
                          className="btn btn-success btn-sm d-flex align-items-center"
                          style={{ borderRadius: "6px", fontSize: "11px" }}
                        >
                          <i className="fas fa-plus-circle me-1"></i> Add Row
                        </button>
                        <button
                          onClick={() => deleteRow(row.id)}
                          className="btn btn-danger btn-sm d-flex align-items-center"
                          style={{ borderRadius: "6px", fontSize: "11px" }}
                        >
                          <i className="fas fa-minus-circle me-1"></i> Delete
                          Row
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {/* FOOTER TOTAL */}
                <tr className="bg-light fw-bold">
                  <td colSpan="4" className="text-end py-3">
                    Total Pengeluaran Hari Ini
                  </td>
                  <td className="text-primary py-3">
                    Rp {calculateGrandTotal().toLocaleString("id-ID")}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-end mt-4">
            <button
              className="btn btn-primary px-5 py-2 shadow-sm fw-bold"
              style={{
                borderRadius: "10px",
                backgroundColor: "#0cc2aa",
                border: "none",
              }}
            >
              Simpan Semua Pengeluaran
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
