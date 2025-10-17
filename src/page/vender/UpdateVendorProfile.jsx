import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import API, { IMAGE_URL } from "../../API/Api"; //  Make sure IMAGE_URL is imported

const UpdateVendorProfile = () => {
    const [profileImage, setProfileImage] = useState(null);
    const [profilePreview, setProfilePreview] = useState(null)
    const [formData, setFormData] = useState({
        companyName: "",
        operatingName: "",
        businessNumber: "",
        contactName: "",
        contactTitle: "",
        contactEmail: "",
        contactPhone: "",
        vendorPassword: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        website: "",
        categories: [],
        brands: "",
        shippingTerms: "",
        leadTimes: "",
        moq: "",
        returnPolicy: "",
        accountHolder: "",
        bankName: "",
        accountNumber: "",
        transitNumber: "",
        institutionNumber: "",
        swift: "",
        iban: "",
        remittanceEmail: "",
        termsAccepted: false,
    });

    const [certificationFiles, setCertificationFiles] = useState([]);
    const [certificateFiles, setCertificateFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [categoriesInput, setCategoriesInput] = useState("");

    // Fetch vendor profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const vendorData = JSON.parse(localStorage.getItem("user"));
                const vendorId = vendorData?._id;

                if (!vendorId) {
                    Swal.fire("Error", "Vendor ID not found in localStorage", "error");
                    return;
                }

                const res = await API.get(`/getVendorById/${vendorId}`, {
                    withCredentials: true,
                });

                const data = res.data.vendor || {};
                setFormData((prev) => ({
                    ...prev,
                    companyName: data.companyName || "",
                    operatingName: data.operatingName || "",
                    contactName: data.contactName || "",
                    contactEmail: data.contactEmail || "",
                    businessNumber: data.businessNumber || "",
                    contactTitle: data.contactTitle || "",
                    contactPhone: data.contactPhone || "",
                    vendorPassword: data.vendorPassword || "",
                    address1: data.address1 || "",
                    address2: data.address2 || "",
                    city: data.city || "",
                    state: data.state || "",
                    postalCode: data.postalCode || "",
                    country: data.country || "",
                    website: data.website || "",
                    categories: data.categories || [], // Not returned by getVendorById
                    brands: data.brands || "",
                    shippingTerms: data.shippingTerms || "",
                    leadTimes: data.leadTimes || "",
                    moq: data.moq || "",
                    returnPolicy: data.returnPolicy || "",
                    accountHolder: data.accountHolder || "",
                    bankName: data.bankName || "",
                    accountNumber: data.accountNumber || "",
                    transitNumber: data.transitNumber || "",
                    institutionNumber: data.institutionNumber || "",
                    swift: data.swift || "",
                    iban: data.iban || "",
                    remittanceEmail: data.remittanceEmail || "",
                    termsAccepted: false, // Must re-accept terms
                }));

                if (data.profileImage) {
                    setProfileImage(data.profileImage); // backend filename/path
                    setProfilePreview(null); // reset preview
                }
                setCategoriesInput((data.categories || []).join(", "));
                setCertificationFiles(data.certifications || []);
                setCertificateFiles(data.certificates || []);
            } catch (err) {
                Swal.fire(
                    "Error",
                    err.response?.data?.message || "Failed to load vendor profile",
                    "error"
                );
            }
        };

        fetchProfile();
    }, []);

    // Validate form fields
    const validateForm = () => {
        const newErrors = {};
        if (!formData.companyName) newErrors.companyName = "Company name is required";
        if (!formData.contactEmail) {
            newErrors.contactEmail = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
            newErrors.contactEmail = "Invalid email format";
        }
        if (!formData.termsAccepted) {
            newErrors.termsAccepted = "You must accept the Terms & Conditions";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle input fields
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    // Handle categories input
    const handleCategoriesChange = (e) => {
        setCategoriesInput(e.target.value);
        const values = e.target.value
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);
        setFormData({ ...formData, categories: values });
    };

    // Handle profile image
    const handleProfileImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file); // File for upload
            setProfilePreview(URL.createObjectURL(file)); // Show preview
        }
    };

    // Handle file inputs
    const handleFileChange = (e, type) => {
        const files = Array.from(e.target.files);
        if (type === "certifications") {
            setCertificationFiles((prev) => [...prev, ...files]);
        } else {
            setCertificateFiles((prev) => [...prev, ...files]);
        }
    };

    // Remove file
    const removeFile = (type, index) => {
        if (type === "certifications") {
            setCertificationFiles((prev) => prev.filter((_, i) => i !== index));
        } else {
            setCertificateFiles((prev) => prev.filter((_, i) => i !== index));
        }
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            Swal.fire("Validation Error", "Please fix the errors in the form", "warning");
            return;
        }

        setLoading(true);
        try {
            const uploadData = new FormData();

            // Append all form fields except backend-managed ones
            Object.keys(formData).forEach((key) => {
                if (key !== "termsAccepted") {
                    if (Array.isArray(formData[key])) {
                        formData[key].forEach((val) => uploadData.append(key, val));
                    } else {
                        uploadData.append(key, formData[key]);
                    }
                }
            });

            //  Append profile image if it's a File
            if (profileImage instanceof File) {
                uploadData.append("profileImage", profileImage);
            }

            certificationFiles.forEach((file) => {
                if (file instanceof File) {
                    uploadData.append("certifications", file);
                }
            });
            certificateFiles.forEach((file) => {
                if (file instanceof File) {
                    uploadData.append("certificates", file);
                }
            });

            const res = await API.put(`/vendorProfile`, uploadData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });

            //  Update profile image from backend after save
            if (res.data?.vendor?.profileImage) {
                window.dispatchEvent(new Event("profileUpdated"));
                setProfileImage(res.data.vendor.profileImage);
                setProfilePreview(null);
            }

            Swal.fire("Success", res.data.message, "success");
        } catch (err) {
            Swal.fire(
                "Error",
                err.response?.data?.message || "Failed to update profile",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-6xl mx-auto bg-white shadow-md rounded-xl p-8 space-y-8"
        >
            <h2 className="text-2xl font-bold mb-4">Vendor Profile</h2>

            {/* Company Info */}
            <section>
                <h3 className="text-lg font-semibold border-b pb-1 mb-3">Company Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="companyName" className="block font-medium text-gray-700">
                            Company Legal Name
                        </label>
                        <input
                            id="companyName"
                            name="companyName"
                            placeholder="Company Legal Name"
                            value={formData.companyName}
                            onChange={handleChange}
                            className={`input ${errors.companyName ? "border-red-500" : ""}`}
                        />
                        {errors.companyName && (
                            <p className="text-red-500 text-sm">{errors.companyName}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-600">
                            Profile Image
                        </label>
                        <input
                            type="file"
                            onChange={handleProfileImage}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-400 outline-none"
                            accept="image/*"
                        />
                        {(profilePreview || profileImage) && (
                            <div className="mt-3">
                                <img
                                    src={
                                        profilePreview
                                            ? profilePreview
                                            : `${IMAGE_URL}${profileImage}` // from backend
                                    }
                                    alt="Profile Preview"
                                    className="w-24 h-24 object-cover rounded-full border shadow"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="operatingName" className="block font-medium text-gray-700">
                            Operating/Trade Name
                        </label>
                        <input
                            id="operatingName"
                            name="operatingName"
                            placeholder="Operating/Trade Name"
                            value={formData.operatingName}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>
                    <div>
                        <label htmlFor="businessNumber" className="block font-medium text-gray-700">
                            Business Number
                        </label>
                        <input
                            id="businessNumber"
                            name="businessNumber"
                            placeholder="Business Number"
                            value={formData.businessNumber}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section>
                <h3 className="text-lg font-semibold border-b pb-1 mb-3">Primary Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="contactName" className="block font-medium text-gray-700">
                            Full Name
                        </label>
                        <input
                            id="contactName"
                            name="contactName"
                            placeholder="Full Name"
                            value={formData.contactName}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>
                    <div>
                        <label htmlFor="contactTitle" className="block font-medium text-gray-700">
                            Job Title
                        </label>
                        <input
                            id="contactTitle"
                            name="contactTitle"
                            placeholder="Job Title"
                            value={formData.contactTitle}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>
                    <div>
                        <label htmlFor="contactEmail" className="block font-medium text-gray-700">
                            Email *
                        </label>
                        <input
                            type="email"
                            id="contactEmail"
                            name="contactEmail"
                            placeholder="Email *"
                            value={formData.contactEmail}
                            onChange={handleChange}
                            className={`input ${errors.contactEmail ? "border-red-500" : ""}`}
                        />
                        {errors.contactEmail && (
                            <p className="text-red-500 text-sm">{errors.contactEmail}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="contactPhone" className="block font-medium text-gray-700">
                            Phone
                        </label>
                        <input
                            id="contactPhone"
                            name="contactPhone"
                            placeholder="Phone"
                            value={formData.contactPhone}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>
                    <div>
                        <label htmlFor="vendorPassword" className="block font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="vendorPassword"
                            name="vendorPassword"
                            placeholder="Password"
                            value={formData.vendorPassword}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>
                </div>
            </section>

            {/* Address */}
            <section>
                <h3 className="text-lg font-semibold border-b pb-1 mb-3">Business Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="address1" className="block font-medium text-gray-700">
                            Address Line 1
                        </label>
                        <input
                            id="address1"
                            name="address1"
                            placeholder="Address Line 1"
                            value={formData.address1}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>
                    <div>
                        <label htmlFor="address2" className="block font-medium text-gray-700">
                            Address Line 2
                        </label>
                        <input
                            id="address2"
                            name="address2"
                            placeholder="Address Line 2"
                            value={formData.address2}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>
                    <div>
                        <label htmlFor="city" className="block font-medium text-gray-700">
                            City
                        </label>
                        <input
                            id="city"
                            name="city"
                            placeholder="City"
                            value={formData.city}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>
                    <div>
                        <label htmlFor="state" className="block font-medium text-gray-700">
                            State
                        </label>
                        <input
                            id="state"
                            name="state"
                            placeholder="State"
                            value={formData.state}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>
                    <div>
                        <label htmlFor="postalCode" className="block font-medium text-gray-700">
                            Postal Code
                        </label>
                        <input
                            id="postalCode"
                            name="postalCode"
                            placeholder="Postal Code"
                            value={formData.postalCode}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>
                    <div>
                        <label htmlFor="country" className="block font-medium text-gray-700">
                            Country
                        </label>
                        <input
                            id="country"
                            name="country"
                            placeholder="Country"
                            value={formData.country}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>
                    <div>
                        <label htmlFor="website" className="block font-medium text-gray-700">
                            Website
                        </label>
                        <input
                            type="url"
                            id="website"
                            name="website"
                            placeholder="Website"
                            value={formData.website}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>
                </div>
            </section>

            {/* Products */}
            <section>
                <h3 className="text-lg font-semibold border-b pb-1 mb-3">Products</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-medium text-gray-700">Categories</label>
                        <input value={categoriesInput}
                            onChange={handleCategoriesChange}
                            className="input"
                            placeholder="Categories (comma separated)" />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700">Brands Carried</label>
                        <input name="brands"
                            value={formData.brands}
                            onChange={handleChange}
                            className="input" />
                    </div>
                </div>
            </section>

            {/* Shipping */}
            <section>
                <h3 className="text-lg font-semibold border-b pb-1 mb-3">Shipping & Policies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="shippingTerms" className="block font-medium text-gray-700">
                            Shipping Terms
                        </label>
                        <input
                            id="shippingTerms"
                            name="shippingTerms"
                            placeholder="Shipping Terms"
                            value={formData.shippingTerms}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>
                    <div>
                        <label htmlFor="leadTimes" className="block font-medium text-gray-700">
                            Lead Times
                        </label>
                        <input
                            id="leadTimes"
                            name="leadTimes"
                            placeholder="Lead Times"
                            value={formData.leadTimes}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>
                    <div>
                        <label htmlFor="moq" className="block font-medium text-gray-700">
                            Minimum Order Quantity
                        </label>
                        <input
                            id="moq"
                            name="moq"
                            placeholder="Minimum Order Quantity"
                            value={formData.moq}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>
                    <div>
                        <label htmlFor="returnPolicy" className="block font-medium text-gray-700">
                            Return Policy
                        </label>
                        <textarea
                            id="returnPolicy"
                            name="returnPolicy"
                            placeholder="Return Policy"
                            value={formData.returnPolicy}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>
                </div>
            </section>

            {/* Banking */}
            <section>
                <h3 className="text-lg font-semibold border-b pb-1 mb-3">Bank / EFT Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        "accountHolder",
                        "bankName",
                        "accountNumber",
                        "transitNumber",
                        "institutionNumber",
                        "swift",
                        "iban",
                        "remittanceEmail",
                    ].map((field) => (
                        <div key={field}>
                            <label htmlFor={field} className="block font-medium text-gray-700">
                                {field
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (s) => s.toUpperCase())}
                            </label>
                            <input
                                id={field}
                                name={field}
                                placeholder={field
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (s) => s.toUpperCase())}
                                value={formData[field]}
                                onChange={handleChange}
                                className="input"
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* Certifications */}
            <section>
                <h3 className="text-lg font-semibold border-b pb-1 mb-3">Certifications</h3>
                <label htmlFor="certifications" className="block font-medium text-gray-700">
                    Upload Certifications
                </label>
                <input
                    id="certifications"
                    type="file"
                    multiple
                    onChange={(e) => handleFileChange(e, "certifications")}
                    className="file-input"
                />
                {Array.isArray(certificationFiles) && certificationFiles.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-700">
                        {certificationFiles.map((file, idx) => {
                            // Generate file URL for preview
                            const fileUrl =
                                typeof file === "string"
                                    ? file.startsWith("http")
                                        ? file
                                        : `${IMAGE_URL}${file}`
                                    : URL.createObjectURL(file);

                            return (
                                <li
                                    key={idx}
                                    className="flex items-center justify-content bg-gray-50 p-2 pr-150 rounded mb-1"
                                >
                                    <span className="truncate w-1/2">{file.name || file}</span>

                                    <div className="flex gap-3">
                                        {/* View Document */}
                                        <button
                                            type="button"
                                            onClick={() => window.open(fileUrl, "_blank")}
                                            className="text-blue-600 hover:underline hover:cursor-pointer"
                                        >
                                            View
                                        </button>

                                        {/* Remove */}
                                        <button
                                            type="button"
                                            onClick={() => removeFile("certifications", idx)}
                                            className="text-red-500 hover:underline hover:cursor-pointer"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>


            {/* Certificates */}
            <section>
                <h3 className="text-lg font-semibold border-b pb-1 mb-3">Certificates</h3>
                <label htmlFor="certificates" className="block font-medium text-gray-700">
                    Upload Certificates
                </label>
                <input
                    id="certificates"
                    type="file"
                    multiple
                    onChange={(e) => handleFileChange(e, "certificates")}
                    className="file-input"
                />
                {Array.isArray(certificateFiles) && certificateFiles.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-700">
                        {certificateFiles.map((file, idx) => {
                            // Determine the file URL
                            const fileUrl =
                                typeof file === "string"
                                    ? file.startsWith("http")
                                        ? file
                                        : `${IMAGE_URL}${file}`
                                    : URL.createObjectURL(file);

                            return (
                                <li key={idx} className="flex items-center justify-content bg-gray-50 p-2 pr-150 rounded mb-1">
                                    <span className="truncate w-1/2">{file.name || file}</span>

                                    <div className="flex gap-3">
                                        {/* View Document Button */}
                                        <button
                                            type="button"
                                            onClick={() => window.open(fileUrl, "_blank")}
                                            className="text-blue-600 hover:underline hover:cursor-pointer"
                                        >
                                            View
                                        </button>

                                        {/* Remove Button */}
                                        <button
                                            type="button"
                                            onClick={() => removeFile("certificates", idx)}
                                            className="text-red-500 hover:underline hover:cursor-pointer"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            {/* Terms */}
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="termsAccepted"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    className="h-4 w-4"
                />
                <label
                    htmlFor="termsAccepted"
                    className="text-sm font-medium text-gray-700"
                >
                    I accept the Terms & Conditions and Privacy Policy.
                </label>
                {errors.termsAccepted && (
                    <p className="text-red-500 text-sm">{errors.termsAccepted}</p>
                )}
            </div>


            {/* Submit */}
            <button
                type="submit"
                disabled={loading || !formData.termsAccepted}
                className={`w-full font-semibold p-3 rounded-lg hover:cursor-pointer ${loading || !formData.termsAccepted
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
            >
                {loading ? "Submitting..." : "Submit Profile"}
            </button>
        </form>
    );
};

export default UpdateVendorProfile;
