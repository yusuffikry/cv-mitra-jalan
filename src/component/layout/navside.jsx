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
import { useLocation } from "react-router-dom";
const customSidebarTheme = {
  root: {
    base: "h-full rounded-none",
    inner:
      "h-full overflow-y-auto overflow-x-hidden rounded-none !bg-white p-0",
  },
  item: {
    base: "flex items-center justify-center rounded-none p-2 text-base font-medium !text-slate-400 hover:!bg-slate-100",
    active: "!bg-slate-800 !text-slate-100",
    icon: {
      base: "h-6 w-6 flex-shrink-0 !text-slate-500 transition duration-75 group-hover:!text-slate-900",
    },
    content: {
      base: "px-3 flex-1 whitespace-nowrap font-medium",
    },
  },
  collapse: {
    button:
      "group flex w-full items-center rounded-none p-2 text-base font-medium !text-slate-300 transition duration-75 hover:!bg-slate-100",
    label: {
      base: "ml-3 flex-1 whitespace-nowrap text-left !text-slate-700",
      icon: {
        base: "h-6 w-6 transition delay-0 duration-100 !text-slate-500",
      },
    },
    list: "space-y-1 py-2 !bg-slate-50",
  },
};
export default function Navside() {
  return (
    <div>
      <Sidebar
        theme={customSidebarTheme}
        className="[&_*]:rounded-none bg-white"
      >
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
              <div className="flex items-center gap-3 px-3 py-4 border-gray-100 mt-2">
                <img
                  className="w-10 h-10 !rounded-full object-cover border border-gray-200"
                  src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                  alt="Rounded avatar"
                />
                <div className="flex flex-col">
                  <b className="text-slate-700 text-sm leading-tight">
                    Pria also ini lagi
                  </b>
                  <small className="text-slate-500 text-xs font-medium">
                    Administrator
                  </small>
                </div>
              </div>
            </SidebarItemGroup>
            <SidebarItemGroup>
              <b className="text-slate-500 text-sm leading-tight">Main Menu</b>
              <SidebarItem
                href="/dashboard"
                active={window.location.pathname === "/dashboard"}
              >
                Dashboard
              </SidebarItem>
              <SidebarItem
                href="/carlist"
                active={window.location.pathname === "/carlist"}
              >
                Car List
              </SidebarItem>
              <SidebarItem
              // href="/carlist"
              // active={window.location.pathname === "/carlist"}
              >
                Customer List
              </SidebarItem>
              <SidebarItem href="#">Transaction</SidebarItem>
            </SidebarItemGroup>
            <SidebarItemGroup>
              <b className="text-slate-500 text-sm leading-tight">Profit</b>
              <SidebarItem href="#">Pemasukan</SidebarItem>
              <SidebarItem href="#">Pengeluaran</SidebarItem>
            </SidebarItemGroup>
            <SidebarItemGroup>
              <b className="text-slate-500 text-sm leading-tight">Kendaraan</b>
              <SidebarItem href="#">Pemantauan Kendaraan</SidebarItem>
              <SidebarItem href="#">Daftar GPS Baru</SidebarItem>
            </SidebarItemGroup>
          </SidebarItems>
        </div>
      </Sidebar>
    </div>
  );
}
