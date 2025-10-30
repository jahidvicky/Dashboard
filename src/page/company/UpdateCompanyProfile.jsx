import React, { useEffect, useState } from "react";
import API, { IMAGE_URL } from "../../API/Api";
import Swal from "sweetalert2";

export default function UpdateCompanyProfile() {
  const [profileImage, setProfileImage] = useState(null); // backend filename OR File
  const [profilePreview, setProfilePreview] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    companyPassword: "", // keep blank; never pre-fill
    legalEntity: "",
    networkPayerId: "",
    efRemittance: "",
    providerName: "",
    providerNumber: "",
    providerEmail: "",
    claim: [],
    serviceStandards: "",
    agreementAccepted: false,
    address1: "",
    address2: "",
  });

  const [files, setFiles] = useState({
    signedAgreement: null,
    licenseProof: null,
    voidCheque: null,
  });

  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({
    province: "",
    city: "",
    postalCode: "",
  });

  const provinces = [
    "Alberta",
    "British Columbia",
    "Manitoba",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Nova Scotia",
    "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = name === "postalCode" ? value.toUpperCase() : value;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : newValue,
    }));

    if (["province", "city", "postalCode"].includes(name)) {
      setLocation((prevLocation) => ({
        ...prevLocation,
        [name]: newValue,
      }));
    }
  };

  // Handle claim checkboxes
  const handleClaimChange = (method) => {
    setFormData((prev) => {
      if (prev.claim.includes(method)) {
        return { ...prev, claim: prev.claim.filter((c) => c !== method) };
      }
      return { ...prev, claim: [...prev.claim, method] };
    });
  };

  // Handle file input
  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] }));
  };

  // Handle profile image
  const handleProfileImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file); // File for upload
      setProfilePreview(URL.createObjectURL(file)); // Show preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const companyData = JSON.parse(localStorage.getItem("user"));
      const companyId = companyData?._id;

      if (!companyId) {
        Swal.fire("Error", "Company ID not found", "error");
        setLoading(false);
        return;
      }

      const data = new FormData();

      // Append formData fields
      for (let key in formData) {
        if (key === "claim") {
          formData.claim.forEach((c) => data.append("claim", c));
        } else if (key === "companyPassword" && !formData[key]) {
          continue; // skip empty password
        } else {
          data.append(key, formData[key]);
        }
      }

      // Append location fields as strings
      for (let key in location) {
        if (location[key]) {
          data.append(key, String(location[key])); // ensures string
        }
      }

      // Append other files
      for (let key in files) {
        if (files[key]) {
          data.append(key, files[key]);
        }
      }

      // Append profile image
      if (profileImage instanceof File) {
        data.append("profileImage", profileImage);
      }

      const res = await API.put(`/companyProfile/${companyId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      // Update backend profile image for preview
      if (res.data?.company?.profileImage) {
        setProfileImage(res.data.company.profileImage);
        setProfilePreview(null);
      }

      Swal.fire("Success", "Company profile updated successfully!", "success");
    } catch (error) {
      console.error(error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to update company profile",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch company profile
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const companyData = JSON.parse(localStorage.getItem("user"));
        const companyId = companyData?._id;
        if (!companyId) return;

        const res = await API.get(`/getCompanyById/${companyId}`, {
          withCredentials: true,
        });

        const data = res.data.company || {};
        setFormData((prev) => ({
          ...prev,
          companyName: data.companyName || "",
          companyEmail: data.companyEmail || "",
          companyPassword: "", // never pre-fill password
          legalEntity: data.legalEntity || "",
          networkPayerId: data.networkPayerId || "",
          efRemittance: data.efRemittance || "",
          providerName: data.providerName || "",
          providerNumber: data.providerNumber || "",
          providerEmail: data.providerEmail || "",
          claim: data.claim || [],
          serviceStandards: data.serviceStandards || "",
          agreementAccepted: data.agreementAccepted || false,
          city: data.city || "",
          province: data.province,
          postalCode: data.postalCode || "",
          address1: data.address1 || "",
          address2: data.address2 || "",
        }));

        //  Load existing profile image from backend
        if (data.profileImage) {
          setProfileImage(data.profileImage);
        }
      } catch (err) {
        Swal.fire(
          "Error",
          err.response?.data?.message || "Failed to load company profile",
          "error"
        );
      }
    };

    fetchCompanyProfile();
  }, []);

  const inputClass =
    "w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-red-500";

  return (
    <div className="bg-white shadow-lg m-4 md:m-10 rounded-xl">
      <div className="p-6 md:p-10">
        <h1 className="text-xl md:text-2xl font-bold mb-6 text-gray-800">
          Update Insurance Company Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Company Name</label>
              <input
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Company Email</label>
              <input
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleChange}
                className={inputClass}
                required
              />
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
                        : `${IMAGE_URL}${profileImage}`
                    }
                    alt="Profile Preview"
                    className="w-24 h-24 object-cover rounded-full border shadow"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1">Password</label>
              <input
                type="password"
                name="companyPassword"
                value={formData.companyPassword}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Legal Entity</label>
              <input
                name="legalEntity"
                value={formData.legalEntity}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">
                Network / Payer ID
              </label>
              <input
                name="networkPayerId"
                value={formData.networkPayerId}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">EFT / Remittance</label>
              <input
                name="efRemittance"
                value={formData.efRemittance}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </section>

          <section>
            <h2 className="font-medium mb-3 text-gray-700">
              Provider Relations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                name="providerName"
                value={formData.providerName}
                onChange={handleChange}
                placeholder="Jane Doe"
                className={inputClass}
              />
              <input
                type="tel"
                name="providerNumber"
                value={formData.providerNumber}
                onChange={handleChange}
                placeholder="+1 555 555 5555"
                className={inputClass}
              />
              <input
                type="email"
                name="providerEmail"
                value={formData.providerEmail}
                onChange={handleChange}
                placeholder="support@acme.com"
                className={inputClass}
              />
            </div>
          </section>

          <section>
            <h2 className="font-medium mb-3 text-gray-700">Claim Submission</h2>
            <div className="flex flex-wrap gap-4">
              {["EDI", "Portal", "Email", "Fax"].map((method) => (
                <label key={method} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.claim.includes(method)}
                    onChange={() => handleClaimChange(method)}
                  />
                  <span>{method}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-medium mb-3 text-gray-700">Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1">Signed Agreement</label>
                <input
                  type="file"
                  name="signedAgreement"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">License Proof</label>
                <input
                  type="file"
                  name="licenseProof"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Void Cheque</label>
                <input
                  type="file"
                  name="voidCheque"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
            </div>
          </section>

          <section>
            <label className="block font-medium mb-1">Service Standards</label>
            <textarea
              name="serviceStandards"
              value={formData.serviceStandards}
              onChange={handleChange}
              rows={4}
              className={inputClass}
            />
          </section>
          <section>
            <h2 className="block font-medium mb-1">Enter Office Location</h2>
            {/* Province Selection */}
            <label htmlFor="province">Select Province:</label>
            <select
              id="province"
              name="province"
              value={formData.province}
              onChange={handleChange}
              required
              className="w-full border rounded px-2 py-1 mt-1"
            >
              <option value="">--Select Province--</option>
              {provinces.map((province, index) => (
                <option key={index} value={province}>
                  {province}
                </option>
              ))}
            </select>

            {/* City Input */}
            <label htmlFor="city">Enter City:</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g., Toronto"
              required
              className="w-full border rounded px-2 py-1 mt-1"
            />

            <div>
              <label className="block font-medium mb-1">Address 1</label>
              <input
                name="address1"
                value={formData.address1}
                onChange={handleChange}
                className={inputClass}
                placeholder="Street, building, etc."
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Address 2</label>
              <input
                name="address2"
                value={formData.address2}
                onChange={handleChange}
                className={inputClass}
                placeholder="Apartment, suite, etc."
              />
            </div>

            {/* Postal Code Input */}
            <label htmlFor="postalCode">Enter Postal Code:</label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="e.g., M5A 1A1"
              required
              className="w-full border rounded px-2 py-1 mt-1"
            />
          </section>

          <section className="flex items-center gap-2">
            <input
              type="checkbox"
              name="agreementAccepted"
              checked={formData.agreementAccepted}
              onChange={handleChange}
            />
            <label>I accept the terms of the agreement</label>
          </section>

          <div>
            <button
              type="submit"
              disabled={loading || !formData.agreementAccepted}
              className={`w-full md:w-auto font-semibold p-3 rounded-lg hover:cursor-pointer 
                ${loading || !formData.agreementAccepted
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white"
                }`}
            >
              {loading ? "Updating..." : "Update Company Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
