import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";
import Swal from "sweetalert2";
import API from "../../API/Api";

const CouponCode = () => {
  const [couponData, setCouponData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    applicableFor: "",
    coupon: "",
    discountType: "percentage",
    discountValue: "",
    minPurchase: "",
    startDate: "",
    expiryDate: "",
    isActive: true,
  });
  const [editId, setEditId] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const couponsPerPage = 10;

  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      const res = await API.get("/getCouponCode");
      if (res.data.success) {
        setCouponData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Submit add / update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await API.put(`/updateCouponCode/${editId}`, formData);
        Swal.fire("Updated!", "Coupon updated successfully", "success");
      } else {
        await API.post("/addCouponCode", formData);
        Swal.fire("Added!", "Coupon added successfully", "success");
      }

      setShowModal(false);
      setFormData({
        applicableFor: "",
        coupon: "",
        discountType: "percentage",
        discountValue: "",
        minPurchase: "",
        startDate: "",
        expiryDate: "",
        isActive: true,
      });
      setEditId(null);
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete coupon
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to undo this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/deleteCouponCode/${id}`);
          fetchCoupons();
          Swal.fire("Deleted!", "Coupon deleted successfully!", "success");
        } catch (error) {
          console.error(error);
          Swal.fire("Error!", "Something went wrong while deleting.", "error");
        }
      }
    });
  };

  // Edit coupon
  const handleUpdateClick = (coupon) => {
    setFormData(coupon);
    setEditId(coupon._id);
    setShowModal(true);
  };

  // Pagination logic
  const totalPages = Math.ceil(couponData.length / couponsPerPage);
  const indexOfLast = currentPage * couponsPerPage;
  const indexOfFirst = indexOfLast - couponsPerPage;
  const currentCoupons = couponData.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2 sm:gap-0">
        <h1 className="text-2xl font-bold">Coupon Codes</h1>
        <button
          onClick={() => {
            setShowModal(true);
            setEditId(null);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:cursor-pointer"
        >
          Add Coupon
        </button>
      </div>

      {/* Table */}
      <div className="overflow-auto border rounded max-h-[70vh]">
        <table className="w-full border-collapse min-w-[600px]">
          {/* Table Head */}
          <thead className="bg-black text-white sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2">S.NO</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Code</th>
              <th className="px-4 py-2">Discount</th>
              <th className="px-4 py-2">Min Purchase</th>
              <th className="px-4 py-2">Validity</th>
              <th className="px-4 py-2 text-center">Action</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {currentCoupons.map((c, i) => (
              <tr key={c._id} className="border-b">
                <td className="border px-4 py-2 text-center">{indexOfFirst + i + 1}</td>
                <td className="border px-4 py-2">{c.applicableFor}</td>
                <td className="border px-4 py-2">{c.coupon}</td>
                <td className="border px-4 py-2">
                  {c.discountType === "percentage"
                    ? `${c.discountValue}%`
                    : `$${c.discountValue}`}
                </td>
                <td className="border px-4 py-2">${c.minPurchase}</td>
                <td className="border px-4 py-2">
                  {new Date(c.startDate).toLocaleDateString()} -{" "}
                  {new Date(c.expiryDate).toLocaleDateString()}
                </td>
                <td className="border px-4 py-2 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleUpdateClick(c)}
                      className="bg-blue-500 px-3 py-1 rounded text-white flex items-center gap-1 whitespace-nowrap hover:cursor-pointer"
                    >
                      <RiEdit2Fill /> <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="bg-red-500 px-3 py-1 rounded text-white flex items-center gap-1 whitespace-nowrap hover:cursor-pointer"
                    >
                      <MdDelete /> <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* Pagination Buttons */}
      <div className="flex justify-center mt-4 space-x-2">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`px-3 py-1 border rounded hover:cursor-pointer ${currentPage === i + 1 ? "bg-blue-500 text-white" : ""
              }`}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center backdrop-blur-sm bg-black/50 overflow-auto p-4">
          <div className="bg-white p-6 rounded-lg w-full sm:max-w-md shadow-xl relative">
            <h2 className="text-xl font-bold mb-4">
              {editId ? "Edit Coupon" : "Add Coupon"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="applicableFor"
                value={formData.applicableFor}
                onChange={handleChange}
                placeholder="Coupon Name"
                className="border p-2 w-full rounded"
              />
              <input
                type="text"
                name="coupon"
                value={formData.coupon}
                onChange={handleChange}
                placeholder="Coupon Code"
                className="border p-2 w-full rounded"
              />
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              >
                <option value="percentage">Percentage</option>
                <option value="flat">Flat</option>
              </select>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                placeholder="Discount Value"
                className="border p-2 w-full rounded"
              />
              <input
                type="number"
                name="minPurchase"
                value={formData.minPurchase}
                onChange={handleChange}
                placeholder="Min Purchase Amount"
                className="border p-2 w-full rounded"
              />
              <label className="block text-gray-700">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate?.split("T")[0] || ""}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
              <label className="block text-gray-700">Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate?.split("T")[0] || ""}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />{" "}
                Active
              </label>
              <div className="flex flex-col sm:flex-row justify-between mt-4 gap-2 sm:gap-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded w-full sm:w-auto hover:cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded w-full sm:w-auto hover:cursor-pointer"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponCode;
