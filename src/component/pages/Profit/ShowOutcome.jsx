import React, { useState } from "react";

export default function ShowOutcome() {
  // Data dummy - Ini nantinya akan diisi dari database (Supabase/API)
  const [reportInfo] = useState({
    nomor_referensi: "OUT-2026-001",
    tanggal_laporan: "08 Mei 2026",
    admin: "Muhammad Fahri",
    periode: "April 2026",
  });

  const [outcomes] = useState([
    {
      id: 1,
      tanggal: "02 April 2026",
      jenis: "BBM",
      keterangan: "Pertamax Turbo - Pajero CR001",
      total: "500.000",
    },
    {
      id: 2,
      tanggal: "10 April 2026",
      jenis: "Service",
      keterangan: "Ganti Oli & Filter - Avanza DD 2020 RR",
      total: "1.200.000",
    },
    {
      id: 3,
      tanggal: "15 April 2026",
      jenis: "Lain-lain",
      keterangan: "Cuci Mobil All Unit",
      total: "350.000",
    },
  ]);

  const handlePrint = () => {
    window.print();
  };

  const calculateTotal = () => {
    return outcomes.reduce(
      (acc, item) => acc + parseInt(item.total.replace(/\./g, "")),
      0,
    );
  };

  return (
    <div className="container-fluid bg-light min-vh-100 p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 d-print-none">
        <h4 className="fw-bold text-dark m-0">Detail Laporan Pengeluaran</h4>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary bg-white shadow-sm"
            onClick={() => window.history.back()}
          >
            <i className="fas fa-arrow-left me-2"></i>Kembali
          </button>
        </div>
      </div>

      {/* KERTAS DOKUMEN */}
      <div
        className="card border-0 shadow-sm mx-auto"
        style={{ maxWidth: "1000px", borderRadius: "0px" }}
      >
        <div className="card-body p-5">
          {/* KOP LAPORAN */}
          <div className="row mb-5 align-items-center">
            <div className="col-7">
              <h2 className="fw-bold text-uppercase m-0">Rekap Pengeluaran</h2>
              <p className="text-muted m-0">
                CV MITRA JALAN - Operasional Kendaraan
              </p>
            </div>
            <div className="col-5 text-end">
              <div className="p-3 bg-light border-start border-4 border-info">
                <p className="small mb-1 text-secondary text-uppercase fw-bold">
                  Nomor Referensi
                </p>
                <p className="fw-bold m-0 text-primary">
                  {reportInfo.nomor_referensi}
                </p>
              </div>
            </div>
          </div>

          {/* DETAIL INFO */}
          <div className="row mb-4">
            <div className="col-4">
              <label className="text-secondary small fw-bold">PERIODE</label>
              <p className="fw-bold">{reportInfo.periode}</p>
            </div>
            <div className="col-4 text-center">
              <label className="text-secondary small fw-bold">
                TANGGAL CETAK
              </label>
              <p className="fw-bold">{reportInfo.tanggal_laporan}</p>
            </div>
            <div className="col-4 text-end">
              <label className="text-secondary small fw-bold">
                DICATAT OLEH
              </label>
              <p className="fw-bold">{reportInfo.admin}</p>
            </div>
          </div>

          {/* TABEL DATA (Field Sesuai Request) */}
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead style={{ backgroundColor: "#e2e2e2" }}>
                <tr className="text-center text-secondary">
                  <th className="py-3 fw-bold" style={{ width: "50px" }}>
                    No.
                  </th>
                  <th className="py-3 fw-bold">Tanggal Pengeluaran</th>
                  <th className="py-3 fw-bold">Jenis Pengeluaran</th>
                  <th className="py-3 fw-bold">Keterangan</th>
                  <th className="py-3 fw-bold">Total Pengeluaran</th>
                </tr>
              </thead>
              <tbody>
                {outcomes.map((item, index) => (
                  <tr key={item.id}>
                    <td className="text-center">{index + 1}</td>
                    <td className="text-center">{item.tanggal}</td>
                    <td className="fw-bold">{item.jenis}</td>
                    <td className="text-muted">{item.keterangan}</td>
                    <td className="text-end fw-bold">Rp {item.total}</td>
                  </tr>
                ))}
                {/* FOOTER TOTAL */}
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <td colSpan="4" className="text-end py-3 fw-bold uppercase">
                    Grand Total Pengeluaran
                  </td>
                  <td
                    className="text-end py-3 fw-bold text-danger"
                    style={{ fontSize: "1.2rem" }}
                  >
                    Rp {calculateTotal().toLocaleString("id-ID")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* AREA TANDA TANGAN */}
          <div className="row mt-5 pt-5">
            <div className="col-4 text-center">
              <p className="mb-5">Disetujui Oleh,</p>
              <div style={{ height: "60px" }}></div>
              <p className="fw-bold border-top d-inline-block px-4">
                Manager Operasional
              </p>
            </div>
            <div className="col-4"></div>
            <div className="col-4 text-center">
              <p className="mb-5">Makassar, {reportInfo.tanggal_laporan}</p>
              <div style={{ height: "60px" }}></div>
              <p className="fw-bold border-top d-inline-block px-4">
                Administrasi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS PRINT */}
      <style>
        {`
          @media print {
            @page { size: A4; margin: 20mm; }
            body { background-color: white !important; }
            .container-fluid { padding: 0 !important; }
            .card { border: none !important; }
            .d-print-none { display: none !important; }
            .table thead { background-color: #e2e2e2 !important; -webkit-print-color-adjust: exact; }
          }
        `}
      </style>
    </div>
  );
}
