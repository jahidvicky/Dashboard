import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom';

const VenderDashboard = () => {
    const location = useLocation();

    const menuItems = [
        { name: "Home", path: "/vendor/home" },
        { name: "Product", path: "/vendor/product" },
        { name: "Discounted Product", path: "/vendor/discount-product" },
        { name: "Order", path: "/vendor/order" },
        { name: "Profile", path: "/vendor/profile" },
        { name: "Chat", path: "/vendor/chat" },
        { name: "Vendor Policy", path: "/vendor/privacy-policy" },
    ];

    return (
        <div className="flex bg-gray-100">
            {/* Sidebar */}
            <div className="fixed top-0 left-0 h-screen w-64 bg-white shadow-lg p-5 pt-20 overflow-y-auto">
                <nav className="space-y-2 text-center text-lg font-semibold mt-10">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`block px-4 py-2 rounded border-b border-gray-200 hover:bg-red-500 hover:text-white hover:cursor-pointer ${location.pathname === item.path
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
                <main className="flex-1 p-6 pt-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default VenderDashboard;
