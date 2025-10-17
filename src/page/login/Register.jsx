import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../API/Api";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "",
    })
    const [showpassword, setshowpassword] = useState(false);

    const handleChangepassword = () => {
        setshowpassword(!showpassword);
    }
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post("/register", form);

            toast.success("Registered successfully!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    return (
        <div className="flex items-center justify-center bg-gray-100 mt-10">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-lg shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>

                {/* Full Name */}
                <div className="mb-4">
                    <label>Full Name<span className="text-red-500 ml-1">*</span></label>
                    <input
                        type="text"
                        name="name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                        placeholder="Full Name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Email */}
                <div className="mb-4">
                    <label>Email<span className="text-red-500 ml-1">*</span></label>
                    <input
                        type="email"
                        name="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Password */}
                <div className="mb-4 relative">
                    <label>Password<span className="text-red-500 ml-1">*</span></label>
                    <input
                        type={showpassword ? "text" : "password"}
                        name="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                    <button onClick={handleChangepassword} className="absolute right-4 top-9 hover:cursor-pointer">{showpassword ? <FaEyeSlash /> : <FaEye />}</button>
                </div>

                {/* Role */}
                <div className="mb-6">
                    <select
                        name="role"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-green-500"
                        value={form.role}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select User Type</option>
                        {/* <option value="admin">Admin</option> */}
                        <option value="vendor">Vendor</option>
                        <option value="company">Company</option>
                    </select>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-200 hover:cursor-pointer"
                >
                    Register
                </button>
            </form>
        </div>
    );
};

export default Register;
