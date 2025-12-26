import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../API/Api";
import Swal from "sweetalert2";

const AdminOrderUpdate = () => {
    const [orderId, setOrderId] = useState("");
    const [status, setStatus] = useState("Placed");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [allData, setAllData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 8;

    const navigate = useNavigate();

    /* ================= FETCH ORDERS ================= */

    const fetchOrders = async () => {
        try {
            const { data } = await API.get("/allOrder");
            setAllData(data.orders || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    /* ================= UPDATE ORDER ================= */

    const updateOrder = async () => {
        if (!orderId) {
            Swal.fire("Missing Order ID", "Order ID is required.", "warning");
            return;
        }

        try {
            const { data } = await API.put(
                `/order/updateOrderStatus/${orderId}`,
                {
                    status,
                    trackingNumber,
                    deliveryDate,
                }
            );

            Swal.fire({
                icon: "success",
                title: "Order Updated",
                text: data.message,
                timer: 2000,
                showConfirmButton: false,
            });

            await fetchOrders();
            setShowModal(false);
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text: err.response?.data?.message || "Failed to update order.",
            });
        }
    };

    /* ================= PAGINATION ================= */

    const totalPages = Math.ceil(allData.length / ordersPerPage);
    const indexOfLast = currentPage * ordersPerPage;
    const indexOfFirst = indexOfLast - ordersPerPage;
    const currentOrders = allData.slice(indexOfFirst, indexOfLast);

    /* ================= RENDER ================= */

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Admin Orders</h2>

            {/* Orders Table */}
            <div className="hidden md:block overflow-y-auto max-h-[560px] border rounded-lg">
                <div className="grid grid-cols-6 bg-black text-white py-3 text-center font-semibold sticky top-0">
                    <div>ORDER ID</div>
                    <div>USER ID</div>
                    <div>STATUS</div>
                    <div>TRACKING</div>
                    <div>DATE</div>
                    <div>ACTIONS</div>
                </div>

                {currentOrders.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        No Orders Found
                    </div>
                ) : (
                    currentOrders.map((order, idx) => (
                        <div
                            key={order._id}
                            className={`grid grid-cols-6 text-center items-center py-3 border-b text-sm ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                                }`}
                        >
                            <div>{order._id}</div>
                            <div>{order.userId}</div>
                            <div className="font-semibold">{order.orderStatus}</div>
                            <div>{order.trackingNumber || "-"}</div>
                            <div>
                                {new Date(order.updatedAt).toISOString().split("T")[0]}
                            </div>
                            <div className="flex justify-center gap-2">
                                <button
                                    onClick={() => {
                                        setOrderId(order._id);
                                        setStatus(order.orderStatus);
                                        setTrackingNumber(order.trackingNumber || "");
                                        setDeliveryDate(
                                            order.deliveryDate
                                                ? new Date(order.deliveryDate)
                                                    .toISOString()
                                                    .slice(0, 16)
                                                : ""
                                        );
                                        setShowModal(true);
                                    }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded"
                                >
                                    Update
                                </button>

                                <button
                                    onClick={() =>
                                        navigate(`/admin/order-details/${order._id}`)
                                    }
                                    className="bg-green-600 text-white px-4 py-2 rounded"
                                >
                                    View
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-3 py-1 rounded ${currentPage === i + 1
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[450px] rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4">
                            Update Order #{orderId}
                        </h3>

                        {/* STATUS */}
                        <select
                            className="border p-2 w-full rounded mb-3"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="Placed">Placed</option>
                            <option value="Sent To Lab">Sent To Lab</option>
                            <option value="Received From Lab">
                                Received From Lab
                            </option>
                            <option value="Delivered">Delivered</option>
                        </select>

                        {/* TRACKING */}
                        <input
                            className="border p-2 w-full rounded mb-3"
                            placeholder="Tracking Number"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                        />

                        {/* DELIVERY DATE */}
                        <input
                            className="border p-2 w-full rounded mb-4"
                            type="datetime-local"
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                        />

                        <div className="flex justify-between">
                            <button
                                onClick={updateOrder}
                                className="bg-green-600 text-white px-4 py-2 rounded"
                            >
                                Update
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrderUpdate;
