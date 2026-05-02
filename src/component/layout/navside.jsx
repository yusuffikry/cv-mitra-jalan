import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function Navside() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const isActive = (path) =>
    location.pathname === path ? "active" : "link-dark";

  useEffect(() => {
    const checkUser = async () => {
      try {
        if (!supabase) {
          console.error("Supabase client belum diinisialisasi!");
          navigate("/");
          return;
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session) {
          navigate("/");
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Kesalahan autentikasi:", err);
        navigate("/");
      }
    };

    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (err) {
      console.error("Gagal logout:", err);
    }
  };

  // Tampilan Loading saat memvalidasi sesi
  if (loading) {
    return (
      <div className="d-flex vh-100 align-items-center justify-content-center bg-white">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Memvalidasi Sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="d-flex flex-column flex-shrink-0 p-3 bg-white border-end"
      style={{ width: "280px", minHeight: "100vh" }}
    >
      <Link
        to="/dashboard"
        className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none"
      >
        <img
          src="/Image/logoMjN.jpeg"
          width="40"
          height="40"
          className="rounded-circle me-2"
          alt="Logo"
        />
        <span className="fs-5 fw-bold text-primary">CV. MITRA JALAN</span>
      </Link>

      <hr />
      <div className="d-flex align-items-center mb-3 px-2">
        <img
          src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
          className="rounded-circle me-2"
          alt="User"
          style={{ width: "40px", height: "40px", objectFit: "cover" }}
        />
        <div className="lh-sm">
          <div className="fw-bold d-block" style={{ fontSize: "14px" }}>
            Pria Also
          </div>
          <small className="text-muted" style={{ fontSize: "12px" }}>
            Administrator
          </small>
        </div>
      </div>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item small text-muted text-uppercase fw-bold mb-2 px-2">
          Main Menu
        </li>
        <li className="nav-item">
          <Link
            to="/dashboard"
            className={`nav-link ${isActive("/dashboard")}`}
          >
            <i className="fas fa-tachometer-alt me-2"></i> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/carlist" className={`nav-link ${isActive("/carlist")}`}>
            <i className="fas fa-car me-2"></i> Car List
          </Link>
        </li>
        <li>
          <Link
            to="/customers"
            className={`nav-link ${isActive("/customers")}`}
          >
            <i className="fas fa-users me-2"></i> Customer List
          </Link>
        </li>
        <li>
          <Link
            to="/transaction"
            className={`nav-link ${isActive("/transaction")}`}
          >
            <i className="fas fa-receipt me-2"></i> Transaction
          </Link>
        </li>

        {/* Profit Section */}
        <li className="nav-item small text-muted text-uppercase fw-bold mt-4 mb-2 px-2">
          Profit
        </li>
        <li>
          <a href="#" className="nav-link link-dark">
            <i className="fas fa-arrow-circle-down text-success me-2"></i>{" "}
            Pemasukan
          </a>
        </li>
        <li>
          <a href="#" className="nav-link link-dark">
            <i className="fas fa-arrow-circle-up text-danger me-2"></i>{" "}
            Pengeluaran
          </a>
        </li>

        {/* Kendaraan Section */}
        <li className="nav-item small text-muted text-uppercase fw-bold mt-4 mb-2 px-2">
          Kendaraan
        </li>
        <li>
          <a href="#" className="nav-link link-dark">
            <i className="fas fa-map-marked-alt text-primary me-2"></i>{" "}
            Pemantauan
          </a>
        </li>
        <li>
          <a href="#" className="nav-link link-dark">
            <i className="fas fa-plus-square text-info me-2"></i> Daftar GPS
            Baru
          </a>
        </li>
      </ul>

      <hr />

      {/* Logout Button */}
      <div className="px-2">
        <button
          className="btn btn-outline-danger btn-sm w-100"
          onClick={handleLogout}
        >
          <i className="fas fa-sign-out-alt me-2"></i> Logout
        </button>
      </div>
    </div>
  );
}
