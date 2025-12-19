// VendorProduct.jsx

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import API, { IMAGE_URL } from "../../API/Api";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";

//  Fixed category id for Contact Lenses
const CONTACT_LENS_CATEGORY_ID = "6915735feeb23fa59c7d532b";

//  Only these fields vendor can edit after product is Approved
const APPROVED_EDITABLE_FIELDS = [
  "product_price",
  "product_sale_price",
  "stockAvailability",
];

const Products = () => {
  // ---------- STATE: UI ----------
  const [open, setOpen] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState("");

  // ---------- STATE: Data ----------
  const [category, setCategory] = useState([]);
  const [products, setProducts] = useState([]);
  const [contactLensBrands, setContactLensBrands] = useState([]);
  const [glassesBrands, setGlassesBrands] = useState([]);
  const [colorVariants, setColorVariants] = useState([]); // only product_variants images
  const [lensImage1, setLensImage1] = useState(null);
  const [lensImage2, setLensImage2] = useState(null);
  const [lensPacks, setLensPacks] = useState([
    { packSize: "", oldPrice: "", salePrice: "", isBestValue: false },
  ]);

  // ---------- STATE: Filters & Pagination ----------
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSubCategory, setFilterSubCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);

  // ---------- STATE: Brand selection ----------
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedBrandType, setSelectedBrandType] = useState("");

  // ---------- STATE: Form ----------
  const initialFormState = {
    cat_id: "",
    cat_sec: "",
    subCat_id: "",
    subCategoryName: "",
    product_name: "",
    product_size: [],
    product_color: [],
    product_price: "",
    product_sale_price: "",
    product_description: "",
    frame_material: "",
    frame_shape: "",
    face_shape: "",
    frame_color: "",
    frame_fit: "",
    gender: "",
    product_lens_title1: "",
    product_lens_description1: "",
    product_lens_title2: "",
    product_lens_description2: "",
    lens_type: "",
    material: "",
    manufacturer: "",
    water_content: "",
    stockAvailability: "",
    brand_id: "",
    isBestSeller: false,
    isTrending: false,
    // Status flags
    productStatus: "Pending", // "Pending" | "Approved" | "Rejected"
    isResubmitted: false,
    isSentForApproval: false,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [editId, setEditId] = useState(null);

  // Derived flag: vendor is editing an approved product (NOT yet resubmitted)
  const isApprovedEditing =
    !!editId &&
    formData.productStatus === "Approved" &&
    !formData.isResubmitted;

  // ---------- FETCH: Products ----------
  const fetchProducts = async () => {
    try {
      const res = await API.get("/getVendorProduct");
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch vendor products", "error");
    }
  };

  // ---------- FETCH: Categories ----------
  const fetchCategories = async () => {
    try {
      const res = await API.get("/getcategories");
      setCategory(res.data.categories || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------- FETCH: Brands ----------
  const fetchBrands = async () => {
    try {
      const res = await API.get("/getBrand");
      const allBrands = res.data.data || [];
      setContactLensBrands(
        allBrands.filter((b) => b.type === "Contact Lenses")
      );
      setGlassesBrands(allBrands.filter((b) => b.type === "Glasses"));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  // ---------- FILTER + PAGINATION ----------
  const filteredProducts = products.filter((pro) => {
    const matchCategory = filterCategory
      ? pro.cat_id?.toString() === filterCategory
      : true;
    const matchSubCategory = filterSubCategory
      ? pro.subCat_id?.toString() === filterSubCategory
      : true;
    return matchCategory && matchSubCategory;
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const handlePageChange = (page) => setCurrentPage(page);

  // ---------- HANDLE CHANGE (with Approved-field restriction) ----------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // If product is Approved and not yet resubmitted → only allow limited fields
    if (
      isApprovedEditing &&
      !APPROVED_EDITABLE_FIELDS.includes(name)
    ) {
      Swal.fire(
        "Restricted",
        "After approval, only Price, Sale Price & Stock can be edited.",
        "warning"
      );
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ---------- OPEN ADD MODAL ----------
  const openAddModal = () => {
    setFormData(initialFormState);
    setLensImage1(null);
    setLensImage2(null);
    setColorVariants([]);
    setLensPacks([
      { packSize: "", oldPrice: "", salePrice: "", isBestValue: false },
    ]);
    setSelectedBrand("");
    setSelectedBrandType("");
    setEditId(null);
    setOpen(true);
  };

  // ---------- OPEN EDIT MODAL ----------
  const openEditModal = (product) => {
    // If currently sent for approval and not rejected → block editing completely
    if (
      product.isSentForApproval &&
      product.productStatus !== "Rejected"
    ) {
      Swal.fire(
        "Not Editable",
        "This product is already sent for approval. Wait until admin approves or rejects.",
        "info"
      );
      return;
    }

    const normalizedSizes = Array.isArray(product.product_size)
      ? product.product_size
      : typeof product.product_size === "string"
        ? product.product_size
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        : [];

    setFormData({
      ...initialFormState,
      cat_id: product.cat_id || "",
      cat_sec: product.cat_sec || "",
      subCat_id: product.subCat_id || "",
      subCategoryName: product.subCategoryName || "",
      product_name: product.product_name || "",
      product_size: normalizedSizes,
      product_color: product.product_color || [],
      product_price: product.product_price || "",
      product_sale_price: product.product_sale_price || "",
      product_description: product.product_description || "",
      gender: product.gender || "",
      frame_material: product.frame_material || "",
      frame_shape: product.frame_shape || "",
      face_shape: product.face_shape || "",
      frame_color: product.frame_color || "",
      frame_fit: product.frame_fit || "",
      product_lens_title1: product.product_lens_title1 || "",
      product_lens_description1: product.product_lens_description1 || "",
      product_lens_title2: product.product_lens_title2 || "",
      product_lens_description2: product.product_lens_description2 || "",
      lens_type: product.lens_type || "",
      material: product.material || "",
      manufacturer: product.manufacturer || "",
      water_content: product.water_content || "",
      stockAvailability: product.stockAvailability || "",
      brand_id: product.brand_id || "",
      isBestSeller: product.isBestSeller || false,
      isTrending: product.isTrending || false,
      productStatus: product.productStatus || "Pending",
      isResubmitted: product.isResubmitted || false,
      isSentForApproval: product.isSentForApproval || false,
    });

    // Color variants (ALL images via product_variants)
    if (product.product_variants && product.product_variants.length > 0) {
      const variants = product.product_variants.map((variant) => ({
        colorName: variant.colorName || "",
        files: [], // new uploads
        existingImages:
          (variant.images || []).map((img) =>
            img.startsWith("http") ? img : IMAGE_URL + img
          ) || [],
      }));
      setColorVariants(variants);
    } else {
      setColorVariants([]);
    }

    // Lens images
    setLensImage1(
      product.product_lens_image1
        ? product.product_lens_image1.startsWith("http")
          ? product.product_lens_image1
          : IMAGE_URL + product.product_lens_image1
        : null
    );
    setLensImage2(
      product.product_lens_image2
        ? product.product_lens_image2.startsWith("http")
          ? product.product_lens_image2
          : IMAGE_URL + product.product_lens_image2
        : null
    );

    // Contact lens packs
    if (product.cat_id?.toString() === CONTACT_LENS_CATEGORY_ID) {
      setLensPacks(
        product.contactLens_packs?.length
          ? product.contactLens_packs
          : [{ packSize: "", oldPrice: "", salePrice: "", isBestValue: false }]
      );
    } else {
      setLensPacks([
        { packSize: "", oldPrice: "", salePrice: "", isBestValue: false },
      ]);
    }

    setSelectedBrand(product.brand_id || "");
    setSelectedBrandType(product.brand_type || "");
    setEditId(product._id);
    setOpen(true);
  };

  // ---------- DELETE ----------
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/deleteProduct/${id}`);
          Swal.fire("Deleted!", "Product deleted successfully!", "success");
          fetchProducts();
        } catch (err) {
          Swal.fire("Error", "Failed to delete product", "error");
        }
      }
    });
  };

  // ---------- SEND FOR APPROVAL ----------
  const handleSendApproval = async (product) => {
    if (product.productStatus === "Approved") {
      Swal.fire("Info", "This product is already approved.", "info");
      return;
    }

    if (product.isSentForApproval && product.productStatus !== "Rejected") {
      Swal.fire("Info", "This product is already sent for approval.", "info");
      return;
    }

    try {
      const response = await API.put(
        `/products/send-for-approval/${product._id}`
      );
      if (response?.data) {
        Swal.fire({
          toast: true,
          icon: "success",
          title:
            product.productStatus === "Rejected"
              ? "Product re-sent for approval!"
              : "Product sent for approval!",
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
        fetchProducts();
      } else {
        Swal.fire({
          toast: true,
          icon: "error",
          title: "Something went wrong while sending for approval!",
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        toast: true,
        icon: "error",
        title: "Server error. Please try again later!",
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    }
  };

  // ---------- VIEW REJECTION MESSAGE ----------
  const handleShowRejectionReason = (product) => {
    if (!product.rejectionReason) {
      Swal.fire(
        "Info",
        "This product was rejected but no specific reason was provided.",
        "info"
      );
      return;
    }
    setRejectionMessage(product.rejectionReason);
    setShowRejectionModal(true);
  };

  // ---------- SUBMIT (ADD / UPDATE) ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.cat_id || !formData.cat_sec) {
      Swal.fire("Error", "Please select a category", "error");
      return;
    }
    if (!formData.product_name) {
      Swal.fire("Error", "Product name is required", "error");
      return;
    }
    if (!formData.product_price) {
      Swal.fire("Error", "Product price is required", "error");
      return;
    }

    try {
      const payload = new FormData();
      const stockValue = Number(formData.stockAvailability);

      // *** Status logic when editing APPROVED product ***
      let nextProductStatus = formData.productStatus || "Pending";
      let nextIsResubmitted = formData.isResubmitted;
      let nextIsSentForApproval = formData.isSentForApproval;

      // If vendor edits an Approved product (even just price/stock/images) → back to Pending & Resubmitted
      if (isApprovedEditing) {
        nextProductStatus = "Pending";
        nextIsResubmitted = true;
        nextIsSentForApproval = false;
      }

      // Basic product fields
      [
        "cat_id",
        "cat_sec",
        "subCat_id",
        "subCategoryName",
        "product_name",
        "product_price",
        "product_sale_price",
        "product_description",
        "gender",
        "frame_material",
        "frame_shape",
        "face_shape",
        "frame_color",
        "frame_fit",
        "lens_type",
        "material",
        "manufacturer",
        "water_content",
        "product_lens_title1",
        "product_lens_description1",
        "product_lens_title2",
        "product_lens_description2",
      ].forEach((field) => {
        if (
          formData[field] !== undefined &&
          formData[field] !== null &&
          formData[field] !== ""
        ) {
          payload.append(field, formData[field]);
        }
      });

      // Status fields
      payload.append("productStatus", nextProductStatus);
      payload.append("isResubmitted", nextIsResubmitted ? "true" : "false");
      payload.append(
        "isSentForApproval",
        nextIsSentForApproval ? "true" : "false"
      );

      // Stock, brand, flags
      payload.append("stockAvailability", isNaN(stockValue) ? 0 : stockValue);
      payload.append("brand_id", selectedBrand || "");
      payload.append("brand_type", selectedBrandType || "");
      payload.append(
        "isBestSeller",
        formData.isBestSeller ? "true" : "false"
      );
      payload.append("isTrending", formData.isTrending ? "true" : "false");

      // Product sizes
      if (formData.product_size?.length) {
        formData.product_size.forEach((size) =>
          payload.append("product_size[]", size)
        );
      }

      // Product colors
      if (formData.product_color?.length) {
        formData.product_color.forEach((color) =>
          payload.append("product_color[]", color)
        );
      }

      // Lens packs (only for Contact Lens category)
      if (formData.cat_id === CONTACT_LENS_CATEGORY_ID) {
        payload.append("contactLens_packs", JSON.stringify(lensPacks));
      }

      // Lens images (if new uploads)
      if (lensImage1 && typeof lensImage1 !== "string") {
        payload.append("product_lens_image1", lensImage1);
      }
      if (lensImage2 && typeof lensImage2 !== "string") {
        payload.append("product_lens_image2", lensImage2);
      }

      // Color variants metadata (existing images)
      const colorDataArray = colorVariants.map((variant) => ({
        colorName: (variant.colorName || "").trim(),
        images: (variant.existingImages || []).map((img) =>
          img.replace(IMAGE_URL, "")
        ),
      }));
      payload.append("colorData", JSON.stringify(colorDataArray));

      // New variant images – append per color name key
      colorVariants.forEach((variant) => {
        const colorKey = (variant.colorName || "").trim().toLowerCase();
        if (!colorKey) return;
        (variant.files || []).forEach((file) => {
          payload.append(colorKey, file);
        });
      });

      // Removed images (compare original product vs current variant existingImages)
      if (editId) {
        const original = products.find((p) => p._id === editId);
        const removedImages = [];

        if (original?.product_variants) {
          original.product_variants.forEach((origVariant) => {
            const origColor = (origVariant.colorName || "")
              .trim()
              .toLowerCase();
            const matched = colorVariants.find(
              (v) =>
                (v.colorName || "").trim().toLowerCase() === origColor
            );

            const keepFilenames = (matched?.existingImages || []).map((img) =>
              img.replace(IMAGE_URL, "")
            );
            (origVariant.images || []).forEach((imgFile) => {
              if (!keepFilenames.includes(imgFile)) {
                removedImages.push(imgFile);
              }
            });
          });
        }

        if (removedImages.length > 0) {
          payload.append("removedImages", JSON.stringify(removedImages));
        }
      }

      // Submit to backend
      if (editId) {
        await API.put(`/updateVendorProduct/${editId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Success", "Product updated successfully!", "success");
      } else {
        await API.post("/addProduct", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Success", "Product added successfully!", "success");
      }

      fetchProducts();
      setOpen(false);
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Operation failed",
        "error"
      );
    }
  };
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        {/* Filters */}
        <div className="flex gap-4">
          {/* Category Filter */}
          <div className="flex flex-col">
            <label className="block text-gray-700 font-medium mb-2">
              Filter Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setFilterSubCategory("");
              }}
              className="border rounded-lg p-2 border-red-600"
            >
              <option value="">All Categories</option>
              {category.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Filter */}
          <div className="flex flex-col">
            <label className="block text-gray-700 font-medium mb-2">
              Filter Subcategory
            </label>
            <select
              value={filterSubCategory}
              onChange={(e) => setFilterSubCategory(e.target.value)}
              className="border rounded-lg p-2 border-red-600"
              disabled={!filterCategory}
            >
              <option value="">All Subcategories</option>
              {category
                .find((c) => c._id === filterCategory)
                ?.subCategories?.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="bg-[#f00000] text-white px-4 py-2 rounded-lg hover:bg-red-700 hover:cursor-pointer"
        >
          <FaPlus className="inline mr-2" /> Add Product
        </button>
      </div>

      {/* Product Table */}
      <div className="overflow-auto max-h-[60vh] border rounded">
        <table className="w-full border-collapse">
          <thead className="bg-black text-white sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Sale Price</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Subcategory</th>
              <th className="px-4 py-2">Image(s)</th>
              <th className="px-4 py-2">Product Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((pro) => (
              <tr key={pro._id}>
                <td className="border px-4 py-2 text-center capitalize">
                  {pro.product_name}
                </td>
                <td className="border px-4 py-2 text-center">
                  {pro.product_price}
                </td>
                <td className="border px-4 py-2 text-center">
                  {pro.product_sale_price}
                </td>
                <td className="border px-4 py-2 text-center">{pro.cat_sec}</td>
                <td className="border px-4 py-2 text-center">
                  {pro.subCategoryName}
                </td>
                <td className="border px-4 py-2">
                  {pro?.product_variants?.[0]?.images?.length ? (
                    <div className="flex flex-wrap gap-1 justify-center">
                      <img
                        src={
                          pro.product_variants[0].images[0].startsWith("http")
                            ? pro.product_variants[0].images[0]
                            : IMAGE_URL + pro.product_variants[0].images[0]
                        }
                        alt="product"
                        className="w-20 h-12 object-cover rounded"
                      />
                    </div>
                  ) : (
                    "No Images"
                  )}
                </td>

                <td className="border px-4 py-2 text-center">
                  {pro.productStatus || "N/A"}
                </td>

                <td className="border px-4 py-2 flex justify-center items-center gap-2">
                  {/* Edit */}
                  <button
                    onClick={() => openEditModal(pro)}
                    disabled={
                      pro.isSentForApproval &&
                      pro.productStatus !== "Rejected"
                    }
                    className={`bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 hover:cursor-pointer text-center ${pro.isSentForApproval && pro.productStatus !== "Rejected"
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                      }`}
                    title={
                      pro.isSentForApproval && pro.productStatus !== "Rejected"
                        ? "Cannot edit while sent for approval"
                        : pro.productStatus === "Approved"
                          ? "Only price, sale price & stock (and images) can be edited"
                          : "Edit product"
                    }
                  >
                    <FaEdit />
                  </button>

                  {/* Send For Approval */}
                  <button
                    onClick={() => handleSendApproval(pro)}
                    disabled={
                      pro.productStatus === "Approved" ||
                      (pro.isSentForApproval &&
                        pro.productStatus !== "Rejected")
                    }
                    className={`px-3 py-1 rounded text-white ${pro.productStatus === "Approved"
                      ? "bg-[#f00000] opacity-60 cursor-not-allowed"
                      : pro.productStatus === "Rejected"
                        ? "bg-yellow-500 hover:bg-yellow-600"
                        : pro.isSentForApproval
                          ? "bg-[#f00000] opacity-60 cursor-not-allowed"
                          : "bg-[#f00000] hover:bg-red-700"
                      }`}
                    title={
                      pro.productStatus === "Approved"
                        ? "Already approved"
                        : pro.productStatus === "Rejected"
                          ? "Send again after fixing"
                          : pro.isSentForApproval
                            ? "Already sent for approval"
                            : "Send For Approval"
                    }
                  >
                    {pro.productStatus === "Rejected"
                      ? "Send Again"
                      : pro.productStatus === "Approved"
                        ? "Approved"
                        : pro.isSentForApproval
                          ? "Sent"
                          : "Send For Approval"}
                  </button>

                  {/* View Rejection Reason (if rejected) */}
                  {pro.productStatus === "Rejected" && (
                    <button
                      onClick={() => handleShowRejectionReason(pro)}
                      className="px-3 py-1 rounded bg-gray-500 text-white hover:bg-gray-600"
                    >
                      Reason
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(pro._id)}
                    className="bg-[#f00000] text-white px-3 py-1 rounded hover:bg-red-600 hover:cursor-pointer"
                  >
                    <FaTrash />
                  </button>
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

      {/* Rejection message modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h3 className="text-lg font-semibold mb-4 text-[#f00000]">
              Product Rejected
            </h3>
            <p className="text-gray-700 mb-6 whitespace-pre-line">
              {rejectionMessage}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 hover:cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-1">
              {editId ? "Edit Product" : "Add Product"}
            </h3>

            {isApprovedEditing && (
              <p className="text-xs text-red-600 mb-3">
                This product is <b>Approved</b>. You can only change{" "}
                <b>Price, Sale Price & Stock</b> and update images. Other
                fields are locked and will be reviewed by admin again.
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Category dropdown */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.cat_id}
                  disabled={isApprovedEditing}
                  onChange={(e) => {
                    const selectedCat = category.find(
                      (c) => c._id === e.target.value
                    );
                    setFormData((prev) => ({
                      ...prev,
                      cat_id: selectedCat?._id || "",
                      cat_sec: selectedCat?.categoryName || "",
                      subCat_id: "",
                      subCategoryName: "",
                    }));
                  }}
                  className={`w-full border rounded p-2 ${isApprovedEditing ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                >
                  <option value="">Select Category</option>
                  {category.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory dropdown */}
              {formData.cat_id && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Subcategory <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.subCat_id}
                    disabled={isApprovedEditing}
                    onChange={(e) => {
                      const selectedCat = category.find(
                        (c) => c._id === formData.cat_id
                      );
                      const selectedSub = selectedCat?.subCategories?.find(
                        (sub) => sub._id === e.target.value
                      );
                      setFormData((prev) => ({
                        ...prev,
                        subCat_id: selectedSub?._id || "",
                        subCategoryName: selectedSub?.name || "",
                      }));
                    }}
                    className={`w-full border rounded p-2 ${isApprovedEditing ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                  >
                    <option value="">Select Subcategory</option>
                    {category
                      .find((c) => c._id === formData.cat_id)
                      ?.subCategories?.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Brand dropdowns */}
              {formData.cat_id === CONTACT_LENS_CATEGORY_ID ? (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Contact Lenses Brand{" "}
                    <span className="text-gray-500">(Optional)</span>
                  </label>
                  <select
                    value={selectedBrand}
                    disabled={isApprovedEditing}
                    onChange={(e) => {
                      const selected = contactLensBrands.find(
                        (b) => b._id === e.target.value
                      );
                      setSelectedBrand(selected?._id || "");
                      setSelectedBrandType(selected?.type || "");
                    }}
                    className={`w-full border rounded p-2 ${isApprovedEditing ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                  >
                    <option value="">Select Brand</option>
                    {contactLensBrands.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.brand}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Glasses Brand{" "}
                    <span className="text-gray-500">(Optional)</span>
                  </label>
                  <select
                    value={selectedBrand}
                    disabled={isApprovedEditing}
                    onChange={(e) => {
                      const selected = glassesBrands.find(
                        (b) => b._id === e.target.value
                      );
                      setSelectedBrand(selected?._id || "");
                      setSelectedBrandType(selected?.type || "");
                    }}
                    className={`w-full border rounded p-2 ${isApprovedEditing ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                  >
                    <option value="">Select Brand</option>
                    {glassesBrands.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.brand}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Product Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="product_name"
                  disabled={isApprovedEditing}
                  value={formData.product_name.toUpperCase()}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className={`w-full border p-2 rounded ${isApprovedEditing ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                />
              </div>

              {/* Product Sizes */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Product Sizes
                </label>
                <div className="flex gap-4">
                  {["S", "M", "L"].map((size) => (
                    <label
                      key={size}
                      className={`flex items-center gap-1 cursor-pointer ${isApprovedEditing ? "cursor-not-allowed" : ""
                        }`}
                    >
                      <input
                        type="checkbox"
                        value={size}
                        disabled={isApprovedEditing}
                        checked={formData.product_size.includes(size)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData((prev) => ({
                              ...prev,
                              product_size: [...prev.product_size, size],
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              product_size: prev.product_size.filter(
                                (s) => s !== size
                              ),
                            }));
                          }
                        }}
                      />
                      <span>{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Product Colors */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Product Colors
                </label>
                <input
                  type="text"
                  name="product_color"
                  disabled={isApprovedEditing}
                  value={formData.product_color.join(", ")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      product_color: e.target.value
                        .split(",")
                        .map((c) => c.trim())
                        .filter(Boolean),
                    }))
                  }
                  placeholder="Enter colors (Black, Red, Blue)"
                  className={`w-full border p-2 rounded ${isApprovedEditing ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="product_price"
                    value={formData.product_price || ""}
                    onChange={handleChange}
                    placeholder="Enter price"
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Sale Price
                  </label>
                  <input
                    type="number"
                    name="product_sale_price"
                    value={formData.product_sale_price || ""}
                    onChange={handleChange}
                    placeholder="Enter sale price"
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Stock Availability
                </label>
                <input
                  type="number"
                  name="stockAvailability"
                  value={formData.stockAvailability || ""}
                  onChange={handleChange}
                  placeholder="Enter stock quantity"
                  className="w-full border p-2 rounded"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Product Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="product_description"
                  disabled={isApprovedEditing}
                  value={formData.product_description}
                  onChange={handleChange}
                  placeholder="Enter product description"
                  className={`w-full border p-2 rounded h-20 ${isApprovedEditing ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  disabled={isApprovedEditing}
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full border p-2 rounded ${isApprovedEditing ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                >
                  <option value="">Select Gender</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Kids">Kids</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>

              {/* Best Seller & Trending */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    disabled={isApprovedEditing}
                    checked={formData.isBestSeller}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isBestSeller: e.target.checked,
                      }))
                    }
                  />
                  <span className="font-medium">Best Seller</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    disabled={isApprovedEditing}
                    checked={formData.isTrending}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isTrending: e.target.checked,
                      }))
                    }
                  />
                  <span className="font-medium">Trending Product</span>
                </label>
              </div>

              {/* Sunglasses Fields */}
              {formData.cat_id !== CONTACT_LENS_CATEGORY_ID && (
                <div>
                  <h4 className="text-gray-700 font-semibold mb-3">
                    Frame Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Frame Material
                      </label>
                      <input
                        type="text"
                        name="frame_material"
                        disabled={isApprovedEditing}
                        value={formData.frame_material}
                        onChange={handleChange}
                        placeholder="e.g., Metal, Plastic"
                        className={`w-full border p-2 rounded ${isApprovedEditing
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Frame Shape
                      </label>
                      <input
                        type="text"
                        name="frame_shape"
                        disabled={isApprovedEditing}
                        value={formData.frame_shape}
                        onChange={handleChange}
                        placeholder="e.g., Round, Square"
                        className={`w-full border p-2 rounded ${isApprovedEditing
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Face Shape
                      </label>
                      <input
                        type="text"
                        name="face_shape"
                        disabled={isApprovedEditing}
                        value={formData.face_shape}
                        onChange={handleChange}
                        placeholder="e.g., Round, Square, Oval, Heart..."
                        className={`w-full border p-2 rounded ${isApprovedEditing
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Frame Color
                      </label>
                      <input
                        type="text"
                        name="frame_color"
                        disabled={isApprovedEditing}
                        value={formData.frame_color}
                        onChange={handleChange}
                        placeholder="e.g., Black, Silver"
                        className={`w-full border p-2 rounded ${isApprovedEditing
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Frame Fit
                      </label>
                      <input
                        type="text"
                        name="frame_fit"
                        disabled={isApprovedEditing}
                        value={formData.frame_fit}
                        onChange={handleChange}
                        placeholder="e.g., Regular, Wide"
                        className={`w-full border p-2 rounded ${isApprovedEditing
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                          }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Lens Fields */}
              {formData.cat_id === CONTACT_LENS_CATEGORY_ID && (
                <div>
                  <h4 className="text-gray-700 font-semibold mb-3">
                    Contact Lens Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Lens Type
                      </label>
                      <input
                        type="text"
                        name="lens_type"
                        disabled={isApprovedEditing}
                        value={formData.lens_type}
                        onChange={handleChange}
                        placeholder="Daily/Monthly"
                        className={`w-full border p-2 rounded ${isApprovedEditing
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Material
                      </label>
                      <input
                        type="text"
                        name="material"
                        disabled={isApprovedEditing}
                        value={formData.material}
                        onChange={handleChange}
                        placeholder="e.g., Silicone Hydrogel"
                        className={`w-full border p-2 rounded ${isApprovedEditing
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Manufacturer
                      </label>
                      <input
                        type="text"
                        name="manufacturer"
                        disabled={isApprovedEditing}
                        value={formData.manufacturer}
                        onChange={handleChange}
                        placeholder="e.g., Bausch & Lomb"
                        className={`w-full border p-2 rounded ${isApprovedEditing
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Water Content (%)
                      </label>
                      <input
                        type="text"
                        name="water_content"
                        disabled={isApprovedEditing}
                        value={formData.water_content}
                        onChange={handleChange}
                        placeholder="e.g., 40"
                        className={`w-full border p-2 rounded ${isApprovedEditing
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                          }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Lens Packs Section */}
              {formData.cat_id === CONTACT_LENS_CATEGORY_ID && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-gray-700 font-semibold mb-3">
                    Contact Lens Packs
                  </h4>

                  {lensPacks.map((pack, index) => (
                    <div
                      key={index}
                      className="border border-gray-300 rounded p-3 mb-3 bg-gray-50"
                    >
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-gray-700 font-medium mb-1">
                            Pack Size
                          </label>
                          <input
                            type="number"
                            disabled={isApprovedEditing}
                            value={pack.packSize}
                            onChange={(e) => {
                              const updated = [...lensPacks];
                              updated[index].packSize = e.target.value;
                              setLensPacks(updated);
                            }}
                            className={`w-full border p-2 rounded ${isApprovedEditing
                              ? "bg-gray-100 cursor-not-allowed"
                              : ""
                              }`}
                            placeholder="Ex: 30, 90"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-medium mb-1">
                            Old Price
                          </label>
                          <input
                            type="number"
                            disabled={isApprovedEditing}
                            value={pack.oldPrice}
                            onChange={(e) => {
                              const updated = [...lensPacks];
                              updated[index].oldPrice = e.target.value;
                              setLensPacks(updated);
                            }}
                            className={`w-full border p-2 rounded ${isApprovedEditing
                              ? "bg-gray-100 cursor-not-allowed"
                              : ""
                              }`}
                            placeholder="Ex: 499"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-medium mb-1">
                            Sale Price
                          </label>
                          <input
                            type="number"
                            disabled={isApprovedEditing}
                            value={pack.salePrice}
                            onChange={(e) => {
                              const updated = [...lensPacks];
                              updated[index].salePrice = e.target.value;
                              setLensPacks(updated);
                            }}
                            className={`w-full border p-2 rounded ${isApprovedEditing
                              ? "bg-gray-100 cursor-not-allowed"
                              : ""
                              }`}
                            placeholder="Ex: 399"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          disabled={isApprovedEditing}
                          checked={pack.isBestValue}
                          onChange={(e) => {
                            const updated = [...lensPacks];
                            updated[index].isBestValue = e.target.checked;
                            setLensPacks(updated);
                          }}
                        />
                        <span className="text-sm font-medium">
                          Best Value Pack
                        </span>
                      </label>

                      <button
                        type="button"
                        disabled={isApprovedEditing}
                        onClick={() => {
                          const updated = lensPacks.filter(
                            (_, i) => i !== index
                          );
                          setLensPacks(updated);
                        }}
                        className={`mt-2 text-red-600 ${isApprovedEditing
                          ? "opacity-60 cursor-not-allowed"
                          : ""
                          }`}
                      >
                        Remove Pack
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    disabled={isApprovedEditing}
                    onClick={() =>
                      setLensPacks([
                        ...lensPacks,
                        {
                          packSize: "",
                          oldPrice: "",
                          salePrice: "",
                          isBestValue: false,
                        },
                      ])
                    }
                    className={`bg-blue-600 text-white px-3 py-1 rounded ${isApprovedEditing
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:bg-blue-700"
                      }`}
                  >
                    + Add Pack Size
                  </button>
                </div>
              )}

              {/* Lens Details & Images */}
              <div>
                <h4 className="text-gray-700 font-semibold mb-3">
                  Lens Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Lens Title 1
                    </label>
                    <input
                      type="text"
                      name="product_lens_title1"
                      disabled={isApprovedEditing}
                      value={formData.product_lens_title1}
                      onChange={handleChange}
                      placeholder="e.g., Anti-Reflective"
                      className={`w-full border p-2 rounded ${isApprovedEditing
                        ? "bg-gray-100 cursor-not-allowed"
                        : ""
                        }`}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Lens Description 1
                    </label>
                    <input
                      type="text"
                      name="product_lens_description1"
                      disabled={isApprovedEditing}
                      value={formData.product_lens_description1}
                      onChange={handleChange}
                      placeholder="Description"
                      className={`w-full border p-2 rounded ${isApprovedEditing
                        ? "bg-gray-100 cursor-not-allowed"
                        : ""
                        }`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Lens Image 1
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLensImage1(e.target.files[0])}
                  className="w-full border p-2 rounded"
                />
                {lensImage1 && (
                  <div className="relative inline-block mt-2">
                    <img
                      src={
                        typeof lensImage1 === "string"
                          ? lensImage1
                          : URL.createObjectURL(lensImage1)
                      }
                      alt="lens1"
                      className="w-20 h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => setLensImage1(null)}
                      className="absolute top-0 right-0 bg-[#f00000] text-white rounded-full px-1 hover:cursor-pointer"
                    >
                      X
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Lens Title 2
                  </label>
                  <input
                    type="text"
                    name="product_lens_title2"
                    disabled={isApprovedEditing}
                    value={formData.product_lens_title2}
                    onChange={handleChange}
                    placeholder="e.g., UV Protection"
                    className={`w-full border p-2 rounded ${isApprovedEditing ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Lens Description 2
                  </label>
                  <input
                    type="text"
                    name="product_lens_description2"
                    disabled={isApprovedEditing}
                    value={formData.product_lens_description2}
                    onChange={handleChange}
                    placeholder="Description"
                    className={`w-full border p-2 rounded ${isApprovedEditing ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Lens Image 2
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLensImage2(e.target.files[0])}
                  className="w-full border p-2 rounded"
                />
                {lensImage2 && (
                  <div className="relative inline-block mt-2">
                    <img
                      src={
                        typeof lensImage2 === "string"
                          ? lensImage2
                          : URL.createObjectURL(lensImage2)
                      }
                      alt="lens2"
                      className="w-20 h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => setLensImage2(null)}
                      className="absolute top-0 right-0 bg-[#f00000] text-white rounded-full px-1 hover:cursor-pointer"
                    >
                      X
                    </button>
                  </div>
                )}
              </div>

              {/* Color Variants */}
              <div className="mt-4 border-t pt-4">
                <h4 className="text-gray-700 font-semibold mb-3">
                  Color Variants
                </h4>

                {colorVariants.map((variant, index) => {
                  const isValidColor = (() => {
                    try {
                      const s = new Option().style;
                      s.color = variant.colorName;
                      return s.color !== "";
                    } catch {
                      return false;
                    }
                  })();

                  return (
                    <div
                      key={index}
                      className="border border-gray-300 rounded-lg p-3 mb-4 bg-gray-50 shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex-1">
                          <label className="block text-gray-700 font-medium mb-2">
                            Color Name {index + 1}
                          </label>
                          <input
                            type="text"
                            placeholder="Enter Color (e.g. Blue or #0000ff)"
                            value={variant.colorName}
                            disabled={isApprovedEditing}
                            onChange={(e) => {
                              const updated = [...colorVariants];
                              updated[index].colorName = e.target.value;
                              setColorVariants(updated);
                            }}
                            className={`border p-2 rounded w-full capitalize ${isApprovedEditing
                              ? "bg-gray-100 cursor-not-allowed"
                              : ""
                              }`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setColorVariants(
                              colorVariants.filter((_, i) => i !== index)
                            )
                          }
                          disabled={isApprovedEditing}
                          className={`text-[#f00000] text-sm ml-2 ${isApprovedEditing
                            ? "opacity-60 cursor-not-allowed"
                            : "hover:underline"
                            }`}
                        >
                          Remove
                        </button>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Upload Images for{" "}
                          {variant.colorName || `Color ${index + 1}`}
                        </label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          disabled={!variant.colorName?.trim()}
                          onChange={(e) => {
                            const updated = [...colorVariants];
                            if (!updated[index].colorName?.trim()) {
                              Swal.fire(
                                "Error",
                                "Please enter color name before uploading images!",
                                "error"
                              );
                              e.target.value = "";
                              return;
                            }
                            const newFiles = Array.from(e.target.files);
                            updated[index].files = [
                              ...(updated[index].files || []),
                              ...newFiles,
                            ];
                            setColorVariants(updated);
                          }}
                          className="w-full border p-2 rounded"
                        />
                      </div>

                      {(variant.existingImages?.length > 0 ||
                        variant.files?.length > 0) && (
                          <div className="flex items-center gap-2 mt-4 mb-2">
                            <span
                              className="w-5 h-5 rounded-full border border-gray-400"
                              style={{
                                backgroundColor: isValidColor
                                  ? variant.colorName
                                  : "transparent",
                              }}
                              title={
                                isValidColor
                                  ? variant.colorName
                                  : "Invalid color name or code"
                              }
                            />
                            <h4 className="text-gray-800 font-semibold">
                              {variant.colorName
                                ? `${variant.colorName.charAt(0).toUpperCase() +
                                variant.colorName.slice(1)
                                } Images`
                                : "Color Images"}
                            </h4>
                          </div>
                        )}

                      <div className="flex flex-wrap gap-2 mt-2">
                        {variant.existingImages?.map((img, i) => (
                          <div key={`existing-${i}`} className="relative group">
                            <img
                              src={img}
                              alt="existing variant"
                              className="w-16 h-16 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...colorVariants];
                                updated[index].existingImages = updated[
                                  index
                                ].existingImages.filter((_, idx) => idx !== i);
                                setColorVariants(updated);
                              }}
                              className="absolute -top-1 -right-1 bg-[#f00000] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700 opacity-90"
                            >
                              ✕
                            </button>
                            <span className="absolute bottom-0 left-0 bg-black/70 text-white text-xs px-1 rounded">
                              Old
                            </span>
                          </div>
                        ))}

                        {variant.files?.map((file, i) => (
                          <div key={`new-${i}`} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt="new variant"
                              className="w-16 h-16 object-cover rounded border"
                            />
                          </div>
                        ))}
                      </div>

                      {(variant.existingImages?.length > 0 ||
                        variant.files?.length > 0) && (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.createElement("input");
                                input.type = "file";
                                input.multiple = true;
                                input.accept = "image/*";
                                input.onchange = (e) => {
                                  const updated = [...colorVariants];
                                  const newFiles = Array.from(e.target.files);
                                  updated[index].files = [
                                    ...(updated[index].files || []),
                                    ...newFiles,
                                  ];
                                  setColorVariants(updated);
                                };
                                input.click();
                              }}
                              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 mt-2"
                            >
                              + Add More Images
                            </button>
                          </div>
                        )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  disabled={isApprovedEditing}
                  onClick={() =>
                    setColorVariants([
                      ...colorVariants,
                      { colorName: "", files: [], existingImages: [] },
                    ])
                  }
                  className={`bg-blue-600 text-white px-3 py-1 rounded ${isApprovedEditing
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-blue-700"
                    }`}
                >
                  + Add Color Variant
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 hover:cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 hover:cursor-pointer"
                >
                  {editId ? "Update" : "Submit"}
                </button>
              </div>
            </form>

            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-[#f00000] text-2xl hover:cursor-pointer"
            >
              <IoIosCloseCircle />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
