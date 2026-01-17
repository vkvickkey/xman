import React from "react";
import { NavLink } from "react-router-dom";
import { IconHome, IconSearch, IconList } from "./Icons";

const MobileNav = () => {
    return (
        <div className="fixed bottom-0 left-0 w-full h-[60px] bg-black/95 backdrop-blur-xl border-t border-white/10 z-[200] flex items-center justify-around pb-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <NavItem to="/" icon={<IconHome />} label="Home" />
            <NavItem to="/songs" icon={<IconSearch />} label="Search" />
            <NavItem to="/playlist" icon={<IconList />} label="Library" />
        </div>
    );
};

const NavItem = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 min-w-[60px] transition-all duration-300 ${isActive
                ? "text-white scale-110 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                : "text-white/40 hover:text-white/80"
            }`
        }
    >
        {React.cloneElement(icon, { className: "w-6 h-6" })}
        <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </NavLink>
);

export default MobileNav;
