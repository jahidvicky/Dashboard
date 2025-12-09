import React, { useEffect, useState } from 'react';
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";
import Swal from "sweetalert2";
import API, { IMAGE_URL } from '../../API/Api';

const DoctorSchedule = () => {
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("add");
    const [timeSlot, setTimeSlot] = useState([]);
    const [eyeExam, setEyeExam] = useState([])
    const [formData, setFormData] = useState({
        doctor_name: "",
        specialization: "",
        image: null,
        exam_section: "",
        schedule: {
            day: "",
            times: []   // use array instead of single time
        }
    });

    const [imagePreview, setImagePreview] = useState(null);


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const fetchDoctor = async () => {
        try {
            const res = await API.get("/getDoctor");
            setTimeSlot(res.data.data);
        } catch (error) {
            console.error("Error fetching doctors:", error);
        }
    };

    const fetchExam = async () => {
        try {
            const response = await API.get("/getExam")
            setEyeExam(response.data.data)

        } catch (error) {
            console.error("Error fetching in exam:", error);
        }
    }

    useEffect(() => {
        fetchDoctor();
        fetchExam();
    }, []);

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
                    await API.delete(`/deleteDoctor/${id}`);
                    fetchDoctor();
                    Swal.fire("Deleted!", "Doctor deleted successfully!", "success");
                } catch (error) {
                    console.error(error);
                    Swal.fire("Error!", "Something went wrong while deleting.", "error");
                }
            }
        });
    };

    const handleUpdateClick = (doctor) => {
        setModalType("update");
        setShowModal(true);

        let firstDay = doctor.schedule?.[0]?.day || "";
        let firstTimes = doctor.schedule?.[0]?.times || [];

        setFormData({
            id: doctor._id,
            doctor_name: doctor.doctor_name || "",
            specialization: doctor.specialization || "",
            exam_section: doctor.exam_section || "",
            schedule: { day: firstDay, times: firstTimes },
            image: null
        });

        // Show old image preview
        setImagePreview(
            doctor.image
                ? (doctor.image.startsWith("http")
                    ? doctor.image
                    : IMAGE_URL + doctor.image)
                : null
        );
    };

    const handleRemoveImage = () => {
        setFormData((prev) => ({ ...prev, image: null }));
        setImagePreview(null);
    };


    // add a new time input
    const addTimeField = () => {
        setFormData({
            ...formData,
            schedule: {
                ...formData.schedule,
                times: [...formData.schedule.times, ""]
            }
        });
    };

    // update a specific time input
    const handleTimeChange = (value, index) => {
        const updatedTimes = [...formData.schedule.times];
        updatedTimes[index] = value;
        setFormData({
            ...formData,
            schedule: {
                ...formData.schedule,
                times: updatedTimes
            }
        });
    };

    // Handle file input
    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setFormData((prev) => ({
                ...prev,
                image: file,
            }));

            setImagePreview(URL.createObjectURL(file)); // preview new image
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const schedulePayload = [{
                day: formData.schedule.day,
                times: formData.schedule.times,
                status: "Available"
            }];

            // Create FormData for multipart/form-data
            const formDataToSend = new FormData();
            formDataToSend.append("doctor_name", formData.doctor_name);
            formDataToSend.append("specialization", formData.specialization);
            formDataToSend.append("exam_section", formData.exam_section);
            formDataToSend.append("schedule", JSON.stringify(schedulePayload));

            // Only append image if selected
            if (formData.image) {
                formDataToSend.append("image", formData.image);
            }

            // If you have exams (must be ObjectId strings)
            if (formData.exams && formData.exams.length > 0) {
                formDataToSend.append("exams", JSON.stringify(formData.exams));
            }

            if (modalType === "add") {
                await API.post("/addDoctor", formDataToSend, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                Swal.fire("Success!", "Doctor created successfully", "success");
            } else {
                await API.put(`/updateDoctor/${formData.id}`, formDataToSend, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                Swal.fire("Success!", "Doctor updated successfully", "success");
            }

            setShowModal(false);
            setFormData({
                doctor_name: "",
                image: null,
                specialization: "",
                exam_section: "",
                schedule: { day: "", times: [] },
                exams: []
            });

            fetchDoctor();
        } catch (error) {
            console.log("Error submitting form:", error);
            Swal.fire("Error!", "Failed to save doctor.", "error");
        }
    };






    return (
        <div className='p-4'>
            {/* Add Button */}
            <div className='flex justify-end'>
                <button
                    onClick={() => {
                        setShowModal(true);
                        setModalType("add");
                        setFormData({
                            doctor_name: "",
                            image: null,
                            specialization: "",
                            exam_section: "",
                            schedule: { day: "", times: [] }
                        });
                    }}
                    className='bg-green-500 text-white px-3 py-1 text-xl font-semibold rounded-lg mb-4 hover:cursor-pointer flex items-center gap-2'>
                    <FaPlus /> ADD SCHEDULE
                </button>
            </div>

            {/* Table Header */}
            <div className='overflow-x-auto w-full'>
                <div className='grid grid-cols-7 gap-x-6 bg-black text-white py-2 px-4 font-semibold'>
                    <div className="text-lg">DOCTOR</div>
                    <div className="text-lg">IMAGE</div>
                    <div className="text-lg">SPECIALIZATION</div>
                    <div className="text-lg">EXAM</div>
                    <div className="text-lg">DAY</div>
                    <div className="text-lg">TIMES</div>
                    <div className="text-lg">ACTION</div>
                </div>

                {/* Table Rows */}
                {timeSlot.map((data, idx) => (
                    <div
                        key={idx}
                        className="grid grid-cols-7 gap-x-10 items-start border-b border-gray-300 py-2 px-4"
                    >
                        <h1>{data.doctor_name}</h1>
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
                        <h1>{data.specialization}</h1>
                        <h1>
                            {Array.isArray(data.exam_section) ? data.exam_section.join(", ") : data.exam_section}
                        </h1>

                        <h1>{data.schedule?.[0]?.day || "N/A"}</h1>
                        <h1>
                            {data.schedule?.[0]?.times?.length > 0
                                ? data.schedule[0].times.join(", ")
                                : "N/A"}
                        </h1>

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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center overflow-y-auto py-6 pt-40">
                    <div className="bg-white rounded-lg shadow-lg w-[500px] max-h-[85vh] overflow-y-auto p-6 relative">
                        <h2 className="text-xl font-bold mb-4">
                            {modalType === "add" ? "Add Doctor Schedule" : "Edit Doctor Schedule"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-3">

                            <input
                                type="text"
                                name='doctor_name'
                                placeholder='Doctor Name'
                                value={formData.doctor_name}
                                className="border p-2 w-full rounded"
                                onChange={handleChange}
                            />

                            {/* IMAGE PREVIEW BLOCK */}
                            <div>
                                <label className="block text-gray-700 mb-1">Doctor Image</label>

                                {imagePreview && (
                                    <div className="relative w-32 h-32 mb-3">
                                        <img
                                            src={imagePreview}
                                            alt="preview"
                                            className="w-full h-full object-cover rounded border"
                                        />

                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-2 py-0.5 text-sm"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    name="image"
                                    onChange={handleFileChange}
                                    className="border p-2 w-full rounded"
                                    required={modalType === "add" && !imagePreview}
                                />
                            </div>

                            <input
                                type="text"
                                name='specialization'
                                placeholder='Specialization'
                                value={formData.specialization}
                                className="border p-2 w-full rounded"
                                onChange={handleChange}
                            />

                            <select
                                name="exam_section"
                                value={formData.exam_section}
                                onChange={(e) => setFormData({ ...formData, exam_section: e.target.value })}
                                className="border p-2 w-full rounded"
                            >
                                <option value="">Select Exam</option>
                                {eyeExam.map((exam) => (
                                    <option key={exam._id} value={exam.examName}>
                                        {exam.examName}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="border p-2 w-full rounded"
                                value={formData.schedule.day}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        schedule: { ...formData.schedule, day: e.target.value },
                                    })
                                }
                            >
                                <option value="">Select Day</option>
                                <option>Monday</option>
                                <option>Tuesday</option>
                                <option>Wednesday</option>
                                <option>Thursday</option>
                                <option>Friday</option>
                                <option>Saturday</option>
                                <option>Sunday</option>
                            </select>

                            <div className="space-y-2">
                                {formData.schedule.times.map((time, index) => (
                                    <input
                                        key={index}
                                        type="time"
                                        value={time}
                                        className="border p-2 w-full rounded"
                                        onChange={(e) => handleTimeChange(e.target.value, index)}
                                    />
                                ))}

                                <button
                                    type="button"
                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:cursor-pointer"
                                    onClick={addTimeField}
                                >
                                    + Add Time
                                </button>
                            </div>

                            <div className="flex justify-between mt-4">
                                <button
                                    type='button'
                                    onClick={() => {
                                        setShowModal(false);
                                        setImagePreview(null);
                                    }}
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
    )
}

export default DoctorSchedule;
