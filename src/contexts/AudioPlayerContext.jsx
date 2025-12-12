import React, { createContext, useContext, useState, useEffect } from 'react';

const AudioPlayerContext = createContext();

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};

export const AudioPlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [crossfade, setCrossfade] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  // Add song to queue
  const addToQueue = (song) => {
    setQueue(prev => [...prev, song]);
  };

  // Remove song from queue
  const removeFromQueue = (index) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  // Play a specific song
  const playSong = (song, songQueue = null) => {
    setCurrentSong(song);
    setIsPlaying(true);
    
    // If a new queue is provided, use it; otherwise, just play the single song
    if (songQueue) {
      setQueue(songQueue);
      const index = songQueue.findIndex(s => s.id === song.id);
      setCurrentIndex(index >= 0 ? index : 0);
    } else {
      // If no queue is provided but we have a queue, update the current index
      if (queue.length > 0) {
        const index = queue.findIndex(s => s.id === song.id);
        if (index >= 0) {
          setCurrentIndex(index);
        }
      }
    }
  };

  // Play next song
  const playNext = () => {
    if (queue.length > 0) {
      const nextIndex = (currentIndex + 1) % queue.length;
      setCurrentIndex(nextIndex);
      setCurrentSong(queue[nextIndex]);
      setIsPlaying(true);
    }
  };

  // Play previous song
  const playPrev = () => {
    if (queue.length > 0) {
      const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
      setCurrentIndex(prevIndex);
      setCurrentSong(queue[prevIndex]);
      setIsPlaying(true);
    }
  };

  // Toggle play/pause
  const togglePlayPause = (play = null) => {
    if (play !== null) {
      setIsPlaying(play);
    } else {
      setIsPlaying(prev => !prev);
    }
  };

  // Set volume
  const setPlayerVolume = (vol) => {
    setVolume(vol);
  };

  // Set crossfade
  const setPlayerCrossfade = (fade) => {
    setCrossfade(fade);
  };

  // Set autoplay
  const setPlayerAutoplay = (auto) => {
    setAutoplay(auto);
  };

  // Handle song end - with crossfade and autoplay logic
  const handleSongEnd = () => {
    if (autoplay) {
      playNext();
    } else {
      setIsPlaying(false);
    }
  };

  // Add song to "Play Next" position
  const playNextSong = (song) => {
    if (queue.length === 0) {
      // If no queue, create a new one with current song and the new song
      if (currentSong) {
        setQueue([currentSong, song]);
        setCurrentIndex(0);
      } else {
        setQueue([song]);
        setCurrentIndex(0);
        playSong(song);
      }
    } else {
      // Insert after current position
      const newQueue = [...queue];
      newQueue.splice(currentIndex + 1, 0, song);
      setQueue(newQueue);
    }
  };

  // Add song to end of queue
  const queueSong = (song) => {
    setQueue(prev => [...prev, song]);
  };

  const value = {
    currentSong,
    isPlaying,
    queue,
    currentIndex,
    volume,
    crossfade,
    autoplay,
    playSong,
    playNext,
    playPrev,
    togglePlayPause,
    setPlayerVolume,
    setPlayerCrossfade,
    setPlayerAutoplay,
    addToQueue,
    removeFromQueue,
    handleSongEnd,
    playNextSong,
    queueSong
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
};