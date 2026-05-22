import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const filteredPathnames = pathnames.filter((segment) => {
    const isId =
      /^[0-9]+$/.test(segment) ||
      /^[a-fA-F0-9{-}]+$/.test(segment) ||
      segment.length > 20;
    return !isId;
  });

  return (
    <nav aria-label="breadcrumb" className="bg-light border-bottom">
      <ol
        className="breadcrumb mb-0 py-1.5 px-3"
        style={{ fontSize: "0.75rem" }}
      >
        <li className="breadcrumb-item">
          <Link
            to="/dashboard"
            className="text-decoration-none text-secondary d-flex align-items-center"
          >
            <i className="fas fa-home me-1.5 small"></i>Dashboard
          </Link>
        </li>
        {filteredPathnames.map((value, index) => {
          const originalIndex = pathnames.indexOf(value);
          const routeTo = `/${pathnames.slice(0, originalIndex + 1).join("/")}`;
          const isLast = index === filteredPathnames.length - 1;
          const displayName =
            value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " ");

          if (displayName.toLowerCase() === "dashboard") return null;

          return isLast ? (
            <li
              key={routeTo}
              className="breadcrumb-item active text-dark fw-bold"
              aria-current="page"
            >
              {displayName}
            </li>
          ) : (
            <li key={routeTo} className="breadcrumb-item">
              <Link
                to={routeTo}
                className="text-decoration-none text-secondary"
              >
                {displayName}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
