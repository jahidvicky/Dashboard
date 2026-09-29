import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { IMAGE_URL } from "../../API/Api";

// Status badge colors
const getStatusColor = (status) => {
    switch (status) {
        case "Placed": return "bg-blue-100 text-blue-700";
        case "Processing": return "bg-yellow-100 text-yellow-700";
        case "Shipped": return "bg-purple-100 text-purple-700";
        case "Delivered": return "bg-green-100 text-green-700";
        case "Cancelled": return "bg-red-100 text-red-700";
        case "Returned": return "bg-orange-100 text-orange-700";
        default: return "bg-gray-100 text-gray-600";
    }
};

const VendorProductOrder = () => {
    const [allData, setAllData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState("");
    const [ordersPerPage] = useState(10);

    const navigate = useNavigate();

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await API.get("/vendor-orders");
            setAllData(data.orders || []);
        } catch (err) {
            console.error("Failed to load orders:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 60000);
        return () => clearInterval(interval);
    }, []);

    // Filter by status
    const filteredData = filterStatus
        ? allData.filter((o) => o.orderStatus === filterStatus)
        : allData;

    // Pagination
    const totalPages = Math.ceil(filteredData.length / ordersPerPage);
    const indexOfLast = currentPage * ordersPerPage;
    const indexOfFirst = indexOfLast - ordersPerPage;
    const currentOrders = filteredData.slice(indexOfFirst, indexOfLast);

    const goToDetails = (order) => {
        navigate(`/vendor/order-details/${order._id}`, { state: { order } });
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-3">
                    <span className="w-10 h-10 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
                    <p className="text-gray-500">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">My Orders</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Orders containing your products — read only view
                    </p>
                </div>

                {/* Status Filter */}
                <select
                    value={filterStatus}
                    onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                    <option value="">All Statuses</option>
                    <option value="Placed">Placed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Returned">Returned</option>
                </select>
            </div>

            {/* Info Banner */}
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
                Order fulfillment and shipping are managed by the admin team.
                Contact admin via <strong>Chat</strong> if you have questions about a specific order.
            </div>

            {/* Table */}
            <div className="hidden md:block relative overflow-y-auto max-h-[560px] w-full border rounded-xl bg-white shadow-sm">
                {/* Header */}
                <div className="grid grid-cols-7 text-center bg-gray-800 text-white font-semibold py-3 px-4 sticky top-0 z-10 text-sm rounded-t-xl">
                    <div>Order #</div>
                    <div>Product</div>
                    <div>Date</div>
                    <div>Total</div>
                    <div>Status</div>
                    <div>Tracking</div>
                    <div>Action</div>
                </div>

                {currentOrders.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-4xl mb-3">📦</p>
                        <p className="text-lg font-medium">No orders found</p>
                        <p className="text-sm mt-1">
                            {filterStatus
                                ? `No orders with status "${filterStatus}"`
                                : "Orders will appear here once customers purchase your products"}
                        </p>
                    </div>
                ) : (
                    currentOrders.map((order, idx) => (
                        <div
                            key={order._id}
                            className={`grid grid-cols-7 text-center items-center px-4 py-3 border-b border-gray-100 text-sm hover:bg-gray-50 transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                                }`}
                        >
                            {/* Order Number */}
                            <div className="font-mono text-xs text-gray-600 truncate px-1">
                                #{order.orderNumber || order._id?.slice(-8)}
                            </div>

                            {/* Product Image */}
                            <div className="flex justify-center">
                                <img
                                    src={
                                        order.cartItems?.[0]?.image?.startsWith("http")
                                            ? order.cartItems[0].image
                                            : `${IMAGE_URL}/${order.cartItems?.[0]?.image}`
                                    }
                                    alt="Product"
                                    className="w-14 h-10 object-cover rounded-lg border"
                                    onError={(e) => {
                                        e.target.src = "";
                                        e.target.style.display = "none";
                                    }}
                                />
                            </div>

                            {/* Date */}
                            <div className="text-gray-600 text-xs">
                                {new Date(order.createdAt).toLocaleDateString("en-CA", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </div>

                            {/* Total */}
                            <div className="font-semibold text-gray-800">
                                ${order.total?.toFixed(2) || "—"}
                            </div>

                            {/* Status */}
                            <div className="flex justify-center">
                                <span
                                    className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(
                                        order.orderStatus
                                    )}`}
                                >
                                    {order.orderStatus}
                                </span>
                            </div>

                            {/* Tracking */}
                            <div className="flex flex-col items-center justify-center text-xs">
                                {order.shippingInfo?.trackingNumber ? (
                                    order.shippingInfo.voided ? (
                                        <span className="text-red-500 font-semibold">Voided</span>
                                    ) : (
                                        <>
                                            <span className="font-mono text-gray-600">
                                                {order.shippingInfo.trackingNumber}
                                            </span>
                                            <a
                                                href={`https://www.loomis-express.com/webtrack/track.html?trackingNumber=${order.shippingInfo.trackingNumber}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-blue-600 hover:underline mt-0.5"
                                            >
                                                Track ↗
                                            </a>
                                        </>
                                    )
                                ) : (
                                    <span className="text-gray-300">—</span>
                                )}
                            </div>

                            {/* Action */}
                            <div className="flex justify-center">
                                <button
                                    onClick={() => goToDetails(order)}
                                    className="bg-gray-800 text-white px-4 py-1.5 rounded-lg text-xs hover:bg-gray-700 transition"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {currentOrders.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        No orders found.
                    </div>
                ) : (
                    currentOrders.map((order) => (
                        <div
                            key={order._id}
                            className="bg-white border rounded-xl p-4 shadow-sm"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <img
                                    src={
                                        order.cartItems?.[0]?.image?.startsWith("http")
                                            ? order.cartItems[0].image
                                            : `${IMAGE_URL}/${order.cartItems?.[0]?.image}`
                                    }
                                    alt="Product"
                                    className="w-14 h-14 object-cover rounded-lg border"
                                />
                                <div className="flex-1">
                                    <p className="font-mono text-xs text-gray-500">
                                        #{order.orderNumber || order._id?.slice(-8)}
                                    </p>
                                    <p className="font-bold text-gray-800">
                                        ${order.total?.toFixed(2) || "—"}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                    {order.shippingInfo?.trackingNumber && !order.shippingInfo?.voided && (
                                        <p className="text-xs font-mono text-blue-600 mt-1">
                                            {order.shippingInfo.trackingNumber}
                                        </p>
                                    )}
                                </div>
                                <span
                                    className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(
                                        order.orderStatus
                                    )}`}
                                >
                                    {order.orderStatus}
                                </span>
                            </div>
                            <button
                                onClick={() => goToDetails(order)}
                                className="w-full bg-gray-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
                            >
                                View Details
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {filteredData.length > ordersPerPage && (
                <div className="flex justify-center mt-6 gap-2 flex-wrap">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-100"
                    >
                        ← Prev
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-3 py-1 rounded-lg border text-sm ${currentPage === i + 1
                                ? "bg-[#f00000] text-white font-semibold border-[#f00000]"
                                : "bg-white hover:bg-gray-100"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-100"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
};

export default VendorProductOrder;