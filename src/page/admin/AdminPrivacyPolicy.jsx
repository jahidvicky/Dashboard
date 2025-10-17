import React from "react";


export default function AdminPrivacyPolicy() {

    return (
        <div className="min-h-screen bg-gray-200 text-gray-100 py-8 px-4 sm:px-6 lg:px-12">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <div className="bg-gradient-to-r from-red-900 via-black to-black rounded-2xl p-6 shadow-2xl border-2 border-red-700 py-12">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-red-400 text-center">Privacy Policy</h1>
                        {/* <p className="mt-2 text-sm text-gray-300">Last Updated: <span className="text-red-200"></span></p> */}
                        <p className="mt-3 text-gray-200 text-center">This document outlines privacy and data handling practices for administrators.</p>
                    </div>
                </header>

                {/* TOC */}
                <nav className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        {[
                            'Purpose & Scope',
                            'Data Collected',
                            'Admin Access & Roles',
                            'Audit Logs',
                            'Data Exports & Sharing',
                            'Retention & Deletion',
                            'Security',
                            'User Rights',
                            'Breach Response',
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
                    <section id="sec-0" className="mb-6">
                        <h2 className="text-2xl font-bold text-red-500">1. Purpose & Scope</h2>
                        <p className="text-black">This policy governs handling of personal data within the
                            {/* <strong>{companyName}</strong>  */}
                            admin panel. It applies to all administrators, moderators, support staff, and third-party contractors who access the admin interface.</p>
                    </section>

                    <section id="sec-1" className="mb-6">
                        <h2 className="text-2xl font-bold text-red-500">2. Data Collected</h2>
                        <p className="text-black">Admin operations may access the following categories of data:</p>
                        <ul className="list-disc ml-6 text-black">
                            <li>User profile data: name, email, phone, addresses, date of birth.</li>
                            <li>Order & policy records: order history, policy numbers, claims and billing details.</li>
                            <li>Payment metadata: transaction IDs, gateway responses (no raw card numbers stored).</li>
                            <li>Support interactions: tickets, call logs, chat transcripts.</li>
                            <li>System & access logs: IP addresses, login timestamps, actions performed in admin panel.</li>
                        </ul>
                    </section>

                    <section id="sec-2" className="mb-6">
                        <h2 className="text-2xl font-bold text-red-500">3. Admin Access & Roles</h2>
                        <p className="text-black">We enforce role-based access control (RBAC). Typical roles include:</p>
                        <ul className="list-disc ml-6 text-black">
                            <li><strong>Super Admin:</strong> Full system access, user & company management, security settings.</li>
                            <li><strong>Support Agent:</strong> Access to user profiles, orders, and policy documents to resolve queries.</li>
                            <li><strong>Finance:</strong> Access to billing & transaction metadata for reconciliation.</li>
                            <li><strong>Auditor:</strong> Read-only access to logs and reports.</li>
                        </ul>
                        <p className="mt-2 text-black">All admin accounts must use strong authentication (MFA recommended). Access is granted on a least-privilege basis and reviewed quarterly.</p>
                    </section>

                    <section id="sec-3" className="mb-6">
                        <h2 className="text-2xl font-bold text-red-500">4. Audit Logs & Monitoring</h2>
                        <p className="text-black">Every admin action is logged with timestamp, admin ID, IP, and action details. Logs are retained for security investigations and compliance.</p>
                        <p className="mt-2 text-black">Audit logs are immutable and accessible only by authorized security personnel and auditors.</p>
                    </section>

                    <section id="sec-4" className="mb-6">
                        <h2 className="text-2xl font-bold text-red-500">5. Data Exports & Sharing</h2>
                        <p className="text-black">Data export is restricted and should follow the Export Policy:</p>
                        <ul className="list-disc ml-6 text-black">
                            <li>Exports require justification and approval (email record stored).</li>
                            <li>Exported files must be encrypted at rest and during transit.</li>
                            <li>Personal data shared with partners is governed by Data Processing Agreements (DPAs).</li>
                        </ul>
                    </section>

                    <section id="sec-5" className="mb-6">
                        <h2 className="text-2xl font-bold text-red-500">6. Retention & Deletion</h2>
                        <p className="text-black">Data retention is governed by legal, tax, and operational requirements. Admins should:</p>
                        <ul className="list-disc ml-6 text-black">
                            <li>Follow retention timelines (e.g., financial records: 7 years or local legal requirement).</li>
                            <li>Use the Data Deletion tools in the admin panel to submit deletion requests; these requests are audited.</li>
                        </ul>
                    </section>

                    <section id="sec-6" className="mb-6">
                        <h2 className="text-2xl font-bold text-red-500">7. Security & Best Practices</h2>
                        <p className="text-black">Administrators must adhere to security standards:</p>
                        <ul className="list-disc ml-6 text-black">
                            <li>Use MFA and unique admin credentials; never share accounts.</li>
                            <li>Use VPN for remote admin access where applicable.</li>
                            <li>Report suspicious activity immediately to the security team.</li>
                            <li>Apply principle of least privilege when granting roles or permissions.</li>
                        </ul>
                    </section>

                    <section id="sec-7" className="mb-6">
                        <h2 className="text-2xl font-bold text-red-500">8. User Rights & Admin Responsibilities</h2>
                        <p className="text-black">Admins handling user requests must verify identity before making changes. Common requests include:</p>
                        <ul className="list-disc ml-6 text-black">
                            <li>Access or export of user data (logged and requires identity verification).</li>
                            <li>Correction of inaccurate data (documented in change history).</li>
                            <li>Processing deletion or data portability requests following legal checks.</li>
                        </ul>
                    </section>

                    <section id="sec-8" className="mb-6">
                        <h2 className="text-2xl font-bold text-red-500">9. Breach Response & Incident Management</h2>
                        <p className="text-black">In case of a suspected data breach:</p>
                        <ul className="list-disc ml-6 text-black">
                            <li>Immediately notify the security team and freeze affected admin accounts.</li>
                            <li>Preserve relevant logs and evidence for investigation.</li>
                            <li>Assess impact, notify affected users and regulators within required timelines.</li>
                        </ul>
                    </section>
                </article>
            </div>
        </div>
    );
}
