// import React, { useState, useEffect } from "react";
// import Swal from "sweetalert2";
// import API, { IMAGE_URL } from "../../API/Api";

// const VendorApprovalProduct = () => {
//     const [products, setProducts] = useState([]);
//     const [selectedProduct, setSelectedProduct] = useState(null);
//     const [zoomedImage, setZoomedImage] = useState(null);

//     // Fetch products
//     const fetchProducts = async () => {
//         try {
//             const res = await API.get("/getVendorApprovalProduct");
//             setProducts(res.data.products || []);
//         } catch (err) {
//             Swal.fire({
//                 toast: true,
//                 icon: 'error',
//                 title: 'Failed to fetch products',
//                 position: 'top-end',
//                 showConfirmButton: false,
//                 timer: 2000,
//                 timerProgressBar: true,
//             });
//         }
//     };

//     useEffect(() => {
//         fetchProducts();
//     }, []);

//     // Approve product
//     const handleApprove = async (productId) => {
//         try {
//             const res = await API.put(`products/send-approved-product/${productId}`);
//             if (res.data.success) {
//                 Swal.fire("Approved", "Product approved successfully!", "success");
//                 fetchProducts();
//             }
//         } catch (err) {
//             Swal.fire("Error!", "Something went wrong!", "error");
//         }
//     };

//     // Reject product
//     const handleReject = async (productId) => {
//         const { value: message } = await Swal.fire({
//             title: "Reject Product",
//             input: "textarea",
//             inputPlaceholder: "Enter rejection reason...",
//             showCancelButton: true,
//             confirmButtonText: "Send",
//         });

//         if (message) {
//             try {
//                 await API.put(`products/reject/${productId}`, { message });
//                 Swal.fire("Rejected!", "Product rejected!", "success");
//                 fetchProducts();
//             } catch (err) {
//                 Swal.fire("Error!", "Something went wrong!", "error");
//             }
//         }
//     };

//     return (
//         <div className="p-6">
//             <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-xl font-semibold">Products</h2>
//             </div>

//             {/* Product Table */}
//             <div className="overflow-auto max-h-[60vh] border rounded">
//                 <table className="w-full border-collapse">
//                     <thead className="bg-black text-white sticky top-0 z-10">
//                         <tr>
//                             <th className="border px-4 py-2">Name</th>
//                             <th className="border px-4 py-2">Price</th>
//                             <th className="border px-4 py-2">Sale Price</th>
//                             <th className="border px-4 py-2">Category</th>
//                             <th className="border px-4 py-2">Subcategory</th>
//                             <th className="border px-4 py-2">Image</th>
//                             <th className="border px-4 py-2">Actions</th>
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {products.length === 0 ? (
//                             <tr>
//                                 <td colSpan="8" className="py-10 text-center text-gray-600 font-medium">
//                                     No products found.
//                                 </td>
//                             </tr>
//                         ) : (
//                             products.map((pro) => (
//                                 <tr key={pro._id} className="hover:bg-gray-50 text-center">
//                                     <td className="border px-4 py-2 capitalize">{pro.product_name}</td>
//                                     <td className="border px-4 py-2">{pro.product_price}</td>
//                                     <td className="border px-4 py-2">{pro.product_sale_price}</td>
//                                     <td className="border px-4 py-2">{pro.cat_sec}</td>
//                                     <td className="border px-4 py-2">{pro.subCategoryName}</td>
//                                     <td className="border px-4 py-2">
//                                         {pro.product_variants?.[0]?.images?.[0] ? (
//                                             <img
//                                                 src={
//                                                     pro.product_variants[0].images[0].startsWith("http")
//                                                         ? pro.product_variants[0].images[0]
//                                                         : IMAGE_URL + pro.product_variants[0].images[0]
//                                                 }
//                                                 alt="product"
//                                                 className="w-20 h-12 object-cover rounded mx-auto cursor-pointer"
//                                                 onClick={() =>
//                                                     setZoomedImage(
//                                                         pro.product_variants[0].images[0].startsWith("http")
//                                                             ? pro.product_variants[0].images[0]
//                                                             : IMAGE_URL + pro.product_variants[0].images[0]
//                                                     )
//                                                 }
//                                             />
//                                         ) : "No Image"}
//                                     </td>

//                                     <td className="border px-4 py-2 space-x-2">
//                                         <button
//                                             className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
//                                             onClick={() => setSelectedProduct(pro)}
//                                         >
//                                             See Details
//                                         </button>

//                                         <button
//                                             onClick={() => handleApprove(pro._id)}
//                                             className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
//                                         >
//                                             Approve
//                                         </button>

//                                         <button
//                                             onClick={() => handleReject(pro._id)}
//                                             className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
//                                         >
//                                             Reject
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))
//                         )}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Product Details Modal */}
//             {selectedProduct && (
//                 <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center p-4 z-50">
//                     <div className="bg-white w-[650px] p-6 rounded-xl shadow-2xl relative max-h-[90vh] overflow-y-auto">

