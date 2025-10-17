import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import API, { IMAGE_URL } from "../../API/Api";

const VendorApprovalProduct = () => {
    const [products, setProducts] = useState([]);

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

            else {
                Swal.fire({
                    toast: true,
                    icon: 'error',
                    title: 'Something went wrong',
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                toast: true,
                icon: 'error',
                title: 'Error approving product',
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
        }
    };

    // Reject product with popup
    const handleReject = async (productId) => {
        const { value: message } = await Swal.fire({
            title: "Reject Product",
            html: `<textarea id="reject-message" placeholder="Enter rejection reason..." class="swal2-textarea" rows="4"></textarea>`,
            showCancelButton: true,
            confirmButtonText: "Send",
            cancelButtonText: "Cancel",
            preConfirm: () => {
                const msg = document.getElementById("reject-message").value;
                if (!msg || !msg.trim()) {
                    throw new Error("Please enter a rejection message");
                }
                return msg;
            },
        });

        if (message) {
            try {
                const res = await API.put(`products/reject/${productId}`, { message });
                if (res.data.success) {
                    Swal.fire({
                        toast: true,
                        icon: 'success',
                        title: 'Product rejected successfully!!',
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true,
                    });
                    fetchProducts();
                } else {
                    Swal.fire({
                        toast: true,
                        icon: 'error',
                        title: 'Something went wrong',
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true,
                    });
                }
            } catch (err) {
                console.error(err);
                Swal.fire({
                    toast: true,
                    icon: 'error',
                    title: 'Error rejecting product',
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
            }
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Products</h2>
            </div>

            {/* Product Table */}
            <div className="overflow-auto max-h-[60vh] border rounded">
                <table className="w-full border-collapse">
                    <thead className="bg-black text-white sticky top-0 z-10">
                        <tr>
                            <th className="border px-4 py-2 border-black">Name</th>
                            <th className="border px-4 py-2 border-black">SKU</th>
                            <th className="border px-4 py-2 border-black">Price</th>
                            <th className="border px-4 py-2 border-black">Sale Price</th>
                            <th className="border px-4 py-2 border-black">Category</th>
                            <th className="border px-4 py-2 border-black">Subcategory</th>
                            <th className="border px-4 py-2 border-black">Image(s)</th>
                            <th className="border px-4 py-2 border-black">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((pro) => (
                            <tr key={pro._id}>
                                <td className="border px-4 py-2 text-center capitalize">{pro.product_name}</td>
                                <td className="border px-4 py-2 text-center">{pro.product_sku}</td>
                                <td className="border px-4 py-2 text-center">{pro.product_price}</td>
                                <td className="border px-4 py-2 text-center">{pro.product_sale_price}</td>
                                <td className="border px-4 py-2 text-center">{pro.cat_sec}</td>
                                <td className="border px-4 py-2 text-center">{pro.subCategoryName}</td>
                                <td className="border px-4 py-2">
                                    {pro.product_image_collection?.length ? (
                                        <div className="grid grid-cols-3">
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
                                <td className="border px-4 py-2 text-center space-x-2">
                                    <button
                                        onClick={() => handleApprove(pro._id)}
                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 hover:cursor-pointer"
                                    >
                                        Approve
                                    </button>

                                    <button
                                        onClick={() => handleReject(pro._id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 hover:cursor-pointer"
                                    >
                                        Reject
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VendorApprovalProduct;
