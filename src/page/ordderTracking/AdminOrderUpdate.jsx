import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { IMAGE_URL } from "../../API/Api";
import Swal from "sweetalert2";

const AdminOrderUpdate = () => {
    const [orderId, setOrderId] = useState("");
    const [status, setStatus] = useState("Placed");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [allData, setAllData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(8);
    const [endOfDayLoading, setEndOfDayLoading] = useState(false);

    const navigate = useNavigate();

    // Fetch all orders
    const fetchOrders = async () => {
        try {
            const { data } = await API.get("/allOrder");
            setAllData(data.orders || []);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // End of Day handler
    const handleEndOfDay = async () => {
        const confirmed = await Swal.fire({
            icon: "warning",
            title: "Run End of Day?",
            html: "This will close all today's shipments with Loomis and generate the manifest.<br/><br/><strong>Only do this once per day after all shipments are created.</strong>",
            showCancelButton: true,
            confirmButtonText: "Yes, run End of Day",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#7c3aed",
            cancelButtonColor: "#6b7280",
        });
        if (!confirmed.isConfirmed) return;

        try {
            setEndOfDayLoading(true);
            const { data } = await API.post("/shipping/end-of-day");

            if (data.manifestNum) {
                Swal.fire({
                    icon: "success",
                    title: "End of Day Complete",
                    html: `Manifest number: <strong>${data.manifestNum}</strong><br/><span style="color:#6b7280;font-size:13px;">Print the manifest and hand one copy to the Loomis driver.</span>`,
                    confirmButtonColor: "#7c3aed",
                });
            } else {
                Swal.fire({
                    icon: "info",
                    title: "No Shipments Today",
                    text: "No shipments were created today, so no manifest was generated.",
                    confirmButtonColor: "#7c3aed",
                });
            }

            await fetchOrders();
        } catch (err) {
            // ── Friendly error messages based on what went wrong ──────────
            const serverMsg = err.response?.data?.error || err.response?.data?.message || "";

            let title = "Something Went Wrong";
            let text = "Please try again. If the problem continues, contact support.";

            if (serverMsg.includes("At least one shipment required")) {
                title = "No Shipments to Close";
                text = "All of today's shipments have already been manifested, or no shipments were created today.";
            } else if (serverMsg.includes("already manifested") || serverMsg.includes("already saved")) {
                title = "Already Done Today";
                text = "End of Day has already been run today. No action needed.";
            } else if (serverMsg.includes("network") || err.code === "ERR_NETWORK") {
                title = "Connection Problem";
                text = "Could not reach the server. Please check your internet and try again.";
            } else if (err.response?.status === 500) {
                title = "Server Error";
                text = "Something went wrong on our end. Please wait a moment and try again.";
            } else if (err.response?.status === 401 || err.response?.status === 403) {
                title = "Not Authorized";
                text = "You don't have permission to run End of Day. Please log in again.";
            }

            Swal.fire({
                icon: "error",
                title,
                text,
                confirmButtonColor: "#7c3aed",
            });
        } finally {
            setEndOfDayLoading(false);
        }
    };

    // Update order status
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

    // Pagination logic
    const totalPages = Math.ceil(allData.length / ordersPerPage);
    const indexOfLast = currentPage * ordersPerPage;
    const indexOfFirst = indexOfLast - ordersPerPage;
    const currentOrders = allData.slice(indexOfFirst, indexOfLast);

    return (
        <div className="p-4">

            {/* ── Header with End of Day button ── */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Admin Orders</h2>

                <button
                    onClick={handleEndOfDay}
                    disabled={endOfDayLoading}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white font-semibold transition ${endOfDayLoading
                        ? "bg-purple-300 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700"
                        }`}
                >
                    {endOfDayLoading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Running...
                        </>
                    ) : (
                        "Run End of Day"
                    )}
                </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block relative overflow-y-auto max-h-[560px] w-full mt-6 border rounded-lg">
                <div className="grid grid-cols-4 text-center bg-black text-white font-semibold py-3 px-4 sticky top-0 z-10">
                    <div>ORDER NUMBER.</div>
                    <div>PRODUCT</div>
                    <div>STATUS</div>
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
                            className={`grid grid-cols-4 text-center items-center px-4 py-3 border-b border-gray-200 text-sm hover:bg-gray-100 ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                                }`}
                        >
                            <div>{data.orderNumber}</div>
                            <div className="flex justify-center">
                                <img
                                    src={
                                        data.cartItems?.[0]?.image?.startsWith("http")
                                            ? data.cartItems[0].image
                                            : `${IMAGE_URL}/${data.cartItems[0].image}`
                                    }
                                    alt="ProductImage"
                                    className="w-16 h-12 object-cover rounded-md border"
                                />
                            </div>
                            <div>{data.orderStatus}</div>
                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={() => navigate(`/admin/order-details/${data._id}`)}
                                    className="bg-green-600 px-4 py-2 rounded-xl text-white hover:bg-green-700 transition hover:cursor-pointer"
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
                            className={`px-3 py-1 rounded-lg border hover:cursor-pointer ${currentPage === i + 1
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
                                onChange={(e) => setStatus(e.target.value)}
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
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                disabled
                            />

                            <input
                                className="border p-2 w-full rounded"
                                type="datetime-local"
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                disabled
                            />

                            <div className="flex justify-between mt-4 gap-6 w-full">
                                <button
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:cursor-pointer"
                                    onClick={updateOrder}
                                    disabled={!status || !trackingNumber || !deliveryDate}
                                >
                                    Update
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:cursor-pointer"
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

export default AdminOrderUpdate;