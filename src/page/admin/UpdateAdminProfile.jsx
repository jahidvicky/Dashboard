import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import API, { IMAGE_URL } from "../../API/Api";

const UpdateAdminProfile = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profileFileName, setProfileFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const adminData = JSON.parse(localStorage.getItem("user"));
        const adminId = adminData?._id;

        if (!adminId) {
          Swal.fire("Error", "Admin ID not found in localStorage", "error");
          return;
        }

        const res = await API.get(`/getAdminById/${adminId}`, { withCredentials: true });
        const data = res.data.admin || {};

        setFormData({ name: data.name || "", email: data.email || "", password: "" });

        if (data.profileImage) {
          setProfileImage(data.profileImage);
          setProfilePreview(null);
          localStorage.setItem(
            "user",
            JSON.stringify({ ...adminData, profileImage: data.profileImage })
          );
        }
      } catch (err) {
        Swal.fire("Error", err.response?.data?.message || "Failed to load admin profile", "error");
      }
    };

    fetchProfile();
  }, []);

  const handleProfileImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      setProfileFileName(file.name);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const adminData = JSON.parse(localStorage.getItem("user"));
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      if (formData.password) data.append("password", formData.password);
      if (profileFile) data.append("profileImage", profileFile);

      const res = await API.put(`/adminProfile`, data, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data?.admin) {
        const updatedAdmin = res.data.admin;
        setProfileImage(updatedAdmin.profileImage || null);
        setProfilePreview(null);
        setProfileFile(null);
        setProfileFileName("");

        const updatedUser = {
          ...adminData,
          name: updatedAdmin.name,
          email: updatedAdmin.email,
          profileImage: updatedAdmin.profileImage,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("profileUpdated"));
      }

      Swal.fire("Success", res.data.message || "Profile updated!", "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500";
  const errorBorder = "border-red-500";
  const normalBorder = "border-gray-300";

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto bg-white shadow-md rounded-xl p-8 space-y-8"
    >
      <h2 className="text-2xl font-bold mb-4">Admin Profile</h2>

      <section>
        <h3 className="text-lg font-semibold border-b pb-1 mb-3">Admin Info</h3>
        <div className="space-y-5">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              className={`${inputBase} ${errors.name ? errorBorder : normalBorder}`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Image
            </label>

            {/* Custom file picker */}
            <label className="flex items-center gap-3 cursor-pointer w-full border border-gray-300 rounded-lg p-2.5 hover:border-red-400 transition">
              <span className="bg-[#f00000] text-white text-xs font-semibold px-3 py-1.5 rounded-md whitespace-nowrap">
                Choose File
              </span>
              <span className="text-sm text-gray-500 truncate">
                {profileFileName ? profileFileName : "No file chosen"}
              </span>
              <input
                type="file"
                onChange={handleProfileImage}
                accept="image/*"
                className="hidden"
              />
            </label>

            {/* Preview */}
            {(profilePreview || profileImage) && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={profilePreview ? profilePreview : `${IMAGE_URL}${profileImage}`}
                  alt="Profile Preview"
                  className="w-20 h-20 object-cover rounded-full border-2 border-red-300 shadow"
                />
                <div className="text-sm text-gray-600">
                  {profileFileName ? (
                    <>
                      <p className="font-medium text-gray-800 truncate max-w-[200px]">
                        {profileFileName}
                      </p>
                      <p className="text-xs text-green-600 mt-0.5">New image selected</p>
                    </>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              className={`${inputBase} ${errors.email ? errorBorder : normalBorder}`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          {/* Password with toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password{" "}
              <span className="text-xs font-normal text-gray-400">(leave blank to keep current)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="New password"
                value={formData.password}
                onChange={handleChange}
                className={`${inputBase} pr-11 ${errors.password ? errorBorder : normalBorder}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  /* Eye-off icon */
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7
                         a9.77 9.77 0 012.168-3.568M6.343 6.343A9.956 9.956
                         0 0112 5c5 0 9 4 9 7a9.956 9.956 0 01-1.343
                         2.657M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                  </svg>
                ) : (
                  /* Eye icon */
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477
                         0 8.268 2.943 9.542 7-1.274 4.057-5.065
                         7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

        </div>
      </section>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full font-semibold p-3 rounded-lg transition-all duration-200 ${loading
          ? "bg-gray-400 text-gray-200 cursor-not-allowed"
          : "bg-[#f00000] hover:bg-red-700 text-white cursor-pointer"
          }`}
      >
        {loading ? "Submitting..." : "Update Profile"}
      </button>
    </form>
  );
};

export default UpdateAdminProfile;