import { useEffect, useState } from "react";
import API, { IMAGE_URL } from "../../API/Api";
import {
    TrendingUp, Package, ShoppingBag, DollarSign,
    Calendar, Users, ChevronDown, Store,
} from "lucide-react";

const COMMISSION_RATE = 0.30;
const formatCurrency = (val) => val != null ? `$${Number(val).toFixed(2)}` : "$0.00";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const getStatusColor = (status) => {
    switch (status) {
        case "Delivered": return "text-green-600";
        case "Shipped": return "text-purple-600";
        case "Processing": return "text-yellow-600";
        case "Placed": return "text-blue-600";
        case "Returned": return "text-orange-600";
        default: return "text-gray-500";
    }
};

// vendorID in cartItems is a plain string matching vendor.userId
const toStr = (v) => {
    if (!v) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object" && v.$oid) return v.$oid;
    return String(v);
};

// /allvendor returns: [{operatingName, companyName, contactName, userId, _id, ...}]
const vendorLabel = (v) => {
    if (!v) return "Unknown Vendor";
    return v.operatingName || v.companyName || v.contactName || v.contactEmail || "Unknown Vendor";
};

// cartItems.vendorID matches vendor.userId
const vendorMatchId = (v) => toStr(v.userId || v._id);

export default function AdminVendorSalesReport() {
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedVendorId, setSelectedVendorId] = useState("all");
    const [vendors, setVendors] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);
    const [report, setReport] = useState({
        totalRevenue: 0, platformFee: 0, vendorEarnings: 0,
        totalUnits: 0, totalOrders: 0,
        productBreakdown: [], orderList: [], vendorSummary: [],
    });

    const yearOptions = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];

    // ── Fetch BOTH in parallel, set state only when both done ──
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [vendorRes, orderRes] = await Promise.all([
                    API.get("/allvendor"),
                    API.get("/all-orders-report"),
                ]);

                // /allvendor → direct array
                const vendorList = Array.isArray(vendorRes.data)
                    ? vendorRes.data
                    : vendorRes.data.vendors || vendorRes.data.data || [];

                // /allorder → direct array or wrapped
                const orderList = Array.isArray(orderRes.data)
                    ? orderRes.data
                    : orderRes.data.orders || orderRes.data.data || [];

                setVendors(vendorList);
                setAllOrders(orderList);
            } catch (err) {
                console.error("Fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);


    // ── Compute report whenever data or filters change ──
    useEffect(() => {
        if (!allOrders.length) return;

        const monthFiltered = allOrders.filter((o) => {
            const d = new Date(o.createdAt);
            return (
                d.getMonth() === selectedMonth &&
                d.getFullYear() === selectedYear &&
                !["Cancelled", "Failed"].includes(o.orderStatus)
            );
        });

        if (selectedVendorId === "all") {
            const vendorMap = {};
            monthFiltered.forEach((order) => {
                order.cartItems?.forEach((item) => {
                    const vid = toStr(item.vendorID);
                    if (!vid) return; // skip admin orders (vendorID is null)

                    if (!vendorMap[vid]) {
                        const info = vendors.find((v) => vendorMatchId(v) === vid);
                        vendorMap[vid] = {
                            vendorId: vid,
                            vendorName: vendorLabel(info),
                            revenue: 0, units: 0, orders: new Set(),
                        };
                    }
                    const rev = (item.price || 0) * (item.quantity || 1);
                    vendorMap[vid].revenue += rev;
                    vendorMap[vid].units += item.quantity || 1;
                    vendorMap[vid].orders.add(order._id);
                });
            });

            const vendorSummary = Object.values(vendorMap)
                .map((v) => ({ ...v, orders: v.orders.size }))
                .sort((a, b) => b.revenue - a.revenue);

            const totalRevenue = vendorSummary.reduce((s, v) => s + v.revenue, 0);
            setReport({
                totalRevenue,
                platformFee: totalRevenue * COMMISSION_RATE,
                vendorEarnings: totalRevenue * (1 - COMMISSION_RATE),
                totalUnits: vendorSummary.reduce((s, v) => s + v.units, 0),
                totalOrders: vendorSummary.reduce((s, v) => s + v.orders, 0),
                productBreakdown: [], orderList: [], vendorSummary,
            });

        } else {
            let totalRevenue = 0, totalUnits = 0;
            const productMap = {};

            monthFiltered.forEach((order) => {
                order.cartItems
                    ?.filter((item) => toStr(item.vendorID) === selectedVendorId)
                    .forEach((item) => {
                        const rev = (item.price || 0) * (item.quantity || 1);
                        totalRevenue += rev;
                        totalUnits += item.quantity || 1;
                        const key = item.productId || item.name;
                        if (!productMap[key]) {
                            productMap[key] = { name: item.name, image: item.image, units: 0, revenue: 0 };
                        }
                        productMap[key].units += item.quantity || 1;
                        productMap[key].revenue += rev;
                    });
            });

            const productBreakdown = Object.values(productMap).sort((a, b) => b.revenue - a.revenue);
            const orderList = monthFiltered.filter((o) =>
                o.cartItems?.some((i) => toStr(i.vendorID) === selectedVendorId)
            );

            setReport({
                totalRevenue,
                platformFee: totalRevenue * COMMISSION_RATE,
                vendorEarnings: totalRevenue * (1 - COMMISSION_RATE),
                totalUnits,
                totalOrders: orderList.length,
                productBreakdown, orderList, vendorSummary: [],
            });
        }
    }, [selectedMonth, selectedYear, selectedVendorId, allOrders, vendors]);

    const selectedVendor = vendors.find((v) => vendorMatchId(v) === selectedVendorId);
    const selectedVendorName = vendorLabel(selectedVendor);

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <TrendingUp size={24} className="text-[#f00000]" />
                    Vendor Sales Report
                </h1>
                <p className="text-gray-500 text-sm mt-1">Monitor vendor performance and platform earnings</p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-3 mb-8">
                {/* Vendor Picker */}
                <div className="relative">
                    <button
                        onClick={() => setVendorDropdownOpen((p) => !p)}
                        className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm text-sm font-medium text-gray-700 min-w-[200px] justify-between"
                    >
                        <span className="flex items-center gap-2">
                            <Store size={15} className="text-gray-400" />
                            {selectedVendorId === "all" ? "All Vendors" : selectedVendorName}
                        </span>
                        <ChevronDown size={14} className="text-gray-400" />
                    </button>
                    {vendorDropdownOpen && (
                        <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[240px] max-h-72 overflow-y-auto">
                            <div
                                onClick={() => { setSelectedVendorId("all"); setVendorDropdownOpen(false); }}
                                className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-2 ${selectedVendorId === "all" ? "bg-red-50 text-[#f00000] font-semibold" : "text-gray-700"}`}
                            >
                                <Users size={13} /> All Vendors
                            </div>
                            {vendors.map((v) => {
                                const vid = vendorMatchId(v);
                                const label = vendorLabel(v);
                                return (
                                    <div
                                        key={v._id}
                                        onClick={() => { setSelectedVendorId(vid); setVendorDropdownOpen(false); }}
                                        className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 ${selectedVendorId === vid ? "bg-red-50 text-[#f00000] font-semibold" : "text-gray-700"}`}
                                    >
                                        <p className="font-medium">{label}</p>
                                        <p className="text-xs text-gray-400">{v.contactEmail || v.email || ""}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Month */}
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
                    <Calendar size={15} className="text-gray-400" />
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="text-sm font-medium text-gray-700 bg-transparent focus:outline-none">
                        {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                </div>

                {/* Year */}
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
                    <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="text-sm font-medium text-gray-700 bg-transparent focus:outline-none">
                        {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <span className="w-10 h-10 rounded-full border-4 border-[#f00000] border-t-transparent animate-spin" />
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="text-blue-600" size={20} />
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Gross Revenue</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{formatCurrency(report.totalRevenue)}</p>
                            <p className="text-xs text-gray-400 mt-1">total sales value</p>
                        </div>

                        <div className="bg-white border border-[#f00000]/20 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                    <DollarSign className="text-[#f00000]" size={20} />
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Platform Fee</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{formatCurrency(report.platformFee)}</p>
                            <p className="text-xs text-gray-400 mt-1">{Math.round(COMMISSION_RATE * 100)}% commission</p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                    <Package className="text-green-600" size={20} />
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Units Sold</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{report.totalUnits}</p>
                            <p className="text-xs text-gray-400 mt-1">units this month</p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <ShoppingBag className="text-purple-600" size={20} />
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{report.totalOrders}</p>
                            <p className="text-xs text-gray-400 mt-1">orders this month</p>
                        </div>
                    </div>

                    {/* ALL VENDORS: Summary Table */}
                    {selectedVendorId === "all" && report.vendorSummary.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-1">
                                Vendor Breakdown — {MONTHS[selectedMonth]} {selectedYear}
                            </h3>
                            <p className="text-xs text-gray-400 mb-4">
                                Platform collects {Math.round(COMMISSION_RATE * 100)}% from each vendor's revenue
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b">
                                            <th className="pb-2 font-semibold">#</th>
                                            <th className="pb-2 font-semibold">Vendor</th>
                                            <th className="pb-2 font-semibold text-center">Orders</th>
                                            <th className="pb-2 font-semibold text-center">Units</th>
                                            <th className="pb-2 font-semibold text-right">Gross Revenue</th>
                                            <th className="pb-2 font-semibold text-right">Platform Fee</th>
                                            <th className="pb-2 font-semibold text-right">Vendor Payout</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {report.vendorSummary.map((v, idx) => (
                                            <tr key={v.vendorId} className="hover:bg-gray-50 cursor-pointer"
                                                onClick={() => setSelectedVendorId(v.vendorId)}>
                                                <td className="py-3 text-xs text-gray-400 font-bold">#{idx + 1}</td>
                                                <td className="py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                                            {(v.vendorName || "?")[0].toUpperCase()}
                                                        </div>
                                                        <span className="font-semibold text-gray-800 text-sm">{v.vendorName}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 text-center text-gray-600">{v.orders}</td>
                                                <td className="py-3 text-center text-gray-600">{v.units}</td>
                                                <td className="py-3 text-right font-semibold text-gray-800">{formatCurrency(v.revenue)}</td>
                                                <td className="py-3 text-right text-red-500 font-semibold">{formatCurrency(v.revenue * COMMISSION_RATE)}</td>
                                                <td className="py-3 text-right text-green-600 font-bold">{formatCurrency(v.revenue * (1 - COMMISSION_RATE))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t-2 border-gray-200 bg-gray-50">
                                            <td colSpan={4} className="py-3 pl-2 font-bold text-gray-700 text-sm">Total</td>
                                            <td className="py-3 text-right font-bold text-gray-800">{formatCurrency(report.totalRevenue)}</td>
                                            <td className="py-3 text-right font-bold text-red-500">{formatCurrency(report.platformFee)}</td>
                                            <td className="py-3 text-right font-bold text-green-600">{formatCurrency(report.vendorEarnings)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <p className="text-xs text-gray-400 mt-3">
                                💡 Click any vendor row to drill into their detailed report.
                            </p>
                        </div>
                    )}

                    {/* SINGLE VENDOR: Detail View */}
                    {selectedVendorId !== "all" && (
                        <>
                            <button onClick={() => setSelectedVendorId("all")}
                                className="mb-4 text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
                                ← Back to all vendors
                            </button>

                            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4">
                                    Earnings Breakdown — {selectedVendorName} · {MONTHS[selectedMonth]} {selectedYear}
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Gross Revenue</span>
                                        <span className="font-semibold text-gray-800">{formatCurrency(report.totalRevenue)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Platform Fee ({Math.round(COMMISSION_RATE * 100)}%)</span>
                                        <span className="font-semibold text-[#f00000]">+ {formatCurrency(report.platformFee)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-base font-bold text-gray-800">Vendor Payout</span>
                                        <span className="text-xl font-bold text-green-600">{formatCurrency(report.vendorEarnings)}</span>
                                    </div>
                                </div>
                            </div>

                            {report.productBreakdown.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
                                    <h3 className="font-bold text-gray-800 mb-4">Product Performance</h3>
                                    <div className="space-y-3">
                                        {report.productBreakdown.map((product, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <span className="text-xs font-bold text-gray-400 w-5 text-center">#{idx + 1}</span>
                                                <img
                                                    src={product.image?.startsWith("http") ? product.image : `${IMAGE_URL}/${product.image}`}
                                                    alt={product.name}
                                                    className="w-25 h-15 object-cover rounded-lg border bg-white"
                                                    onError={(e) => { e.target.style.display = "none"; }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                                                    <p className="text-xs text-gray-500">{product.units} unit{product.units !== 1 ? "s" : ""} sold</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="font-bold text-gray-800">{formatCurrency(product.revenue)}</p>
                                                    <p className="text-xs text-[#f00000]">Fee: {formatCurrency(product.revenue * COMMISSION_RATE)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {report.orderList.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                    <h3 className="font-bold text-gray-800 mb-4">Orders This Month</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b">
                                                    <th className="pb-2 font-semibold">Order #</th>
                                                    <th className="pb-2 font-semibold">Date</th>
                                                    <th className="pb-2 font-semibold">Status</th>
                                                    <th className="pb-2 font-semibold text-right">Order Total</th>
                                                    <th className="pb-2 font-semibold text-right">Vendor Revenue</th>
                                                    <th className="pb-2 font-semibold text-right">Platform Fee</th>
                                                    <th className="pb-2 font-semibold text-right">Vendor Payout</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {report.orderList.map((order, idx) => {
                                                    let vendorRev = 0;
                                                    order.cartItems
                                                        ?.filter((i) => toStr(i.vendorID) === selectedVendorId)
                                                        .forEach((i) => { vendorRev += (i.price || 0) * (i.quantity || 1); });
                                                    return (
                                                        <tr key={idx} className="hover:bg-gray-50">
                                                            <td className="py-3 font-mono text-xs text-gray-600">#{order.orderNumber || order._id?.slice(-8)}</td>
                                                            <td className="py-3 text-gray-600">{new Date(order.createdAt).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}</td>
                                                            <td className="py-3"><span className={`font-semibold text-xs ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</span></td>
                                                            <td className="py-3 text-right text-gray-700">{formatCurrency(order.total)}</td>
                                                            <td className="py-3 text-right font-semibold text-gray-800">{formatCurrency(vendorRev)}</td>
                                                            <td className="py-3 text-right text-[#f00000] font-semibold">{formatCurrency(vendorRev * COMMISSION_RATE)}</td>
                                                            <td className="py-3 text-right font-bold text-green-600">{formatCurrency(vendorRev * (1 - COMMISSION_RATE))}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {report.orderList.length === 0 && (
                                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
                                    <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-semibold text-gray-500">No sales in {MONTHS[selectedMonth]} {selectedYear}</p>
                                    <p className="text-sm text-gray-400 mt-1">This vendor had no qualifying orders in this period.</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* Empty state — all vendors */}
                    {selectedVendorId === "all" && report.vendorSummary.length === 0 && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
                            <Users size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-semibold text-gray-500">No vendor sales in {MONTHS[selectedMonth]} {selectedYear}</p>
                            <p className="text-sm text-gray-400 mt-1">
                                No orders with vendor items were placed in this period.
                                {allOrders.length > 0 && " (Admin-created orders are excluded from vendor reports.)"}
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}