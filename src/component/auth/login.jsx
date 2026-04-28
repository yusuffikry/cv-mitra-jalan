import React, { useState } from "react";
import { Await, useNavigate } from 'react-router-dom';
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
      alert("Login berhasil!");
      navigate("/dashboard");
    }
  }

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center bg-[#5493ff] p-12 text-white relative overflow-hidden">
        <div className="z-10 text-center uppercase mb-8">
          <h1 className="text-6xl font-black leading-tight tracking-tighter">
            CV MITRA JALAN
          </h1>
          <p className="text-2xl font-light tracking-[0.3em]">RENT CAR</p>
        </div>

        <div className="relative z-10 w-full max-w-lg">
          <img
            src="/Image/Car finance-cuate 1.png"
            alt="Rent Car Illustration"
            className="w-full h-auto object-contain"
          />
        </div>
        <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-64 h-64 bg-black/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 md:p-10 overflow-y-auto bg-white">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 mb-6 rounded-full p-2 border border-neutral-100 shadow-sm">
              <img
                src="/Image/Logo 2.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-4xl font-extrabold text-[#5493ff] uppercase tracking-tight italic">
              LOGIN ADMIN
            </h2>
            <p className="mt-2 text-neutral-500 font-medium">
              Masuk untuk mengakses dashboard
            </p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleLogin}>
            {errorMsg && (
              <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-xl border border-red-200">
                {errorMsg}
              </div>
            )}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full h-14 px-5 text-base bg-gray-50 border-2 border-neutral-100 rounded-xl focus:border-[#5493ff] focus:bg-white outline-none transition-all placeholder:text-neutral-400"
            />

            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full h-14 px-5 text-base bg-gray-50 border-2 border-neutral-100 rounded-xl focus:border-[#5493ff] focus:bg-white outline-none transition-all placeholder:text-neutral-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-[#5493ff]"
              >
                {showPassword ? (
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                   </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.301 7.188 7.458 4 12 4c4.542 0 8.699 3.188 9.964 7.678.045.166.045.332 0 .498C20.699 16.812 16.542 20 12 20c-4.542 0-8.699-3.188-9.964-7.678Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-14 mt-4 text-white text-lg font-bold rounded-xl shadow-lg shadow-blue-100 transition-all uppercase tracking-wide
                ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-[#5493ff] hover:bg-[#4082ff] active:scale-[0.98]"}`}
            >
              {loading ? "Memproses..." : "Login Now"}
            </button>
          </form>
          
          <div className="mt-12">
            <p className="text-center text-sm text-neutral-400 font-medium">
              &copy; 2026 <span className="text-[#5493ff]">CV Mitra Jalan</span>
              . All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
