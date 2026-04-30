import { useEffect, useState } from "react";
import API from "../../API/Api";

const FreeEyeCheckup = () => {
    const [eyeCheckup, setEyeChekup] = useState([]);

    // pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchCheckups();
    }, []);

    const fetchCheckups = async () => {
        try {
            const res = await API.get("/getEyeCheckup");
            setEyeChekup(res.data.data || []);
        } catch (error) {
            console.error("Failed to load eye checkup requests", error);
        }
    };

    // pagination logic
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentData = eyeCheckup.slice(indexOfFirst, indexOfLast);

    const totalPages = Math.ceil(eyeCheckup.length / itemsPerPage);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-[#f00000]">
                Eye Checkup Requests
            </h1>

            {/* SCROLLABLE TABLE */}
            <div
                className={`border border-gray-300 ${currentData.length >= itemsPerPage
                        ? "max-h-[400px] overflow-y-auto"
                        : ""
                    }`}
            >
                <table className="w-full border-collapse">
                    <thead className="bg-black text-white sticky top-0 z-10">
                        <tr>
                            <th className="border p-2">Name</th>
                            <th className="border p-2">Email</th>
                            <th className="border p-2">Phone</th>
                            <th className="border p-2">Date</th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentData.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center p-4">
                                    No Eye Checkup Request
                                </td>
                            </tr>
                        )}

                        {currentData.map((item) => (
                            <tr key={item._id} className="text-center">
                                <td className="border p-2">{item.name}</td>
                                <td className="border p-2">{item.email}</td>
                                <td className="border p-2">{item.phone}</td>
                                <td className="border p-2">{item.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            <div className="flex justify-center mt-4 gap-2">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-3 py-1 border bg-gray-200"
                    disabled={currentPage === 1}
                >
                    Prev
                </button>

                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-3 py-1 border ${currentPage === index + 1
                            ? "bg-red-500 text-white"
                            : "bg-white"
                            }`}
                    >
                        {index + 1}
                    </button>
                ))}

                <button
                    onClick={() =>
                        setCurrentPage(prev => Math.min(prev + 1, totalPages))
                    }
                    className="px-3 py-1 border bg-gray-200"
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default FreeEyeCheckup;