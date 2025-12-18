import { useEffect, useState } from "react";
import API, { IMAGE_URL } from "../../API/Api";

const FrameDonation = () => {
    const [donations, setDonations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [zoomImage, setZoomImage] = useState(null);

    useEffect(() => {
        fetchDonations();
    }, []);

    const fetchDonations = async () => {
        try {
            const res = await API.get("/community");
            setDonations(res.data.donations || []);
        } catch (error) {
            console.error("Failed to load donations", error);
        }
    };

    // normalize images (supports old + new data)
    const getImages = (item) => {
        if (Array.isArray(item.frameImages) && item.frameImages.length > 0) {
            return item.frameImages;
        }
        if (item.frameImage) {
            return [item.frameImage];
        }
        return [];
    };

    return (
        <div className="p-6">
            {/* IMAGE ZOOM MODAL */}
            {zoomImage && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60]"
                    onClick={() => setZoomImage(null)}
                >
                    <div className="relative max-w-5xl max-h-[90vh] p-4">
                        <img
                            src={zoomImage}
                            alt="Zoomed Frame"
                            className="max-h-[90vh] max-w-full object-contain rounded"
                        />
                        <button
                            onClick={() => setZoomImage(null)}
                            className="absolute top-4 right-6 text-black text-xl font-bold"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            <h1 className="text-2xl font-bold mb-4 text-[#f00000]">
                Frame Donations (Our Community)
            </h1>

            {/* LIST TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-300">
                    <thead className="bg-black text-white">
                        <tr>
                            <th className="border p-2">Name</th>
                            <th className="border p-2">Email</th>
                            <th className="border p-2">Phone</th>
                            <th className="border p-2">Date</th>
                            <th className="border p-2">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {donations.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center p-4">
                                    No donations found
                                </td>
                            </tr>
                        )}

                        {donations.map((item) => (
                            <tr key={item._id} className="text-center">
                                <td className="border p-2">{item.name}</td>
                                <td className="border p-2">{item.email}</td>
                                <td className="border p-2">{item.phone}</td>
                                <td className="border p-2">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </td>
                                <td className="border p-2">
                                    <button
                                        onClick={() => setSelected(item)}
                                        className="bg-blue-600 text-white px-3 py-1 rounded"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* DETAILS MODAL */}
            {selected && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
                        <h2 className="text-xl font-bold mb-4 text-[#f00000]">
                            Donation Details
                        </h2>

                        <p><b>Name:</b> {selected.name}</p>
                        <p><b>Email:</b> {selected.email}</p>
                        <p><b>Phone:</b> {selected.phone}</p>
                        <p><b>Address:</b> {selected.address}</p>
                        <p><b>Frame Type:</b> {selected.frameType}</p>
                
                        {/* MULTIPLE IMAGES */}
                        <div className="mt-4">
                            <b>Frame Images:</b>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                                {getImages(selected).map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={`${IMAGE_URL}${img}`}
                                        alt={`Frame ${idx + 1}`}
                                        className="h-40 w-full object-contain border cursor-pointer hover:scale-105 transition"
                                        onClick={() => setZoomImage(`${IMAGE_URL}${img}`)}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setSelected(null)}
                            className="absolute top-3 right-3 text-gray-600 text-xl"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FrameDonation;
