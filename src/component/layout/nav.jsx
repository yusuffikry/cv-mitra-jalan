import {
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";
import { Link } from "react-router-dom";
import Breadcumb from "./breadcumb";

export default function Nav() {
  return (
    <div>
      <Navbar fluid className="py-6 !bg-sky-300">
        <Breadcumb />
        <NavbarToggle />
        {/* <NavbarCollapse>
          <NavbarLink href="#" active>
            Home
          </NavbarLink>
          <NavbarLink as={Link} href="#">
            About
          </NavbarLink>
          <NavbarLink href="#">Services</NavbarLink>
          <NavbarLink href="#">Pricing</NavbarLink>
          <NavbarLink href="#">Contact</NavbarLink>
        </NavbarCollapse> */}
      </Navbar>
    </div>
  );
}
