import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";

const VendorOrderDetails = () => {
    const location = useLocation();
    const order = location.state?.order;

    if (!order) {
        return (
            <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
                <p className="text-red-600 text-lg font-semibold mb-4">No order data found.</p>
                <Link
                    to="/vendor/order"
                    className="text-white bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    Back to Orders
                </Link>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                <Link
                    to="/vendor/order"
                    className="text-blue-600 hover:underline mb-6 inline-block text-sm font-medium"
                >
                    ← Back to Orders
                </Link>

                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-3xl font-bold mb-8 text-gray-800"
                >
                    Order Details - #{order._id}
                </motion.h2>

                {/* ---------- Basic Order Info ---------- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="border rounded-xl bg-white shadow-md p-6 mb-8"
                >
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Order Information</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 text-gray-700">
                        <p><strong>Status:</strong> {order.orderStatus || "N/A"}</p>
                        <p><strong>Payment Method:</strong> {order.paymentMethod || "N/A"}</p>
                        <p><strong>Payment Status:</strong> {order.paymentStatus || "N/A"}</p>
                        <p><strong>Subtotal:</strong> ${order.subtotal || 0}</p>
                        <p><strong>Tax:</strong> ${order.tax || 0}</p>
                        <p><strong>Shipping:</strong> ${order.shipping || 0}</p>
                        <p><strong>Total:</strong> ${order.total || 0}</p>
                        <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                </motion.div>

                {/* ---------- Billing Address ---------- */}
                {order.billingAddress && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="border rounded-xl bg-white shadow-md p-6 mb-8"
                    >
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Billing Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 text-gray-700">
                            <p><strong>Name:</strong> {order.billingAddress.fullName}</p>
                            <p><strong>Address:</strong> {order.billingAddress.address}</p>
                            <p><strong>City:</strong> {order.billingAddress.city}</p>
                            <p><strong>Province:</strong> {order.billingAddress.province}</p>
                            <p><strong>Country:</strong> {order.billingAddress.country}</p>
                            <p><strong>Postal Code:</strong> {order.billingAddress.postalCode}</p>
                            <p><strong>Phone:</strong> {order.billingAddress.phone}</p>
                        </div>
                    </motion.div>
                )}

                {/* ---------- Shipping Address ---------- */}
                {order.shippingAddress && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="border rounded-xl bg-white shadow-md p-6 mb-8"
                    >
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Shipping Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 text-gray-700">
                            <p><strong>Name:</strong> {order.shippingAddress.fullName}</p>
                            <p><strong>Address:</strong> {order.shippingAddress.address}</p>
                            <p><strong>City:</strong> {order.shippingAddress.city}</p>
                            <p><strong>Province:</strong> {order.shippingAddress.province}</p>
                            <p><strong>Country:</strong> {order.shippingAddress.country}</p>
                            <p><strong>Postal Code:</strong> {order.shippingAddress.postalCode}</p>
                            <p><strong>Phone:</strong> {order.shippingAddress.phone}</p>
                        </div>
                    </motion.div>
                )}

                {/* ---------- Products List ---------- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="border rounded-xl bg-white shadow-md p-6"
                >
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Products</h3>

                    <div className="max-h-[500px] overflow-y-auto space-y-5 pr-2">
                        {order.cartItems?.length > 0 ? (
                            order.cartItems.map((item, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.01 }}
                                    className="border rounded-lg p-4 bg-gray-50 flex flex-col md:flex-row gap-5 transition"
                                >
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-28 h-28 object-cover rounded-lg border"
                                        onError={(e) => (e.target.src = "/no-image.png")}
                                    />

                                    <div className="flex-1 text-gray-700">
                                        <p><strong>Name:</strong> {item.name}</p>
                                        <p><strong>Price:</strong> ${item.price}</p>
                                        <p><strong>Quantity:</strong> {item.quantity}</p>
                                        <p><strong>Product ID:</strong> {item.productId}</p>

                                        {item.policy && (
                                            <div className="mt-4 bg-white border rounded-lg p-4 shadow-sm">
                                                <h4 className="text-lg font-semibold mb-2 text-gray-800">Policy Information</h4>
                                                <div className="grid grid-cols-2 gap-y-1">
                                                    <p><strong>Name:</strong> {item.policy.name}</p>
                                                    <p><strong>Status:</strong> {item.policy.status}</p>
                                                    <p><strong>Coverage:</strong> {item.policy.coverage}</p>
                                                    <p><strong>Duration:</strong> {item.policy.durationDays} days</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <p className="text-gray-600">No products found in this order.</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default VendorOrderDetails;
