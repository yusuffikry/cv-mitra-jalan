import React from "react";
import Navside from "./navside";
import Nav from "./nav";
import FooterNav from "./fotter";
import { Outlet } from "react-router-dom";

export default function Main() {
  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden">
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
    </div>
  );
}
