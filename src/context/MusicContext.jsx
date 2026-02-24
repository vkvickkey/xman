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
        // Update currentIndex if song is in queue
        const songIndex = queue.findIndex(s => s.id === song.id);
        if (songIndex !== -1) {
            setCurrentIndex(songIndex);
        }
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

    // Media Session API for Windows/Mobile notifications
    useEffect(() => {
        if ('mediaSession' in navigator) {
            // Update metadata when song changes
            if (currentSong) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: currentSong.name || 'Unknown',
                    artist: currentSong?.artists?.primary?.map(a => a.name).join(', ') || 'Unknown Artist',
                    album: currentSong?.album?.name || 'Unknown Album',
                    artwork: [
                        { src: currentSong?.image?.[0]?.url || '', sizes: '96x96', type: 'image/jpeg' },
                        { src: currentSong?.image?.[1]?.url || '', sizes: '128x128', type: 'image/jpeg' },
                        { src: currentSong?.image?.[2]?.url || '', sizes: '256x256', type: 'image/jpeg' },
                    ]
                });
            }

            // Set up action handlers
            navigator.mediaSession.setActionHandler('play', () => {
                setIsPlaying(true);
            });
            
            navigator.mediaSession.setActionHandler('pause', () => {
                setIsPlaying(false);
            });
            
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                playPrev();
            });
            
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                playNext();
            });
            
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details.seekTime !== undefined) {
                    seek(details.seekTime);
                }
            });

            // Update playback state
            navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
        }
    }, [currentSong, isPlaying, playNext, playPrev]);

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
