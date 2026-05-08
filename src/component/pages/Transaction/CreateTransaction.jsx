import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
// import { blob, json } from "node:stream/consumers";

export default function CreateTransaction() {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // State untuk menampung data dari database
  const [customers, setCustomers] = useState([]);
  const [cars, setCars] = useState([]);

  // State KHUSUS untuk input pencarian Customer
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // handel foto drive
  const [fotoFile, setFotoFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [googleToken, setGoogleToken] = useState("");
  const DRIVE_FOLDER_ID =
    "https://drive.google.com/drive/folders/1KrzAbvNEro0gNVy91B8py58d1ZDg6Zg1?usp=drive_link";

  // State form utama
  const [formData, setFormData] = useState({
    waktu: "",
    waktu_pengembalian: "",
    customer_id: "", // Kita simpan ID-nya langsung
    nama_customer: "",
    rute: "",
    car_id: "",
    dp: "",
    sisa_pembayaran: "",
    total_pembayaran: "",
    keterangan: "",
    foto_mobil: "",
    video_mobil: "",
  });

  // --- AMBIL DATA DARI SUPABASE ---
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // 1. Ambil data pelanggan (Pakai select * agar aman dari beda nama kolom id)
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("*")
          .eq("status", "active");

        if (customerError) {
          console.error("Error muat customer:", customerError.message);
        } else {
          setCustomers(customerData || []);
        }

        // 2. Ambil data mobil
        const { data: carData, error: carError } = await supabase
          .from("cars")
          .select("*");

        if (carError) {
          console.error("Error muat mobil:", carError.message);
        } else {
          setCars(carData || []);
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error.message);
      }
    };

    fetchOptions();
  }, []);

  // --- FILTER NAMA CUSTOMER SECARA REAL-TIME ---
  const filteredCustomers = customers.filter((c) =>
    c.nama_pelanggan?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // handle drive
  const handleGoogleLogin = () => {
    // Cek apakah library google sudah ada di window
    if (!window.google || !window.google.accounts) {
      alert(
        "Library Google belum dimuat. Silakan refresh halaman atau tunggu sebentar.",
      );
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id:
          "792749158806-1len8ms3h3cq3v16h58qcj9befc8log9.apps.googleusercontent.com",
        scope: "https://www.googleapis.com/auth/drive.file",
        callback: (response) => {
          if (response.access_token) {
            setGoogleToken(response.access_token);
            console.log("Token berhasil didapat");
          }
        },
      });
      client.requestAccessToken();
    } catch (err) {
      console.error("Gagal inisialisasi Google Login:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "waktu") {
        const minReturn = getMinReturnDate();
        if (
          newData.waktu_pengembalian &&
          newData.waktu_pengembalian < minReturn
        ) {
          newData.waktu_pengembalian = "";
        }
      }
      return newData;
    });
  };

  // upload to drive
  const uploadToDrive = async (file, accessToken) => {
    if (!file) return null;

    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: [DRIVE_FOLDER_ID],
    };

    const formDataUpload = new formData();
    formDataUpload.append("file", file);
    formDataUpload.append(
      "metadata",
      new blob([JSON.stringify(metadata)], { type: "application/json" }),
    );

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
      {
        method: "POST",
        Headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      },
    );

    const result = await response.json();
    return result.webViewLink;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_id) {
      return;
      alert("Harap pilih Customer dari daftar Dropdown yang muncul!");
    }
    if (!googleToken) {
      return;
      alert("Silahkan login google dlu untuk upload file");
    }

    setIsSubmitting(true);
    try {
      let jumlah_hari = 0;
      if (formData.waktu && formData.waktu_pengembalian) {
        const start = new Date(formData.waktu);
        const end = new Date(formData.waktu_pengembalian);
        const diffTime = end - start;
        if (diffTime > 0) {
          jumlah_hari = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
      }
      const tglSewa = formData.waktu.split("T")[0];
      const linkFoto = await uploadToDrive(fotoFile, googleToken);
      const linkVideo = await uploadToDrive(videoFile, googleToken);
      const jamSewa = formData.waktu.split("T")[1] + ":00";
      const tglKembali = formData.waktu_pengembalian.split("T")[0];
      const jamKembali = formData.waktu_pengembalian.split("T")[1] + ":00";
      const { error } = await supabase.from("transactions").insert([
        {
          customer_id: formData.customer_id,
          car_id: formData.car_id,
          tanggal_sewa: tglSewa,
          jam_sewa: jamSewa,
          tanggal_pengembalian: tglKembali,
          jam_pengembalian: jamKembali,
          rute: formData.rute,
          jumlah_hari: jumlah_hari,
          dp: parseInt(formData.dp),
          sisa_pembayaran: parseInt(formData.sisa_pembayaran),
          total_pembayaran: parseInt(formData.total_pembayaran),
          keterangan: formData.keterangan || null,
          foto_mobil: formData.foto_mobil || null,
          video_mobil: formData.video_mobil || null,
          foto_mobil: linkFoto,
          video_mobil: linkVideo,
        },
      ]);
      if (error) throw error;
      setShowSuccessModal(true);
      setIsSubmitting(false);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/transaction");
      }, 2000);
    } catch (error) {
      console.error("Error inserting transaction:", error.message);
      alert("Gagal menyimpan transaksi: " + error.message);
      setIsSubmitting(false);
    }
  };
  const getMinReturnDate = () => {
    if (!formData.waktu) return "";
    const pickupDate = new Date(formData.waktu);
    pickupDate.setDate(pickupDate.getDate() + 1);
    const year = pickupDate.getFullYear();
    const month = String(pickupDate.getMonth() + 1).padStart(2, "0");
    const day = String(pickupDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}T00:00`;
  };

  return (
    <div className="h-100 bg-light d-flex flex-column">
      <div className="flex-grow-1 overflow-auto p-4">
        <div
          className="d-flex justify-content-between align-items-center mb-4 mx-auto"
          style={{ maxWidth: "1000px" }}
        >
          <div>
            <h4 className="fw-bold text-dark mb-1">Transaksi Baru</h4>
            <p className="text-muted small mb-0">
              Lengkapi formulir di bawah ini untuk menambahkan penyewaan armada.
            </p>
          </div>
          <Link
            to="/transaction"
            className="btn btn-outline-secondary shadow-sm px-3"
          >
            <i className="fas fa-arrow-left me-2"></i>Kembali
          </Link>
        </div>

        <div
          className="card shadow-sm border-0 rounded-3 mb-5 mx-auto"
          style={{ maxWidth: "1000px" }}
        >
          <div className="card-body p-4 p-lg-5">
            <form onSubmit={handleSubmit}>
              <h6 className="fw-bold text-primary mb-3">
                Informasi Peminjaman
              </h6>
              <div className="row g-4 mb-5">
                <div className="col-md-6">
                  {/* --- CUSTOM SEARCHABLE DROPDOWN UNTUK CUSTOMER --- */}
                  <div className="mb-3 position-relative">
                    <label className="form-label text-secondary small fw-bold">
                      Nama Customer (Cari / Pilih)
                    </label>

                    {/* Bungkus input dan tombol X dalam div relative */}
                    <div className="position-relative">
                      <input
                        type="text"
                        className="form-control bg-light border-0 py-2 pe-5" // pe-5 memberi ruang di kanan agar teks tidak tertimpa tombol X
                        placeholder="Ketik nama customer..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setShowDropdown(true);
                          // Reset ID jika user mengubah ketikan
                          setFormData((prev) => ({
                            ...prev,
                            customer_id: "",
                            nama_customer: "",
                          }));
                        }}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setShowDropdown(false)}
                        required={!formData.customer_id}
                      />

                      {/* Tombol X (Clear Input) yang muncul hanya jika ada isinya */}
                      {searchTerm && (
                        <button
                          type="button"
                          className="btn position-absolute top-50 end-0 translate-middle-y text-muted border-0 bg-transparent"
                          style={{ zIndex: 10 }}
                          onMouseDown={(e) => {
                            e.preventDefault(); // Mencegah input kehilangan fokus
                            setSearchTerm("");
                            setFormData((prev) => ({
                              ...prev,
                              customer_id: "",
                              nama_customer: "",
                            }));
                            setShowDropdown(true); // Langsung buka dropdown lagi setelah dihapus
                          }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>

                    {/* Menu Dropdown yang melayang */}
                    {showDropdown && (
                      <ul
                        className="dropdown-menu show w-100 shadow border-0 mt-1"
                        style={{
                          maxHeight: "200px",
                          overflowY: "auto",
                          position: "absolute",
                          zIndex: 1000,
                        }}
                      >
                        {filteredCustomers.length > 0 ? (
                          filteredCustomers.map((cust) => (
                            <li key={cust.id || cust.customer_id}>
                              <button
                                type="button"
                                className="dropdown-item py-2"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setSearchTerm(cust.nama_pelanggan);
                                  setFormData((prev) => ({
                                    ...prev,
                                    customer_id: cust.id || cust.customer_id,
                                    nama_customer: cust.nama_pelanggan,
                                  }));
                                  setShowDropdown(false);
                                }}
                              >
                                {cust.nama_pelanggan}
                              </button>
                            </li>
                          ))
                        ) : (
                          <li>
                            <span className="dropdown-item text-muted disabled">
                              Pelanggan tidak ditemukan
                            </span>
                          </li>
                        )}
                      </ul>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Rute Perjalanan
                    </label>
                    <select
                      name="rute"
                      onChange={handleChange}
                      className="form-select bg-light border-0 py-2"
                      required
                    >
                      <option value="">-- Pilih Rute --</option>
                      <option value="DALKOT">Dalam Kota</option>
                      <option value="LURKOT">Luar Kota</option>
                      <option value="DALKOT & LURKOT">
                        Dalam Kota & Luar Kota
                      </option>
                    </select>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Jadwal Ambil
                    </label>
                    <input
                      type="datetime-local"
                      name="waktu"
                      onChange={handleChange}
                      className="form-control bg-light border-0 py-2"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Jadwal Kembali
                    </label>
                    <input
                      type="datetime-local"
                      name="waktu_pengembalian"
                      value={formData.waktu_pengembalian}
                      onChange={handleChange}
                      // Batasi minimal H+1 dari waktu ambil
                      min={getMinReturnDate()}
                      // Kunci input jika jadwal ambil belum diisi
                      disabled={!formData.waktu}
                      className="form-control bg-light border-0 py-2"
                      required
                    />
                    {!formData.waktu ? (
                      <small
                        className="text-danger"
                        style={{ fontSize: "10px" }}
                      >
                        *Isi jadwal ambil terlebih dahulu
                      </small>
                    ) : (
                      <small
                        className="text-muted"
                        style={{ fontSize: "10px" }}
                      >
                        *Minimal pengembalian adalah H+1 dari jadwal ambil.
                      </small>
                    )}
                  </div>
                </div>
              </div>
              <h6 className="fw-bold text-primary mb-3">
                Data Kendaraan Terpilih
              </h6>
              <div className="row g-4 mb-5">
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Mobil (Plat Nomor)
                    </label>
                    <select
                      name="car_id"
                      onChange={handleChange}
                      className="form-select bg-light border-0 py-2"
                      required
                    >
                      <option value="">
                        -- Pilih Kendaraan yang Disewa --
                      </option>
                      {cars.map((car) => (
                        <option key={car.cars_id} value={car.cars_id}>
                          {car.jenis_unit} ({car.nomor_plat})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <h6 className="fw-bold text-success mb-3">Rincian Pembayaran</h6>
              <div className="row g-4 mb-5">
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Total Pembayaran
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0 text-muted">
                        Rp
                      </span>
                      <input
                        type="number"
                        name="total_pembayaran"
                        onChange={handleChange}
                        className="form-control bg-light border-0 py-2"
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Uang Muka (DP)
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0 text-muted">
                        Rp
                      </span>
                      <input
                        type="number"
                        name="dp"
                        onChange={handleChange}
                        className="form-control bg-light border-0 py-2"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Sisa Pembayaran
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0 text-muted">
                        Rp
                      </span>
                      <input
                        type="number"
                        name="sisa_pembayaran"
                        onChange={handleChange}
                        className="form-control bg-light border-0 py-2"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <h6 className="fw-bold text-success mb-3">
                Dokumentasi & Keterangan
              </h6>
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  {/* Tombol Login Google jika belum ada token */}
                  {!googleToken && (
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="btn btn-outline-danger mb-3 btn-sm"
                    >
                      1. Klik Login Google untuk Aktifkan Upload
                    </button>
                  )}

                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Foto Kendaraan
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setFotoFile(e.target.files[0])}
                      className="form-control bg-light border-0 py-2"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Video Kendaraan
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setVideoFile(e.target.files[0])}
                      className="form-control bg-light border-0 py-2"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3 h-100">
                    <label className="form-label text-secondary small fw-bold">
                      Keterangan Tambahan
                    </label>
                    <textarea
                      name="keterangan"
                      onChange={handleChange}
                      className="form-control bg-light border-0"
                      rows="4"
                      placeholder="Masukkan catatan khusus jika ada..."
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-end gap-3 mt-5 border-top pt-4">
                <Link
                  to="/transaction"
                  className="btn px-5 py-2 fw-bold text-white shadow-sm"
                  style={{
                    backgroundColor: "#ff9a90",
                    border: "none",
                    borderRadius: "12px",
                  }}
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn px-5 py-2 fw-bold text-white shadow-sm"
                  style={{
                    backgroundColor: "#0cc2aa",
                    border: "none",
                    borderRadius: "12px",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Transaksi"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {showSuccessModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(5px)",
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: "16px" }}
            >
              <div className="modal-body p-4 text-center">
                <div
                  className="mx-auto mb-4 d-flex align-items-center justify-content-center bg-success-subtle text-success"
                  style={{ width: "64px", height: "64px", borderRadius: "50%" }}
                >
                  <i className="fas fa-check fs-2"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">
                  Berhasil Ditambahkan!
                </h5>
                <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                  Transaksi untuk{" "}
                  <span className="fw-bold text-dark">
                    {formData.nama_customer || "Customer"}
                  </span>{" "}
                  berhasil dibuat.
                </p>
                <div className="d-flex align-items-center justify-content-center text-muted small">
                  <div
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    style={{ width: "12px", height: "12px" }}
                  ></div>
                  Mengalihkan...
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
