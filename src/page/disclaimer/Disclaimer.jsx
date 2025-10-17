import { useState } from "react";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";
import API, { IMAGE_URL } from "../../API/Api";
import { useEffect } from "react";


const Disclaimer = () => {
    const [showModal, setShowModal] = useState(false)
    const [modalType, setModalType] = useState("add");
    const [formData, setFormData] = useState({
        description: "",
        image: null
    })
    const [expanded, setExpanded] = useState({}); // track expanded


    //File Change
    const handleFileChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            image: e.target.files[0]
        }))
    }


    //handle update change
    const handleUpdateClick = (disc) => {
        setModalType("update")
        setFormData({
            id: disc._id,
            description: disc.description,
            image: null
        })
        setShowModal(true)
    }


    //Get API
    const [discData, setDiscData] = useState([])
    const fetchDisclaimer = async () => {
        try {
            const response = await API.get("/getDisclaimer")
            setDiscData(response.data.disclaimerData)
        } catch (error) {
            console.log(error);

        }
    }

    useEffect(() => {
        fetchDisclaimer()
    }, [])


    //Delete Api
    const handleDelete = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await API.delete(`/deleteDisclaimer/${id}`);
                    fetchDisclaimer();
                    Swal.fire({
                        icon: "success",
                        title: "Deleted!",
                        text: "Description deleted successfully.",
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
        });
    }


    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const formDataToSend = new FormData()
            formDataToSend.append("description", formData.description)

            if (formData.image && formData.image instanceof File) {
                formDataToSend.append("image", formData.image);
            }
            //Post API
            if (modalType === "add") {
                await API.post("/addDisclaimer", formDataToSend, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
                Swal.fire({
                    icon: "success",
                    title: "Done!",
                    text: "Description saved successfully!",
                    timer: 2000,
                    showConfirmButton: false,
                })
            } else {
                //Put API
                await API.put(`/updateDisclaimer/${formData.id}`, formDataToSend, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
                Swal.fire({
                    icon: "success",
                    title: "Done!",
                    text: "Description Update successfully!",
                    timer: 2000,
                    showConfirmButton: false,
                })
            }

            setShowModal(false)
            fetchDisclaimer()
            setFormData({
                description: "",
                image: null
            })
        } catch (error) {
            console.log(error);
        }
    }

    // Toggle description expand
    const toggleExpand = (id) => {
        setExpanded((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };


    return (
        <div className="p-4">
            <div className="flex justify-end">
                <button
                    onClick={() => {
                        setShowModal(true);
                        setModalType("add");
                        setFormData({ id: null, description: "", image: null });
                    }}
                    className="bg-green-500 text-white px-3 py-1 text-xl font-semibold rounded-lg mb-4 hover:cursor-pointer flex items-center gap-2">
                    <FaPlus /> ADD Disclaimer
                </button>
            </div>


            {/* Table Header */}
            <div className="overflow-x-auto w-full">
                <div className="grid grid-cols-3 gap-x-10 bg-black text-white py-2 px-4 font-semibold">
                    <div className="text-lg">Description</div>
                    <div className="text-lg">Image</div>
                    <div className="text-lg">Action</div>
                </div>
            </div>


            {discData.map((data, idx) => {
                const isExpanded = expanded[data._id] || false;
                return (
                    <div
                        key={idx}
                        className="grid grid-cols-3 gap-x-10 items-start border-b border-gray-300 py-2 px-4"
                    >
                        <div>
                            {isExpanded
                                ? data.description
                                : data.description.slice(0, 20) +
                                (data.description.length > 20 ? "..." : "")}
                            {data.description.length > 20 && (
                                <button
                                    onClick={() => toggleExpand(data._id)}
                                    className="text-red-600 ml-2 hover:underline hover:cursor-pointer"
                                >
                                    {isExpanded ? "Show Less" : "Show More"}
                                </button>
                            )}
                        </div>
                        <div>
                            {data.image && (
                                <img
                                    src={
                                        data.image.startsWith("http")
                                            ? data.image
                                            : `${IMAGE_URL + data.image}`
                                    }
                                    alt={data.title}
                                    className="w-16 h-16 object-cover rounded"
                                />
                            )}
                        </div>
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
                );
            })}



            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
                        <h2 className="text-xl font-bold mb-4">
                            {modalType === "add" ? "Add Disclaimer" : "Update Disclaimer"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <textarea
                                name="description"
                                placeholder="Description"
                                value={formData.description}
                                className="border p-2 w-full rounded"
                                onChange={(e) => { setFormData({ ...formData, [e.target.name]: e.target.value }) }}
                            >
                            </textarea>

                            <div>
                                <label className="block text-gray-700">Image</label>
                                <input
                                    type="file"
                                    name="image"
                                    onChange={handleFileChange}
                                    className="w-full border rounded p-2" />
                            </div>

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

export default Disclaimer