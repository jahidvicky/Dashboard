import React, { useEffect, useState } from 'react';
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";
import Swal from "sweetalert2";
import API from '../../API/Api';

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const AddClinic = () => {
    const [clinics, setClinics] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("add");
    const [formData, setFormData] = useState({
        clinicName: "",
        address: "",
        days: ["Monday", "Wednesday", "Friday", "Saturday", "Sunday"],
        startTime: "10:00",
        endTime: "18:00",
        slotDurationMinutes: 30
    });

    const fetchClinics = async () => {
        try {
            const res = await API.get("/getClinics");
            setClinics(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchClinics(); }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleDay = (day) => {
        setFormData((prev) => ({
            ...prev,
            days: prev.days.includes(day)
                ? prev.days.filter(d => d !== day)
                : [...prev.days, day]
        }));
    };

    const handleUpdateClick = (clinic) => {
        setModalType("update");
        setShowModal(true);
        setFormData({ id: clinic._id, ...clinic });
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                await API.delete(`/deleteClinic/${id}`);
                fetchClinics();
                Swal.fire("Deleted!", "Clinic deleted successfully!", "success");
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalType === "add") {
                await API.post("/createClinic", formData);
                Swal.fire("Success!", "Clinic created successfully", "success");
            } else {
                await API.put(`/updateClinic/${formData.id}`, formData);
                Swal.fire("Success!", "Clinic updated successfully", "success");
            }
            setShowModal(false);
            fetchClinics();
        } catch (err) {
            console.error(err);
            Swal.fire("Error!", "Failed to save clinic.", "error");
        }
    };

    return (
        <div className='p-4'>
            <div className='flex justify-end'>
                <button
                    onClick={() => {
                        setModalType("add");
                        setShowModal(true);
                        setFormData({
                            clinicName: "", address: "",
                            days: ["Monday", "Wednesday", "Friday", "Saturday", "Sunday"],
                            startTime: "10:00", endTime: "18:00", slotDurationMinutes: 30
                        });
                    }}
                    className='bg-green-500 text-white px-3 py-1 text-xl font-semibold rounded-lg mb-4 flex items-center gap-2'>
                    <FaPlus /> ADD CLINIC
                </button>
            </div>

            <div className='grid grid-cols-6 gap-x-6 bg-black text-white py-2 px-4 font-semibold'>
                <div>NAME</div><div>ADDRESS</div><div>DAYS</div><div>HOURS</div><div>SLOT</div><div>ACTION</div>
            </div>

            {clinics.map((c) => (
                <div key={c._id} className="grid grid-cols-6 gap-x-6 items-center border-b py-2 px-4">
                    <div>{c.clinicName}</div>
                    <div>{c.address}</div>
                    <div>{c.days?.join(", ")}</div>
                    <div>{c.startTime} - {c.endTime}</div>
                    <div>{c.slotDurationMinutes} min</div>
                    <div className="flex gap-2">
                        <button onClick={() => handleUpdateClick(c)} className="bg-blue-500 px-3 py-1 rounded-xl text-white">
                            <RiEdit2Fill />
                        </button>
                        <button onClick={() => handleDelete(c._id)} className="bg-[#f00000] px-3 py-1 rounded-xl text-white">
                            <MdDelete />
                        </button>
                    </div>
                </div>
            ))}

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center pt-40">
                    <div className="bg-white rounded-lg w-[500px] p-6">
                        <h2 className="text-xl font-bold mb-4">{modalType === "add" ? "Add Clinic" : "Edit Clinic"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input name="clinicName" placeholder="Clinic Name" value={formData.clinicName}
                                onChange={handleChange} className="border p-2 w-full rounded" required />
                            <input name="address" placeholder="Address" value={formData.address}
                                onChange={handleChange} className="border p-2 w-full rounded" />

                            <div>
                                <label className="block mb-1 font-medium">Clinic Days</label>
                                <div className="flex flex-wrap gap-2">
                                    {ALL_DAYS.map(day => (
                                        <button type="button" key={day} onClick={() => toggleDay(day)}
                                            className={`px-3 py-1 rounded border ${formData.days.includes(day) ? "bg-green-500 text-white" : "bg-gray-100"}`}>
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <input type="time" name="startTime" value={formData.startTime}
                                    onChange={handleChange} className="border p-2 w-full rounded" />
                                <input type="time" name="endTime" value={formData.endTime}
                                    onChange={handleChange} className="border p-2 w-full rounded" />
                            </div>

                            <input type="number" name="slotDurationMinutes" placeholder="Slot duration (minutes)"
                                value={formData.slotDurationMinutes} onChange={handleChange}
                                className="border p-2 w-full rounded" />

                            <div className="flex justify-between mt-4">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddClinic;