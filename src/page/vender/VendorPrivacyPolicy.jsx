import React, { useEffect, useState } from "react";
import API from "../../API/Api";

const VendorPrivacyPolicy = () => {

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
        <div className="min-h-screen bg-gray-200 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <header className="mb-8">
                <div className="bg-gradient-to-r from-red-900 via-black to-black rounded-2xl p-6 shadow-2xl border-2 border-red-700 py-12">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-red-400 text-center">
                        Privacy Policy
                    </h1>
                </div>
            </header>
            <section className="space-y-6 text-gray-200">
                <p className="text-black">
                    Welcome to <span className="text-red-500 font-semibold">{vendorData.companyName}</span>. We value the trust our vendors place in us and are committed to protecting the confidentiality and security of your business and personal information. This Privacy Policy explains how we collect, use, and protect data within our Vendor Management System.
                </p>

                <h2 className="text-2xl font-semibold text-red-500 mt-8">1. Information We Collect</h2>
                <ul className="list-disc pl-6 space-y-2 text-black">
                    <li>Vendor Name, Business Name, and Contact Information</li>
                    <li>Email address, phone number, and business registration details</li>
                    <li>Bank account and payment details for transactions</li>
                    <li>Product, inventory, and pricing data provided through the platform</li>
                    <li>Device and login activity for security purposes</li>
                </ul>

                <h2 className="text-2xl font-semibold text-red-500 mt-8">2. How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-2 text-black">
                    <li>To verify your business and manage vendor registration</li>
                    <li>To process orders, payments, and settlements</li>
                    <li>To communicate about product updates, promotions, or policies</li>
                    <li>To ensure compliance with legal and tax requirements</li>
                    <li>To improve platform performance and security</li>
                </ul>

                <h2 className="text-2xl font-semibold text-red-500 mt-8">3. Data Sharing and Disclosure</h2>
                <p className="text-black">
                    We do <span className="text-red-400 font-semibold">not sell</span> vendor data. Information may be shared only with:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-black">
                    <li>Authorized service providers assisting in payment or logistics</li>
                    <li>Regulatory authorities when required by law</li>
                    <li>Security and audit teams for fraud prevention</li>
                </ul>

                <h2 className="text-2xl font-semibold text-red-500 mt-8">4. Data Security</h2>
                <p className="text-black">
                    We use advanced encryption, secure servers, and limited access controls to safeguard vendor data. While we strive to protect your information, no digital platform can guarantee absolute security. Please protect your login credentials at all times.
                </p>

                <h2 className="text-2xl font-semibold text-red-500 mt-8">5. Your Rights</h2>
                <ul className="list-disc pl-6 space-y-2 text-black">
                    <li>Access and update your vendor profile information</li>
                    <li>Request data deletion where legally permitted</li>
                    <li>Withdraw consent for marketing communications</li>
                </ul>

                <h2 className="text-2xl font-semibold text-red-500 mt-8">6. Policy Updates</h2>
                <p className="text-black">
                    We may revise this Privacy Policy periodically to reflect new features or legal requirements. Updates will be posted on the Vendor Panel with the latest revision date.
                </p>

                <h2 className="text-2xl font-semibold text-red-500 mt-8">7. Contact Us</h2>
                <p className="text-black">
                    For any questions or concerns regarding this policy, please contact us at:
                </p>
                <p className="text-black">
                    Email: <span className="text-red-500">{vendorData.contactEmail}</span><br />
                    Phone: <span className="text-red-500">{vendorData.contactPhone}</span><br />
                    Address: <span className="text-red-500">{vendorData.address1}{vendorData.address2}</span>
                </p>
            </section>

        </div>
    );
};

export default VendorPrivacyPolicy;
