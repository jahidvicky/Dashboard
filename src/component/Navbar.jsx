import React, { useEffect, useState } from "react";
import { useAuth } from "../authContext/AuthContext";
import logo from "../assets/image/logo.png";
import { Link } from "react-router-dom";
import API, { IMAGE_URL } from "../API/Api";

const Navbar = () => {
    const { user, logout } = useAuth();
    const [profileData, setProfileData] = useState(null);

    // Fetch profile based on role
    const getProfile = async () => {
        try {
            if (!user?._id || !user?.role) return;

            let response;
            let profile = null;

            if (user.role === "vendor") {
                response = await API.get(`/getVendorById/${user._id}`);
                profile = response.data?.vendor || null;
            } else if (user.role === "company") {
                response = await API.get(`/getCompanyById/${user._id}`);
                profile = response.data?.company || null;
            } else if (user.role === "admin") {
                response = await API.get(`/getAdminById/${user._id}`);
                profile = response.data?.admin || null;
            }

            if (profile) {
                setProfileData({
                    name:
                        profile.name ||
                        profile.contactName ||
                        profile.companyName ||
                        user?.name ||
                        user?.role,
                    profileImage:
                        profile.profileImage || profile.profilePic || profile.image || null,
                });
            }
        } catch (error) {
            console.error(" Failed to fetch profile:", error);
        }
    };

    useEffect(() => {
        getProfile();

        // Listen for profile updates
        const handleProfileUpdate = () => getProfile();
        window.addEventListener("profileUpdated", handleProfileUpdate);

        return () => {
            window.removeEventListener("profileUpdated", handleProfileUpdate);
        };
    }, [user]);

    return (
        <nav className="fixed left-0 w-full z-50 bg-white shadow-md px-6 py-4">
            {user && (
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <div>
                        <img src={logo} alt="Logo" className="w-36 ml-4" />
                    </div>

                    {/* Right side */}
                    <div className="flex items-center space-x-6">
                        <Link to={`/${user.role}/profile`}>
                            {profileData?.profileImage ? (
                                <img
                                    src={`${IMAGE_URL}${profileData.profileImage}`}
                                    alt="Profile"
                                    className="w-12 h-12 rounded-full object-cover border border-red-600"
                                />
                            ) : (
                                <span className="text-gray-600 text-lg">
                                    Hello, {profileData?.name || user?.name || user.role}
                                </span>
                            )}

                        </Link>

                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg text-lg hover:bg-red-600 transition duration-200 hover:cursor-pointer"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
