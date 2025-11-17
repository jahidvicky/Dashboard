import React, { useEffect, useState } from "react";

const Loader = () => {
    const [dots, setDots] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
        }, 500); // Update every 0.5s

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-blur bg-opacity-30 backdrop-blur-sm z-50">
            <div className="relative w-28 h-28 mb-6">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-b-transparent border-l-red-500 border-r-black animate-spin-slow"></div>
                {/* Middle Ring */}
                <div className="absolute inset-3 rounded-full border-4 border-t-transparent border-b-transparent border-l-black border-r-red-500 animate-spin-slower"></div>
                {/* Inner Ring */}
                <div className="absolute inset-6 rounded-full border-4 border-t-transparent border-b-transparent border-l-red-500 border-r-black animate-spin-fast"></div>
                {/* Inner Dot */}
                <div className="absolute inset-11 w-6 h-6 bg-black rounded-full animate-pulse"></div>
            </div>

            {/* Loading Text */}
            <div className="text-black text-lg font-bold tracking-wide">
                Loading{dots}
            </div>
        </div>
    );
};

export default Loader;
