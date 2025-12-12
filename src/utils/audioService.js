import { EventEmitter } from 'events';

class AudioService extends EventEmitter {
  constructor() {
    super();
    this.audio = null;
    this.currentTrack = null;
    this.playlist = [];
    this.currentIndex = -1;
    this.isPlaying = false;
    this.volume = 1;
    
    // Initialize audio element
    this.initAudioElement();
    
    // Request notification permission
    this.requestNotificationPermission();
  }

  initAudioElement() {
    this.audio = new Audio();
    
    // Event listeners for audio events
    this.audio.addEventListener('ended', () => this.handleTrackEnd());
    this.audio.addEventListener('timeupdate', () => this.emit('timeupdate', this.getCurrentTime()));
    this.audio.addEventListener('loadedmetadata', () => this.emit('durationchange', this.getDuration()));
    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.emit('pause');
    });
    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.emit('play');
    });
    this.audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      this.emit('error', e);
    });
  }

  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  async playTrack(track, playlist = null) {
    if (playlist) {
      this.setPlaylist(playlist);
    }
    
    this.currentTrack = track;
    this.audio.src = track.downloadUrl[4]?.url || track.downloadUrl[0]?.url;
    this.audio.play().catch(error => {
      console.error('Error playing track:', error);
      this.emit('error', error);
    });
    
    // Show notification
    this.showNotification(track, 'Now Playing');
    
    // Update media session
    this.updateMediaSession(track);
  }

  setPlaylist(playlist, startIndex = 0) {
    this.playlist = playlist;
    this.currentIndex = startIndex;
  }

  playNext() {
    if (this.playlist.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
      const nextTrack = this.playlist[this.currentIndex];
      this.playTrack(nextTrack);
    }
  }

  playPrevious() {
    if (this.playlist.length > 0) {
      this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
      const prevTrack = this.playlist[this.currentIndex];
      this.playTrack(prevTrack);
    }
  }

  handleTrackEnd() {
    this.emit('trackended');
    if (this.playlist.length > 0) {
      this.playNext();
    }
  }

  play() {
    this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  togglePlayPause() {
    if (this.audio.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  seek(time) {
    this.audio.currentTime = time;
  }

  setVolume(volume) {
    this.audio.volume = volume;
    this.volume = volume;
  }

  getCurrentTime() {
    return this.audio.currentTime;
  }

  getDuration() {
    return this.audio.duration;
  }

  getIsPlaying() {
    return !this.audio.paused;
  }

  showNotification(track, title = 'Now Playing') {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`${title}: ${track.name}`, {
        body: `By ${track.primary_artists || track.artists?.primary?.map(a => a.name).join(', ') || 'Unknown Artist'}`,
        icon: track.image[2]?.url || '/logo3.jpg',
        badge: '/logo3.jpg',
        tag: 'now-playing',
        requireInteraction: false,
        silent: false
      });

      // Close notification after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Add click handler to focus the page
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }

  updateMediaSession(track) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.name,
        artist: track.primary_artists || track.artists?.primary?.map(a => a.name).join(', ') || 'Unknown Artist',
        album: track.album?.name || 'Unknown Album',
        artwork: [
          { src: track.image[0]?.url, sizes: '96x96', type: 'image/jpeg' },
          { src: track.image[1]?.url, sizes: '128x128', type: 'image/jpeg' },
          { src: track.image[2]?.url, sizes: '192x192', type: 'image/jpeg' },
          { src: track.image[2]?.url, sizes: '256x256', type: 'image/jpeg' },
          { src: track.image[2]?.url, sizes: '384x384', type: 'image/jpeg' },
          { src: track.image[2]?.url, sizes: '512x512', type: 'image/jpeg' },
        ]
      });

      // Set up media session action handlers
      navigator.mediaSession.setActionHandler('play', () => {
        this.play();
        this.showNotification(this.currentTrack, 'Playback Resumed');
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        this.pause();
        this.showNotification(this.currentTrack, 'Playback Paused');
      });

      if (this.playlist.length > 0) {
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          this.playPrevious();
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
          this.playNext();
        });
      }

      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        this.seek(Math.max(0, this.audio.currentTime - (details.seekTime || 10)));
      });

      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        this.seek(Math.min(this.audio.duration, this.audio.currentTime + (details.seekTime || 10)));
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.fastSeek && 'fastSeek' in this.audio) {
          this.audio.fastSeek(details.seekTime);
        } else {
          this.seek(details.seekTime);
        }
      });
    }
  }

  // Background audio service methods
  enableBackgroundPlayback() {
    // Keep the service worker alive for background playback
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        if (registration.active) {
          // Post message to service worker to keep it alive
          registration.active.postMessage({
            type: 'KEEP_ALIVE'
          });
        }
      });
    }
  }

  // Method to sync state across tabs
  syncStateAcrossTabs() {
    // Broadcast state changes to other tabs
    this.on('play', () => {
      localStorage.setItem('audioState', JSON.stringify({
        isPlaying: true,
        currentTime: this.audio.currentTime,
        src: this.audio.src
      }));
    });

    this.on('pause', () => {
      localStorage.setItem('audioState', JSON.stringify({
        isPlaying: false,
        currentTime: this.audio.currentTime,
        src: this.audio.src
      }));
    });

    // Listen for state changes from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'audioState' && e.newValue) {
        const state = JSON.parse(e.newValue);
        if (state.src !== this.audio.src) {
          this.audio.src = state.src;
        }
        this.audio.currentTime = state.currentTime;
        if (state.isPlaying) {
          this.audio.play();
        } else {
          this.audio.pause();
        }
      }
    });
  }
}

// Create a singleton instance
const audioService = new AudioService();
export default audioService;