/**
 * Jiosaavan Music App - Your Ultimate Ad-Free Music Companion
 * Built with React Native and JioSaavn Unofficial API
 */

import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import TrackPlayer, { usePlaybackState } from 'react-native-track-player';
import axios from 'axios';
import i18n from 'i18next';
import { useTranslation, initReactI18next } from 'react-i18next';

// Initialize i18n
i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        title: "Melody - JioSaavn Music",
        searchPlaceholder: "Search songs, artists, albums...",
        home: "Home",
        search: "Search",
        library: "Library",
        play: "Play",
        pause: "Pause",
        nowPlaying: "Now Playing",
        topSongs: "Top Songs",
        featured: "Featured",
        recentlyPlayed: "Recently Played",
        noResults: "No results found"
      }
    },
    hi: {
      translation: {
        title: "मेलोडी - जियोसावन संगीत",
        searchPlaceholder: "गाने, कलाकार, एल्बम खोजें...",
        home: "होम",
        search: "खोजें",
        library: "लाइब्रेरी",
        play: "चलाएं",
        pause: "रोकें",
        nowPlaying: "अभी चल रहा है",
        topSongs: "टॉप गाने",
        featured: "विशेष रुप से प्रदर्शित",
        recentlyPlayed: "हाल ही में चलाए गए",
        noResults: "कोई परिणाम नहीं मिला"
      }
    },
    ta: {
      translation: {
        title: "மெலோடி - ஜியோசாவன் இசை",
        searchPlaceholder: "பாடல்கள், கலைஞர்கள், ஆல்பங்கள் தேடுக...",
        home: "முகப்பு",
        search: "தேடுக",
        library: "நூலகம்",
        play: "இயக்கு",
        pause: "இடைநிறுத்து",
        nowPlaying: "தற்போது இயங்குகிறது",
        topSongs: "முக்கிய பாடல்கள்",
        featured: "சிறப்பு",
        recentlyPlayed: "அண்மையில் இயக்கியவை",
        noResults: "முடிவுகள் எதுவும் இல்லை"
      }
    }
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});

// Define types
interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  url: string;
  image: string;
}

interface Playlist {
  id: string;
  title: string;
  songs: Song[];
}

