import React, { useEffect, useState } from 'react';
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";
import API from '../../API/Api';
import Swal from "sweetalert2";

const EyeExam = () => {
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("add");
    const [eyeExam, setEyeExam] = useState([]);
    const [formData, setFormData] = useState({
        description: "",
        examName: "",
        price: "",
        status: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const fetchEyeExam = async () => {
        try {
            const response = await API.get("/getExam");
            setEyeExam(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch exams:", error);
        }
    };

    useEffect(() => {
        fetchEyeExam();
    }, []);


    const handleUpdateClick = (exam) => {
        setModalType("update");
        setShowModal(true);
        setFormData({
            id: exam._id,
            examName: exam.examName,
            description: exam.description,
            price: exam.price,
            status: exam.status
        });
    };



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
                    await API.delete(`/deleteExam/${id}`);
                    fetchEyeExam();

                    Swal.fire({
                        title: "Deleted!",
                        text: "Eye Exam deleted successfully!",
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: false,
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


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalType === "add") {
                await API.post("/createExam", formData, {
                    headers: { "Content-Type": "application/json" },
                });
                Swal.fire({
                    title: "Success!",
                    text: "EyeExam conducted successfully",
                    icon: "success",
                    confirmButtonText: "OK"
                });
            } else {
                await API.put(`/updateExam/${formData.id}`, formData, {
                    headers: { "Content-Type": "application/json" },
                });
                Swal.fire({
                    title: "Success!",
                    text: "Eye Exam updated successfully",
                    icon: "success",
                    confirmButtonText: "OK"
                });
            }

            setShowModal(false);
            setFormData({ description: "", examName: "", price: "", status: "" });
            fetchEyeExam();
        } catch (error) {
            console.log("Error submitting form:", error);
        }
    };

    return (
        <div className='p-4'>
            {/* Add EyeExam Button */}
            <div className='flex justify-end'>
                <button
                    onClick={() => {
                        setShowModal(true);
                        setModalType("add");
                    }}
                    className='bg-green-500 text-white px-3 py-1 text-xl font-semibold rounded-lg mb-4 hover:cursor-pointer flex items-center gap-2'>
                    <FaPlus /> ADD EYE EXAM
                </button>
            </div>

            {/* Table Header */}
            <div className='overflow-x-auto w-full'>
                <div className='grid grid-cols-5 gap-x-6 bg-black text-white py-2 px-4 font-semibold'>
                    <div className="text-lg">EXAM NAME</div>
                    <div className="text-lg">DESCRIPTION</div>
                    <div className="text-lg">PRICE</div>
                    <div className="text-lg">STATUS</div>
                    <div className="text-lg">ACTION</div>
                </div>

                {/* Table Rows */}
                {eyeExam && eyeExam.length > 0 ? (
                    eyeExam.map((exam, idx) => (
                        <div key={idx} className="grid grid-cols-5 gap-x-6 py-2 px-4 border-b">
                            <div>{exam.examName}</div>
                            <div>{exam.description}</div>
                            <div>{exam.price}</div>
                            <div>{exam.status}</div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleUpdateClick(exam)}
                                    className="bg-blue-500 px-3 py-1 h-10 rounded-xl text-white hover:cursor-pointer"
                                >
                                    <RiEdit2Fill className="text-2xl" />
                                </button>
                                <button
                                    className="bg-red-500 px-3 py-1 h-10 rounded-xl text-white hover:cursor-pointer"
                                    onClick={() => handleDelete(exam._id)}
                                >
                                    <MdDelete className="text-2xl" />
                                </button>
                            </div>

                        </div>
                    ))
                ) : (
                    <div className="p-4 text-gray-500">No exams available.</div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className='fixed inset-0 backdrop-blur-sm flex justify-center items-center'>
                    <div className='bg-white rounded-lg shadow-lg w-[500px] p-6 relative'>
                        <h2 className="text-xl font-bold mb-4">{modalType === "add" ? "Add Eye Exam" : "Edit Eye Exam"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input
                                type="text"
                                name='examName'
                                placeholder='Name'
                                value={formData.examName}
                                className="border p-2 w-full rounded"
                                onChange={handleChange}
                            />
                            <textarea
                                name="description"
                                placeholder='Description'
                                value={formData.description}
                                className="border p-2 w-full rounded"
                                onChange={handleChange}
                            ></textarea>
                            <input
                                type="text"
                                name='price'
                                placeholder='Price'
                                value={formData.price}
                                className="border p-2 w-full rounded"
                                onChange={handleChange}
                            />
                            <input
                                type="text"
                                name='status'
                                placeholder='Status'
                                value={formData.status}
                                className="border p-2 w-full rounded"
                                onChange={handleChange}
                            />

                            <div className="flex justify-between mt-4">
                                <button
                                    type='button'
                                    onClick={() => setShowModal(false)}
                                    className='bg-gray-500 text-white px-4 py-2 rounded hover:cursor-pointer'>
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:cursor-pointer">
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EyeExam;
