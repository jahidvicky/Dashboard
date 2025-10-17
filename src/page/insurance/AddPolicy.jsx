import React, { useEffect, useState } from "react";
import API from "../../API/Api";
import Swal from "sweetalert2";

export default function PolicyManagement() {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [formMode, setFormMode] = useState("add"); // "add" | "edit"
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({
        name: "",
        coverage: "",
        price: "",
        durationDays: "",
    });
    const [coverageViewer, setCoverageViewer] = useState({
        open: false,
        text: "",
        title: "",
    });
    const [query, setQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [policyPerPage] = useState(10);

    // Fetch policies
    useEffect(() => {
        loadPolicies();
    }, []);

    const loadPolicies = async () => {
        try {
            setFetching(true);
            const res = await API.get("/getPolicies");
            setPolicies(res.data?.data || []);
        } catch (err) {
            console.error("Failed to fetch policies", err);
            Swal.fire({
                icon: "error",
                title: "Load Failed",
                text: err?.response?.data?.message || "Failed to load policies. Please try again.",
                confirmButtonColor: "#d33",
            });
        } finally {
            setFetching(false);
        }
    };

    // Handle form input
    const handleChange = (e) => {
        setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    };

    // Open add modal
    const openAdd = () => {
        setForm({ name: "", coverage: "", price: "", durationDays: "" });
        setFormMode("add");
        setEditId(null);
        setShowFormModal(true);
    };

    // Open edit modal
    const openEdit = (policy) => {
        setForm({
            name: policy.name || "",
            coverage: policy.coverage || "",
            price: policy.price ?? "",
            durationDays: policy.durationDays ?? "",
        });
        setFormMode("edit");
        setEditId(policy._id);
        setShowFormModal(true);
    };

    // Submit add or update
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const companyId = user?._id;
            const companyName = user?.name;

            if (!companyId || !companyName) {
                Swal.fire({
                    icon: "error",
                    title: "Company Details Missing",
                    text: "Please log in before adding a policy.",
                    confirmButtonColor: "#d33",
                });
                setLoading(false);
                return;
            }
            const payload = {
                ...form,
                price: Number(form.price),
                durationDays: Number(form.durationDays),
                companyId,
                companyName,
            };

            if (formMode === "add") {
                await API.post("/addPolicies", payload);
            } else {
                await API.put(`/updatePolicy/${editId}`, payload);
            }
            setShowFormModal(false);
            await loadPolicies();
        } catch (err) {
            console.error("Save failed", err);
            Swal.fire({
                icon: "error",
                title: "Save Failed",
                text: err?.response?.data?.message || "Failed to save policy. Please try again.",
                confirmButtonColor: "#d33",
            });
        } finally {
            setLoading(false);
        }
    };

    // Delete policy
    const handleDelete = async (id) => {
        const ok = window.confirm("Are you sure you want to delete this policy?");
        if (!ok) return;

        try {
            setLoading(true);
            await API.delete(`/deletePolicy/${id}`);
            await loadPolicies();
        } catch (err) {
            console.error("Delete failed", err);
            Swal.fire({
                icon: "error",
                title: "Delete Failed",
                text: err?.response?.data?.message || "Failed to delete policy. Please try again.",
                confirmButtonColor: "#d33",
            });
        } finally {
            setLoading(false);
        }
    };

    // View coverage modal
    const viewCoverage = (policy) => {
        setCoverageViewer({ open: true, text: policy.coverage || "", title: policy.name || "Coverage" });
    };

    // Filtered + Pagination
    const filtered = policies.filter((p) =>
        p.name?.toLowerCase().includes(query.trim().toLowerCase())
    );
    const totalPages = Math.ceil(filtered.length / policyPerPage);
    const indexOfLastPolicy = currentPage * policyPerPage;
    const indexOfFirstPolicy = indexOfLastPolicy - policyPerPage;
    const currentPolicies = filtered.slice(indexOfFirstPolicy, indexOfLastPolicy);

    const handlePageChange = (page) => setCurrentPage(page);

    // Truncate utility
    const truncate = (text, n = 80) =>
        !text ? "" : text.length > n ? text.slice(0, n).trim() + "…" : text;

    return (
        <div className="p-3 max-w-10xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Insurance Policies</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-64">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                            placeholder="Search by policy name"
                            className="w-full px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <button
                        onClick={openAdd}
                        className="px-4 py-2 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition-shadow shadow-sm hover:cursor-pointer"
                    >
                        Add Policy
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-[600px]">
                    <table className="min-w-full divide-y divide-gray-100 text-md">
                        <thead className="bg-black sticky top-0 z-10">
                            <tr>
                                <th className="text-left px-6 py-3 font-semibold text-white uppercase">Policy Name</th>
                                <th className="text-left px-6 py-3 font-semibold text-white uppercase">Coverage</th>
                                <th className="text-left px-6 py-3 font-semibold text-white uppercase">Price</th>
                                <th className="text-left px-6 py-3 font-semibold text-white uppercase">Duration (days)</th>
                                <th className="text-center px-6 py-3 font-semibold text-white uppercase">Company</th>
                                <th className="text-center px-6 py-3 font-semibold text-white uppercase">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-100">
                            {fetching ? (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-gray-500">Loading policies...</td>
                                </tr>
                            ) : currentPolicies.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-gray-500">No policies found</td>
                                </tr>
                            ) : (
                                currentPolicies.map((p) => (
                                    <tr key={p._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                                        <td className="px-6 py-4 text-gray-700">
                                            <div className="flex items-start gap-3">
                                                <div className="text-sm text-gray-700">{truncate(p.coverage, 80)}</div>
                                                {p.coverage && p.coverage.length > 80 && (
                                                    <button
                                                        onClick={() => viewCoverage(p)}
                                                        className="text-sm underline ml-1 text-red-600 hover:text-red-700 hover:cursor-pointer"
                                                    >
                                                        View
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">${p.price}</td>
                                        <td className="px-6 py-4 text-gray-900">{p.durationDays}</td>
                                        <td className="px-6 py-4 text-gray-700">{p.companyName}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex items-center gap-2">
                                                <button
                                                    onClick={() => openEdit(p)}
                                                    className="px-3 py-1.5 rounded-md border border-gray-200 text-sm text-white font-medium bg-blue-600 hover:bg-blue-700 hover:cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p._id)}
                                                    className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 hover:cursor-pointer"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
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
            </div>

            {/* Form Modal */}
            {showFormModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {formMode === "add" ? "Add Policy" : "Edit Policy"}
                            </h2>
                            <button
                                onClick={() => setShowFormModal(false)}
                                className="text-sm text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                            >
                                Close
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">Policy Name</label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-700 mb-1">Coverage Description</label>
                                <textarea
                                    name="coverage"
                                    value={form.coverage}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Price</label>
                                    <input
                                        name="price"
                                        type="number"
                                        value={form.price}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Duration (days)</label>
                                    <input
                                        name="durationDays"
                                        type="number"
                                        value={form.durationDays}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowFormModal(false)}
                                    className="px-4 py-2 rounded-md border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 hover:cursor-pointer"
                                >
                                    {loading ? "Saving..." : formMode === "add" ? "Add Policy" : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Coverage Viewer Modal */}
            {coverageViewer.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden">
                        <div className="px-6 py-4 border-b flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">{coverageViewer.title}</h3>
                            <button
                                onClick={() => setCoverageViewer({ open: false, text: "", title: "" })}
                                className="text-sm text-gray-600 hover:text-gray-800 hover:cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                        <div className="px-6 py-6">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{coverageViewer.text}</p>
                        </div>
                        <div className="px-6 py-4 border-t flex justify-end">
                            <button
                                onClick={() => setCoverageViewer({ open: false, text: "", title: "" })}
                                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 hover:cursor-pointer"
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
