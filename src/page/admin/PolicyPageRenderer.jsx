import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import API from "../../API/Api";

const ContactBlock = () => {
    const openEmail = (email) => {
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, "_blank", "noopener,noreferrer");
    };
    return (
        <section className="bg-black text-white p-6 sm:p-8 rounded-xl mt-6">
            <h2 className="text-xl font-bold text-red-500 mb-4">Contact Us</h2>
            <div className="space-y-2 text-sm sm:text-base text-gray-200">
                <p>
                    Email:{" "}
                    <button onClick={() => openEmail("sales.ataloptical@gmail.com")} className="text-red-400 hover:underline cursor-pointer">
                        sales.ataloptical@gmail.com
                    </button>
                    <span className="mx-1">|</span>
                    <button onClick={() => openEmail("info.ataloptical@gmail.com")} className="text-red-400 hover:underline cursor-pointer">
                        info.ataloptical@gmail.com
                    </button>
                </p>
                <p>
                    Corporate Office:{" "}
                    <NavLink to="/location" className={({ isActive }) => (isActive ? "text-red-400 underline" : "text-red-400 hover:underline")}>
                        34 Shining Willow Crescent, Brampton, ON L6P 2A2, Canada
                    </NavLink>
                </p>
                <p>
                    Phone: <a href="tel:+18662423545" className="text-red-400 hover:underline">1866-242-3545</a>
                </p>
            </div>
        </section>
    );
};

const PolicyPageRenderer = ({ slug }) => {
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                setLoading(true);
                const { data } = await API.get(`/policy/${slug}`);
                setPage(data.page);
                setError(null);
            } catch (err) {
                console.error("Failed to load policy page:", err);
                setError("This page is not available right now.");
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, [slug]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <span className="w-10 h-10 rounded-full border-4 border-[#f00000] border-t-transparent animate-spin" />
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-gray-500">
                {error || "Page not found."}
            </div>
        );
    }

    return (
        <>
            <header className="mb-8 bg-gradient-to-r from-black via-red-600 to-black py-12 text-center shadow-md">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-wide px-4">
                    {page.pageTitle}
                </h1>
                <div className="border-b border-white w-20 sm:w-24 mx-auto mt-4 opacity-80" />
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pb-12">
                {page.intro && (
                    <div
                        className="rounded-xl border border-red-500 bg-red-50 p-6 sm:p-8 mb-8 shadow-sm text-gray-800 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: page.intro }}
                    />
                )}

                <div className="space-y-6">
                    {page.sections
                        .filter((section) => section.heading?.trim() && section.body?.trim())
                        .map((section, idx) => (
                            <section
                                key={idx}
                                className="bg-white shadow-sm p-4 sm:p-6 md:p-8 rounded-xl border border-red-400"
                            >
                                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-red-600 mb-3">
                                    {section.heading}
                                </h2>
                                <div
                                    className="text-gray-700 leading-relaxed text-sm sm:text-[15px] md:text-base"
                                    dangerouslySetInnerHTML={{ __html: section.body }}
                                />
                            </section>
                        ))}
                </div>

                <p className="text-center text-sm text-gray-500 mt-8">
                    <strong>Last Updated:</strong>{" "}
                    {new Date(page.lastUpdated).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
                </p>

                <ContactBlock />
            </main>
        </>
    );
};

export default PolicyPageRenderer;