//                         <button
//                             className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
//                             onClick={() => setSelectedProduct(null)}
//                         >
//                             ✖
//                         </button>

//                         <h3 className="text-2xl font-bold mb-4 text-center border-b pb-2">
//                             {selectedProduct.product_name}
//                         </h3>

//                         <div className="grid grid-cols-2 gap-4 text-sm">
//                             <p><strong>Price:</strong> {selectedProduct.product_price}</p>
//                             <p><strong>Sale Price:</strong> {selectedProduct.product_sale_price}</p>
//                             <p><strong>Stock:</strong> {selectedProduct.stockAvailability}</p>
//                             <p><strong>Status:</strong> {selectedProduct.productStatus}</p>

//                             <p><strong>Category:</strong> {selectedProduct.cat_sec}</p>
//                             <p><strong>Subcategory:</strong> {selectedProduct.subCategoryName}</p>

//                             <p><strong>Gender:</strong> {selectedProduct.gender}</p>
//                             <p><strong>Vendor:</strong> {selectedProduct.vendorID}</p>

//                             <p><strong>Frame Material:</strong> {selectedProduct.frame_material}</p>
//                             <p><strong>Frame Shape:</strong> {selectedProduct.frame_shape}</p>
//                             <p><strong>Face Shape:</strong> {selectedProduct.face_shape}</p>
//                             <p><strong>Frame Color:</strong> {selectedProduct.frame_color}</p>
//                         </div>

//                         <p className="mt-4 text-gray-700">
//                             <strong>Description:</strong><br />
//                             {selectedProduct.product_description}
//                         </p>

//                         {/* Approval History */}
//                         <h4 className="font-semibold mt-5 mb-2">Approval History</h4>

//                         <div className="space-y-2 text-sm">
//                             {selectedProduct?.approvalHistory?.length > 0 ? (
//                                 selectedProduct.approvalHistory.map((log, index) => (
//                                     <div key={index} className="p-2 rounded border bg-gray-50">
//                                         <p><strong>Status:</strong> {log.status}</p>
//                                         <p>
//                                             <strong>Date:</strong>{" "}
//                                             {new Date(log.updatedAt).toLocaleString()}
//                                         </p>
//                                         {log.reason && (
//                                             <p><strong>Reason:</strong> {log.reason}</p>
//                                         )}
//                                     </div>
//                                 ))
//                             ) : (
//                                 <p className="text-gray-500 italic">No approval history found</p>
//                             )}
//                         </div>


//                         <h4 className="font-semibold mt-5 mb-2">Images (with Variant Colors)</h4>

//                         <div className="space-y-3">
//                             {selectedProduct?.product_variants?.map((variant, variantIndex) => (
//                                 <div key={variantIndex}>
//                                     {/* Variant color name */}
//                                     <p className="text-sm font-semibold mb-1 capitalize">
//                                         Color: {variant.colorName}
//                                     </p>

//                                     {/* Variant images */}
//                                     <div className="grid grid-cols-3 gap-2">
//                                         {variant.images.map((img, imgIndex) => (
//                                             <img
//                                                 key={imgIndex}
//                                                 src={img.startsWith("http") ? img : IMAGE_URL + img}
//                                                 alt={variant.colorName}
//                                                 className="w-full h-24 rounded cursor-pointer object-cover hover:scale-105 duration-200"
//                                                 onClick={() =>
//                                                     setZoomedImage(img.startsWith("http") ? img : IMAGE_URL + img)
//                                                 }
//                                             />
//                                         ))}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>


//                         <button
//                             className="bg-green-600 text-white px-4 py-2 mt-6 rounded-lg hover:bg-green-700 w-full font-semibold"
//                             onClick={() => {
//                                 handleApprove(selectedProduct._id);
//                                 setSelectedProduct(null);
//                             }}
//                         >
//                             Approve Product
//                         </button>
//                     </div>
//                 </div>
//             )}

//             {/* Image Zoom Modal */}
//             {zoomedImage && (
//                 <div className="fixed inset-0 backdrop-blur-md bg-white/20 flex items-center justify-center z-[60]">
//                     <img src={zoomedImage} alt="zoom" className="max-h-[80vh] rounded-lg shadow-2xl" />
//                     <button
//                         className="absolute top-6 right-6 text-3xl font-bold text-gray-800"
//                         onClick={() => setZoomedImage(null)}
//                     >
//                         ✖
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default VendorApprovalProduct;






















import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import API, { IMAGE_URL } from "../../API/Api";

const STATUS_TABS = ["All", "Pending", "Approved", "Rejected"];

const STATUS_BADGE = {
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Pending: "bg-yellow-100 text-yellow-700",
};

