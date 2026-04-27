import React from "react";

function Login() {
  return (
    // Tambahkan overflow-hidden di sini untuk mencegah dekorasi background merusak layout
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
          <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Username"
              className="w-full h-14 px-5 text-base bg-gray-50 border-2 border-neutral-100 rounded-xl focus:border-[#5493ff] focus:bg-white outline-none transition-all placeholder:text-neutral-400"
            />

            <div className="relative group">
              <input
                type="password"
                placeholder="Password"
                className="w-full h-14 px-5 text-base bg-gray-50 border-2 border-neutral-100 rounded-xl focus:border-[#5493ff] focus:bg-white outline-none transition-all placeholder:text-neutral-400"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-[#5493ff]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.301 7.188 7.458 4 12 4c4.542 0 8.699 3.188 9.964 7.678.045.166.045.332 0 .498C20.699 16.812 16.542 20 12 20c-4.542 0-8.699-3.188-9.964-7.678Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </button>
            </div>

            <button
              type="submit"
              className="w-full h-14 mt-4 bg-[#5493ff] hover:bg-[#4082ff] text-white text-lg font-bold rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98] uppercase tracking-wide"
            >
              Login Now
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
