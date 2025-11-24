import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import API, { IMAGE_URL } from "../../API/Api";

const VendorApprovalProduct = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [zoomedImage, setZoomedImage] = useState(null);

    // Fetch products
    const fetchProducts = async () => {
        try {
            const res = await API.get("/getVendorApprovalProduct");
            setProducts(res.data.products || []);
        } catch (err) {
            Swal.fire({
                toast: true,
                icon: 'error',
                title: 'Failed to fetch products',
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Approve product
    const handleApprove = async (productId) => {
        try {
            const res = await API.put(`products/send-approved-product/${productId}`);
            if (res.data.success) {
                Swal.fire("Approved", "Product approved successfully!", "success");
                fetchProducts();
            }
        } catch (err) {
            Swal.fire("Error!", "Something went wrong!", "error");
        }
    };

    // Reject product
    const handleReject = async (productId) => {
        const { value: message } = await Swal.fire({
            title: "Reject Product",
            input: "textarea",
            inputPlaceholder: "Enter rejection reason...",
            showCancelButton: true,
            confirmButtonText: "Send",
        });

        if (message) {
            try {
                await API.put(`products/reject/${productId}`, { message });
                Swal.fire("Rejected!", "Product rejected!", "success");
                fetchProducts();
            } catch (err) {
                Swal.fire("Error!", "Something went wrong!", "error");
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Products</h2>
            </div>

            {/* Product Table */}
            <div className="overflow-auto max-h-[60vh] border rounded">
                <table className="w-full border-collapse">
                    <thead className="bg-black text-white sticky top-0 z-10">
                        <tr>
                            <th className="border px-4 py-2">Name</th>
                            <th className="border px-4 py-2">Price</th>
                            <th className="border px-4 py-2">Sale Price</th>
                            <th className="border px-4 py-2">Category</th>
                            <th className="border px-4 py-2">Subcategory</th>
                            <th className="border px-4 py-2">Image</th>
                            <th className="border px-4 py-2">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="py-10 text-center text-gray-600 font-medium">
                                    No products found.
                                </td>
                            </tr>
                        ) : (
                            products.map((pro) => (
                                <tr key={pro._id} className="hover:bg-gray-50 text-center">
                                    <td className="border px-4 py-2 capitalize">{pro.product_name}</td>
                                    <td className="border px-4 py-2">{pro.product_price}</td>
                                    <td className="border px-4 py-2">{pro.product_sale_price}</td>
                                    <td className="border px-4 py-2">{pro.cat_sec}</td>
                                    <td className="border px-4 py-2">{pro.subCategoryName}</td>
                                    <td className="border px-4 py-2">
                                        {pro.product_variants?.[0]?.images?.[0] ? (
                                            <img
                                                src={
                                                    pro.product_variants[0].images[0].startsWith("http")
                                                        ? pro.product_variants[0].images[0]
                                                        : IMAGE_URL + pro.product_variants[0].images[0]
                                                }
                                                alt="product"
                                                className="w-20 h-12 object-cover rounded mx-auto cursor-pointer"
                                                onClick={() =>
                                                    setZoomedImage(
                                                        pro.product_variants[0].images[0].startsWith("http")
                                                            ? pro.product_variants[0].images[0]
                                                            : IMAGE_URL + pro.product_variants[0].images[0]
                                                    )
                                                }
                                            />
                                        ) : "No Image"}
                                    </td>

                                    <td className="border px-4 py-2 space-x-2">
                                        <button
                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                            onClick={() => setSelectedProduct(pro)}
                                        >
                                            See Details
                                        </button>

                                        <button
                                            onClick={() => handleApprove(pro._id)}
                                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                        >
                                            Approve
                                        </button>

                                        <button
                                            onClick={() => handleReject(pro._id)}
                                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Product Details Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-[650px] p-6 rounded-xl shadow-2xl relative max-h-[90vh] overflow-y-auto">

                        <button
                            className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
                            onClick={() => setSelectedProduct(null)}
                        >
                            ✖
                        </button>

                        <h3 className="text-2xl font-bold mb-4 text-center border-b pb-2">
                            {selectedProduct.product_name}
                        </h3>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <p><strong>Price:</strong> {selectedProduct.product_price}</p>
                            <p><strong>Sale Price:</strong> {selectedProduct.product_sale_price}</p>
                            <p><strong>Stock:</strong> {selectedProduct.stockAvailability}</p>
                            <p><strong>Status:</strong> {selectedProduct.productStatus}</p>

                            <p><strong>Category:</strong> {selectedProduct.cat_sec}</p>
                            <p><strong>Subcategory:</strong> {selectedProduct.subCategoryName}</p>

                            <p><strong>Gender:</strong> {selectedProduct.gender}</p>
                            <p><strong>Vendor:</strong> {selectedProduct.vendorID}</p>

                            <p><strong>Frame Material:</strong> {selectedProduct.frame_material}</p>
                            <p><strong>Frame Shape:</strong> {selectedProduct.frame_shape}</p>
                            <p><strong>Face Shape:</strong> {selectedProduct.face_shape}</p>
                            <p><strong>Frame Color:</strong> {selectedProduct.frame_color}</p>
                        </div>

                        <p className="mt-4 text-gray-700">
                            <strong>Description:</strong><br />
                            {selectedProduct.product_description}
                        </p>

                        {/* Approval History */}
                        <h4 className="font-semibold mt-5 mb-2">Approval History</h4>

                        <div className="space-y-2 text-sm">
                            {selectedProduct?.approvalHistory?.length > 0 ? (
                                selectedProduct.approvalHistory.map((log, index) => (
                                    <div key={index} className="p-2 rounded border bg-gray-50">
                                        <p><strong>Status:</strong> {log.status}</p>
                                        <p>
                                            <strong>Date:</strong>{" "}
                                            {new Date(log.updatedAt).toLocaleString()}
                                        </p>
                                        {log.reason && (
                                            <p><strong>Reason:</strong> {log.reason}</p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No approval history found</p>
                            )}
                        </div>


                        <h4 className="font-semibold mt-5 mb-2">Images (with Variant Colors)</h4>

                        <div className="space-y-3">
                            {selectedProduct?.product_variants?.map((variant, variantIndex) => (
                                <div key={variantIndex}>
                                    {/* Variant color name */}
                                    <p className="text-sm font-semibold mb-1 capitalize">
                                        Color: {variant.colorName}
                                    </p>

                                    {/* Variant images */}
                                    <div className="grid grid-cols-3 gap-2">
                                        {variant.images.map((img, imgIndex) => (
                                            <img
                                                key={imgIndex}
                                                src={img.startsWith("http") ? img : IMAGE_URL + img}
                                                alt={variant.colorName}
                                                className="w-full h-24 rounded cursor-pointer object-cover hover:scale-105 duration-200"
                                                onClick={() =>
                                                    setZoomedImage(img.startsWith("http") ? img : IMAGE_URL + img)
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>


                        <button
                            className="bg-green-600 text-white px-4 py-2 mt-6 rounded-lg hover:bg-green-700 w-full font-semibold"
                            onClick={() => {
                                handleApprove(selectedProduct._id);
                                setSelectedProduct(null);
                            }}
                        >
                            Approve Product
                        </button>
                    </div>
                </div>
            )}

            {/* Image Zoom Modal */}
            {zoomedImage && (
                <div className="fixed inset-0 backdrop-blur-md bg-white/20 flex items-center justify-center z-[60]">
                    <img src={zoomedImage} alt="zoom" className="max-h-[80vh] rounded-lg shadow-2xl" />
                    <button
                        className="absolute top-6 right-6 text-3xl font-bold text-gray-800"
                        onClick={() => setZoomedImage(null)}
                    >
                        ✖
                    </button>
                </div>
            )}
        </div>
    );
};

export default VendorApprovalProduct;
