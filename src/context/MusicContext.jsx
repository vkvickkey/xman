import React, { createContext, useContext, useState, useRef, useEffect } from "react";

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(new Audio());
    // Queue could be implemented here later
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);

    // Initialize audio behavior
    useEffect(() => {
        const audio = audioRef.current;

        const handleTimeUpdate = () => {
            setProgress(audio.currentTime);
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            // Auto play next song if queue exists
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("ended", handleEnded);
        };
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (currentSong) {
            // Assuming highest quality url is at index 2 or 4, or just 'url' property depending on API
            // Based on previous code analysis: e?.image[2]?.url so likely downloadUrl is similar array or direct
            // Let's assume standard Jiosaavn API structure for now, usually downloadUrl[4] is 320kbps
            // But looking at Home.jsx, it doesn't explicitly show the url path logic clearly in the brief look
            // I will assume the object passed has a direct url or I'll implement a helper.

            // We will try to find the best quality URL
            let src = "";
            if (typeof currentSong.downloadUrl === 'string') src = currentSong.downloadUrl;
            else if (Array.isArray(currentSong.downloadUrl)) src = currentSong.downloadUrl[currentSong.downloadUrl.length - 1]?.url;

            if (src && audio.src !== src) {
                audio.src = src;
                audio.play();
                setIsPlaying(true);
            }
        }
    }, [currentSong]);

    useEffect(() => {
        const audio = audioRef.current;
        if (isPlaying) audio.play().catch(e => console.log("Play error", e));
        else audio.pause();
    }, [isPlaying]);

    useEffect(() => {
        const audio = audioRef.current;
        audio.volume = volume;
    }, [volume]);

    const playSong = (song) => {
        setCurrentSong(song);
        setIsPlaying(true);
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const seek = (time) => {
        const audio = audioRef.current;
        audio.currentTime = time;
        setProgress(time);
    };

    return (
        <MusicContext.Provider
            value={{
                currentSong,
                isPlaying,
                playSong,
                togglePlay,
                volume,
                setVolume,
                progress,
                duration,
                seek
            }}
        >
            {children}
        </MusicContext.Provider>
    );
};
