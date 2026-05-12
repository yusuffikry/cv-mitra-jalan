import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { useReactToPrint } from "react-to-print";

export default function ShowOutcome() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [expenseData, setExpenseData] = useState(null);

  // --- INISIALISASI REACT-TO-PRINT ---
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Bukti_Kas_Keluar_BKK-${id?.substring(0, 6).toUpperCase() || '001'}`,
    removeAfterPrint: true,
  });

  useEffect(() => {
    if (id) {
      fetchExpenseDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchExpenseDetail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("expense_id", id)
        .single();

      if (error) throw error;
      setExpenseData(data);
    } catch (error) {
      console.error("Gagal mengambil detail pengeluaran:", error.message);
      alert("Data tidak ditemukan!");
      navigate("/outcome");
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID").format(angka || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="h-100 d-flex justify-content-center align-items-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-2" role="status"></div>
          <p className="text-muted">Menyiapkan dokumen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-100 bg-light d-flex flex-column overflow-auto w-100 p-4">
      
      {/* CSS KHUSUS PRINT */}
      <style>
        {`
          @media print {
            /* Margin diperkecil jadi 10mm agar muat 1 halaman A5 */
            @page { size: A5 landscape; margin: 10mm; } 
            body { background-color: white !important; -webkit-print-color-adjust: exact; color: #000 !important; }
            .card { border: 1px solid #000 !important; box-shadow: none !important; border-top: 6px solid #000 !important; }
            .bg-light { background-color: #fff !important; }
            .text-muted, .text-secondary { color: #333 !important; }
            .d-print-none { display: none !important; }
            /* Memaksa elemen di dalam card body agar tidak terpotong */
            .card-body { page-break-inside: avoid; padding: 1.5rem !important; }
          }
        `}
      </style>

      {/* HEADER AKSI */}
      <div className="d-flex justify-content-between align-items-center mb-4 mx-auto w-100 d-print-none" style={{ maxWidth: "800px" }}>
        <div>
          <h4 className="fw-bold text-dark m-0">Detail Bukti Pengeluaran</h4>
          <p className="text-muted small mb-0">Cetak lembar ini untuk diarsipkan bersama nota asli.</p>
        </div>
        <button className="btn btn-outline-secondary shadow-sm px-3" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left me-2"></i>Kembali
        </button>
      </div>

      {/* AREA DOKUMEN BKK (BUKTI KAS KELUAR) */}
      <div
        ref={componentRef}
        className="card border-0 shadow-sm mx-auto bg-white mb-4 w-100"
        style={{
          maxWidth: "800px",
          borderRadius: "0px",
          borderTop: "6px solid #ff4d4d",
        }}
      >
        {/* Padding diperkecil (p-4 saja) agar tidak terlalu boros ruang vertikal */}
        <div className="card-body p-4">
          
          {/* KOP & JUDUL DOKUMEN */}
          <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-4">
            <div>
              <h3 className="fw-bold text-dark mb-1">CV. MITRA JALAN</h3>
              <p className="text-muted small mb-0">Divisi Operasional & Perawatan Kendaraan</p>
            </div>
            <div className="text-end">
              <h4 className="fw-bold text-danger text-uppercase mb-1" style={{ letterSpacing: "2px" }}>Bukti Kas Keluar</h4>
              <p className="fw-bold text-secondary mb-0">NO: BKK-{expenseData?.expense_id?.substring(0, 8).toUpperCase()}</p>
            </div>
          </div>

          {/* ISI DOKUMEN (FORM STYLE) */}
          <div className="px-2 mb-4">
            <div className="row mb-2">
              <div className="col-3 text-secondary fw-bold">Tanggal</div>
              <div className="col-9 fw-bold text-dark">: {formatDate(expenseData?.tanggal_pengeluaran)}</div>
            </div>
            <div className="row mb-2">
              <div className="col-3 text-secondary fw-bold">Dibayarkan Untuk</div>
              <div className="col-9 fw-bold text-dark">: <span className="text-uppercase border-bottom border-dark pb-1">{expenseData?.jenis_pengeluaran}</span></div>
            </div>
            <div className="row mb-3">
              <div className="col-3 text-secondary fw-bold">Keterangan / Uraian</div>
              <div className="col-9 text-dark">: {expenseData?.keterangan || "Tidak ada keterangan tambahan."}</div>
            </div>
            
            <div className="row mt-3">
              <div className="col-3 align-self-center text-secondary fw-bold">Jumlah Uang</div>
              <div className="col-9">
                {/* Padding box Jumlah Uang diperkecil jadi p-2 */}
                <div className="p-2 bg-light border border-2 border-danger d-inline-block rounded-3">
                  <h4 className="text-danger fw-bold m-0">Rp {formatRupiah(expenseData?.total_pengeluaran)}</h4>
                </div>
              </div>
            </div>
          </div>

          {/* AREA TANDA TANGAN */}
          <div className="row mt-4 pt-2">
            <div className="col-4 text-center">
              <p className="mb-2 small fw-bold text-muted">Penerima Dana,</p>
              {/* Jarak tanda tangan dikurangi dari 70px jadi 50px */}
              <div style={{ height: "50px" }}></div>
              <p className="fw-bold border-top border-dark d-inline-block px-4 pt-1 mb-0 small">
                ( .................................... )
              </p>
            </div>
            <div className="col-4 text-center">
              <p className="mb-2 small fw-bold text-muted">Dibayarkan Oleh,</p>
              <div style={{ height: "50px" }}></div>
              <p className="fw-bold border-top border-dark d-inline-block px-4 pt-1 mb-0 small">
                Admin Operasional
              </p>
            </div>
            <div className="col-4 text-center">
              <p className="mb-2 small fw-bold text-muted">Disetujui Oleh,</p>
              <div style={{ height: "50px" }}></div>
              <p className="fw-bold border-top border-dark d-inline-block px-4 pt-1 mb-0 small">
                Manager / Pimpinan
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Tombol Cetak */}
      <div className="d-flex justify-content-end gap-3 mx-auto w-100 pb-5 d-print-none" style={{ maxWidth: "800px" }}>
        <button
          className="btn px-4 py-2 fw-bold text-white shadow-sm d-flex align-items-center"
          style={{ backgroundColor: "#ff4d4d", borderRadius: "10px" }}
          onClick={handlePrint}
        >
          <i className="fas fa-print me-2"></i>Cetak Bukti Kas
        </button>
      </div>

    </div>
  );
}