import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import API from "../../API/Api";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    categoryName: "",
    subCategoryNames: "", // keep as string for textarea
  });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await API.get("/getcategories");
      setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      categoryName: "",
      subCategoryNames: "",
    });
    setModalType("add");
    setEditId(null);
    setShowModal(true);
  };

  // Open Edit Modal
  const openEditModal = (category) => {
    setFormData({
      categoryName: category.categoryName,
      subCategoryNames: category.subCategoryNames?.join(", ") || "",
    });
    setModalType("edit");
    setEditId(category._id);
    setShowModal(true);
  };

  // Delete Category
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await API.delete(`/deletecategory/${id}`);
        toast.success("Category deleted successfully!");
        fetchCategories();
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete category");
      }
    }
  };

  // Submit Add / Edit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        categoryName: formData.categoryName,
        subCategoryNames: formData.subCategoryNames
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (modalType === "add") {
        await API.post("/addcategory", payload);
        toast.success("Category added successfully!");
      } else {
        await API.put(`/updatecategory/${editId}`, payload);
        toast.success("Category updated successfully!");
      }

      setShowModal(false);
      setFormData({ categoryName: "", subCategoryNames: "" });
      setEditId(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Categories</h2>
        <button
          onClick={openAddModal}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 hover:cursor-pointer flex items-center gap-2"
        >
          <FaPlus /> Add Category
        </button>
      </div>

      {/* Category List */}
      <div className="overflow-auto max-h-[60vh] border rounded">
        <table className="w-full border-collapse">
          <thead className="bg-black text-white sticky top-0 z-10">
            <tr className="bg-black text-white">
              <th className="px-4 py-2">Category Name</th>
              <th className="px-4 py-2">Sub Category</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id} className="border">
                <td className="border px-4 py-2">
                  {cat.categoryName}
                </td>
                <td className="border px-4 py-2">
                  {cat.subCategoryNames?.join(", ") || "—"}
                </td>
                <td className="px-4 py-4 space-x-2 flex justify-center">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center hover:cursor-pointer"
                  >
                    <FaEdit />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center hover:cursor-pointer"
                  >
                    <FaTrash />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <h3 className="text-lg font-semibold mb-4">
              {modalType === "add" ? "Add Category" : "Edit Category"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-gray-700">Category Name</label>
                <input
                  type="text"
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:outline-none focus:border-red-500"
                  required
                  placeholder="Enter Category Name"
                />
              </div>

              {/* Sub Category */}
              <div>
                <label className="block text-gray-700">
                  Sub Category Names
                </label>
                <textarea
                  name="subCategoryNames"
                  value={formData.subCategoryNames}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:outline-none focus:border-red-500"
                  rows="2"
                  placeholder="Enter subcategories separated by commas"
                />
              </div>

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 hover:cursor-pointer"
                >
                  {modalType === "add" ? "Save Category" : "Update Category"}
                </button>
              </div>
            </form>

            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-4xl hover:text-red-600 hover:cursor-pointer"
            >
              <IoIosCloseCircle />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
