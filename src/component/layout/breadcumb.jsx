import { Breadcrumb, BreadcrumbItem } from "flowbite-react";
import { HiHome } from "react-icons/hi";
import { useLocation } from "react-router-dom";

export default function Breadcumb() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div>
      <Breadcrumb
        aria-label="Default breadcrumb example"
        className="[&_a]:!text-white [&_span]:!text-white/80 [&_svg]:!text-white"
      >
        <BreadcrumbItem href="/dashboard" icon={HiHome}>
          Dashboard
        </BreadcrumbItem>
        {pathnames.map((value, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          const displayName =
            value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " ");
          if (displayName.toLowerCase() === "dashboard") return null;
          return (
            <BreadcrumbItem key={routeTo} href={routeTo}>
              {displayName}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumb>
    </div>
  );
}
