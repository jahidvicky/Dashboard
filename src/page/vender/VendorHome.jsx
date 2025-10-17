import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../authContext/AuthContext";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Banknote,
  FileBadge,
} from "lucide-react";
import { useEffect } from "react";
import { useState } from "react";
import API from "../../API/Api";

export default function VendorHome() {
  const { user } = useAuth();

  const [vendorData, setVendorData] = useState([])

  const getVendor = async () => {
    try {
      const vendorData = JSON.parse(localStorage.getItem("user"));
      const vendorId = vendorData?._id;
      const res = await API.get(`/getVendorById/${vendorId}`, {
        withCredentials: true,
      });
      setVendorData(res.data.vendor)

    } catch (error) {
      console.log(error);

    }

  }
  useEffect(() => {
    getVendor()
  }, [])

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {user?.name || "Vendor"}
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your Canadian business profile and services here.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {/* Company Info */}
        <div className="bg-white p-3 rounded-2xl shadow hover:shadow-lg hover:shadow-red-600 transition border border-red-200 break-words">
          <div className="flex items-center gap-3">
            <Building2 className="text-blue-500" size={28} />
            <h2 className="text-lg font-semibold">Company</h2>
          </div>
          <p className="text-xl font-bold mt-4">{vendorData.companyName}</p>
          <p className="text-gray-600 mt-1">Business No: {vendorData.businessNumber}</p>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-3 rounded-2xl shadow hover:shadow-lg hover:shadow-red-600 transition border border-red-200 break-words">
          <div className="flex items-center gap-3">
            <Phone className="text-green-500" size={28} />
            <h2 className="text-lg font-semibold">Contact</h2>
          </div>
          <p className="text-xl font-bold mt-4">{vendorData.contactPhone}</p>
        </div>

        {/* Email */}
        <div className="bg-white p-3 rounded-2xl shadow hover:shadow-lg hover:shadow-red-600 transition border border-red-200 break-words">
          <div className="flex items-center gap-3">
            <Mail className="text-yellow-500" size={28} />
            <h2 className="text-lg font-semibold">Email</h2>
          </div>
          <p className="text-xl font-bold mt-4">{vendorData.contactEmail}</p>
        </div>

        {/* Address */}
        <div className="bg-white p-3 rounded-2xl shadow hover:shadow-lg hover:shadow-red-600 transition border border-red-200 break-words">
          <div className="flex items-center gap-3">
            <MapPin className="text-purple-500" size={28} />
            <h2 className="text-lg font-semibold">Address</h2>
          </div>
          <p className="text-xl font-bold mt-4">{vendorData.address1}{vendorData.address2}</p>
          <p className="text-gray-600">{vendorData.state}</p>
          <p className="text-gray-600">{vendorData.country}{vendorData.postalCode}</p>
        </div>

        {/* Banking */}
        <div className="bg-white p-3 rounded-2xl shadow hover:shadow-lg hover:shadow-red-600 transition border border-red-200 break-words">
          <div className="flex items-center gap-3">
            <Banknote className="text-red-500" size={28} />
            <h2 className="text-lg font-semibold">Bank</h2>
          </div>
          <p className="text-xl font-bold mt-4">{vendorData.bankName}</p>
          <p className="text-gray-600 mt-1">Name: {vendorData.accountHolder}</p>
          <p className="text-gray-600">Acct: {vendorData.accountNumber}</p>
        </div>

        {/* Certifications */}
        <div className="bg-white p-3 rounded-2xl shadow hover:shadow-lg hover:shadow-red-600 transition border border-red-200 break-words">
          <div className="flex items-center gap-3">
            <FileBadge className="text-teal-500" size={28} />
            <h2 className="text-lg font-semibold">Certifications</h2>
          </div>
          {vendorData?.certificates?.map((docs, idx) => (<p key={idx} className="text-xl font-bold mt-4">{docs}</p>))}

        </div>

      </div>

      {/* Quick Navigation */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Quick Navigation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Link
            to="/vendor/profile"
            className="bg-blue-500 text-white text-center py-4 px-6 rounded-xl shadow hover:bg-blue-600 transition hover:cursor-pointer"
          >
            Manage Profile
          </Link>
          <Link
            to="/vendor/product"
            className="bg-yellow-500 text-white text-center py-4 px-6 rounded-xl shadow hover:bg-yellow-600 transition hover:cursor-pointer"
          >
            Manage Products
          </Link>
          <Link
            to="/vendor/discount-product"
            className="bg-green-500 text-white text-center py-4 px-6 rounded-xl shadow hover:bg-green-600 transition hover:cursor-pointer"
          >
            Manage Discount
          </Link>
          <Link
            to="/vendor/order"
            className="bg-red-500 text-white text-center py-4 px-6 rounded-xl shadow hover:bg-red-600 transition hover:cursor-pointer"
          >
            Manage Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
