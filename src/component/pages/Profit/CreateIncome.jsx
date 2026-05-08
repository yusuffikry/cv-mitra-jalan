import React, { useState } from "react";

export default function CreateIncome() {
  const [rows, setRows] = useState([
    { id: Date.now(), tanggal: "Jumat, 24 April 2026", nominal: "" },
  ]);

  // Fungsi menambah baris tabel
  const addRow = () => {
    setRows([
      ...rows,
      { id: Date.now(), tanggal: "Jumat, 24 April 2026", nominal: "" },
    ]);
  };

  // Fungsi menghapus baris tabel
  const deleteRow = (id) => {
    if (rows.length > 1) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100 p-4">
      {/* CARD DATA KENDARAAN */}
      <div
        className="card shadow-sm border-0 mb-4"
        style={{ borderRadius: "10px" }}
      >
        <div className="card-body p-4">
          <h6
            className="text-secondary fw-bold mb-4 text-uppercase small"
            style={{ letterSpacing: "1px" }}
          >
            Data Kendaraan
          </h6>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label text-muted small">
                Plat Kendaraan
              </label>
              <select className="form-select bg-white border">
                <option value="">--Pilih plat kendaraan--</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small">
                Merek Kendaraan
              </label>
              <input
                type="text"
                className="form-control bg-light"
                placeholder="Auto Fill"
                disabled
              />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small">
                Jenis Kendaraan
              </label>
              <input
                type="text"
                className="form-control bg-light"
                placeholder="Auto Fill"
                disabled
              />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small">Nomor Plat</label>
              <input
                type="text"
                className="form-control bg-light"
                placeholder="Auto Fill"
                disabled
              />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small">Nomor GPS</label>
              <input
                type="text"
                className="form-control bg-light"
                placeholder="Auto Fill"
                disabled
              />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small">Transmisi</label>
              <input
                type="text"
                className="form-control bg-light"
                placeholder="Auto Fill"
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      {/* CARD DATA PEMASUKAN */}
      <div className="card shadow-sm border-0" style={{ borderRadius: "10px" }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h6
              className="text-secondary fw-bold text-uppercase small m-0"
              style={{ letterSpacing: "1px" }}
            >
              Data Pemasukan
            </h6>
            <span className="text-muted small">April 2026</span>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered align-middle text-center">
              <thead style={{ backgroundColor: "#e2e2e2" }}>
                <tr>
                  <th className="py-3 text-secondary fw-bold border-0 small">
                    No. ⇅
                  </th>
                  <th className="py-3 text-secondary fw-bold border-0 small">
                    Hari/ Tanggal ⇅
                  </th>
                  <th className="py-3 text-secondary fw-bold border-0 small">
                    Pemasukan (Rp) ⇅
                  </th>
                  <th className="py-3 text-secondary fw-bold border-0 small">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id}>
                    <td className="text-muted small">{index + 1}</td>
                    <td style={{ width: "30%" }}>
                      <input
                        type="text"
                        className="form-control border-0 bg-transparent text-center"
                        value={row.tanggal}
                        readOnly
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control border shadow-sm"
                        placeholder="Masukkan nominal..."
                      />
                    </td>
                    <td style={{ width: "15%" }}>
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          onClick={addRow}
                          className="btn btn-success btn-sm fw-bold"
                          style={{ fontSize: "10px", padding: "2px 8px" }}
                        >
                          Add Row
                        </button>
                        <button
                          onClick={() => deleteRow(row.id)}
                          className="btn btn-danger btn-sm fw-bold"
                          style={{ fontSize: "10px", padding: "2px 8px" }}
                        >
                          Delete Row
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {/* TOTAL ROW */}
                <tr className="bg-light fw-bold">
                  <td colSpan="2" className="text-center py-3">
                    Total
                  </td>
                  <td className="text-center text-primary">Rp 0</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TOMBOL SIMPAN */}
          <div className="d-flex justify-content-end mt-4">
            <button
              className="btn btn-primary px-5 py-2 shadow-sm fw-bold"
              style={{ borderRadius: "8px" }}
            >
              Simpan Transaksi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
