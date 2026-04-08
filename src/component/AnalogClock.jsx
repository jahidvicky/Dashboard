import React from "react";

const AnalogClock = () => {
    const [time, setTime] = React.useState(new Date());

    React.useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();

    const secondDeg = seconds * 6;
    const minuteDeg = minutes * 6 + seconds * 0.1;
    const hourDeg = hours * 30 + minutes * 0.5;

    return (
        <div className="relative w-20 h-20 rounded-full border-4 border-gray-400 bg-white shadow flex items-center justify-center mb-3 ml-8">

            {/* Ticks (60 lines) */}
            {[...Array(60)].map((_, i) => {
                const angle = i * 6;
                return (
                    <div
                        key={i}
                        className={`absolute ${i % 5 === 0
                            ? "w-[2px] h-2 bg-gray-700"
                            : "w-[1px] h-1 bg-gray-400"
                            }`}
                        style={{ transform: `rotate(${angle}deg) translateY(-34px)` }}
                    />
                );
            })}

            {/* Numbers (1–12) */}
            {[...Array(12)].map((_, i) => {
                const angle = (i + 1) * 30;
                return (
                    <div
                        key={i}
                        className="absolute text-[9px] font-semibold text-gray-800"
                        style={{
                            transform: `rotate(${angle}deg) translateY(-26px) rotate(-${angle}deg)`
                        }}
                    >
                        {i + 1}
                    </div>
                );
            })}

            {/* Brand Name - ATAL OPTICAL */}
            <div
                className="absolute text-center leading-tight"
                style={{ top: "18%", left: "50%", transform: "translateX(-50%)" }}
            >
                <p className="text-[6px] font-bold tracking-widest text-black mt-1 m-0">ATAL</p>
                <p className="text-[6px] font-bold tracking-widest text-black m-0">OPTICAL</p>
            </div>

            {/* Center Dot */}
            <div className="absolute w-1.5 h-1.5 bg-black rounded-full z-10"></div>

            {/* Hour Hand */}
            <div
                className="absolute w-1 h-5 bg-black origin-bottom rounded"
                style={{ top: "25%", transform: `rotate(${hourDeg}deg)` }}
            />

            {/* Minute Hand */}
            <div
                className="absolute w-0.5 h-6 bg-gray-700 origin-bottom rounded"
                style={{ top: "18%", transform: `rotate(${minuteDeg}deg)` }}
            />

            {/* Second Hand */}
            <div
                className="absolute w-0.5 h-7 bg-red-500 origin-bottom rounded"
                style={{ top: "11%", transform: `rotate(${secondDeg}deg)` }}
            />
        </div>
    );
};

export default AnalogClock;