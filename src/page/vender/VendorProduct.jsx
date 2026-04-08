// VendorProduct.jsx
// Vendor product management — mirrors admin form but with approval workflow restrictions.

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import API, { IMAGE_URL } from "../../API/Api";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";

// ── Constants ────────────────────────────────────────────────────────────────
const CONTACT_LENS_CATEGORY_ID = "6915735feeb23fa59c7d532b";

// Fields vendor can freely edit even after Approved status
const APPROVED_EDITABLE_FIELDS = [
  "product_price",
  "product_sale_price",
  "stockAvailability",  //  vendor can update their own stock
];

// Fields that are locked in the FORM when Approved (all other fields)
const APPROVED_LOCKED_FIELDS = [
  "cat_id", "cat_sec", "subCat_id", "subCategoryName",
  "product_name", "product_description", "productStatus",
  "isResubmitted", "isSentForApproval", "brand_id", "brand_type",
  "isBestSeller", "isTrending", "product_size",
  "frame_material", "frame_shape", "face_shape", "frame_color", "frame_fit",
  "lens_width", "bridge_width", "lens_hieght", "temple_length",
  "lens_type", "material", "manufacturer", "water_content",
  "gender", "weight", "length", "width", "height",
];

// ── Initial form state ────────────────────────────────────────────────────────
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
  lens_width: "",
  bridge_width: "",
  lens_hieght: "",
  temple_length: "",
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
  // Shipping dimensions
  weight: "",
  length: "",
  width: "",
  height: "",
  brand_id: "",
  isBestSeller: false,
  isTrending: false,
  // Approval workflow flags
  productStatus: "Pending",
  isResubmitted: false,
  isSentForApproval: false,
};

