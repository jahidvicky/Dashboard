import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import API, { IMAGE_URL } from "../../API/Api";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";

const Products = () => {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState([]);
  const [colorVariants, setColorVariants] = useState([]);
  const [keptImages, setKeptImages] = useState([]);
  const [lensImage1, setLensImage1] = useState(null);
  const [lensImage2, setLensImage2] = useState(null);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSubCategory, setFilterSubCategory] = useState("");
  const [contactLensBrands, setContactLensBrands] = useState([]);
  const [glassesBrands, setglassesBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedBrandType, setSelectedBrandType] = useState("");

  const [formData, setFormData] = useState({
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
  });
  const [editId, setEditId] = useState(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await API.get("/getAllProduct");
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err)
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await API.get("/getcategories");
      setCategory(res.data.categories || []);
      console.log(res);
    } catch (err) {
      console.error(err)
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Pagination + Filtering Logic
  const filteredProducts = products.filter((pro) => {
    const matchCategory = filterCategory ? pro.cat_id?.toString() === filterCategory : true;
    const matchSubCategory = filterSubCategory ? pro.subCat_id?.toString() === filterSubCategory : true;

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

  const fetchBrands = async () => {
    try {
      const res = await API.get("/getBrand");
      const allBrands = res.data.data || [];

      // Filter brands where type is "Contact Lenses"
      const filteredBrands = allBrands.filter(
        (brand) => brand.type === "Contact Lenses"
      );
      const filteredGlassesBrand = allBrands.filter(
        (brand) => brand.type === "Glasses"
      );

      setContactLensBrands(filteredBrands);
      setglassesBrands(filteredGlassesBrand);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  const openAddModal = () => {
    setFormData({
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
    });
    setKeptImages([]);
    setLensImage1(null);
    setLensImage2(null);
    setEditId(null);
    setOpen(true);
    setColorVariants([]);
  };

  const openEditModal = (product) => {
    // ✅ Fill general product fields
    setFormData({
      cat_id: product.cat_id || "",
      cat_sec: product.cat_sec || "",
      subCat_id: product.subCat_id || "",
      subCategoryName: product.subCategoryName || "",
      product_name: product.product_name || "",
      isBestSeller: product.isBestSeller || false,
      isTrending: product.isTrending || false,
      product_size: product.product_size
        ? product.product_size.flatMap((item) =>
          item.split(",").map((s) => s.trim())
        )
        : [],
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
    });

    // ✅ Prefill Color Variants from product_variants
    if (product.product_variants && product.product_variants.length > 0) {
      const variants = product.product_variants.map((variant) => ({
        colorName: variant.colorName || "",
        files: [], // New uploads will go here
        existingImages:
          (variant.images || []).map((img) =>
            img.startsWith("http") ? img : IMAGE_URL + img
          ) || [],
      }));
      setColorVariants(variants);
    } else {
      setColorVariants([]); // If no color variants found
    }

    // ✅ Keep any main product images (if you still have them)
    setKeptImages(
      product.product_image_collection?.map((img) =>
        img.startsWith("http") ? img : IMAGE_URL + img
      ) || []
    );

    // ✅ Lens images (optional)
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

    // ✅ Open modal in edit mode
    setEditId(product._id);
    setSelectedBrand(product.brand_id || "");
    setSelectedBrandType(product.brand_type || "");
    setOpen(true);
  };

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

      // 🔹 Basic product fields
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
        if (formData[field]) payload.append(field, formData[field]);
      });

      payload.append("stockAvailability", isNaN(stockValue) ? 0 : stockValue);
      payload.append("brand_id", selectedBrand || "");
      payload.append("isBestSeller", formData.isBestSeller);
      payload.append("isTrending", formData.isTrending);

      // 🔹 Product sizes (array)
      if (formData.product_size?.length) {
        formData.product_size.forEach((size) =>
          payload.append("product_size[]", size)
        );
      }

      // 🔹 Product colors (array)
      if (formData.product_color?.length) {
        formData.product_color.forEach((color) =>
          payload.append("product_color[]", color)
        );
      }

      // 🔹 Color variant data (JSON part)
      const colorDataArray = colorVariants.map((variant) => ({
        colorName: variant.colorName.trim(),
        images:
          variant.existingImages?.map((img) =>
            img.replace(IMAGE_URL, "")
          ) || [],
      }));
      payload.append("colorData", JSON.stringify(colorDataArray));

      // 🔹 Add actual color image files (multer reads by color key)
      colorVariants.forEach((variant) => {
        const colorKey = variant.colorName.trim().toLowerCase();
        if (!colorKey) return;
        variant.files?.forEach((file) => {
          payload.append(colorKey, file);
        });
      });

      // 🔹 Lens images
      if (lensImage1 && typeof lensImage1 !== "string")
        payload.append("product_lens_image1", lensImage1);
      if (lensImage2 && typeof lensImage2 !== "string")
        payload.append("product_lens_image2", lensImage2);

      // 🔹 Submit to backend
      if (editId) {
        await API.put(`/updateProduct/${editId}`, payload, {
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
                setFilterSubCategory(""); // Reset subcategory when category changes
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
                  {pro?.product_image_collection?.length || pro?.product_variants?.[0]?.images?.length ? (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {/* Show only the first available image */}
                      <img
                        src={
                          (
                            pro?.product_image_collection?.[0] ||
                            pro?.product_variants?.[0]?.images?.[0]
                          ).startsWith("http")
                            ? (
                              pro?.product_image_collection?.[0] ||
                              pro?.product_variants?.[0]?.images?.[0]
                            )
                            : IMAGE_URL + (
                              pro?.product_image_collection?.[0] ||
                              pro?.product_variants?.[0]?.images?.[0]
                            )
                        }
                        alt="product"
                        className="w-20 h-12 object-cover rounded"
                      />
                    </div>
                  ) : (
                    "No Images"
                  )}
                </td>
                <td className="border space-x-1 mx-1">
                  <button
                    onClick={() => openEditModal(pro)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 hover:cursor-pointer text-center"
                  >
                    <FaEdit />
                  </button>
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

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editId ? "Edit Product" : "Add Product"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Category dropdown */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.cat_id}
                  onChange={(e) => {
                    const selectedCat = category.find(
                      (c) => c._id === e.target.value
                    );
                    setFormData({
                      ...formData,
                      cat_id: selectedCat?._id || "",
                      cat_sec: selectedCat?.categoryName || "",
                      subCat_id: "",
                      subCategoryName: "",
                    });
                  }}
                  className="w-full border rounded p-2"
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
                    onChange={(e) => {
                      const selectedCat = category.find(
                        (c) => c._id === formData.cat_id
                      );

                      const selectedSub = selectedCat?.subCategories?.find(
                        (sub) => sub._id === e.target.value
                      );

                      setFormData({
                        ...formData,
                        subCat_id: selectedSub?._id || "",
                        subCategoryName: selectedSub?.name || "",
                      });
                    }}
                    className="w-full border rounded p-2"
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

              {/* Brand dropdown */}
              {formData.cat_id === "6915735feeb23fa59c7d532b" && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Contact Lenses Brand <span className="text-gray-500">(Optional)</span>
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => {
                      const selected = contactLensBrands.find(
                        (b) => b._id === e.target.value
                      );
                      setSelectedBrand(selected?._id || "");
                      setSelectedBrandType(selected?.type || "");
                    }}
                    className="w-full border rounded p-2"
                  >
                    <option value="">Select Brand</option>
                    {contactLensBrands.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.brand}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Brand dropdown for Glasses */}
              {formData.cat_id !== "6915735feeb23fa59c7d532b" && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Glasses Brand <span className="text-gray-500">(Optional)</span>
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => {
                      const selected = glassesBrands.find(
                        (b) => b._id === e.target.value
                      );
                      setSelectedBrand(selected?._id || "");
                      setSelectedBrandType(selected?.type || "");
                    }}
                    className="w-full border rounded p-2"
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
                  value={formData.product_name.toUpperCase()}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className="w-full border p-2 rounded"
                />
              </div>

              {/* Product Sizes */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Product Sizes
                </label>
                <div className="flex gap-4">
                  {["S", "M", "L"].map((size) => (
                    <label key={size} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        value={size}
                        checked={formData.product_size.includes(size)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              product_size: [...formData.product_size, size],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              product_size: formData.product_size.filter(
                                (s) => s !== size
                              ),
                            });
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
                  value={formData.product_color.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      product_color: e.target.value
                        .split(",")
                        .map((c) => c.trim()),
                    })
                  }
                  placeholder="Enter colors (Black, Red, Blue)"
                  className="w-full border p-2 rounded"
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

              {/* Stock Availability */}
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

              {/* Product Description */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Product Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="product_description"
                  value={formData.product_description}
                  onChange={handleChange}
                  placeholder="Enter product description"
                  className="w-full border p-2 rounded h-20"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select Gender</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>

              {/* Best Seller & Trending */}
              <div className="grid grid-cols-2 gap-4 mt-4">

                {/* Best Seller */}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) =>
                      setFormData({ ...formData, isBestSeller: e.target.checked })
                    }
                  />
                  <span className="font-medium">Best Seller</span>
                </label>

                {/* Trending */}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isTrending}
                    onChange={(e) =>
                      setFormData({ ...formData, isTrending: e.target.checked })
                    }
                  />
                  <span className="font-medium">Trending Product</span>
                </label>

              </div>


              {/* Sunglasses Fields */}
              {formData.cat_id !== "6915735feeb23fa59c7d532b" && (
                <div>
                  <h4 className="text-gray-700 font-semibold mb-3">Frame Details</h4>
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
                  </div>
                </div>
              )}

              {/* Contact Lens Fields */}
              {formData.cat_id === "6915735feeb23fa59c7d532b" && (
                <div>
                  <h4 className="text-gray-700 font-semibold mb-3">Contact Lens Details</h4>
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

              {/* Lens Fields */}
              <div>
                <h4 className="text-gray-700 font-semibold mb-3">Lens Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Lens Title 1
                    </label>
                    <input
                      type="text"
                      name="product_lens_title1"
                      value={formData.product_lens_title1}
                      onChange={handleChange}
                      placeholder="e.g., Anti-Reflective"
                      className="w-full border p-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Lens Description 1
                    </label>
                    <input
                      type="text"
                      name="product_lens_description1"
                      value={formData.product_lens_description1}
                      onChange={handleChange}
                      placeholder="Description"
                      className="w-full border p-2 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Lens Image 1 */}
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
                    value={formData.product_lens_title2}
                    onChange={handleChange}
                    placeholder="e.g., UV Protection"
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Lens Description 2
                  </label>
                  <input
                    type="text"
                    name="product_lens_description2"
                    value={formData.product_lens_description2}
                    onChange={handleChange}
                    placeholder="Description"
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>

              {/* Lens Image 2 */}
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

              {/* ✅ Color Variants Section */}
              <div className="mt-4 border-t pt-4">
                <h4 className="text-gray-700 font-semibold mb-3">Color Variants</h4>

                {colorVariants.map((variant, index) => {
                  // 🎨 Check valid color name or hex for preview
                  const isValidColor = (() => {
                    const s = new Option().style;
                    s.color = variant.colorName;
                    return s.color !== "";
                  })();

                  return (
                    <div
                      key={index}
                      className="border border-gray-300 rounded-lg p-3 mb-4 bg-gray-50 shadow-sm"
                    >
                      {/* 🔹 Color name + remove button */}
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex-1">
                          <label className="block text-gray-700 font-medium mb-2">
                            Color Name {index + 1}
                          </label>
                          <input
                            type="text"
                            placeholder="Enter Color (e.g. Blue or #0000ff)"
                            value={variant.colorName}
                            onChange={(e) => {
                              const updated = [...colorVariants];
                              updated[index].colorName = e.target.value.trim();
                              setColorVariants(updated);
                            }}
                            className="border p-2 rounded w-full capitalize"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setColorVariants(colorVariants.filter((_, i) => i !== index))
                          }
                          className="text-[#f00000] text-sm hover:underline ml-2"
                        >
                          Remove
                        </button>
                      </div>

                      {/* 🖼️ Upload color images */}
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Upload Images for {variant.colorName || `Color ${index + 1}`}
                        </label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          disabled={!variant.colorName.trim()}
                          onChange={(e) => {
                            const updated = [...colorVariants];
                            const variant = updated[index];

                            // 🚨 Require color name before allowing file upload
                            if (!variant.colorName.trim()) {
                              Swal.fire("Error", "Please enter color name before uploading images!", "error");
                              e.target.value = "";
                              return;
                            }

                            const newFiles = Array.from(e.target.files);
                            variant.files = [...(variant.files || []), ...newFiles];
                            setColorVariants(updated);
                          }}
                          className="w-full border p-2 rounded"
                        />
                      </div>

                      {/* 🏷️ Color preview label */}
                      {(variant.existingImages?.length > 0 || variant.files?.length > 0) && (
                        <div className="flex items-center gap-2 mt-4 mb-2">
                          <span
                            className="w-5 h-5 rounded-full border border-gray-400"
                            style={{
                              backgroundColor: isValidColor ? variant.colorName : "transparent",
                            }}
                            title={
                              isValidColor
                                ? variant.colorName
                                : "Invalid color name or code"
                            }
                          ></span>
                          <h4 className="text-gray-800 font-semibold">
                            {variant.colorName
                              ? `${variant.colorName.charAt(0).toUpperCase() + variant.colorName.slice(1)} Images`
                              : "Color Images"}
                          </h4>
                        </div>
                      )}

                      {/* ✅ Preview Section (Existing + New) */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {/* Existing images */}
                        {variant.existingImages?.map((img, i) => (
                          <div key={`existing-${i}`} className="relative group">
                            <img
                              src={img}
                              alt="existing variant"
                              className="w-16 h-16 object-cover rounded border"
                            />
                            {/* ❌ Remove existing image */}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...colorVariants];
                                updated[index].existingImages = updated[index].existingImages.filter(
                                  (_, idx) => idx !== i
                                );
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

                        {/* New uploaded images */}
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

                      {/* ➕ Add more images button */}
                      {(variant.existingImages?.length > 0 || variant.files?.length > 0) && (
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
                  onClick={() =>
                    setColorVariants([...colorVariants, { colorName: "", files: [], existingImages: [] }])
                  }
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
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