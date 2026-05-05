import React, { useState } from "react";
import { Link } from "react-router-dom";
import ShowTransaction from "./ShowTransaction";

export default function MainTransaction() {
  const [selectedData, setSelectedData] = useState(null);

  // Data dummy diperbarui dengan atribut lengkap
  const transactions = [
    {
      id: "TRX-001",
      waktu: "17 Oktober 2025 13:00",
      mobil: "DD 2020 RR",
      merek: "Toyota",
      tipe_unit: "Avanza G",
      transmisi: "MANUAL",
      nama_customer: "Andi Herlambang",
      rute: "DALAM KOTA",
      jumlah_hari: 3,
      dp: "200.000",
      sisa_pembayaran: "700.000",
      total_pembayaran: "900.000",
      keterangan: "Lunas. Diambil di bandara.",
      dibuat: "12 Okt 2025",
      foto_mobil: "https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?q=80&w=2070&auto=format&fit=crop", // Dummy image
      video_mobil: "", // Kosong sebagai simulasi jika tidak ada video
    },
    {
      id: "TRX-002",
      waktu: "20 Oktober 2025 08:00",
      mobil: "B 1234 ABC",
      merek: "Honda",
      tipe_unit: "HR-V",
      transmisi: "OTOMATIS",
      nama_customer: "Budi Santoso",
      rute: "LUAR KOTA",
      jumlah_hari: 5,
      dp: "0",
      sisa_pembayaran: "2.500.000",
      total_pembayaran: "2.500.000",
      keterangan: "Belum lunas. Sewa lepas kunci.",
      dibuat: "15 Okt 2025",
      foto_mobil: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop",
      video_mobil: "https://www.w3schools.com/html/mov_bbb.mp4", // Dummy video
    }
  ];

  // Fungsi memunculkan detail
  const handleViewDetails = (data) => {
    setSelectedData(data);
  };

  // Fungsi hapus
  const handleDelete = (id, customer) => {
    const isConfirmed = window.confirm(`Apakah Anda yakin ingin menghapus transaksi milik ${customer} (${id})?`);
    if (isConfirmed) {
      console.log(`Menghapus transaksi ID: ${id}`);
      alert(`Data transaksi ${id} berhasil dihapus!`);
      // Panggil API Delete disini
    }
  };

  // === Fungsi Export CSV ===
  const exportToCSV = () => {
    // 1. Buat Header Kolom
    const headers = [
      "No",
      "ID Transaksi",
      "Dibuat Pada",
      "Waktu Peminjaman",
      "Nama Customer",
      "Merek Mobil",
      "Tipe Unit",
      "Plat Nomor",
      "Transmisi",
      "Rute",
      "Jumlah Hari",
      "DP (Rp)",
      "Sisa Pembayaran (Rp)",
      "Total Pembayaran (Rp)",
      "Keterangan",
    ];

    // 2. Map data ke dalam bentuk baris (array of strings)
    const rows = transactions.map((trx, index) => {
      return [
        index + 1,
        trx.id,
        `"${trx.dibuat}"`, // Hindari masalah delimiter jika ada koma di tanggal
        `"${trx.waktu}"`,
        `"${trx.nama_customer}"`,
        trx.merek,
        trx.tipe_unit,
        trx.mobil,
        trx.transmisi,
        trx.rute,
        trx.jumlah_hari,
        `"${trx.dp}"`, // Dibungkus karena ada titik separator ribuan
        `"${trx.sisa_pembayaran}"`,
        `"${trx.total_pembayaran}"`,
        `"${trx.keterangan}"`, // Dibungkus karena rentan mengandung koma dari input user
      ];
    });

    // 3. Gabungkan Header dan Baris menggunakan koma dan enter (\n)
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // 4. Buat Blob dan proses download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Data_Transaksi_Rental.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render halaman Detail jika ada baris yang dipilih
  if (selectedData) {
    return (
      <ShowTransaction
        data={selectedData}
        onBack={() => setSelectedData(null)}
      />
    );
  }

  return (
    <div className="d-flex flex-column h-100 bg-light overflow-hidden">
      <div className="p-4 flex-grow-1 d-flex flex-column overflow-hidden">
        
        {/* Tombol Aksi (Export dan Tambah) */}
        <div className="d-flex justify-content-end gap-2 mb-3 flex-shrink-0">
          <button
            onClick={exportToCSV}
            className="btn btn-outline-success px-4 py-2 shadow-sm bg-white d-flex align-items-center"
            title="Export data ke Excel/CSV"
            style={{ borderRadius: "12px" }}
          >
            <i className="fas fa-file-excel me-2"></i>Export CSV
          </button>
          
          <Link
            to="/transaction/create"
            className="btn text-white px-4 py-2 shadow-sm d-flex align-items-center"
            style={{ backgroundColor: "#0cc2aa", borderRadius: "12px" }}
          >
            <i className="fas fa-plus me-2"></i>Tambah
          </Link>
        </div>
        
        <div
          className="card border-0 shadow-sm flex-grow-1 d-flex flex-column overflow-hidden"
          style={{ borderRadius: "15px" }}
        >
          {/* Filter Bar */}
          <div className="card-header bg-white py-4 border-0 flex-shrink-0">
            <div className="row g-3">
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control shadow-none"
                  placeholder="Cari Plat Mobil..."
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control text-muted shadow-none"
                  placeholder="Cari Customer..."
                />
              </div>
              <div className="col-md-3">
                <input
                  type="date"
                  className="form-control text-muted shadow-none"
                />
              </div>
            </div>
          </div>

          {/* Area Tabel */}
          <div className="card-body p-0 flex-grow-1 overflow-auto">
            <table
              className="table table-hover align-middle mb-0 text-center text-nowrap"
              style={{ fontSize: "0.85rem" }}
            >
              <thead className="sticky-top" style={{ zIndex: 10 }}>
                <tr style={{ backgroundColor: "#d9d9d9" }}>
                  <th className="py-3 text-secondary fw-bold border-bottom-0">NO</th>
                  <th className="py-3 text-secondary fw-bold border-bottom-0">WAKTU PEMINJAMAN</th>
                  <th className="py-3 text-secondary fw-bold border-bottom-0">MOBIL/PLAT</th>
                  {/* Kolom Customer dan Rute dipisah */}
                  <th className="py-3 text-secondary fw-bold border-bottom-0">NAMA CUSTOMER</th>
                  <th className="py-3 text-secondary fw-bold border-bottom-0">RUTE</th>
                  <th className="py-3 text-secondary fw-bold border-bottom-0">KETERANGAN</th>
                  <th className="py-3 text-secondary fw-bold border-bottom-0">TOTAL PEMBAYARAN</th>
                  {/* Kolom Dibuat Pada dihilangkan dari tabel utama */}
                  <th className="py-3 text-secondary fw-bold border-bottom-0">AKSI</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {transactions.map((item, index) => (
                  <tr key={index} className="border-bottom">
                    <td className="text-muted py-3">{index + 1}</td>
                    <td>{item.waktu}</td>
                    <td className="fw-bold text-danger">{item.mobil}</td>
                    
                    {/* Tambahan Kolom Customer */}
                    <td className="fw-bold text-primary">{item.nama_customer}</td>
                    
                    <td>
                      <span
                        className="badge px-3 py-2 text-white"
                        style={{ backgroundColor: "#0cc2aa", borderRadius: "6px" }}
                      >
                        {item.rute}
                      </span>
                    </td>
                    <td className="text-wrap" style={{ maxWidth: "150px" }}>{item.keterangan}</td>
                    <td className="fw-bold text-success">Rp {item.total_pembayaran}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-1">
                        {/* Tombol Detail (dulu tombol copy) */}
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="btn btn-sm p-1 shadow-sm d-flex align-items-center justify-content-center"
                          title="Lihat Detail Transaksi"
                          style={{
                            backgroundColor: "#0cc2aa",
                            color: "white",
                            borderRadius: "4px",
                            width: "28px",
                            height: "28px"
                          }}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        {/* TOMBOL EDIT */}
                        <Link
                          to={`/transaction/edit/${item.id}`}
                          className="btn btn-sm p-1 shadow-sm d-flex align-items-center justify-content-center"
                          title="Edit Transaksi"
                          style={{ backgroundColor: "#ffb366", color: "white", borderRadius: "4px", width: "28px", height: "28px" }}
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id, item.nama_customer)}
                          className="btn btn-sm p-1 shadow-sm d-flex align-items-center justify-content-center"
                          title="Hapus Transaksi"
                          style={{ backgroundColor: "#ff4d4d", color: "white", borderRadius: "4px", width: "28px", height: "28px" }}
                        >
                          <i className="fas fa-trash"></i>
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
                Showing 1 to {transactions.length} of {transactions.length} entries
              </span>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className="page-item disabled">
                    <span className="page-link border-0 text-muted">Previous</span>
                  </li>
                  <li className="page-item active">
                    <span className="page-link border-0 shadow-sm mx-1 rounded" style={{ backgroundColor: "#5493ff" }}>
                      1
                    </span>
                  </li>
                  <li className="page-item">
                    <span className="page-link border-0 text-primary">Next</span>
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