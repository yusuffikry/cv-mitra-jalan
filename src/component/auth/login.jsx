import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { gsap } from "gsap";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const leftSideRef = useRef(null);
  const rightSideRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      leftSideRef.current,
      { x: -100, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: "power4.out" },
    );
    tl.fromTo(
      rightSideRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: "power2.out" },
      "-=0.5",
    );
    tl.fromTo(
      formRef.current.children,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "back.out(1.7)" },
      "-=0.5",
    );
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMsg("Gagal login: Email atau Password salah.");
      setLoading(false);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="container-fluid vh-100 p-0 font-sans shadow-lg overflow-hidden bg-white">
      <div className="row no-gutters h-100 mx-0">
        <div
          ref={leftSideRef} // Ref GSAP
          className="col-lg-6 d-none d-lg-flex flex-column"
          style={{ backgroundColor: "#5493ff", padding: "60px" }}
        >
          <div className="text-white mt-4 mb-5 d-flex flex-column align-items-center text-center">
            <div style={{ display: "inline-block" }}>
              <h1
                className="font-weight-bold mb-0"
                style={{
                  fontSize: "3.8rem",
                  letterSpacing: "-1px",
                  lineHeight: "1",
                }}
              >
                CV MITRA JALAN
              </h1>
              <p
                className="lead font-italic mb-0 text-right"
                style={{
                  opacity: "0.8",
                  fontSize: "1.2rem",
                  marginTop: "-5px",
                  width: "100%",
                }}
              >
                RENT CAR
              </p>
            </div>
          </div>

          <div className="flex-grow-1 d-flex align-items-center justify-content-center">
            <img
              src="/Image/Car finance-cuate 1.png"
              alt="Illustration Mitra Jalan"
              className="img-fluid"
              style={{ maxWidth: "580px", height: "auto" }}
            />
          </div>
        </div>
        <div
          ref={rightSideRef} // Ref GSAP
          className="col-12 col-lg-6 d-flex align-items-center justify-content-center bg-white"
          style={{ padding: "20px" }}
        >
          <div
            className="card shadow-sm border"
            style={{
              width: "100%",
              maxWidth: "440px",
              borderRadius: "12px",
              borderColor: "#eaeaea",
            }}
          >
            <div className="card-body p-4 p-md-5" ref={formRef}>
              {" "}
              <div className="d-flex flex-column align-items-center justify-content-center text-center mb-4 mb-md-5">
                <img
                  src="/Image/Logo 2.png"
                  alt="Logo Mitra Jalan"
                  className="mb-3 img-fluid"
                  style={{ width: "80px", height: "auto" }}
                />
                <h3
                  className="font-weight-bold mb-1"
                  style={{
                    color: "#5493ff",
                    letterSpacing: "1px",
                    fontSize: "1.4rem",
                    textTransform: "uppercase",
                  }}
                >
                  LOGIN ADMIN
                </h3>
                <p className="text-muted small mb-0">
                  Masuk untuk mengakses dashboard
                </p>
              </div>
              {errorMsg && (
                <div
                  className="alert alert-danger border-0 small py-2 mb-4"
                  role="alert"
                >
                  {errorMsg}
                </div>
              )}
              <form onSubmit={handleLogin}>
                <div className="form-group mb-3 mb-md-4">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      fontSize: "14px",
                      padding: "12px 15px",
                      borderRadius: "8px",
                      backgroundColor: "#fafafa",
                    }}
                  />
                </div>

                <div className="form-group mb-3 mb-md-4 position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      fontSize: "14px",
                      padding: "12px 45px 12px 15px",
                      borderRadius: "8px",
                      backgroundColor: "#fafafa",
                    }}
                  />
                  <span
                    className="position-absolute"
                    style={{
                      right: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#b0b0b0",
                    }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={
                        showPassword ? "fas fa-eye-slash" : "fas fa-eye"
                      }
                    ></i>
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block font-weight-bold mt-4 mt-md-5"
                  style={{
                    backgroundColor: "#5493ff",
                    borderColor: "#5493ff",
                    borderRadius: "8px",
                    padding: "12px",
                    textTransform: "uppercase",
                    boxShadow: "0 4px 12px rgba(84, 147, 255, 0.25)",
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    "Login Now"
                  )}
                </button>
              </form>
              <div className="mt-4 text-center d-lg-none">
                <small className="text-muted text-uppercase">
                  &copy; 2026 <strong>CV Mitra Jalan</strong>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;
