import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { removeSourceAttribution, getAlbumFromTitle } from "../utils/stringUtils";
import { getArtistMetadata } from "../utils/artistUtils";
import { useMusic } from "../context/MusicContext";
import handleGenerateAudio from "../utils/audioUtils";
import toast from "react-hot-toast";

const PlayerControlBar = () => {
    const { currentSong, isPlaying, togglePlay, playNext, playPrev, progress, duration, seek, volume, setVolume } = useMusic();
    const [showDownload, setShowDownload] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLike, setIsLike] = useState(false);

    const onLikeToggle = () => {
        setIsLike(!isLike);
    };

    const handleSeek = (e) => {
        const newTime = parseFloat(e.target.value);
        seek(newTime);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
    };

    const formatTime = (time) => {
        if (!time && time !== 0) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const handleDownloadClick = (url, name) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = `${name}.mp3`;
        fetch(url)
            .then(res => res.blob())
            .then(blob => {
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = `${name}.mp3`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            })
            .catch(console.error);
        toast.success("Download started...");
    }

    if (!currentSong) return null;

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 w-full z-[100] px-2 pb-2 md:px-8 md:pb-6"
        >
            <div className="w-full max-w-7xl mx-auto rounded-2xl md:rounded-3xl bg-gradient-to-r from-black/80 via-black/60 to-black/80 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="hidden md:flex items-center gap-4 w-[30%] min-w-0">
                        <div className="relative group cursor-pointer flex-shrink-0">
                            <img
                                src={currentSong?.image?.[2]?.url}
                                className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover shadow-lg group-hover:opacity-80 transition-opacity"
                                alt=""
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-white font-bold truncate text-lg mb-1">
                                {removeSourceAttribution(currentSong?.name)}
                            </h4>
                            <p className="text-white/60 text-sm truncate mb-1">
                                {getAlbumFromTitle(currentSong?.album?.name) || removeSourceAttribution(currentSong?.album?.name)}
                            </p>
                            <p className="text-white/40 text-xs truncate">
                                {getArtistMetadata(currentSong?.artists).singleLine}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-3 w-full md:w-[40%] max-w-md">
                        {/* Top Row */}
                        <div className="flex items-center justify-between gap-4">
                            {/* Left: Image & Info */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <img 
                                    src={currentSong?.image?.[2]?.url} 
                                    className="flex items-center w-14 h-14 rounded-lg object-cover shadow-lg flex-shrink-0" 
                                    alt="" 
                                />
                                <div className="min-w-0">
                                    <h4 className="text-white font-bold truncate text-base">
                                        {removeSourceAttribution(currentSong?.name)}
                                    </h4>
                                    <p className="text-white/50 text-sm truncate">
                                        {getArtistMetadata(currentSong?.artists).singleLine}
                                    </p>
                                </div>
                            </div>

                            {/* Right: Controls - Centered in remaining space */}
                            <div className="flex items-center gap-2">
                                <button onClick={() => seek(Math.max(0, progress - 10))} className="text-white/60 hover:text-white transition-colors text-lg p-2 rounded-full hover:bg-white/10">
                                    <i className="ri-replay-10-line"></i>
                                </button>
                                <button onClick={playPrev} className="text-white/60 hover:text-white transition-colors text-xl p-2 rounded-full hover:bg-white/10">
                                    <i className="ri-skip-back-mini-fill"></i>
                                </button>
                                <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg cursor-pointer">
                                    <i className={isPlaying ? "ri-pause-fill text-2xl" : "ri-play-fill text-2xl pl-1"}></i>
                                </button>
                                <button onClick={playNext} className="text-white/60 hover:text-white transition-colors text-xl p-2 rounded-full hover:bg-white/10">
                                    <i className="ri-skip-right-fill"></i>
                                </button>
                                <button onClick={() => seek(Math.min(duration || 0, progress + 10))} className="text-white/60 hover:text-white transition-colors text-lg p-2 rounded-full hover:bg-white/10">
                                    <i className="ri-forward-10-line"></i>
                                </button>
                            </div>
                        </div>

                        {/* Bottom Row: Progress Bar */}
                        <div className="w-full flex items-center gap-3 text-xs font-mono text-white/60">
                            <span className="min-w-[40px] text-right">{formatTime(progress)}</span>
                            <div className="flex-1 relative h-1 bg-white/10 rounded-full group cursor-pointer">
                                <div 
                                    className="absolute h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" 
                                    style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
                                ></div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max={duration || 100} 
                                    value={progress} 
                                    onChange={handleSeek} 
                                    className="absolute w-full h-full opacity-0 cursor-pointer" 
                                />
                            </div>
                            <span className="min-w-[40px]">{formatTime(duration)}</span>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4 w-[30%] justify-end">
                        <div className="relative">
                            <button onClick={() => setShowDownload(!showDownload)} className={`p-3 rounded-full hover:bg-white/10 transition-colors ${showDownload ? 'bg-white/10 text-purple-400' : 'text-white/60'}`}>
                                <i className="ri-download-cloud-2-line text-xl"></i>
                            </button>
                            <AnimatePresence>
                                {showDownload && (
                                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-full right-0 mb-3 bg-[#121212] border border-white/10 rounded-xl p-3 w-64 shadow-2xl overflow-hidden flex flex-col gap-1 z-50">
                                        {[
                                            { quality: "12kbps", idx: 0, label: "Low" },
                                            { quality: "48kbps", idx: 1, label: "Medium" },
                                            { quality: "96kbps", idx: 2, label: "Standard" },
                                            { quality: "160kbps", idx: 3, label: "High" },
                                            { quality: "320kbps", idx: 4, label: "Ultra" },
                                            { quality: "FLAC", idx: -1, label: "Lossless" },
                                        ].map((opt, i) => (
                                            <button key={i} onClick={() => { if (opt.quality === "FLAC" || opt.quality === "320kbps") { handleGenerateAudio({ audioUrl: currentSong?.downloadUrl[4].url, imageUrl: currentSong?.image[2]?.url, songName: removeSourceAttribution(currentSong?.name), year: currentSong?.year, album: removeSourceAttribution(currentSong?.album?.name), artist: currentSong?.artists?.primary?.map(a => a.name).join(", ") }); } else { handleDownloadClick(currentSong?.downloadUrl[opt.idx].url, `${currentSong?.name} ${opt.quality}`); } setShowDownload(false); }} className="flex items-center justify-between px-3 py-2 hover:bg-white/10 rounded-lg group transition-colors">
                                                <span className="text-xs font-semibold text-white/90 group-hover:text-white">{opt.quality}</span>
                                                <span className="text-[10px] text-white/40 uppercase tracking-wider">{opt.label}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button onClick={onLikeToggle} className={`p-3 rounded-full hover:bg-white/10 transition-colors ${isLike ? "text-red-500" : "text-white/60"}`}>
                            <i className={`${isLike ? "ri-heart-3-fill" : "ri-heart-3-line"} text-xl`}></i>
                        </button>
                        <div className="flex items-center gap-3">
                            <i className={`text-white/60 text-lg ${volume === 0 ? 'ri-volume-mute-line' : 'ri-volume-up-line'}`}></i>
                            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="w-24 h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:[&::-webkit-slider-thumb]:scale-110" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PlayerControlBar;
