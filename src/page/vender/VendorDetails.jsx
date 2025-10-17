import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import API, { IMAGE_URL } from "../../API/Api";

const VendorDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [vendor, setVendor] = React.useState(location.state?.vendor || null);

    // Fetch vendor if not passed via state
    React.useEffect(() => {
        const fetchVendor = async () => {
            if (!vendor) {
                try {
                    const res = await API.get(`/vendor/${id}`);
                    setVendor(res.data);
                } catch (error) {
                    console.error("Error fetching vendor:", error);
                }
            }
        };
        fetchVendor();
    }, [id, vendor]);

    if (!vendor) {
        return <div className="p-6 text-center">Loading vendor details...</div>;
    }

    // Basic fields
    const basicFields = [
        "contactName",
        "contactEmail",
        "contactPhone",
        "vendorType",
        "country",
        "state",
        "city",
    ];
    const companyFields = [
        "companyName",
        "operatingName",
        "businessNumber",
        "address1",
        "address2",
        "postalCode",
        "website",
        "brands",
    ];

    // Exclude system or sensitive fields
    const excludedFields = [
        "__v",
        "_id",
        "createdAt",
        "updatedAt",
        "password",
        "vendorPassword",
        "vendorId",
        "termsAccepted",
        "adminResponse",
        "profileImage"
    ];

    // Exclude known fields from “other”
    const knownFields = [...basicFields, ...companyFields, ...excludedFields];
    // Other fields (including documents)
    const otherFields = Object.keys(vendor).filter(
        (key) => ![...knownFields].includes(key)
    );

    // Render file link
    const renderFileLink = (file) => {
        if (!file || (Array.isArray(file) && file.length === 0)) {
            return <p className="text-gray-500">Not Uploaded</p>;
        }

        // If it's an array, render all files
        if (Array.isArray(file)) {
            return (
                <div className="flex flex-col gap-1">
                    {file.map((f, index) => {
                        const fileName = f.includes("http") ? f : f.split(/[/\\]/).pop();
                        const fileUrl =
                            fileName.startsWith("http://") || fileName.startsWith("https://")
                                ? fileName
                                : `${IMAGE_URL}${fileName}`;
                        return (
                            <a
                                key={index}
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-2 py-1 w-28 font-bold text-[12px] text-red-600 border rounded hover:border-black transition-colors duration-200"
                            >
                                View Document
                            </a>
                        );
                    })}
                </div>
            );
        }

        // Single file string
        const fileName = file.includes("http") ? file : file.split(/[/\\]/).pop();
        const fileUrl =
            fileName.startsWith("http://") || fileName.startsWith("https://")
                ? fileName
                : `${IMAGE_URL}${fileName}`;
        return (
            <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-2 py-1 w-28 font-bold text-[12px] text-red-600 border rounded hover:border-black transition-colors duration-200"
            >
                View Document
            </a>
        );
    };


    // Render section helper
    const renderSection = (title, fields) => (
        <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                {title}
            </h3>
            <div className="grid grid-cols-2 gap-4">
                {fields.map((field) => (
                    <div
                        key={field}
                        className="flex justify-content items-center border border-gray-300 rounded-lg p-3 bg-gray-50 shadow-sm"
                    >
                        <p className="font-medium text-gray-700 capitalize whitespace-nowrap">
                            {field.replace(/([A-Z])/g, " $1")}:
                        </p>
                        <p className="text-gray-900 ml-2 break-all">
                            {["certifications", "certificates"].includes(field)
                                ? renderFileLink(vendor[field])
                                : vendor[field] || "—"}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="p-6">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded mb-4"
            >
                ← Back
            </button>

            {/* Page Title */}
            <h2 className="text-2xl font-bold text-black mb-6 text-center">
                {vendor.companyName || "Vendor"} — Full Details
            </h2>

            {/* Basic Details */}
            <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                    Basic Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {basicFields.map((field) => (
                        <div
                            key={field}
                            className="flex items-center border border-gray-300 rounded-lg p-3 bg-gray-50 shadow-sm"
                        >
                            <p className="font-medium text-gray-700 capitalize whitespace-nowrap">
                                {field.replace(/([A-Z])/g, " $1")}:
                            </p>
                            <p className="text-gray-900 text-right ml-2 break-all">
                                {vendor[field] || "—"}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Company Details */}
            {renderSection("Company Details", companyFields)}

            {/* Other Details */}
            {renderSection("Other Details", otherFields)}
        </div>
    );
};

export default VendorDetails;
