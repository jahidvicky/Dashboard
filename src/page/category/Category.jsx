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
    oldImage: "",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");

  const fetchCategories = async () => {
    try {
      const res = await API.get("/getcategories");
      setCategories(res.data.categories || []);
    } catch {
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "categoryImage") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, categoryImage: file }));
      setPreviewImage(URL.createObjectURL(file));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const openEditModal = (cat) => {
    setFormData({
      categoryName: cat.categoryName,
      subCategoryNames: cat.subCategoryNames?.join(", ") || "",
      categoryImage: null,
      oldImage: cat.categoryImage || "",
    });

    setPreviewImage(
      cat.categoryImage?.startsWith("http")
        ? cat.categoryImage
        : `${IMAGE_URL}/${cat.categoryImage}`
    );

    setEditId(cat._id);
    setModalType("edit");
    setShowModal(true);
  };

  const removeOldImage = () => {
    setFormData((prev) => ({ ...prev, oldImage: "" }));
    setPreviewImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append("categoryName", formData.categoryName);

    if (!formData.categoryImage && formData.oldImage) {
      payload.append("oldImage", formData.oldImage);
    } else {
      payload.append("oldImage", "");
    }

    const subs = formData.subCategoryNames
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    subs.forEach((sub) => payload.append("subCategoryNames", sub));

    if (formData.categoryImage) {
      payload.append("categoryImage", formData.categoryImage);
    }

    try {
      if (modalType === "add") {
        const res = await API.post("/addcategory", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setCategories((prev) => [...prev, res.data.category]);
        toast.success("Category added");

      } else {
        const res = await API.put(`/updatecategory/${editId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const updated = res.data.category;
        setCategories((prev) =>
          prev.map((cat) => (cat._id === updated._id ? updated : cat))
        );
        toast.success("Updated successfully");
      }

      setShowModal(false);
      setPreviewImage(null);

    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-semibold">Manage Categories</h2>
        <button
          onClick={openAddModal}
          className="bg-green-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
        >
          <FaPlus /> Add Category
        </button>
      </div>

      <div className="overflow-auto max-h-[70vh] border rounded-lg shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead className="bg-black text-white sticky top-0">
            <tr>
              <th className="px-6 py-3">Image</th>
              <th className="px-6 py-3">Category Name</th>
              <th className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((cat) => (
              <tr className="border-b hover:bg-gray-50" key={cat._id}>
                <td className="px-6 py-3">
                  {cat.categoryImage ? (
                    <img
                      src={
                        cat.categoryImage.startsWith("http")
                          ? cat.categoryImage
                          : `${IMAGE_URL}/${cat.categoryImage}`
                      }
                      alt=""
                      className="w-30 h-16 object-cover border rounded"
                    />
                  ) : (
                    <span>No Image</span>
                  )}
                </td>

                <td className="px-6 py-3 capitalize">
                  {cat.categoryName}
                </td>

                <td className="px-6 py-3 flex gap-3 justify-center">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                  >
                    <FaEdit />
                    Edit
                  </button>
                  {/* <button
                    onClick={() => handleDelete(cat._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 flex items-center gap-1"
                  >
                    <FaTrash />
                    Delete
                  </button> */}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
            <h3 className="text-xl font-semibold mb-4">
              {modalType === "add" ? "Add Category" : "Edit Category"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">

              <input
                type="text"
                className="w-full border p-2 rounded"
                name="categoryName"
                value={formData.categoryName}
                onChange={handleChange}
                required
                placeholder="Enter Name"
              />

              {previewImage && (
                <div className="relative mb-2 inline-block">
                  <img
                    src={previewImage}
                    className="w-28 h-28 object-cover border rounded"
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 w-6 h-6 bg-red-600 text-white rounded-full"
                    onClick={removeOldImage}
                  >
                    ×
                  </button>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                name="categoryImage"
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              <button className="bg-red-600 text-white px-4 py-2 rounded-md">
                {modalType === "add" ? "Save" : "Update"}
              </button>

            </form>

            <button
              className="absolute top-2 right-2 text-3xl text-gray-500"
              onClick={() => setShowModal(false)}
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
