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

  // State form utama
  const [formData, setFormData] = useState({
    waktu: "", 
    waktu_pengembalian: "",
    customer_id: "", 
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

  // --- AMBIL DATA DARI SUPABASE (Pilihan & Data Transaksi Lama) ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. Ambil data pelanggan aktif
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("*")
          .eq("status", "active");
        
        if (customerError) console.error("Error muat customer:", customerError.message);
        else setCustomers(customerData || []);

        // 2. Ambil data mobil
        const { data: carData, error: carError } = await supabase
          .from("cars")
          .select("*");
        
        if (carError) console.error("Error muat mobil:", carError.message);
        else setCars(carData || []);

        // 3. Ambil data transaksi lama berdasarkan ID
        if (id) {
          const { data: trxData, error: trxError } = await supabase
            .from("transactions")
            .select(`*, customers(nama_pelanggan)`) // Join untuk mengambil nama customer lama
            .eq("transaction_id", id)
            .single();

          if (trxError) throw trxError;

          if (trxData) {
            // Gabungkan Tanggal & Jam dari DB agar cocok dengan format datetime-local HTML
            const formatDateTime = (dateStr, timeStr) => {
              if (!dateStr || !timeStr) return "";
              const time = timeStr.substring(0, 5); // Ambil "HH:mm"
              return `${dateStr}T${time}`;
            };

            const namaCust = trxData.customers?.nama_pelanggan || "";

            setFormData({
              waktu: formatDateTime(trxData.tanggal_sewa, trxData.jam_sewa),
              waktu_pengembalian: formatDateTime(trxData.tanggal_pengembalian, trxData.jam_pengembalian),
              customer_id: trxData.customer_id,
              nama_customer: namaCust,
              rute: trxData.rute || "",
              car_id: trxData.car_id || "",
              dp: trxData.dp || "",
              sisa_pembayaran: trxData.sisa_pembayaran || "",
              total_pembayaran: trxData.total_pembayaran || "",
              keterangan: trxData.keterangan || "",
              foto_mobil: trxData.foto_mobil || "",
              video_mobil: trxData.video_mobil || "",
            });
            
            // Isi kolom pencarian dengan nama customer yang sudah ada
            setSearchTerm(namaCust);
          }
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error.message);
      }
    };

    fetchInitialData();
  }, [id]);

  // --- FILTER NAMA CUSTOMER SECARA REAL-TIME ---
  const filteredCustomers = customers.filter((c) =>
    c.nama_pelanggan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      
      // Jika user mengubah waktu ambil, cek apakah waktu kembali masih valid
      if (name === "waktu") {
        const minReturn = getMinReturnDate();
        if (newData.waktu_pengembalian && newData.waktu_pengembalian < minReturn) {
          newData.waktu_pengembalian = ""; // Reset jika tidak valid
        }
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customer_id) {
      alert("Harap pilih Customer dari daftar Dropdown yang muncul!");
      return;
    }

    setIsSubmitting(true);

    try {
      // Hitung Ulang Jumlah Hari
      let jumlah_hari = 0;
      if (formData.waktu && formData.waktu_pengembalian) {
        const start = new Date(formData.waktu);
        const end = new Date(formData.waktu_pengembalian);
        const diffTime = end - start;
        if (diffTime > 0) {
          jumlah_hari = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
      }

      // Format Tanggal dan Jam
      const tglSewa = formData.waktu.split("T")[0];
      const jamSewa = formData.waktu.split("T")[1] + ":00";
      const tglKembali = formData.waktu_pengembalian.split("T")[0];
      const jamKembali = formData.waktu_pengembalian.split("T")[1] + ":00";

      // Proses UPDATE ke tabel transactions
      const { error } = await supabase
        .from("transactions")
        .update({
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
        })
        .eq("transaction_id", id); // UPDATE BERDASARKAN ID

      if (error) throw error;

      setShowSuccessModal(true);
      setIsSubmitting(false);

      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/transaction");
      }, 2000);

    } catch (error) {
      console.error("Error updating transaction:", error.message);
      alert("Gagal memperbarui transaksi: " + error.message);
      setIsSubmitting(false);
    }
  };

  // Fungsi untuk menghitung H+1 dari waktu sewa jam 00:00
  const getMinReturnDate = () => {
    if (!formData.waktu) return "";
    const pickupDate = new Date(formData.waktu);
    pickupDate.setDate(pickupDate.getDate() + 1);
    
    const year = pickupDate.getFullYear();
    const month = String(pickupDate.getMonth() + 1).padStart(2, '0');
    const day = String(pickupDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}T00:00`;
  };

  return (
    <div className="h-100 bg-light d-flex flex-column">
      <div className="flex-grow-1 overflow-auto p-4">
        
        <div className="d-flex justify-content-between align-items-center mb-4 mx-auto" style={{ maxWidth: "1000px" }}>
          <div>
            <h4 className="fw-bold text-dark mb-1">Edit Transaksi</h4>
            <p className="text-muted small mb-0">
              Perbarui informasi atau rincian pembayaran untuk transaksi ini.
            </p>
          </div>
          <Link to="/transaction" className="btn btn-outline-secondary shadow-sm px-3">
            <i className="fas fa-arrow-left me-2"></i>Kembali
          </Link>
        </div>

        <div className="card shadow-sm border-0 rounded-3 mb-5 mx-auto" style={{ maxWidth: "1000px" }}>
          <div className="card-body p-4 p-lg-5">
            <form onSubmit={handleSubmit}>
              
              <h6 className="fw-bold text-primary mb-3">Informasi Peminjaman</h6>
              <div className="row g-4 mb-5">
                <div className="col-md-6">
                  
                  {/* --- CUSTOM SEARCHABLE DROPDOWN UNTUK CUSTOMER --- */}
                  <div className="mb-3 position-relative">
                    <label className="form-label text-secondary small fw-bold">Nama Customer (Cari / Pilih)</label>
                    <div className="position-relative">
                      <input
                        type="text"
                        className="form-control bg-light border-0 py-2 pe-5"
                        placeholder="Ketik nama customer..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setShowDropdown(true);
                          setFormData((prev) => ({ ...prev, customer_id: "", nama_customer: "" }));
                        }}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setShowDropdown(false)}
                        required={!formData.customer_id}
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          className="btn position-absolute top-50 end-0 translate-middle-y text-muted border-0 bg-transparent"
                          style={{ zIndex: 10 }}
                          onMouseDown={(e) => {
                            e.preventDefault(); 
                            setSearchTerm("");
                            setFormData((prev) => ({ ...prev, customer_id: "", nama_customer: "" }));
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
                                  setSearchTerm(cust.nama_pelanggan);
                                  setFormData((prev) => ({ 
                                    ...prev, 
                                    customer_id: cust.id || cust.customer_id, 
                                    nama_customer: cust.nama_pelanggan 
                                  }));
                                  setShowDropdown(false);
                                }}
                              >
                                {cust.nama_pelanggan}
                              </button>
                            </li>
                          ))
                        ) : (
                          <li><span className="dropdown-item text-muted disabled">Pelanggan tidak ditemukan</span></li>
                        )}
                      </ul>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Rute Perjalanan</label>
                    <select
                      name="rute"
                      value={formData.rute}
                      onChange={handleChange}
                      className="form-select bg-light border-0 py-2"
                      required
                    >
                      <option value="">-- Pilih Rute --</option>
                      <option value="DALKOT">Dalam Kota</option>
                      <option value="LURKOT">Luar Kota</option>
                      <option value="DALKOT & LURKOT">Dalam Kota & Luar Kota</option>
                    </select>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Jadwal Ambil</label>
                    <input
                      type="datetime-local"
                      name="waktu"
                      value={formData.waktu}
                      onChange={handleChange}
                      className="form-control bg-light border-0 py-2"
                      required
                    />
                  </div>
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
                    {!formData.waktu ? (
                      <small className="text-danger" style={{ fontSize: "10px" }}>
                        *Isi jadwal ambil terlebih dahulu
                      </small>
                    ) : (
                      <small className="text-muted" style={{ fontSize: "10px" }}>
                        *Minimal pengembalian adalah H+1 dari jadwal ambil.
                      </small>
                    )}
                  </div>
                </div>
              </div>

              <h6 className="fw-bold text-primary mb-3">Data Kendaraan Terpilih</h6>
              <div className="row g-4 mb-5">
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Mobil (Plat Nomor)</label>
                    <select
                      name="car_id"
                      value={formData.car_id}
                      onChange={handleChange}
                      className="form-select bg-light border-0 py-2"
                      required
                    >
                      <option value="">-- Pilih Kendaraan yang Disewa --</option>
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
                    <label className="form-label text-secondary small fw-bold">Total Pembayaran</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0 text-muted">Rp</span>
                      <input
                        type="number"
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
                        type="number"
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
                    <label className="form-label text-secondary small fw-bold">Sisa Pembayaran</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0 text-muted">Rp</span>
                      <input
                        type="number"
                        name="sisa_pembayaran"
                        value={formData.sisa_pembayaran}
                        onChange={handleChange}
                        className="form-control bg-light border-0 py-2"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <h6 className="fw-bold text-success mb-3">Dokumentasi & Keterangan</h6>
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Link Foto Kendaraan (GDrive)</label>
                    <input
                      type="url"
                      name="foto_mobil"
                      value={formData.foto_mobil}
                      onChange={handleChange}
                      className="form-control bg-light border-0 py-2"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Link Video Kendaraan (GDrive)</label>
                    <input
                      type="url"
                      name="video_mobil"
                      value={formData.video_mobil}
                      onChange={handleChange}
                      className="form-control bg-light border-0 py-2"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3 h-100">
                    <label className="form-label text-secondary small fw-bold">Keterangan Tambahan</label>
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
                  style={{ backgroundColor: "#0cc2aa", border: "none", borderRadius: "12px", opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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

      {showSuccessModal && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', zIndex: 1050 }}
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
                <h5 className="fw-bold text-dark mb-2">Berhasil Diperbarui!</h5>
                <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                  Transaksi untuk <span className="fw-bold text-dark">{formData.nama_customer || "Customer"}</span> berhasil diperbarui.
                </p>
                <div className="d-flex align-items-center justify-content-center text-muted small">
                  <div className="spinner-border spinner-border-sm me-2" role="status" style={{ width: '12px', height: '12px' }}></div>
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