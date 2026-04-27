import React, { useEffect, useState } from "react";
import API from "../../API/Api";

export default function CompanyPrivacyPolicy() {
  const [companyData, setCompanyData] = useState({});

  const getCompany = async () => {
    try {
      const data = JSON.parse(localStorage.getItem("user"));
      const companyId = data?._id;

      const res = await API.get(`/getCompanyById/${companyId}`, {
        withCredentials: true,
      });

      setCompanyData(res.data.company);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCompany();
  }, []);

  const sections = [
    "Information We Collect",
    "How We Use Your Information",
    "Data Sharing and Disclosure",
    "Data Retention",
    "Cookies and Tracking",
    "Your Rights",
    "Data Security",
    "Third-Party Links",
    "Children's Privacy",
    "Changes to This Policy",
    "Contact Us",
  ];

  const scrollToSection = (index) => {
    const el = document.getElementById(`section-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex">

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 min-h-screen bg-gray-50 text-gray-800 pt-5 pb-12 px-4 sm:px-6 lg:px-8">

        <div className="w-full mx-auto max-w-5xl">

          {/* ================= HEADER ================= */}
          <header className="mb-10">
            <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-8 shadow-lg text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Privacy Policy
              </h1>
              <p className="mt-3 text-red-100">
                Welcome to{" "}
                <span className="font-semibold text-white">
                  {companyData.companyName}
                </span>
                . We value your trust and are committed to protecting your privacy.
              </p>
            </div>
          </header>

          {/* ================= TOC ================= */}
          <div className="flex flex-wrap gap-3 bg-white p-4 mb-4 rounded-xl shadow-sm border border-gray-200">
            {sections.map((item, idx) => (
              <button
                key={idx}
                onClick={() => scrollToSection(idx)}
                className="text-sm px-4 py-1.5 rounded-full 
                  bg-white text-red-600 
                  border border-red-200 
                  hover:bg-red-600 hover:text-white 
                  transition-all duration-300 
                  cursor-pointer shadow-sm hover:shadow-md"
              >
                {item}
              </button>
            ))}
          </div>

          {/* ================= CONTENT ================= */}
          <article className="prose max-w-none">

            {/* Section 0 */}
            <section id="section-0" className="mb-8 scroll-mt-24">
              <h2 className="text-2xl font-semibold text-red-600">
                1. Information We Collect
              </h2>
              <ul className="list-disc ml-6 text-gray-700">
                <li><strong>Personal Information:</strong> Name, email, phone, address.</li>
                <li><strong>Payment Information:</strong> Secure gateways only.</li>
                <li><strong>Policy Data:</strong> Insurance and claims info.</li>
                <li><strong>Technical Info:</strong> IP, browser, device, cookies.</li>
              </ul>
            </section>

            {/* Section 1 */}
            <section id="section-1" className="mb-8 scroll-mt-24">
              <h2 className="text-2xl font-semibold text-red-600">
                2. How We Use Your Information
              </h2>
              <ul className="list-disc ml-6 text-gray-700">
                <li>Account management</li>
                <li>Customer support</li>
                <li>Fraud prevention</li>
                <li>UX improvements</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section id="section-2" className="mb-8 scroll-mt-24">
              <h2 className="text-2xl font-semibold text-red-600">
                3. Data Sharing and Disclosure
              </h2>
              <ul className="list-disc ml-6 text-gray-700">
                <li>Service partners</li>
                <li>Payment processors</li>
                <li>Legal authorities</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="section-3" className="mb-8 scroll-mt-24">
              <h2 className="text-2xl font-semibold text-red-600">
                4. Data Retention
              </h2>
              <p className="text-gray-700">
                Data is retained only as required for services and legal purposes.
              </p>
            </section>

            {/* Section 4 */}
            <section id="section-4" className="mb-8 scroll-mt-24">
              <h2 className="text-2xl font-semibold text-red-600">
                5. Cookies and Tracking
              </h2>
              <p className="text-gray-700">
                Cookies help improve user experience and analytics.
              </p>
            </section>

            {/* Section 5 */}
            <section id="section-5" className="mb-8 scroll-mt-24">
              <h2 className="text-2xl font-semibold text-red-600">
                6. Your Rights
              </h2>
              <ul className="list-disc ml-6 text-gray-700">
                <li>Access your data</li>
                <li>Correct your data</li>
                <li>Request deletion</li>
              </ul>
              <p className="text-gray-700">
                Contact:{" "}
                <a
                  href={`mailto:${companyData.companyEmail}`}
                  className="text-red-600 underline"
                >
                  {companyData.companyEmail}
                </a>
              </p>
            </section>

            {/* Section 6 */}
            <section id="section-6" className="mb-8 scroll-mt-24">
              <h2 className="text-2xl font-semibold text-red-600">
                7. Data Security
              </h2>
              <p className="text-gray-700">
                We use encryption and secure systems to protect your data.
              </p>
            </section>

            {/* Section 7 */}
            <section id="section-7" className="mb-8 scroll-mt-24">
              <h2 className="text-2xl font-semibold text-red-600">
                8. Third-Party Links
              </h2>
              <p className="text-gray-700">
                External links are not controlled by us.
              </p>
            </section>

            {/* Section 8 */}
            <section id="section-8" className="mb-8 scroll-mt-24">
              <h2 className="text-2xl font-semibold text-red-600">
                9. Children's Privacy
              </h2>
              <p className="text-gray-700">
                We do not collect data from children under 18.
              </p>
            </section>

            {/* Section 9 */}
            <section id="section-9" className="mb-8 scroll-mt-24">
              <h2 className="text-2xl font-semibold text-red-600">
                10. Changes to This Policy
              </h2>
              <p className="text-gray-700">
                Updates will be posted here.
              </p>
            </section>

            {/* Section 10 */}
            <section id="section-10" className="mb-10 scroll-mt-24">
              <h2 className="text-2xl font-semibold text-red-600">
                11. Contact Us
              </h2>

              <div className="mt-4 p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
                <p className="text-gray-700">
                  <strong>Company:</strong> {companyData.companyName}
                </p>
                <p className="text-gray-700">
                  <strong>Email:</strong>{" "}
                  <a
                    href={`mailto:${companyData.companyEmail}`}
                    className="text-red-600 underline"
                  >
                    {companyData.companyEmail}
                  </a>
                </p>
              </div>
            </section>

          </article>
        </div>
      </div>
    </div>
  );
}