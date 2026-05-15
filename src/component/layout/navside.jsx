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

  const isActive = (path) =>
    location.pathname === path ? "active-custom" : "link-light-custom";

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
      gsap.to(el, {
        x: 8,
        duration: 0.3,
        ease: "power2.out",
        backgroundColor: "rgba(255,255,255,0.08)",
      });
    }
  };

  const onMouseLeave = (el) => {
    gsap.to(el, {
      x: 0,
      duration: 0.3,
      ease: "power2.in",
      backgroundColor: "transparent",
    });
  };

  if (loading) return null;

  return (
    <>
      <nav
        className="navbar navbar-dark d-lg-none border-bottom px-3 sticky-top"
        style={{ backgroundColor: "#1e293b", zIndex: 1030 }}
      >
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <span className="fw-bold text-white ms-2">MITRA JALAN</span>
      </nav>

      {/* OVERLAY MOBILE */}
      {isOpen && (
        <div
          className="position-fixed vh-100 vw-100 d-lg-none"
          style={{
            background: "rgba(0,0,0,0.6)",
            zIndex: 1040,
            top: 0,
            left: 0,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        ref={sidebarRef}
        className={`d-flex flex-column flex-shrink-0 p-3 sidebar-wrapper ${isOpen ? "show-sidebar" : ""}`}
        style={{
          width: "280px",
          height: "100vh",
          position: window.innerWidth < 992 ? "fixed" : "sticky",
          top: 0,
          left: 0,
          zIndex: 1050,
          backgroundColor: "#1e293b",
          color: "#cbd5e1",
          overflowY: "auto",
          overflowX: "hidden",
          transition: "transform 0.3s ease-in-out",
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-3 px-2">
          <Link
            to="/dashboard"
            className="d-flex align-items-center text-decoration-none"
          >
            <img
              src="/Image/logoMjN.jpeg"
              width="35"
              height="35"
              className="rounded-circle me-2 border border-secondary"
              alt="Logo"
            />
            <span className="fs-5 fw-bold text-white">MITRA JALAN</span>
          </Link>
          <button
            className="btn text-white d-lg-none"
            onClick={() => setIsOpen(false)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <hr className="border-secondary opacity-25" />

        <div
          className="d-flex align-items-center mb-3 p-2 rounded"
          style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
        >
          <img
            src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
            className="rounded-circle me-2 border border-secondary"
            alt="User"
            style={{ width: "38px" }}
          />
          <div className="lh-1">
            <small className="fw-bold d-block text-white">Pria Also</small>
            <small className="text-secondary" style={{ fontSize: "11px" }}>
              Administrator
            </small>
          </div>
        </div>

        <ul className="nav nav-pills flex-column mb-auto">
          <li
            className="nav-item small text-secondary text-uppercase fw-bold mb-2 px-2"
            style={{ fontSize: "10px", letterSpacing: "1.2px", opacity: 0.6 }}
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
                className={`nav-link mb-1 d-flex align-items-center ${isActive(item.to)}`}
                onMouseEnter={(e) => onMouseEnter(e.currentTarget)}
                onMouseLeave={(e) => onMouseLeave(e.currentTarget)}
                onClick={() => setIsOpen(false)}
              >
                <i
                  className={`${item.icon} me-3`}
                  style={{ width: "20px" }}
                ></i>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}

          <li
            className="nav-item small text-secondary text-uppercase fw-bold mt-4 mb-2 px-2"
            style={{ fontSize: "10px", letterSpacing: "1.2px", opacity: 0.6 }}
          >
            Profit
          </li>
          <li>
            <Link
              to="/income"
              className={`nav-link mb-1 d-flex align-items-center ${isActive("/income")}`}
              onMouseEnter={(e) => onMouseEnter(e.currentTarget)}
              onMouseLeave={(e) => onMouseLeave(e.currentTarget)}
            >
              <i
                className="fas fa-arrow-circle-down text-success me-3"
                style={{ width: "20px" }}
              ></i>{" "}
              Pemasukan
            </Link>
          </li>
          <li>
            <Link
              to="/outcome"
              className={`nav-link mb-1 d-flex align-items-center ${isActive("/outcome")}`}
              onMouseEnter={(e) => onMouseEnter(e.currentTarget)}
              onMouseLeave={(e) => onMouseLeave(e.currentTarget)}
            >
              <i
                className="fas fa-arrow-circle-up text-danger me-3"
                style={{ width: "20px" }}
              ></i>{" "}
              Pengeluaran
            </Link>
          </li>

          <li
            className="nav-item small text-secondary text-uppercase fw-bold mt-4 mb-2 px-2"
            style={{ fontSize: "10px", letterSpacing: "1.2px", opacity: 0.6 }}
          >
            Kendaraan
          </li>
          <li>
            <Link
              to="/kendaraan/pemantauan"
              className={`nav-link mb-1 d-flex align-items-center ${isActive("/kendaraan/pemantauan")}`}
              onMouseEnter={(e) => onMouseEnter(e.currentTarget)}
              onMouseLeave={(e) => onMouseLeave(e.currentTarget)}
            >
              <i
                className="fas fa-map-marked-alt text-info me-3"
                style={{ width: "20px" }}
              ></i>{" "}
              Pemantauan
            </Link>
          </li>
          <li>
            <a
              href="#"
              className="nav-link link-light-custom mb-1 d-flex align-items-center"
              onMouseEnter={(e) => onMouseEnter(e.currentTarget)}
              onMouseLeave={(e) => onMouseLeave(e.currentTarget)}
            >
              <i
                className="fas fa-plus-square text-warning me-3"
                style={{ width: "20px" }}
              ></i>{" "}
              Daftar GPS Baru
            </a>
          </li>
        </ul>

        <hr className="border-secondary opacity-25" />
        <div className="px-2 pb-3">
          <button
            className="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center"
            onClick={() => supabase.auth.signOut()}
            style={{ opacity: 0.7, fontSize: "13px" }}
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
        
        .nav-link { 
          border-radius: 8px; 
          padding: 12px 15px; 
          font-size: 14px;
          transition: color 0.3s ease;
        }

        .link-light-custom {
          color: #94a3b8 !important;
        }

        .link-light-custom:hover {
          color: #ffffff !important;
        }

        .active-custom { 
          background-color: #3b82f6 !important; 
          color: white !important; 
        }

        .sidebar-wrapper::-webkit-scrollbar { width: 0px; }
      `}</style>
    </>
  );
}
