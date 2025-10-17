import React, { useEffect, useState } from "react";
import API from "../../../API/Api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const CustomerClaims = () => {
    const [claims, setClaims] = useState([]);
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [claimsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState("All");
    const indexOfLastClaim = currentPage * claimsPerPage
    const indexOfFirstClaim = indexOfLastClaim - claimsPerPage

    // NEW: Filter claims based on status before pagination
    const filteredClaims = statusFilter === "All"
        ? claims
        : claims.filter((claim) => claim.status === statusFilter);

    const currentClaims = filteredClaims.slice(indexOfFirstClaim, indexOfLastClaim)
    const totalPages = Math.ceil(filteredClaims.length / claimsPerPage)
    const handlePageChange = (page) => setCurrentPage(page)

    const fetchClaims = async () => {
        try {
            const res = await API.get("/claims");
            setClaims(res.data);
        } catch (err) {
            console.error("Failed to fetch claims", err);
        }
    };

    useEffect(() => {
        fetchClaims();
    }, []);

    const handleStatusChange = async (claimId, status) => {
        if (status === "Approved") {
            const { value: formValues } = await Swal.fire({
                title: "Approve Claim",
                html: `
                    <div class="flex flex-col gap-2">
                        <input id="claimAmount" type="number" placeholder="Enter claim settlement amount" 
                            class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <textarea id="claimNotes" placeholder="Enter notes (optional)" maxlength="250"
                            class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: "Confirm",
                cancelButtonText: "Cancel",
                focusConfirm: false,
                preConfirm: () => {
                    const claimAmount = document.getElementById("claimAmount").value;
                    const notes = document.getElementById("claimNotes").value;

                    if (!claimAmount || isNaN(claimAmount) || Number(claimAmount) <= 0) {
                        Swal.showValidationMessage("Please enter a valid claim amount greater than 0");
                        return false;
                    }

                    return { claimAmount: Number(claimAmount), notes };
                },
                customClass: {
                    confirmButton: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded ml-2",
                    cancelButton: "bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded",
                    popup: "p-6 rounded-lg border border-gray-300 shadow-lg max-w-md w-full",
                    title: "text-xl font-bold mb-4 text-gray-800 text-center",
                },
            });

            if (!formValues) return;

            try {
                await API.put(`/claims/${claimId}`, {
                    status,
                    claimAmount: formValues.claimAmount,
                    notes: formValues.notes,
                });
                Swal.fire(
                    "Success",
                    `Claim approved with amount $${formValues.claimAmount}`,
                    "success"
                );
                fetchClaims();
            } catch (err) {
                Swal.fire("Error", "Failed to update claim", "error");
            }
        } else if (status === "Rejected") {
            const { value: rejectionReason } = await Swal.fire({
                title: "Reject Claim",
                html: `
                    <div class="flex flex-col gap-2">
                        <label for="rejectionReason" class="text-gray-700 font-medium">Rejection Reason</label>
                        <textarea id="rejectionReason" placeholder="Enter reason for rejection" maxlength="250"
                            class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"></textarea>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: "Confirm Rejection",
                cancelButtonText: "Cancel",
                focusConfirm: false,
                preConfirm: () => {
                    const reason = document.getElementById("rejectionReason").value.trim();
                    if (!reason) {
                        Swal.showValidationMessage("Please enter a rejection reason.");
                        return false;
                    }
                    return reason;
                },
                customClass: {
                    confirmButton: "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded ml-2",
                    cancelButton: "bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded",
                    popup: "p-6 rounded-lg border border-gray-300 shadow-lg max-w-md w-full",
                    title: "text-xl font-bold mb-4 text-gray-800 text-center",
                },
            });

            if (!rejectionReason) return;

            try {
                await API.put(`/claims/${claimId}`, {
                    status,
                    rejectionReason,
                });
                Swal.fire("Rejected", "Claim has been rejected successfully", "success");
                fetchClaims();
            } catch (err) {
                Swal.fire("Error", "Failed to reject claim", "error");
            }
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold text-gray-800 text-center">
                Customer Claim Requests
            </h2>

            {/* NEW: Dropdown filter */}
            <div className="mb-4">
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="border border-gray-400 rounded p-2"
                >
                    <option value="All">All</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>

            {currentClaims.length === 0 ? (
                <p className="text-gray-600 text-center">No claim requests found.</p>
            ) : (
                <div className="overflow-x-auto rounded-lg shadow border border-gray-300">
                    <table className="min-w-[1000px] w-full text-left border-collapse">
                        <thead className="bg-black sticky top-0 z-10 text-white">
                            <tr>
                                <th className="p-3">Customer</th>
                                <th className="p-3">Order ID</th>
                                <th className="p-3">Claim Date</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentClaims.map((claim) => (
                                <tr key={claim._id} className="border-t hover:bg-gray-50 transition">
                                    <td className="p-3">{claim.orderId?.shippingAddress?.fullName || "N/A"}</td>
                                    <td className="p-3">{claim.orderId?._id || "N/A"}</td>
                                    <td className="p-3">
                                        {claim.claimDate ? new Date(claim.claimDate).toLocaleDateString() : "-"}
                                    </td>
                                    <td
                                        className={`p-3 font-semibold ${claim.status === "Pending"
                                            ? "text-yellow-600"
                                            : claim.status === "Approved"
                                                ? "text-green-600"
                                                : "text-red-600"
                                            }`}
                                    >
                                        {claim.status}
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="flex flex-nowrap gap-2 justify-center items-center">
                                            <button
                                                onClick={() => handleStatusChange(claim._id, "Approved")}
                                                disabled={claim.status !== "Pending"}
                                                className={`px-4 py-2 rounded text-white transition ${claim.status !== "Pending"
                                                    ? "bg-green-400 opacity-100 cursor-not-allowed"
                                                    : "bg-green-600 hover:bg-green-700 cursor-pointer"
                                                    }`}
                                            >
                                                {claim.status === "Approved" ? "Approved" : "Approve"}
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(claim._id, "Rejected")}
                                                disabled={claim.status !== "Pending"}
                                                className={`px-4 py-2 rounded text-white transition ${claim.status !== "Pending"
                                                    ? "bg-red-400 opacity-100 cursor-not-allowed"
                                                    : "bg-red-600 hover:bg-red-700 cursor-pointer"
                                                    }`}
                                            >
                                                {claim.status === "Rejected" ? "Rejected" : "Reject"}
                                            </button>
                                            <button
                                                onClick={() => navigate(`/company/claims/${claim._id}`)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition cursor-pointer"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="flex justify-center mt-4 space-x-2 pb-4">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    className={`px-3 py-1 border rounded transition-colors ${currentPage === i + 1
                                        ? "bg-red-600 text-white border-red-600"
                                        : "hover:bg-red-100"
                                        }`}
                                    onClick={() => handlePageChange(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomerClaims;
