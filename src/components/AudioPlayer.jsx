import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AudioPlayer = ({ 
  currentSong, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrev, 
  onVolumeChange, 
  onSeek, 
  onSetCrossfade, 
  onSetAutoplay, 
  onQueueSong, 
  onRemoveFromQueue,
  queue,
  currentIndex
}) => {
  const audioRef = useRef(null);
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showQueue, setShowQueue] = useState(false);
  const [crossfade, setCrossfade] = useState(0); // seconds
  const [autoplay, setAutoplay] = useState(true);

  // Update progress bar during playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, []);

  // Handle seeking
  const handleSeek = (e) => {
    const audio = audioRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const time = pos * audio.duration;
    audio.currentTime = time;
    onSeek(time);
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    audioRef.current.volume = vol;
    onVolumeChange(vol);
  };

  // Toggle queue visibility
  const toggleQueue = () => {
    setShowQueue(!showQueue);
  };

  // Handle crossfade change
  const handleCrossfadeChange = (value) => {
    setCrossfade(value);
    onSetCrossfade(value);
  };

  // Handle autoplay toggle
  const handleAutoplayToggle = () => {
    const newValue = !autoplay;
    setAutoplay(newValue);
    onSetAutoplay(newValue);
  };

  // Handle adding to queue
  const handleAddToQueue = () => {
    if (currentSong) {
      onQueueSong(currentSong);
    }
  };

  // Handle removing from queue
  const handleRemoveFromQueue = (index) => {
    onRemoveFromQueue(index);
  };

  // Navigate to song details
  const goToSongDetails = () => {
    if (currentSong) {
      navigate(`/songs/details/${currentSong.id}`);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white p-4 z-50 shadow-2xl">
      {/* Hidden audio element */}
      <audio 
        ref={audioRef}
        src={currentSong?.downloadUrl?.[4]?.url || ''}
        onEnded={onNext}
        onPlay={() => onPlayPause(true)}
        onPause={() => onPlayPause(false)}
      />
      
      {/* Main player controls */}
      <div className="container mx-auto max-w-6xl">
        {/* Progress bar */}
        <div 
          className="w-full h-1 bg-gray-600 rounded-full mb-3 cursor-pointer relative"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Current time and duration */}
        <div className="flex justify-between text-xs text-gray-300 mb-3">
          <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
          <span>{formatTime(audioRef.current?.duration || 0)}</span>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Song info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img 
              src={currentSong?.image?.[2]?.url || '/logo3.jpg'} 
              alt="Current song" 
              className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onClick={goToSongDetails}
            />
            <div className="min-w-0">
              <h3 
                className="font-semibold truncate text-sm md:text-base cursor-pointer hover:text-cyan-300 transition-colors"
                onClick={goToSongDetails}
              >
                {currentSong?.name || 'No song playing'}
              </h3>
              <p 
                className="text-gray-300 text-xs md:text-sm truncate cursor-pointer hover:text-pink-300 transition-colors"
                onClick={() => navigate(`/artists/details/${currentSong?.artists?.primary?.[0]?.id}`)}
              >
                {currentSong?.artists?.primary?.map(a => a.name)?.join(', ') || 'Unknown Artist'}
              </p>
            </div>
          </div>

          {/* Playback controls */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onPrev}
              className="text-xl hover:text-cyan-300 transition-colors"
              title="Previous"
            >
              <i className="ri-skip-back-fill"></i>
            </button>
            
            <button 
              onClick={() => onPlayPause(!isPlaying)}
              className="w-12 h-12 rounded-full bg-white text-indigo-900 flex items-center justify-center hover:scale-105 transition-transform"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <i className="ri-pause-fill text-xl"></i>
              ) : (
                <i className="ri-play-fill text-xl"></i>
              )}
            </button>
            
            <button 
              onClick={onNext}
              className="text-xl hover:text-cyan-300 transition-colors"
              title="Next"
            >
              <i className="ri-skip-forward-fill"></i>
            </button>
          </div>

          {/* Volume and settings */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            <div className="flex items-center gap-2">
              <i className="ri-volume-up-fill text-gray-300"></i>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 accent-cyan-500"
              />
            </div>

            {/* Queue button */}
            <button 
              onClick={toggleQueue}
              className="hover:text-cyan-300 transition-colors relative"
              title="Show Queue"
            >
              <i className="ri-play-list-add-fill text-lg"></i>
              {queue.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {queue.length}
                </span>
              )}
            </button>

            {/* Crossfade button */}
            <div className="relative group">
              <button 
                className="hover:text-cyan-300 transition-colors"
                title="Crossfade"
              >
                <i className="ri-loop-left-right-fill"></i>
              </button>
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-gray-800 p-2 rounded-lg w-40">
                <label className="block text-xs mb-1">Crossfade: {crossfade}s</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={crossfade}
                  onChange={(e) => handleCrossfadeChange(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>

            {/* Autoplay toggle */}
            <button 
              onClick={handleAutoplayToggle}
              className={`${autoplay ? 'text-cyan-300' : 'text-gray-400'} hover:text-cyan-300 transition-colors`}
              title="Autoplay"
            >
              <i className={`ri-repeat-${autoplay ? 'fill' : 'line'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Queue panel */}
      {showQueue && (
        <div className="fixed bottom-16 left-0 right-0 bg-gray-900 border-t border-gray-700 max-h-60 overflow-y-auto z-50">
          <div className="container mx-auto max-w-6xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Queue ({queue.length})</h3>
              <button 
                onClick={toggleQueue}
                className="text-gray-400 hover:text-white"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            
            {queue.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Queue is empty</p>
            ) : (
              <ul className="space-y-2">
                {queue.map((song, index) => (
                  <li 
                    key={index}
                    className={`flex items-center gap-2 p-2 rounded ${
                      index === currentIndex ? 'bg-indigo-900' : 'hover:bg-gray-800'
                    }`}
                  >
                    <img 
                      src={song.image?.[2]?.url || '/logo3.jpg'} 
                      alt={song.name} 
                      className="w-8 h-8 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm">{song.name}</p>
                      <p className="text-gray-400 text-xs truncate">{song.artists?.primary?.map(a => a.name)?.join(', ')}</p>
                    </div>
                    <button 
                      onClick={() => handleRemoveFromQueue(index)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;