// ── Component ─────────────────────────────────────────────────────────────────
const VendorProducts = () => {
  // ── UI state ──
  const [open, setOpen] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState("");

  // ── Data state ──
  const [category, setCategory] = useState([]);
  const [products, setProducts] = useState([]);
  const [contactLensBrands, setContactLensBrands] = useState([]);
  const [glassesBrands, setGlassesBrands] = useState([]);
  const [colorVariants, setColorVariants] = useState([]);
  const [lensImage1, setLensImage1] = useState(null);
  const [lensImage2, setLensImage2] = useState(null);
  const [lensPacks, setLensPacks] = useState([
    { packSize: "", oldPrice: "", salePrice: "", isBestValue: false },
  ]);

  // ── Filters & Pagination ──
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSubCategory, setFilterSubCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);

  // ── Brand selection ──
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedBrandType, setSelectedBrandType] = useState("");

  // ── Form data ──
  const [formData, setFormData] = useState(initialFormState);
  const [editId, setEditId] = useState(null);

  // Derived: editing an approved product that hasn't been resubmitted for changes
  const isApprovedEditing =
    !!editId &&
    formData.productStatus === "Approved" &&
    !formData.isResubmitted;

  // ── Fetchers ──────────────────────────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      const res = await API.get("/getVendorProduct");
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch vendor products", "error");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/getcategories");
      setCategory(res.data.categories || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await API.get("/getBrand");
      const allBrands = res.data.data || [];
      setContactLensBrands(allBrands.filter((b) => b.type === "Contact Lenses"));
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

  // ── Filtering + Pagination ────────────────────────────────────────────────
  const filteredProducts = products.filter((pro) => {
    const matchCategory = filterCategory
      ? pro.cat_id?.toString() === filterCategory
      : true;
    const matchSubCategory = filterSubCategory
      ? pro.subCat_id?.toString() === filterSubCategory
      : true;
    return matchCategory && matchSubCategory;
  });

  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // ── Handle field changes (with Approved lock) ─────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    if (isApprovedEditing && !APPROVED_EDITABLE_FIELDS.includes(name)) {
      Swal.fire(
        "Restricted",
        "After approval, only Price, Sale Price and Stock can be edited. Other fields are locked.",
        "warning"
      );
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ── Open Add Modal ────────────────────────────────────────────────────────
  const openAddModal = () => {
    setFormData(initialFormState);
    setLensImage1(null);
    setLensImage2(null);
    setColorVariants([]);
    setLensPacks([{ packSize: "", oldPrice: "", salePrice: "", isBestValue: false }]);
    setSelectedBrand("");
    setSelectedBrandType("");
    setEditId(null);
    setOpen(true);
  };

  // ── Open Edit Modal ───────────────────────────────────────────────────────
  const openEditModal = (product) => {
    // Block if already sent for approval (unless rejected)
    if (product.isSentForApproval && product.productStatus !== "Rejected") {
      Swal.fire(
        "Not Editable",
        "This product is already sent for approval. Wait until admin approves or rejects it.",
        "info"
      );
      return;
    }

    const normalizedSizes = Array.isArray(product.product_size)
      ? product.product_size
      : typeof product.product_size === "string"
        ? product.product_size.split(",").map((s) => s.trim()).filter(Boolean)
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
      lens_width: product.lens_width || "",
      bridge_width: product.bridge_width || "",
      lens_hieght: product.lens_hieght || "",
      temple_length: product.temple_length || "",
      lens_type: product.lens_type || "",
      material: product.material || "",
      manufacturer: product.manufacturer || "",
      water_content: product.water_content || "",
      stockAvailability: product.stockAvailability ?? "",
      weight: product.weight || "",
      length: product.length || "",
      width: product.width || "",
      height: product.height || "",
      product_lens_title1: product.product_lens_title1 || "",
      product_lens_description1: product.product_lens_description1 || "",
      product_lens_title2: product.product_lens_title2 || "",
      product_lens_description2: product.product_lens_description2 || "",
      brand_id: product.brand_id || "",
      isBestSeller: product.isBestSeller || false,
      isTrending: product.isTrending || false,
      productStatus: product.productStatus || "Pending",
      isResubmitted: product.isResubmitted || false,
      isSentForApproval: product.isSentForApproval || false,
    });

    // Color variants
    if (product.product_variants?.length > 0) {
      setColorVariants(
        product.product_variants.map((v) => ({
          colorName: v.colorName || "",
          files: [],
          existingImages: (v.images || []).map((img) =>
            img.startsWith("http") ? img : IMAGE_URL + img
          ),
        }))
      );
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

    // Lens packs
    if (product.cat_id?.toString() === CONTACT_LENS_CATEGORY_ID) {
      setLensPacks(
        product.contactLens_packs?.length
          ? product.contactLens_packs
          : [{ packSize: "", oldPrice: "", salePrice: "", isBestValue: false }]
      );
    } else {
      setLensPacks([{ packSize: "", oldPrice: "", salePrice: "", isBestValue: false }]);
    }

    setSelectedBrand(product.brand_id || "");
    setSelectedBrandType(product.brand_type || "");
    setEditId(product._id);
    setOpen(true);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = (id) => {
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

  // ── Send for Approval ─────────────────────────────────────────────────────
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
      await API.put(`/products/send-for-approval/${product._id}`);
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

  // ── View Rejection Reason ─────────────────────────────────────────────────
  const handleShowRejectionReason = (product) => {
    if (!product.rejectionReason) {
      Swal.fire("Info", "Product was rejected but no specific reason was provided.", "info");
      return;
    }
    setRejectionMessage(product.rejectionReason);
    setShowRejectionModal(true);
  };

  // ── Submit (Add / Update) ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

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

      // Basic text fields
      [
        "cat_id", "cat_sec", "subCat_id", "subCategoryName",
        "product_name", "product_price", "product_sale_price",
        "product_description", "gender",
        "frame_material", "frame_shape", "face_shape", "frame_color", "frame_fit",
        "lens_width", "bridge_width", "lens_hieght", "temple_length",
        "lens_type", "material", "manufacturer", "water_content",
        "product_lens_title1", "product_lens_description1",
        "product_lens_title2", "product_lens_description2",
        "weight", "length", "width", "height",
      ].forEach((field) => {
        // Skip locked fields when editing Approved product
        if (isApprovedEditing && APPROVED_LOCKED_FIELDS.includes(field)) return;
        if (formData[field] !== undefined && formData[field] !== null && formData[field] !== "") {
          payload.append(field, formData[field]);
        }
      });

      // Stock
      if (formData.stockAvailability !== "" && formData.stockAvailability !== undefined) {
        payload.append("stockAvailability", Number(formData.stockAvailability) || 0);
      }

      // Approval status flags (skip when editing Approved — backend handles those)
      if (!isApprovedEditing) {
        payload.append("productStatus", formData.productStatus || "Pending");
        payload.append("isResubmitted", formData.isResubmitted ? "true" : "false");
        payload.append("isSentForApproval", formData.isSentForApproval ? "true" : "false");
        payload.append("brand_id", selectedBrand || "");
        payload.append("brand_type", selectedBrandType || "");
      }

      payload.append("isBestSeller", formData.isBestSeller ? "true" : "false");
      payload.append("isTrending", formData.isTrending ? "true" : "false");

      // Sizes
      if (!isApprovedEditing && formData.product_size?.length) {
        formData.product_size.forEach((size) => payload.append("product_size[]", size));
      }

      // Colors
      if (formData.product_color?.length) {
        formData.product_color.forEach((color) => payload.append("product_color[]", color));
      }

      // Lens packs (Contact Lens only)
      if (formData.cat_id === CONTACT_LENS_CATEGORY_ID) {
        payload.append("contactLens_packs", JSON.stringify(lensPacks));
      }

      // Lens images
      if (lensImage1 && typeof lensImage1 !== "string") payload.append("product_lens_image1", lensImage1);
      if (lensImage2 && typeof lensImage2 !== "string") payload.append("product_lens_image2", lensImage2);

      // Color variants metadata
      const colorDataArray = colorVariants.map((v) => ({
        colorName: (v.colorName || "").trim(),
        images: (v.existingImages || []).map((img) => img.replace(IMAGE_URL, "")),
      }));
      payload.append("colorData", JSON.stringify(colorDataArray));

      // New variant image files
      colorVariants.forEach((v) => {
        const colorKey = (v.colorName || "").trim().toLowerCase();
        if (!colorKey) return;
        (v.files || []).forEach((file) => payload.append(colorKey, file));
      });

      // Removed images (diff existing vs original)
      if (editId) {
        const original = products.find((p) => p._id === editId);
        const removedImages = [];
        if (original?.product_variants) {
          original.product_variants.forEach((origVariant) => {
            const origColor = (origVariant.colorName || "").trim().toLowerCase();
            const matched = colorVariants.find(
              (v) => (v.colorName || "").trim().toLowerCase() === origColor
            );
            const keepFilenames = (matched?.existingImages || []).map((img) =>
              img.replace(IMAGE_URL, "")
            );
            (origVariant.images || []).forEach((imgFile) => {
              if (!keepFilenames.includes(imgFile)) removedImages.push(imgFile);
            });
          });
        }
        if (removedImages.length > 0) {
          payload.append("removedImages", JSON.stringify(removedImages));
        }
      }

      if (editId) {
        await API.put(`/updateVendorProduct/${editId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Success", "Product updated successfully!", "success");
      } else {
        await API.post("/addProduct", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Success", "Product added successfully! Send it for admin approval.", "success");
      }

      fetchProducts();
      setOpen(false);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.message || "Operation failed", "error");
    }
  };

  // ── Status badge helper ───────────────────────────────────────────────────
  const getStatusBadge = (pro) => {
    if (pro.productStatus === "Approved") {
      return <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Approved</span>;
    }
    if (pro.productStatus === "Rejected") {
      return <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">Rejected</span>;
    }
    if (pro.isSentForApproval) {
      return <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">Pending Review</span>;
    }
    return <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">Draft</span>;
  };

  // ── Locked field class helper ─────────────────────────────────────────────
  const lockedClass = isApprovedEditing ? "bg-gray-100 cursor-not-allowed" : "";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Category Filter */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1 text-sm">Filter Category</label>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setFilterSubCategory("");
              }}
              className="border rounded-lg p-2 border-red-400 text-sm"
            >
              <option value="">All Categories</option>
              {category.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
              ))}
            </select>
          </div>

          {/* Subcategory Filter */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1 text-sm">Filter Subcategory</label>
            <select
              value={filterSubCategory}
              onChange={(e) => setFilterSubCategory(e.target.value)}
              className="border rounded-lg p-2 border-red-400 text-sm"
              disabled={!filterCategory}
            >
              <option value="">All Subcategories</option>
              {category
                .find((c) => c._id === filterCategory)
                ?.subCategories?.map((sub) => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
            </select>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="bg-[#f00000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-semibold flex items-center gap-2"
        >
          <FaPlus /> Add Product
        </button>
      </div>

      {/* ── Approval workflow info banner ── */}
      <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
        After adding a product, use <strong>Send for Approval</strong> so admin can review and publish it.
        Approved products are visible on the website. You can only edit <strong>Price, Sale Price and Stock</strong> on approved products.
      </div>

      {/* ── Product Table ── */}
      <div className="overflow-auto max-h-[60vh] border rounded-xl">
        <table className="w-full border-collapse">
          <thead className="bg-gray-800 text-white sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-left">Name</th>
              <th className="px-4 py-3 text-sm font-semibold">Price</th>
              <th className="px-4 py-3 text-sm font-semibold">Sale Price</th>
              <th className="px-4 py-3 text-sm font-semibold">Category</th>
              <th className="px-4 py-3 text-sm font-semibold">Subcategory</th>
              <th className="px-4 py-3 text-sm font-semibold">Stock</th>
              <th className="px-4 py-3 text-sm font-semibold">Image</th>
              <th className="px-4 py-3 text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-gray-400">
                  <p className="text-3xl mb-2">📦</p>
                  <p className="font-medium">No products yet. Add your first product!</p>
                </td>
              </tr>
            ) : (
              currentProducts.map((pro, idx) => (
                <tr
                  key={pro._id}
                  className={`border-b border-gray-100 text-sm hover:bg-gray-50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-800 capitalize max-w-[180px] truncate">
                    {pro.product_name}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">${pro.product_price}</td>
                  <td className="px-4 py-3 text-center text-gray-500">
                    {pro.product_sale_price ? `$${pro.product_sale_price}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{pro.cat_sec}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{pro.subCategoryName || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    {pro.stockAvailability != null ? (
                      <span className={`font-semibold ${Number(pro.stockAvailability) < 5 ? "text-red-500" : "text-gray-700"}`}>
                        {pro.stockAvailability}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {pro?.product_variants?.[0]?.images?.length ? (
                      <div className="flex justify-center">
                        <img
                          src={
                            pro.product_variants[0].images[0].startsWith("http")
                              ? pro.product_variants[0].images[0]
                              : IMAGE_URL + pro.product_variants[0].images[0]
                          }
                          alt="product"
                          className="w-16 h-10 object-cover rounded border"
                        />
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs text-center block">No image</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">{getStatusBadge(pro)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {/* Edit */}
                      <button
                        onClick={() => openEditModal(pro)}
                        disabled={pro.isSentForApproval && pro.productStatus !== "Rejected"}
                        className={`bg-blue-500 text-white px-2.5 py-1.5 rounded hover:bg-blue-600 transition text-xs ${pro.isSentForApproval && pro.productStatus !== "Rejected" ? "opacity-50 cursor-not-allowed" : ""}`}
                        title={pro.isSentForApproval && pro.productStatus !== "Rejected" ? "Cannot edit while pending review" : "Edit product"}
                      >
                        <FaEdit />
                      </button>

                      {/* Send for Approval */}
                      <button
                        onClick={() => handleSendApproval(pro)}
                        disabled={
                          pro.productStatus === "Approved" ||
                          (pro.isSentForApproval && pro.productStatus !== "Rejected")
                        }
                        className={`px-2.5 py-1.5 rounded text-white text-xs transition ${pro.productStatus === "Approved"
                          ? "bg-green-500 opacity-60 cursor-not-allowed"
                          : pro.productStatus === "Rejected"
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : pro.isSentForApproval
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-[#f00000] hover:bg-red-700"
                          }`}
                        title={
                          pro.productStatus === "Approved"
                            ? "Already approved"
                            : pro.productStatus === "Rejected"
                              ? "Re-send after fixing"
                              : pro.isSentForApproval
                                ? "Already sent for review"
                                : "Send for admin approval"
                        }
                      >
                        {pro.productStatus === "Rejected"
                          ? "Resend"
                          : pro.productStatus === "Approved"
                            ? "✓ Approved"
                            : pro.isSentForApproval
                              ? "Sent"
                              : "Send for Approval"}
                      </button>

                      {/* View Rejection Reason */}
                      {pro.productStatus === "Rejected" && (
                        <button
                          onClick={() => handleShowRejectionReason(pro)}
                          className="px-2.5 py-1.5 rounded bg-gray-500 text-white hover:bg-gray-600 text-xs"
                        >
                          Reason
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(pro._id)}
                        className="bg-[#f00000] text-white px-2.5 py-1.5 rounded hover:bg-red-700 transition text-xs"
                      >
                        <FaTrash />
                      </button>
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
        <div className="flex justify-center mt-4 gap-2 flex-wrap">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded text-sm ${currentPage === i + 1 ? "bg-[#f00000] text-white border-[#f00000]" : "hover:bg-gray-100"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* ── Rejection Modal ── */}
      {showRejectionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <h3 className="text-lg font-bold mb-3 text-red-600">Rejection Reason</h3>
            <p className="text-gray-700 mb-5 whitespace-pre-line">{rejectionMessage}</p>
            <p className="text-sm text-gray-500 mb-4">
              Fix the issues above, then save the product and use <strong>Resend</strong> to submit for approval again.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <h3 className="text-lg font-bold mb-1 text-gray-800">
              {editId ? "Edit Product" : "Add Product"}
            </h3>

            {isApprovedEditing && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 text-xs text-amber-800">
                <strong>Approved product.</strong> Only <strong>Price</strong>, <strong>Sale Price</strong>, <strong>Stock</strong> and images can be changed.
                All other fields are locked until admin re-reviews.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* ── Category ── */}
              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.cat_id}
                  disabled={isApprovedEditing}
                  onChange={(e) => {
                    const selectedCat = category.find((c) => c._id === e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      cat_id: selectedCat?._id || "",
                      cat_sec: selectedCat?.categoryName || "",
                      subCat_id: "",
                      subCategoryName: "",
                    }));
                  }}
                  className={`w-full border rounded p-2 text-sm ${lockedClass}`}
                >
                  <option value="">Select Category</option>
                  {category.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                  ))}
                </select>
              </div>

              {/* ── Subcategory ── */}
              {formData.cat_id && (
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm">
                    Subcategory <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.subCat_id}
                    disabled={isApprovedEditing}
                    onChange={(e) => {
                      const selectedCat = category.find((c) => c._id === formData.cat_id);
                      const selectedSub = selectedCat?.subCategories?.find((s) => s._id === e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        subCat_id: selectedSub?._id || "",
                        subCategoryName: selectedSub?.name || "",
                      }));
                    }}
                    className={`w-full border rounded p-2 text-sm ${lockedClass}`}
                  >
                    <option value="">Select Subcategory</option>
                    {category
                      .find((c) => c._id === formData.cat_id)
                      ?.subCategories?.map((sub) => (
                        <option key={sub._id} value={sub._id}>{sub.name}</option>
                      ))}
                  </select>
                </div>
              )}

              {/* ── Brand ── */}
              {formData.cat_id === CONTACT_LENS_CATEGORY_ID ? (
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm">
                    Contact Lens Brand <span className="text-gray-400">(Optional)</span>
                  </label>
                  <select
                    value={selectedBrand}
                    disabled={isApprovedEditing}
                    onChange={(e) => {
                      const b = contactLensBrands.find((b) => b._id === e.target.value);
                      setSelectedBrand(b?._id || "");
                      setSelectedBrandType(b?.type || "");
                    }}
                    className={`w-full border rounded p-2 text-sm ${lockedClass}`}
                  >
                    <option value="">Select Brand</option>
                    {contactLensBrands.map((b) => (
                      <option key={b._id} value={b._id}>{b.brand}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm">
                    Glasses Brand <span className="text-gray-400">(Optional)</span>
                  </label>
                  <select
                    value={selectedBrand}
                    disabled={isApprovedEditing}
                    onChange={(e) => {
                      const b = glassesBrands.find((b) => b._id === e.target.value);
                      setSelectedBrand(b?._id || "");
                      setSelectedBrandType(b?.type || "");
                    }}
                    className={`w-full border rounded p-2 text-sm ${lockedClass}`}
                  >
                    <option value="">Select Brand</option>
                    {glassesBrands.map((b) => (
                      <option key={b._id} value={b._id}>{b.brand}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* ── Product Name ── */}
              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="product_name"
                  disabled={isApprovedEditing}
                  value={formData.product_name.toUpperCase()}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className={`w-full border p-2 rounded text-sm ${lockedClass}`}
                />
              </div>

              {/* ── Sizes ── */}
              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm">Product Sizes</label>
                <div className="flex gap-4">
                  {["S", "M", "L"].map((size) => (
                    <label key={size} className={`flex items-center gap-1.5 text-sm ${isApprovedEditing ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                      <input
                        type="checkbox"
                        value={size}
                        disabled={isApprovedEditing}
                        checked={formData.product_size.includes(size)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData((prev) => ({ ...prev, product_size: [...prev.product_size, size] }));
                          } else {
                            setFormData((prev) => ({ ...prev, product_size: prev.product_size.filter((s) => s !== size) }));
                          }
                        }}
                      />
                      {size}
                    </label>
                  ))}
                </div>
              </div>

              {/* ── Colors ── */}
              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm">Product Colors</label>
                <input
                  type="text"
                  name="product_color"
                  disabled={isApprovedEditing}
                  value={formData.product_color.join(", ")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      product_color: e.target.value.split(",").map((c) => c.trim()).filter(Boolean),
                    }))
                  }
                  placeholder="Black, Red, Blue"
                  className={`w-full border p-2 rounded text-sm ${lockedClass}`}
                />
              </div>

              {/* ── Pricing ── */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="product_price"
                    value={formData.product_price || ""}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full border p-2 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm">Sale Price</label>
                  <input
                    type="number"
                    name="product_sale_price"
                    value={formData.product_sale_price || ""}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full border p-2 rounded text-sm"
                  />
                </div>
              </div>


              {/* ── Unit (non-contact lens only — read-only "Piece") ── */}
              {formData.cat_id !== CONTACT_LENS_CATEGORY_ID && formData.cat_id && (
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm">Unit</label>
                  <input
                    type="text"
                    value="Piece"
                    readOnly
                    className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed text-sm"
                  />
                </div>
              )}

              {/* ── Description ── */}
              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm">
                  Product Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="product_description"
                  disabled={isApprovedEditing}
                  value={formData.product_description}
                  onChange={handleChange}
                  placeholder="Describe your product..."
                  className={`w-full border p-2 rounded h-20 text-sm ${lockedClass}`}
                />
              </div>

              {/* ── Gender ── */}
              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm">Gender</label>
                <select
                  name="gender"
                  disabled={isApprovedEditing}
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full border p-2 rounded text-sm ${lockedClass}`}
                >
                  <option value="">Select Gender</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Kids">Kids</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>

              {/* ── Best Seller & Trending ── */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    name="isBestSeller"
                    checked={formData.isBestSeller}
                    onChange={handleChange}
                  />
                  <span className="font-medium">Best Seller</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    name="isTrending"
                    checked={formData.isTrending}
                    onChange={handleChange}
                  />
                  <span className="font-medium">Trending Product</span>
                </label>
              </div>

              {/* Sunglasses Fields */}
              {formData.cat_id !== "6915735feeb23fa59c7d532b" && (
                <div>
                  <h4 className="text-black font-bold mt-5 mb-3">
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
                        value={formData.frame_material}
                        onChange={handleChange}
                        placeholder="e.g., Metal, Plastic"
                        className="w-full border p-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Frame Shape
                      </label>
                      <input
                        type="text"
                        name="frame_shape"
                        value={formData.frame_shape}
                        onChange={handleChange}
                        placeholder="e.g., Round, Square"
                        className="w-full border p-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Face Shape
                      </label>
                      <input
                        type="text"
                        name="face_shape"
                        value={formData.face_shape}
                        onChange={handleChange}
                        placeholder="e.g., Round, Square, Oval, Heart..."
                        className="w-full border p-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Frame Color
                      </label>
                      <input
                        type="text"
                        name="frame_color"
                        value={formData.frame_color}
                        onChange={handleChange}
                        placeholder="e.g., Black, Silver"
                        className="w-full border p-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Frame Fit
                      </label>
                      <input
                        type="text"
                        name="frame_fit"
                        value={formData.frame_fit}
                        onChange={handleChange}
                        placeholder="e.g., Regular, Wide"
                        className="w-full border p-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Lens Width
                      </label>
                      <input
                        type="text"
                        name="lens_width"
                        value={formData.lens_width}
                        onChange={handleChange}
                        placeholder="e.g., 30mm, 1.85in"
                        className="w-full border p-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Bridge Width
                      </label>
                      <input
                        type="text"
                        name="bridge_width"
                        value={formData.bridge_width}
                        onChange={handleChange}
                        placeholder="e.g., 15 mm / 0.59 in"
                        className="w-full border p-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Lens Hieght
                      </label>
                      <input
                        type="text"
                        name="lens_hieght"
                        value={formData.lens_hieght}
                        onChange={handleChange}
                        placeholder="e.g., 35.5 mm / 1.40 in"
                        className="w-full border p-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Temple Length
                      </label>
                      <input
                        type="text"
                        name="temple_length"
                        value={formData.temple_length}
                        onChange={handleChange}
                        placeholder="e.g., 125 mm / 4.92 in"
                        className="w-full border p-2 rounded"
                      />
                    </div>
                  </div>

                </div>
              )}

              {/* Shipping Dimensions — shown for all non-contact-lens products */}
              {formData.cat_id !== "6915735feeb23fa59c7d532b" && (
                <div>
                  <h4 className="text-black font-bold mt-5 mb-3">
                    Shipping Dimensions
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Weight (lbs)
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="e.g., 0.5"
                        step="0.1"
                        min="0.1"
                        className="w-full border p-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Length (inches)
                      </label>
                      <input
                        type="number"
                        name="length"
                        value={formData.length}
                        onChange={handleChange}
                        placeholder="e.g., 10"
                        step="0.1"
                        min="0.1"
                        className="w-full border p-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Width (inches)
                      </label>
                      <input
                        type="number"
                        name="width"
                        value={formData.width}
                        onChange={handleChange}
                        placeholder="e.g., 8"
                        step="0.1"
                        min="0.1"
                        className="w-full border p-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Height (inches)
                      </label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        placeholder="e.g., 6"
                        step="0.1"
                        min="0.1"
                        className="w-full border p-2 rounded"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Lens Fields */}
              {formData.cat_id === "6915735feeb23fa59c7d532b" && (
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
                        value={formData.lens_type}
                        onChange={handleChange}
                        placeholder="Daily/Monthly"
                        className="w-full border p-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Material
                      </label>
                      <input
                        type="text"
                        name="material"
                        value={formData.material}
                        onChange={handleChange}
                        placeholder="e.g., Silicone Hydrogel"
                        className="w-full border p-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Manufacturer
                      </label>
                      <input
                        type="text"
                        name="manufacturer"
                        value={formData.manufacturer}
                        onChange={handleChange}
                        placeholder="e.g., Bausch & Lomb"
                        className="w-full border p-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Water Content (%)
                      </label>
                      <input
                        type="text"
                        name="water_content"
                        value={formData.water_content}
                        onChange={handleChange}
                        placeholder="e.g., 40"
                        className="w-full border p-2 rounded"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Lens Packs Section */}
              {formData.cat_id === "6915735feeb23fa59c7d532b" && (
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
                            value={pack.packSize}
                            onChange={(e) => {
                              const updated = [...lensPacks];
                              updated[index].packSize = e.target.value;
                              setLensPacks(updated);
                            }}
                            className="w-full border p-2 rounded"
                            placeholder="Ex: 30, 90"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-medium mb-1">
                            Old Price
                          </label>
                          <input
                            type="number"
                            value={pack.oldPrice}
                            onChange={(e) => {
                              const updated = [...lensPacks];
                              updated[index].oldPrice = e.target.value;
                              setLensPacks(updated);
                            }}
                            className="w-full border p-2 rounded"
                            placeholder="Ex: 499"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-medium mb-1">
                            Sale Price
                          </label>
                          <input
                            type="number"
                            value={pack.salePrice}
                            onChange={(e) => {
                              const updated = [...lensPacks];
                              updated[index].salePrice = e.target.value;
                              setLensPacks(updated);
                            }}
                            className="w-full border p-2 rounded"
                            placeholder="Ex: 399"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
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
                        onClick={() => {
                          const updated = lensPacks.filter(
                            (_, i) => i !== index
                          );
                          setLensPacks(updated);
                        }}
                        className="mt-2 text-red-600"
                      >
                        Remove Pack
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
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
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    + Add Pack Size
                  </button>
                </div>
              )}

              {/* ── Lens Details ── */}
              <div className="border-t pt-4">
                <h4 className="text-gray-700 font-bold mb-3 text-sm">Lens Details</h4>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1 text-sm">Lens Title 1</label>
                    <input type="text" name="product_lens_title1" disabled={isApprovedEditing}
                      value={formData.product_lens_title1} onChange={handleChange}
                      placeholder="e.g., Anti-Reflective"
                      className={`w-full border p-2 rounded text-sm ${lockedClass}`} />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1 text-sm">Lens Description 1</label>
                    <input type="text" name="product_lens_description1" disabled={isApprovedEditing}
                      value={formData.product_lens_description1} onChange={handleChange}
                      placeholder="Description"
                      className={`w-full border p-2 rounded text-sm ${lockedClass}`} />
                  </div>
                </div>

                {/* Lens Image 1 */}
                <div className="mb-3">
                  <label className="block text-gray-700 font-medium mb-1 text-sm">Lens Image 1</label>
                  <input type="file" accept="image/*" onChange={(e) => setLensImage1(e.target.files[0])} className="w-full border p-2 rounded text-sm" />
                  {lensImage1 && (
                    <div className="relative inline-block mt-2">
                      <img src={typeof lensImage1 === "string" ? lensImage1 : URL.createObjectURL(lensImage1)} alt="lens1" className="w-20 h-20 object-cover rounded border" />
                      <button type="button" onClick={() => setLensImage1(null)} className="absolute top-0 right-0 bg-[#f00000] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✕</button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1 text-sm">Lens Title 2</label>
                    <input type="text" name="product_lens_title2" disabled={isApprovedEditing}
                      value={formData.product_lens_title2} onChange={handleChange}
                      placeholder="e.g., UV Protection"
                      className={`w-full border p-2 rounded text-sm ${lockedClass}`} />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1 text-sm">Lens Description 2</label>
                    <input type="text" name="product_lens_description2" disabled={isApprovedEditing}
                      value={formData.product_lens_description2} onChange={handleChange}
                      placeholder="Description"
                      className={`w-full border p-2 rounded text-sm ${lockedClass}`} />
                  </div>
                </div>

                {/* Lens Image 2 */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm">Lens Image 2</label>
                  <input type="file" accept="image/*" onChange={(e) => setLensImage2(e.target.files[0])} className="w-full border p-2 rounded text-sm" />
                  {lensImage2 && (
                    <div className="relative inline-block mt-2">
                      <img src={typeof lensImage2 === "string" ? lensImage2 : URL.createObjectURL(lensImage2)} alt="lens2" className="w-20 h-20 object-cover rounded border" />
                      <button type="button" onClick={() => setLensImage2(null)} className="absolute top-0 right-0 bg-[#f00000] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✕</button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Color Variants ── */}
              <div className="border-t pt-4">
                <h4 className="text-gray-700 font-bold mb-3 text-sm">Color Variants & Images</h4>

                {colorVariants.map((variant, index) => {
                  const isValidColor = (() => {
                    try { const s = new Option().style; s.color = variant.colorName; return s.color !== ""; } catch { return false; }
                  })();

                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 mb-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 mr-2">
                          <label className="block text-gray-700 font-medium mb-1 text-sm">Color Name {index + 1}</label>
                          <input
                            type="text"
                            placeholder="e.g., Blue or #0000ff"
                            value={variant.colorName}
                            onChange={(e) => {
                              const updated = [...colorVariants];
                              updated[index].colorName = e.target.value;
                              setColorVariants(updated);
                            }}
                            className="border p-2 rounded w-full text-sm capitalize"
                          />
                        </div>
                        <button type="button" onClick={() => setColorVariants(colorVariants.filter((_, i) => i !== index))}
                          className="text-[#f00000] text-xs mt-6 hover:underline">Remove</button>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-1 text-sm">
                          Images for {variant.colorName || `Color ${index + 1}`}
                        </label>
                        <input
                          type="file" multiple accept="image/*"
                          disabled={!variant.colorName?.trim()}
                          onChange={(e) => {
                            const updated = [...colorVariants];
                            if (!updated[index].colorName?.trim()) {
                              Swal.fire("Error", "Enter color name before uploading images", "error");
                              e.target.value = "";
                              return;
                            }
                            updated[index].files = [...(updated[index].files || []), ...Array.from(e.target.files)];
                            setColorVariants(updated);
                          }}
                          className="w-full border p-2 rounded text-sm"
                        />
                      </div>

                      {(variant.existingImages?.length > 0 || variant.files?.length > 0) && (
                        <>
                          <div className="flex items-center gap-2 mt-3 mb-2">
                            <span className="w-4 h-4 rounded-full border border-gray-400"
                              style={{ backgroundColor: isValidColor ? variant.colorName : "transparent" }} />
                            <span className="text-gray-700 font-semibold text-xs capitalize">
                              {variant.colorName || "Color"} Images
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {variant.existingImages?.map((img, i) => (
                              <div key={`e-${i}`} className="relative">
                                <img src={img} alt="" className="w-14 h-14 object-cover rounded border" />
                                <button type="button" onClick={() => {
                                  const updated = [...colorVariants];
                                  updated[index].existingImages = updated[index].existingImages.filter((_, idx) => idx !== i);
                                  setColorVariants(updated);
                                }} className="absolute -top-1 -right-1 bg-[#f00000] text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">✕</button>
                                <span className="absolute bottom-0 left-0 bg-black/70 text-white text-xs px-1 rounded">Old</span>
                              </div>
                            ))}
                            {variant.files?.map((file, i) => (
                              <div key={`n-${i}`} className="relative">
                                <img src={URL.createObjectURL(file)} alt="" className="w-14 h-14 object-cover rounded border" />
                              </div>
                            ))}
                          </div>
                          <button type="button" onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file"; input.multiple = true; input.accept = "image/*";
                            input.onchange = (e) => {
                              const updated = [...colorVariants];
                              updated[index].files = [...(updated[index].files || []), ...Array.from(e.target.files)];
                              setColorVariants(updated);
                            };
                            input.click();
                          }} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs mt-2">
                            + Add More Images
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setColorVariants([...colorVariants, { colorName: "", files: [], existingImages: [] }])}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                >
                  + Add Color Variant
                </button>
              </div>

              {/* ── Form Actions ── */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setOpen(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 text-sm">
                  Cancel
                </button>
                <button type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-semibold">
                  {editId ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>

            {/* Close X */}
            <button onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-[#f00000] text-2xl">
              <IoIosCloseCircle />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProducts;