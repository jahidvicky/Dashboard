import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import API, { IMAGE_URL } from "../../API/Api";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";

const Category = () => {
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    categoryName: "",
    subCategoryNames: "",
    categoryImage: null,
    oldImage: "", // 🔥 required for backend
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await API.get("/getcategories");
      setCategories(res.data.categories);
    } catch {
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle input
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "categoryImage") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        categoryImage: file,
      }));

      setPreviewImage(URL.createObjectURL(file));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add Category Modal
  const openAddModal = () => {
    setFormData({
      categoryName: "",
      subCategoryNames: "",
      categoryImage: null,
      oldImage: "",
    });

    setPreviewImage(null);
    setEditId(null);
    setModalType("add");
    setShowModal(true);
  };

  // Edit Category Modal
  const openEditModal = (cat) => {
    setFormData({
      categoryName: cat.categoryName,
      subCategoryNames: cat.subCategoryNames?.join(", ") || "",
      categoryImage: null, // no new image yet
      oldImage: cat.categoryImage || "", // 🔥 important
    });

    setPreviewImage(
      cat.categoryImage ? `${IMAGE_URL}/${cat.categoryImage}` : null
    );

    setEditId(cat._id);
    setModalType("edit");
    setShowModal(true);
  };

  // Remove old image (when clicking X)
  const removeOldImage = () => {
    setFormData((prev) => ({ ...prev, oldImage: "" })); // backend will delete it
    setPreviewImage(null);
    setFormData((prev) => ({ ...prev, categoryImage: null }));
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await API.delete(`/deletecategory/${id}`);
      toast.success("Category deleted");
      fetchCategories();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append("categoryName", formData.categoryName);
    payload.append("oldImage", formData.oldImage); // 🔥 required

    // Subcategories
    const subs = formData.subCategoryNames
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    subs.forEach((sub) => payload.append("subCategoryNames", sub));

    // New image (OPTIONAL)
    if (formData.categoryImage) {
      payload.append("categoryImage", formData.categoryImage);
    }

    try {
      if (modalType === "add") {
        await API.post("/addcategory", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Category added");
      } else {
        await API.put(`/updatecategory/${editId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Category updated");
      }

      setShowModal(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-semibold">Manage Categories</h2>

        <button
          onClick={openAddModal}
          className="bg-green-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
        >
          <FaPlus /> Add Category
        </button>
      </div>

      {/* CATEGORY TABLE */}
      <div className="overflow-auto max-h-[70vh] border rounded-lg shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead className="bg-black text-white sticky top-0">
            <tr>
              <th className="px-6 py-3">Image</th>
              <th className="px-6 py-3">Category Name</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id} className="border-b hover:bg-gray-50">

                {/* IMAGE */}
                <td className="px-6 py-3">
                  {cat.categoryImage ? (
                    <img
                      src={`${IMAGE_URL}/${cat.categoryImage}`}
                      alt="Category"
                      className="w-30 h-16 rounded object-cover border"
                    />
                  ) : (
                    <span>—</span>
                  )}
                </td>

                {/* NAME */}
                <td className="px-6 py-3 font-medium capitalize">
                  {cat.categoryName}
                </td>

                {/* ACTIONS */}
                <td className="px-6 py-3 flex items-center justify-center gap-3">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-blue-700"
                  >
                    <FaEdit /> Edit
                  </button>

                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-red-700"
                  >
                    <FaTrash /> Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg relative">

            <h3 className="text-xl font-semibold mb-4">
              {modalType === "add" ? "Add Category" : "Edit Category"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* NAME */}
              <div>
                <label className="font-medium">Category Name</label>
                <input
                  type="text"
                  name="categoryName"
                  className="w-full mt-2 border border-gray-300 p-2 rounded-md"
                  value={formData.categoryName}
                  onChange={handleChange}
                />
              </div>

              {/* IMAGE */}
              <div>
                <label className="font-medium block mb-2">Category Image</label>

                {/* OLD IMAGE PREVIEW */}
                {previewImage && !formData.categoryImage && formData.oldImage && (
                  <div className="relative inline-block mb-3">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-28 h-28 object-cover rounded border"
                    />

                    {/* REMOVE OLD IMAGE */}
                    <button
                      type="button"
                      onClick={removeOldImage}
                      className="absolute top-0 right-0 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* NEW IMAGE PREVIEW */}
                {formData.categoryImage && (
                  <div className="relative inline-block mb-3">
                    <img
                      src={URL.createObjectURL(formData.categoryImage)}
                      alt="New Preview"
                      className="w-28 h-28 object-cover rounded border"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, categoryImage: null }))
                      }
                      className="absolute top-0 right-0 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* FILE INPUT */}
                <input
                  type="file"
                  name="categoryImage"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              </div>

              <button className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700">
                {modalType === "add" ? "Save Category" : "Update Category"}
              </button>
            </form>

            {/* CLOSE */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-3xl text-gray-600 hover:text-red-600"
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
