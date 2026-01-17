import React from "react";
import PlayerBar from "./PlayerBar";
import MobileNav from "./MobileNav";
import { Toaster } from "react-hot-toast";

const MobileLayout = ({ children }) => {
    return (
        <div className="w-full min-h-screen bg-black text-white font-sans overflow-x-hidden">
            <Toaster position="top-center" reverseOrder={false} />

            {/* Main Content Area */}
            {/* padding-bottom to separate content from fixed player + nav */}
            <div className="w-full pb-[120px] relative z-0">
                {children}
            </div>

            {/* Fixed Elements */}
            <PlayerBar />
            <MobileNav />
        </div>
    );
};

export default MobileLayout;
