import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { gsap } from "gsap";

export default function Navside() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const sidebarRef = useRef(null);
  const menuItemsRef = useRef([]);

  const isActive = (path) =>
    location.pathname === path ? "active" : "link-dark";

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          navigate("/");
        } else {
          setLoading(false);
        }
      } catch (err) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo(
        sidebarRef.current,
        { x: -280, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      );
    }
  }, [loading]);

  const onMouseEnter = (el) => {
    if (window.innerWidth > 992) {
      gsap.to(el, { x: 10, duration: 0.3, ease: "power2.out" });
    }
  };

  const onMouseLeave = (el) => {
    gsap.to(el, { x: 0, duration: 0.3, ease: "power2.in" });
  };

  if (loading) return null;

  return (
    <>
      {/* NAVBAR MOBILE */}
      <nav className="navbar navbar-light bg-white d-lg-none border-bottom px-3 sticky-top">
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <span className="fw-bold text-primary">MITRA JALAN</span>
      </nav>

      {/* OVERLAY MOBILE */}
      {isOpen && (
        <div
          className="position-fixed vh-100 vw-100 d-lg-none"
          style={{
            background: "rgba(0,0,0,0.5)",
            zIndex: 1040,
            top: 0,
            left: 0,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        ref={sidebarRef}
        className={`d-flex flex-column flex-shrink-0 p-3 bg-white border-end shadow-sm sidebar-wrapper ${
          isOpen ? "show-sidebar" : ""
        }`}
        style={{
          width: "280px",
          height: "100vh",
          position: window.innerWidth < 992 ? "fixed" : "sticky",
          top: 0,
          left: 0,
          zIndex: 1050,
          overflowY: "auto",
          overflowX: "hidden", // Hapus scroll horizontal
          transition: "transform 0.3s ease-in-out",
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-3 mb-md-0 me-md-auto">
          <Link
            to="/dashboard"
            className="d-flex align-items-center link-dark text-decoration-none"
          >
            <img
              src="/Image/logoMjN.jpeg"
              width="35"
              height="35"
              className="rounded-circle me-2 shadow-sm"
              alt="Logo"
            />
            <span className="fs-5 fw-bold text-primary">CV. MITRA JALAN</span>
          </Link>
          <button className="btn d-lg-none" onClick={() => setIsOpen(false)}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <hr />

        <div className="d-flex align-items-center mb-3 px-2">
          <img
            src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
            className="rounded-circle me-2 border"
            alt="User"
            style={{ width: "35px" }}
          />
          <div className="lh-1">
            <small className="fw-bold d-block">Pria Also</small>
            <small className="text-muted" style={{ fontSize: "11px" }}>
              Administrator
            </small>
          </div>
        </div>

        <ul className="nav nav-pills flex-column mb-auto">
          <li
            className="nav-item small text-muted text-uppercase fw-bold mb-2 px-2"
            style={{ fontSize: "10px", letterSpacing: "1px" }}
          >
            Main Menu
          </li>
          {[
            {
              to: "/dashboard",
              icon: "fas fa-tachometer-alt",
              label: "Dashboard",
            },
            { to: "/carlist", icon: "fas fa-car", label: "Car List" },
            { to: "/customers", icon: "fas fa-users", label: "Customer List" },
            {
              to: "/transaction",
              icon: "fas fa-receipt",
              label: "Transaction",
            },
          ].map((item, idx) => (
            <li key={idx} className="nav-item">
              <Link
                to={item.to}
                className={`nav-link mb-1 ${isActive(item.to)}`}
                onMouseEnter={(e) => onMouseEnter(e.currentTarget)}
                onMouseLeave={(e) => onMouseLeave(e.currentTarget)}
                onClick={() => setIsOpen(false)}
              >
                <i className={`${item.icon} me-2`}></i> {item.label}
              </Link>
            </li>
          ))}

          {/* PROFIT SECTION */}
          <li
            className="nav-item small text-muted text-uppercase fw-bold mt-4 mb-2 px-2"
            style={{ fontSize: "10px", letterSpacing: "1px" }}
          >
            Profit
          </li>
          <li>
            <Link
              to="/income"
              className={`nav-link mb-1 ${isActive("/income")}`}
              onMouseEnter={(e) => onMouseEnter(e.currentTarget)}
              onMouseLeave={(e) => onMouseLeave(e.currentTarget)}
            >
              <i className="fas fa-arrow-circle-down text-success me-2"></i>{" "}
              Pemasukan
            </Link>
          </li>
          <li>
            <Link
              to="/outcome"
              className={`nav-link mb-1 ${isActive("/outcome")}`}
              onMouseEnter={(e) => onMouseEnter(e.currentTarget)}
              onMouseLeave={(e) => onMouseLeave(e.currentTarget)}
            >
              <i className="fas fa-arrow-circle-up text-danger me-2"></i>{" "}
              Pengeluaran
            </Link>
          </li>

          {/* KENDARAAN SECTION (SUDAH KEMBALI) */}
          <li
            className="nav-item small text-muted text-uppercase fw-bold mt-4 mb-2 px-2"
            style={{ fontSize: "10px", letterSpacing: "1px" }}
          >
            Kendaraan
          </li>
          <li>
            <Link
              to="/kendaraan/pemantauan"
              className={`nav-link mb-1 ${isActive("/kendaraan/pemantauan")}`}
              onMouseEnter={(e) => onMouseEnter(e.currentTarget)}
              onMouseLeave={(e) => onMouseLeave(e.currentTarget)}
            >
              <i className="fas fa-map-marked-alt text-primary me-2"></i>{" "}
              Pemantauan
            </Link>
          </li>
          <li>
            <a
              href="#"
              className="nav-link link-dark mb-1"
              onMouseEnter={(e) => onMouseEnter(e.currentTarget)}
              onMouseLeave={(e) => onMouseLeave(e.currentTarget)}
            >
              <i className="fas fa-plus-square text-info me-2"></i> Daftar GPS
              Baru
            </a>
          </li>
        </ul>

        <hr />
        <div className="px-2 pb-3">
          <button
            className="btn btn-outline-danger btn-sm w-100 shadow-sm"
            onClick={() => supabase.auth.signOut()}
          >
            <i className="fas fa-sign-out-alt me-2"></i> Logout
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 991.98px) {
          .sidebar-wrapper { transform: translateX(-100%); }
          .show-sidebar { transform: translateX(0); }
        }
        .nav-link { border-radius: 8px; transition: background 0.3s; padding: 10px 15px; }
        .nav-link.active { background-color: #5493ff !important; color: white !important; }
        /* Hilangkan scrollbar untuk tampilan lebih bersih tapi tetap bisa di-scroll */
        .sidebar-wrapper::-webkit-scrollbar { width: 0px; }
      `}</style>
    </>
  );
}
