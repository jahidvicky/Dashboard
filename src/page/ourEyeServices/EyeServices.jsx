import React, { useEffect, useState } from 'react'
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";
import Swal from "sweetalert2";
import API, { IMAGE_URL } from '../../API/Api';

const EyeService = () => {
    const [showModal, setShowModal] = useState(false)
    const [modalType, setModalType] = useState("add")
    const [formData, setFormData] = useState({
        image: null,
        heading: "",
        description: ""
    })

    const [eyeServiceData, setEyeServiceData] = useState([])

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    const handleChange = (e) => {
        setFormData(
            { ...formData, [e.target.name]: e.target.value }
        )
    }

    const handleFileChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            image: e.target.files[0],
        }));
    };

    const handleUpdateClick = (service) => {
        setModalType("update")
        setShowModal(true)
        setFormData({
            id: service._id,
            heading: service.heading,
            description: service.description,
            image: null
        })
    }

    // Delete API
    const handleDelete = async (id) => {
        try {
            await API.delete(`/deleteEyeService/${id}`)
            fetchEyeService()
            Swal.fire({
                icon: "success",
                title: "Done!",
                text: "Eye service deleted successfully!",
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Failed!",
                text: `Deletion Failed : ${error}`,
                timer: 2000,
                showConfirmButton: false,
            });
        }
    }

    // Get API
    const fetchEyeService = async () => {
        try {
            const response = await API.get("/getEyeService")
            setEyeServiceData(response.data.EyeServiceData)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchEyeService();
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("heading", formData.heading)
            formDataToSend.append("description", formData.description)

            if (formData.image && formData.image instanceof File) {
                formDataToSend.append("image", formData.image);
            }

            if (modalType === "add") {
                await API.post("/addEyeService", formDataToSend, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
                Swal.fire({
                    icon: "success",
                    title: "Done!",
                    text: "Eye service created successfully!",
                    timer: 2000,
                    showConfirmButton: false,
                });
            } else {
                await API.put(`/updateEyeService/${formData.id}`, formDataToSend, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
                Swal.fire({
                    icon: "success",
                    title: "Done!",
                    text: "Eye service updated successfully!",
                    timer: 2000,
                    showConfirmButton: false,
                });
            }

            setShowModal(false)
            setFormData({ heading: "", description: "", image: null })
            fetchEyeService()
        } catch (error) {
            console.log(error)
        }
    }

    // Pagination logic
    const totalPages = Math.ceil(eyeServiceData.length / itemsPerPage)
    const indexOfLast = currentPage * itemsPerPage
    const indexOfFirst = indexOfLast - itemsPerPage
    const currentData = eyeServiceData.slice(indexOfFirst, indexOfLast)

    return (
        <div className='p-4'>
            {/* Add Eye Service Button */}
            <div className='flex justify-end'>
                <button
                    onClick={() => { setShowModal(true); setModalType("add") }}
                    className='bg-green-500 text-white px-3 py-1 text-xl font-semibold rounded-lg mb-4 hover:cursor-pointer flex items-center gap-2'>
                    <FaPlus /> ADD EYE SERVICE
                </button>
            </div>

            {/* Table Header */}
            <div className="overflow-x-auto w-full">
                <div className="grid grid-cols-4 gap-x-10 bg-black text-white py-2 px-4 font-semibold">
                    <div className="text-lg">Heading</div>
                    <div className="text-lg">Description</div>
                    <div className="text-lg">Image</div>
                    <div className="text-lg">Action</div>
                </div>
            </div>

            {/* Table Rows */}
            {currentData.map((data, idx) => (
                <div
                    key={idx}
                    className="grid grid-cols-4 gap-x-10 items-start border-b border-gray-300 py-2 px-4">
                    <h1>{data.heading}</h1>
                    <h1>{data.description}</h1>
                    {data.image && (
                        <img
                            src={
                                data.image.startsWith("http")
                                    ? data.image
                                    : `${IMAGE_URL + data.image}`
                            }
                            alt={data.heading}
                            className="w-16 h-16 object-cover rounded"
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
                            className="bg-red-500 px-3 py-1 rounded-xl text-white hover:cursor-pointer"
                            onClick={() => handleDelete(data._id)}
                        >
                            <MdDelete className="text-2xl" />
                        </button>
                    </div>
                </div>
            ))}

            {/* Pagination Buttons */}
            <div className="flex justify-center mt-4 gap-2 flex-wrap">
                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-3 py-1 rounded ${currentPage === index + 1
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
                <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
                        <h2 className="text-xl font-bold mb-4">
                            {modalType === "add" ? "Add Eye Service" : "Update Eye Service"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input
                                type="text"
                                name='heading'
                                value={formData.heading}
                                onChange={handleChange}
                                placeholder='Heading'
                                className="border p-2 w-full rounded"
                            />

                            <textarea
                                name='description'
                                onChange={handleChange}
                                value={formData.description}
                                className="border p-2 w-full rounded mt-4"
                                placeholder='Description'>
                            </textarea>

                            <input
                                type="file"
                                onChange={handleFileChange}
                                name='image'
                                className="border p-2 w-full rounded mt-3"
                            />

                            <div className="flex justify-between mt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:cursor-pointer"
                                    type="button">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:cursor-pointer">
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default EyeService