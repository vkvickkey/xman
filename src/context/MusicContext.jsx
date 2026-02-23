import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";

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
    const [isShuffle, setIsShuffle] = useState(false);
    const [isRepeat, setIsRepeat] = useState(false);

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

    const playNext = useCallback(() => {
        if (queue.length > 0) {
            let nextIndex = currentIndex + 1;
            if (isShuffle) {
                nextIndex = Math.floor(Math.random() * queue.length);
            } else if (nextIndex >= queue.length) {
                if (isRepeat) nextIndex = 0;
                else return;
            }
            setCurrentIndex(nextIndex);
            playSong(queue[nextIndex]);
        }
    }, [queue, currentIndex, isShuffle, isRepeat]);

    const playPrev = useCallback(() => {
        if (queue.length > 0) {
            let prevIndex = currentIndex - 1;
            if (prevIndex < 0) {
                if (isRepeat) prevIndex = queue.length - 1;
                else return;
            }
            setCurrentIndex(prevIndex);
            playSong(queue[prevIndex]);
        }
    }, [queue, currentIndex, isRepeat]);

    useEffect(() => {
        const audio = audioRef.current;
        if (currentSong) {
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
            playNext();
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [playNext]);

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
                seek,
                isShuffle,
                setIsShuffle,
                isRepeat,
                setIsRepeat,
                playNext,
                playPrev,
                queue,
                setQueue
            }}
        >
            {children}
        </MusicContext.Provider>
    );
};
