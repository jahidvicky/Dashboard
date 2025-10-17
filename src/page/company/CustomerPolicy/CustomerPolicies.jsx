import React, { useEffect, useState } from "react";
import API from "../../../API/Api";
import { Search } from "lucide-react";

const CustomerPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [filteredPolicies, setFilteredPolicies] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [policyPerPage] = useState(10);

  const companyData = JSON.parse(localStorage.getItem("user"));
  const companyId = companyData?._id;

  const fetchPolicies = async () => {
    try {
      const res = await API.get(`/companyPolicies/${companyId}`);
      const data = res.data.policies || [];

      // Add expiry check
      const updatedPolicies = data.map((item) => {
        const today = new Date();
        const expiryDate = item.expiryDate
          ? new Date(item.expiryDate)
          : new Date(
            new Date(item.createdAt).getTime() +
            (item.durationDays || 0) * 24 * 60 * 60 * 1000
          );

        // Auto mark as expired if date passed
        const isExpired = expiryDate < today;
        return {
          ...item,
          status: isExpired ? "Expired" : item.status,
        };
      });

      setPolicies(updatedPolicies);
      setFilteredPolicies(updatedPolicies);
    } catch (error) {
      console.error("Error fetching policies:", error);
    }
  };

  useEffect(() => {
    if (companyId) fetchPolicies();
  }, [companyId]);

  // Filter + Search
  useEffect(() => {
    let filtered = [...policies];

    if (search.trim() !== "") {
      filtered = filtered.filter((item) =>
        item.policyName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((item) => {
        const status = item?.status?.toLowerCase();
        if (statusFilter.toLowerCase() === "inactive") {
          return status === "inactive" || status === "expired";
        }
        return status === statusFilter.toLowerCase();
      });
    }

    setFilteredPolicies(filtered);
    setCurrentPage(1); // reset to first page when filters change
  }, [search, statusFilter, policies]);

  // Pagination Logic
  const indexOfLastPage = currentPage * policyPerPage;
  const indexOfFirstPage = indexOfLastPage - policyPerPage;
  const currentPolicies = filteredPolicies.slice(
    indexOfFirstPage,
    indexOfLastPage
  );
  const totalPages = Math.ceil(filteredPolicies.length / policyPerPage);
  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-red-600">
        Customer Policies
      </h1>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by policy name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-black rounded-lg px-4 py-2 w-52 md:w-64 text-sm md:text-base truncate focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="All">All Policies</option>
            <option value="Active">Active Policies</option>
            <option value="Inactive">Inactive / Expired Policies</option>
          </select>
        </div>
      </div>

      {/* Policies Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg max-h-[500px]">
        <table className="min-w-full table-auto">
          <thead className="bg-black text-white sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left">Policy Name</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Customer Email</th>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Coverage</th>
              <th className="px-4 py-3 text-left">Duration (Days)</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="max-h-[500px] overflow-y-auto">
            {currentPolicies.length > 0 ? (
              currentPolicies.map((item, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">{item?.policyName || "-"}</td>
                  <td className="px-4 py-3">${item?.policyPrice || "-"}</td>
                  <td className="px-4 py-3">{item?.customer?.email || "-"}</td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    {item?.product?.image?.includes("http") ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-10 h-8 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded text-sm font-medium">
                        {item?.product?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                    <span>{item?.product?.name || "-"}</span>
                  </td>
                  <td className="px-4 py-3">{item?.coverage || "-"}</td>
                  <td className="px-4 py-3">{item?.durationDays || "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${item?.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : item?.status === "Expired"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {item?.status || "-"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-6 text-gray-500 font-medium"
                >
                  No policies found
                </td>
              </tr>
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
  );
};

export default CustomerPolicies;
