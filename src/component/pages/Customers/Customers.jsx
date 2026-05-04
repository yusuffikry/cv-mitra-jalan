import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Customers() {
  const [currentPage, setCurrentPage] = useState(1);

  // Data dummy untuk simulasi dengan tambahan atribut total_rental
  const customers = [
    {
      id: 1,
      name: "Andi Herlambang",
      nik: "73710123456789",
      contact: "08123456789",
      city: "Makassar",
      rental_city: "Maros",
      total_rental: 5, // Tambahan atribut
      status: "Aktif",
    },
    {
      id: 2,
      name: "Budi Santoso",
      nik: "73710987654321",
      contact: "08567890123",
      city: "Gowa",
      rental_city: "Makassar",
      total_rental: 2, // Tambahan atribut
      status: "Tidak Aktif",
    },
  ];

  // Fungsi untuk menangani penghapusan data
  const handleDelete = (id, name) => {
    // Menampilkan jendela konfirmasi bawaan browser
    const isConfirmed = window.confirm(`Apakah Anda yakin ingin menghapus pelanggan "${name}"?`);
    
    if (isConfirmed) {
      // Jika user klik "OK", jalankan logika hapus data di sini
      console.log(`Menghapus data pelanggan dengan ID: ${id}`);
      alert(`Data pelanggan "${name}" berhasil dihapus!`);
      
      // Catatan: Pada aplikasi nyata, kamu akan memanggil API DELETE di sini:
      // fetch(`/api/customers/${id}`, { method: 'DELETE' })
      //   .then(() => {
      //      // Update state data lokal agar barisnya hilang dari tabel
      //   })
    } else {
      // Jika user klik "Cancel", batalkan penghapusan
      console.log("Penghapusan dibatalkan.");
    }
  };

  // Fungsi untuk mengekspor data ke file CSV
  const exportToCSV = () => {
    // 1. Buat Header Kolom sesuai dengan tabel Customers
    const headers = [
      "No",
      "Nama Pelanggan",
      "ID Pelanggan",
      "NIK",
      "Kontak",
      "Domisili",
      "Kota Rental",
      "Total Rental", // Tambahan Header
      "Status",
    ];

    // 2. Map data ke dalam bentuk baris (array of strings)
    const rows = customers.map((cust, index) => {
      const customerIdStr = `CUST-${cust.id.toString().padStart(3, "0")}`;
      
      return [
        index + 1,
        `"${cust.name}"`, 
        customerIdStr,
        `'${cust.nik}`, 
        `'${cust.contact}`, 
        `"${cust.city}"`,
        `"${cust.rental_city}"`,
        cust.total_rental, // Tambahan data di baris CSV
        cust.status,
      ];
    });

    // 3. Gabungkan Header dan Baris menggunakan koma dan enter (\n)
    const csvContent = [
      headers.join(","), 
      ...rows.map((row) => row.join(",")), 
    ].join("\n");

    // 4. Buat Blob dan tautan (link) untuk proses download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Data_Pelanggan.csv"); 
    document.body.appendChild(link);
    link.click();

    // Bersihkan memori setelah download
    document.body.removeChild(link);
  };

  return (
    <div className="d-flex flex-column h-100 bg-light">
      {/* Search & Action Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-4 flex-shrink-0">
        <div className="position-relative w-100" style={{ maxWidth: "350px" }}>
          <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
            <i className="fas fa-search small"></i>
          </span>
          <input
            type="text"
            className="form-control ps-5 border-0 shadow-sm"
            placeholder="Cari nama atau NIK pelanggan..."
            style={{ borderRadius: "8px" }}
          />
        </div>

        {/* Grup Tombol Aksi */}
        <div className="d-flex gap-2">
          {/* Tombol Export CSV */}
          <button
            onClick={exportToCSV}
            className="btn btn-outline-success px-3 d-flex align-items-center shadow-sm bg-white"
            title="Export data ke Excel/CSV"
          >
            <i className="fas fa-file-excel me-2"></i>
            <span className="ms-2">Export CSV</span>
          </button>

          <Link
            to="/customers/create"
            className="btn btn-success px-4 d-flex align-items-center shadow-sm"
          >
            <i className="fas fa-plus-circle me-2"></i>
            <span className="ms-2">Tambah Pelanggan</span>
          </Link>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="card border-0 shadow-sm flex-grow-1 overflow-hidden d-flex flex-column rounded-3">
        {/* Table Body - Scrollable Area */}
        <div className="card-body p-0 flex-grow-1 overflow-auto bg-white">
          <table
            className="table table-hover align-middle mb-0 text-nowrap"
            style={{ fontSize: "0.85rem" }}
          >
            <thead className="sticky-top bg-white" style={{ zIndex: 10 }}>
              <tr className="border-bottom">
                <th className="px-4 py-3 text-secondary fw-bold text-uppercase" style={{ fontSize: "0.75rem", width: "60px" }}>
                  NO
                </th>
                <th className="py-3 text-secondary fw-bold text-uppercase" style={{ fontSize: "0.75rem" }}>
                  Nama Pelanggan
                </th>
                <th className="py-3 text-secondary fw-bold text-uppercase" style={{ fontSize: "0.75rem" }}>
                  NIK
                </th>
                <th className="py-3 text-secondary fw-bold text-uppercase" style={{ fontSize: "0.75rem" }}>
                  Kontak
                </th>
                <th className="py-3 text-secondary fw-bold text-uppercase" style={{ fontSize: "0.75rem" }}>
                  Domisili
                </th>
                <th className="py-3 text-secondary fw-bold text-uppercase" style={{ fontSize: "0.75rem" }}>
                  Kota Rental
                </th>
                <th className="py-3 text-center text-secondary fw-bold text-uppercase" style={{ fontSize: "0.75rem" }}>
                  Total Rental
                </th>
                <th className="py-3 text-secondary fw-bold text-uppercase" style={{ fontSize: "0.75rem" }}>
                  Status
                </th>
                <th className="py-3 text-center text-secondary fw-bold text-uppercase" style={{ fontSize: "0.75rem" }}>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((cust, index) => (
                <tr key={cust.id} className="border-bottom-0">
                  <td className="px-4 text-muted">{index + 1}</td>
                  <td>
                    <div className="fw-bold text-dark">{cust.name}</div>
                    <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                      ID: CUST-{cust.id.toString().padStart(3, "0")}
                    </div>
                  </td>
                  <td>
                    <span className="text-secondary">{cust.nik}</span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center text-primary">
                      <i className="fab fa-whatsapp me-2"></i>
                      {cust.contact}
                    </div>
                  </td>
                  <td>{cust.city}</td>
                  <td>{cust.rental_city}</td>
                  
                  <td className="text-center">
                    <span className="badge bg-light text-dark border px-2 py-1">
                      {cust.total_rental} Kali
                    </span>
                  </td>

                  <td>
                    <span 
                      className={`badge rounded-pill px-3 py-2 border ${
                        cust.status === "Aktif" 
                          ? "bg-success-subtle text-success border-success-subtle" 
                          : "bg-secondary-subtle text-secondary border-secondary-subtle"
                      }`}
                    >
                      <i
                        className="fas fa-circle me-2"
                        style={{ fontSize: "6px" }}
                      ></i>
                      {cust.status}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="btn-group">
                      <Link 
                        to={`/customers/edit/${cust.id}`} 
                        className="btn btn-sm btn-light border-0 text-primary px-3 shadow-none" 
                        title="Edit"
                      >
                        <i className="fas fa-edit"></i>
                      </Link>
                      {/* Tombol Hapus dengan event onClick memanggil fungsi handleDelete */}
                      <button
                        onClick={() => handleDelete(cust.id, cust.name)}
                        className="btn btn-sm btn-light border-0 text-danger px-3 shadow-none"
                        title="Hapus"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card Footer - Locked at Bottom */}
        <div className="card-footer bg-white border-top py-3 px-4 flex-shrink-0">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              Menampilkan <span className="fw-bold text-dark">1</span> dari{" "}
              <span className="fw-bold text-dark">{customers.length}</span> entri pelanggan
            </div>

            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className="page-item disabled">
                  <span className="page-link border-0 bg-transparent">
                    Prev
                  </span>
                </li>
                <li className="page-item active">
                  <span
                    className="page-link border-0 rounded shadow-sm mx-1"
                    style={{ backgroundColor: "#0d6efd" }}
                  >
                    1
                  </span>
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