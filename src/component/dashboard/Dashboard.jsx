import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
// PERBAIKAN: Import ikon yang benar untuk desain baru
import { AlertTriangle, Activity, Car, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // State untuk menampung data
  const [stats, setStats] = useState({
    pemasukan: 0,
    pengeluaran: 0,
    mobilTotal: 0,
    mobilJalan: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [topCars, setTopCars] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  // --- PEMBERSIH ANGKA BRUTAL ---
  const parseNumber = (val) => {
    if (!val) return 0;
    const cleanStr = String(val).replace(/\D/g, "");
    return Number(cleanStr) || 0;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [trxRes, expRes, carRes] = await Promise.all([
        supabase.from("transactions").select("*, cars(nomor_plat, jenis_unit), customers(nama_pelanggan)").order("created_at", { ascending: false }),
        supabase.from("expenses").select("*").order("created_at", { ascending: false }),
        supabase.from("cars").select("*"),
      ]);

      if (trxRes.error) throw trxRes.error;
      if (expRes.error) throw expRes.error;
      if (carRes.error) throw carRes.error;

      const transactions = trxRes.data || [];
      const expenses = expRes.data || [];
      const cars = carRes.data || [];

      const totalPemasukan = transactions.reduce((acc, curr) => acc + parseNumber(curr.total_pembayaran), 0);
      const totalPengeluaran = expenses.reduce((acc, curr) => acc + parseNumber(curr.total_pengeluaran), 0);
      
      const today = new Date().toISOString().split("T")[0];
      const mobilJalan = transactions.filter(t => t.tanggal_sewa <= today && t.tanggal_pengembalian >= today).length;

      setStats({
        pemasukan: totalPemasukan,
        pengeluaran: totalPengeluaran,
        mobilTotal: cars.length,
        mobilJalan: mobilJalan,
      });

      setPieData([
        { name: "Pemasukan", value: totalPemasukan, color: "#10b981" },
        { name: "Pengeluaran", value: totalPengeluaran, color: "#ef4444" },
      ]);

      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split("T")[0];
      }).reverse();

      const newChartData = last7Days.map(date => {
        const dailyIncome = transactions
          .filter(t => t.tanggal_sewa === date)
          .reduce((sum, t) => sum + parseNumber(t.total_pembayaran), 0);
          
        const dailyExpense = expenses
          .filter(e => e.tanggal_pengeluaran === date)
          .reduce((sum, e) => sum + parseNumber(e.total_pengeluaran), 0);

        const dayName = new Date(date).toLocaleDateString("id-ID", { weekday: 'short' });
        return { 
          name: dayName, 
          pemasukan: Number(dailyIncome), 
          pengeluaran: Number(dailyExpense) 
        };
      });
      
      setChartData(newChartData);

      const carRentCounts = {};
      transactions.forEach(t => {
        if (t.cars) {
          const plat = t.cars.nomor_plat;
          if (!carRentCounts[plat]) carRentCounts[plat] = { plat, jenis: t.cars.jenis_unit, count: 0 };
          carRentCounts[plat].count += 1;
        }
      });
      const sortedCars = Object.values(carRentCounts).sort((a, b) => b.count - a.count).slice(0, 10);
      setTopCars(sortedCars);

      const mappedTrx = transactions.slice(0, 10).map(t => ({
        id: t.transaction_id,
        type: 'income',
        title: `Penyewaan ${t.cars?.jenis_unit || 'Unit'}`,
        desc: `Pelanggan: ${t.customers?.nama_pelanggan || 'Umum'}`,
        date: t.created_at,
        amount: parseNumber(t.total_pembayaran)
      }));
      const mappedExp = expenses.slice(0, 10).map(e => ({
        id: e.expense_id,
        type: 'expense',
        title: `Pengeluaran: ${e.jenis_pengeluaran}`,
        desc: e.keterangan || 'Biaya Operasional',
        date: e.created_at,
        amount: parseNumber(e.total_pengeluaran)
      }));
      
      const combinedActivity = [...mappedTrx, ...mappedExp]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 15);
      setRecentActivities(combinedActivity);

    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (angka) => {
    if (!angka) return "0";
    if (angka >= 1000000) return (angka / 1000000).toFixed(1) + " Juta";
    return new Intl.NumberFormat("id-ID").format(angka);
  };

  const StatCard = ({ title, value, color, isAlert = false, detail }) => {
    const colors = {
      blue: "border-blue-500",
      green: "border-emerald-500",
      yellow: "border-amber-500",
      red: "border-rose-500",
    };
    return (
      <div className={`bg-white px-4 py-3.5 rounded-xl shadow-sm border-l-4 ${colors[color]} hover:shadow-md transition-shadow flex flex-col justify-center`}>
        <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-end justify-between">
          <div>
            <p className={`text-xl font-bold ${isAlert ? "text-rose-600" : "text-gray-800"}`}>
              {value}
            </p>
            {detail && <p className="text-[10px] text-gray-400 mt-0.5">{detail}</p>}
          </div>
          {isAlert && <AlertTriangle size={20} className="text-rose-500 animate-pulse mb-1" />}
        </div>
      </div>
    );
  };

  const TableRow = ({ name, cat, qty, status, color }) => {
    const badge = {
      green: "bg-emerald-100 text-emerald-700",
      blue: "bg-blue-100 text-blue-700",
      yellow: "bg-amber-100 text-amber-700",
      red: "bg-rose-100 text-rose-700",
    };
    return (
      <tr className="hover:bg-gray-50 transition-colors border-b last:border-0">
        <td className="p-3 lg:p-4 font-bold text-gray-700">{name}</td>
        <td className="p-3 lg:p-4 text-gray-500 text-sm">{cat}</td>
        <td className="p-3 lg:p-4 font-semibold text-gray-700">{qty}</td>
        <td className="p-3 lg:p-4">
          <span className={`${badge[color]} px-2 py-1 rounded-md text-[10px] lg:text-[11px] font-bold uppercase`}>
            {status}
          </span>
        </td>
      </tr>
    );
  };

  const ActivityItem = ({ type, title, desc, time, amount }) => (
    <div className="relative pl-5 lg:pl-6 border-l-2 border-gray-100 pb-4 last:pb-0">
      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{desc}</p>
          <p className="text-[10px] text-gray-400 mt-1 uppercase font-medium">{new Date(time).toLocaleString("id-ID")}</p>
        </div>
        <p className={`text-sm font-bold whitespace-nowrap ${type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {type === 'income' ? '+' : '-'} Rp {new Intl.NumberFormat("id-ID").format(amount)}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center bg-transparent w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-500 mx-auto mb-3"></div>
          <p className="text-gray-500 font-medium">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  const isIncomeHigher = stats.pemasukan >= stats.pengeluaran;

  return (
    <div className="h-full w-full bg-gray-50 font-sans overflow-y-auto">
      <div className="p-6 lg:p-8 pb-32 space-y-6 max-w-7xl mx-auto w-full">
        
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Ringkasan Operasional</h2>
          <p className="text-gray-500 text-sm mt-1">Pantau performa dan keuangan Mitra Jalan hari ini.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard title="Total Pemasukan" value={`Rp ${formatRupiah(stats.pemasukan)}`} color={isIncomeHigher ? "green" : "red"} />
          <StatCard title="Total Pengeluaran" value={`Rp ${formatRupiah(stats.pengeluaran)}`} color={!isIncomeHigher ? "green" : "red"} />
          <StatCard title="Mobil Sedang Jalan" value={`${stats.mobilJalan} Unit`} color="blue" detail="Sedang disewa pelanggan" />
          <StatCard title="Mobil Standby" value={`${stats.mobilTotal - stats.mobilJalan} Unit`} color="yellow" detail="Tersedia di garasi" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Arus Kas</h3>
                  <p className="text-xs text-gray-400 font-medium">Tren Pemasukan & Pengeluaran 7 Hari Terakhir</p>
                </div>
              </div>
            </div>
            <div className="h-64 lg:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} dy={10} />
                  <YAxis 
                    type="number"
                    width={80}
                    domain={[0, 'auto']}
                    allowDataOverflow={false}
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: "#9ca3af" }} 
                    tickFormatter={(val) => {
                      if (val === 0) return "Rp 0";
                      if (val >= 1000000) return `Rp ${val / 1000000} Jt`;
                      if (val >= 1000) return `Rp ${val / 1000}k`;
                      return `Rp ${val}`;
                    }} 
                  />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} formatter={(value) => `Rp ${new Intl.NumberFormat("id-ID").format(value)}`} />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: "20px", fontSize: "12px", fontWeight: "bold" }} />
                  <Line name="Pemasukan" type="monotone" dataKey="pemasukan" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                  <Line name="Pengeluaran" type="monotone" dataKey="pengeluaran" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: "#ef4444", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <h3 className="font-bold text-gray-800 w-full text-left mb-1">Rasio Keuangan</h3>
            <p className="text-xs text-gray-400 font-medium w-full text-left mb-4">Pemasukan vs Pengeluaran</p>
            
            <div className="flex-1 w-full relative min-h-[200px]">
              {stats.pemasukan === 0 && stats.pengeluaran === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">Belum ada data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius="65%" outerRadius="85%" paddingAngle={5} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `Rp ${new Intl.NumberFormat("id-ID").format(value)}`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-gray-500 font-medium">Profit Bersih</span>
                <span className={`text-sm lg:text-base font-bold ${stats.pemasukan >= stats.pengeluaran ? 'text-emerald-600' : 'text-rose-600'}`}>
                  Rp {formatRupiah(stats.pemasukan - stats.pengeluaran)}
                </span>
              </div>
            </div>
            
            <div className="flex justify-center gap-6 mt-4 w-full border-t pt-4">
              <div className="text-center">
                <div className="flex items-center gap-1.5 justify-center mb-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-bold text-gray-600">Masuk</span>
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1.5 justify-center mb-1">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <span className="text-xs font-bold text-gray-600">Keluar</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[400px]">
            <div className="p-3 lg:p-4 border-b flex items-center gap-3 flex-shrink-0 bg-white">
              <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                <Car size={18} />
              </div>
              <h3 className="font-bold text-gray-800 text-sm lg:text-base">Unit Paling Sering Disewa</h3>
            </div>
            
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left">
                <thead className="text-gray-400 text-xs uppercase bg-gray-50/90 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                  <tr>
                    <th className="p-3 lg:p-4 font-bold tracking-wider">Jenis Unit</th>
                    <th className="p-3 lg:p-4 font-bold tracking-wider">Nomor Plat</th>
                    <th className="p-3 lg:p-4 font-bold tracking-wider">Total Disewa</th>
                    <th className="p-3 lg:p-4 font-bold tracking-wider">Performa</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {topCars.length > 0 ? (
                    topCars.map((car, idx) => (
                      <TableRow
                        key={car.plat}
                        name={car.jenis || "-"}
                        cat={car.plat}
                        qty={`${car.count} Kali`}
                        status={idx === 0 ? "Top 1" : "Aktif"}
                        color={idx === 0 ? "green" : "blue"}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-400">Belum ada riwayat penyewaan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[400px]">
            <div className="p-3 lg:p-4 border-b flex items-center gap-3 flex-shrink-0 bg-white z-10 relative shadow-sm">
              <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600">
                <Activity size={18} />
              </div>
              <h3 className="font-bold text-gray-800 text-sm lg:text-base">Aktivitas Terkini</h3>
            </div>
            
            <div className="p-4 lg:p-5 pt-3 overflow-y-auto flex-1 relative">
              {recentActivities.length > 0 ? (
                recentActivities.map((act) => (
                  <ActivityItem
                    key={act.id}
                    type={act.type}
                    title={act.title}
                    desc={act.desc}
                    time={act.date}
                    amount={act.amount}
                  />
                ))
              ) : (
                <p className="text-center text-sm text-gray-400 py-4">Belum ada aktivitas.</p>
              )}
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}