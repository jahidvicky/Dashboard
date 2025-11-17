import { useState } from "react";
import API from "../../API/Api";
import Swal from "sweetalert2";

export default function VendorRegistrationForm() {
  const [formData, setFormData] = useState({
    vendorType: "", // supplier | lab | brand
    // Company Information
    companyName: "",
    operatingName: "",
    businessNumber: "",

    // Contact Information
    contactName: "",
    contactTitle: "",
    contactEmail: "",
    contactPhone: "",

    // Address
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",

    // Business Details
    website: "",
    categories: [],
    brands: "",

    // Shipping / Policies
    shippingTerms: "",
    leadTimes: "",
    moq: "",
    returnPolicy: "",

    // Banking Details
    accountHolder: "",
    bankName: "",
    accountNumber: "",
    transitNumber: "",
    institutionNumber: "",
    swift: "",
    iban: "",
    remittanceEmail: "",

    // Terms
    termsAccepted: false,
  });

  const [certifications, setCertifications] = useState([]);
  const [certificates, setCertificates] = useState([]);

  // Categories list
  const categories = [
    { key: "frames", label: "Frames" },
    { key: "lenses", label: "Lenses" },
    { key: "coatings", label: "Coatings" },
    { key: "accessories", label: "Accessories" },
  ];

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCategoryChange = (key) => {
    setFormData((prev) => {
      const exists = prev.categories.includes(key);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((c) => c !== key)
          : [...prev.categories, key],
      };
    });
  };

  const handleFileChange = (e, setter) => {
    setter([...e.target.files]);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => data.append(`${key}[]`, v));
        } else {
          data.append(key, value);
        }
      });

      certifications.forEach((file) => data.append("certifications", file));
      certificates.forEach((file) => data.append("certificates", file));

      const res = await API.post(
        "/create-vendor", // change to your backend API
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      Swal.fire({
        icon: "success",
        title: "Done!",
        text: "Vendor registered successfully!",
        timer: 2000,
        showConfirmButton: false,
      });

      // Reset form
      setFormData({
        companyName: "",
        operatingName: "",
        businessNumber: "",
        contactName: "",
        contactTitle: "",
        contactEmail: "",
        contactPhone: "",
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
      setCertifications([]);
      setCertificates([]);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "success",
        title: "Done!",
        text: "Error submitting form",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="mx-auto p-4 md:p-8">
      <form onSubmit={handleSubmit}>
        <div className="space-y-8 p-6 rounded-2xl shadow-2xl bg-white">
          <h2 className="text-2xl font-bold">Vendor Registration</h2>
          <div>Select Vendor Type</div>
          <div className="flex gap-4">
            <label className="flex gap-2">
              <input
                type="radio"
                name="vendorType"
                value="supplier"
                checked={formData.vendorType === "supplier"}
                onChange={handleChange}
              />
              Supplier
            </label>

            <label className="flex gap-2">
              <input
                type="radio"
                name="vendorType"
                value="lab"
                checked={formData.vendorType === "lab"}
                onChange={handleChange}
              />
              Lab
            </label>

            <label className="flex gap-2">
              <input
                type="radio"
                name="vendorType"
                value="brand"
                checked={formData.vendorType === "brand"}
                onChange={handleChange}
              />
              Brand
            </label>
          </div>

          {/* Company Information */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Company legal name"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <input
                placeholder="Operating name"
                name="operatingName"
                value={formData.operatingName}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <input
                placeholder="Business registration number"
                name="businessNumber"
                value={formData.businessNumber}
                onChange={handleChange}
                className="border rounded p-2"
              />
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Contact name"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <input
                placeholder="title"
                name="contactTitle"
                value={formData.contactTitle}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <input
                placeholder="Email"
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <input
                placeholder="Phone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="border rounded p-2"
              />
            </div>
          </section>

          {/* Address */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Address line 1"
                name="address1"
                value={formData.address1}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <input
                placeholder="Address line 2"
                name="address2"
                value={formData.address2}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <input
                placeholder="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <input
                placeholder="State/Province"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <input
                placeholder="Postal code"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <input
                placeholder="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="border rounded p-2"
              />
            </div>
          </section>

          {/* Business Details */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Business Details</h3>
            <input
              placeholder="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="border rounded p-2 w-full mb-4"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((c) => (
                <label
                  key={c.key}
                  className="flex items-center gap-2 border p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(c.key)}
                    onChange={() => handleCategoryChange(c.key)}
                  />
                  {c.label}
                </label>
              ))}
            </div>
            <input
              placeholder="Brands represented"
              name="brands"
              value={formData.brands}
              onChange={handleChange}
              className="border rounded p-2 w-full mt-4"
            />
          </section>

          {/* Shipping / Policies */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Shipping & Policies</h3>
            <textarea
              placeholder="Shipping terms"
              name="shippingTerms"
              value={formData.shippingTerms}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
            <input
              placeholder="Lead times"
              name="leadTimes"
              value={formData.leadTimes}
              onChange={handleChange}
              className="border rounded p-2 w-full mt-2"
            />
            <input
              placeholder="Minimum order quantity (MOQ)"
              name="moq"
              type="Number"
              value={formData.moq}
              onChange={handleChange}
              className="border rounded p-2 w-full mt-2"
            />
            <textarea
              placeholder="Return policy"
              name="returnPolicy"
              value={formData.returnPolicy}
              onChange={handleChange}
              className="border rounded p-2 w-full mt-2"
            />
          </section>

          {/* Banking Details */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Banking Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Account holder name"
                name="accountHolder"
                value={formData.accountHolder}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <input
                placeholder="Bank name"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <input
                placeholder="Account number"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <input
                placeholder="Transit number"
                name="transitNumber"
                value={formData.transitNumber}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <input
                placeholder="Institution number"
                name="institutionNumber"
                value={formData.institutionNumber}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <input
                placeholder="SWIFT code"
                name="swift"
                value={formData.swift}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <input
                placeholder="IBAN"
                name="iban"
                value={formData.iban}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <input
                placeholder="Remittance email"
                name="remittanceEmail"
                value={formData.remittanceEmail}
                onChange={handleChange}
                className="border rounded p-2"
              />
            </div>
          </section>

          {/* Certifications / Certificates */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Upload Files</h3>
            <label className="block mb-2">Certifications</label>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileChange(e, setCertifications)}
            />

            <label className="block mt-4 mb-2">Certificates</label>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileChange(e, setCertificates)}
            />
          </section>

          {/* Terms */}
          <section>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
              />
              <span>I accept the Terms & Conditions</span>
            </label>
          </section>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              className="px-4 py-2 hover:cursor-pointer bg-blue-600 text-white rounded"
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
