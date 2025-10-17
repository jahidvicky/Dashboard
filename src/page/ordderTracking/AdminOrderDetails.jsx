import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../API/Api";
import { motion } from "framer-motion"; // Add framer-motion for smooth animations

const AdminOrderDetails = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);

    const fetchOrderDetails = async () => {
        try {
            const { data } = await API.get(`/order/${id}`);
            setOrder(data.order);
        } catch (err) {
            console.log("Failed to load order:", err);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    if (!order) {
        return (
            <div className="p-6 text-center text-gray-500 text-xl">
                Loading order details...
            </div>
        );
    }

    return (
        <motion.div
            className="p-8 max-w-7xl mx-auto space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Order #{order._id}</h1>
                <Link
                    to="/admin/admin-order"
                    className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
                >
                    Back
                </Link>
            </div>

            {/* Order Info */}
            <motion.div
                className="bg-white shadow-md rounded-lg p-6 border-l-4 border-blue-500"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Order Information</h2>
                <div className="grid grid-cols-2 gap-4 text-gray-700">
                    <p><strong>Status:</strong> {order.orderStatus}</p>
                    <p><strong>Tracking Number:</strong> {order.trackingNumber}</p>
                    <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                    <p><strong>Total:</strong> ${order.total}</p>
                    <p><strong>Subtotal:</strong> ${order.subtotal}</p>
                    <p><strong>Tax:</strong> ${order.tax}</p>
                    <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                    <p><strong>Updated At:</strong> {new Date(order.updatedAt).toLocaleString()}</p>
                </div>
            </motion.div>

            {/* Shipping & Billing Info */}
            <motion.div
                className="bg-white shadow-md rounded-lg p-6 border-l-4 border-green-500 grid grid-cols-1 md:grid-cols-2 gap-6"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
            >
                {/* Shipping Address */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Shipping Address</h2>
                    <p><strong>Name:</strong> {order.shippingAddress?.fullName}</p>
                    <p><strong>Address:</strong> {order.shippingAddress?.address}</p>
                    <p><strong>City:</strong> {order.shippingAddress?.city}</p>
                    <p><strong>Province:</strong> {order.shippingAddress?.province}</p>
                    <p><strong>Postal Code:</strong> {order.shippingAddress?.postalCode}</p>
                </div>

                {/* Billing Address */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Billing Address</h2>
                    <p><strong>Name:</strong> {order.billingAddress?.fullName}</p>
                    <p><strong>Address:</strong> {order.billingAddress?.address}</p>
                    <p><strong>City:</strong> {order.billingAddress?.city}</p>
                    <p><strong>Province:</strong> {order.billingAddress?.province}</p>
                    <p><strong>Postal Code:</strong> {order.billingAddress?.postalCode}</p>
                </div>
            </motion.div>

            {/* Products */}
            <motion.div
                className="bg-white shadow-md rounded-lg p-6 border-l-4 border-purple-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className="text-2xl font-semibold mb-6 text-gray-700">Products</h2>
                {order.cartItems.map((item, idx) => (
                    <motion.div
                        key={idx}
                        className="border rounded-lg p-4 mb-4 flex flex-col md:flex-row gap-6 items-start hover:shadow-lg transition"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx }}
                    >
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-32 h-32 object-contain border rounded"
                        />
                        <div className="flex-1 space-y-1">
                            <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                            <p><strong>Product ID:</strong> {item.productId}</p>
                            <p><strong>Quantity:</strong> {item.quantity}</p>
                            <p><strong>Color:</strong> {item.product_color?.join(", ") || "N/A"}</p>
                            <p><strong>Size:</strong> {item.product_size?.join(", ") || "N/A"}</p>
                            {item.lens?.lens && (
                                <p><strong>Lens:</strong> {item.lens.lens.selectedLens || "N/A"}</p>
                            )}
                            {item.policy && (
                                <p><strong>Policy:</strong> {item.policy.name} - {item.policy.coverage} | Status: {item.policy.status}
                                    <p>Policy Price: ${item.price}</p>
                                </p>

                            )}
                            <p><strong>Company:</strong> {item.policy?.companyName}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div >
    );
};

export default AdminOrderDetails;
