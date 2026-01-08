import React, { useEffect, useState } from "react";
import API, { IMAGE_URL } from "../../API/Api";
import Swal from "sweetalert2";

const ExchangeRequests = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    // ===============================
    // 📦 Fetch exchange requests
    // ===============================
    const fetchExchangeRequests = async () => {
        try {
            const res = await API.get("/admin/exchange-requests");
            setOrders(res.data.orders || []);
        } catch {
            Swal.fire("Error", "Failed to load exchange requests", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExchangeRequests();
    }, []);

    // ===============================
    // Approve /  Reject
    // ===============================
    const handleDecision = async (orderId, itemId, decision) => {
        const confirm = await Swal.fire({
            title: `${decision} Exchange?`,
            text: `Are you sure you want to ${decision.toLowerCase()} this exchange request?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: decision === "Approve" ? "#16a34a" : "#dc2626",
            confirmButtonText: decision,
        });

        if (!confirm.isConfirmed) return;

        try {
            setProcessingId(itemId);

            const url =
                decision === "Approve"
                    ? `/order/exchange/approve/${orderId}/${itemId}`
                    : `/order/exchange/reject/${orderId}/${itemId}`;

            await API.put(url);

            Swal.fire("Success", `Exchange ${decision.toLowerCase()}ed`, "success");
            fetchExchangeRequests();
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || "Action failed", "error");
        } finally {
            setProcessingId(null);
        }
    };

    // ===============================
    // 🔁 Complete Exchange
    // ===============================
    const handleComplete = async (orderId, itemId) => {
        const confirm = await Swal.fire({
            title: "Complete Exchange?",
            text: "Mark this exchange as completed?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#2563eb",
            confirmButtonText: "Complete",
        });

        if (!confirm.isConfirmed) return;

        try {
            setProcessingId(itemId);

            await API.put(`/order/exchange/complete/${orderId}/${itemId}`);

            Swal.fire("Completed", "Exchange marked as completed", "success");
            fetchExchangeRequests();
        } catch (err) {
            Swal.fire(
                "Error",
                err.response?.data?.message || "Failed to complete exchange",
                "error"
            );
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return <p className="p-6 text-gray-600">Loading exchange requests…</p>;
    }

    const showReasonPopup = (item) => {
        const resolveImage = (img) => {
            if (!img) return "";
            return img.startsWith("http")
                ? img
                : `${IMAGE_URL}/exchange/${img}`;
        };

        const imagesHtml =
            item.exchangeImages?.length > 0
                ? item.exchangeImages
                    .map(
                        (img) => `
        <img 
          src="${resolveImage(img)}"
          data-full="${resolveImage(img)}"
          class="exchange-thumb"
          style="
            width:80px;
            height:80px;
            object-fit:cover;
            border-radius:6px;
            margin:6px;
            cursor:pointer;
            border:1px solid #ddd;
          "
        />
      `
                    )
                    .join("")
                : `<p style="color:#888;font-size:13px">No images uploaded</p>`;

        Swal.fire({
            title: "Exchange Details",
            width: 620,
            showCloseButton: true,
            confirmButtonText: "Close",
            confirmButtonColor: "#2563eb",
            html: `
          <div>
            <p><strong>Status:</strong> ${item.exchangeStatus}</p>
            <p style="margin-top:10px"><strong>Customer Reason:</strong></p>
            <p style="background:#f9fafb;padding:10px;border-radius:6px">
              ${item.exchangeReason || "No reason provided"}
            </p>

            <p style="margin-top:12px"><strong>Customer Images:</strong></p>
            <div style="display:flex;flex-wrap:wrap">
              ${imagesHtml}
            </div>
          </div>
        `,
            didOpen: () => {
                document
                    .querySelectorAll(".exchange-thumb")
                    .forEach((img) => {
                        img.addEventListener("click", () => {
                            Swal.fire({
                                imageUrl: img.dataset.full,
                                showCloseButton: true,
                                showConfirmButton: false,
                                backdrop: true,
                            });
                        });
                    });
            },
        });
    };






    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Exchange Requests</h1>

            {orders.length === 0 ? (
                <p className="text-gray-600">No exchange requests found.</p>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full border-collapse">
                        <thead className="bg-black">
                            <tr className="text-left text-sm font-semibold text-white">
                                <th className="p-3 border text-center">Order ID</th>
                                <th className="p-3 border text-center">Product</th>
                                <th className="p-3 border text-center">Customer</th>
                                <th className="p-3 border text-center">Reason</th>
                                <th className="p-3 border text-center">Status</th>
                                <th className="p-3 border text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map((order) =>
                                order.cartItems.map((item) => (
                                    <tr key={item._id} className="text-sm text-gray-700">
                                        <td className="p-3 border  text-center">{order._id}</td>
                                        <td className="p-3 border  text-center font-medium">{item.name}</td>
                                        <td className="p-3 border  text-center">{order.email}</td>
                                        <td className="p-3 border text-center">
                                            <button
                                                onClick={() => showReasonPopup(item)}
                                                className="text-blue-600 hover:underline font-medium"
                                            >
                                                View
                                            </button>
                                        </td>


                                        {/* STATUS */}
                                        <td className="p-3 border  text-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold
    ${item.exchangeStatus === "Requested"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : item.exchangeStatus === "Approved"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : item.exchangeStatus === "Completed"
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-gray-200 text-gray-700"
                                                    }
  `}
                                            >
                                                {item.exchangeStatus}
                                            </span>

                                        </td>

                                        {/* ACTIONS */}
                                        <td className="p-3 border">
                                            <div className="flex flex-wrap gap-2">
                                                {item.exchangeStatus === "Requested" && (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                handleDecision(order._id, item._id, "Approve")
                                                            }
                                                            disabled={processingId === item._id}
                                                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleDecision(order._id, item._id, "Reject")
                                                            }
                                                            disabled={processingId === item._id}
                                                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}

                                                {item.exchangeStatus === "Approved" && (
                                                    <button
                                                        onClick={() =>
                                                            handleComplete(order._id, item._id)
                                                        }
                                                        disabled={processingId === item._id}
                                                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ExchangeRequests;
