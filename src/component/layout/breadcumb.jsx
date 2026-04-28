import { Breadcrumb, BreadcrumbItem } from "flowbite-react";
import { HiHome } from "react-icons/hi";
import { useLocation, Link } from "react-router-dom";

export default function Breadcumb() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div>
      <Breadcrumb aria-label="Default breadcrumb example">
        <BreadcrumbItem
          href="/dashboard"
          icon={HiHome}
          className="!text-white [&_a]:!text-white"
        >
          Dashboard
        </BreadcrumbItem>
        {pathnames.map((value, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const displayName =
            value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " ");
          if (displayName.toLowerCase() === "dashboard") return null;
          return (
            <BreadcrumbItem
              key={routeTo}
              href={routeTo}
              className="!text-white"
            >
              {displayName}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumb>
    </div>
  );
}
