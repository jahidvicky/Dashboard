import { useEffect, useState } from "react";
import API from "../../API/Api";
import Swal from "sweetalert2";

const FreeEyeCheckup = () => {
    const [eyeCheckup, setEyeChekup] = useState([]);

    // pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // settings state
    const [settings, setSettings] = useState({
        festivalActive: false,
        festivalName: "",
        startDate: "",
        endDate: "",
        ageMin: 19,
        ageMax: 64,
    });
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        fetchCheckups();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await API.get("/getEyeCheckupSettings");
            const data = res.data.data;
            setSettings({
                festivalActive: data.festivalActive || false,
                festivalName: data.festivalName || "",
                startDate: data.startDate ? data.startDate.slice(0, 10) : "",
                endDate: data.endDate ? data.endDate.slice(0, 10) : "",
                ageMin: data.ageMin ?? 19,
                ageMax: data.ageMax ?? 64,
            });
        } catch (error) {
            console.error("Failed to load eye checkup settings", error);
        }
    };

    const handleSettingsChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const saveSettings = async () => {
        if (settings.festivalActive && (!settings.festivalName || !settings.startDate || !settings.endDate)) {
            Swal.fire({
                icon: "warning",
                title: "Missing details",
                text: "Please fill in the occasion name, start date, and end date.",
                timer: 2500,
                showConfirmButton: false,
                toast: true,
                position: "top-end",
            });
            return;
        }

        setSavingSettings(true);
        try {
            await API.put("/updateEyeCheckupSettings", settings);
            Swal.fire({
                icon: "success",
                title: "Settings updated",
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: "top-end",
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Update failed",
                text: error?.response?.data?.message || "Something went wrong.",
                timer: 2500,
                showConfirmButton: false,
                toast: true,
                position: "top-end",
            });
        } finally {
            setSavingSettings(false);
        }
    };

    const fetchCheckups = async () => {
        try {
            const res = await API.get("/getEyeCheckup");
            const data = res.data.data || [];
            const sorted = [...data].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setEyeChekup(sorted);
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

            {/* ELIGIBILITY SETTINGS PANEL */}
            <div className="border border-gray-300 rounded-lg p-4 mb-6 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-[#f00000]">Free Checkup Eligibility Settings</h2>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                    By default, free checkups are open to ages under <strong>{settings.ageMin}</strong> or over <strong>{settings.ageMax}</strong>.
                    Turn on a festival offer to make it free for <strong>everyone</strong> during a specific date range.
                </p>

                <div className="flex items-center gap-3 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="festivalActive"
                            checked={settings.festivalActive}
                            onChange={handleSettingsChange}
                            className="w-5 h-5 accent-[#f00000] cursor-pointer"
                        />
                        <span className="font-medium">Enable Festival / Occasion Offer</span>
                    </label>
                </div>

                {settings.festivalActive && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Occasion / Reason</label>
                            <input
                                type="text"
                                name="festivalName"
                                value={settings.festivalName}
                                onChange={handleSettingsChange}
                                placeholder="e.g. Diwali, New Year"
                                className="w-full border rounded p-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                value={settings.startDate}
                                onChange={handleSettingsChange}
                                className="w-full border rounded p-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                value={settings.endDate}
                                onChange={handleSettingsChange}
                                className="w-full border rounded p-2 text-sm"
                            />
                        </div>
                    </div>
                )}

                <button
                    onClick={saveSettings}
                    disabled={savingSettings}
                    className="px-4 py-2 bg-[#f00000] text-white rounded hover:bg-red-700 disabled:opacity-60 text-sm font-semibold"
                >
                    {savingSettings ? "Saving..." : "Save Settings"}
                </button>
            </div>

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
                            <th className="border p-2">Age</th>
                            <th className="border p-2">Eligibility</th>
                            <th className="border p-2">Requested Date</th>
                            <th className="border p-2">Booked On</th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentData.length === 0 && (
                            <tr>
                                <td colSpan="7" className="text-center p-4">
                                    No Eye Checkup Request
                                </td>
                            </tr>
                        )}

                        {currentData.map((item) => (
                            <tr key={item._id} className="text-center">
                                <td className="border p-2">{item.name}</td>
                                <td className="border p-2">{item.email || "-"}</td>
                                <td className="border p-2">{item.phone}</td>
                                <td className="border p-2">{item.age ?? "-"}</td>
                                <td className="border p-2 capitalize">{item.eligibilityReason || "-"}</td>
                                <td className="border p-2">{item.date}</td>
                                <td className="border p-2 text-xs text-gray-500">
                                    {item.createdAt
                                        ? new Date(item.createdAt).toLocaleString()
                                        : "-"}
                                </td>
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