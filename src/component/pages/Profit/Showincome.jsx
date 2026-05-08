import React, { useState } from "react";

export default function ShowIncome() {
  // Data dummy - Nantinya ini diambil dari Supabase berdasarkan ID atau Plat
  const [reportData] = useState({
    jenis_mobil: "Pajero Sport",
    nomor_plat: "CR001",
    merek: "Mitsubishi",
    nomor_gps: "GPS-99210",
    transmisi: "Automatic",
    periode: "April 2026",
    total_pemasukan: "20.000.000",
    total_jalan: 11,
  });

  const [details] = useState([
    {
      id: 1,
      tanggal: "Senin, 06 April 2026",
      nominal: "2.000.000",
      keterangan: "Sewa Harian",
    },
    {
      id: 2,
      tanggal: "Rabu, 08 April 2026",
      nominal: "5.500.000",
      keterangan: "Sewa 3 Hari",
    },
    {
      id: 3,
      tanggal: "Minggu, 12 April 2026",
      nominal: "2.000.000",
      keterangan: "Sewa Harian",
    },
  ]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container-fluid bg-light min-vh-100 p-4">
      {/* HEADER AKSI (Tidak muncul saat di-print) */}
      <div className="d-flex justify-content-between align-items-center mb-4 d-print-none">
        <h4 className="fw-bold text-dark m-0">Detail Pemasukan Unit</h4>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary bg-white shadow-sm"
            onClick={() => window.history.back()}
          >
            <i className="fas fa-arrow-left me-2"></i>Kembali
          </button>
        </div>
      </div>

      {/* AREA DOKUMEN LAPORAN */}
      <div
        className="card border-0 shadow-sm mx-auto"
        style={{
          maxWidth: "900px",
          borderRadius: "0px",
          borderTop: "5px solid #0cc2aa !important",
        }}
      >
        <div className="card-body p-5">
          {/* KOP SURAT / JUDUL DOKUMEN */}
          <div className="text-center mb-5">
            <h3 className="fw-bold text-uppercase mb-1">
              Laporan Pemasukan Kendaraan
            </h3>
            <p className="text-muted">Periode: {reportData.periode}</p>
            <hr />
          </div>

          {/* INFORMASI UNIT (Layout seperti Gambar Data Kendaraan) */}
          <div className="row g-4 mb-5">
            <div className="col-6">
              <div className="mb-3">
                <label className="text-secondary small fw-bold text-uppercase">
                  Merek / Jenis
                </label>
                <p className="fs-5 fw-bold border-bottom pb-1">
                  {reportData.merek} - {reportData.jenis_mobil}
                </p>
              </div>
              <div className="mb-3">
                <label className="text-secondary small fw-bold text-uppercase">
                  Nomor Plat
                </label>
                <p className="fs-5 fw-bold text-primary border-bottom pb-1">
                  {reportData.nomor_plat}
                </p>
              </div>
            </div>
            <div className="col-6">
              <div className="mb-3">
                <label className="text-secondary small fw-bold text-uppercase">
                  Nomor GPS
                </label>
                <p className="fs-5 fw-bold border-bottom pb-1">
                  {reportData.nomor_gps}
                </p>
              </div>
              <div className="mb-3">
                <label className="text-secondary small fw-bold text-uppercase">
                  Transmisi
                </label>
                <p className="fs-5 fw-bold border-bottom pb-1">
                  {reportData.transmisi}
                </p>
              </div>
            </div>
          </div>

          {/* TABEL DETAIL (Header Sesuai Permintaan) */}
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead style={{ backgroundColor: "#e2e2e2" }}>
                <tr className="text-center">
                  <th
                    className="py-3 text-secondary fw-bold small"
                    style={{ width: "50px" }}
                  >
                    No.
                  </th>
                  <th className="py-3 text-secondary fw-bold small">
                    Hari/ Tanggal
                  </th>
                  <th className="py-3 text-secondary fw-bold small">
                    Keterangan
                  </th>
                  <th className="py-3 text-secondary fw-bold small">
                    Pemasukan (Rp)
                  </th>
                </tr>
              </thead>
              <tbody>
                {details.map((item, index) => (
                  <tr key={item.id}>
                    <td className="text-center">{index + 1}</td>
                    <td>{item.tanggal}</td>
                    <td>{item.keterangan}</td>
                    <td className="text-end fw-bold">Rp {item.nominal}</td>
                  </tr>
                ))}
                {/* RINGKASAN BAWAH */}
                <tr className="bg-light">
                  <td colSpan="3" className="text-end fw-bold py-3">
                    TOTAL PEMASUKAN
                  </td>
                  <td
                    className="text-end fw-bold text-success py-3"
                    style={{ fontSize: "1.1rem" }}
                  >
                    Rp {reportData.total_pemasukan}
                  </td>
                </tr>
                <tr className="bg-light">
                  <td colSpan="3" className="text-end fw-bold py-3">
                    TOTAL JALAN
                  </td>
                  <td className="text-end fw-bold py-3">
                    {reportData.total_jalan} Kali
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TANDA TANGAN (Hanya muncul di dokumen/print) */}
          <div className="row mt-5 pt-4 text-center">
            <div className="col-8"></div>
            <div className="col-4">
              <p className="mb-5">
                Makassar,{" "}
                {new Date().toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <br />
              <p className="fw-bold border-top d-inline-block px-4">
                Admin Operasional
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS KHUSUS PRINT */}
      <style>
        {`
          @media print {
            body { background-color: white !important; }
            .container-fluid { padding: 0 !important; }
            .card { shadow: none !important; border: none !important; }
            .btn { display: none !important; }
          }
        `}
      </style>
    </div>
  );
}
