import React from "react";
import Navside from "./navside";
import Nav from "./nav";
import FooterNav from "./fotter";
import { Outlet } from "react-router-dom";

export default function Main() {
  return (
    <div>
      <div className="flex min-h-screen">
        <Navside />
        <div className="flex-1 flex flex-col">
          <Nav />
          <main className="p-4 bg-neutral-400 flex-1">
            <Outlet />
          </main>
          <FooterNav />
        </div>
      </div>
    </div>
  );
}
