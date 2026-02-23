import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useMusic } from "../context/MusicContext";
import { IconPlay, IconPause, IconNext, IconPrev, IconShuffle, IconRepeat, IconHeart, IconHome, IconSearch, IconList } from "./Icons";
import { motion, AnimatePresence } from "framer-motion";
import { processSong } from "../utils/audioProcessor";
import { saveAs } from "file-saver";
import { removeSourceAttribution } from "../utils/stringUtils";
import { getArtistMetadata } from "../utils/artistUtils";
import toast from "react-hot-toast";

const PlayerBar = () => {
    const {
        currentSong, isPlaying, togglePlay, progress, duration, seek,
        isShuffle, setIsShuffle, isRepeat, setIsRepeat, playNext, playPrev
    } = useMusic();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    const formatTime = (time) => {
        if (!time) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const handleDownload = async () => {
        if (!currentSong) return;

        const toastId = toast.loading("Downloading...");
        try {
            const coverUrl = currentSong?.image?.[2]?.url || currentSong?.image?.[0]?.url;
            const blob = await processSong(currentSong, coverUrl);

            if (blob) {
                const cleanName = removeSourceAttribution(currentSong?.name || "song").trim();
                saveAs(blob, `${cleanName}.m4a`);
                toast.success("Downloaded!", { id: toastId });
            } else {
                toast.error("Failed to process song.", { id: toastId });
            }
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Download failed.", { id: toastId });
        }
    };

    return (
        <>
            {/* NAVIGATION DOCK & MINI PLAYER */}
            <AnimatePresence>
                {!isExpanded && (
                    <div className="fixed bottom-0 left-0 w-full z-[200] px-4 pb-4 pointer-events-none">
                        <div className="max-w-md mx-auto flex flex-col gap-2 items-center pointer-events-auto">

                            {/* Mini Player Pill (Only if music playing) */}
                            <AnimatePresence>
                                {currentSong && (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 20, opacity: 0 }}
                                        onClick={() => setIsExpanded(true)}
                                        className="w-full h-14 bg-[#1a1a1a]/90 backdrop-blur-xl rounded-2xl flex items-center px-2 shadow-2xl border border-white/10 cursor-pointer overflow-hidden group"
                                    >
                                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5">
                                            <div
                                                className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                                                style={{ width: `${(progress / (duration || 100)) * 100}%` }}
                                            />
                                        </div>

                                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 mr-3 shadow-lg">
                                            <img
                                                src={currentSong?.image?.[2]?.url || currentSong?.image?.[0]?.url}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0 mr-2">
                                            <h4 className="text-[13px] font-bold text-white truncate leading-none mb-1">
                                                {removeSourceAttribution(currentSong?.name)}
                                            </h4>
                                            <p className="text-[10px] text-white/50 truncate uppercase tracking-tighter">
                                                {getArtistMetadata(currentSong?.artists).singleLine}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={togglePlay}
                                                className="w-10 h-10 flex items-center justify-center text-white active:scale-90 transition-transform"
                                            >
                                                {isPlaying ? <IconPause className="w-6 h-6" /> : <IconPlay className="w-6 h-6 ml-0.5" />}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Unified Navigation Dock */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="w-fit bg-black/80 backdrop-blur-2xl rounded-full px-2 py-1.5 flex items-center gap-1 shadow-2xl border border-white/5 shadow-purple-500/10"
                            >
                                <NavPill to="/" icon={<IconHome />} label="Home" />
                                <NavPill to="/songs" icon={<IconSearch />} label="Search" />
                                <NavPill to="/playlist" icon={<IconList />} label="Library" />
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Expanded Player (Full Screen Overlay) */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black z-[300] flex flex-col pt-4 pb-8 px-6 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="text-white/80 hover:text-white p-2"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>
                            <span className="text-xs font-bold tracking-widest uppercase text-white/50">Playing From Playlist</span>
                            <button className="text-white/80 p-2">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <circle cx="19" cy="12" r="1"></circle>
                                    <circle cx="5" cy="12" r="1"></circle>
                                </svg>
                            </button>
                        </div>

                        {/* Big Artwork */}
                        <div className="flex-1 flex items-center justify-center mb-10 w-full max-h-[45vh]">
                            <motion.div
                                className="w-full aspect-square max-w-[350px] bg-white/5 rounded-lg shadow-2xl overflow-hidden"
                                initial={{ scale: 0.9, opacity: 0.5 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <img
                                    src={currentSong?.image?.[2]?.url || currentSong?.image?.[0]?.url}
                                    alt={currentSong?.name}
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>
                        </div>

                        {/* Song Info */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex-1 min-w-0 mr-4">
                                <motion.h2
                                    className="text-2xl font-bold text-white truncate"
                                    layoutId="title"
                                >
                                    {removeSourceAttribution(currentSong?.name)}
                                </motion.h2>
                                <motion.p
                                    className="text-lg text-white/60 truncate"
                                    layoutId="artist"
                                >
                                    {getArtistMetadata(currentSong?.artists).singleLine}
                                </motion.p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleDownload}
                                    className="p-2 text-white/40 hover:text-white transition-colors"
                                    title="Download Song"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setIsLiked(!isLiked)}
                                    className={`p-2 transition-transform active:scale-90 ${isLiked ? 'text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-white/40'}`}
                                >
                                    <IconHeart className="w-8 h-8" filled={isLiked} />
                                </button>
                            </div>
                        </div>

                        {/* Scrub Bar */}
                        <div className="mb-4 group">
                            <div
                                className="relative w-full h-1 bg-white/20 rounded-full mb-2 cursor-pointer touch-none"
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const percent = (e.clientX - rect.left) / rect.width;
                                    seek(percent * (duration || 100));
                                }}
                            >
                                <div
                                    className="h-full bg-white rounded-full relative"
                                    style={{ width: `${(progress / (duration || 100)) * 100}%` }}
                                >
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-100" />
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-white/40 font-medium">
                                <span>{formatTime(progress)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Main Controls */}
                        <div className="flex items-center justify-between mb-8 px-2">
                            <button
                                onClick={() => setIsShuffle(!isShuffle)}
                                className={`transition-colors ${isShuffle ? "text-[#bf40ff]" : "text-white/50 hover:text-white"}`}
                            >
                                <IconShuffle className="w-6 h-6" />
                            </button>

                            <button
                                onClick={playPrev}
                                className="text-white hover:scale-110 transition-transform active:scale-95"
                            >
                                <IconPrev className="w-10 h-10" />
                            </button>

                            <button
                                onClick={togglePlay}
                                className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                            >
                                {isPlaying ? <IconPause className="w-8 h-8 fill-current" /> : <IconPlay className="w-8 h-8 fill-current ml-1" />}
                            </button>

                            <button
                                onClick={playNext}
                                className="text-white hover:scale-110 transition-transform active:scale-95"
                            >
                                <IconNext className="w-10 h-10" />
                            </button>

                            <button
                                onClick={() => setIsRepeat(!isRepeat)}
                                className={`transition-colors ${isRepeat ? "text-[#bf40ff]" : "text-white/50 hover:text-white"}`}
                            >
                                <IconRepeat className="w-6 h-6" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

const NavPill = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${isActive
                ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                : "text-white/40 hover:text-white/70"
            }`
        }
    >
        {React.cloneElement(icon, { className: "w-5 h-5" })}
        <span className="text-xs font-bold tracking-tight">{label}</span>
    </NavLink>
);

export default PlayerBar;
