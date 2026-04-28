import React from "react";
import Navside from "./navside";
import Nav from "./nav";
import { Outlet } from "react-router-dom";

export default function Main() {
  return (
    <div>
      <div className="flex min-h-screen">
        <Navside />
        <div className="flex-1 flex flex-col">
          <Nav />
          <main className="p-4 bg-gray-100 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
