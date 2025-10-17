import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";
import API, { IMAGE_URL } from "../../API/Api";
import Swal from "sweetalert2";

function EyewearTips() {
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("add");
    const [formData, setFormData] = useState({
        id: null,
        title: "",
        description: "",
        image: null,
    });

    const [eyewearData, setEyewearData] = useState([]);

    // Handle text input
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Handle file input
    const handleFileChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            image: e.target.files[0],
        }));
    };

    // Get API
    const fetchEyewearTips = async () => {
        try {
            const response = await API.get("/getEyewearTips");
            setEyewearData(response.data.EyewearTips);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchEyewearTips();
    }, []);

    // Add / Update submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("title", formData.title);
            formDataToSend.append("description", formData.description);

            if (formData.image && formData.image instanceof File) {
                formDataToSend.append("image", formData.image);
            }

            if (modalType === "add") {
                await API.post("/addEyewearTips", formDataToSend, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                Swal.fire({
                    title: "Success!",
                    text: "EyewearTips created successfully",
                    icon: "success",
                    confirmButtonText: "OK"
                });
            } else {
                await API.put(`/updateEyewearTips/${formData.id}`, formDataToSend, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                Swal.fire({
                    title: "Success!",
                    text: "EyewearTips updated successfully",
                    icon: "success",
                    confirmButtonText: "OK"
                });
            }

            setShowModal(false);
            setFormData({ id: null, title: "", description: "", image: null });
            fetchEyewearTips();
        } catch (error) {
            console.log(error);
        }
    };

    // Update handler
    const handleUpdateClick = (tip) => {
        setModalType("update");
        setShowModal(true);
        setFormData({
            id: tip._id,
            title: tip.title,
            description: tip.description,
            image: null, // do not prefill with old URL
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
                    await API.delete(`/deleteEyewearTips/${id}`);
                    fetchEyewearTips();

                    Swal.fire({
                        title: "Deleted!",
                        text: "EyewearTips deleted successfully!",
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

    return (
        <div className="p-4">
            <div className="flex justify-end">
                <button
                    onClick={() => {
                        setShowModal(true);
                        setModalType("add");
                        setFormData({ id: null, title: "", description: "", image: null });
                    }}
                    className="bg-green-500 text-white px-3 py-1 text-xl font-semibold rounded-lg mb-4 hover:cursor-pointer flex items-center gap-2"
                >
                    <FaPlus /> ADD EYEWEAR TIP
                </button>
            </div>

            {/* Table Header */}
            <div className="overflow-x-auto w-full">
                <div className="grid grid-cols-4 gap-x-10 bg-black text-white py-2 px-4 font-semibold">
                    <div className="text-lg">Title</div>
                    <div className="text-lg">Description</div>
                    <div className="text-lg">Image</div>
                    <div className="text-lg">Action</div>
                </div>
            </div>

            {/* Table Rows */}
            {eyewearData.map((data, idx) => (
                <div
                    key={idx}
                    className="grid grid-cols-4 gap-x-10 items-start border-b border-gray-300 py-2 px-4"
                >
                    <h1>{data.title}</h1>
                    <h1>{data.description}</h1>
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
                        <h2 className="text-xl font-bold mb-4">
                            {modalType === "add" ? "Add EyewearTip" : "Update EyewearTip"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input
                                type="text"
                                name="title"
                                placeholder="Title"
                                value={formData.title}
                                className="border p-2 w-full rounded"
                                onChange={handleChange}
                                required
                            />
                            <textarea
                                name="description"
                                placeholder="Description"
                                value={formData.description}
                                className="border p-2 w-full rounded"
                                onChange={handleChange}
                                required
                            ></textarea>

                            <div>
                                <label className="block text-gray-700">Image</label>
                                <input
                                    type="file"
                                    name="image"
                                    onChange={handleFileChange}
                                    className="w-full border rounded p-2"
                                />
                            </div>

                            <div className="flex justify-between mt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:cursor-pointer"
                                    type="button"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:cursor-pointer"
                                >
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

export default EyewearTips;
