import React, { useEffect } from 'react'
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import { MdDelete } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";
// import { toast } from "react-toastify";
import API from '../../API/Api';
import Swal from 'sweetalert2';

const EyeCheck = () => {
    const [showModal, setShowModal] = useState(false)
    const [modalType, setModalType] = useState("add")
    const [formData, setFormData] = useState({
        description: "",
        heading: ""
    })

    const handleChange = (e) => {
        setFormData({
            ...formData, [e.target.name]: e.target.value
        })
    };


    const handleAddClick = () => {
        setModalType("add");
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/deleteEyecheck/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                }
            })
            fetchEyeCheck();
        } catch (error) {
            console.error(error)
        }
    };


    const handleUpdateClick = (eyecheck) => {
        setModalType("update");
        setShowModal(true);
        setFormData({
            id: eyecheck._id,
            heading: eyecheck.heading,
            description: eyecheck.description
        })

    };

    const [eyeCheckData, setEyeCheckData] = useState([{}])
    const fetchEyeCheck = async () => {
        try {
            const response = await API.get("/getEyecheck", {
                headers: {
                    "Content-Type": "application/json",
                }
            })
            setEyeCheckData(response.data.eyeCheck)
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchEyeCheck()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            if (modalType === "add") {
                await API.post("/addEyecheck", formData)
                Swal.fire({
                    title: "Success!",
                    text: "Eyecheck created successfully",
                    icon: "success",
                    confirmButtonText: "OK"
                });
            } else {
                await API.put(`/updateEyecheck/${formData.id}`, {
                    heading: formData.heading,
                    description: formData.description
                })
                Swal.fire({
                    title: "Success!",
                    text: "Eyecheck updated successfully",
                    icon: "success",
                    confirmButtonText: "OK"
                });
            }
            setShowModal(false);
            setFormData({ description: "", heading: "" })
            fetchEyeCheck();
        } catch (error) {
            console.log(error)
        }
    };


    return (
        <div className='p-4'>
            {/* Add Eyecheck Button */}
            <div className='flex justify-end'>
                <button
                    onClick={handleAddClick}
                    className='bg-green-500 text-white px-3 py-1 text-xl font-semibold rounded-lg mb-4 hover:cursor-pointer flex items-center gap-2 '> <FaPlus /> ADD EYECHECK</button>
            </div>

            {/* Table bar */}
            <div className='overflow-x auto w-full'>
                <div className='grid grid-cols-3 gap-x-6 bg-black text-white py-2 px-4 font-semibold'>
                    <div className="text-lg">HEADING</div>
                    <div className="text-lg">PARAGRAPH</div>
                    <div className="text-lg">ACTION</div>
                </div>
                {
                    eyeCheckData.map((data, idx) => (
                        <div key={idx}
                            className="grid grid-cols-3 gap-x-10 items-start border-b border-gray-300 py-2 px-4">
                            <h1>{data.heading}</h1>
                            <p>{data.description}</p>
                            <div className="flex gap-2">
                                <div>
                                    <button onClick={() => handleUpdateClick(data)}
                                        className="bg-blue-500 px-3 py-1 rounded-xl text-white hover:cursor-pointer">
                                        <RiEdit2Fill className="text-2xl" />
                                    </button>
                                </div>
                                <div>
                                    <button
                                        className="bg-red-500 px-3 py-1 rounded-xl text-white hover:cursor-pointer"
                                        onClick={() => handleDelete(data._id)}>
                                        <MdDelete className="text-2xl" />


                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>


            {/* Modal */}
            {showModal &&
                <div className='fixed inset-0 backdrop-blur-sm flex justify-center items-center'>
                    <div className='bg-white rounded-lg shadow-lg w-96 p-6 relative'>
                        <h2 className="text-xl font-bold mb-4">Add Eyecheck</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input type="text"
                                name='heading'
                                placeholder='Heading'
                                value={formData.heading}
                                className="border p-2 w-full rounded"
                                onChange={handleChange}
                            />
                            <textarea type="text"
                                name="description"
                                placeholder='Decription'
                                value={formData.description}
                                className="border p-2 w-full rounded"
                                onChange={handleChange}
                            ></textarea>

                            <div className="flex justify-between mt-4">
                                <button
                                    onClick={() => { setShowModal(false) }}
                                    className='bg-gray-500 text-white px-4 py-2 rounded hover:cursor-pointer'
                                    type='button'>
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

            }
        </div>
    )
}

export default EyeCheck;