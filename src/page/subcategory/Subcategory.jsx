import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import API, { IMAGE_URL } from "../../API/Api";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";

const Subcategory = () => {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    categoryName: "",
    subCategoryName: "",
    description: "",
    oldImage: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // =============================
  // Fetch Categories
  // =============================
  const fetchCategories = async () => {
    try {
      const res = await API.get("/getcategories");
      setCategories(res.data.categories || []);
    } catch {
      Swal.fire("Error", "Failed to fetch categories", "error");
    }
  };

  // =============================
  // Fetch Subcategories
  // =============================
  const fetchSubcategories = async () => {
    try {
      const res = await API.get("/getallsubcategory");
      setSubcategories(res.data.subcategories || []);
    } catch {
      Swal.fire("Error", "Failed to fetch subcategories", "error");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  // =============================
  // Open Add Modal
  // =============================
  const openAddModal = () => {
    setFormData({
      categoryName: "",
      subCategoryName: "",
      description: "",
      oldImage: "",
    });
    setImage(null);
    setEditId(null);
    setOpen(true);
  };

  // =============================
  // Open Edit Modal
  // =============================
  const openEditModal = (data) => {
    setFormData({
      categoryName: data.category?.categoryName || "",
      subCategoryName: data.name || "",
      description: data.description || "",
      oldImage: data.image || "",
    });

    setImage(null);
    setEditId(data._id);
    setOpen(true);
  };

  // =============================
  // Delete Subcategory
  // =============================
  // const handleDelete = (id) => {
  //   Swal.fire({
  //     title: "Are you sure?",
  //     text: "This will remove the subcategory permanently.",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#d33",
  //     cancelButtonColor: "#3085d6",
  //     confirmButtonText: "Yes, delete it!",
  //   }).then(async (result) => {
  //     if (result.isConfirmed) {
  //       try {
  //         await API.delete(`/deletesubcategory/${id}`);
  //         Swal.fire("Deleted!", "Subcategory deleted!", "success");
  //         fetchSubcategories();
  //       } catch {
  //         Swal.fire("Error", "Failed to delete", "error");
  //       }
  //     }
  //   });
  // };

  // =============================
  // Submit Form
  // =============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();
      payload.append("categoryName", formData.categoryName);
      payload.append("subCategoryName", formData.subCategoryName);
      payload.append("description", formData.description);
      payload.append("oldImage", formData.oldImage); // important

      if (image) payload.append("image", image);

      if (editId) {
        await API.put(`/updatesubcategory/${editId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Success", "Subcategory updated!", "success");
      } else {
        await API.post("/addsubcategory", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Success", "Subcategory created!", "success");
      }

      fetchSubcategories();
      setOpen(false);
    } catch (err) {
      Swal.fire("Error", "Failed to save subcategory", "error");
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(subcategories.length / itemsPerPage);
  const currentData = subcategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Sub Categories</h2>
        <button
          onClick={openAddModal}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <FaPlus className="inline mr-2" /> Add SubCategory
        </button>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[60vh] border rounded">
        <table className="w-full border-collapse">
          <thead className="bg-black text-white sticky top-0">
            <tr>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Image</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {currentData.map((data, index) => (
              <tr key={index}>
                <td className="border px-4 py-2 capitalize">
                  {data.category?.categoryName}
                </td>

                <td className="border px-4 py-2">{data.name}</td>

                <td className="border px-4 py-2">{data.description}</td>

                <td className="border px-4 py-2 text-center">
                  {data.image && (
                    <img
                      src={`${IMAGE_URL}${data.image}`}
                      alt="subcategory"
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                </td>

                <td className="border px-4 py-2 text-center space-x-2">
                  <button
                    onClick={() => openEditModal(data)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    <FaEdit />
                  </button>

                  {/* <button
                    onClick={() => handleDelete(data._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    <FaTrash />
                  </button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPages }, (_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentPage(idx + 1)}
            className={`px-3 py-1 rounded ${currentPage === idx + 1
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
              }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow p-6 relative max-h-[90vh] overflow-y-auto">

            <h3 className="text-lg font-semibold mb-4">
              {editId ? "Edit SubCategory" : "Add SubCategory"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">

              {/* Category */}
              <div>
                <label className="block font-medium">Category</label>
                <select
                  value={formData.categoryName}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryName: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.categoryName}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {/* SubCategory Name */}
              <div>
                <label className="block font-medium">SubCategory Name</label>
                <input
                  type="text"
                  value={formData.subCategoryName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      subCategoryName: e.target.value,
                    })
                  }
                  className="w-full border p-2 rounded"
                />
              </div>

              {/* Description */}
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description"
                className="w-full border p-2 rounded"
              />

              {/* Image Section */}
              <div>
                <label className="block font-medium mb-1">
                  SubCategory Image
                </label>

                {/* Existing Image */}
                {editId && !image && formData.oldImage && (
                  <div className="relative inline-block mb-2">
                    <img
                      src={`${IMAGE_URL}${formData.oldImage}`}
                      className="w-28 h-28 rounded object-cover"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center"
                      onClick={() =>
                        setFormData({ ...formData, oldImage: "" })
                      }
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* New Image Preview */}
                {image && (
                  <div className="relative inline-block mb-2">
                    <img
                      src={URL.createObjectURL(image)}
                      className="w-28 h-28 rounded object-cover"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center"
                      onClick={() => setImage(null)}
                    >
                      ×
                    </button>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="w-full border p-2 rounded"
                />
              </div>

              <button className="bg-red-600 text-white px-4 py-2 rounded">
                {editId ? "Update SubCategory" : "Save SubCategory"}
              </button>
            </form>

            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 text-4xl text-gray-600 hover:text-red-600"
            >
              <IoIosCloseCircle />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subcategory;
