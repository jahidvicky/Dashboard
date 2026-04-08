import { useEffect, useState } from "react";
import { useAuth } from "../../authContext/AuthContext";
import API, { IMAGE_URL } from "../../API/Api";
import {
    TrendingUp,
    Package,
    ShoppingBag,
    DollarSign,
    Calendar,
    ArrowUp,
    ArrowDown,
} from "lucide-react";

// ── Commission rate — keep in sync with VendorHome ──
const COMMISSION_RATE = 0.30;

const formatCurrency = (val) =>
    val != null ? `$${Number(val).toFixed(2)}` : "$0.00";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export default function VendorSalesReport() {
    const { user } = useAuth();

    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [loading, setLoading] = useState(true);

    const [report, setReport] = useState({
        totalRevenue: 0,
        vendorEarnings: 0,
        platformFee: 0,
        totalUnits: 0,
        totalOrders: 0,
        productBreakdown: [],
        orderList: [],
    });

    const vendorId =
        user?._id || JSON.parse(localStorage.getItem("user") || "{}")?._id;

    const fetchReport = async () => {
        setLoading(true);
        try {
            const { data } = await API.get("/vendor-orders");
            const allOrders = data.orders || [];

            // Filter for selected month & year
            const filtered = allOrders.filter((o) => {
                const d = new Date(o.createdAt);
                return (
                    d.getMonth() === selectedMonth &&
                    d.getFullYear() === selectedYear &&
                    !["Cancelled", "Failed"].includes(o.orderStatus)
                );
            });

            let totalRevenue = 0;
            let totalUnits = 0;
            const productMap = {};

            filtered.forEach((order) => {
                order.cartItems
                    .filter(
                        (item) =>
                            item.vendorID?.toString() === vendorId?.toString()
                    )
                    .forEach((item) => {
                        const itemRevenue = (item.price || 0) * (item.quantity || 1);
                        totalRevenue += itemRevenue;
                        totalUnits += item.quantity || 1;

                        // Group by product name for breakdown
                        const key = item.productId || item.name;
                        if (!productMap[key]) {
                            productMap[key] = {
                                name: item.name,
                                image: item.image,
                                units: 0,
                                revenue: 0,
                            };
                        }
                        productMap[key].units += item.quantity || 1;
                        productMap[key].revenue += itemRevenue;
                    });
            });

            const productBreakdown = Object.values(productMap).sort(
                (a, b) => b.revenue - a.revenue
            );

            setReport({
                totalRevenue,
                vendorEarnings: totalRevenue * (1 - COMMISSION_RATE),
                platformFee: totalRevenue * COMMISSION_RATE,
                totalUnits,
                totalOrders: filtered.length,
                productBreakdown,
                orderList: filtered,
            });
        } catch (err) {
            console.error("Sales report error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [selectedMonth, selectedYear]);

    // Year options: current year and 2 years back
    const yearOptions = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];

    const getStatusColor = (status) => {
        switch (status) {
            case "Delivered": return "text-green-600";
            case "Shipped": return "text-purple-600";
            case "Processing": return "text-yellow-600";
            case "Placed": return "text-blue-600";
            case "Returned": return "text-orange-600";
            default: return "text-gray-600";
        }
    };

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Sales Report</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Your sales performance and earnings breakdown
                </p>
            </div>

            {/* Month / Year Selector */}
            <div className="flex flex-wrap gap-3 mb-8">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
                    <Calendar size={16} className="text-gray-400" />
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="text-sm font-medium text-gray-700 bg-transparent focus:outline-none"
                    >
                        {MONTHS.map((m, i) => (
                            <option key={i} value={i}>{m}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="text-sm font-medium text-gray-700 bg-transparent focus:outline-none"
                    >
                        {yearOptions.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <span className="w-10 h-10 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        {/* Gross Revenue */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="text-blue-600" size={20} />
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Gross Revenue</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">
                                {formatCurrency(report.totalRevenue)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">total sales value</p>
                        </div>

                        {/* Your Earnings */}
                        <div className="bg-white border border-[#f00000]/20 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                    <DollarSign className="text-[#f00000]" size={20} />
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Your Earnings</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">
                                {formatCurrency(report.vendorEarnings)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {Math.round((1 - COMMISSION_RATE) * 100)}% of gross revenue
                            </p>
                        </div>

                        {/* Units Sold */}
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

                        {/* Total Orders */}
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

                    {/* Commission Breakdown */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4">
                            Earnings Breakdown — {MONTHS[selectedMonth]} {selectedYear}
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Gross Revenue</span>
                                <span className="font-semibold text-gray-800">
                                    {formatCurrency(report.totalRevenue)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">
                                    Platform Fee ({Math.round(COMMISSION_RATE * 100)}%)
                                </span>
                                <span className="font-semibold text-red-500">
                                    − {formatCurrency(report.platformFee)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-base font-bold text-gray-800">
                                    Your Net Earnings
                                </span>
                                <span className="text-xl font-bold text-green-600">
                                    {formatCurrency(report.vendorEarnings)}
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-4">
                            * Payments are typically settled at the end of each month.
                            Contact admin for payment status.
                        </p>
                    </div>

                    {/* Product Breakdown */}
                    {report.productBreakdown.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4">
                                Product Performance
                            </h3>
                            <div className="space-y-3">
                                {report.productBreakdown.map((product, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100"
                                    >
                                        {/* Rank */}
                                        <span className="text-xs font-bold text-gray-400 w-5 text-center">
                                            #{idx + 1}
                                        </span>

                                        {/* Image */}
                                        <img
                                            src={
                                                product.image?.startsWith("http")
                                                    ? product.image
                                                    : `${IMAGE_URL}/${product.image}`
                                            }
                                            alt={product.name}
                                            className="w-12 h-12 object-cover rounded-lg border bg-white"
                                            onError={(e) => { e.target.style.display = "none"; }}
                                        />

                                        {/* Name */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">
                                                {product.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {product.units} unit{product.units !== 1 ? "s" : ""} sold
                                            </p>
                                        </div>

                                        {/* Revenue */}
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-bold text-gray-800">
                                                {formatCurrency(product.revenue)}
                                            </p>
                                            <p className="text-xs text-green-600">
                                                {formatCurrency(product.revenue * (1 - COMMISSION_RATE))} earned
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Order List */}
                    {report.orderList.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4">
                                Orders This Month
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b">
                                            <th className="pb-2 font-semibold">Order #</th>
                                            <th className="pb-2 font-semibold">Date</th>
                                            <th className="pb-2 font-semibold">Status</th>
                                            <th className="pb-2 font-semibold text-right">Total</th>
                                            <th className="pb-2 font-semibold text-right">Your Share</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {report.orderList.map((order, idx) => {
                                            // Calculate vendor's items revenue for this order
                                            let orderVendorRevenue = 0;
                                            order.cartItems
                                                .filter(
                                                    (item) =>
                                                        item.vendorID?.toString() ===
                                                        vendorId?.toString()
                                                )
                                                .forEach((item) => {
                                                    orderVendorRevenue +=
                                                        (item.price || 0) * (item.quantity || 1);
                                                });

                                            return (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="py-3 font-mono text-xs text-gray-600">
                                                        #{order.orderNumber || order._id?.slice(-8)}
                                                    </td>
                                                    <td className="py-3 text-gray-600">
                                                        {new Date(order.createdAt).toLocaleDateString(
                                                            "en-CA",
                                                            {
                                                                month: "short",
                                                                day: "numeric",
                                                            }
                                                        )}
                                                    </td>
                                                    <td className="py-3">
                                                        <span
                                                            className={`font-semibold text-xs ${getStatusColor(
                                                                order.orderStatus
                                                            )}`}
                                                        >
                                                            {order.orderStatus}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-right font-semibold text-gray-800">
                                                        {formatCurrency(order.total)}
                                                    </td>
                                                    <td className="py-3 text-right font-bold text-green-600">
                                                        {formatCurrency(
                                                            orderVendorRevenue * (1 - COMMISSION_RATE)
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {report.orderList.length === 0 && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
                            <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-semibold text-gray-500">
                                No sales in {MONTHS[selectedMonth]} {selectedYear}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                Try selecting a different month or check if your products are approved.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}