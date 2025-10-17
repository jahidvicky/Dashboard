import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";
import API, { IMAGE_URL } from "../../API/Api";
import Swal from "sweetalert2";

const VendorProductDiscount = () => {
    const [products, setProducts] = useState([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [formData, setFormData] = useState({
        discountType: "",
        discountValue: "",
        discountedPrice: "",
    });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [calculatedPrice, setCalculatedPrice] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // rows per page

    // Pagination logic
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);

    const handlePageClick = (page) => setCurrentPage(page);

    // Fetch all vendor products
    const fetchAllProduct = async () => {
        try {
            const res = await API.get("/getVendorProduct");
            const productData = res.data.products.map((pro) => {
                // Calculate discountedPrice dynamically
                const basePrice = pro.product_sale_price || pro.product_price;
                let discountedPrice = basePrice;

                if (pro.discountType && pro.discountValue) {
                    const discount = parseFloat(pro.discountValue);
                    if (pro.discountType === "percentage") {
                        discountedPrice -= (discountedPrice * discount) / 100;
                    } else if (pro.discountType === "flat") {
                        discountedPrice -= discount;
                    }
                }

                if (discountedPrice < 0) discountedPrice = 0;

                return { ...pro, discountedPrice };
            });
            setProducts(productData);
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    };

    useEffect(() => {
        fetchAllProduct();
    }, []);

    // Open modal and prefill form
    const handleOpenModal = (product) => {
        setSelectedProduct(product);
        setFormData({
            discountType: product.discountType || "",
            discountValue: product.discountValue || "",
            discountedPrice: product.discountedPrice || "",
        });

        const basePrice = product.product_sale_price || product.product_price;
        setCalculatedPrice(basePrice.toFixed(2));
        setOpenAddModal(true);
    };

    // Update form state
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Live discounted price calculation
    useEffect(() => {
        if (!selectedProduct) return;

        const basePrice = selectedProduct.product_sale_price || selectedProduct.product_price;
        let finalPrice = basePrice;

        if (formData.discountType && formData.discountValue) {
            const discount = parseFloat(formData.discountValue);
            if (formData.discountType === "percentage") {
                finalPrice -= (finalPrice * discount) / 100;
            } else if (formData.discountType === "flat") {
                finalPrice -= discount;
            }
        }

        if (finalPrice < 0) finalPrice = 0;
        setCalculatedPrice(finalPrice.toFixed(2));
    }, [formData.discountType, formData.discountValue, selectedProduct]);

    // Submit discount
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProduct) return;

        try {
            const payload = {
                discountType: formData.discountType,
                discountValue: Number(formData.discountValue),
                discountedPrice: Number(calculatedPrice),
            };

            const res = await API.put(`/vendor-products/${selectedProduct._id}/discount`, payload);

            if (res.data.success) {
                Swal.fire({
                    title: "Success!",
                    text: "Discount updated successfully!",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                });
                setOpenAddModal(false);
                fetchAllProduct();
            } else {
                Swal.fire({
                    title: "Error!",
                    text: res.data.message || "Failed to update discount.",
                    icon: "error",
                });
            }
        } catch (err) {
            console.error("Error updating discount:", err);
            Swal.fire({
                title: "Error!",
                text: err.response?.data?.message || "Failed to update discount.",
                icon: "error",
            });
        }
    };

    // Helper: Get dynamic discounted price
    const getDiscountedPrice = (product) => {
        const basePrice = product.product_sale_price || product.product_price;
        let finalPrice = basePrice;

        if (product.discountType && product.discountValue) {
            const discount = parseFloat(product.discountValue);
            if (product.discountType === "percentage") {
                finalPrice -= (finalPrice * discount) / 100;
            } else if (product.discountType === "flat") {
                finalPrice -= discount;
            }
        }

        return finalPrice < 0 ? 0 : finalPrice.toFixed(2);
    };

    return (
        <div className="p-5">
            <h2 className="text-2xl font-semibold mb-4">Vendor Products Discount</h2>

            <table className="hidden md:block relative overflow-y-auto max-h-[560px] w-full mt-6 border rounded-lg">
                <thead className="sticky top-0 z-10 bg-black text-white font-semibold">
                    <tr>
                        <th className="px-4 py-2 text-center">Name</th>
                        <th className="px-4 py-2 text-center">Price</th>
                        <th className="px-4 py-2 text-center">Sale Price</th>
                        <th className="px-4 py-2 text-center">Discounted Price</th>
                        <th className="px-4 py-2 text-center">Discount Type</th>
                        <th className="px-4 py-2 text-center">Discount</th>
                        <th className="px-4 py-2 text-center">Image</th>
                        <th className="px-4 py-2 text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {currentProducts.length > 0 ? (
                        currentProducts.map((pro) => (
                            <tr key={pro._id}>
                                <td className="border px-4 py-2 border-black capitalize">{pro.product_name}</td>
                                <td className="border px-4 py-2 border-black">${pro.product_price}</td>
                                <td className="border px-4 py-2 border-black">${pro.product_sale_price || "-"}</td>
                                <td className="border px-4 py-2 border-black">${getDiscountedPrice(pro)}</td>
                                <td className="border px-4 py-2 border-black">
                                    {pro.discountType
                                        ? pro.discountType === "percentage"
                                            ? "Percentage"
                                            : "Flat"
                                        : "No Discount"}
                                </td>
                                <td className="border px-4 py-2 border-black">
                                    {pro.discountType
                                        ? pro.discountType === "percentage"
                                            ? `${pro.discountValue}%`
                                            : `$${pro.discountValue}`
                                        : "No Discount"}
                                </td>
                                <td className="border px-4 py-2 border-black">
                                    {pro.product_image_collection?.length > 0 ? (
                                        <img
                                            src={
                                                pro.product_image_collection[0].startsWith("http")
                                                    ? pro.product_image_collection[0]
                                                    : IMAGE_URL + pro.product_image_collection[0]
                                            }
                                            alt="product"
                                            className="w-20 h-12 object-cover rounded"
                                        />
                                    ) : (
                                        "No Image"
                                    )}
                                </td>
                                <td className="border px-4 py-2 border-black">
                                    <button
                                        onClick={() => handleOpenModal(pro)}
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                                    >
                                        <FaPlus /> Add Discount
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

            {/* Modal */}
            {openAddModal && selectedProduct && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">
                            Add Discount for {selectedProduct.product_name}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    value={selectedProduct.product_price}
                                    placeholder="Price"
                                    className="w-full border p-2 rounded"
                                    disabled
                                />
                                <input
                                    type="number"
                                    value={calculatedPrice}
                                    placeholder="Discounted Price"
                                    className="w-full border p-2 rounded bg-gray-100"
                                    disabled
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    name="discountType"
                                    value={formData.discountType}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded"
                                    required
                                >
                                    <option value="">Select Discount Type</option>
                                    <option value="percentage">Percentage</option>
                                    <option value="flat">Flat</option>
                                </select>

                                <input
                                    type="number"
                                    name="discountValue"
                                    value={formData.discountValue}
                                    onChange={handleChange}
                                    placeholder="Discount Value"
                                    className="w-full border p-2 rounded"
                                    required
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>

                        <button
                            onClick={() => setOpenAddModal(false)}
                            className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-2xl"
                        >
                            <IoIosCloseCircle />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorProductDiscount;
