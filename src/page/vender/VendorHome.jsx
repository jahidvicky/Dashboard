import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../authContext/AuthContext";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
} from "lucide-react";
import API, { IMAGE_URL } from "../../API/Api";

// ── Commission rate — adjust to match your agreement with vendors ──
const COMMISSION_RATE = 0.30; // 30% platform fee

const formatCurrency = (val) =>
  val != null ? `$${Number(val).toFixed(2)}` : "$0.00";

export default function VendorHome() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    approvedProducts: 0,
    pendingProducts: 0,
    soldThisMonth: 0,
    revenueThisMonth: 0,
    vendorEarnings: 0,
    platformFee: 0,
    recentOrders: [],
    lowStockProducts: [],
  });

  // ── Fetch all data needed for dashboard ──────────────────────────────────
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch vendor's products
      const productsRes = await API.get("/getVendorProduct");
      const products = productsRes.data.products || [];

      // Fetch vendor's orders
      const ordersRes = await API.get("/vendor-orders");
      const allOrders = ordersRes.data.orders || [];

      // ── Calculate this month's stats ──────────────────────────────
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const thisMonthOrders = allOrders.filter(
        (o) =>
          new Date(o.createdAt) >= startOfMonth &&
          !["Cancelled", "Failed"].includes(o.orderStatus)
      );

      const vendorId = user?._id || JSON.parse(localStorage.getItem("user"))?._id;

      let soldThisMonth = 0;
      let revenueThisMonth = 0;

      thisMonthOrders.forEach((order) => {
        order.cartItems
          .filter(
            (item) =>
              item.vendorID?.toString() === vendorId?.toString()
          )
          .forEach((item) => {
            soldThisMonth += item.quantity || 1;
            revenueThisMonth += (item.price || 0) * (item.quantity || 1);
          });
      });

      const vendorEarnings = revenueThisMonth * (1 - COMMISSION_RATE);
      const platformFee = revenueThisMonth * COMMISSION_RATE;

      // ── Low stock products (stock < 5) ────────────────────────────
      const lowStockProducts = products.filter(
        (p) =>
          p.productStatus === "Approved" &&
          p.stockAvailability != null &&
          Number(p.stockAvailability) < 5
      );

      // ── Recent orders (last 5) ────────────────────────────────────
      const recentOrders = allOrders.slice(0, 5);

      setStats({
        totalProducts: products.length,
        approvedProducts: products.filter(
          (p) => p.productStatus === "Approved"
        ).length,
        pendingProducts: products.filter(
          (p) => p.productStatus === "Pending"
        ).length,
        soldThisMonth,
        revenueThisMonth,
        vendorEarnings,
        platformFee,
        recentOrders,
        lowStockProducts,
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const today = new Date().toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Placed": return "bg-blue-100 text-blue-700";
      case "Processing": return "bg-yellow-100 text-yellow-700";
      case "Shipped": return "bg-purple-100 text-purple-700";
      case "Delivered": return "bg-green-100 text-green-700";
      case "Cancelled": return "bg-red-100 text-red-700";
      case "Returned": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <span
            className="w-10 h-10 rounded-full border-4 border-red-500 border-t-transparent animate-spin"
          />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {user?.name || "Vendor"}
          </h1>
          <p className="text-gray-500 mt-1">{today}</p>
        </div>
        <Link
          to="/vendor/sales"
          className="bg-[#f00000] text-white px-5 py-2 rounded-lg hover:bg-red-700 transition text-sm font-semibold"
        >
          View Full Sales Report →
        </Link>
      </div>

      {/* ── Low Stock Alert ─────────────────────────────────────────── */}
      {stats.lowStockProducts.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-semibold text-amber-800 text-sm">
              Low Stock Alert — {stats.lowStockProducts.length} product
              {stats.lowStockProducts.length > 1 ? "s" : ""} running low
            </p>
            <p className="text-amber-700 text-xs mt-1">
              {stats.lowStockProducts
                .map((p) => `${p.product_name} (${p.stockAvailability} left)`)
                .join(" · ")}
            </p>
          </div>
        </div>
      )}

      {/* ── Stats Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {/* Total Products */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="text-blue-600" size={20} />
            </div>
            <p className="text-sm font-medium text-gray-600">My Products</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
          <div className="flex gap-3 mt-2">
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
              <CheckCircle size={12} /> {stats.approvedProducts} approved
            </span>
            {stats.pendingProducts > 0 && (
              <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                <Clock size={12} /> {stats.pendingProducts} pending
              </span>
            )}
          </div>
        </div>

        {/* Units Sold This Month */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="text-green-600" size={20} />
            </div>
            <p className="text-sm font-medium text-gray-600">Sold This Month</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.soldThisMonth}</p>
          <p className="text-xs text-gray-400 mt-2">units sold</p>
        </div>

        {/* Revenue This Month */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={20} />
            </div>
            <p className="text-sm font-medium text-gray-600">Revenue This Month</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {formatCurrency(stats.revenueThisMonth)}
          </p>
          <p className="text-xs text-gray-400 mt-2">gross revenue</p>
        </div>

        {/* Your Earnings */}
        <div className="bg-white border border-[#f00000]/20 p-5 rounded-2xl hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <DollarSign className="text-[#f00000]" size={20} />
            </div>
            <p className="text-sm font-medium text-gray-600">Your Earnings</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {formatCurrency(stats.vendorEarnings)}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            after {Math.round(COMMISSION_RATE * 100)}% platform fee
          </p>
        </div>
      </div>

      {/* ── Bottom Section: Recent Orders + Quick Nav ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
            <Link
              to="/vendor/order"
              className="text-sm text-[#f00000] hover:underline font-medium"
            >
              View All →
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <ShoppingBag size={36} className="mx-auto mb-2 opacity-30" />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <img
                    src={
                      order.cartItems?.[0]?.image?.startsWith("http")
                        ? order.cartItems[0].image
                        : `${IMAGE_URL}/${order.cartItems?.[0]?.image}`
                    }
                    alt="product"
                    className="w-12 h-12 object-cover rounded-lg border"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      Order #{order.orderNumber || order._id?.slice(-6)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("en-CA", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                    <p className="text-xs font-bold text-gray-700">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Navigation */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/vendor/product"
              className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition"
            >
              <Package className="text-blue-600" size={18} />
              <span className="text-sm font-semibold text-blue-800">
                Manage Products
              </span>
            </Link>
            <Link
              to="/vendor/order"
              className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition"
            >
              <ShoppingBag className="text-green-600" size={18} />
              <span className="text-sm font-semibold text-green-800">
                View Orders
              </span>
            </Link>
            <Link
              to="/vendor/inventory"
              className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition"
            >
              <TrendingUp className="text-purple-600" size={18} />
              <span className="text-sm font-semibold text-purple-800">
                Check Inventory
              </span>
            </Link>
            <Link
              to="/vendor/sales"
              className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100 hover:bg-red-100 transition"
            >
              <DollarSign className="text-[#f00000]" size={18} />
              <span className="text-sm font-semibold text-red-800">
                Sales Report
              </span>
            </Link>
            <Link
              to="/vendor/profile"
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition"
            >
              <span className="text-sm font-semibold text-gray-700">
                Update Profile
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}