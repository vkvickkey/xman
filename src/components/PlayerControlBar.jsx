import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { removeSourceAttribution } from "../utils/stringUtils";
import handleGenerateAudio from "../utils/audioUtils";
import handleGenerateAudio2 from "../utils/audioUtils2";
import toast from "react-hot-toast";

const PlayerControlBar = ({
    currentSong,
    nextSong,
    prevSong,
    onNext,
    onPrev,
    isPlaying,
    setIsPlaying,
    isLike,
    onLikeToggle,
}) => {
    const audioRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [showDownload, setShowDownload] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Handle Play/Pause
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch((e) => console.log("Play error", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentSong]);

    // Handle Song Change
    useEffect(() => {
        if (currentSong && audioRef.current) {
            // Reset time on song change if needed, though src change handles it usually
            // But we want to ensure it auto-plays
            if (isPlaying) {
                audioRef.current.play().catch(e => console.log("Autoplay error", e));
            }
        }
    }, [currentSong]);


    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
            if (isPlaying) audioRef.current.play();
        }
    };

    const handleSeek = (e) => {
        const newTime = e.target.value;
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
        }
        setCurrentTime(newTime);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
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
        link.download = `${name}.mp3`; // This might not work for cross-origin without server headers
        // Actually the original code did fetch and blob. Let's use a simpler approach or the original fetch logic if passed?
        // For now, let's use a simple window.open or the blob method if we can import it.
        // Re-implementing the blob fetch here for consistency:
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
            <div className="w-full max-w-7xl mx-auto rounded-2xl md:rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-3 md:p-5 flex flex-col md:flex-row items-center gap-3 md:gap-8">

                {/* Song Info */}
                <div className="flex items-center gap-3 w-full md:w-[25%] overflow-hidden">
                    <div onClick={() => setIsExpanded(!isExpanded)} className="relative group cursor-pointer">
                        <img
                            src={currentSong?.image?.[2]?.url}
                            className="w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl object-cover shadow-lg group-hover:opacity-80 transition-opacity"
                            alt=""
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <i className="ri-expand-up-down-line text-white text-xl"></i>
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="text-white font-bold truncate text-sm md:text-base">
                            {removeSourceAttribution(currentSong?.name)}
                        </h4>
                        <p className="text-white/50 text-xs md:text-sm truncate">
                            {removeSourceAttribution(currentSong?.album?.name)}
                        </p>
                    </div>

                    {/* Mobile Actions */}
                    <div className="flex md:hidden items-center gap-3">
                        <button onClick={onLikeToggle} className={`${isLike ? "text-red-500" : "text-white/60"} text-xl`}>
                            <i className={isLike ? "ri-heart-3-fill" : "ri-heart-3-line"}></i>
                        </button>
                        <button onClick={togglePlay} className="text-white text-3xl">
                            <i className={isPlaying ? "ri-pause-circle-fill" : "ri-play-circle-fill"}></i>
                        </button>
                    </div>
                </div>

                {/* Desktop Controls & Progress */}
                <div className="hidden md:flex flex-1 w-full flex-col items-center gap-2">
                    <div className="flex items-center gap-6">
                        <button onClick={onPrev} className="text-white/60 hover:text-white transition-colors text-2xl">
                            <i className="ri-skip-back-mini-fill"></i>
                        </button>
                        <button
                            onClick={togglePlay}
                            className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-pointer"
                        >
                            <i className={`${isPlaying ? "ri-pause-fill" : "ri-play-fill"} text-2xl ml-0.5`}></i>
                        </button>
                        <button onClick={onNext} className="text-white/60 hover:text-white transition-colors text-2xl">
                            <i className="ri-skip-right-fill"></i>
                        </button>
                    </div>

                    <div className="w-full flex items-center gap-3 text-xs font-medium font-mono text-white/50">
                        <span>{formatTime(currentTime)}</span>
                        <div className="flex-1 relative h-1 bg-white/10 rounded-full group cursor-pointer">
                            <div
                                className="absolute h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                            ></div>
                            <input
                                type="range"
                                min="0"
                                max={duration || 0}
                                value={currentTime}
                                onChange={handleSeek}
                                className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div
                                className="absolute h-3 w-3 bg-white rounded-full top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg"
                                style={{ left: `${(currentTime / duration) * 100 || 0}%` }}
                            ></div>
                        </div>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Volume & Downloads */}
                <div className="hidden md:flex items-center gap-4 w-[25%] justify-end">
                    {/* Download Popover */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDownload(!showDownload)}
                            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${showDownload ? 'bg-white/10 text-purple-400' : 'text-white/60'}`}
                        >
                            <i className="ri-download-cloud-2-line text-xl"></i>
                        </button>

                        <AnimatePresence>
                            {showDownload && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute bottom-full right-0 mb-3 bg-[#121212] border border-white/10 rounded-xl p-2 w-56 shadow-2xl overflow-hidden flex flex-col gap-1 z-50"
                                >
                                    {[
                                        { quality: "12kbps", idx: 0, label: "Low" },
                                        { quality: "48kbps", idx: 1, label: "Medium" },
                                        { quality: "96kbps", idx: 2, label: "Standard" },
                                        { quality: "160kbps", idx: 3, label: "High" },
                                        { quality: "320kbps", idx: 4, label: "Ultra (Poster)" },
                                        { quality: "FLAC", idx: -1, label: "Lossless" },
                                    ].map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                if (opt.quality === "FLAC") {
                                                    handleGenerateAudio2({
                                                        audioUrl: currentSong?.downloadUrl[4].url,
                                                        imageUrl: currentSong?.image[2]?.url,
                                                        songName: currentSong?.name,
                                                        year: currentSong?.year,
                                                        album: currentSong?.album?.name,
                                                        artist: currentSong?.artists?.primary?.map(a => a.name).join(",")
                                                    });
                                                } else if (opt.quality === "320kbps") {
                                                    handleGenerateAudio({
                                                        audioUrl: currentSong?.downloadUrl[4].url,
                                                        imageUrl: currentSong?.image[2]?.url,
                                                        songName: removeSourceAttribution(currentSong?.name),
                                                        year: currentSong?.year,
                                                        album: removeSourceAttribution(currentSong?.album?.name),
                                                        artist: currentSong?.artists?.primary?.map(a => a.name).join(", "),
                                                    });
                                                } else {
                                                    handleDownloadClick(currentSong?.downloadUrl[opt.idx].url, `${currentSong?.name} ${opt.quality}`);
                                                }
                                                setShowDownload(false);
                                            }}
                                            className="flex items-center justify-between px-3 py-2 hover:bg-white/10 rounded-lg group transition-colors"
                                        >
                                            <span className="text-xs font-semibold text-white/90 group-hover:text-white">{opt.quality}</span>
                                            <span className="text-[10px] text-white/40 uppercase tracking-wider">{opt.label}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button onClick={onLikeToggle} className={`p-2 rounded-full hover:bg-white/10 transition-colors ${isLike ? "text-red-500" : "text-white/60"}`}>
                        <i className={`${isLike ? "ri-heart-3-fill" : "ri-heart-3-line"} text-xl`}></i>
                    </button>

                    <div className="flex items-center gap-2 group">
                        <i className={`text-white/60 text-lg ${volume === 0 ? 'ri-volume-mute-line' : 'ri-volume-up-line'}`}></i>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:[&::-webkit-slider-thumb]:scale-110"
                        />
                    </div>
                </div>

                {/* Audio Element */}
                <audio
                    ref={audioRef}
                    src={currentSong?.downloadUrl?.[4]?.url}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={onNext}
                    crossOrigin="anonymous"
                />
            </div>

            {/* Mobile Progress Bar (Visible at bottom) */}
            <div className="md:hidden mt-2 px-2 flex items-center justify-between gap-3 text-[10px] text-white/50 font-mono">
                <span>{formatTime(currentTime)}</span>
                <div className="flex-1 h-1 bg-white/10 rounded-full relative">
                    <div
                        className="absolute h-full bg-purple-500 rounded-full"
                        style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                    ></div>
                </div>
                <span>{formatTime(duration)}</span>
            </div>
        </motion.div>
    );
};

export default PlayerControlBar;
