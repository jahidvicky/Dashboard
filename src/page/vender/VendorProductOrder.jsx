import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../API/Api";
import Swal from "sweetalert2";

const VendorProductOrder = () => {
    const [orderId, setOrderId] = useState("");
    const [status, setStatus] = useState("Placed");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [allData, setAllData] = useState([]);
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(8);

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

    // Pagination logic
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

            {/* Desktop Table */}
            <div className="hidden md:block relative overflow-y-auto max-h-[560px] w-full mt-6 border rounded-lg">
                <div className="grid grid-cols-7 text-center bg-black text-white font-semibold py-3 px-4 sticky top-0 z-10">
                    <div className="text-lg">ORDER ID</div>
                    <div className="text-lg">USER ID</div>
                    <div className="text-lg">STATUS</div>
                    <div className="text-lg">TRACKING NO.</div>
                    <div className="text-lg">DATE</div>
                    <div className="text-lg">ACTION</div>
                    <div className="text-lg">DETAILS</div>
                </div>

                {currentOrders.map((data, idx) => (
                    <div
                        key={idx}
                        className={`grid grid-cols-7 text-center items-center px-4 py-3 border-b border-gray-200 text-sm hover:bg-gray-100 
            ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                    >
                        <div className="break-words whitespace-normal text-sm font-medium text-gray-700">{data._id}</div>
                        <div className="break-words whitespace-normal ml-3 text-sm text-gray-600">{data.userId}</div>
                        <div className="text-sm text-gray-600">{data.orderStatus}</div>
                        <div className="break-words whitespace-normal text-sm text-gray-600">{data.trackingNumber || "-"}</div>
                        <div className="text-sm text-gray-600">
                            {data.deliveryDate
                                ? new Date(data.deliveryDate).toISOString().split("T")[0]
                                : new Date(data.updatedAt).toISOString().split("T")[0]}
                        </div>
                        <div>
                            <button
                                onClick={() => {
                                    setOrderId(data._id);
                                    setStatus(data.orderStatus);
                                    setTrackingNumber(data.trackingNumber || "");
                                    const now = new Date();
                                    const pad = (n) => n.toString().padStart(2, "0");
                                    const localDateTime = `${now.getFullYear()}-${pad(
                                        now.getMonth() + 1
                                    )}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(
                                        now.getMinutes()
                                    )}`;
                                    setDeliveryDate(
                                        data.deliveryDate
                                            ? new Date(data.deliveryDate).toISOString().slice(0, 16)
                                            : localDateTime
                                    );
                                    setShowModal(true);
                                }}
                                className="bg-blue-500 px-3 py-1 h-10 rounded-xl text-white hover:bg-blue-600 transition"
                            >
                                Change Status
                            </button>
                        </div>
                        <div>
                            <button
                                onClick={() =>
                                    navigate("/vendor/order-details", { state: { order: data } })
                                }
                                className="bg-green-600 px-3 py-1 h-10 rounded-xl text-white hover:bg-green-700 transition"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
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

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col gap-4 mt-6">
                {currentOrders.map((data, idx) => (
                    <div
                        key={idx}
                        className="bg-white shadow rounded-lg p-4 border hover:shadow-lg transition"
                    >
                        <p className="text-sm font-semibold text-gray-700 break-words">
                            <span className="font-bold">ORDER ID:</span> {data._id}
                        </p>
                        <p className="text-sm text-gray-600 break-words">
                            <span className="font-bold">USER ID:</span> {data.userId}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-bold">Status:</span> {data.orderStatus}
                        </p>
                        <p className="text-sm text-gray-600 break-words">
                            <span className="font-bold">Tracking:</span> {data.trackingNumber || "-"}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-bold">Date:</span>{" "}
                            {data.deliveryDate
                                ? new Date(data.deliveryDate).toISOString().split("T")[0]
                                : new Date(data.updatedAt).toISOString().split("T")[0]}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <button
                                onClick={() => {
                                    setOrderId(data._id);
                                    setStatus(data.orderStatus);
                                    setTrackingNumber(data.trackingNumber || "");
                                    const now = new Date();
                                    const pad = (n) => n.toString().padStart(2, "0");
                                    const localDateTime = `${now.getFullYear()}-${pad(
                                        now.getMonth() + 1
                                    )}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(
                                        now.getMinutes()
                                    )}`;
                                    setDeliveryDate(
                                        data.deliveryDate
                                            ? new Date(data.deliveryDate).toISOString().slice(0, 16)
                                            : localDateTime
                                    );
                                    setShowModal(true);
                                }}
                                className="bg-blue-500 px-3 py-1 rounded text-white hover:bg-blue-600 transition"
                            >
                                Change Status
                            </button>
                            <button
                                onClick={() =>
                                    navigate("/vendor/order-details", { state: { order: data } })
                                }
                                className="bg-green-600 px-3 py-1 rounded text-white hover:bg-green-700 transition"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-[500px] p-6 relative">
                        <h3 className="text-lg font-bold mb-2">
                            Update Order {orderId ? `#${orderId}` : "(Loading...)"}
                        </h3>

                        <div className="flex flex-wrap gap-4">
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

export default VendorProductOrder;
