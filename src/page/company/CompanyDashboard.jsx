import React from 'react'
import { Link, Outlet, useLocation, } from 'react-router-dom';

const CompanyDashboard = () => {
    const location = useLocation()
    const menuItems = [
        { name: "Home", path: "/company/home" },
        { name: "Profile", path: "/company/profile" },
        { name: "Insurance Policy", path: "/company/add-policy" },
        { name: "Customer Policies", path: "/company/customer-policy" },
        { name: "Customer Claims", path: "/company/customer-claims" },
        { name: "Chat", path: "/company/chat" },
        { name: "Company Policy", path: "/company/privacy-policy" },
    ];

    return (
        <>
            <div className="flex bg-gray-100">
                {/* Sidebar */}
                <div className="fixed left-0 h-screen w-64 bg-white shadow-lg p-5 pt-20 overflow-y-auto">
                    {/* <h2 className="text-xl font-bold mb-6"></h2> */}
                    <nav className="space-y-2 text-center text-lg font-semibold mt-10">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`border-b-1 block px-4 py-2 rounded hover:bg-red-500 hover:text-white hover:cursor-pointer ${location.pathname === item.path
                                    ? "bg-red-500 text-white"
                                    : "text-gray-700"
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
                {/* Main Content */}
                <div className="flex-1 ml-64 flex flex-col pt-20">
                    {/* Page Content */}
                    <main className="flex-1 p-6 pt-10">
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    )
}

export default CompanyDashboard
