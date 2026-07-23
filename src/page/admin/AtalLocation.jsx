import { useEffect, useState } from "react";
import API, { IMAGE_URL } from "../../api/api"; // adjust path to match where this file actually lives
import { toast } from "react-toastify"; // remove if you use a different toast lib

const emptyForm = { title: "", address: "", mapQuery: "", image: null };

const resolveImgSrc = (img) => {
    if (!img) return null;
    return img.startsWith("http") ? img : `${IMAGE_URL}${img}`;
};

const AtalLocation = () => {
    const [locations, setLocations] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [preview, setPreview] = useState(null);
    const [fileName, setFileName] = useState("");
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchLocations = async () => {
        try {
            const res = await API.get("/location");
            setLocations(res.data.data || res.data);
        } catch (err) {
            toast.error("Failed to load locations");
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "image" && files[0]) {
            setForm((f) => ({ ...f, image: files[0] }));
            setPreview(URL.createObjectURL(files[0]));
            setFileName(files[0].name);
        } else {
            setForm((f) => ({ ...f, [name]: value }));
        }
    };

    const resetForm = () => {
        setForm(emptyForm);
        setPreview(null);
        setFileName("");
        setEditId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append("title", form.title);
            fd.append("address", form.address);
            fd.append("mapQuery", form.mapQuery);
            if (form.image) fd.append("image", form.image);

            if (editId) {
                await API.put(`/location/${editId}`, fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success("Location updated");
            } else {
                await API.post("/location", fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success("Location added");
            }
            resetForm();
            fetchLocations();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (loc) => {
        setEditId(loc._id);
        setForm({
            title: loc.title,
            address: loc.address,
            mapQuery: loc.mapQuery,
            image: null,
        });
        setPreview(resolveImgSrc(loc.image));
        setFileName("");
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this location?")) return;
        try {
            await API.delete(`/location/${id}`);
            toast.success("Location deleted");
            fetchLocations();
        } catch (err) {
            toast.error("Failed to delete location");
        }
    };

    return (
        <div className="max-w-5xl">
            <h2 className="text-2xl font-bold mb-6">Manage Locations</h2>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow rounded-lg p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        placeholder="e.g. North Location"
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <input
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        required
                        placeholder="Full address"
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                        Map Location
                    </label>
                    <textarea
                        name="mapQuery"
                        value={form.mapQuery}
                        onChange={handleChange}
                        required
                        rows={3}
                        placeholder='Paste a plain address (e.g. "Ottawa, ON, Canada"), OR paste the full <iframe> embed code from Google Maps "Share > Embed a map"'
                        className="w-full border rounded px-3 py-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        You can paste either a plain address or the full embed code/link from Google Maps — both work.
                    </p>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Image</label>
                    <label
                        htmlFor="location-image-input"
                        className="flex items-center gap-3 border border-dashed border-gray-300 rounded px-4 py-3 cursor-pointer transition-colors hover:border-[#f00000] hover:bg-red-50"
                    >
                        <span className="bg-[#f00000] text-white text-sm px-4 py-1.5 rounded hover:bg-red-700 transition-colors">
                            Choose Image
                        </span>
                        <span className="text-sm text-gray-600 truncate">
                            {fileName || "No file chosen"}
                        </span>
                    </label>
                    <input
                        id="location-image-input"
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                    />
                    {preview && (
                        <img
                            src={preview}
                            alt="preview"
                            className="mt-3 h-32 w-48 object-cover rounded border"
                        />
                    )}
                </div>

                <div className="md:col-span-2 flex gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#f00000] text-white px-6 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                    >
                        {loading ? "Saving..." : editId ? "Update Location" : "Add Location"}
                    </button>
                    {editId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-6 py-2 rounded border border-gray-300"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-left">
                        <tr>
                            <th className="p-3">Image</th>
                            <th className="p-3">Title</th>
                            <th className="p-3">Address</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {locations.map((loc) => (
                            <tr key={loc._id} className="border-t">
                                <td className="p-3">
                                    <img
                                        src={resolveImgSrc(loc.image)}
                                        alt={loc.title}
                                        className="h-12 w-16 object-cover rounded"
                                    />
                                </td>
                                <td className="p-3 font-medium">{loc.title}</td>
                                <td className="p-3 text-gray-600">{loc.address}</td>
                                <td className="p-3 space-x-2">
                                    <button
                                        onClick={() => handleEdit(loc)}
                                        className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-600 hover:text-white transition-colors text-xs font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(loc._id)}
                                        className="bg-red-100 text-red-700 px-3 py-1.5 rounded hover:bg-red-600 hover:text-white transition-colors text-xs font-medium"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {locations.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-4 text-center text-gray-500">
                                    No locations added yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AtalLocation;