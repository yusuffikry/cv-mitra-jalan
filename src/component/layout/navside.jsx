import {
  Sidebar,
  SidebarCollapse,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
} from "flowbite-react";
import {
  HiArrowSmRight,
  HiChartPie,
  HiInbox,
  HiOutlineMinusSm,
  HiOutlinePlusSm,
  HiShoppingBag,
  HiTable,
  HiUser,
} from "react-icons/hi";
import { twMerge } from "tailwind-merge";
const customSidebarTheme = {
  root: {
    base: "h-full rounded-none",
    inner: "h-full overflow-y-auto overflow-x-hidden rounded-none bg-white p-0",
  },
};
export default function Navside() {
  return (
    <div>
      <Sidebar theme={customSidebarTheme} className="[&_*]:rounded-none">
        <div className="bg-blue-800 py-3 px-5 flex items-center justify-start gap-4">
          <img
            src="/Image/logoMjN.jpeg"
            alt="Logo Msafe"
            className="h-12 w-12 !rounded-full object-cover border-2 border-white/20"
          />
          <h1 className="text-white font-extrabold text-sm leading-tight tracking-wider uppercase">
            CV. MITRA JALAN
          </h1>
        </div>
        <div className="px-3 py-4">
          <SidebarItems>
            <SidebarItemGroup>
              <SidebarItem href="#" icon={HiChartPie}>
                Dashboard
              </SidebarItem>
              <SidebarCollapse
                icon={HiShoppingBag}
                label="E-commerce"
                renderChevronIcon={(theme, open) => {
                  const IconComponent = open
                    ? HiOutlineMinusSm
                    : HiOutlinePlusSm;

                  return (
                    <IconComponent
                      aria-hidden
                      className={twMerge(
                        theme.label.icon.open[open ? "on" : "off"],
                      )}
                    />
                  );
                }}
              >
                <SidebarItem href="#">Products</SidebarItem>
                <SidebarItem href="#">Sales</SidebarItem>
                <SidebarItem href="#">Refunds</SidebarItem>
                <SidebarItem href="#">Shipping</SidebarItem>
              </SidebarCollapse>
              <SidebarItem href="#" icon={HiInbox}>
                Inbox
              </SidebarItem>
              <SidebarItem href="#" icon={HiUser}>
                Users
              </SidebarItem>
              <SidebarItem href="#" icon={HiShoppingBag}>
                Products
              </SidebarItem>
              <SidebarItem href="#" icon={HiArrowSmRight}>
                Sign In
              </SidebarItem>
              <SidebarItem href="#" icon={HiTable}>
                Sign Up
              </SidebarItem>
            </SidebarItemGroup>
          </SidebarItems>
        </div>
      </Sidebar>
    </div>
  );
}
