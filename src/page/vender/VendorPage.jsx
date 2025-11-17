import React, { useEffect, useState } from "react";
import API from "../../API/Api";
import { useNavigate } from "react-router-dom";

const VendorPage = () => {
  const [vendors, setVendors] = useState([]);
  const navigate = useNavigate();

  const getAllVendors = async () => {
    try {
      const res = await API.get("/allvendor");
      setVendors(res.data);
    } catch (err) {
      console.error("Error fetching vendors:", err);
    }
  };

  useEffect(() => {
    getAllVendors();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Vendor Details</h2>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full border-collapse">
          <thead className="bg-black text-white">
            <tr>
              <th className="px-4 py-3 border-b text-left font-semibold">#</th>
              <th className="px-4 py-3 border-b text-left font-semibold">Company Name</th>
              <th className="px-4 py-3 border-b text-left font-semibold">Contact Name</th>
              <th className="px-4 py-3 border-b text-left font-semibold">Email</th>
              <th className="px-4 py-3 border-b text-left font-semibold">Phone</th>
              <th className="px-4 py-3 border-b text-left font-semibold">Vendor Type</th>
              <th className="px-4 py-3 border-b text-center font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {vendors.length > 0 ? (
              vendors.map((vendor, index) => (
                <tr key={index} className="hover:bg-gray-50 transition duration-200">
                  <td className="px-4 py-3 border-b">{index + 1}</td>
                  <td className="px-4 py-3 border-b">{vendor.companyName}</td>
                  <td className="px-4 py-3 border-b">{vendor.contactName}</td>
                  <td className="px-4 py-3 border-b">{vendor.contactEmail}</td>
                  <td className="px-4 py-3 border-b">{vendor.contactPhone}</td>
                  <td className="px-4 py-3 border-b">{vendor.vendorType}</td>
                  <td className="px-4 py-3 border-b text-center">
                    <button
                      onClick={() => navigate(`${vendor._id}`, { state: { vendor } })}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-gray-500 py-4 border-b">
                  No vendor data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorPage;
