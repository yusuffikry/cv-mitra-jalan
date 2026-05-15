import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { FileText, AlertTriangle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function Dashboard() {
  const dataChart = [
    { name: "Sen", pengeluaran: 400, pemasukan: 240 },
    { name: "Sel", pengeluaran: 300, pemasukan: 139 },
    { name: "Rab", pengeluaran: 200, pemasukan: 980 },
    { name: "Kam", pengeluaran: 278, pemasukan: 390 },
    { name: "Jum", pengeluaran: 189, pemasukan: 480 },
    { name: "Sab", pengeluaran: 239, pemasukan: 380 },
    { name: "Min", pengeluaran: 349, pemasukan: 430 },
  ];

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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    /* Menghapus h-screen dan overflow-y-auto agar mengikuti scroll dari Main.jsx */
    <div className="w-full space-y-6">
      {/* Stats Grid - Full Width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pemasukan (Rp)" value="1.240.000" color="green" />
        <StatCard title="Pengeluaran (Rp)" value="2.250.000" color="red" />
        <StatCard title="Mobil Standby" value="8 Unit" color="yellow" />
        <StatCard title="Mobil Jalan" value="3 Unit" color="blue" />
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-700">Profit & Loss</h3>
              <p className="text-xs text-gray-400">
                Monitoring Arus Kas Mingguan
              </p>
            </div>
          </div>
          <select className="text-xs border rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option>7 Hari Terakhir</option>
            <option>30 Hari Terakhir</option>
          </select>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dataChart}
              margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: "20px", fontSize: "12px" }}
              />
              <Line
                name="Pemasukan"
                type="monotone"
                dataKey="pemasukan"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
              />
              <Line
                name="Pengeluaran"
                type="monotone"
                dataKey="pengeluaran"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4, fill: "#ef4444", strokeWidth: 2, stroke: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lower Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b bg-gray-50/50">
            <h3 className="font-bold text-gray-700">
              Status Kendaraan & Material
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-gray-400 text-xs uppercase bg-gray-50 font-medium">
                <tr>
                  <th className="p-4">Nama Item</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Sisa Stok</th>
                  <th className="p-4">Status</th>
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-700 mb-6">Aktivitas Terakhir</h3>
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
  );
}

// --- Sub-components (Disesuaikan agar tidak konflik) ---

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
      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
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
          className={`${badge[color]} px-2.5 py-1 rounded-md text-[10px] font-bold uppercase`}
        >
          {status}
        </span>
      </td>
    </tr>
  );
};

const ActivityItem = ({ label, desc, time }) => (
  <div className="relative pl-6 border-l-2 border-gray-100 pb-2">
    <div className="absolute -left-[7px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
    <p className="text-sm font-semibold text-gray-800">{label}</p>
    <p className="text-xs text-gray-500">{desc}</p>
    <p className="text-[10px] text-gray-400 mt-1 uppercase font-medium">
      {time}
    </p>
  </div>
);

export default Dashboard;
