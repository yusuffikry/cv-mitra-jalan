import React, { useState } from "react";
import { Await, useNavigate } from "react-router-dom";
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
    <div
      className="hold-transition login-page"
      style={{ backgroundColor: "#f4f6f9" }}
    >
      <div className="login-box" style={{ width: "400px" }}>
        <div className="login-logo">
          <img
            src="/Image/Logo 2.png"
            alt="Logo"
            style={{ width: "100px", marginBottom: "10px" }}
          />
          <br />
          <a href="#">
            <b style={{ color: "#5493ff" }}>MITRA</b> JALAN
          </a>
        </div>
        <div
          className="card card-outline card-primary"
          style={{ borderTopColor: "#5493ff" }}
        >
          <div className="card-header text-center">
            <h1
              className="h4 m-0 font-weight-bold"
              style={{ color: "#5493ff" }}
            >
              LOGIN ADMIN
            </h1>
            <p className="text-muted small">Masuk untuk mengakses dashboard</p>
          </div>
          <div className="card-body login-card-body">
            {errorMsg && (
              <div className="alert alert-danger p-2 text-sm">{errorMsg}</div>
            )}

            <form onSubmit={handleLogin}>
              {/* Email Input */}
              <div className="input-group mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-envelope"></span>
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div className="input-group mb-3">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="input-group-append">
                  <div
                    className="input-group-text"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span
                      className={
                        showPassword ? "fas fa-eye-slash" : "fas fa-eye"
                      }
                    ></span>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-primary btn-block font-weight-bold"
                    style={{
                      backgroundColor: "#5493ff",
                      borderColor: "#5493ff",
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm mr-2"></span>
                    ) : (
                      "LOGIN NOW"
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-4 text-center">
              <p className="text-muted text-sm">
                &copy; 2026{" "}
                <span style={{ color: "#5493ff" }}>CV Mitra Jalan</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
