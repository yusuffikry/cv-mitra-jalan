import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { gsap } from "gsap";

export default function Navside() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef(null);

  const isActive = (path) =>
    location.pathname === path ? "active-custom" : "link-light-custom";

  useEffect(() => {
    const checkInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) navigate("/");
        else setLoading(false);
      } catch (err) {
        navigate("/");
      }
    };
    checkInitialSession();
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
        x: isCollapsed ? 4 : 8,
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
      <div
        ref={sidebarRef}
        className={`d-flex flex-column flex-shrink-0 p-3 sidebar-wrapper ${isCollapsed ? "collapsed-mode" : ""}`}
        style={{
          width: isCollapsed ? "85px" : "280px",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1050,
          backgroundColor: "#1e293b",
          color: "#cbd5e1",
          overflowY: "auto",
          overflowX: "hidden",
          transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className={`d-flex align-items-center mb-3 px-2 ${isCollapsed ? "flex-column gap-3" : "justify-content-between"}`}
        >
          <Link
            to="/dashboard"
            className={`d-flex align-items-center text-decoration-none overflow-hidden ${isCollapsed ? "justify-content-center" : ""}`}
          >
            <img
              src="/Image/logoMjN.jpeg"
              width={isCollapsed ? "50" : "35"}
              height={isCollapsed ? "50" : "35"}
              className="rounded-circle border border-secondary flex-shrink-0 transition-all"
              style={{ transition: "all 0.3s ease" }}
              alt="Logo"
            />
            {!isCollapsed && (
              <span className="fs-5 fw-bold text-white nav-text ms-2">
                MITRA JALAN
              </span>
            )}
          </Link>
          <button
            className="btn text-white p-1"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <i
              className={`fas ${isCollapsed ? "fa-bars" : "fa-outdent"}`}
              style={{ fontSize: isCollapsed ? "20px" : "inherit" }}
            ></i>
          </button>
        </div>

        <hr className="border-secondary opacity-25" />
        <div
          className="d-flex align-items-center mb-3 p-2 rounded"
          style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
        >
          <img
            src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
            className="rounded-circle me-2 border border-secondary flex-shrink-0"
            alt="User"
            style={{ width: "38px" }}
          />
          {!isCollapsed && (
            <div className="lh-1 nav-text">
              <small className="fw-bold d-block text-white">Pria Also</small>
              <small className="text-secondary" style={{ fontSize: "11px" }}>
                Administrator
              </small>
            </div>
          )}
        </div>
        <ul className="nav nav-pills flex-column mb-auto">
          {!isCollapsed && (
            <li className="nav-item small text-secondary text-uppercase fw-bold mb-2 px-2 section-title">
              Main Menu
            </li>
          )}

          <li className="nav-item position-relative menu-item">
            <Link
              to="/dashboard"
              className={`nav-link mb-1 d-flex align-items-center ${isActive("/dashboard")}`}
              onMouseEnter={(e) => onMouseEnter(e.currentTarget)}
              onMouseLeave={(e) => onMouseLeave(e.currentTarget)}
            >
              <i
                className="fas fa-tachometer-alt nav-icon text-center"
                style={{ width: "25px" }}
              ></i>
              {!isCollapsed && <span className="ms-3 nav-text">Dashboard</span>}
              {isCollapsed && <div className="custom-tooltip">Dashboard</div>}
            </Link>
          </li>

          <li className="nav-item position-relative menu-item">
            <Link
              to="/carlist"
              className={`nav-link mb-1 d-flex align-items-center ${isActive("/carlist")}`}
              onMouseEnter={(e) => onMouseEnter(e.currentTarget)}
              onMouseLeave={(e) => onMouseLeave(e.currentTarget)}
            >
              <i
                className="fas fa-car nav-icon text-center"
                style={{ width: "25px" }}
              ></i>
              {!isCollapsed && <span className="ms-3 nav-text">Car List</span>}
              {isCollapsed && <div className="custom-tooltip">Car List</div>}
            </Link>
          </li>

          <li className="nav-item position-relative menu-item">
            <Link
              to="/customers"
              className={`nav-link mb-1 d-flex align-items-center ${isActive("/customers")}`}
              onMouseEnter={(e) => onMouseEnter(e.currentTarget)}
              onMouseLeave={(e) => onMouseLeave(e.currentTarget)}
            >
              <i
                className="fas fa-users nav-icon text-center"
                style={{ width: "25px" }}
              ></i>
              {!isCollapsed && (
                <span className="ms-3 nav-text">Customer List</span>
              )}
              {isCollapsed && (
                <div className="custom-tooltip">Customer List</div>
              )}
            </Link>
          </li>

          <li className="nav-item position-relative menu-item">
            <Link
              to="/transaction"
              className={`nav-link mb-1 d-flex align-items-center ${isActive("/transaction")}`}
              onMouseEnter={(e) => onMouseEnter(e.currentTarget)}
              onMouseLeave={(e) => onMouseLeave(e.currentTarget)}
            >
              <i
                className="fas fa-receipt nav-icon text-center"
                style={{ width: "25px" }}
              ></i>
              {!isCollapsed && (
                <span className="ms-3 nav-text">Transaction</span>
              )}
              {isCollapsed && <div className="custom-tooltip">Transaction</div>}
            </Link>
          </li>
          {!isCollapsed && (
            <li className="nav-item small text-secondary text-uppercase fw-bold mt-4 mb-2 px-2 section-title">
              Profit
            </li>
          )}

          <li className="nav-item position-relative menu-item">
            <Link
              to="/income"
              className={`nav-link mb-1 d-flex align-items-center ${isActive("/income")}`}
              onMouseEnter={(e) => onMouseEnter(e.currentTarget)}
              onMouseLeave={(e) => onMouseLeave(e.currentTarget)}
            >
              <i
                className="fas fa-arrow-circle-down text-success nav-icon text-center"
                style={{ width: "25px" }}
              ></i>
              {!isCollapsed && <span className="ms-3 nav-text">Pemasukan</span>}
              {isCollapsed && <div className="custom-tooltip">Pemasukan</div>}
            </Link>
          </li>

          <li className="nav-item position-relative menu-item">
            <Link
              to="/outcome"
              className={`nav-link mb-1 d-flex align-items-center ${isActive("/outcome")}`}
              onMouseEnter={(e) => onMouseEnter(e.currentTarget)}
              onMouseLeave={(e) => onMouseLeave(e.currentTarget)}
            >
              <i
                className="fas fa-arrow-circle-up text-danger nav-icon text-center"
                style={{ width: "25px" }}
              ></i>
              {!isCollapsed && (
                <span className="ms-3 nav-text">Pengeluaran</span>
              )}
              {isCollapsed && <div className="custom-tooltip">Pengeluaran</div>}
            </Link>
          </li>
          {!isCollapsed && (
            <li className="nav-item small text-secondary text-uppercase fw-bold mt-4 mb-2 px-2 section-title">
              Kendaraan
            </li>
          )}

          <li className="nav-item position-relative menu-item">
            <Link
              to="/kendaraan/pemantauan"
              className={`nav-link mb-1 d-flex align-items-center ${isActive("/kendaraan/pemantauan")}`}
              onMouseEnter={(e) => onMouseEnter(e.currentTarget)}
              onMouseLeave={(e) => onMouseLeave(e.currentTarget)}
            >
              <i
                className="fas fa-map-marked-alt text-info nav-icon text-center"
                style={{ width: "25px" }}
              ></i>
              {!isCollapsed && (
                <span className="ms-3 nav-text">Pemantauan</span>
              )}
              {isCollapsed && <div className="custom-tooltip">Pemantauan</div>}
            </Link>
          </li>

          <li className="nav-item position-relative menu-item">
            <a
              href="#"
              className="nav-link link-light-custom mb-1 d-flex align-items-center"
              onMouseEnter={(e) => onMouseEnter(e.currentTarget)}
              onMouseLeave={(e) => onMouseLeave(e.currentTarget)}
            >
              <i
                className="fas fa-plus-square text-warning nav-icon text-center"
                style={{ width: "25px" }}
              ></i>
              {!isCollapsed && (
                <span className="ms-3 nav-text">Daftar GPS Baru</span>
              )}
              {isCollapsed && (
                <div className="custom-tooltip">Daftar GPS Baru</div>
              )}
            </a>
          </li>
        </ul>

        <hr className="border-secondary opacity-25" />
        <div className="px-2 pb-3">
          <button
            className="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center"
            onClick={() => supabase.auth.signOut()}
          >
            <i className="fas fa-sign-out-alt"></i>
            {!isCollapsed && <span className="ms-2 nav-text">Logout</span>}
          </button>
        </div>
      </div>

      <style>{`
        /* Menghilangkan scrollbar tapi tetap bisa scroll */
        .sidebar-wrapper::-webkit-scrollbar { width: 0px; }
        
        .nav-link { border-radius: 8px; transition: background 0.3s; }
        .collapsed-mode .nav-link { justify-content: center; padding: 12px 0; }
        
        /* Tooltip tetap muncul saat hover meski collapse */
        .menu-item:hover .custom-tooltip { display: block; }
        .custom-tooltip {
          display: none; position: absolute; left: 100%; top: 50%; transform: translateY(-50%);
          background: #3b82f6; color: white; padding: 5px 12px; border-radius: 4px;
          font-size: 12px; margin-left: 15px; z-index: 1060; white-space: nowrap;
        }

        .section-title { font-size: 10px; letter-spacing: 1.2px; opacity: 0.6; }
        .link-light-custom { color: #94a3b8 !important; }
        .active-custom { background-color: #3b82f6 !important; color: white !important; }

        /* Responsif Mobile: Sidebar tetap nempel, hanya lebar yang berubah */
        @media (max-width: 991.98px) {
           .sidebar-wrapper {
             box-shadow: 5px 0 15px rgba(0,0,0,0.3);
           }
        }
      `}</style>
    </>
  );
}