const App = () => {
  const { t } = useTranslation();
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize TrackPlayer
  useEffect(() => {
    const setupPlayer = async () => {
      await TrackPlayer.setupPlayer();
    };
    
    setupPlayer();
    fetchSongs();
  }, []);

  // Fetch songs from JioSaavn API
  const fetchSongs = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for demonstration - in a real app, you would use the JioSaavn API
      const mockSongs: Song[] = [
        {
          id: "1",
          title: "Tum Hi Ho",
          artist: "Arijit Singh",
          album: "Aashiqui 2",
          duration: 240,
          url: "https://example.com/song1.mp3",
          image: "https://via.placeholder.com/300x300"
        },
        {
          id: "2",
          title: "Channa Mereya",
          artist: "Arijit Singh",
          album: "Ae Dil Hai Mushkil",
          duration: 260,
          url: "https://example.com/song2.mp3",
          image: "https://via.placeholder.com/300x300"
        },
        {
          id: "3",
          title: "Kalank",
          artist: "Sonu Nigam, Monali Thakur",
          album: "Kalank",
          duration: 280,
          url: "https://example.com/song3.mp3",
          image: "https://via.placeholder.com/300x300"
        },
        {
          id: "4",
          title: "Gallan Goodiyaan",
          artist: "Vishal-Shekhar, Badshah",
          album: "Dil Dhadakne Do",
          duration: 220,
          url: "https://example.com/song4.mp3",
          image: "https://via.placeholder.com/300x300"
        },
        {
          id: "5",
          title: "Bekhayali",
          artist: "Sachet Tandon",
          album: "Kabir Singh",
          duration: 300,
          url: "https://example.com/song5.mp3",
          image: "https://via.placeholder.com/300x300"
        }
      ];

      const mockPlaylists: Playlist[] = [
        {
          id: "p1",
          title: "Top Hindi Songs",
          songs: mockSongs.slice(0, 3)
        },
        {
          id: "p2",
          title: "Romantic Hits",
          songs: mockSongs.slice(1, 4)
        }
      ];

      setSongs(mockSongs);
      setPlaylists(mockPlaylists);
    } catch (error) {
      console.error("Error fetching songs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Play a song
  const playSong = async (song: Song) => {
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: song.id,
        url: song.url,
        title: song.title,
        artist: song.artist,
        artwork: song.image,
      });
      await TrackPlayer.play();
      setCurrentSong(song);
    } catch (error) {
      console.error("Error playing song:", error);
    }
  };

  // Change language
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
  };

  // Playback state
  const playbackState = usePlaybackState();
  const isPlaying = playbackState === TrackPlayer.STATE_PLAYING;

  // Render song item
  const renderSongItem = ({ item }: { item: Song }) => (
    <TouchableOpacity 
      style={styles.songItem} 
      onPress={() => playSong(item)}
    >
      <Image source={{ uri: item.image }} style={styles.songImage} />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
      </View>
      <TouchableOpacity 
        style={styles.playButton}
        onPress={() => playSong(item)}
      >
        <Text style={styles.playButtonText}>▶</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render playlist item
  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <View style={styles.playlistContainer}>
      <Text style={styles.playlistTitle}>{item.title}</Text>
      <FlatList
        horizontal
        data={item.songs}
        renderItem={renderSongItem}
        keyExtractor={song => song.id}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('title')}</Text>
          <View style={styles.languageSelector}>
            <TouchableOpacity onPress={() => changeLanguage('en')} style={[styles.langButton, language === 'en' && styles.activeLang]}>
              <Text style={[styles.langText, language === 'en' && styles.activeLangText]}>EN</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => changeLanguage('hi')} style={[styles.langButton, language === 'hi' && styles.activeLang]}>
              <Text style={[styles.langText, language === 'hi' && styles.activeLangText]}>HI</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => changeLanguage('ta')} style={[styles.langButton, language === 'ta' && styles.activeLang]}>
              <Text style={[styles.langText, language === 'ta' && styles.activeLangText]}>TA</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchPlaceholder}>{t('searchPlaceholder')}</Text>
        </View>

        {/* Main Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
          </View>
        ) : (
          <ScrollView style={styles.content}>
            {/* Now Playing */}
            {currentSong && (
              <View style={styles.nowPlayingContainer}>
                <Text style={styles.sectionTitle}>{t('nowPlaying')}</Text>
                <TouchableOpacity 
                  style={styles.nowPlayingItem}
                  onPress={() => playSong(currentSong)}
                >
                  <Image source={{ uri: currentSong.image }} style={styles.nowPlayingImage} />
                  <View style={styles.nowPlayingInfo}>
                    <Text style={styles.nowPlayingTitle} numberOfLines={1}>{currentSong.title}</Text>
                    <Text style={styles.nowPlayingArtist} numberOfLines={1}>{currentSong.artist}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.nowPlayingButton}
                    onPress={() => isPlaying ? TrackPlayer.pause() : TrackPlayer.play()}
                  >
                    <Text style={styles.playButtonText}>{isPlaying ? '⏸' : '▶'}</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            )}

            {/* Playlists */}
            <FlatList
              data={playlists}
              renderItem={renderPlaylistItem}
              keyExtractor={playlist => playlist.id}
              showsVerticalScrollIndicator={false}
            />

            {/* All Songs */}
            <View style={styles.songsContainer}>
              <Text style={styles.sectionTitle}>{t('topSongs')}</Text>
              <FlatList
                data={songs}
                renderItem={renderSongItem}
                keyExtractor={song => song.id}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </ScrollView>
        )}

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navText}>{t('home')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navText}>{t('search')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navText}>{t('library')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  languageSelector: {
    flexDirection: 'row',
  },
  langButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginHorizontal: 2,
    backgroundColor: '#333',
  },
  activeLang: {
    backgroundColor: '#FF6B35',
  },
  langText: {
    color: '#fff',
    fontSize: 12,
  },
  activeLangText: {
    color: '#fff',
  },
  searchContainer: {
    margin: 15,
    padding: 10,
    backgroundColor: '#2a2a2a',
    borderRadius: 25,
  },
  searchPlaceholder: {
    color: '#888',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nowPlayingContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  nowPlayingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 10,
  },
  nowPlayingImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  nowPlayingInfo: {
    flex: 1,
  },
  nowPlayingTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nowPlayingArtist: {
    color: '#aaa',
    fontSize: 14,
  },
  nowPlayingButton: {
    backgroundColor: '#FF6B35',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistContainer: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  playlistTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  songsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 80,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  songArtist: {
    color: '#aaa',
    fontSize: 14,
  },
  playButton: {
    backgroundColor: '#FF6B35',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default App;
