import React, { useEffect, useState } from 'react'
import { FaPlus, FaStar } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";
import API, { IMAGE_URL } from '../../API/Api';
import Swal from "sweetalert2";

function Testimonial() {
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("add");
    const [formData, setFormData] = useState({
        fullName: "",
        heading: "",
        description: "",
        image: null,
        rating: "",
    });
    const [testimonialData, setTestimonialData] = useState([]);
    const [ratingError, setRatingError] = useState("");
    const [imagePreview, setImagePreview] = useState(null);


    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(testimonialData.length / itemsPerPage);
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentData = testimonialData.slice(indexOfFirst, indexOfLast);

    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === "rating") {
            if (value === "") {
                setRatingError("Rating is required");
            } else if (value < 1) {
                setRatingError("Rating cannot be less than 1");
                value = 1;
            } else if (value > 5) {
                setRatingError("Rating cannot be more than 5");
                value = 5;
            } else {
                setRatingError(""); // clear error
            }
        }

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleUpdateClick = (testimonial) => {
        setModalType("update");
        setShowModal(true);

        setFormData({
            id: testimonial._id,
            fullName: testimonial.fullName,
            heading: testimonial.heading,
            description: testimonial.description,
            image: testimonial.image, // keep original
            rating: testimonial.rating
        });

        // Show old image preview
        setImagePreview(
            testimonial.image
                ? (testimonial.image.startsWith("http")
                    ? testimonial.image
                    : IMAGE_URL + testimonial.image)
                : null
        );
    };


    // For image upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setFormData((prev) => ({
                ...prev,
                image: file
            }));

            // Preview
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({
            ...prev,
            image: null
        }));
        setImagePreview(null);
    };



    // Get API
    const fetchTestimonial = async () => {
        try {
            const response = await API.get("/getTestimonial");
            setTestimonialData(response.data.testimonial);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchTestimonial();
    }, []);

    // Delete API
    const handleDelete = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to undo this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await API.delete(`/deleteTestimonial/${id}`);
                    fetchTestimonial();

                    Swal.fire({
                        title: "Deleted!",
                        text: "Testimonial deleted successfully!",
                        icon: "success",
                        timer: 2000,
                        // showConfirmButton: false,
                        confirmButtonText: "OK"
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

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("fullName", formData.fullName);
            formDataToSend.append("heading", formData.heading);
            formDataToSend.append("description", formData.description);
            if (formData.image) {
                formDataToSend.append("image", formData.image);
            }
            formDataToSend.append("rating", Number(formData.rating));

            if (modalType === "add") {
                await API.post("/addTesimonial", formDataToSend, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                Swal.fire({
                    icon: "success",
                    title: "Done!",
                    text: "Testimonial created successfully!",
                    timer: 2000,
                    confirmButtonText: "OK",
                });
            } else {
                await API.put(`/updateTestimonial/${formData.id}`, formDataToSend);
                Swal.fire({
                    icon: "success",
                    title: "Done!",
                    text: "Testimonial updated successfully!",
                    timer: 2000,
                    confirmButtonText: "OK",
                });
            }

            setShowModal(false);
            setFormData({ fullName: "", heading: "", description: "", image: null, rating: "" });
            fetchTestimonial();
            setImagePreview(null);
        } catch (error) {
            console.error("Submit Error:", error);
        }
    };

    return (
        <div className='p-4'>
            {/* Add Button */}
            <div className='flex justify-end'>
                <button
                    onClick={() => { setShowModal(true); setModalType("add"); }}
                    className='bg-green-500 text-white px-3 py-1 text-xl font-semibold rounded-lg mb-4 hover:cursor-pointer flex items-center gap-2'
                >
                    <FaPlus /> ADD TESTIMONIAL
                </button>
            </div>

            {/* Table Section */}
            <div className='overflow-y-auto max-h-[70vh] border rounded-md'>
                <div className='grid grid-cols-6 gap-x-6 bg-black text-white px-4 py-2 font-semibold sticky top-0'>
                    <div className='text-lg'>Name</div>
                    <div className='text-lg'>Heading</div>
                    <div className='text-lg'>Description</div>
                    <div className='text-lg'>Image</div>
                    <div className='text-lg'>Rating</div>
                    <div className='text-lg'>Action</div>
                </div>

                {currentData.map((data, idx) => (
                    <div
                        key={idx}
                        className="grid grid-cols-6 gap-x-10 items-start border-b border-gray-300 py-2 px-4 bg-white"
                    >
                        <p>{data.fullName}</p>
                        <p>{data.heading}</p>
                        <p>{data.description}</p>
                        {data.image && (
                            <img
                                src={data.image.startsWith("http") ? data.image : `${IMAGE_URL + data.image}`}
                                alt={data.name}
                                className="w-16 h-16 object-cover rounded"
                            />
                        )}
                        <div className="flex text-yellow-500">
                            {[...Array(Math.max(1, Math.min(5, data.rating)))].map((_, i) => (
                                <FaStar key={i} />
                            ))}
                        </div>
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
            <div className="flex justify-center mt-4 gap-2 flex-wrap">
                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-3 py-1 rounded hover:cursor-pointer ${currentPage === index + 1
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                            }`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-start h-screen overflow-y-auto py-28">
                    <div className='bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative'>
                        <h2 className="text-xl font-bold mb-4">
                            {modalType === "add" ? "Add Testimonial" : "Update Testimonial"}
                        </h2>

                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div>
                                <label className='block text-gray-700'>Name</label>
                                <input
                                    type="text"
                                    name='fullName'
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder='Full Name'
                                    className="w-full border rounded p-2 focus:outline-none focus:border-red-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className='block text-gray-700'>Heading</label>
                                <input
                                    type="text"
                                    name='heading'
                                    value={formData.heading}
                                    onChange={handleChange}
                                    placeholder='Heading'
                                    className="w-full border rounded p-2 focus:outline-none focus:border-red-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className='block text-gray-700'>Description</label>
                                <textarea
                                    name='description'
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full border rounded p-2 focus:outline-none focus:border-red-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className='block text-gray-700'>Image</label>

                                {/* Image Preview */}
                                {imagePreview && (
                                    <div className="relative w-32 h-32 mb-2">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover rounded border"
                                        />
                                        {/* Delete button */}
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-0.5 text-sm"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}

                                {/* Upload New Image */}
                                <input
                                    type="file"
                                    name='image'
                                    onChange={handleFileChange}
                                    className="w-full border rounded p-2 focus:outline-none focus:border-red-500"
                                    required={modalType === "add" && !imagePreview}
                                />
                            </div>


                            <div>
                                <label className='block text-gray-700'>Rating</label>
                                <input
                                    type="number"
                                    name='rating'
                                    value={formData.rating}
                                    onChange={handleChange}
                                    placeholder='Enter rating between 1 to 5'
                                    className={`w-full border rounded p-2 focus:outline-none focus:border-red-500 ${ratingError ? "border-red-500" : ""
                                        }`}
                                    min="1"
                                    max="5"
                                    required
                                />

                                {ratingError && (
                                    <p className="text-red-500 text-sm mt-1">{ratingError}</p>
                                )}
                            </div>


                            <div className="flex justify-between mt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className='bg-gray-500 text-white px-4 py-2 rounded'
                                    type='button'>
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    className="bg-green-600 hover:cursor-pointer text-white px-4 py-2 rounded">
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Testimonial;
