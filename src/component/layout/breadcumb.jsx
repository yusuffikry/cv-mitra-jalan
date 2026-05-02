import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb mb-0 py-2 px-3 bg-light rounded shadow-sm">
        <li className="breadcrumb-item">
          <Link
            to="/dashboard"
            className="text-decoration-none d-flex align-items-center"
          >
            <i className="fas fa-home me-2"></i> Dashboard
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const displayName =
            value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " ");
          if (displayName.toLowerCase() === "dashboard") return null;
          return isLast ? (
            <li
              key={routeTo}
              className="breadcrumb-item active"
              aria-current="page"
            >
              {displayName}
            </li>
          ) : (
            <li key={routeTo} className="breadcrumb-item">
              <Link to={routeTo} className="text-decoration-none">
                {displayName}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
