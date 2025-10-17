import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="bg-white shadow-lg rounded-2xl p-10 max-w-md text-center">
                <h1 className="text-6xl font-extrabold text-red-600">403</h1>
                <h2 className="mt-4 text-2xl font-bold text-gray-800">
                    Unauthorized Access
                </h2>
                <p className="mt-2 text-gray-600">
                    You do not have permission to access this page.
                </p>

                <div className="mt-6">
                    <Link
                        to="/"
                        className="inline-block px-6 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md transition hover:cursor-pointer"
                    >
                        Go Back Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
