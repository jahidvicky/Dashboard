import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { IMAGE_URL } from "../../API/Api";
import Swal from "sweetalert2";

const VendorProductOrder = () => {
    const [orderId, setOrderId] = useState("");
    const [status, setStatus] = useState("Placed");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [allData, setAllData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(8);

    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            const { data } = await API.get("/vendor-orders");
            setAllData(data.orders || []);
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to load orders",
            });
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Pagination
    const totalPages = Math.ceil(allData.length / ordersPerPage);
    const indexOfLast = currentPage * ordersPerPage;
    const indexOfFirst = indexOfLast - ordersPerPage;
    const currentOrders = allData.slice(indexOfFirst, indexOfLast);

    const updateOrder = async () => {
        if (!orderId) {
            Swal.fire("Missing Order ID", "Order ID is required.", "warning");
            return;
        }

        try {
            const { data } = await API.put(
                `/order/updateOrderStatus/${orderId}/status`,
                { status, trackingNumber, deliveryDate }
            );

            Swal.fire({
                icon: "success",
                title: "Success",
                text: data.message || "Order updated successfully!",
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

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Vendor Orders</h2>

            {/* Desktop table */}
            <div className="hidden md:block relative overflow-y-auto max-h-[560px] w-full mt-6 border rounded-lg">
                <div className="grid grid-cols-5 text-center bg-black text-white font-semibold py-3 px-4 sticky top-0 z-10">
                    <div>PRODUCT</div>
                    <div>STATUS</div>
                    <div>TRACKING NO.</div>
                    <div>DATE</div>
                    <div>ACTIONS</div>
                </div>

                {currentOrders.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 text-lg">
                        No Orders Found
                    </div>
                ) : (
                    currentOrders.map((data, idx) => (
                        <div
                            key={idx}
                            className={`grid grid-cols-5 text-center items-center px-4 py-3 border-b border-gray-200 text-sm hover:bg-gray-100 ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                                }`}
                        >
                            <div className="flex justify-center">
                                <img
                                    src={
                                        data.cartItems?.[0]?.image?.startsWith("http")
                                            ? data.cartItems[0].image
                                            : `${IMAGE_URL}/${data.cartItems?.[0]?.image}`
                                    }
                                    alt="Product"
                                    className="w-16 h-12 object-cover rounded-md border"
                                />
                            </div>

                            <div>{data.orderStatus}</div>
                            <div>{data.trackingNumber || "-"}</div>

                            <div>
                                {data.deliveryDate
                                    ? new Date(data.deliveryDate).toISOString().split("T")[0]
                                    : new Date(data.updatedAt).toISOString().split("T")[0]}
                            </div>

                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={() => {
                                        setOrderId(data._id);
                                        setStatus(data.orderStatus);
                                        setTrackingNumber(data.trackingNumber || "");

                                        const now = new Date();
                                        const pad = n => n.toString().padStart(2, "0");
                                        const localDateTime = `${now.getFullYear()}-${pad(
                                            now.getMonth() + 1
                                        )}-${pad(now.getDate())}T${pad(
                                            now.getHours()
                                        )}:${pad(now.getMinutes())}`;

                                        setDeliveryDate(
                                            data.deliveryDate
                                                ? new Date(data.deliveryDate).toISOString().slice(0, 16)
                                                : localDateTime
                                        );

                                        setShowModal(true);
                                    }}
                                    className="bg-blue-500 px-4 py-2 rounded-xl text-white hover:bg-blue-600 transition"
                                >
                                    Change Status
                                </button>

                                <button
                                    onClick={() =>
                                        navigate("/vendor/order-details", { state: { order: data } })
                                    }
                                    className="bg-green-600 px-4 py-2 rounded-xl text-white hover:bg-green-700 transition"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {allData.length > 0 && (
                <div className="flex justify-center mt-6 gap-2 flex-wrap">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-3 py-1 rounded-lg border ${currentPage === i + 1
                                ? "bg-blue-600 text-white font-semibold"
                                : "bg-gray-100 hover:bg-gray-200"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-[500px] p-6 relative">
                        <h3 className="text-lg font-bold mb-2">
                            Update Order {orderId ? `#${orderId}` : "(Loading...)"}
                        </h3>

                        <div className="flex flex-wrap gap-4 mt-4">
                            <select
                                className="border p-2 w-full rounded"
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                            >
                                <option>Placed</option>
                                <option>Processing</option>
                                <option>Shipped</option>
                                <option>Delivered</option>
                                <option>Cancelled</option>
                                <option>Returned</option>
                            </select>

                            <input
                                className="border p-2 w-full rounded"
                                placeholder="Tracking Number"
                                value={trackingNumber}
                                onChange={e => setTrackingNumber(e.target.value)}
                            />

                            <input
                                className="border p-2 w-full rounded"
                                type="datetime-local"
                                value={deliveryDate}
                                onChange={e => setDeliveryDate(e.target.value)}
                            />

                            <div className="flex justify-between mt-4 w-full">
                                <button
                                    className="bg-green-600 text-white px-4 py-2 rounded"
                                    onClick={updateOrder}
                                    disabled={!status}
                                >
                                    Update
                                </button>

                                <button
                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorProductOrder;
