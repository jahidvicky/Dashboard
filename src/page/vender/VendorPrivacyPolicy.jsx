import React, { useEffect, useState } from "react";
import API from "../../API/Api";

const VendorPrivacyPolicy = () => {
    const [vendorData, setVendorData] = useState({});

    const getVendor = async () => {
        try {
            const data = JSON.parse(localStorage.getItem("user"));
            const vendorId = data?._id;

            const res = await API.get(`/getVendorById/${vendorId}`, {
                withCredentials: true,
            });

            setVendorData(res.data.vendor);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getVendor();
    }, []);

    return (
        <div className="flex">

            {/* ================= MAIN CONTENT ================= */}
            <div className="flex-1 min-h-screen bg-gray-50 text-gray-800 pt-4 pb-12 px-4 sm:px-6 lg:px-8">

                <div className="max-w-5xl mx-auto">

                    {/* ================= HEADER ================= */}
                    <header className="mb-10">
                        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-8 shadow-lg text-center">
                            <h1 className="text-3xl sm:text-4xl font-bold text-white">
                                Vendor Privacy Policy
                            </h1>
                            <p className="mt-3 text-red-100">
                                Welcome {" "}
                                <span className="font-semibold text-white">
                                    {vendorData.accountHolder}
                                </span>. We are committed to protecting your data.
                            </p>
                        </div>
                    </header>

                    {/* ================= CONTENT ================= */}
                    <section className="space-y-8">

                        <p className="text-gray-700">
                            We value the trust our vendors place in us and are committed to protecting your business and personal information.
                        </p>

                        {/* Section 1 */}
                        <div className="scroll-mt-24">
                            <h2 className="text-2xl font-semibold text-red-600 mb-2">
                                1. Information We Collect
                            </h2>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Vendor name, business name, and contact info</li>
                                <li>Email, phone, and registration details</li>
                                <li>Bank and payment details</li>
                                <li>Product, inventory, and pricing data</li>
                                <li>Device and login activity</li>
                            </ul>
                        </div>

                        {/* Section 2 */}
                        <div className="scroll-mt-24">
                            <h2 className="text-2xl font-semibold text-red-600 mb-2">
                                2. How We Use Your Information
                            </h2>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Vendor verification and onboarding</li>
                                <li>Order and payment processing</li>
                                <li>Communication and updates</li>
                                <li>Legal and tax compliance</li>
                                <li>Platform performance improvement</li>
                            </ul>
                        </div>

                        {/* Section 3 */}
                        <div className="scroll-mt-24">
                            <h2 className="text-2xl font-semibold text-red-600 mb-2">
                                3. Data Sharing and Disclosure
                            </h2>
                            <p className="text-gray-700">
                                We do <span className="text-red-600 font-semibold">not sell</span> vendor data.
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Service providers (payments/logistics)</li>
                                <li>Legal authorities when required</li>
                                <li>Security and audit teams</li>
                            </ul>
                        </div>

                        {/* Section 4 */}
                        <div className="scroll-mt-24">
                            <h2 className="text-2xl font-semibold text-red-600 mb-2">
                                4. Data Security
                            </h2>
                            <p className="text-gray-700">
                                We use encryption, secure servers, and access control systems.
                            </p>
                        </div>

                        {/* Section 5 */}
                        <div className="scroll-mt-24">
                            <h2 className="text-2xl font-semibold text-red-600 mb-2">
                                5. Your Rights
                            </h2>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Access and update profile</li>
                                <li>Request deletion</li>
                                <li>Withdraw consent</li>
                            </ul>
                        </div>

                        {/* Section 6 */}
                        <div className="scroll-mt-24">
                            <h2 className="text-2xl font-semibold text-red-600 mb-2">
                                6. Policy Updates
                            </h2>
                            <p className="text-gray-700">
                                Policy updates will be posted with revision dates.
                            </p>
                        </div>

                        {/* Section 7 */}
                        <div className="scroll-mt-24">
                            <h2 className="text-2xl font-semibold text-red-600 mb-2">
                                7. Contact Us
                            </h2>

                            <div className="mt-4 p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
                                <p className="text-gray-700">
                                    <strong>Email:</strong>{" "}
                                    <span className="text-red-600">
                                        {vendorData.contactEmail}
                                    </span>
                                </p>
                                <p className="text-gray-700">
                                    <strong>Phone:</strong>{" "}
                                    <span className="text-red-600">
                                        {vendorData.contactPhone}
                                    </span>
                                </p>
                                <p className="text-gray-700">
                                    <strong>Address:</strong>{" "}
                                    <span className="text-red-600">
                                        {vendorData.address1} {vendorData.address2}
                                    </span>
                                </p>
                            </div>
                        </div>

                    </section>
                </div>
            </div>
        </div>
    );
};

export default VendorPrivacyPolicy;