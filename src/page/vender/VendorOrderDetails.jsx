import { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import API, { IMAGE_URL } from "../../API/Api";

const formatCurrency = (val) =>
    val != null ? `$${Number(val).toFixed(2)}` : null;

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

const VendorOrderDetails = () => {
    const location = useLocation();
    const { orderId } = useParams();

    const [order, setOrder] = useState(location.state?.order || null);
    const [loading, setLoading] = useState(!location.state?.order);
    const [error, setError] = useState(null);

    const fetchOrder = useCallback(async () => {
        if (!orderId) return;
        try {
            const { data } = await API.get(`/vendor-orders/${orderId}`);
            setOrder(data.order);
            setError(null);
        } catch (err) {
            console.error("Failed to load order:", err);
            if (!order) {
                setError(
                    err.response?.status === 403
                        ? "You don't have permission to view this order."
                        : "Failed to load order."
                );
            }
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    useEffect(() => {
        fetchOrder();
        const interval = setInterval(fetchOrder, 60000); // keep status/tracking live
        return () => clearInterval(interval);
    }, [fetchOrder]);

    if (loading && !order) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[60vh]">
                <span className="w-10 h-10 rounded-full border-4 border-gray-800 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (error && !order) {
        return (
            <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
                <p className="text-[#f00000] text-lg font-semibold mb-4">{error}</p>
                <Link
                    to="/vendor/order"
                    className="text-white bg-gray-800 px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                >
                    ← Back to Orders
                </Link>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
                <p className="text-[#f00000] text-lg font-semibold mb-4">
                    No order data found.
                </p>
                <Link
                    to="/vendor/order"
                    className="text-white bg-gray-800 px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                >
                    ← Back to Orders
                </Link>
            </div>
        );
    }

    const lensItems = order.cartItems.filter((item) => item.lens);

    return (
        <motion.div
            className="p-8 max-w-5xl mx-auto space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Order #{order.orderNumber || order._id?.slice(-8)}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-CA", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </p>
                </div>
                <Link
                    to="/vendor/order"
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm"
                >
                    ← Back
                </Link>
            </div>

                     {/* Read-only notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
                ℹ️ This is a <strong>read-only</strong> view. Shipping and order status are
                managed by the admin team. Contact admin via Chat for any issues.
                <span className="block text-xs text-blue-500 mt-1">
                    Status refreshes automatically every minute.
                </span>
            </div>

            {/* Order Status + Summary */}
            <motion.div
                className="bg-white shadow-sm rounded-xl p-6 border-l-4 border-blue-500"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-700">Order Summary</h2>
                    <span
                        className={`text-sm font-bold px-3 py-1 rounded-full ${getStatusColor(
                            order.orderStatus
                        )}`}
                    >
                        {order.orderStatus}
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-700 text-sm">
                    {order.paymentMethod && (
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Payment</p>
                            <p className="font-semibold">{order.paymentMethod}</p>
                        </div>
                    )}
                    {order.paymentStatus && (
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Payment Status</p>
                            <p className="font-semibold">{order.paymentStatus}</p>
                        </div>
                    )}
                    {order.subtotal != null && (
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Subtotal</p>
                            <p className="font-semibold">{formatCurrency(order.subtotal)}</p>
                        </div>
                    )}
                    {order.shipping != null && (
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Shipping</p>
                            <p className="font-semibold">{formatCurrency(order.shipping)}</p>
                        </div>
                    )}
                    {order.tax != null && (
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Tax</p>
                            <p className="font-semibold">{formatCurrency(order.tax)}</p>
                        </div>
                    )}
                    {order.total != null && (
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Total</p>
                            <p className="font-bold text-lg text-gray-800">{formatCurrency(order.total)}</p>
                        </div>
                    )}
                    {order.location && (
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Warehouse</p>
                            <p className="font-semibold capitalize">{order.location}</p>
                        </div>
                    )}
                    {order.deliveryDate && (
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Delivery Date</p>
                            <p className="font-semibold">
                                {new Date(order.deliveryDate).toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Shipping Info (if available) */}
            {order.shippingInfo?.trackingNumber && (
                <motion.div
                    className="bg-white shadow-sm rounded-xl p-6 border-l-4 border-teal-500"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Shipping Info</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Courier</p>
                            <p className="font-semibold">{order.shippingInfo.courier || "Loomis"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Tracking Number</p>
                            <p className="font-semibold font-mono text-sm">
                                {order.shippingInfo.trackingNumber}
                            </p>
                        </div>
                        {order.shippingInfo.serviceName && (
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Service</p>
                                <p className="font-semibold">{order.shippingInfo.serviceName}</p>
                            </div>
                        )}
                                            {order.shippingInfo.voided ? (
                            <div>
                                <p className="text-xs text-red-400 uppercase tracking-wide mb-0.5">Status</p>
                                <p className="font-semibold text-red-600">Shipment Voided</p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Status</p>
                                <p className="font-semibold text-teal-600">Active</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Shipping Address */}
            {order.shippingAddress && (
                <motion.div
                    className="bg-white shadow-sm rounded-xl p-6 border-l-4 border-green-500"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">Shipping Address</h2>
                    <div className="text-sm text-gray-700 space-y-1">
                        {order.shippingAddress.fullName && (
                            <p><strong>Name:</strong> {order.shippingAddress.fullName}</p>
                        )}
                        {order.shippingAddress.address && (
                            <p><strong>Address:</strong> {order.shippingAddress.address}</p>
                        )}
                        {order.shippingAddress.city && (
                            <p>
                                <strong>City:</strong> {order.shippingAddress.city}
                                {order.shippingAddress.province && `, ${order.shippingAddress.province}`}
                                {order.shippingAddress.postalCode && ` ${order.shippingAddress.postalCode}`}
                            </p>
                        )}
                        {order.shippingAddress.country && (
                            <p><strong>Country:</strong> {order.shippingAddress.country}</p>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Products */}
            <motion.div
                className="bg-white shadow-sm rounded-xl p-6 border-l-4 border-purple-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
            >
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Products in this Order</h2>
                <div className="space-y-3">
                    {order.cartItems?.map((item, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100"
                        >
                            <img
                                src={
                                    item.image?.startsWith("http")
                                        ? item.image
                                        : `${IMAGE_URL}/${item.image}`
                                }
                                alt={item.name}
                                className="w-16 h-16 object-contain rounded-lg border bg-white"
                                onError={(e) => { e.target.style.display = "none"; }}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {item.product_color?.length > 0 &&
                                        `Color: ${item.product_color.join(", ")} · `}
                                    {item.product_size?.length > 0 &&
                                        `Size: ${item.product_size.join(", ")}`}
                                </p>
                                {item.policy && (
                                    <p className="text-xs text-blue-600 mt-0.5">
                                        + Insurance: {item.policy.name}
                                    </p>
                                )}
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="font-bold text-gray-800">
                                    {formatCurrency(item.price)}
                                </p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Lens Details */}
            {lensItems.length > 0 && (
                <motion.div
                    className="bg-white shadow-sm rounded-xl p-6 border-l-4 border-orange-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Lens Details</h2>
                    {lensItems.map((item, idx) => {
                        const lens = item.lens;
                        const prescription = lens?.lens?.prescription;
                        const fileUrl = prescription?.fileURL?.startsWith("http")
                            ? prescription.fileURL
                            : `${IMAGE_URL}${prescription?.fileName}`;

                        return (
                            <div
                                key={idx}
                                className="border rounded-lg p-4 mb-3 bg-gray-50 text-sm text-gray-700"
                            >
                                {lens?.selectedLens && (
                                    <p className="font-bold text-gray-800 mb-2">{lens.selectedLens}</p>
                                )}
                                <div className="grid grid-cols-2 gap-2">
                                    {lens?.lens?.prescriptionMethod && (
                                        <p><strong>Method:</strong> {lens.lens.prescriptionMethod}</p>
                                    )}
                                    {lens?.lens?.lensType?.name && (
                                        <p><strong>Lens Type:</strong> {lens.lens.lensType.name}</p>
                                    )}
                                    {lens?.lens?.thickness?.name && (
                                        <p><strong>Thickness:</strong> {lens.lens.thickness.name}</p>
                                    )}
                                    {(lens?.lens?.tint?.name || lens?.lens?.tint) && (
                                        <p><strong>Tint:</strong> {lens.lens.tint?.name || lens.lens.tint}</p>
                                    )}
                                    {lens?.totalPrice && (
                                        <p><strong>Lens Price:</strong> {formatCurrency(lens.totalPrice)}</p>
                                    )}
                                </div>
                                {prescription && (
                                    <div className="mt-3">
                                        <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block px-3 py-1 text-sm font-bold text-white bg-blue-600 rounded hover:bg-blue-700 transition"
                                        >
                                            View Prescription
                                        </a>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </motion.div>
            )}

            {/* Tracking History — filtered to remove admin-only entries */}
            {order.trackingHistory?.length > 0 && (
                <motion.div
                    className="bg-white shadow-sm rounded-xl p-6 border-l-4 border-indigo-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                >
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Order Timeline</h2>
                    <div className="space-y-3">
                        {order.trackingHistory
                            // Hide internal admin-only entries from vendor view
                            .filter(
                                (t) =>
                                    !["Shipment Voided", "Pickup Scheduled"].includes(t.status)
                            )
                            .map((track, i) => (
                                <div
                                    key={i}
                                    className="flex gap-3 pb-3 border-b border-gray-100 last:border-0"
                                >
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0 mt-1.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">
                                            {track.status}
                                        </p>
                                        <p className="text-xs text-gray-500">{track.message}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {new Date(track.updatedAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default VendorOrderDetails;