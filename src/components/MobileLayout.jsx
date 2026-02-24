import React from "react";
import PlayerControlBar from "./PlayerControlBar";
import MobileNav from "./MobileNav";
import { Toaster } from "react-hot-toast";

const MobileLayout = ({ children }) => {
    return (
        <div className="w-full min-h-screen bg-black text-white font-sans overflow-x-hidden">
            <Toaster position="top-center" reverseOrder={false} />

            {/* Main Content Area */}
            {/* Increased padding for floating dock */}
            <div className="w-full pb-[160px] relative z-0">
                {children}
            </div>

            {/* Fixed Elements */}
            <PlayerControlBar />
        </div>
    );
};

export default MobileLayout;
