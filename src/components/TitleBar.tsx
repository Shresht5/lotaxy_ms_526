import React, { useEffect, useState } from "react";
// @ts-ignore
import icon from '../assets/icon.ico';
const TitleBar: React.FC = () => {
    const handleWindow = (action: "minimize" | "maximize" | "close") => {
        window.electronAPI[action]();
    };


    return (<>
        <div className=" fixed top-0 left-0 z-[1000] flex w-full items-center justify-between h-10 bg-[var(--back-primary)] text-[var(--primary-color)] select-none ">
            {/* Left: Logo + Name */}
            <div className="flex items-center px-3" style={{ WebkitAppRegion: "drag" } as React.CSSProperties}>
                <img src={icon} alt="logo" className="h-6 w-6 mr-2" />
                <span className="font-bold">Lotaxy</span>
            </div>

            {/* Middle: Drag region */}
            <div className="flex-1 h-full w-full" style={{ WebkitAppRegion: "drag" } as React.CSSProperties} />

            {/* Right: Controls */}
            <div className="flex items-center space-x-3 px-3" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
                <button
                    onClick={() => handleWindow("minimize")}
                    className="w-8 h-8 flex items-center justify-center bg-[var(--primary-very-light-color)] backdrop-blur-md shadow-md shadow-[var(--primary-color)] hover:shadow-none  rounded-md"
                >
                    <i className="ti ti-minus"></i>
                </button>
                <button
                    onClick={() => handleWindow("maximize")}
                    className="w-8 h-8 flex items-center justify-center bg-[var(--primary-very-light-color)] backdrop-blur-md shadow-md shadow-[var(--primary-color)] hover:shadow-none   rounded-md"
                >
                    <i className="ti ti-window-maximize"></i>
                </button>
                <button
                    onClick={() => handleWindow("close")}
                    className="w-8 h-8 flex items-center justify-center bg-[var(--primary-very-light-color)] backdrop-blur-md shadow-md shadow-[var(--primary-color)] hover:shadow-none   rounded-md"
                >
                    <i className="ti ti-x"></i>
                </button>

            </div>
        </div>


        <div className="h-10" />
    </>);
};

export default TitleBar;
