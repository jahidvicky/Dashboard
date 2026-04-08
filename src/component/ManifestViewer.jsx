import { useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../API/Api";

const ManifestViewer = () => {
    const { manifestNum } = useParams();

    useEffect(() => {
        const loadManifest = async () => {
            try {
                const response = await API.get(`shipping/manifest/${manifestNum}`, {
                    responseType: "blob",
                });
                const blob = new Blob([response.data], { type: "application/pdf" });
                const url = URL.createObjectURL(blob);
                window.location.href = url; // opens PDF directly
            } catch (err) {
                console.error("Failed to load manifest:", err);
            }
        };
        loadManifest();
    }, [manifestNum]);

    return (
        <div className="flex items-center justify-center h-screen text-gray-500">
            Loading manifest...
        </div>
    );
};

export default ManifestViewer;