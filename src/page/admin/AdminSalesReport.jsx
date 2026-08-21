import { useEffect, useState, useMemo } from "react";
import API from "../../API/Api";
import {
    TrendingUp, Package, ShoppingBag, DollarSign,
    Calendar, XCircle, CheckCircle, Award,
} from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";

const COMMISSION_RATE = 0.30;
const formatCurrency = (val) => (val != null ? `$${Number(val).toFixed(2)}` : "$0.00");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const toStr = (v) => {
    if (!v) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object" && v.$oid) return v.$oid;
    return String(v);
};

export default function AdminSalesReport() {
    const now = new Date();
    // monthYear is either "all" or a "YYYY-MM" string from the native month picker
    const [monthYear, setMonthYear] = useState("all");
    const [allOrders, setAllOrders] = useState([]);
    const [categoryMap, setCategoryMap] = useState({}); // catId -> categoryName
    const [loading, setLoading] = useState(true);

    const selectedMonth = monthYear === "all" ? "all" : Number(monthYear.split("-")[1]) - 1;
    const selectedYear = monthYear === "all" ? "all" : Number(monthYear.split("-")[0]);

    const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [orderRes, subCatRes] = await Promise.all([
                    API.get("/all-orders-report"),
                    API.get("/getallsubcategory"),
                ]);

                const orderList = Array.isArray(orderRes.data)
                    ? orderRes.data
                    : orderRes.data.orders || orderRes.data.data || [];

                const subs = subCatRes.data?.subcategories || [];
                const catMap = {};
                subs.forEach((sub) => {
                    const cat = sub.category;
                    if (cat && cat._id) catMap[String(cat._id)] = cat.categoryName;
                });

                setAllOrders(orderList);
                setCategoryMap(catMap);
            } catch (err) {
                console.error("Fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);


    // Supports "all" for either filter to show every order across that dimension.
       const monthOrders = useMemo(() => {
        return allOrders.filter((o) => {
            const d = new Date(o.createdAt);
            const monthMatch = selectedMonth === "all" || d.getMonth() === selectedMonth;
            const yearMatch = selectedYear === "all" || d.getFullYear() === selectedYear;
            return monthMatch && yearMatch;
        });
    }, [allOrders, monthYear]);

    // ── Orders eligible for revenue/profit (exclude Cancelled/Failed) ──
    const validOrders = useMemo(
        () => monthOrders.filter((o) => !["Cancelled", "Failed"].includes(o.orderStatus)),
        [monthOrders]
    );

    const report = useMemo(() => {
        let grossRevenue = 0;
        let platformProfit = 0;
        let unitsSold = 0;
        const categoryStats = {}; // catId -> { revenue, units, name }
        const dailyStats = {}; // day -> { revenue, profit }

        validOrders.forEach((order) => {
            const orderDate = new Date(order.createdAt);
            const isAllTime = selectedMonth === "all" || selectedYear === "all";
            const key = isAllTime ? orderDate.toISOString().split("T")[0] : orderDate.getDate();
            const label = isAllTime
                ? orderDate.toLocaleDateString("en-CA", { month: "short", day: "numeric" })
                : orderDate.getDate();

            if (!dailyStats[key]) dailyStats[key] = { label, revenue: 0, profit: 0 };

            order.cartItems?.forEach((item) => {
                if (item.status === "Cancelled") return; // skip individually cancelled items

                const rev = (item.price || 0) * (item.quantity || 1);
                const isVendorItem = !!toStr(item.vendorID);
                const itemProfit = isVendorItem ? rev * COMMISSION_RATE : rev;

                grossRevenue += rev;
                platformProfit += itemProfit;
                unitsSold += item.quantity || 1;

                dailyStats[key].revenue += rev;
                dailyStats[key].profit += itemProfit;

                const catId = toStr(item.categoryId) || "uncategorized";
                if (!categoryStats[catId]) {
                    categoryStats[catId] = {
                        name: categoryMap[catId] || (catId === "uncategorized" ? "Uncategorized" : "Unknown Category"),
                        revenue: 0,
                        units: 0,
                    };
                }
                categoryStats[catId].revenue += rev;
                categoryStats[catId].units += item.quantity || 1;
            });
        });

        const totalOrders = monthOrders.length;
        const deliveredOrders = monthOrders.filter((o) => o.orderStatus === "Delivered").length;
        const cancelledOrders = monthOrders.filter((o) => o.orderStatus === "Cancelled").length;

        const categoryBreakdown = Object.values(categoryStats).sort((a, b) => b.revenue - a.revenue);
        const bestCategory = categoryBreakdown[0] || null;

        let trendData;
        if (selectedMonth === "all" || selectedYear === "all") {
            // Group by actual calendar date across the full order history
            trendData = Object.values(dailyStats)
                .sort((a, b) => new Date(a.label) - new Date(b.label))
                .map((d) => ({
                    day: d.label,
                    revenue: Number(d.revenue.toFixed(2)),
                    profit: Number(d.profit.toFixed(2)),
                }));
        } else {
            // Single month selected — show every day of that month, including zero days
            const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
            trendData = Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                return dailyStats[day]
                    ? { day, revenue: Number(dailyStats[day].revenue.toFixed(2)), profit: Number(dailyStats[day].profit.toFixed(2)) }
                    : { day, revenue: 0, profit: 0 };
            });
        }

        return {
            grossRevenue, platformProfit, unitsSold,
            totalOrders, deliveredOrders, cancelledOrders,
            categoryBreakdown, bestCategory, trendData,
        };
   }, [validOrders, monthOrders, categoryMap, monthYear]);

    const periodLabel =
        selectedMonth === "all" && selectedYear === "all"
            ? "All Time"
            : selectedMonth === "all"
                ? `All Months, ${selectedYear}`
                : selectedYear === "all"
                    ? `${MONTHS[selectedMonth]}, All Years`
                    : `${MONTHS[selectedMonth]} ${selectedYear}`;

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <TrendingUp size={24} className="text-[#f00000]" />
                    Admin Sales Report
                </h1>
                <p className="text-gray-500 text-sm mt-1">Platform-wide order performance and profit overview</p>
            </div>

                      {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm w-fit">
                    <Calendar size={15} className="text-gray-400 shrink-0" />
                    <input
                        type="month"
                        value={monthYear === "all" ? currentMonthYear : monthYear}
                        onChange={(e) => setMonthYear(e.target.value)}
                        className="text-sm font-medium text-gray-700 bg-transparent focus:outline-none w-[140px]"
                    />
                </div>
                <button
                    onClick={() => setMonthYear("all")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border shadow-sm transition-colors shrink-0 ${monthYear === "all"
                        ? "bg-[#f00000] text-white border-[#f00000]"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                >
                    All Time
                </button>
            </div>
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <span className="w-10 h-10 rounded-full border-4 border-[#f00000] border-t-transparent animate-spin" />
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                        <StatCard icon={<ShoppingBag className="text-blue-600" size={18} />} bg="bg-blue-100" label="Total Orders" value={report.totalOrders} sub="this month" />
                        <StatCard icon={<CheckCircle className="text-green-600" size={18} />} bg="bg-green-100" label="Delivered" value={report.deliveredOrders} sub="successfully delivered" />
                        <StatCard icon={<XCircle className="text-red-600" size={18} />} bg="bg-red-100" label="Cancelled" value={report.cancelledOrders} sub="orders cancelled" />
                        <StatCard icon={<Package className="text-purple-600" size={18} />} bg="bg-purple-100" label="Units Sold" value={report.unitsSold} sub="units this month" />
                        <StatCard icon={<TrendingUp className="text-blue-600" size={18} />} bg="bg-blue-100" label="Gross Revenue" value={formatCurrency(report.grossRevenue)} sub="total sales value" />
                        <StatCard icon={<DollarSign className="text-[#f00000]" size={18} />} bg="bg-red-100" label="Platform Profit" value={formatCurrency(report.platformProfit)} sub="30% vendor + 100% direct" />
                    </div>

                    {/* Best Selling Category Banner */}
                    {report.bestCategory && (
                        <div className="bg-white border border-yellow-200 rounded-2xl p-5 mb-8 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Award className="text-yellow-600" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Best Selling Category — {periodLabel}</p>
                                <p className="text-lg font-bold text-gray-800">
                                    {report.bestCategory.name}{" "}
                                    <span className="text-sm font-medium text-gray-500">
                                        ({formatCurrency(report.bestCategory.revenue)} · {report.bestCategory.units} units)
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}

                                      {/* Sales Graph */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4">Daily Sales — {periodLabel}</h3>
                        {report.trendData.filter((d) => d.revenue > 0).length < 2 && (
                            <p className="text-xs text-gray-400 mb-2">
                                Showing available data — trend lines become more meaningful with sales across multiple days.
                            </p>
                        )}
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={report.trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} domain={[0, (max) => Math.ceil(max * 1.25) || 10]} allowDecimals={false} />
                                <Tooltip formatter={(v) => formatCurrency(v)} />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#f00000"
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: "#f00000" }}
                                    activeDot={{ r: 6 }}
                                    name="Revenue"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Profit Graph */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4">Daily Profit — {periodLabel}</h3>
                                               <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={report.trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} domain={[0, (max) => Math.ceil(max * 1.25) || 10]} allowDecimals={false} />
                                <Tooltip formatter={(v) => formatCurrency(v)} />
                                <Bar dataKey="profit" fill="#16a34a" name="Profit" radius={[4, 4, 0, 0]} maxBarSize={60} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Category Breakdown Table */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-1">Category-wise Sales</h3>
                        <p className="text-xs text-gray-400 mb-4">Revenue and units sold per category this month</p>

                        {report.categoryBreakdown.length === 0 ? (
                            <p className="text-sm text-gray-500 py-6 text-center">No category sales data for this period.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b">
                                            <th className="pb-2 font-semibold">#</th>
                                            <th className="pb-2 font-semibold">Category</th>
                                            <th className="pb-2 font-semibold text-center">Units Sold</th>
                                            <th className="pb-2 font-semibold text-right">Revenue</th>
                                            <th className="pb-2 font-semibold text-right">% of Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {report.categoryBreakdown.map((cat, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="py-3 text-xs text-gray-400 font-bold">#{idx + 1}</td>
                                                <td className="py-3 font-semibold text-gray-800">
                                                    {cat.name}
                                                    {idx === 0 && (
                                                        <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">
                                                            TOP
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 text-center text-gray-600">{cat.units}</td>
                                                <td className="py-3 text-right font-semibold text-gray-800">{formatCurrency(cat.revenue)}</td>
                                                <td className="py-3 text-right text-gray-500">
                                                    {report.grossRevenue > 0 ? `${((cat.revenue / report.grossRevenue) * 100).toFixed(1)}%` : "0%"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function StatCard({ icon, bg, label, value, sub }) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>{icon}</div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
            </div>
            <p className="text-xl font-bold text-gray-800">{value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
        </div>
    );
}