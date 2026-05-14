import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
// Install lucide-react jika ingin menggunakan ikon: npm install lucide-react
import {
  LayoutDashboard,
  Package,
  Truck,
  FileText,
  LogOut,
  Search,
  Bell,
  AlertTriangle,
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Dashboard Body */}
        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Barang" value="1,240" color="blue" />
            <StatCard title="Armada Aktif" value="12 / 15" color="green" />
            <StatCard title="Surat Jalan" value="8 Pending" color="yellow" />
            <StatCard title="Stok Kritis" value="3 Item" color="red" isAlert />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Table Section */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">Stok Material Utama</h3>
                <button className="text-sm text-blue-600 font-medium">
                  Kelola Stok
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-gray-400 text-xs uppercase bg-gray-50">
                    <tr>
                      <th className="p-4 font-medium">Nama Barang</th>
                      <th className="p-4 font-medium">Kategori</th>
                      <th className="p-4 font-medium">Sisa Stok</th>
                      <th className="p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y">
                    <TableRow
                      name="Semen Tiga Roda"
                      cat="Material"
                      qty="250 Sak"
                      status="Aman"
                      color="green"
                    />
                    <TableRow
                      name="Besi Beton 12mm"
                      cat="Konstruksi"
                      qty="15 Lonjor"
                      status="Menipis"
                      color="yellow"
                    />
                    <TableRow
                      name="Aspal Drum"
                      cat="Material"
                      qty="2 Drum"
                      status="Kritis"
                      color="red"
                    />
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-700 mb-6 flex items-center justify-between">
                Aktivitas Terakhir
                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded-full uppercase">
                  Live
                </span>
              </h3>
              <div className="space-y-6">
                <ActivityItem
                  label="Pengeluaran Barang"
                  desc="Driver: Andi - Proyek A"
                  time="10 Menit lalu"
                />
                <ActivityItem
                  label="Penerimaan Stok"
                  desc="Vendor: PT. Maju Jaya"
                  time="2 Jam lalu"
                />
                <ActivityItem
                  label="Update Armada"
                  desc="DT-04 masuk bengkel"
                  time="Kemarin"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sub-components untuk keterbacaan kode (bisa dipisah ke file berbeda nanti)

const NavItem = ({ icon, label, active = false }) => (
  <a
    href="#"
    className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </a>
);

const StatCard = ({ title, value, color, isAlert = false }) => {
  const colors = {
    blue: "border-blue-500",
    green: "border-green-500",
    yellow: "border-yellow-500",
    red: "border-red-500",
  };
  return (
    <div
      className={`bg-white p-5 rounded-xl shadow-sm border-l-4 ${colors[color]} hover:shadow-md transition-shadow`}
    >
      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
        {title}
      </p>
      <div className="flex items-center justify-between mt-1">
        <p
          className={`text-2xl font-bold ${isAlert ? "text-red-600" : "text-gray-800"}`}
        >
          {value}
        </p>
        {isAlert && (
          <AlertTriangle size={20} className="text-red-500 animate-pulse" />
        )}
      </div>
    </div>
  );
};

const TableRow = ({ name, cat, qty, status, color }) => {
  const badge = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
  };
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="p-4 font-medium text-gray-700">{name}</td>
      <td className="p-4 text-gray-500">{cat}</td>
      <td className="p-4 font-semibold">{qty}</td>
      <td className="p-4">
        <span
          className={`${badge[color]} px-2.5 py-1 rounded-md text-[11px] font-bold uppercase`}
        >
          {status}
        </span>
      </td>
    </tr>
  );
};

const ActivityItem = ({ label, desc, time }) => (
  <div className="relative pl-6 border-l-2 border-gray-100 pb-2">
    <div className="absolute -left-[7px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
    <p className="text-sm font-semibold text-gray-800">{label}</p>
    <p className="text-xs text-gray-500">{desc}</p>
    <p className="text-[10px] text-gray-400 mt-1 uppercase">{time}</p>
  </div>
);

export default Dashboard;
