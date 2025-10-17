import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import API, { IMAGE_URL } from "../../API/Api";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";

const Products = () => {
    const [open, setOpen] = useState(false);
    const [category, setCategory] = useState([]);
    const [images, setImages] = useState([]);
    const [keptImages, setKeptImages] = useState([]);
    const [lensImage1, setLensImage1] = useState(null);
    const [lensImage2, setLensImage2] = useState(null);
    const [products, setProducts] = useState([]);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [rejectionMessage, setRejectionMessage] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [formData, setFormData] = useState({
        cat_id: "",
        cat_sec: "",
        subCat_id: "",
        subCategoryName: "",
        product_name: "",
        product_sku: "",
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
        type: "",
        material: "",
        manufacturer: "",
        water_content: "",
        stockAvailability: "",
    });
    const [editId, setEditId] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // rows per page


    // filter peoduct with Pagination logic
    const filteredProducts =
        statusFilter === "All"
            ? products
            : products.filter((pro) => pro.productStatus === statusFilter);

    const indexOfLastProduct = currentPage * itemsPerPage
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const handlePageClick = (page) => setCurrentPage(page);

    // Fetch products (only pending & not sent for approval)
    const fetchVendorProducts = async () => {
        try {
            const res = await API.get("/getVendorProduct");
            setProducts(res.data.products);
        } catch (err) {
            Swal.fire("Error", "Failed to fetch products", "error");
        }
    };

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const res = await API.get("/getcategories");
            setCategory(res.data.categories || []);
        } catch (err) {
            Swal.fire("Error", "Failed to fetch categories", "error");
        }
    };

    useEffect(() => {
        fetchVendorProducts();
        fetchCategories();
    }, []);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Image handlers
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages((prev) => [...prev, ...files]);
    };
    const removeNewImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));
    const removeExistingImage = (idx) => setKeptImages((prev) => prev.filter((_, i) => i !== idx));

    const openAddModal = () => {
        setOpen(true);
        setEditId(null);
        setEditingProduct(null);
        setFormData({
            cat_id: "",
            cat_sec: "",
            subCat_id: "",
            subCategoryName: "",
            product_name: "",
            product_sku: "",
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
            type: "",
            material: "",
            manufacturer: "",
            water_content: "",
            stockAvailability: "",
        });
        setImages([]);
        setKeptImages([]);
        setLensImage1(null);
        setLensImage2(null);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            cat_id: product.cat_id || "",
            cat_sec: product.cat_sec || "",
            subCat_id: product.subCat_id || "",
            subCategoryName: product.subCategoryName || "",
            product_name: product.product_name || "",
            product_sku: product.product_sku || "",
            product_price: product.product_price || "",
            product_sale_price: product.product_sale_price || "",
            product_description: product.product_description || "",
            gender: product.gender || "",
            frame_material: product.frame_material || "",
            frame_shape: product.frame_shape || "",
            frame_color: product.frame_color || "",
            frame_fit: product.frame_fit || "",
            product_lens_title1: product.product_lens_title1 || "",
            product_lens_description1: product.product_lens_description1 || "",
            product_lens_title2: product.product_lens_title2 || "",
            product_lens_description2: product.product_lens_description2 || "",
            type: product.contact_type || "",
            material: product.material || "",
            manufacturer: product.manufacturer || "",
            water_content: product.water_content || "",
            stockAvailability: product.stockAvailability || "",
        });
        setKeptImages(
            product.product_image_collection?.map((img) =>
                img.startsWith("http") ? img : IMAGE_URL + img
            ) || []
        );
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
        setImages([]);
        setEditId(product._id);
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
                    fetchVendorProducts();
                } catch (err) {
                    Swal.fire("Error", "Failed to delete product", "error");
                }
            }
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = new FormData();

            // Append all fields except stockAvailability
            Object.keys(formData).forEach((key) => {
                if (key !== "stockAvailability") {
                    payload.append(key, formData[key] ?? "");
                }
            });

            // Append stockAvailability only if user entered it
            const stock = formData.stockAvailability;
            if (stock !== "" && stock !== null && stock !== undefined) {
                payload.append("stockAvailability", stock.toString());
            }

            // Existing images
            keptImages.forEach((img) =>
                payload.append("existingImages", img.replace(IMAGE_URL, ""))
            );

            // New images
            images.forEach((file) =>
                payload.append("product_image_collection", file)
            );

            // Lens images
            if (lensImage1 && typeof lensImage1 !== "string")
                payload.append("product_lens_image1", lensImage1);
            if (lensImage2 && typeof lensImage2 !== "string")
                payload.append("product_lens_image2", lensImage2);

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
            fetchVendorProducts();
            setOpen(false);
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || "Operation failed", "error");
        }
    };

    const handleSendApproval = async (productId) => {
        try {
            const response = await API.put(`/products/send-for-approval/${productId}`);
            if (response.data) {
                Swal.fire({
                    toast: true,
                    icon: 'success',
                    title: 'Product sent for approval successfully!',
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
                fetchVendorProducts();
            } else {
                Swal.fire({
                    toast: true,
                    icon: 'failed',
                    title: 'Something went wrong while sending for approval!',
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                toast: true,
                icon: 'failed',
                title: 'Server error. Please try again later!',
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">

                {/* Dropdown filter */}
                <div className="mb-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="border border-gray-400 rounded p-2"
                    >
                        <option value="All">All</option>
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 hover:cursor-pointer"
                >
                    <FaPlus className="inline mr-2" /> Add Product
                </button>
            </div>

            {/* Product Table */}
            <table className="hidden md:block relative overflow-y-auto max-h-[560px] w-full mt-6 border rounded-lg">
                <thead className="sticky top-0 z-10 bg-black text-white font-semibold">
                    <tr>
                        <th className="px-4 py-2 text-center">Name</th>
                        <th className="px-4 py-2 text-center">Price</th>
                        <th className="px-4 py-2 text-center">Sale Price</th>
                        <th className="px-4 py-2 text-center">Category</th>
                        <th className="px-4 py-2 text-center">Subcategory</th>
                        <th className="px-4 py-2 text-center">Image(s)</th>
                        <th className="px-4 py-2 text-center">Product Status</th>
                        <th className="px-4 py-2 text-center">Actions</th>
                    </tr>
                </thead>

                <tbody className="bg-white">
                    {currentProducts.length > 0 ? (
                        currentProducts.map((pro) => (
                            <tr key={pro._id} className="text-center hover:bg-gray-50">
                                <td className="border px-4 py-2 capitalize">{pro.product_name}</td>
                                <td className="border px-4 py-2">{pro.product_price}</td>
                                <td className="border px-4 py-2">{pro.product_sale_price}</td>
                                <td className="border px-4 py-2">{pro.cat_sec}</td>
                                <td className="border px-4 py-2">{pro.subCategoryName}</td>
                                <td className="border px-4 py-2">
                                    {pro.product_image_collection?.length ? (
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {pro.product_image_collection.map((img, i) => (
                                                <img
                                                    key={i}
                                                    src={img.startsWith("http") ? img : IMAGE_URL + img}
                                                    alt="product"
                                                    className="w-20 h-12 object-cover rounded"
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        "No Images"
                                    )}
                                </td>
                                <td className="border px-4 py-2">{pro.productStatus}</td>
                                <td className="border px-4 py-2 space-x-1">
                                    {pro.productStatus !== "Rejected" && (
                                        <button
                                            onClick={() => openEditModal(pro)}
                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                        >
                                            <FaEdit />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (pro.productStatus === "Rejected") {
                                                setRejectionMessage(pro.rejectionReason || "This product was rejected.");
                                                setShowRejectionModal(true);
                                            } else {
                                                handleSendApproval(pro._id);
                                            }
                                        }}
                                        disabled={pro.isSentForApproval && pro.productStatus !== "Rejected"}
                                        className={`px-3 py-1 rounded text-white ${pro.productStatus === "Rejected"
                                            ? "bg-yellow-500 hover:bg-yellow-600"
                                            : pro.isSentForApproval
                                                ? "bg-red-400 cursor-not-allowed"
                                                : "bg-red-600 hover:bg-red-700"
                                            }`}
                                    >
                                        {pro.productStatus === "Rejected"
                                            ? "Show Message"
                                            : pro.isSentForApproval
                                                ? "Sent"
                                                : "Send For Approval"}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(pro._id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="py-4 text-center text-gray-500">
                                No products found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            {/* ===== PAGINATION ===== */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageClick(page)}
                            className={`px-3 py-1 rounded border ${currentPage === page
                                ? "bg-black text-white border-black"
                                : "bg-white border-gray-400 hover:bg-gray-100"
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}


            {showRejectionModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                        <h3 className="text-lg font-semibold mb-4 text-red-600">Product Rejected</h3>
                        <p className="text-gray-700 mb-6">{rejectionMessage}</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowRejectionModal(false)}
                                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 hover:cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Modal Form */}
            {
                open && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
                            <h3 className="text-lg font-semibold mb-4">{editId ? "Edit Product" : "Add Product"}</h3>
                            <form onSubmit={handleSubmit} className="space-y-3">
                                {/* Category dropdown */}
                                <div>
                                    <label className="block text-gray-700 mb-1">Category</label>
                                    <select
                                        value={formData.cat_id}
                                        disabled={editingProduct?.isSentForApproval}
                                        onChange={(e) => {
                                            const selectedCat = category.find((c) => c._id === e.target.value);
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
                                        <label className="block text-gray-700">Subcategory</label>
                                        <select
                                            value={formData.subCat_id}
                                            disabled={editingProduct?.isSentForApproval}
                                            onChange={(e) => {
                                                const selectedCat = category.find((c) => c._id === formData.cat_id);
                                                const selectedSub =
                                                    selectedCat?.subCategories?.find((s) => s._id === e.target.value) || null;
                                                const selectedName =
                                                    selectedCat?.subCategoryNames?.find((s) => s === e.target.value) || "";
                                                setFormData({
                                                    ...formData,
                                                    subCat_id: selectedSub?._id || selectedName || "",
                                                    subCategoryName: selectedSub?.name || selectedName || "",
                                                });
                                            }}
                                            className="w-full border rounded p-2"
                                        >
                                            <option value="">Select Subcategory</option>
                                            {category.find((c) => c._id === formData.cat_id)?.subCategories?.map((sub) => (
                                                <option key={sub._id} value={sub._id}>
                                                    {sub.name}
                                                </option>
                                            ))}
                                            {category.find((c) => c._id === formData.cat_id)?.subCategoryNames?.map((name, idx) => (
                                                <option key={idx} value={name}>
                                                    {name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <input
                                    type="text"
                                    name="product_name"
                                    value={formData.product_name.toUpperCase()}
                                    onChange={handleChange}
                                    placeholder="Product Name"
                                    className="w-full border p-2 rounded"
                                    disabled={editingProduct?.isSentForApproval}
                                />
                                <input
                                    type="text"
                                    name="product_sku"
                                    value={formData.product_sku}
                                    onChange={handleChange}
                                    placeholder="Product SKU"
                                    className="w-full border p-2 rounded"
                                    disabled={editingProduct?.isSentForApproval}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        name="product_price"
                                        value={formData.product_price || ""}
                                        onChange={handleChange}
                                        placeholder="Price"
                                        className="w-full border p-2 rounded"
                                    />
                                    <input
                                        type="number"
                                        name="product_sale_price"
                                        value={formData.product_sale_price || ""}
                                        onChange={handleChange}
                                        placeholder="Sale Price"
                                        className="w-full border p-2 rounded"
                                    />
                                </div>
                                <input
                                    type="number"
                                    name="stockAvailability"
                                    value={formData.stockAvailability ?? ""}
                                    onChange={handleChange}
                                    placeholder="Stock Availablity"
                                    className="w-full border p-2 rounded"
                                />

                                <textarea
                                    name="product_description"
                                    value={formData.product_description}
                                    onChange={handleChange}
                                    placeholder="Product Description"
                                    className="w-full border p-2 rounded"
                                    disabled={editingProduct?.isSentForApproval}
                                />

                                {/* Multiple Images */}
                                <label htmlFor="product_image" className="block text-gray-700">
                                    Product Image
                                </label>
                                <input
                                    id="product_image"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full border p-2 rounded"
                                    disabled={editingProduct?.isSentForApproval}
                                />
                                {/* Show kept old images */}
                                <div className="flex gap-2 flex-wrap mt-2">
                                    {keptImages.map((img, idx) => (
                                        <div key={idx} className="relative">
                                            <img
                                                src={img}
                                                alt="kept"
                                                className="w-16 h-16 object-cover rounded"
                                                disabled={editingProduct?.isSentForApproval}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(idx)}
                                                className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1 hover:cursor-pointer"
                                                disabled={editingProduct?.isSentForApproval}
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Show new uploaded previews */}
                                <div className="flex gap-2 flex-wrap mt-2">
                                    {images.map((file, idx) => (
                                        <div key={idx} className="relative">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt="new"
                                                className="w-16 h-16 object-cover rounded"
                                                disabled={editingProduct?.isSentForApproval}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(idx)}
                                                className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1 hover:cursor-pointer"
                                                disabled={editingProduct?.isSentForApproval}
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Gender */}
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded"
                                    disabled={editingProduct?.isSentForApproval}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Men">Men</option>
                                    <option value="Women">Women</option>
                                    <option value="Unisex">Unisex</option>
                                </select>

                                {/* Sunglasses Fields */}
                                {formData.subCategoryName !== "Contact Lenses" && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            name="frame_material"
                                            value={formData.frame_material}
                                            onChange={handleChange}
                                            placeholder="Frame Material"
                                            className="w-full border p-2 rounded"
                                            disabled={editingProduct?.isSentForApproval}
                                        />
                                        <input
                                            type="text"
                                            name="frame_shape"
                                            value={formData.frame_shape}
                                            onChange={handleChange}
                                            placeholder="Frame Shape"
                                            className="w-full border p-2 rounded"
                                            disabled={editingProduct?.isSentForApproval}
                                        />
                                        <input
                                            type="text"
                                            name="frame_color"
                                            value={formData.frame_color}
                                            onChange={handleChange}
                                            placeholder="Frame Color"
                                            className="w-full border p-2 rounded"
                                            disabled={editingProduct?.isSentForApproval}
                                        />
                                        <input
                                            type="text"
                                            name="frame_fit"
                                            value={formData.frame_fit}
                                            onChange={handleChange}
                                            placeholder="Frame Fit"
                                            className="w-full border p-2 rounded "
                                            disabled={editingProduct?.isSentForApproval}

                                        />
                                    </div>
                                )}

                                {/* Contact Lens Fields */}
                                {formData.subCategoryName === "Contact Lenses" && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                            placeholder="Lens Type (Daily/Monthly)"
                                            className="w-full border p-2 rounded"
                                            disabled={editingProduct?.isSentForApproval}
                                        />
                                        <input
                                            type="text"
                                            name="material"
                                            value={formData.material}
                                            onChange={handleChange}
                                            placeholder="Material"
                                            className="w-full border p-2 rounded"
                                            disabled={editingProduct?.isSentForApproval}
                                        />
                                        <input
                                            type="text"
                                            name="manufacturer"
                                            value={formData.manufacturer}
                                            onChange={handleChange}
                                            placeholder="Manufacturer"
                                            className="w-full border p-2 rounded"
                                            disabled={editingProduct?.isSentForApproval}
                                        />
                                        <input
                                            type="text"
                                            name="water_content"
                                            value={formData.water_content}
                                            onChange={handleChange}
                                            placeholder="Water Content (e.g., 55%)"
                                            className="w-full border p-2 rounded"
                                            disabled={editingProduct?.isSentForApproval}
                                        />
                                    </div>
                                )}

                                {/* Lens Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        name="product_lens_title1"
                                        value={formData.product_lens_title1}
                                        onChange={handleChange}
                                        placeholder="Lens Title 1"
                                        className="w-full border p-2 rounded"
                                        disabled={editingProduct?.isSentForApproval}
                                    />
                                    <input
                                        type="text"
                                        name="product_lens_description1"
                                        value={formData.product_lens_description1}
                                        onChange={handleChange}
                                        placeholder="Lens Description 1"
                                        className="w-full border p-2 rounded"
                                        disabled={editingProduct?.isSentForApproval}
                                    />
                                </div>

                                {/* Lens Image 1 */}
                                <div>
                                    <label className="block text-gray-700">Lens Image 1</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setLensImage1(e.target.files[0])}
                                        className="w-full border p-2 rounded"
                                        disabled={editingProduct?.isSentForApproval}
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
                                                className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1 hover:cursor-pointer"
                                            >
                                                X
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        name="product_lens_title2"
                                        value={formData.product_lens_title2}
                                        onChange={handleChange}
                                        placeholder="Lens Title 2"
                                        className="w-full border p-2 rounded"
                                        disabled={editingProduct?.isSentForApproval}
                                    />
                                    <input
                                        type="text"
                                        name="product_lens_description2"
                                        value={formData.product_lens_description2}
                                        onChange={handleChange}
                                        placeholder="Lens Description 2"
                                        className="w-full border p-2 rounded"
                                        disabled={editingProduct?.isSentForApproval}
                                    />
                                </div>

                                {/* Lens Image 2 */}
                                <div>
                                    <label className="block text-gray-700">Lens Image 2</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setLensImage2(e.target.files[0])}
                                        className="w-full border p-2 rounded"
                                        disabled={editingProduct?.isSentForApproval}
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
                                                className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1 hover:cursor-pointer"
                                            >
                                                X
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-2">
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
                                className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-2xl hover:cursor-pointer"
                            >
                                <IoIosCloseCircle />
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Products;
