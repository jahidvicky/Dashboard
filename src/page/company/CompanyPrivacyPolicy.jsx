import React, { useEffect, useState } from "react";
import API from "../../API/Api";

export default function CompanyPrivacyPolicy() {
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
    <div className="min-h-screen bg-gray-200 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full mx-auto">
        {/* Header card */}
        <header className="mb-8">
          <div className="bg-gradient-to-r from-red-900 via-black to-black rounded-2xl p-6 shadow-2xl border-2 border-red-700 py-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-red-400 text-center">Privacy Policy</h1>
            <p className="mt-4 text-gray-200 text-center">Welcome to <span className="font-semibold text-red-500">{companyData.companyName}</span> We value your trust and are committed to protecting your privacy.</p>
          </div>
        </header>

        {/* TOC */}
        <nav className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              'Information We Collect',
              'How We Use Your Information',
              'Data Sharing and Disclosure',
              'Data Retention',
              'Cookies and Tracking',
              'Your Rights',
              'Data Security',
              'Third-Party Links',
              "Children's Privacy",
              'Changes to This Policy',
              'Contact Us',
            ].map((item, idx) => (
              <p
                key={idx}
                className="text-sm px-3 py-1 rounded-md bg-red-900/20 border border-red-700 text-black hover:bg-red-800/40 transition"
              >
                {item}
              </p>
            ))}
          </div>
        </nav>

        {/* Content */}
        <article className="prose prose-invert max-w-none">
          {/* Section 0 */}
          <section id="section-0" className="mb-6">
            <h2 className="text-2xl font-bold text-red-500">1. Information We Collect</h2>
            <p className=" text-black">We collect and store the following types of information to operate and improve our services:</p>
            <ul className="list-disc ml-6 text-black">
              <li>
                <strong>Personal Information:</strong> Name, email, phone number, date of birth, shipping & billing addresses.
              </li>
              <li>
                <strong>Payment Information:</strong> Payment method and transaction details. We do not store full card details — payments are processed by authorized gateways.
              </li>
              <li>
                <strong>Policy & Insurance Data:</strong> Policy numbers, coverage, beneficiary info, claims and usage history.
              </li>
              <li>
                <strong>Device & Technical Information:</strong> IP address, browser, device type, cookies, and usage data.
              </li>
            </ul>
          </section>

          {/* Section 1 */}
          <section id="section-1" className="mb-6">
            <h2 className="text-2xl font-bold text-red-500">2. How We Use Your Information</h2>
            <p className=" text-black">We use your data for the following purposes:</p>
            <ul className="list-disc ml-6 text-black">
              <li>Create and manage accounts, process orders and policies.</li>
              <li>Communicate policy updates, renewals, offers, and service messages.</li>
              <li>Respond to customer requests and provide support.</li>
              <li>Detect and prevent fraud and comply with legal obligations.</li>
              <li>Analyze usage to improve products and user experience.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section id="section-2" className="mb-6">
            <h2 className="text-2xl font-bold text-red-500">3. Data Sharing and Disclosure</h2>
            <p className=" text-black">We do not sell your personal data. We may share information in these cases:</p>
            <ul className="list-disc ml-6 text-black">
              <li>With insurance partners and service providers to process policies and claims.</li>
              <li>With payment processors to handle transactions.</li>
              <li>With logistics partners for order delivery.</li>
              <li>With regulatory or law enforcement authorities when required by law.</li>
            </ul>
            <p className="mt-2 text-black">All partners are contractually bound to protect your data.</p>
          </section>

          {/* Section 3 */}
          <section id="section-3" className="mb-6">
            <h2 className="text-2xl font-bold text-red-500">4. Data Retention</h2>
            <p className=" text-black">We retain personal data while your account is active, during the policy period, and as required by law. After retention, data is deleted or anonymized.</p>
          </section>

          {/* Section 4 */}
          <section id="section-4" className="mb-6">
            <h2 className="text-2xl font-bold text-red-500">5. Cookies and Tracking</h2>
            <p className=" text-black">We use cookies and similar technologies to improve functionality, remember preferences, and analyze traffic. You can manage or disable cookies in your browser settings.</p>
          </section>

          {/* Section 5 */}
          <section id="section-5" className="mb-6">
            <h2 className="text-2xl font-bold text-red-500">6. Your Rights</h2>
            <p className=" text-black">You have the right to:</p>
            <ul className="list-disc ml-6 text-black">
              <li>Access and review your personal data.</li>
              <li>Request correction of inaccurate information.</li>
              <li>Withdraw consent for marketing communications.</li>
              <li>Request deletion where allowed by law.</li>
            </ul>
            <p className="mt-2 text-black">To exercise these rights, contact us at <a href={`mailto:${companyData.companyEmail}`} className="text-red-400 underline">{companyData.companyEmail}</a>.</p>
          </section>

          {/* Section 6 */}
          <section id="section-6" className="mb-6">
            <h2 className="text-2xl font-bold text-red-500">7. Data Security</h2>
            <p className=" text-black">We implement security measures such as SSL/TLS, secure servers, access controls, and audits. However, no system is completely secure — keep your credentials confidential.</p>
          </section>

          {/* Section 7 */}
          <section id="section-7" className="mb-6">
            <h2 className="text-2xl font-bold text-red-500">8. Third-Party Links</h2>
            <p className=" text-black">We may link to external websites. We are not responsible for their privacy practices; please review their policies before sharing personal information.</p>
          </section>

          {/* Section 8 */}
          <section id="section-8" className="mb-6">
            <h2 className="text-2xl font-bold text-red-500">9. Children’s Privacy</h2>
            <p className=" text-black">We do not knowingly collect data from individuals under 18. If you believe we have collected such data, contact us immediately.</p>
          </section>

          {/* Section 9 */}
          <section id="section-9" className="mb-6">
            <h2 className="text-2xl font-bold text-red-500">10. Changes to This Policy</h2>
            <p className=" text-black">We may update this policy periodically. Updated versions will be posted here with a new “Last Updated” date.</p>
          </section>

          {/* Section 10 */}
          <section id="section-10" className="mb-6 pb-8">
            <h2 className="text-2xl font-bold text-red-500">11. Contact Us</h2>
            <p className=" text-black">If you have questions or concerns, contact us:</p>
            <div className="mt-3 grid grid-cols-1 gap-4">
              <div className="p-4 rounded-lg bg-red-900/10 border border-red-500">
                <p className="text-sm text-black"><strong>Company:</strong> {companyData.companyName}</p>
                <p className="text-sm text-black"><strong>Email:</strong> <a href={`mailto:${companyData.companyEmail}`} className="underline text-red-600">{companyData.companyEmail}</a></p>
                {/* <p className="text-sm text-black"><strong>Phone:</strong> {phone}</p> */}
              </div>

              {/* <div className="p-4 rounded-lg bg-red-900/10 border border-red-800"> */}
              {/* <p className="text-sm text-black"><strong>Address:</strong></p> */}
              {/* <p className="text-sm text-black">{address}</p> */}
              {/* </div> */}
            </div>
          </section>
        </article>
      </div>
    </div>
  );

}