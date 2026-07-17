import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../../API/Api";
import { FaSearch } from "react-icons/fa";

const groupAppointmentHistory = (appts) => {
    const byId = {};
    appts.forEach((a) => (byId[a._id] = a));

    const referenced = new Set();
    appts.forEach((a) => {
        if (a.rescheduledFrom) referenced.add(a.rescheduledFrom);
    });

    const latestOnes = appts.filter((a) => !referenced.has(a._id));

    const groups = latestOnes.map((latest) => {
        const history = [];
        let cursorId = latest.rescheduledFrom;
        while (cursorId && byId[cursorId]) {
            history.push(byId[cursorId]);
            cursorId = byId[cursorId].rescheduledFrom;
        }
        return { latest, history };
    });

    return groups.sort((a, b) => new Date(b.latest.date) - new Date(a.latest.date));
};

const Appointment = () => {
    const [allExam, setAllExam] = useState([]);
    const [filteredExam, setFilteredExam] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDoctor, setFilterDoctor] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [examPerPage] = useState(8);
    const [cancellingId, setCancellingId] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const fetchAllExam = async () => {
        try {
            const res = await API.get("/getAllAppointments");
            const exams = res.data.data || [];
            setAllExam(exams);
            setFilteredExam(exams);
        } catch (error) {
            console.log(error);
        }
    };

    const handleCancel = async (id) => {
        setCancellingId(id);
        try {
            await API.put(`/cancelAppointment/${id}`, { cancelledBy: "admin" });
            fetchAllExam();
        } catch (error) {
            console.error("Failed to cancel appointment:", error);
        } finally {
            setCancellingId(null);
        }
    };

    useEffect(() => {
        fetchAllExam();
    }, []);

    useEffect(() => {
        let filtered = allExam;

        if (filterDoctor) {
            filtered = filtered.filter((exam) =>
                exam.doctor?.doctor_name?.toLowerCase().includes(filterDoctor.toLowerCase())
            );
        }

        if (searchTerm) {
            filtered = filtered.filter(
                (exam) =>
                    exam.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    exam.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    exam.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    exam.examType?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredExam(filtered);
        setCurrentPage(1); // reset to first page on filter
    }, [searchTerm, filterDoctor, allExam]);

    // Pagination logic
    const groupedExams = groupAppointmentHistory(filteredExam);
    const indexOfLastExam = currentPage * examPerPage;
    const indexOfFirstExam = indexOfLastExam - examPerPage;
    const currentExams = groupedExams.slice(indexOfFirstExam, indexOfLastExam);
    const totalPages = Math.ceil(groupedExams.length / examPerPage);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Title */}
            <motion.h2
                className="text-3xl font-bold text-center text-[#f00000] mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                Eye Examination Appointments
            </motion.h2>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div className="relative w-full md:w-1/2">
                    <input
                        type="text"
                        placeholder="Search by patient name, email, or exam type..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-red-600 focus:ring-2 focus:ring-red-500 outline-none shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>

                <select
                    className="w-full md:w-1/4 py-2 px-3 rounded-lg border border-red-600 focus:ring-2 focus:ring-red-500 outline-none shadow-sm"
                    value={filterDoctor}
                    onChange={(e) => setFilterDoctor(e.target.value)}
                >
                    <option value="">All Doctors</option>
                    {[...new Set(allExam.map((exam) => exam.doctor?.doctor_name))].map(
                        (docName, i) =>
                            docName && (
                                <option key={i} value={docName}>
                                    {docName}
                                </option>
                            )
                    )}
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto shadow-lg rounded-2xl bg-white">
                <div className="grid grid-cols-11 text-center bg-black text-white font-semibold py-3 px-4 sticky top-0 z-10 rounded-t-2xl">
                    <div>Date</div>
                    <div>Time</div>
                    <div>Exam Type</div>
                    <div>Doctor</div>
                    <div>Patient Name</div>
                    <div>Gender</div>
                    <div>D.O.B</div>
                    <div>Phone</div>
                    <div>Email</div>
                    <div>Status</div>
                    <div>Action</div>
                </div>

                <div className="max-h-[560px] overflow-y-auto">
                    {currentExams.length > 0 ? (
                        currentExams.map(({ latest: data, history }, idx) => (
                            <motion.div
                                key={data._id}
                                onClick={() => setSelectedGroup({ latest: data, history })}
                                className={`grid grid-cols-11 text-center items-center px-4 py-3 text-sm border-b border-gray-200 cursor-pointer ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                                    }`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                                whileHover={{
                                    backgroundColor: "#b0b0ad39",
                                    transition: { duration: 0.2 },
                                }}
                            >
                                <div>{data.date || "-"}</div>
                                <div>{data.startTime || "-"}</div>
                                <div>{data.examType || "-"}</div>
                                <div>{data.doctor?.doctor_name || "-"}</div>
                                <div>
                                    {data.firstName} {data.lastName}
                                    {history.length > 0 && (
                                        <span className="block text-[10px] text-gray-400 font-normal">
                                            {history.length} earlier {history.length === 1 ? "version" : "versions"}
                                        </span>
                                    )}
                                </div>
                                <div>{data.gender || "-"}</div>
                                <div>{data.dob || "-"}</div>
                                <div>{data.phone || "-"}</div>
                                <div className="break-words">{data.email || "-"}</div>
                                <div className={data.status === "cancelled" ? "text-red-500" : "text-green-600"}>
                                    {data.status}
                                </div>
                                <div onClick={(e) => e.stopPropagation()}>
                                    {data.status === "booked" && (
                                        <button
                                            onClick={() => handleCancel(data._id)}
                                            disabled={cancellingId === data._id}
                                            className="bg-[#f00000] text-white px-3 py-1 rounded-lg text-xs hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1 min-w-[64px]"
                                        >
                                            {cancellingId === data._id ? (
                                                <>
                                                    <svg
                                                        className="animate-spin h-3 w-3 text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        />
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                        />
                                                    </svg>
                                                    Cancelling
                                                </>
                                            ) : (
                                                "Cancel"
                                            )}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-6 text-gray-500 font-medium">
                            No matching appointments found.
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedGroup && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedGroup(null)}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center px-6 py-4 border-b">
                            <h2 className="text-lg font-bold text-[#f00000]">Appointment Details</h2>
                            <button
                                onClick={() => setSelectedGroup(null)}
                                className="text-gray-400 hover:text-black text-xl leading-none"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-5">
                            {/* Current appointment */}
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                                    Current
                                </p>
                                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                                    <p><span className="font-semibold">Doctor:</span> {selectedGroup.latest.doctor?.doctor_name || "-"}</p>
                                    <p><span className="font-semibold">Exam Type:</span> {selectedGroup.latest.examType}</p>
                                    <p><span className="font-semibold">Date & Time:</span> {selectedGroup.latest.weekday}, {selectedGroup.latest.date} at {selectedGroup.latest.startTime}</p>
                                    <p><span className="font-semibold">Patient Name:</span> {selectedGroup.latest.firstName} {selectedGroup.latest.lastName}</p>
                                    <p><span className="font-semibold">Gender:</span> {selectedGroup.latest.gender || "-"}</p>
                                    <p><span className="font-semibold">Date of Birth:</span> {selectedGroup.latest.dob || "-"}</p>
                                    <p><span className="font-semibold">Phone:</span> {selectedGroup.latest.phone || "-"}</p>
                                    <p className="break-words"><span className="font-semibold">Email:</span> {selectedGroup.latest.email || "-"}</p>
                                    <p>
                                        <span className="font-semibold">Status:</span>{" "}
                                        <span
                                            className={
                                                selectedGroup.latest.status === "cancelled"
                                                    ? "text-red-500"
                                                    : "text-green-600"
                                            }
                                        >
                                            {selectedGroup.latest.status}
                                        </span>
                                        {selectedGroup.latest.status === "cancelled" && (
                                            <span className="text-gray-400">
                                                {" "}
                                                (cancelled by{" "}
                                                {selectedGroup.latest.cancelledBy === "admin"
                                                    ? "clinic"
                                                    : selectedGroup.latest.cancelledBy === "user"
                                                        ? "patient"
                                                        : "unknown"}
                                                )
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Reschedule history, if any */}
                            {selectedGroup.history.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                                        Reschedule History ({selectedGroup.history.length} earlier {selectedGroup.history.length === 1 ? "version" : "versions"})
                                    </p>
                                    <div className="space-y-3">
                                        {selectedGroup.history.map((h, hIdx) => (
                                            <div key={h._id} className="border rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                                                <p className="font-semibold text-gray-700 col-span-full mb-1">
                                                    {hIdx === selectedGroup.history.length - 1 ? "Originally booked" : "Rescheduled slot"}
                                                </p>
                                                <p><span className="font-semibold">Doctor:</span> {h.doctor?.doctor_name || "-"}</p>
                                                <p><span className="font-semibold">Exam Type:</span> {h.examType}</p>
                                                <p><span className="font-semibold">Date & Time:</span> {h.weekday}, {h.date} at {h.startTime}</p>
                                                <p><span className="font-semibold">Patient Name:</span> {h.firstName} {h.lastName}</p>
                                                <p><span className="font-semibold">Gender:</span> {h.gender || "-"}</p>
                                                <p><span className="font-semibold">Date of Birth:</span> {h.dob || "-"}</p>
                                                <p><span className="font-semibold">Phone:</span> {h.phone || "-"}</p>
                                                <p className="break-words"><span className="font-semibold">Email:</span> {h.email || "-"}</p>
                                                <p className="text-red-400 col-span-full">
                                                    cancelled (by{" "}
                                                    {h.cancelledBy === "admin"
                                                        ? "clinic"
                                                        : h.cancelledBy === "user"
                                                            ? "patient"
                                                            : "unknown"}
                                                    )
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {filteredExam.length > 0 && (
                <div className="flex justify-center mt-6 gap-2 flex-wrap">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-3 py-1 rounded-lg border hover:cursor-pointer ${currentPage === i + 1
                                ? "bg-[#f00000] text-white font-semibold"
                                : "bg-gray-100 hover:bg-gray-200"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Appointment;