const VendorApprovalProduct = () => {
    const [products, setProducts] = useState([]);
    const [activeTab, setActiveTab] = useState("All");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [zoomedImage, setZoomedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // ── Fetch ──────────────────────────────────────────────
    const fetchProducts = async (status) => {
        setLoading(true);
        try {
            const params = status !== "All" ? { status } : {};
            const res = await API.get("/getVendorApprovalProduct", { params });
            setProducts(res.data.products || []);
        } catch {
            Swal.fire({
                toast: true, icon: "error", title: "Failed to fetch products",
                position: "top-end", showConfirmButton: false, timer: 2000, timerProgressBar: true,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setCurrentPage(1); fetchProducts(activeTab); }, [activeTab]);

    // ── Actions ────────────────────────────────────────────
    const handleApprove = async (productId) => {
        try {
            const res = await API.put(`products/send-approved-product/${productId}`);
            if (res.data.success) {
                Swal.fire("Approved!", "Product approved successfully.", "success");
                fetchProducts(activeTab);
                setSelectedProduct(null);
            }
        } catch {
            Swal.fire("Error!", "Something went wrong!", "error");
        }
    };

    const handleReject = async (productId) => {
        const { value: message } = await Swal.fire({
            title: "Reject Product",
            input: "textarea",
            inputPlaceholder: "Enter rejection reason...",
            showCancelButton: true,
            confirmButtonText: "Send",
        });
        if (!message) return;
        try {
            await API.put(`products/reject/${productId}`, { message });
            Swal.fire("Rejected!", "Product has been rejected.", "success");
            fetchProducts(activeTab);
            setSelectedProduct(null);
        } catch {
            Swal.fire("Error!", "Something went wrong!", "error");
        }
    };

    // ── Helpers ────────────────────────────────────────────
    const resolveImg = (img) =>
        img?.startsWith("http") ? img : IMAGE_URL + img;

    const firstImage = (product) =>
        product.product_variants?.[0]?.images?.[0];

    // ── Pagination ─────────────────────────────────────────
    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
    const paginatedProducts = products.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    // Build page number array with ellipsis
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                pages.push(i);
            }
            if (currentPage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    // ── Render ─────────────────────────────────────────────
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-5">Product Management</h2>

            {/* ── Tabs ── */}
            <div className="flex gap-2 mb-5 border-b">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 text-sm font-medium rounded-t-lg transition-colors
              ${activeTab === tab
                                ? "bg-black text-white border border-b-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* ── Table ── */}
            <div className="overflow-auto max-h-[62vh] border rounded shadow-sm">
                <table className="w-full border-collapse text-sm">
                    <thead className="bg-black text-white sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 text-left">#</th>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Sale Price</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Subcategory</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Image</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="9" className="py-10 text-center text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="py-10 text-center text-gray-500">
                                    No products found for <strong>{activeTab}</strong>.
                                </td>
                            </tr>
                        ) : (
                            paginatedProducts.map((pro, i) => (
                                <tr key={pro._id} className="hover:bg-gray-50 border-b text-center">
                                    <td className="px-4 py-2 text-left text-gray-500">{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}</td>
                                    <td className="px-4 py-2 text-left capitalize font-medium">{pro.product_name}</td>
                                    <td className="px-4 py-2">${pro.product_price}</td>
                                    <td className="px-4 py-2">${pro.product_sale_price}</td>
                                    <td className="px-4 py-2">{pro.cat_sec}</td>
                                    <td className="px-4 py-2">{pro.subCategoryName || "—"}</td>

                                    {/* ── Status badge ── */}
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${STATUS_BADGE[pro.productStatus] ?? "bg-gray-100 text-gray-600"}`}>
                                            {pro.productStatus ?? "Unknown"}
                                        </span>
                                    </td>

                                    {/* ── Thumbnail ── */}
                                    <td className="px-4 py-2">
                                        {firstImage(pro) ? (
                                            <img
                                                src={resolveImg(firstImage(pro))}
                                                alt="product"
                                                className="w-16 h-12 object-cover rounded mx-auto cursor-pointer hover:scale-105 transition-transform"
                                                onClick={() => setZoomedImage(resolveImg(firstImage(pro)))}
                                            />
                                        ) : (
                                            <span className="text-gray-400 text-xs">No Image</span>
                                        )}
                                    </td>

                                    {/* ── Action buttons ── */}
                                    <td className="px-4 py-2 space-x-1">
                                        <button
                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
                                            onClick={() => setSelectedProduct(pro)}
                                        >
                                            Details
                                        </button>

                                        {/* Approved: no buttons | Pending: both | Rejected: approve only */}
                                        {pro.productStatus === "Pending" && (
                                            <>
                                                <button
                                                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs"
                                                    onClick={() => handleApprove(pro._id)}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs"
                                                    onClick={() => handleReject(pro._id)}
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}

                                        {pro.productStatus === "Rejected" && (
                                            <button
                                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs"
                                                onClick={() => handleApprove(pro._id)}
                                            >
                                                Approve
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ── */}
            {!loading && products.length > 0 && (
                <div className="flex items-center justify-between mt-4 text-sm">
                    <p className="text-gray-500">
                        Showing{" "}
                        <span className="font-medium text-gray-700">
                            {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, products.length)}
                        </span>{" "}
                        of <span className="font-medium text-gray-700">{products.length}</span> products
                    </p>

                    <div className="flex items-center gap-1">
                        {/* Prev */}
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 rounded border text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            ‹ Prev
                        </button>

                        {/* Page numbers */}
                        {getPageNumbers().map((page, idx) =>
                            page === "..." ? (
                                <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-gray-400">…</span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className={`px-3 py-1.5 rounded border transition-colors
                                        ${currentPage === page
                                            ? "bg-black text-white border-black"
                                            : "text-gray-600 hover:bg-gray-100"}`}
                                >
                                    {page}
                                </button>
                            )
                        )}

                        {/* Next */}
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 rounded border text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Next ›
                        </button>
                    </div>
                </div>
            )}

            {/* ── Product Detail Modal ── */}
            {selectedProduct && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-[680px] p-6 rounded-xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button
                            className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
                            onClick={() => setSelectedProduct(null)}
                        >✖</button>

                        <h3 className="text-xl font-bold mb-4 text-center border-b pb-2 capitalize">
                            {selectedProduct.product_name}
                        </h3>

                        {/* Current status banner */}
                        <div className="flex justify-center mb-4">
                            <span className={`px-4 py-1 rounded-full font-semibold text-sm
                ${STATUS_BADGE[selectedProduct.productStatus] ?? "bg-gray-100 text-gray-600"}`}>
                                {selectedProduct.productStatus}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                            <p><strong>Price:</strong> ${selectedProduct.product_price}</p>
                            <p><strong>Sale Price:</strong> ${selectedProduct.product_sale_price}</p>
                            <p><strong>Stock:</strong> {selectedProduct.stockAvailability}</p>
                            <p><strong>Gender:</strong> {selectedProduct.gender}</p>
                            <p><strong>Category:</strong> {selectedProduct.cat_sec}</p>
                            <p><strong>Subcategory:</strong> {selectedProduct.subCategoryName || "—"}</p>
                            <p><strong>Frame Material:</strong> {selectedProduct.frame_material}</p>
                            <p><strong>Frame Shape:</strong> {selectedProduct.frame_shape}</p>
                            <p><strong>Face Shape:</strong> {selectedProduct.face_shape}</p>
                            <p><strong>Frame Color:</strong> {selectedProduct.frame_color}</p>
                            <p className="col-span-2"><strong>Vendor ID:</strong> {selectedProduct.vendorID}</p>
                        </div>

                        <p className="text-sm text-gray-700 mb-4">
                            <strong>Description:</strong><br />{selectedProduct.product_description}
                        </p>

                        {/* Rejection reason */}
                        {selectedProduct.rejectionReason && (
                            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-sm">
                                <strong className="text-red-600">Rejection Reason:</strong>
                                <p className="text-red-700 mt-1">{selectedProduct.rejectionReason}</p>
                            </div>
                        )}

                        {/* Approval History */}
                        <h4 className="font-semibold mb-2 mt-4">Approval History</h4>
                        <div className="space-y-2 text-sm mb-4">
                            {selectedProduct.approvalHistory?.length > 0 ? (
                                selectedProduct.approvalHistory.map((log, i) => (
                                    <div key={i} className="p-2 rounded border bg-gray-50">
                                        <p><strong>Status:</strong> {log.status}</p>
                                        <p><strong>Date:</strong> {new Date(log.updatedAt).toLocaleString()}</p>
                                        {log.reason && <p><strong>Reason:</strong> {log.reason}</p>}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 italic">No history yet.</p>
                            )}
                        </div>

                        {/* Images */}
                        <h4 className="font-semibold mb-2">Product Images</h4>
                        <div className="space-y-3 mb-5">
                            {selectedProduct.product_variants?.map((variant, vi) => (
                                <div key={vi}>
                                    <p className="text-xs font-semibold capitalize mb-1">Color: {variant.colorName}</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {variant.images.map((img, ii) => (
                                            <img
                                                key={ii}
                                                src={resolveImg(img)}
                                                alt={variant.colorName}
                                                className="w-full h-20 object-cover rounded cursor-pointer hover:scale-105 transition-transform"
                                                onClick={() => setZoomedImage(resolveImg(img))}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Modal action buttons */}
                        <div className="flex gap-3">
                            {/* Approved: no buttons | Pending: both | Rejected: approve only */}
                            {selectedProduct.productStatus === "Pending" && (
                                <>
                                    <button
                                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold"
                                        onClick={() => handleApprove(selectedProduct._id)}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-semibold"
                                        onClick={() => handleReject(selectedProduct._id)}
                                    >
                                        Reject
                                    </button>
                                </>
                            )}

                            {selectedProduct.productStatus === "Rejected" && (
                                <button
                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold"
                                    onClick={() => handleApprove(selectedProduct._id)}
                                >
                                    Approve
                                </button>
                            )}

                        </div>
                    </div>
                </div>
            )}

            {/* ── Image Zoom Modal ── */}
            {zoomedImage && (
                <div
                    className="fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center z-[60]"
                    onClick={() => setZoomedImage(null)}
                >
                    <img src={zoomedImage} alt="zoom" className="max-h-[85vh] max-w-[90vw] rounded-lg shadow-2xl" />
                    <button
                        className="absolute top-5 right-6 text-3xl font-bold text-white"
                        onClick={() => setZoomedImage(null)}
                    >✖</button>
                </div>
            )}
        </div>
    );
};

export default VendorApprovalProduct;