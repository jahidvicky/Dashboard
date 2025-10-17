import React from "react";
import { useAuth } from "../../authContext/AuthContext";
import {
    Building2,
    Mail,
    Hash,
    Landmark,
    FileBadge,
    Users,
} from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import API from "../../API/Api";

export default function CompanyHome() {
    const { user } = useAuth();
    const [companyData, setCompanyData] = useState([])


    const getCompany = async () => {
        try {
            const companyData = JSON.parse(localStorage.getItem("user"));
            const companyId = companyData?._id;
            const res = await API.get(`/getCompanyById/${companyId}`, {
                withCredentials: true,
            });

            setCompanyData(res.data.company)

        } catch (error) {
            console.log(error);

        }
    }

    useEffect(() => {
        getCompany()
    }, [])


    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Welcome, {user?.name || "Company Admin"}
                </h1>
                <p className="text-gray-600 mt-2">
                    Manage your company profile, agreements, and compliance information.
                </p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {/* Company Name */}
                <div className="bg-white p-3 rounded-2xl shadow hover:shadow-lg hover:shadow-red-600 transition border border-red-200 break-words">
                    <div className="flex items-center gap-3">
                        <Building2 className="text-blue-500" size={28} />
                        <h2 className="text-lg font-semibold">Company</h2>
                    </div>
                    <p className="text-xl font-bold mt-4">{companyData.companyName}</p>
                    <p className="text-gray-600 mt-1">Reg: {companyData.registrationNumber}</p>
                </div>

                {/* Contact Email */}
                <div className="bg-white p-3 rounded-2xl shadow hover:shadow-lg hover:shadow-red-600 transition border border-red-200 break-words">
                    <div className="flex items-center gap-3">
                        <Mail className="text-green-500" size={28} />
                        <h2 className="text-lg font-semibold">Email</h2>
                    </div>
                    <p className="text-xl font-bold mt-4">{companyData.companyEmail}</p>
                    <p className="text-gray-600 mt-1">{companyData.providerEmail}</p>
                </div>

                {/* Legal Entity */}
                <div className="bg-white p-3 rounded-2xl shadow hover:shadow-lg hover:shadow-red-600 transition border border-red-200 break-words">
                    <div className="flex items-center gap-3">
                        <Hash className="text-purple-500" size={28} />
                        <h2 className="text-lg font-semibold">Legal Entity</h2>
                    </div>
                    <p className="text-xl font-bold mt-4">{companyData.legalEntity}</p>
                </div>

                {/* Provider Info */}
                <div className="bg-white p-3 rounded-2xl shadow hover:shadow-lg hover:shadow-red-600 transition border border-red-200 break-words">
                    <div className="flex items-center gap-3">
                        <Users className="text-pink-500" size={28} />
                        <h2 className="text-lg font-semibold">Provider</h2>
                    </div>
                    <p className="text-xl font-bold mt-4">{companyData.providerName}</p>
                    <p className="text-gray-600">#{companyData.providerNumber}</p>
                </div>

                {/* Network Payer */}
                <div className="bg-white p-3 rounded-2xl shadow hover:shadow-lg hover:shadow-red-600 transition border border-red-200 break-words">
                    <div className="flex items-center gap-3">
                        <Landmark className="text-yellow-500" size={28} />
                        <h2 className="text-lg font-semibold">Network Payer</h2>
                    </div>
                    <p className="text-xl font-bold mt-4">{companyData.networkPayerId}</p>
                    <p className="text-gray-600">{companyData.efRemittance}</p>
                </div>

                {/* Compliance / Standards */}
                <div className="bg-white p-3 rounded-2xl shadow hover:shadow-lg hover:shadow-red-600 transition border border-red-200 break-words">
                    <div className="flex items-center gap-3">
                        <FileBadge className="text-red-500" size={28} />
                        <h2 className="text-lg font-semibold">Standards</h2>
                    </div>
                    <p className="text-xl font-bold mt-4">{companyData.serviceStandards}</p>
                    <p className="text-gray-600 mt-1">License: {companyData.licenseProof}</p>
                </div>
            </div>
        </div>
    );
}
