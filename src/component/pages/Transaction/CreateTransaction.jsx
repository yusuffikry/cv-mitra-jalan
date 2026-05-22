import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";

export default function CreateTransaction() {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // State untuk menampung data dari database
  const [customers, setCustomers] = useState([]);
  const [cars, setCars] = useState([]);

  // State KHUSUS untuk input pencarian Customer
  const [searchCustomerTerm, setSearchCustomerTerm] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // handel foto drive
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
    rute: "", 
    car_id: "", 
    mobil_plat: "", 
    merek: "", 
    tipe_unit: "", 
    transmisi: "", 
    dp: "",
    total_pembayaran: "",
    keterangan: "",
  });

  // Fungsi Format Input Uang
  const formatRupiahInput = (value) => {
    if (!value) return "";
    const numberString = value.replace(/\D/g, "");
    return new Intl.NumberFormat("id-ID").format(numberString);
  };

  // State Penentu Tipe Armada (Internal/Eksternal)
  const [isManualCar, setIsManualCar] = useState(false);

  // Status Form Terkunci (Read-Only)
  const isExistingCustomer = !!formData.customer_id;
  const isExistingExternalCar = isManualCar && !!formData.car_id;

  // ========================================================
  // LOGIKA MENGHITUNG UANG & SISA PEMBAYARAN
  // ========================================================
  const currentTotalPay = parseInt(formData.total_pembayaran.replace(/\./g, "")) || 0;
  let currentDp = parseInt(formData.dp.replace(/\./g, ""));
  if (isNaN(currentDp)) currentDp = 0;

  // Nilai Sisa Pembayaran Asli (Untuk disimpan ke Database)
  let finalSisaPay = currentTotalPay - currentDp;
  if (finalSisaPay < 0) finalSisaPay = 0;

  // Tampilan Sisa Pembayaran di UI (Hanya nampil kalau DP sudah diketik)
  let displaySisaPay = "";
  if (formData.dp !== "") {
    displaySisaPay = new Intl.NumberFormat("id-ID").format(finalSisaPay);
  }

  // --- AMBIL DATA DARI SUPABASE ---
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("*");

        if (customerError) {
          console.error("Error muat customer:", customerError.message);
        } else {
          setCustomers(customerData || []);
        }

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

  // Filter Customer Real-time
  const filteredCustomers = customers.filter((c) =>
    c.nama_pelanggan?.toLowerCase().includes(searchCustomerTerm.toLowerCase()),
  );

  // Login Drive
  const handleGoogleLogin = () => {
    if (!window.google || !window.google.accounts) {
      alert("Library Google belum dimuat. Silakan refresh halaman atau tunggu sebentar.");
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: "792749158806-1len8ms3h3cq3v16h58qcj9befc8log9.apps.googleusercontent.com",
        scope: "https://www.googleapis.com/auth/drive.file",
        callback: (response) => {
          if (response.access_token) {
            setGoogleToken(response.access_token);
            console.log("Token berhasil didapat");
            alert("Login Google berhasil! Sekarang Anda bisa mengupload file.");
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
      let newValue = value;

      if (name === "total_pembayaran") {
        newValue = formatRupiahInput(value);
        const newTotalRaw = parseInt(newValue.replace(/\./g, "")) || 0;
        const currentDpRaw = parseInt(prev.dp.replace(/\./g, "")) || 0;
        if (currentDpRaw > newTotalRaw) {
          prev.dp = formatRupiahInput(newTotalRaw.toString());
        }
      } else if (name === "dp") {
        const rawDp = parseInt(value.replace(/\D/g, "")) || 0;
        const currentTotalRaw = parseInt(prev.total_pembayaran.replace(/\./g, "")) || 0;

        if (rawDp > currentTotalRaw) {
          newValue = formatRupiahInput(currentTotalRaw.toString());
        } else {
          newValue = formatRupiahInput(value);
        }
      }

      const newData = { ...prev, [name]: newValue };

      if (name === "waktu") {
        const minReturn = getMinReturnDate(newValue);
        if (newData.waktu_pengembalian && newData.waktu_pengembalian < minReturn) {
          newData.waktu_pengembalian = "";
        }
      }
      return newData;
    });
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
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: dataUpload,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gagal ke GDrive:", errorData);
        return null;
      }

      const result = await response.json();

      if (file.type.startsWith("image/")) {
        return `https://drive.google.com/thumbnail?id=${result.id}&sz=w1000`;
      } else {
        return `https://drive.google.com/file/d/${result.id}/preview`;
      }
    } catch (error) {
      console.error("Network error Drive:", error);
      return null;
    }
  };

  // --- SUBMIT KESELURUHAN ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama_customer) {
      alert("Harap isi Nama Customer!");
      return;
    }
    
    // Validasi pemilihan/pengisian mobil
    if (!isManualCar && !formData.car_id) {
      alert("Harap pilih Kendaraan Internal dari dropdown!");
      return;
    }
    if (isManualCar && (!formData.merek || !formData.mobil_plat)) {
      alert("Harap lengkapi Merek dan Plat Nomor untuk Kendaraan Eksternal!");
      return;
    }

    if ((fotoFile || videoFile) && !googleToken) {
      alert("Silahkan login google dulu untuk upload file foto/video");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. CEK & AUTO-INSERT CUSTOMER BARU
      let finalCustomerId = formData.customer_id;
      
      if (!finalCustomerId) {
        const { data: existingCustomer, error: checkError } = await supabase
          .from("customers")
          .select("*")
          .eq("nik", formData.nik)
          .maybeSingle(); 

        if (checkError) throw checkError;

        if (existingCustomer) {
          finalCustomerId = existingCustomer.id || existingCustomer.customer_id;
        } else {
          const { data: newCustomer, error: customerError } = await supabase
            .from("customers")
            .insert([
              {
                nama_pelanggan: formData.nama_customer,
                kontak: formData.kontak,
                nik: formData.nik,
                alamat: formData.alamat,
                kota: formData.domisili, 
              },
            ])
            .select()
            .single();

          if (customerError) throw customerError;
          
          finalCustomerId = newCustomer.id || newCustomer.customer_id;
        }
      }

      // 2. AUTO-INSERT MOBIL EKSTERNAL BARU (JIKA DIPERLUKAN)
      let finalCarId = formData.car_id;

      // Hanya insert mobil eksternal baru jika finalCarId kosong
      if (isManualCar && !finalCarId) {
        const { data: newCar, error: carError } = await supabase
          .from("cars")
          .insert([
            {
              jenis_unit: formData.merek,
              nomor_plat: formData.mobil_plat,
              tipe_kendaraan: formData.tipe_unit,
              transmisi: formData.transmisi,
              status_mobil: "Tersedia",
              status_armada: "Eksternal"
            },
          ])
          .select()
          .single();

        if (carError) throw carError;
        
        finalCarId = newCar.cars_id || newCar.id;
      }

      // 3. HITUNG DURASI & UPLOAD FOTO
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
      const jamSewa = formData.waktu.split("T")[1] + ":00";
      const tglKembali = formData.waktu_pengembalian.split("T")[0];
      const jamKembali = formData.waktu_pengembalian.split("T")[1] + ":00";

      let linkFoto = null;
      let linkVideo = null;

      if (fotoFile && googleToken) {
        linkFoto = await uploadToDrive(fotoFile, DRIVE_PHOTO_FOLDER_ID, googleToken);
      }
      if (videoFile && googleToken) {
        linkVideo = await uploadToDrive(videoFile, DRIVE_VIDEO_FOLDER_ID, googleToken);
      }

      const statusOtomatis = finalSisaPay > 0 ? "Belum Lunas" : "Lunas";

      // 4. INSERT TRANSAKSI FINAL
      const { error } = await supabase.from("transactions").insert([
        {
          customer_id: finalCustomerId,
          car_id: finalCarId, 
          tanggal_sewa: tglSewa,
          jam_sewa: jamSewa,
          tanggal_pengembalian: tglKembali,
          jam_pengembalian: jamKembali,
          rute: formData.rute,
          jumlah_hari: jumlah_hari,
          dp: currentDp,
          total_pembayaran: currentTotalPay,
          sisa_pembayaran: finalSisaPay,
          status_pembayaran: statusOtomatis,
          keterangan: formData.keterangan || null,
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
                    value={searchCustomerTerm}
                    onChange={(e) => {
                      setSearchCustomerTerm(e.target.value);
                      setShowCustomerDropdown(true);
                      setFormData((prev) => ({
                        ...prev,
                        customer_id: "",
                        nama_customer: e.target.value,
                        kontak: "", nik: "", alamat: "", domisili: ""
                      }));
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                    required
                  />

                  {searchCustomerTerm && (
                    <button
                      type="button"
                      className="btn position-absolute top-50 end-0 translate-middle-y text-muted border-0 bg-transparent"
                      style={{ zIndex: 10 }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchCustomerTerm("");
                        setFormData((prev) => ({
                          ...prev,
                          customer_id: "",
                          nama_customer: "",
                          kontak: "", nik: "", alamat: "", domisili: ""
                        }));
                        setShowCustomerDropdown(true);
                      }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>

                {/* Indikator status customer */}
                {isExistingCustomer ? (
                  <small className="text-primary mt-1 d-block fw-medium">
                    <i className="fas fa-user-check me-1"></i> Customer sudah terdaftar. Data di bawah dikunci untuk mencegah perubahan tidak sengaja.
                  </small>
                ) : formData.nama_customer ? (
                  <small className="text-success mt-1 d-block fw-medium">
                    <i className="fas fa-user-plus me-1"></i> Customer baru. Data akan otomatis ditambahkan ke database.
                  </small>
                ) : null}

                {showCustomerDropdown && (
                  <ul
                    className="dropdown-menu show w-100 shadow border-0 mt-1"
                    style={{ maxHeight: "200px", overflowY: "auto", position: "absolute", zIndex: 1000 }}
                  >
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((cust) => (
                        <li key={cust.id || cust.customer_id}>
                          <button
                            type="button"
                            className="dropdown-item py-2"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setSearchCustomerTerm(cust.nama_pelanggan);
                              setFormData((prev) => ({
                                ...prev,
                                customer_id: cust.id || cust.customer_id,
                                nama_customer: cust.nama_pelanggan,
                                kontak: cust.kontak || "",
                                nik: cust.nik || "",
                                alamat: cust.alamat || "",
                                domisili: cust.kota || cust.domisili || "", 
                              }));
                              setShowCustomerDropdown(false);
                            }}
                          >
                            {cust.nama_pelanggan}
                            {cust.kontak && (
                              <small className="text-muted ms-2">({cust.kontak})</small>
                            )}
                          </button>
                        </li>
                      ))
                    ) : (
                      <li>
                        <span className="dropdown-item text-muted disabled">
                          (Customer tidak ditemukan, akan didaftarkan sebagai baru)
                        </span>
                      </li>
                    )}
                  </ul>
                )}
              </div>

              <div className="row g-4 mb-5">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Kontak / No. HP</label>
                    <input
                      type="text"
                      name="kontak"
                      value={formData.kontak}
                      onChange={handleChange}
                      className={`form-control border-0 py-2 ${isExistingCustomer ? 'bg-secondary bg-opacity-10 text-muted' : 'bg-light'}`}
                      placeholder="Masukkan kontak..."
                      readOnly={isExistingCustomer}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">NIK</label>
                    <input
                      type="text"
                      name="nik"
                      value={formData.nik}
                      onChange={handleChange}
                      className={`form-control border-0 py-2 ${isExistingCustomer ? 'bg-secondary bg-opacity-10 text-muted' : 'bg-light'}`}
                      placeholder="Masukkan 16 digit NIK..."
                      readOnly={isExistingCustomer}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Alamat Lengkap</label>
                    <input
                      type="text"
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleChange}
                      className={`form-control border-0 py-2 ${isExistingCustomer ? 'bg-secondary bg-opacity-10 text-muted' : 'bg-light'}`}
                      placeholder="Masukkan alamat asli..."
                      readOnly={isExistingCustomer}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Domisili Tujuan (Kota Rental)</label>
                    <input
                      type="text"
                      name="domisili"
                      value={formData.domisili}
                      onChange={handleChange}
                      className={`form-control border-0 py-2 ${isExistingCustomer ? 'bg-secondary bg-opacity-10 text-muted' : 'bg-light'}`}
                      placeholder="Misal: Makassar, Maros..."
                      readOnly={isExistingCustomer}
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
                    <label className="form-label text-secondary small fw-bold">Rute Perjalanan</label>
                    <select
                      name="rute"
                      value={formData.rute}
                      onChange={handleChange}
                      className="form-select bg-light border-0 py-2"
                      required
                    >
                      <option value="">- Pilih Rute Perjalanan -</option>
                      <option value="DALKOT">DALKOT (Dalam Kota)</option>
                      <option value="LURKOT">LURKOT (Luar Kota)</option>
                      <option value="DALKOT & LURKOT">DALKOT & LURKOT</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Jadwal Ambil</label>
                    <input
                      type="datetime-local"
                      name="waktu"
                      onChange={handleChange}
                      className="form-control bg-light border-0 py-2"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Jadwal Kembali</label>
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
                      <small className="text-danger" style={{ fontSize: "10px" }}>
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

              {/* Pilihan Sumber Kendaraan (Radio Buttons) */}
              <div className="mb-4">
                <label className="form-label text-secondary small fw-bold d-block">
                  Sumber Kendaraan
                </label>
                <div className="form-check form-check-inline mt-1">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="carInputType"
                    id="armadaSendiri"
                    checked={!isManualCar}
                    onChange={() => {
                      setIsManualCar(false);
                      setFormData((prev) => ({
                        ...prev, car_id: "", mobil_plat: "", merek: "", tipe_unit: "", transmisi: ""
                      }));
                    }}
                  />
                  <label className="form-check-label text-dark" htmlFor="armadaSendiri">
                    Armada Sendiri (Internal)
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="carInputType"
                    id="mobilBaru"
                    checked={isManualCar}
                    onChange={() => {
                      setIsManualCar(true);
                      setFormData((prev) => ({
                        ...prev, car_id: "", mobil_plat: "", merek: "", tipe_unit: "", transmisi: ""
                      }));
                    }}
                  />
                  <label className="form-check-label text-dark" htmlFor="mobilBaru">
                    Rent-to-Rent (Eksternal)
                  </label>
                </div>
              </div>

              {/* Form Dropdown Armada Sendiri */}
              {!isManualCar && (
                <div className="mb-5 position-relative">
                  <label className="form-label text-secondary small fw-bold">
                    Pilih Armada Sendiri
                  </label>
                  <select
                    className="form-select bg-light border-0 py-2"
                    value={formData.car_id}
                    onChange={(e) => {
                      const selectedCarId = e.target.value;
                      if (!selectedCarId) {
                        setFormData((prev) => ({
                          ...prev, car_id: "", mobil_plat: "", merek: "", tipe_unit: "", transmisi: ""
                        }));
                        return;
                      }
                      
                      const selectedCar = cars.find(
                        (c) => String(c.cars_id) === selectedCarId || String(c.id) === selectedCarId
                      );

                      if (selectedCar) {
                        setFormData((prev) => ({
                          ...prev,
                          car_id: selectedCar.cars_id || selectedCar.id,
                          mobil_plat: selectedCar.nomor_plat || "",
                          merek: selectedCar.jenis_unit?.split(" ")[0] || selectedCar.jenis_unit || "",
                          tipe_unit: selectedCar.tipe_kendaraan || "",
                          transmisi: selectedCar.transmisi || "",
                        }));
                      }
                    }}
                    required={!isManualCar}
                  >
                    <option value="">-- Pilih Kendaraan dari Database --</option>
                    {/* HANYA TAMPILKAN MOBIL INTERNAL / DEFAULT LAMA */}
                    {cars
                      .filter(car => car.status_armada === "Internal" || !car.status_armada)
                      .map((car) => (
                      <option key={car.cars_id || car.id} value={car.cars_id || car.id}>
                        {car.nomor_plat} - {car.jenis_unit} ({car.status_mobil || "Tersedia"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Form Rent-to-Rent (Dropdown Eksternal & Manual Input) */}
              {isManualCar && (
                <div className="row g-4 mb-5 p-4 rounded-3" style={{ backgroundColor: "#fdfdfd", border: "1px dashed #ced4da" }}>
                  <div className="col-12 mb-2">
                    <span className="badge bg-warning-subtle text-warning-emphasis mb-2">Mode Rent-to-Rent</span>
                    
                    <label className="form-label text-secondary small fw-bold d-block">
                      Pilih Kendaraan Eksternal (Opsional)
                    </label>
                    <select
                      className="form-select bg-white border-secondary-subtle py-2 mb-2"
                      value={isExistingExternalCar ? formData.car_id : ""}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        if (!selectedId) {
                          setFormData(prev => ({ ...prev, car_id: "", mobil_plat: "", merek: "", tipe_unit: "", transmisi: "" }));
                        } else {
                          const c = cars.find(car => String(car.cars_id || car.id) === selectedId);
                          if (c) {
                            setFormData(prev => ({
                              ...prev,
                              car_id: selectedId,
                              mobil_plat: c.nomor_plat || "",
                              merek: c.jenis_unit || "",
                              tipe_unit: c.tipe_kendaraan || "",
                              transmisi: c.transmisi || ""
                            }));
                          }
                        }
                      }}
                    >
                      <option value="">+ Input Manual Mobil Eksternal Baru</option>
                      {/* HANYA TAMPILKAN MOBIL EKSTERNAL */}
                      {cars
                        .filter(car => car.status_armada === "Eksternal")
                        .map(car => (
                          <option key={car.cars_id || car.id} value={car.cars_id || car.id}>
                            {car.nomor_plat} - {car.jenis_unit}
                          </option>
                      ))}
                    </select>

                    {isExistingExternalCar ? (
                      <small className="text-primary d-block fw-medium">
                        <i className="fas fa-lock me-1"></i> Mobil Eksternal sudah pernah disewa. Data dikunci.
                      </small>
                    ) : (
                      <small className="text-success d-block fw-medium">
                        <i className="fas fa-pen me-1"></i> Mode Input Manual. Mobil ini akan disimpan sebagai armada Eksternal baru.
                      </small>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label text-secondary small fw-bold">Merek / Nama Kendaraan</label>
                      <input
                        type="text"
                        name="merek"
                        value={formData.merek || ""}
                        onChange={handleChange}
                        className={`form-control py-2 ${isExistingExternalCar ? 'bg-secondary bg-opacity-10 text-muted border-0' : 'bg-white border'}`}
                        placeholder="Contoh: Honda Brio Luar"
                        readOnly={isExistingExternalCar}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label text-secondary small fw-bold">Plat Kendaraan</label>
                      <input
                        type="text"
                        name="mobil_plat"
                        value={formData.mobil_plat || ""}
                        onChange={handleChange}
                        className={`form-control py-2 ${isExistingExternalCar ? 'bg-secondary bg-opacity-10 text-muted border-0' : 'bg-white border'}`}
                        placeholder="DD 123 XX"
                        readOnly={isExistingExternalCar}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label text-secondary small fw-bold">Tipe Kendaraan</label>
                      <select
                        name="tipe_unit"
                        value={formData.tipe_unit || ""}
                        onChange={handleChange}
                        className={`form-select py-2 ${isExistingExternalCar ? 'bg-secondary bg-opacity-10 text-muted border-0' : 'bg-white border'}`}
                        disabled={isExistingExternalCar}
                        required
                      >
                        <option value="">- Pilih Tipe -</option>
                        <option value="MPV">MPV</option>
                        <option value="SUV">SUV</option>
                        <option value="Sedan">Sedan</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="Minibus">Minibus</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label text-secondary small fw-bold">Transmisi</label>
                      <select
                        name="transmisi"
                        value={formData.transmisi || ""}
                        onChange={handleChange}
                        className={`form-select py-2 ${isExistingExternalCar ? 'bg-secondary bg-opacity-10 text-muted border-0' : 'bg-white border'}`}
                        disabled={isExistingExternalCar}
                        required
                      >
                        <option value="">- Pilih Transmisi -</option>
                        <option value="Manual">Manual</option>
                        <option value="Matic">Matic</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* --- BAGIAN 4: RINCIAN PEMBAYARAN --- */}
              <h6 className="fw-bold text-success mb-3 border-bottom pb-2">
                Rincian Pembayaran
              </h6>
              <div className="row g-4 mb-5">
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Total Pembayaran</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0 text-muted">Rp</span>
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
                    <label className="form-label text-secondary small fw-bold">Uang Muka (DP)</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0 text-muted">Rp</span>
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
                    <label className="form-label text-secondary small fw-bold">Sisa Pembayaran (Otomatis)</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0 text-muted">Rp</span>
                      <input
                        type="text"
                        className="form-control bg-light border-0 py-2"
                        value={displaySisaPay}
                        placeholder="0"
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
                      <i className="fab fa-google me-2"></i>1. Klik Login Google untuk Upload
                    </button>
                  )}

                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Foto Kendaraan</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFotoFile(e.target.files[0])}
                      className="form-control bg-light border-0 py-2"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Video Kendaraan</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files[0])}
                      className="form-control bg-light border-0 py-2"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3 h-100">
                    <label className="form-label text-secondary small fw-bold">Keterangan Tambahan</label>
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

              {/* --- TOMBOL SUBMIT --- */}
              <div className="d-flex justify-content-end gap-3 mt-5 border-top pt-4">
                <Link
                  to="/transaction"
                  className="btn px-5 py-2 fw-bold text-white shadow-sm"
                  style={{ backgroundColor: "#ff9a90", border: "none", borderRadius: "12px" }}
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
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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

      {/* --- MODAL SUKSES --- */}
      {showSuccessModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(5px)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
              <div className="modal-body p-4 text-center">
                <div
                  className="mx-auto mb-4 d-flex align-items-center justify-content-center bg-success-subtle text-success"
                  style={{ width: "64px", height: "64px", borderRadius: "50%" }}
                >
                  <i className="fas fa-check fs-2"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Berhasil Ditambahkan!</h5>
                <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                  Transaksi untuk <span className="fw-bold text-dark">{formData.nama_customer || "Customer"}</span> berhasil dibuat.
                </p>
                <div className="d-flex align-items-center justify-content-center text-muted small">
                  <div className="spinner-border spinner-border-sm me-2" role="status" style={{ width: "12px", height: "12px" }}></div>
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