import React from 'react'
import { useNavigate } from "react-router-dom";
function ErrorPage() {
    const navigate = useNavigate();
    return (
        <div>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
                <h1 className="text-9xl font-bold text-red-600">404</h1>
                <h2 className="text-3xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
                <p className="text-lg text-gray-600 mt-2 text-center max-w-xl">
                    The page you're looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 mt-6 bg-red-600 text-white hover:bg-red-700 rounded hover:cursor-pointer"
                >
                    Back
                </button>

                <footer className="mt-6 text-sm text-gray-500">
                    <strong>&copy; {new Date().getFullYear()}</strong> <span className="text-red-600 font-bold">ATAL OPTICALS || Developed by WORLD WEBLOGIC</span>
                </footer>
            </div>
        </div>
    )
}

export default ErrorPage;
