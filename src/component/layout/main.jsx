import React from "react";
import Navside from "./navside";
import Nav from "./nav";
import FooterNav from "./fotter";
import { Outlet } from "react-router-dom";

export default function Main() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Navside />
      <div className="flex-1 flex flex-col min-w-0">
        <Nav />
        <main className="p-4 bg-neutral-100 flex-1 overflow-hidden">
          <div className="h-full w-full">
            <Outlet />
          </div>
        </main>
        <FooterNav />
      </div>
    </div>
  );
}
