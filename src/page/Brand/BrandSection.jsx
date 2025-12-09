import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";
import API, { IMAGE_URL } from "../../API/Api";
import Swal from "sweetalert2";

const BrandSection = () => {
    const [showModal, setShowModal] = useState(false);
    const [brandData, setBrandData] = useState([]);
    const [modalType, setModalType] = useState("add");
    const [formData, setFormData] = useState({
        type: "",
        image: "",
        brand: ""
    });
    const [imagePreview, setImagePreview] = useState(null);


    // pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // get API
    const fetchBrand = async () => {
        try {
            const res = await API.get("/getBrand");
            setBrandData(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        fetchBrand();
    }, []);

    // delete API
    const handleDelete = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to undo this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await API.delete(`/deleteBrand/${id}`);
                    fetchBrand();
                    Swal.fire({
                        title: "Deleted!",
                        text: "Brand deleted successfully!",
                        icon: "success",
                        timer: 2000,
                        confirmButtonText: "OK",
                    });
                } catch (error) {
                    console.error(error);
                    Swal.fire({
                        title: "Error!",
                        text: "Something went wrong while deleting.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                }
            }
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setFormData((prev) => ({
                ...prev,
                image: file,
            }));

            // Preview
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setFormData((prev) => ({
            ...prev,
            image: null,
        }));
        setImagePreview(null);
    };



    const handleUpdateClick = (tip) => {
        setModalType("update");
        setShowModal(true);

        setFormData({
            id: tip._id,
            type: tip.type,
            brand: tip.brand,
            image: null,   // new image not uploaded yet
        });

        // Show existing image as preview
        setImagePreview(
            tip.image
                ? (tip.image.startsWith("http") ? tip.image : IMAGE_URL + tip.image)
                : null
        );
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("type", formData.type);
            formDataToSend.append("brand", formData.brand);

            if (formData.image && formData.image instanceof File) {
                formDataToSend.append("image", formData.image);
            }

            if (modalType === "add") {
                await API.post("/addBrand", formDataToSend, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                Swal.fire({
                    title: "Success!",
                    text: "Brand created successfully",
                    icon: "success",
                    confirmButtonText: "OK",
                });
            } else {
                await API.put(`/updateBrand/${formData.id}`, formDataToSend, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                Swal.fire({
                    title: "Success!",
                    text: "Brand updated successfully",
                    icon: "success",
                    confirmButtonText: "OK",
                });
            }

            setShowModal(false);
            setImagePreview(null);
            setFormData({ id: null, type: "", brand: "", image: null });
            fetchBrand();
        } catch (error) {
            console.log(error);
        }
    };

    // Pagination logic
    const totalPages = Math.ceil(brandData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = brandData.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div>
            <div className="flex justify-end">
                <button
                    onClick={() => {
                        setShowModal(true);
                        setModalType("add");
                        setFormData({ id: null, brand: "", type: "", image: null });
                    }}
                    className="bg-green-500 text-white px-3 py-1 text-xl font-semibold rounded-lg mb-4 hover:cursor-pointer flex items-center gap-2"
                >
                    <FaPlus /> Add Brand
                </button>
            </div>

            {/* Scrollable container with sticky header */}
            <div className="overflow-y-auto max-h-[500px] border border-gray-200 rounded-lg">
                {/* Sticky Header */}
                <div className="grid grid-cols-4 gap-x-10 bg-black text-white py-2 px-4 font-semibold sticky top-0 z-10">
                    <div className="text-lg">Type</div>
                    <div className="text-lg">Brand Name</div>
                    <div className="text-lg">Image</div>
                    <div className="text-lg">Action</div>
                </div>

                {/* Table Rows */}
                {currentItems.map((data, idx) => (
                    <div
                        key={idx}
                        className="grid grid-cols-4 gap-x-10 items-start border-b border-gray-300 py-2 px-4 bg-white"
                    >
                        <h1>{data.type}</h1>
                        <h1>{data.brand}</h1>
                        {data.image && (
                            <img
                                src={
                                    data.image.startsWith("http")
                                        ? data.image
                                        : `${IMAGE_URL + data.image}`
                                }
                                alt={data.brand}
                                className="max-w-25"
                            />
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleUpdateClick(data)}
                                className="bg-blue-500 px-3 py-1 rounded-xl text-white hover:cursor-pointer"
                            >
                                <RiEdit2Fill className="text-2xl" />
                            </button>
                            <button
                                className="bg-[#f00000] px-3 py-1 rounded-xl text-white hover:cursor-pointer"
                                onClick={() => handleDelete(data._id)}
                            >
                                <MdDelete className="text-2xl" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-4 py-2 rounded-lg font-semibold ${currentPage === i + 1
                                ? "bg-[#f00000] text-white"
                                : "bg-gray-200 hover:bg-gray-300"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="w-xl mx-auto bg-white shadow-lg rounded-2xl p-6 mt-10 border border-gray-200">
                        <h2 className="text-xl font-bold mb-4">
                            {modalType === "add" ? "Add Brand" : "Update Brand"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Dropdown for type */}
                            <div>
                                <label className="block mb-1 font-medium text-gray-700">
                                    Select Type
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            type: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                >
                                    <option value="">-- Select Type --</option>
                                    <option value="Glasses">Glasses</option>
                                    <option value="Contact Lenses">Contact Lenses</option>
                                </select>
                            </div>

                            {/* Brand Name Input */}
                            <div>
                                <label className="block mb-1 font-medium text-gray-700">
                                    Brand Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.brand}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            brand: e.target.value,
                                        }))
                                    }
                                    placeholder="Enter Brand Name"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block mb-1 font-medium text-gray-700">
                                    Upload Image
                                </label>

                                {/* Image Preview */}
                                {imagePreview && (
                                    <div className="relative w-32 h-32 mb-2">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-35 h-20 mb-2 rounded border"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-0.5 text-sm"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}

                                {/* Upload Input */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>

                            <div className="flex justify-between mt-4">
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setImagePreview(null);   // RESET preview here
                                        setFormData({ id: null, type: "", brand: "", image: null });
                                    }}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:cursor-pointer"
                                    type="button"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:cursor-pointer"
                                >
                                    {modalType === "add" ? "Submit" : "Update"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandSection;
