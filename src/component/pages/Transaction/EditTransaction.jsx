import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../supabaseClient";

export default function EditTransaction() {
  const navigate = useNavigate();
  const { id } = useParams(); // Mengambil ID dari URL

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // State untuk menampung data dari database
  const [customers, setCustomers] = useState([]);
  const [cars, setCars] = useState([]);

  // State KHUSUS untuk input pencarian Customer
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // State KHUSUS untuk input pencarian Mobil
  const [searchCarTerm, setSearchCarTerm] = useState("");
  const [showCarDropdown, setShowCarDropdown] = useState(false);

  // handle file drive
  const [fotoFile, setFotoFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [googleToken, setGoogleToken] = useState("");

  // ID Folder Drive untuk Foto dan Video
  const DRIVE_PHOTO_FOLDER_ID = "1BBNYFg2TWx_-OOWUdL4HtmmMmILInWqI";
  const DRIVE_VIDEO_FOLDER_ID = "1hG4Vsh9C-bl8dWKVcgY7OkmnrgWr3aLM";

  // State form utama
  const [formData, setFormData] = useState({
    waktu: "",
    waktu_pengembalian: "",
    customer_id: "",
    nama_customer: "",
    kontak: "",
    nik: "",
    alamat: "",
    domisili: "",
    rute: "", // Input Manual
    car_id: "", // Kosong jika mobil diketik manual
    mobil_plat: "", // Input manual plat/unit
    merek: "",
    tipe_unit: "",
    transmisi: "",
    dp: "",
    total_pembayaran: "",
    keterangan: "",
    foto_mobil: "",
    video_mobil: "",
  });

  // --- FUNGSI FORMAT INPUT UANG ---
  const formatRupiahInput = (value) => {
    if (!value) return "";
    const numberString = value.toString().replace(/\D/g, "");
    return new Intl.NumberFormat("id-ID").format(numberString);
  };

  // --- LOGIKA MENGHITUNG SISA PEMBAYARAN OTOMATIS ---
  const currentTotalPay =
    parseInt(formData.total_pembayaran.toString().replace(/\./g, "")) || 0;
  let currentDp = parseInt(formData.dp.toString().replace(/\./g, ""));
  if (isNaN(currentDp)) currentDp = 0;

  let currentSisaPay;
  if (formData.dp === "" || currentDp === 0) {
    currentSisaPay = currentTotalPay; // Sisa adalah total jika belum ada DP
  } else {
    currentSisaPay = currentTotalPay - currentDp;
    if (currentSisaPay < 0) currentSisaPay = 0;
  }

  // --- AMBIL DATA AWAL ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. Ambil data pelanggan
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("*");

        if (customerError)
          console.error("Error muat customer:", customerError.message);
        else setCustomers(customerData || []);

        // 2. Ambil data mobil
        const { data: carData, error: carError } = await supabase
          .from("cars")
          .select("*");

        if (carError) console.error("Error muat mobil:", carError.message);
        else setCars(carData || []);

        // 3. Ambil data transaksi lama
        if (id) {
          const { data: trxData, error: trxError } = await supabase
            .from("transactions")
            .select(`*, customers(nama_pelanggan)`)
            .eq("transaction_id", id)
            .single();

          if (trxError) throw trxError;

          if (trxData) {
            const formatDateTime = (dateStr, timeStr) => {
              if (!dateStr || !timeStr) return "";
              const time = timeStr.substring(0, 5);
              return `${dateStr}T${time}`;
            };

            const namaCust =
              trxData.nama_customer || trxData.customers?.nama_pelanggan || "";
            const mobilUnit = trxData.mobil || ""; // Ambil string dari DB

            setFormData({
              waktu: formatDateTime(trxData.tanggal_sewa, trxData.jam_sewa),
              waktu_pengembalian: formatDateTime(
                trxData.tanggal_pengembalian,
                trxData.jam_pengembalian,
              ),
              customer_id: trxData.customer_id || "",
              nama_customer: namaCust,
              kontak: trxData.kontak || "",
              nik: trxData.nik || "",
              alamat: trxData.alamat || "",
              domisili: trxData.domisili || "",
              rute: trxData.rute || "",
              car_id: trxData.car_id || "",
              mobil_plat: mobilUnit,
              merek: trxData.merek || "",
              tipe_unit: trxData.tipe_unit || "",
              transmisi: trxData.transmisi || "",
              dp: trxData.dp ? formatRupiahInput(trxData.dp) : "",
              total_pembayaran: trxData.total_pembayaran
                ? formatRupiahInput(trxData.total_pembayaran)
                : "",
              keterangan: trxData.keterangan || "",
              foto_mobil: trxData.foto_mobil || "",
              video_mobil: trxData.video_mobil || "",
            });

            // Set text di kolom search
            setSearchTerm(namaCust);
            setSearchCarTerm(mobilUnit);
          }
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error.message);
      }
    };

    fetchInitialData();
  }, [id]);

  // --- FILTER SECARA REAL-TIME ---
  const filteredCustomers = customers.filter((c) =>
    c.nama_pelanggan?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredCars = cars.filter((c) => {
    const searchLower = searchCarTerm.toLowerCase();
    return (
      c.jenis_unit?.toLowerCase().includes(searchLower) ||
      c.nomor_plat?.toLowerCase().includes(searchLower)
    );
  });

  // handle drive login
  const handleGoogleLogin = () => {
    if (!window.google || !window.google.accounts) {
      alert("Library Google belum dimuat. Silakan refresh halaman.");
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
            alert("Login Google berhasil! Sekarang Anda bisa mengganti file.");
          }
        },
      });
      client.requestAccessToken();
    } catch (err) {
      console.error("Gagal inisialisasi Google Login:", err);
    }
  };

  const uploadToDrive = async (file, folderId, accessToken) => {
    if (!file) return null;

    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: [folderId],
    };

    const dataUpload = new FormData();
    dataUpload.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" }),
    );
    dataUpload.append("file", file);

    try {
      const response = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: dataUpload,
        },
      );

      const result = await response.json();

      if (file.type.startsWith("image/")) {
        return `https://drive.google.com/thumbnail?id=${result.id}&sz=w1000`;
      } else {
        return `https://drive.google.com/file/d/${result.id}/preview`;
      }
    } catch (error) {
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let newValue = value;

      if (name === "total_pembayaran") {
        newValue = formatRupiahInput(value);
        const newTotalRaw = parseInt(newValue.replace(/\./g, "")) || 0;
        const currentDpRaw =
          parseInt(prev.dp.toString().replace(/\./g, "")) || 0;
        if (currentDpRaw > newTotalRaw) {
          prev.dp = formatRupiahInput(newTotalRaw.toString());
        }
      } else if (name === "dp") {
        const rawDp = parseInt(value.replace(/\D/g, "")) || 0;
        const currentTotalRaw =
          parseInt(prev.total_pembayaran.toString().replace(/\./g, "")) || 0;

        if (rawDp > currentTotalRaw) {
          newValue = formatRupiahInput(currentTotalRaw.toString());
        } else {
          newValue = formatRupiahInput(value);
        }
      }

      const newData = { ...prev, [name]: newValue };

      if (name === "waktu") {
        const minReturn = getMinReturnDate(newValue);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama_customer) {
      alert("Harap isi Nama Customer!");
      return;
    }

    if (!formData.mobil_plat) {
      alert("Harap isi Data Kendaraan (Plat/Unit)!");
      return;
    }

    if ((fotoFile || videoFile) && !googleToken) {
      alert("Silahkan login google dulu untuk upload file baru");
      return;
    }

    setIsSubmitting(true);

    try {
      let jumlah_hari = 0;
      if (formData.waktu && formData.waktu_pengembalian) {
        const start = new Date(formData.waktu);
        const end = new Date(formData.waktu_pengembalian);
        jumlah_hari = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      }

      let linkFoto = formData.foto_mobil;
      let linkVideo = formData.video_mobil;

      if (fotoFile && googleToken) {
        linkFoto = await uploadToDrive(
          fotoFile,
          DRIVE_PHOTO_FOLDER_ID,
          googleToken,
        );
      }
      if (videoFile && googleToken) {
        linkVideo = await uploadToDrive(
          videoFile,
          DRIVE_VIDEO_FOLDER_ID,
          googleToken,
        );
      }

      const statusOtomatis =
        currentDp > 0 && currentSisaPay > 0 ? "Belum Lunas" : "Lunas";

      const { error } = await supabase
        .from("transactions")
        .update({
          customer_id: formData.customer_id || null,
          nama_customer: formData.nama_customer,
          kontak: formData.kontak,
          nik: formData.nik,
          alamat: formData.alamat,
          domisili: formData.domisili,
          car_id: formData.car_id || null,
          mobil: formData.mobil_plat,
          merek: formData.merek,
          tipe_unit: formData.tipe_unit,
          transmisi: formData.transmisi,
          tanggal_sewa: formData.waktu.split("T")[0],
          jam_sewa: formData.waktu.split("T")[1] + ":00",
          tanggal_pengembalian: formData.waktu_pengembalian.split("T")[0],
          jam_pengembalian: formData.waktu_pengembalian.split("T")[1] + ":00",
          rute: formData.rute,
          jumlah_hari: jumlah_hari,
          dp: currentDp,
          total_pembayaran: currentTotalPay,
          sisa_pembayaran: currentSisaPay,
          status_pembayaran: statusOtomatis,
          keterangan: formData.keterangan || null,
          foto_mobil: linkFoto,
          video_mobil: linkVideo,
        })
        .eq("transaction_id", id);

      if (error) throw error;

      setShowSuccessModal(true);
      setIsSubmitting(false);

      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/transaction");
      }, 2000);
    } catch (error) {
      console.error("Error:", error.message);
      alert("Gagal memperbarui transaksi: " + error.message);
      setIsSubmitting(false);
    }
  };

  const getMinReturnDate = (pickupDateString = formData.waktu) => {
    if (!pickupDateString) return "";
    const pickupDate = new Date(pickupDateString);
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
            <h4 className="fw-bold text-dark mb-1">Edit Transaksi</h4>
            <p className="text-muted small mb-0">
              Perbarui informasi atau rincian pembayaran untuk transaksi ini.
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
              {/* --- BAGIAN 1: INFORMASI CUSTOMER --- */}
              <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">
                Data Customer
              </h6>

              <div className="mb-4 position-relative">
                <label className="form-label text-secondary small fw-bold">
                  Nama Customer (Cari / Ketik Baru)
                </label>
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control bg-light border-0 py-2 pe-5"
                    placeholder="Ketik nama customer..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                      setFormData((prev) => ({
                        ...prev,
                        customer_id: "",
                        nama_customer: e.target.value,
                      }));
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    required
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      className="btn position-absolute top-50 end-0 translate-middle-y text-muted border-0 bg-transparent"
                      style={{ zIndex: 10 }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchTerm("");
                        setFormData((prev) => ({
                          ...prev,
                          customer_id: "",
                          nama_customer: "",
                        }));
                        setShowDropdown(true);
                      }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
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
                                kontak: cust.kontak || "",
                                nik: cust.nik || "",
                                alamat: cust.alamat || "",
                                domisili: cust.domisili || "",
                              }));
                              setShowDropdown(false);
                            }}
                          >
                            {cust.nama_pelanggan}
                            {cust.kontak && (
                              <small className="text-muted ms-2">
                                ({cust.kontak})
                              </small>
                            )}
                          </button>
                        </li>
                      ))
                    ) : (
                      <li>
                        <span className="dropdown-item text-muted disabled">
                          (Tekan simpan untuk jadikan customer baru)
                        </span>
                      </li>
                    )}
                  </ul>
                )}
              </div>

              <div className="row g-4 mb-5">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Kontak / No. HP
                    </label>
                    <input
                      type="text"
                      name="kontak"
                      value={formData.kontak}
                      onChange={handleChange}
                      className="form-control bg-light border-0 py-2"
                      placeholder="Masukkan kontak..."
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      NIK
                    </label>
                    <input
                      type="text"
                      name="nik"
                      value={formData.nik}
                      onChange={handleChange}
                      className="form-control bg-light border-0 py-2"
                      placeholder="Masukkan 16 digit NIK..."
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Alamat Lengkap
                    </label>
                    <input
                      type="text"
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleChange}
                      className="form-control bg-light border-0 py-2"
                      placeholder="Masukkan alamat asli..."
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Domisili Tujuan (Kota Rental)
                    </label>
                    <input
                      type="text"
                      name="domisili"
                      value={formData.domisili}
                      onChange={handleChange}
                      className="form-control bg-light border-0 py-2"
                      placeholder="Misal: Makassar, Maros..."
                      required
                    />
                  </div>
                </div>
              </div>

              {/* --- BAGIAN 2: INFORMASI PEMINJAMAN --- */}
              <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">
                Jadwal & Rute
              </h6>
              <div className="row g-4 mb-5">
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Rute Perjalanan
                    </label>
                    <input
                      type="text"
                      name="rute"
                      value={formData.rute}
                      onChange={handleChange}
                      className="form-control bg-light border-0 py-2"
                      placeholder="Masukkan rute secara manual (cth: Dalkot, Luar Kota...)"
                      required
                    />
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
                      value={formData.waktu}
                      onChange={handleChange}
                      className="form-control bg-light border-0 py-2"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Jadwal Kembali
                    </label>
                    <input
                      type="datetime-local"
                      name="waktu_pengembalian"
                      value={formData.waktu_pengembalian}
                      onChange={handleChange}
                      min={getMinReturnDate()}
                      disabled={!formData.waktu}
                      className="form-control bg-light border-0 py-2"
                      required
                    />
                    {!formData.waktu && (
                      <small
                        className="text-danger"
                        style={{ fontSize: "10px" }}
                      >
                        *Isi jadwal ambil terlebih dahulu
                      </small>
                    )}
                  </div>
                </div>
              </div>

              {/* --- BAGIAN 3: DATA KENDARAAN --- */}
              <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">
                Data Kendaraan Terpilih
              </h6>

              <div className="mb-4 position-relative">
                <label className="form-label text-secondary small fw-bold">
                  Mobil (Cari / Ketik Plat Baru)
                </label>
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control bg-light border-0 py-2 pe-5"
                    placeholder="Ketik plat atau nama unit..."
                    value={searchCarTerm}
                    onChange={(e) => {
                      setSearchCarTerm(e.target.value);
                      setShowCarDropdown(true);
                      setFormData((prev) => ({
                        ...prev,
                        car_id: "",
                        mobil_plat: e.target.value,
                        merek: "",
                        tipe_unit: "",
                        transmisi: "",
                      }));
                    }}
                    onFocus={() => setShowCarDropdown(true)}
                    onBlur={() =>
                      setTimeout(() => setShowCarDropdown(false), 200)
                    }
                    required
                  />

                  {searchCarTerm && (
                    <button
                      type="button"
                      className="btn position-absolute top-50 end-0 translate-middle-y text-muted border-0 bg-transparent"
                      style={{ zIndex: 10 }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchCarTerm("");
                        setFormData((prev) => ({
                          ...prev,
                          car_id: "",
                          mobil_plat: "",
                          merek: "",
                          tipe_unit: "",
                          transmisi: "",
                        }));
                        setShowCarDropdown(true);
                      }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>

                {showCarDropdown && (
                  <ul
                    className="dropdown-menu show w-100 shadow border-0 mt-1"
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      position: "absolute",
                      zIndex: 1000,
                    }}
                  >
                    {filteredCars.length > 0 ? (
                      filteredCars.map((car) => (
                        <li key={car.cars_id}>
                          <button
                            type="button"
                            className="dropdown-item py-2"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              const displayCar = `${car.nomor_plat} - ${car.jenis_unit}`;
                              setSearchCarTerm(displayCar);
                              setFormData((prev) => ({
                                ...prev,
                                car_id: car.cars_id,
                                mobil_plat: displayCar,
                                merek: car.jenis_unit?.split(" ")[0] || "",
                                tipe_unit: car.tipe_kendaraan || "",
                                transmisi: car.transmisi || "",
                              }));
                              setShowCarDropdown(false);
                            }}
                          >
                            <strong>{car.nomor_plat}</strong> - {car.jenis_unit}
                            <small className="text-muted ms-2">
                              ({car.status_mobil})
                            </small>
                          </button>
                        </li>
                      ))
                    ) : (
                      <li>
                        <span className="dropdown-item text-muted disabled">
                          (Plat baru akan direkam sebagai input manual)
                        </span>
                      </li>
                    )}
                  </ul>
                )}
              </div>

              <div className="row g-4 mb-5">
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Plat Kendaraan
                    </label>
                    <input
                      type="text"
                      name="merek"
                      value={formData.merek}
                      onChange={handleChange}
                      className="form-control bg-light border-0 py-2"
                      placeholder="DD 123 XX"
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Tipe Kendaraan
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="form-select bg-light border-0 py-2"
                      required
                    >
                      <option value="MPV">MPV</option>
                      <option value="SUV">SUV</option>
                      <option value="Sedan">Sedan</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Minibus">Minibus</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Transmisi
                    </label>
                    <select
                      name="transmisi"
                      value={formData.transmisi}
                      onChange={handleChange}
                      className="form-select bg-light border-0 py-2"
                    >
                      <option value="">- Pilih -</option>
                      <option value="MANUAL">Manual</option>
                      <option value="OTOMATIS">Otomatis</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* --- BAGIAN 4: RINCIAN PEMBAYARAN --- */}
              <h6 className="fw-bold text-success mb-3 border-bottom pb-2">
                Rincian Pembayaran
              </h6>
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
                        type="text"
                        name="total_pembayaran"
                        value={formData.total_pembayaran}
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
                        type="text"
                        name="dp"
                        value={formData.dp}
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
                      Sisa Pembayaran (Otomatis)
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0 text-muted">
                        Rp
                      </span>
                      <input
                        type="text"
                        className="form-control bg-light border-0 py-2"
                        value={new Intl.NumberFormat("id-ID").format(
                          currentSisaPay,
                        )}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* --- BAGIAN 5: DOKUMENTASI --- */}
              <h6 className="fw-bold text-success mb-3 border-bottom pb-2">
                Dokumentasi & Keterangan
              </h6>
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  {!googleToken && (
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="btn btn-outline-danger mb-3 btn-sm shadow-sm"
                    >
                      <i className="fab fa-google me-2"></i>1. Klik Login Google
                      untuk Ganti File
                    </button>
                  )}
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Ganti Foto Kendaraan
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFotoFile(e.target.files[0])}
                      className="form-control bg-light border-0 py-2"
                    />
                    {formData.foto_mobil && (
                      <small className="text-muted italic">
                        *Sudah ada dokumentasi tersimpan
                      </small>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">
                      Ganti Video Kendaraan
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files[0])}
                      className="form-control bg-light border-0 py-2"
                    />
                    {formData.video_mobil && (
                      <small className="text-muted italic">
                        *Sudah ada dokumentasi tersimpan
                      </small>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3 h-100">
                    <label className="form-label text-secondary small fw-bold">
                      Keterangan Tambahan
                    </label>
                    <textarea
                      name="keterangan"
                      value={formData.keterangan}
                      onChange={handleChange}
                      className="form-control bg-light border-0"
                      rows="4"
                      placeholder="Masukkan catatan khusus jika ada..."
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* --- TOMBOL SUBMIT --- */}
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
                    "Simpan Perubahan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* --- MODAL SUKSES --- */}
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
                <h5 className="fw-bold text-dark mb-2">Berhasil Diperbarui!</h5>
                <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                  Transaksi untuk{" "}
                  <span className="fw-bold text-dark">
                    {formData.nama_customer || "Customer"}
                  </span>{" "}
                  berhasil diperbarui.
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
