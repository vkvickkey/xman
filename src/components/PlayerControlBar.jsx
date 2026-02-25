import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { removeSourceAttribution, getAlbumFromTitle } from "../utils/stringUtils";
import { getArtistMetadata } from "../utils/artistUtils";
import { useMusic } from "../context/MusicContext";
import handleGenerateAudio from "../utils/audioUtils";
import toast from "react-hot-toast";

const PlayerControlBar = () => {
    const {
        currentSong,
        isPlaying,
        togglePlay,
        playNext,
        playPrev,
        progress,
        duration,
        seek,
        volume,
        setVolume
    } = useMusic();

    const [showDownload, setShowDownload] = useState(false);
    const [isLike, setIsLike] = useState(false);

    const onLikeToggle = () => setIsLike(!isLike);

    const handleSeek = (e) => {
        seek(parseFloat(e.target.value));
    };

    const handleVolumeChange = (e) => {
        setVolume(parseFloat(e.target.value));
    };

    const formatTime = (time) => {
        if (!time && time !== 0) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const handleDownloadClick = (url, name) => {
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
    };

    if (!currentSong) return null;

    const downloadOptions = [
        { quality: "12kbps", idx: 0, label: "Low" },
        { quality: "48kbps", idx: 1, label: "Medium" },
        { quality: "96kbps", idx: 2, label: "Standard" },
        { quality: "160kbps", idx: 3, label: "High" },
        { quality: "320kbps", idx: 4, label: "Ultra" },
        { quality: "FLAC", idx: -1, label: "Lossless" },
    ];

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 w-full z-[100] px-1 pb-1"
        >
            <div className="w-full max-w-2xl mx-auto rounded-lg bg-gradient-to-r from-black/80 via-black/60 to-black/80 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-1.5">

                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">

                    {/* LEFT — Cover + Info */}
                    <div className="flex items-center gap-2 min-w-0">
                        <img
                            src={currentSong?.image?.[2]?.url}
                            className="w-10 h-10 rounded-md object-cover shadow-lg flex-shrink-0"
                            alt=""
                        />

                        <div className="min-w-0 flex-1">
                            <h4 className="text-white font-bold truncate text-sm leading-tight">
                                {removeSourceAttribution(currentSong?.name)}
                            </h4>

                            <p className="text-white/60 text-xs truncate leading-tight">
                                {getArtistMetadata(currentSong?.artists).singleLine}
                            </p>
                        </div>
                    </div>


                    {/* CENTER — Controls */}
                    <div className="flex flex-col items-center gap-1">

                        <div className="flex items-center gap-1">

                            <button
                                onClick={playPrev}
                                className="text-white/60 hover:text-white text-sm p-1 rounded-full hover:bg-white/10"
                            >
                                <i className="ri-skip-back-mini-fill"></i>
                            </button>

                            <button
                                onClick={togglePlay}
                                className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                            >
                                <i className={isPlaying ? "ri-pause-fill text-lg" : "ri-play-fill text-lg pl-0.5"}></i>
                            </button>

                            <button
                                onClick={playNext}
                                className="text-white/60 hover:text-white text-sm p-1 rounded-full hover:bg-white/10"
                            >
                                <i className="ri-skip-right-fill"></i>
                            </button>

                        </div>


                        {/* Progress */}
                        <div className="w-full flex items-center gap-1 text-xs font-mono text-white/60">

                            <span className="min-w-[35px] text-right text-[10px]">
                                {formatTime(progress)}
                            </span>

                            <div className="flex-1 relative h-0.5 bg-white/10 rounded-full">
                                <div
                                    className="absolute h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                                    style={{
                                        width: `${duration ? (progress / duration) * 100 : 0}%`
                                    }}
                                />

                                <input
                                    type="range"
                                    min="0"
                                    max={duration || 100}
                                    value={progress}
                                    onChange={handleSeek}
                                    className="absolute w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>

                            <span className="min-w-[35px] text-[10px]">
                                {formatTime(duration)}
                            </span>

                        </div>
                    </div>



                    {/* RIGHT — Actions */}
                    <div className="flex items-center justify-end gap-4">

                        {/* Download */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDownload(!showDownload)}
                                className={`p-3 rounded-full hover:bg-white/10 transition-colors ${
                                    showDownload
                                        ? "bg-white/10 text-purple-400"
                                        : "text-white/60"
                                }`}
                            >
                                <i className="ri-download-cloud-2-line text-xl"></i>
                            </button>

                            <AnimatePresence>
                                {showDownload && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-full right-0 mb-3 bg-[#121212] border border-white/10 rounded-xl p-3 w-64 shadow-2xl flex flex-col gap-1 z-50"
                                    >
                                        {downloadOptions.map((opt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    if (opt.quality === "FLAC" || opt.quality === "320kbps") {
                                                        handleGenerateAudio({
                                                            audioUrl: currentSong?.downloadUrl[4].url,
                                                            imageUrl: currentSong?.image[2]?.url,
                                                            songName: removeSourceAttribution(currentSong?.name),
                                                            year: currentSong?.year,
                                                            album: removeSourceAttribution(currentSong?.album?.name),
                                                            artist: currentSong?.artists?.primary?.map(a => a.name).join(", ")
                                                        });
                                                    } else {
                                                        handleDownloadClick(
                                                            currentSong?.downloadUrl[opt.idx].url,
                                                            `${currentSong?.name} ${opt.quality}`
                                                        );
                                                    }

                                                    setShowDownload(false);
                                                }}
                                                className="flex items-center justify-between px-3 py-2 hover:bg-white/10 rounded-lg"
                                            >
                                                <span className="text-xs text-white/90">
                                                    {opt.quality}
                                                </span>
                                                <span className="text-[10px] text-white/40 uppercase">
                                                    {opt.label}
                                                </span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>


                        {/* Like */}
                        <button
                            onClick={onLikeToggle}
                            className={`p-3 rounded-full hover:bg-white/10 ${
                                isLike ? "text-red-500" : "text-white/60"
                            }`}
                        >
                            <i className={`${isLike ? "ri-heart-3-fill" : "ri-heart-3-line"} text-xl`}></i>
                        </button>


                        {/* Volume */}
                        <div className="flex items-center gap-2">
                            <i
                                className={`text-white/60 text-lg ${
                                    volume === 0
                                        ? "ri-volume-mute-line"
                                        : "ri-volume-up-line"
                                }`}
                            ></i>

                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                            />
                        </div>

                    </div>

                </div>
            </div>
        </motion.div>
    );
};

export default PlayerControlBar;