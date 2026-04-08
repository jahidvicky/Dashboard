import React, { useEffect, useState } from "react";
import API, { IMAGE_URL } from "../../API/Api";
import Swal from "sweetalert2";

export default function AdminReturnRequests() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("Requested");
    const [expandedRow, setExpandedRow] = useState(null);
    const [lightboxImg, setLightboxImg] = useState(null); // <-- lightbox state

    const fetchReturnRequests = async () => {
        try {
            const res = await API.get("/order/return-requests");
            setOrders(res.data.orders || []);
        } catch (err) {
            console.error("Failed to fetch return requests:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturnRequests();
    }, []);

    const handleApprove = async (orderId, orderNumber) => {
        const result = await Swal.fire({
            title: "Approve Return?",
            text: `Approve return for order #${orderNumber}? This will create an E-Return via Loomis and email the customer.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, Approve & Create E-Return",
        });

        if (!result.isConfirmed) return;

        try {
            Swal.fire({ title: "Creating E-Return...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            const res = await API.post(`/order/return/approve/${orderId}`);

            Swal.fire({
                icon: "success",
                title: "Return Approved",
                html: `
          <p>E-Return created successfully.</p>
          <p><b>Return Tracking:</b> ${res.data.trackingNumber}</p>
          <p><b>RMA:</b> ${res.data.rmaNumber}</p>
          <p class="text-sm text-gray-500 mt-2">Loomis will print the label and arrange pickup from the customer.</p>
        `,
            });

            fetchReturnRequests();
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || "Failed to approve return", "error");
        }
    };

    const handleReject = async (orderId, orderNumber) => {
        const { value: rejectionReason } = await Swal.fire({
            title: "Reject Return Request",
            input: "textarea",
            inputLabel: `Rejection reason for order #${orderNumber}`,
            inputPlaceholder: "Enter reason for rejecting this return...",
            inputAttributes: { "aria-label": "Rejection reason" },
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            confirmButtonText: "Reject Return",
            inputValidator: (value) => {
                if (!value || !value.trim()) return "Please enter a rejection reason";
            },
        });

        if (!rejectionReason) return;

        try {
            await API.post(`/order/return/reject/${orderId}`, { rejectionReason });
            Swal.fire("Rejected", "Return request rejected and customer notified.", "success");
            fetchReturnRequests();
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || "Failed to reject return", "error");
        }
    };

    const filtered = orders.filter((o) => o.returnRequest?.status === filter);

    const statusColor = {
        Requested: "bg-yellow-100 text-yellow-800",
        Approved: "bg-green-100 text-green-800",
        Rejected: "bg-red-100 text-red-800",
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen text-gray-600">
                Loading return requests...
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Return Requests</h1>

            {/* Filter Tabs */}
            <div className="flex gap-3 mb-6">
                {["Requested", "Approved", "Rejected"].map((tab) => {
                    const count = orders.filter((o) => o.returnRequest?.status === tab).length;
                    return (
                        <button
                            key={tab}
                            onClick={() => { setFilter(tab); setExpandedRow(null); }}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === tab
                                ? "bg-black text-white"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            {tab} ({count})
                        </button>
                    );
                })}
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    No {filter.toLowerCase()} return requests.
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/*  Removed min-w-[1100px] and overflow-x-auto — table now fills full width */}
                    <table className="w-full text-sm table-fixed">
                        <colgroup>
                            <col style={{ width: "18%" }} />
                            <col style={{ width: "22%" }} />
                            <col style={{ width: "8%" }} />
                            <col style={{ width: "13%" }} />
                            <col style={{ width: "11%" }} />
                            <col style={{ width: "13%" }} />
                            <col style={{ width: "15%" }} />
                        </colgroup>
                        <thead>
                            <tr className="bg-black text-white">
                                <th className="px-3 py-3 text-left font-semibold">Order #</th>
                                <th className="px-3 py-3 text-left font-semibold">Customer</th>
                                <th className="px-3 py-3 text-left font-semibold">Items</th>
                                <th className="px-3 py-3 text-left font-semibold">Requested At</th>
                                <th className="px-3 py-3 text-left font-semibold">Status</th>
                                <th className="px-3 py-3 text-left font-semibold">E-Return #</th>
                                <th className="px-3 py-3 text-center font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((order, idx) => (
                                <tr
                                    key={order._id}
                                    className={`hover:bg-gray-50 transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                                >
                                    {/* Order Number */}
                                    <td className="px-3 py-3 font-medium text-gray-800 truncate">
                                        #{order.orderNumber}
                                    </td>

                                    {/* Customer */}
                                    <td className="px-3 py-3 truncate">
                                        <p className="font-medium text-gray-800 truncate">
                                            {order.shippingAddress?.fullName}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">{order.email}</p>
                                    </td>

                                    {/* Items count */}
                                    <td className="px-3 py-3 text-gray-600 text-center">
                                        {order.cartItems.length}
                                    </td>

                                    {/* Requested At */}
                                    <td className="px-3 py-3 text-gray-600 text-sm">
                                        {new Date(order.returnRequest.requestedAt).toLocaleDateString()}
                                    </td>

                                    {/* Status */}
                                    <td className="px-3 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[order.returnRequest.status]}`}>
                                            {order.returnRequest.status}
                                        </span>
                                    </td>

                                    {/* E-Return tracking */}
                                    <td className="px-3 py-3">
                                        {order.returnInfo?.trackingNumber ? (
                                            <span className="text-xs font-mono text-green-700 break-all">
                                                {order.returnInfo.trackingNumber}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">—</span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-3 py-3">
                                        <div className="flex flex-col gap-1.5 items-center">
                                            {order.returnRequest.status === "Requested" && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(order._id, order.orderNumber)}
                                                        className="w-full bg-green-600 text-white px-2 py-1.5 rounded-lg hover:bg-green-700 transition text-xs font-medium"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(order._id, order.orderNumber)}
                                                        className="w-full bg-red-600 text-white px-2 py-1.5 rounded-lg hover:bg-red-700 transition text-xs font-medium"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => setExpandedRow(order)}
                                                className="w-full bg-blue-600 text-white px-2 py-1.5 rounded-lg hover:bg-blue-700 transition text-xs font-medium"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/*  Lightbox Modal — shows image preview instead of download */}
            {lightboxImg && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4"
                    onClick={() => setLightboxImg(null)}
                >
                    <div
                        className="relative max-w-3xl w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setLightboxImg(null)}
                            className="absolute -top-10 right-0 text-white text-3xl leading-none hover:text-gray-300 transition"
                        >
                            ×
                        </button>
                        <img
                            src={lightboxImg}
                            alt="Return preview"
                            className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
                        />
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {expandedRow && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                    onClick={() => setExpandedRow(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">
                                    Return Details — #{expandedRow.orderNumber}
                                </h2>
                                <p className="text-sm text-gray-500">{expandedRow.email}</p>
                            </div>
                            <button
                                onClick={() => setExpandedRow(null)}
                                className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-5 text-sm">

                            {/* Status + Dates */}
                            <div className="flex flex-wrap gap-3 items-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[expandedRow.returnRequest.status]}`}>
                                    {expandedRow.returnRequest.status}
                                </span>
                                <span className="text-gray-500 text-xs">
                                    Requested: {new Date(expandedRow.returnRequest.requestedAt).toLocaleString()}
                                </span>
                                {expandedRow.returnRequest.resolvedAt && (
                                    <span className="text-gray-500 text-xs">
                                        Resolved: {new Date(expandedRow.returnRequest.resolvedAt).toLocaleString()}
                                    </span>
                                )}
                            </div>

                            {/* Return Reason */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <p className="font-semibold text-gray-700 mb-1">Return Reason</p>
                                <p className="text-gray-600">{expandedRow.returnRequest.reason}</p>
                                {expandedRow.returnRequest.rejectionReason && (
                                    <div className="mt-3 pt-3 border-t border-red-100">
                                        <p className="font-semibold text-red-700 mb-1">Rejection Reason</p>
                                        <p className="text-red-600">{expandedRow.returnRequest.rejectionReason}</p>
                                    </div>
                                )}
                            </div>

                            {/* Pickup Address */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <p className="font-semibold text-gray-700 mb-2">Pickup Address (Customer)</p>
                                <p className="text-gray-600">{expandedRow.shippingAddress?.fullName}</p>
                                <p className="text-gray-600">{expandedRow.shippingAddress?.address}</p>
                                <p className="text-gray-600">
                                    {expandedRow.shippingAddress?.city}, {expandedRow.shippingAddress?.province} {expandedRow.shippingAddress?.postalCode}
                                </p>
                                <p className="text-gray-600">{expandedRow.shippingAddress?.phone}</p>
                            </div>

                            {/* Order Items */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <p className="font-semibold text-gray-700 mb-2">Order Items</p>
                                <div className="space-y-1">
                                    {expandedRow.cartItems.map((item, i) => (
                                        <div key={i} className="flex justify-between text-gray-600">
                                            <span>{item.name} ×{item.quantity}</span>
                                            <span className="font-medium">${Math.round(item.price)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* E-Return Info */}
                            {expandedRow.returnInfo?.trackingNumber && (
                                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                    <p className="font-semibold text-green-700 mb-2">E-Return Info</p>
                                    <div className="space-y-1 text-gray-700">
                                        <p><b>Tracking #:</b> <span className="font-mono">{expandedRow.returnInfo.trackingNumber}</span></p>
                                        <p><b>RMA:</b> {expandedRow.returnInfo.rmaNumber}</p>
                                        <p><b>Shipping Date:</b> {expandedRow.returnInfo.shippingDate}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Label printed at nearest Loomis facility. Loomis arranges customer pickup.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/*  Images — click opens lightbox, not download */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <p className="font-semibold text-gray-700 mb-2">
                                    Customer Images ({expandedRow.returnRequest.images?.length || 0})
                                </p>
                                {expandedRow.returnRequest.images?.length > 0 ? (
                                    <div className="flex gap-3 flex-wrap">
                                        {expandedRow.returnRequest.images.map((img, i) => (
                                            <img
                                                key={i}
                                                src={`${IMAGE_URL}${img}`}
                                                alt={`return-${i}`}
                                                className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 hover:shadow-md transition"
                                                onClick={() => setLightboxImg(`${IMAGE_URL}${img}`)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-xs">No images uploaded</p>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                            {expandedRow.returnRequest.status === "Requested" && (
                                <>
                                    <button
                                        onClick={() => { setExpandedRow(null); handleApprove(expandedRow._id, expandedRow.orderNumber); }}
                                        className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
                                    >
                                        Approve & Create E-Return
                                    </button>
                                    <button
                                        onClick={() => { setExpandedRow(null); handleReject(expandedRow._id, expandedRow.orderNumber); }}
                                        className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setExpandedRow(null)}
                                className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}