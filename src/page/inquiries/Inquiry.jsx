import React, { useEffect, useRef, useState } from "react";
import API from "../../API/Api";
import Swal from "sweetalert2";

/* ── Status badge helper ─────────────────────────────────────── */
const StatusBadge = ({ status }) => {
    const map = {
        open: "bg-green-100 text-green-700 border border-green-300",
        close: "bg-gray-100  text-gray-600  border border-gray-300",
        rejected: "bg-red-100   text-red-600   border border-red-300",
    };
    const label = {
        open: "Open",
        close: "Closed",
        rejected: "Rejected",
    };
    return (
        <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] ?? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                }`}
        >
            {label[status] ?? status}
        </span>
    );
};

/* ── Main Component ──────────────────────────────────────────── */
const Inquiry = () => {
    const [inquiry, setInquiry] = useState([]);
    const [filteredInquiries, setFilteredInquiries] = useState([]);
    const [selectedInquiry, setSelectedInquiry] = useState(null);

    // Modal modes: null | "response" | "reject" | "view"
    const [modalMode, setModalMode] = useState(null);
    const [formData, setFormData] = useState({ message: "" });
    const [loading, setLoading] = useState(false);

    // Dropdown
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState("All Inquiries");
    const dropdownRef = useRef(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const inquiriesPerPage = 10;

    const options = ["All Inquiries", "Vendor", "Company", "Open", "Closed", "Rejected"];

    /* ── Fetch ── */
    const getAllInquiry = async () => {
        try {
            const res = await API.get("/getAllInquiry");
            setInquiry(res.data.inquiry);
            setFilteredInquiries(res.data.inquiry);
        } catch (error) {
            console.error("Error fetching inquiries", error);
        }
    };

    const handleChange = (e) =>
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    /* ── Filter ── */
    const handleFilter = (option) => {
        setSelected(option);
        setOpen(false);
        setCurrentPage(1);

        if (option === "All Inquiries") {
            setFilteredInquiries(inquiry);
            return;
        }

        const map = {
            Vendor: (i) => i.userType?.toLowerCase() === "vendor",
            Company: (i) => i.userType?.toLowerCase() === "company",
            Open: (i) => i.inquiryStatus === "open",
            Closed: (i) => i.inquiryStatus === "close",
            Rejected: (i) => i.inquiryStatus === "rejected",
        };

        setFilteredInquiries(inquiry.filter(map[option] ?? (() => true)));
    };

    /* ── Open modal ── */
    const openModal = (data, mode) => {
        setSelectedInquiry(data);
        setFormData({ message: "" });
        setModalMode(mode);
    };

    const closeModal = () => {
        setModalMode(null);
        setSelectedInquiry(null);
        setFormData({ message: "" });
    };

    /* ── Send Response Only ── */
    const handleSend = async () => {
        if (!formData.message.trim()) {
            Swal.fire({ icon: "warning", title: "Message required", text: "Please type a response.", timer: 2000, showConfirmButton: false });
            return;
        }
        setLoading(true);
        try {
            await API.post("/sendResponse", {
                inquiryId: selectedInquiry._id,
                message: formData.message,
            });
            Swal.fire({ icon: "success", title: "Response Sent!", timer: 2000, showConfirmButton: false });
            closeModal();
            getAllInquiry();
        } catch (error) {
            const msg = error?.response?.data?.message || "Failed to send response.";
            Swal.fire({ icon: "error", title: "Error", text: msg });
        } finally {
            setLoading(false);
        }
    };

    /* ── Send Response + Register ── */
    const handleSendNReg = async () => {
        if (!formData.message.trim()) {
            Swal.fire({ icon: "warning", title: "Message required", text: "Please type a response.", timer: 2000, showConfirmButton: false });
            return;
        }
        setLoading(true);
        try {
            await API.post("/sendResponseAndRegister", {
                inquiryId: selectedInquiry._id,
                message: formData.message,
            });
            Swal.fire({ icon: "success", title: "Approved & Registered!", text: "Account created and welcome email sent.", timer: 2500, showConfirmButton: false });
            closeModal();
            getAllInquiry();
        } catch (error) {
            const msg = error?.response?.data?.message || "Failed to approve.";
            Swal.fire({ icon: "error", title: "Error", text: msg });
        } finally {
            setLoading(false);
        }
    };

    /* ── Reject Inquiry ── */
    const handleReject = async () => {
        if (!formData.message.trim()) {
            Swal.fire({ icon: "warning", title: "Reason required", text: "Please provide a rejection reason.", timer: 2000, showConfirmButton: false });
            return;
        }
        setLoading(true);
        try {
            await API.post("/inquiry/reject", {
                inquiryId: selectedInquiry._id,
                reason: formData.message,
            });
            Swal.fire({ icon: "success", title: "Inquiry Rejected", text: "Applicant has been notified.", timer: 2000, showConfirmButton: false });
            closeModal();
            getAllInquiry();
        } catch (error) {
            const msg = error?.response?.data?.message || "Failed to reject inquiry.";
            Swal.fire({ icon: "error", title: "Error", text: msg });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { getAllInquiry(); }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* ── Pagination ── */
    const indexOfLast = currentPage * inquiriesPerPage;
    const indexOfFirst = indexOfLast - inquiriesPerPage;
    const currentInquiries = filteredInquiries.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredInquiries.length / inquiriesPerPage);

    /* ── Row action buttons ── */
    const isActionable = (status) => status === "open";

    /* ── View detail row helper ── */
    const DetailRow = ({ label, value }) =>
        value ? (
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2 border-b border-gray-100 last:border-0">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-36 shrink-0">{label}</span>
                <span className="text-sm text-gray-800 break-words">{value}</span>
            </div>
        ) : null;

    return (
        <div className="max-w-6xl mx-auto p-6 mt-10 mb-10 bg-white shadow-md rounded-lg">

            {/* ── Toolbar ── */}
            <div className="flex items-center justify-between mt-4 relative z-20">
                <div className="relative w-60" ref={dropdownRef}>
                    <button
                        onClick={() => setOpen(!open)}
                        className="flex w-full items-center justify-between rounded-lg border border-red-600 bg-white px-3 py-2 text-sm text-black hover:cursor-pointer"
                    >
                        <span className="truncate">{selected}</span>
                        <svg
                            className={`h-4 w-4 text-[#f00000] transition-transform ${open ? "rotate-180" : ""}`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {open && (
                        <div className="absolute z-50 mt-1 w-full rounded-lg border border-red-600 bg-white shadow-lg" style={{ top: "110%" }}>
                            <ul className="max-h-48 overflow-auto rounded-lg">
                                {options.map((option) => (
                                    <li
                                        key={option}
                                        onClick={() => handleFilter(option)}
                                        className={`cursor-pointer px-3 py-2 text-sm hover:bg-red-100 hover:text-[#f00000] ${selected === option ? "text-[#f00000] font-semibold" : "text-black"
                                            }`}
                                    >
                                        {option}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <h2 className="text-lg font-semibold text-[#f00000]">
                    Total: {filteredInquiries.length}
                </h2>
            </div>

            {/* ── Table ── */}
            <div className="overflow-auto max-h-[60vh] border mt-6 rounded">
                <table className="w-full border-collapse">
                    <thead className="bg-black text-white sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-2 text-sm">Inquiry No.</th>
                            <th className="px-4 py-2 text-sm">Type</th>
                            <th className="px-4 py-2 text-sm">Name</th>
                            <th className="px-4 py-2 text-sm">Email</th>
                            <th className="px-4 py-2 text-sm">Business / Reg No.</th>
                            <th className="px-4 py-2 text-sm">Status</th>
                            <th className="px-4 py-2 text-sm">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentInquiries.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-10 text-gray-500 text-sm">
                                    No inquiries found.
                                </td>
                            </tr>
                        ) : (
                            currentInquiries.map((data, index) => (
                                <tr
                                    key={index}
                                    className={`text-sm ${data.inquiryStatus === "rejected"
                                        ? "bg-red-50"
                                        : data.inquiryStatus === "close"
                                            ? "bg-gray-50"
                                            : "bg-white hover:bg-red-50"
                                        } transition-colors`}
                                >
                                    <td className="border px-4 py-2 font-mono text-xs">{data.inquiryNumber}</td>
                                    <td className="border px-4 py-2 capitalize">{data.userType}</td>
                                    <td className="border px-4 py-2">{data.name}</td>
                                    <td className="border px-4 py-2 break-words text-xs">{data.email}</td>
                                    <td className="border px-4 py-2 text-xs">
                                        {data.userType === "company" ? data.registrationNumber : data.businessNumber}
                                    </td>
                                    <td className="border px-4 py-2">
                                        <StatusBadge status={data.inquiryStatus} />
                                    </td>
                                    <td className="border px-4 py-2">
                                        <div className="flex gap-2 flex-wrap">
                                            {/* ── View button — always visible ── */}
                                            <button
                                                onClick={() => openModal(data, "view")}
                                                className="bg-blue-600 hover:bg-blue-800 text-white text-xs px-3 py-1.5 rounded transition cursor-pointer whitespace-nowrap"
                                            >
                                                View
                                            </button>

                                            {isActionable(data.inquiryStatus) && (
                                                <>
                                                    <button
                                                        onClick={() => openModal(data, "response")}
                                                        className="bg-[#f00000] hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded transition cursor-pointer whitespace-nowrap"
                                                    >
                                                        Respond
                                                    </button>
                                                    <button
                                                        onClick={() => openModal(data, "reject")}
                                                        className="bg-gray-700 hover:bg-gray-900 text-white text-xs px-3 py-1.5 rounded transition cursor-pointer"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-3 py-1 border rounded text-sm hover:cursor-pointer ${currentPage === i + 1 ? "bg-[#f00000] text-white" : "bg-white hover:bg-red-100"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* ── View Modal ── */}
            {modalMode === "view" && selectedInquiry && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative mx-4 max-h-[90vh] overflow-y-auto">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">Inquiry Details</h2>
                                <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedInquiry.inquiryNumber}</p>
                            </div>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2 mb-4">
                            <StatusBadge status={selectedInquiry.inquiryStatus} />
                            <span className="text-xs text-gray-400 capitalize">{selectedInquiry.userType}</span>
                        </div>

                        {/* Details */}
                        <div className="bg-gray-50 rounded-lg px-4 py-1 mb-4">
                            <DetailRow label="Name" value={selectedInquiry.name} />
                            <DetailRow label="Email" value={selectedInquiry.email} />
                            <DetailRow label="Phone" value={selectedInquiry.phone} />
                            <DetailRow label="User Type" value={selectedInquiry.userType} />
                            <DetailRow
                                label={selectedInquiry.userType === "company" ? "Reg. Number" : "Business No."}
                                value={selectedInquiry.userType === "company" ? selectedInquiry.registrationNumber : selectedInquiry.businessNumber}
                            />
                            <DetailRow label="Company / Org" value={selectedInquiry.companyName || selectedInquiry.organizationName} />
                            <DetailRow label="Address" value={selectedInquiry.address} />
                            <DetailRow label="City" value={selectedInquiry.city} />
                            <DetailRow label="Country" value={selectedInquiry.country} />
                            <DetailRow label="Message" value={selectedInquiry.message} />
                            <DetailRow label="Submitted On" value={selectedInquiry.createdAt ? new Date(selectedInquiry.createdAt).toLocaleString() : null} />
                        </div>

                        {/* Footer actions */}
                        <div className="flex gap-2 mt-2">
                            {isActionable(selectedInquiry.inquiryStatus) && (
                                <>
                                    <button
                                        onClick={() => { setModalMode("response"); setFormData({ message: "" }); }}
                                        className="flex-1 px-4 py-2.5 bg-[#f00000] hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition cursor-pointer"
                                    >
                                        Respond
                                    </button>
                                    <button
                                        onClick={() => { setModalMode("reject"); setFormData({ message: "" }); }}
                                        className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            <button
                                onClick={closeModal}
                                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Response Modal ── */}
            {modalMode === "response" && selectedInquiry && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative mx-4">

                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-[#f00000]">
                                Respond to {selectedInquiry.name}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
                        </div>

                        <p className="text-xs text-gray-500 mb-3">
                            Ref: <span className="font-mono font-semibold">{selectedInquiry.inquiryNumber}</span>
                            {" · "}{selectedInquiry.email}
                        </p>

                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Type your response..."
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        />

                        <div className="flex gap-2 mt-4">
                            <button
                                type="button"
                                onClick={handleSend}
                                className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                            >
                                Send Only
                            </button>
                            <button
                                type="button"
                                onClick={handleSendNReg}
                                className="flex-1 px-4 py-2.5 bg-[#f00000] hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition cursor-pointer"
                            >
                                Approve & Register
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={closeModal}
                            className="w-full mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition cursor-pointer"
                        >
                            Cancel
                        </button>

                        {loading && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
                                <div className="w-10 h-10 border-4 border-[#f00000] border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Reject Modal ── */}
            {modalMode === "reject" && selectedInquiry && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative mx-4">

                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Reject Application
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-gray-700">
                            <p><span className="font-semibold">Applicant:</span> {selectedInquiry.name}</p>
                            <p><span className="font-semibold">Ref:</span> <span className="font-mono">{selectedInquiry.inquiryNumber}</span></p>
                            <p><span className="font-semibold">Type:</span> {selectedInquiry.userType}</p>
                        </div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rejection Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Explain why the application is being rejected (this will be emailed to the applicant)..."
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        />

                        <div className="flex gap-2 mt-4">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleReject}
                                className="flex-1 px-4 py-2.5 bg-red-700 hover:bg-red-900 text-white rounded-lg text-sm font-semibold transition cursor-pointer"
                            >
                                Confirm Reject
                            </button>
                        </div>

                        {loading && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
                                <div className="w-10 h-10 border-4 border-red-700 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inquiry;