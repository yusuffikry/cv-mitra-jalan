import React, { useState, useEffect, useRef } from "react";
import Navside from "./navside";
import Nav from "./nav";
import FooterNav from "./fotter";
import { Outlet } from "react-router-dom";
import { gsap } from "gsap";

export default function Main() {
  const [showText, setShowText] = useState(true);
  const fabRef = useRef(null);
  const bubbleRef = useRef(null);

  useEffect(() => {
    gsap.to(fabRef.current, {
      y: -10,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });

    // Teks hilang otomatis setelah 5 detik
    const timer = setTimeout(() => {
      handleHideText();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleHideText = () => {
    if (bubbleRef.current) {
      gsap.to(bubbleRef.current, {
        opacity: 0,
        x: 20,
        duration: 0.5,
        onComplete: () => setShowText(false),
      });
    }
  };

  const toggleText = () => {
    if (!showText) {
      setShowText(true);
      // Animasi muncul kembali
      setTimeout(() => {
        gsap.fromTo(
          bubbleRef.current,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.5, ease: "back.out(1.7)" },
        );
      }, 10);
    } else {
      handleHideText();
    }
  };

  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden position-relative">
      <Navside />
      <div className="flex-1 flex flex-col min-w-0">
        <Nav />
        <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
        <FooterNav />
      </div>

      {/* FLOATING ASSISTANT (Pop-up Bundar) */}
      <div
        className="position-fixed d-flex align-items-center"
        style={{
          bottom: "80px",
          right: "30px",
          zIndex: 2000,
          cursor: "pointer",
        }}
      >
        {/* Pop-up Teks */}
        {showText && (
          <div
            ref={bubbleRef}
            className="bg-white text-dark shadow-sm px-3 py-2 rounded-pill me-3 border d-none d-md-block"
            style={{
              fontSize: "14px",
              fontWeight: "600",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            }}
          >
            Halo Admin! Siap pantau armada hari ini? 👋
          </div>
        )}

        {/* Tombol Bundar (FAB) */}
        <div
          ref={fabRef}
          onClick={toggleText}
          className="rounded-circle d-flex align-items-center justify-content-center shadow-lg"
          style={{
            width: "55px",
            height: "55px",
            backgroundColor: "#3b82f6",
            color: "white",
            fontSize: "20px",
            border: "2px solid white",
          }}
        >
          <i className="fas fa-headset"></i>
        </div>
      </div>
    </div>
  );
}
