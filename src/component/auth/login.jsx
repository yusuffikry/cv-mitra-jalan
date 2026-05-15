import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

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
    <div className="container-fluid vh-100 p-0 font-sans shadow-lg overflow-hidden">
      <div className="row no-gutters h-100 mx-0">
        <div
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
              onError={(e) => {
                e.target.src =
                  "https://illustrations.popsy.co/white/car-rental.svg";
                e.target.style.maxWidth = "350px";
              }}
            />
          </div>
        </div>
        <div
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
            <div className="card-body p-4 p-md-5">
              <div className="d-flex flex-column align-items-center justify-content-center text-center mb-4 mb-md-5">
                <img
                  src="/Image/Logo 2.png"
                  alt="Logo Mitra Jalan"
                  className="mb-3 img-fluid"
                  style={{
                    width: "80px",
                    height: "auto",
                    display: "block",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
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
                  <i className="fas fa-exclamation-circle mr-2"></i> {errorMsg}
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
                      borderColor: "#dcdcdc",
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
                      borderColor: "#dcdcdc",
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
                      zIndex: "5",
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
                    fontSize: "14px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    boxShadow: "0 4px 12px rgba(84, 147, 255, 0.25)",
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <span
                      className="spinner-border spinner-border-sm mr-2"
                      role="status"
                    ></span>
                  ) : (
                    "Login Now"
                  )}
                </button>
              </form>

              <div className="mt-4 text-center d-lg-none">
                <small
                  className="text-muted text-uppercase"
                  style={{ letterSpacing: "1px" }}
                >
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
