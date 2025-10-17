import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../authContext/AuthContext";
import { List, Package, MessageSquare, BadgeQuestionMark, Building2, IdCardLanyard } from "lucide-react";
import API from "../../API/Api";

export default function AdminHome() {
    const [totalCategories, setTotalCategories] = useState([]);
    const [totalProducts, setTotalProducts] = useState([]);
    const [totalReviews, setTotalReviews] = useState([]);
    const [totalVendor, setTotalVendor] = useState([]);
    const [totalCompany, setTotalCompany] = useState([]);
    const [totalInquiries, setTotalInquiries] = useState([]);
    const { user } = useAuth();

    const getTotalCategories = async () => {
        try {
            const res = await API.get("/getcategories")
            setTotalCategories(res.data.categories);
        } catch (err) {
            console.log("Failed to fetch categories : ", err)
        }
    }

    const getTotalProducts = async () => {
        try {
            const res = await API.get("/getAllProduct")
            setTotalProducts(res.data.products);
        } catch (err) {
            console.log("Failed to fetch Products : ", err)
        }
    }

    const getTotalReviews = async () => {
        try {
            const res = await API.get("/getreview")
            setTotalReviews(res.data.reviews);
        } catch (err) {
            console.log("Failed to fetch Reviews : ", err)
        }
    }

    const getTotalVendor = async () => {
        try {
            const res = await API.get("/allvendor")
            setTotalVendor(res.data);
        } catch (err) {
            console.log("Failed to fetch Vendor : ", err)
        }
    }

    const getTotalCompany = async () => {
        try {
            const res = await API.get("/getAllCOmpany")
            setTotalCompany(res.data.companies);
        } catch (err) {
            console.log("Failed to fetch Company : ", err)
        }
    }

    const getTotalInquiries = async () => {
        try {
            const res = await API.get("/getAllInquiry")
            setTotalInquiries(res.data.inquiry);
        } catch (err) {
            console.log("Failed to fetch Inquiries : ", err)
        }
    }

    useEffect(() => {
        getTotalCategories();
        getTotalProducts();
        getTotalReviews();
        getTotalVendor();
        getTotalCompany();
        getTotalInquiries();
    }, [])

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Welcome back, {user?.name || "Admin"}
                </h1>
                <p className="text-gray-600 mt-2">
                    Manage your platform content and settings here.
                </p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <div className="bg-white border border-red-200 p-6 rounded-2xl shadow-red-600 hover:shadow-lg transition">
                    <div className="flex items-center gap-3">
                        <List className="text-blue-500" size={28} />
                        <h2 className="text-lg font-semibold">Categories</h2>
                    </div>
                    <p className="text-2xl font-bold mt-4">{totalCategories?.length}</p>
                </div>

                <div className="bg-white  border border-red-200 p-6 rounded-2xl shadow-red-600 hover:shadow-lg transition">
                    <div className="flex items-center gap-3">
                        <Package className="text-green-500" size={28} />
                        <h2 className="text-lg font-semibold">Products</h2>
                    </div>
                    <p className="text-2xl font-bold mt-4">{totalProducts?.length}</p>
                </div>

                <div className="bg-white p-6  border border-red-200 rounded-2xl shadow-red-600 hover:shadow-lg transition">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="text-yellow-500" size={28} />
                        <h2 className="text-lg font-semibold">Reviews</h2>
                    </div>
                    <p className="text-2xl font-bold mt-4">{totalReviews?.length}</p>
                </div>

                <div className="bg-white p-6  border border-red-200 rounded-2xl shadow-red-600 hover:shadow-lg transition">
                    <div className="flex items-center gap-3">
                        <IdCardLanyard className="text-yellow-500" size={28} />
                        <h2 className="text-lg font-semibold">Vendor</h2>
                    </div>
                    <p className="text-2xl font-bold mt-4">{totalVendor?.length}</p>
                </div>

                <div className="bg-white p-6  border border-red-200 rounded-2xl shadow-red-600 hover:shadow-lg transition">
                    <div className="flex items-center gap-3">
                        <Building2 className="text-yellow-500" size={28} />
                        <h2 className="text-lg font-semibold">Company</h2>
                    </div>
                    <p className="text-2xl font-bold mt-4">{totalCompany?.length}</p>
                </div>

                <div className="bg-white p-6  border border-red-200 rounded-2xl shadow-red-600 hover:shadow-lg transition">
                    <div className="flex items-center gap-3">
                        <BadgeQuestionMark className="text-red-500" size={28} />
                        <h2 className="text-lg font-semibold">Inquiries</h2>
                    </div>
                    <p className="text-2xl font-bold mt-4">{totalInquiries.length}</p>
                </div>
            </div>

            {/* Quick Navigation */}
            <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800">Quick Navigation</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <Link
                        to="/admin/inquiries"
                        className="bg-blue-500 text-white text-center py-4 px-6 rounded-xl shadow hover:bg-blue-600 transition hover:cursor-pointer"
                    >
                        Manage Inquiry
                    </Link>
                    <Link
                        to="/admin/category"
                        className="bg-green-500 text-white text-center py-4 px-6 rounded-xl shadow hover:bg-green-600 transition hover:cursor-pointer"
                    >
                        Manage Categories
                    </Link>
                    <Link
                        to="/admin/product"
                        className="bg-yellow-500 text-white text-center py-4 px-6 rounded-xl shadow hover:bg-yellow-600 transition hover:cursor-pointer"
                    >
                        Manage Products
                    </Link>
                    <Link
                        to="/admin/company"
                        className="bg-red-500 text-white text-center py-4 px-6 rounded-xl shadow hover:bg-red-600 transition hover:cursor-pointer"
                    >
                        Manage Company
                    </Link>

                    <Link
                        to="/admin/vendor"
                        className="bg-purple-500 text-white text-center py-4 px-6 rounded-xl shadow hover:bg-purple-600 transition hover:cursor-pointer"
                    >
                        Manage Vendor
                    </Link>
                </div>
            </div>
        </div>
    );
}
