import React from "react";
import { Route, Routes } from "react-router-dom";
import Playlist from "./components/Playlist";
import PlaylistDetails from "./components/PlaylistDetails";
import Artists from "./components/Artists";
import ArtistsDetails from "./components/ArtistsDetails";
import Download from "./components/Download";
import Home from "./components/Home";
import AlbumDetails from "./components/AlbumDetails";
import Album from "./components/Album";
import Songs from "./components/Songs";
import Likes from "./components/Likes";
import SongDetails from "./components/SongDetails";
import Import from "./components/Import";
import AudioPlayer from "./components/AudioPlayer";
import { useAudioPlayer } from "./contexts/AudioPlayerContext";

const App = () => {
  const { currentSong, isPlaying, queue, currentIndex, playNext, playPrev, togglePlayPause, setPlayerVolume, setPlayerCrossfade, setPlayerAutoplay, queueSong, removeFromQueue } = useAudioPlayer();

  return (
    <div className="w-full min-h-screen pb-20"> {/* Added pb-20 to account for fixed player */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/songs" element={<Songs />} />
        <Route path="/songs/details/:id" element={<SongDetails />} />
        <Route path="/album" element={<Album />} />
        <Route path="/albums/details/:id" element={<AlbumDetails />} />
        <Route path="/download" element={<Download />} />
        <Route path="/playlist" element={<Playlist />} />
        <Route path="/playlist/details/:id" element={<PlaylistDetails />} />
        <Route path="/artists" element={<Artists />} />
        <Route path="/artists/details/:id" element={<ArtistsDetails />} />
        <Route path="/likes" element={<Likes/>} />
        <Route path="/import" element={<Import/>} />
      </Routes>
      <AudioPlayer 
        currentSong={currentSong}
        isPlaying={isPlaying}
        onPlayPause={togglePlayPause}
        onNext={playNext}
        onPrev={playPrev}
        onVolumeChange={setPlayerVolume}
        onSeek={() => {}} // Implement seek if needed
        onSetCrossfade={setPlayerCrossfade}
        onSetAutoplay={setPlayerAutoplay}
        onQueueSong={queueSong}
        onRemoveFromQueue={removeFromQueue}
        queue={queue}
        currentIndex={currentIndex}
      />
    </div>
  );
};

export default App;
