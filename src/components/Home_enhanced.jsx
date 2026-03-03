// Enhanced Home component with working Jio Saavan API
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMusic } from "../context/MusicContext";
import { jioSaavanAPI } from "../jioSaavanApi";

const logo = "/logo3.jpg";
import axios from "axios";
import Loading from "./Loading";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import "./style.css";
const wavs = "/wavs.gif";
const wait = "/wait.gif";
import {
  animate,
  circIn,
  circInOut,
  circOut,
  easeIn,
  easeInOut,
  easeOut,
  motion,
} from "framer-motion";
import { useAnimate, stagger } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import handleGenerateAudio from "./../utils/audioUtils";
import { getArtistMetadata } from "../utils/artistUtils";
import { removeSourceAttribution, getAlbumFromTitle } from "../utils/stringUtils";
import useDragScroll from "../utils/useDragScroll";

// Enhanced error handling and API switching
const useApiWithFallback = () => {
  const [currentApiIndex, setCurrentApiIndex] = useState(0);

  const callWithFallback = async (apiCall, ...args) => {
    try {
      // Try primary API first
      const result = await apiCall(...args);
      return result;
    } catch (primaryError) {
      console.warn("Primary API failed, trying fallback:", primaryError.message);

      try {
        // Switch to alternative API
        jioSaavanAPI.switchToAlternative(currentApiIndex + 1);
        setCurrentApiIndex(currentApiIndex + 1);

        const result = await apiCall(...args);
        toast.success("Switched to backup API");
        return result;
      } catch (fallbackError) {
        console.error("All APIs failed:", fallbackError.message);
        throw new Error("All music services are currently rate limited. Please try again in a few minutes.");
      }
    }
  };

  return { callWithFallback, resetToPrimary: () => {
    jioSaavanAPI.resetToPrimary();
    setCurrentApiIndex(0);
  }};
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const filterUndesiredSongs = (songs) => {
  const undesiredKeywords = [
    "rhyme", "kids", "devotional", "god", "divine", "mantra", "chant", "baby",
    "children", "prayer", "worship", "gospel", "spiritual", "meditation", "nursery",
    "lullaby", "story", "stories",
    "bhajan", "aarti", "chalisa", "shloka", "sloka", "stotra", "stotram", "vandana",
    "namavali", "kirtan", "sankirtan", "dhun", "kath", "paath", "amritwani",
    "bakthi", "bhakthi", "suprabhatam", "kavasam", "potri", "alar", "virutham",
    "padhigam", "thirumurai", "thevaram", "thiruvasagam",
    "dandakam", "astakam", "ashtakam",
    "hindu devotional", "christian devotional", "muslim devotional"
  ];

  return songs.filter(song => {
    const songName = (song.name || song.title || "").toLowerCase();
    const albumName = (song.album?.name || "").toLowerCase();
    const subtitle = (song.subtitle || "").toLowerCase();

    return !undesiredKeywords.some(keyword =>
      songName.includes(keyword) ||
      albumName.includes(keyword) ||
      subtitle.includes(keyword)
    );
  });
};

const ScrollButtons = ({ scrollRef }) => {
  const scroll = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };
  return (
    <>
      <div onClick={() => scroll(-400)} className="z-10 absolute left-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm cursor-pointer transition-all duration-300 opacity-0 group-hover:opacity-100">
        <i className="ri-arrow-left-s-line text-white text-2xl"></i>
      </div>
      <div onClick={() => scroll(400)} className="z-10 absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm cursor-pointer transition-all duration-300 opacity-0 group-hover:opacity-100">
        <i className="ri-arrow-right-s-line text-white text-2xl"></i>
      </div>
    </>
  );
};

const FreshHitRow = ({ language, data, navigate, onRefresh }) => {
  const scrollRef = useRef(null);
  useDragScroll(scrollRef, data);

  if (!data || data.length === 0) return null;

  const languageDisplayMap = {
    Tamil: "தமிழ்",
    Hindi: "हिंदी",
    English: "English",
    Telugu: "తెలుగు",
    Malayalam: "മലയാളം",
  };

  return (
    <div className="fresh-hits w-full flex flex-col gap-3 ">
      <div className="relative w-full py-3 px-6 mb-2 flex items-center justify-between rounded-3xl bg-white/5 backdrop-blur-2xl border-t border-l border-r border-white/10 border-b-0 shadow-xl overflow-hidden shrink-0 group">
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#8A2BE2] via-[#BF40FF] to-[#8A2BE2] blur-[1px] shadow-[0_0_20px_rgba(191,64,255,0.6)]"></div>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/20 border border-white/5 backdrop-blur-md shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] cursor-pointer hover:bg-white/10 hover:scale-105 transition-all duration-300">
          <i className="ri-music-fill text-white text-xl"></i>
        </div>
        <h3 className="text-2xl font-bold text-white/90 tracking-wide capitalize drop-shadow-lg font-sans">
          Fresh Hits
        </h3>
        <div onClick={() => onRefresh(language)} className="flex items-center justify-center w-10 h-10 rounded-full bg-black/20 border border-white/5 backdrop-blur-md shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] cursor-pointer hover:bg-white/10 hover:scale-105 transition-all duration-300">
          <i className="ri-refresh-line text-white text-xl"></i>
        </div>
      </div>
      <div className="relative group w-full">
        <ScrollButtons scrollRef={scrollRef} />
        <div ref={scrollRef} className="freshhitsdata custom-scrollbar px-5 sm:px-3 flex flex-shrink gap-5 overflow-x-auto w-full pb-4">
          {data.map((f, i) => (
            <motion.div
              initial={{ y: -100, scale: 0.5 }}
              whileInView={{ y: 0, scale: 1 }}
              transition={{ ease: "circIn", duration: 0.05 }}
              onClick={() => navigate(`/playlist/details/${f.id}`)}
              key={i}
              className="hover:scale-110 sm:hover:scale-105 duration-300 flex-shrink-0 w-[15%] sm:w-[40%] rounded-md flex flex-col gap-2 py-4 cursor-pointer"
            >
              <img
                className="w-full rounded-md"
                src={f.image?.[2]?.link || f.image?.[2]?.url || f.image?.[0]?.link || f.image?.[0]?.url}
                alt=""
              />
              <motion.h3 className="leading-none">
                {removeSourceAttribution(f.name)}
              </motion.h3>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong, togglePlay, setQueue } = useMusic();
  const [home, sethome] = useState(null);
  const [language, setlanguage] = useState(localStorage.getItem("language") || "Tamil");
  const [details, setdetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [like, setlike] = useState(false);
  var [page, setpage] = useState(Math.floor(Math.random() * 50) + 1);
  var [page2, setpage2] = useState(Math.floor(Math.random() * 50) + 1);

  const [suggSong, setsuggSong] = useState([]);
  const [freshHitsData, setFreshHitsData] = useState([]);
  const [bestOf90s, setBestOf90s] = useState([]);
  const [indiaSuperhitsTop50, setIndiaSuperhitsTop50] = useState([]);
  const [tamilPlaylists, setTamilPlaylists] = useState([]);
  const [devotionalPlaylists, setDevotionalPlaylists] = useState([]);
  const [jioSaavanUpdatePlaylists, setJioSaavanUpdatePlaylists] = useState([]);
  const [currentDevotionalKeyword, setCurrentDevotionalKeyword] = useState("");

  const { callWithFallback, resetToPrimary } = useApiWithFallback();

  useEffect(() => {
    const cache = sessionStorage.getItem("home_cache");
    if (cache) {
      const { scrollY } = JSON.parse(cache);
      setTimeout(() => window.scrollTo(0, scrollY), 100);
      sessionStorage.removeItem("home_cache");
    }
  }, []);

  const navigateWithHomeCache = (path) => {
    sessionStorage.setItem(
      "home_cache",
      JSON.stringify({
        scrollY: window.scrollY,
      })
    );
    navigate(path);
  };

  const freshHitsLanguages = ["Tamil", "Hindi", "English", "Telugu", "Malayalam"];

  const detailsRef = useRef(null);
  const suggRef = useRef(null);
  const chartsRef = useRef(null);
  const playlistsRef = useRef(null);
  const albumsRef = useRef(null);
  const bestOf90sRef = useRef(null);
  const indiaSuperhitsTop50Ref = useRef(null);
  const tamilPlaylistsRef = useRef(null);
  const devotionalPlaylistsRef = useRef(null);
  const jioSaavanUpdatePlaylistsRef = useRef(null);

  useDragScroll(detailsRef, details);
  useDragScroll(suggRef, suggSong);
  useDragScroll(chartsRef, home);
  useDragScroll(playlistsRef, home);
  useDragScroll(albumsRef, home);
  useDragScroll(bestOf90sRef, bestOf90s);
  useDragScroll(indiaSuperhitsTop50Ref, indiaSuperhitsTop50);
  useDragScroll(tamilPlaylistsRef, tamilPlaylists);
  useDragScroll(devotionalPlaylistsRef, devotionalPlaylists);
  useDragScroll(jioSaavanUpdatePlaylistsRef, jioSaavanUpdatePlaylists);

  const options = [
    "Tamil", "Malayalam", "English", "Telugu", "Hindi"
  ];

  const Gethome = async () => {
    setError("");
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const [trendingSongsRes, trendingAlbumsRes, chartsRes, playlistsRes, albumsRes] = await Promise.all([
        callWithFallback(jioSaavanAPI.searchSongs, `New ${language} Songs`, 1, 10),
        callWithFallback(jioSaavanAPI.searchSongs, `New ${language} Albums`, 1, 10),
        callWithFallback(jioSaavanAPI.searchSongs, `${language} Music Playlists`, 1, 10),
        callWithFallback(jioSaavanAPI.searchSongs, `${language} Hits today`, 1, 10),
        callWithFallback(jioSaavanAPI.searchSongs, `Latest ${language} today`, 1, 10)
      ]);

      const mapItems = (items) => items ? items.map(item => ({
        id: item.id,
        name: item.name || item.title,
        title: item.title || item.name,
        subtitle: item.subtitle || item.description || "",
        type: item.type,
        image: item.image ? item.image.map(img => ({ ...img, link: img.url || img })) : [],
        url: item.url || item.perma_url,
        songs: item.songs || []
      })) : [];

      const homeData = {
        charts: mapItems(chartsRes?.data || []),
        albums: mapItems(albumsRes?.data || []),
        playlists: mapItems(playlistsRes?.data || []),
        trending: {
          songs: mapItems(trendingSongsRes?.data || []),
          albums: mapItems(trendingAlbumsRes?.data || [])
        }
      };
      sethome(homeData);
    } catch (error) {
      console.error("Error fetching home data:", error);

      if (error.response?.status === 429) {
        setError("API rate limit exceeded. Please wait a moment and try again.");
        toast.error("Rate limited - please wait");
      } else if (error.response?.status === 502) {
        setError("Server temporarily unavailable. Please try again.");
        toast.error("Server busy - retrying...");
        setTimeout(() => {
          toast.success("Retrying...");
          Gethome();
        }, 5000);
      } else if (error.message?.includes('CORS') || error.message?.includes('Network Error')) {
        setError("Unable to connect to music service. Please check if the service is available.");
        toast.error("Connection to music service failed");
      } else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        setError("Network connection failed. Please check your internet connection.");
        toast.error("Network connection failed");
      } else {
        setError("Failed to load home data. Check your connection or try again later.");
        toast.error("Failed to load home data");
      }

      // Fallback demo data
      sethome({
        charts: [
          {
            id: "demo-chart-1",
            title: "Top 50 Songs",
            subtitle: "Most popular tracks",
            type: "playlist",
            image: [{ url: "https://via.placeholder.com/500x500/8A2BE2/FFFFFF?text=Top+50" }],
            url: "#"
          }
        ],
        albums: [
          {
            id: "demo-album-1",
            title: "New Releases",
            subtitle: "Fresh albums",
            type: "album",
            image: [{ url: "https://via.placeholder.com/500x500/32CD32/FFFFFF?text=New+Releases" }],
            url: "#"
          }
        ],
        playlists: [
          {
            id: "demo-playlist-1",
            title: "Daily Mix",
            subtitle: "Personalized for you",
            type: "playlist",
            image: [{ url: "https://via.placeholder.com/500x500/FF6347/FFFFFF?text=Daily+Mix" }],
            url: "#"
          }
        ],
        trending: {
          songs: [
            {
              id: "demo-song-1",
              name: "Sample Song 1",
              album: { name: "Demo Album" },
              artists: [{ name: "Demo Artist" }],
              image: [{ url: "https://via.placeholder.com/500x500/9370DB/FFFFFF?text=Song+1" }],
              type: "song"
            }
          ],
          albums: []
        }
      });
    }
  };

  const GetBestOf90s = async () => {
    try {
      const data = await callWithFallback(jioSaavanAPI.searchSongs, `Best of 90s ${language}`, 1, 20);
      setBestOf90s(data?.data || []);
    } catch (error) {
      console.error("Error fetching Best of 90s:", error);
      setBestOf90s([]);
    }
  };

  const GetIndiaSuperhitsTop50 = async () => {
    if (language !== "Tamil") {
      setIndiaSuperhitsTop50([]);
      return;
    }
    try {
      const data = await callWithFallback(jioSaavanAPI.searchSongs, "India Superhits Top 50", 1, 20);
      setIndiaSuperhitsTop50(data?.data || []);
    } catch (error) {
      console.error("Error fetching India Superhits Top 50:", error);
      setIndiaSuperhitsTop50([]);
    }
  };

  const GetTamilPlaylists = async () => {
    if (language !== "Tamil") {
      setTamilPlaylists([]);
      return;
    }
    try {
      const data = await callWithFallback(jioSaavanAPI.searchSongs, "Tamil Featured Playlists", 1, 20);
      setTamilPlaylists(data?.data || []);
    } catch (error) {
      console.error("Error fetching Tamil Playlists:", error);
      setTamilPlaylists([]);
    }
  };

  const GetFreshHits = async () => {
    if (language !== "Tamil") {
      setFreshHitsData([]);
      return;
    }
    try {
      // Try to get trending songs as fresh hits
      const data = await callWithFallback(jioSaavanAPI.getTrendingSongs, language, 1, 10);
      setFreshHitsData(data?.data || []);
    } catch (error) {
      console.error("Error fetching fresh hits:", error);
      setFreshHitsData([]);
    }
  };

  const GetJioSaavanUpdatePlaylists = async () => {
    try {
      const data = await callWithFallback(jioSaavanAPI.searchSongs, `Jio Saavan Update Playlists ${language}`, 1, 20);
      setJioSaavanUpdatePlaylists(data?.data || []);
    } catch (error) {
      console.error("Error fetching Jio Saavan Update Playlists:", error);
      setJioSaavanUpdatePlaylists([]);
    }
  };

  const GetDevotionalPlaylists = async (forceRefresh = false) => {
    try {
      const devotionalKeywords = [
        "devotional songs", "bhajans", "spiritual music", "religious songs"
      ];
      const randomKeyword = devotionalKeywords[Math.floor(Math.random() * devotionalKeywords.length)];
      setCurrentDevotionalKeyword(randomKeyword);

      const data = await callWithFallback(jioSaavanAPI.searchSongs, `${randomKeyword} ${language}`, 1, 20);
      setDevotionalPlaylists(data?.data || []);
    } catch (error) {
      console.error("Error fetching devotional playlists:", error);
      setDevotionalPlaylists([]);
    }
  };

  const GetLanguageSongs = async (overridePage) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const queryPage = overridePage || page;
      const data = await callWithFallback(jioSaavanAPI.searchSongs, `${language.toLowerCase()} hits`, queryPage, 20);

      const results = data?.data || [];
      setdetails((prevDetails) => {
        const shuffledResults = shuffleArray(results);
        const filteredResults = filterUndesiredSongs(shuffledResults);

        const newData = filteredResults.filter(
          (newItem) => !prevDetails.some((prevItem) => prevItem.id === newItem.id)
        );
        return [...prevDetails, ...newData];
      });
    } catch (error) {
      console.error("Error fetching language songs:", error);

      if (error.response?.status === 429) {
        toast.error("⏳ Rate limited - Please wait 2-3 minutes before loading more songs");
        setError("Rate limited - Please wait before loading more songs");
      } else if (error.response?.status === 502) {
        toast.error("🔄 Server busy - Retrying automatically...");
        setError("Server temporarily busy - Please wait");
        setTimeout(() => {
          toast.success("🎵 Retrying now...");
          GetLanguageSongs(overridePage || page);
        }, 5000);
      } else if (error.message?.includes('CORS') || error.message?.includes('Network Error')) {
        toast.error("🌐 Connection issue - Check your internet connection");
        setError("Unable to connect to music service - Please check connection");
      } else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        toast.error("📶 Network failed - Please check your internet");
        setError("Network connection failed - Please check internet connection");
      } else {
        toast.error("❌ Failed to load songs - Please try again");
        setError("Failed to load songs - Please try again later");
      }
    }
  };

  const Getdetails = async (overridePage, customQuery) => {
    try {
      const queryPage = overridePage || page2;
      const searchQuery = customQuery || `${language.toLowerCase()} hits`;
      const data = await callWithFallback(jioSaavanAPI.searchSongs, searchQuery, queryPage, 20);

      setdetails((prevDetails) => {
        const results = data?.data || [];
        const shuffledResults = shuffleArray(results);
        const filteredResults = filterUndesiredSongs(shuffledResults);

        const newData = filteredResults.filter(
          (newItem) => !prevDetails.some((prevItem) => prevItem.id === newItem.id)
        );
        return [...prevDetails, ...newData];
      });
    } catch (error) {
      console.log("error", error);
      toast.error("Failed to load songs");
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Gethome();
        await GetLanguageSongs();
        await GetBestOf90s();
        await GetIndiaSuperhitsTop50();
        await GetTamilPlaylists();
        await GetFreshHits();
        await GetJioSaavanUpdatePlaylists();
        await GetDevotionalPlaylists();
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [language]);

  const handleLanguageChange = async (selectedLanguage) => {
    setlanguage(selectedLanguage);
    localStorage.setItem("language", selectedLanguage);
    setLoading(true);
    try {
      await Gethome();
      await GetLanguageSongs();
    } catch (error) {
      console.error("Error changing language:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAiShuffle = () => {
    const randomPage = Math.floor(Math.random() * 50) + 1;
    const modifiers = ["Hits", "Top Songs", "Latest", "Trending", "Party Mix", "Melody", "Classic"];
    const randomModifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    const shuffleQuery = `${language} ${randomModifier}`;

    toast(`AI Shuffling ${language} ${randomModifier}! 🎲✨`, {
      icon: "🤖",
      style: {
        borderRadius: "10px",
        background: "linear-gradient(to right, #8A2BE2, #BF40FF)",
        color: "#fff",
      },
    });

    setdetails([]);
    setpage(randomPage);
    setpage2(randomPage);
    Getdetails(randomPage, shuffleQuery);
  };

  const handleRefreshSongs = () => {
    const randomPage = Math.floor(Math.random() * 50) + 1;
    setdetails([]);
    setpage(randomPage);

    toast.success(`Refreshing ${language} Songs...`, {
      icon: "🔄",
      style: {
        borderRadius: "10px",
        background: "#1a1a1a",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.1)",
      },
    });

    const sequentialLanguages = ["english", "tamil", "malayalam", "telugu", "hindi"];
    if (sequentialLanguages.includes(language.toLowerCase())) {
      GetLanguageSongs(randomPage);
    } else {
      Getdetails(randomPage);
    }
  };

  const refreshHomeData = async () => {
    try {
      toast.success("Refreshing Charts & Albums...");
      const [trendingSongsRes, trendingAlbumsRes, chartsRes, playlistsRes, albumsRes] = await Promise.all([
        callWithFallback(jioSaavanAPI.searchSongs, `Trending ${language}`, 1, 10),
        callWithFallback(jioSaavanAPI.searchSongs, `Trending ${language} Albums`, 1, 10),
        callWithFallback(jioSaavanAPI.searchSongs, `Top ${language}`, 1, 10),
        callWithFallback(jioSaavanAPI.searchSongs, `${language} Hits`, 1, 10),
        callWithFallback(jioSaavanAPI.searchSongs, `Latest ${language}`, 1, 10)
      ]);

      const mapItems = (items) => items ? items.map(item => ({
        id: item.id,
        name: item.name || item.title,
        title: item.title || item.name,
        subtitle: item.subtitle || item.description || "",
        type: item.type,
        image: item.image ? item.image.map(img => ({ ...img, link: img.url })) : [],
        url: item.url,
        songs: item.songs || []
      })) : [];

      const homeData = {
        charts: mapItems(chartsRes?.data || []),
        albums: mapItems(albumsRes?.data || []),
        playlists: mapItems(playlistsRes?.data || []),
        trending: {
          songs: mapItems(trendingSongsRes?.data || []),
          albums: mapItems(trendingAlbumsRes?.data || [])
        }
      };

      sethome(homeData);
      toast.success("Refreshed!");
    } catch (error) {
      console.log("error", error);
      toast.error("Failed to refresh.");
    }
  };

  const refreshSuggestions = () => {
    setsuggSong([]);
    processLikedSongIds();
    toast.success("Refreshing suggestions...");
  };

  const processLikedSongIds = () => {
    const likedSongs = JSON.parse(localStorage.getItem("likeData")) || [];
    const songIds = likedSongs.map((song) => song.id);
    const uniqueSongIds = Array.from(new Set(songIds));
    let selectedIds;

    if (uniqueSongIds.length <= 10) {
      selectedIds = uniqueSongIds;
    } else {
      selectedIds = uniqueSongIds.sort(() => 0.5 - Math.random()).slice(0, 10);
    }

    localStorage.setItem("selectedSongIds", JSON.stringify(selectedIds));
    fetchAllSongs();
    return selectedIds;
  };

  const fetchAllSongs = async () => {
    const storedSelectedSongIds = JSON.parse(localStorage.getItem("selectedSongIds")) || [];
    console.log(storedSelectedSongIds);

    for (const id of storedSelectedSongIds) {
      try {
        const response = await callWithFallback(jioSaavanAPI.getSongDetails, id);
        const newSongs = response.data.filter((song) => {
          return !suggSong.some((prevSong) => prevSong.id === song.id);
        });
        setsuggSong((prevState) => [...prevState, ...newSongs]);
      } catch (error) {
        console.error(`Error fetching suggestions for song ${id}:`, error);
      }
    }
  };

  const audioseter = (i) => {
    if (i === null || !details[i]) return;

    const song = details[i];
    if (song.id === currentSong?.id) {
      togglePlay();
    } else {
      setQueue(details);
      playSong(song);
    }
  };

  const audioseter2 = (i) => {
    if (i === null || !suggSong[i]) return;

    const song = suggSong[i];
    if (song.id === currentSong?.id) {
      togglePlay();
    } else {
      setQueue(suggSong);
      playSong(song);
    }
  };

  return (
    <div className="home w-full min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white overflow-hidden">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />

      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-white font-medium">Loading {language} Music...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="XMAN" className="h-10 w-10 rounded-lg" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              XMAN
            </h1>
          </Link>

          <div className="flex items-center gap-4">
            <Dropdown
              options={options}
              onChange={(option) => handleLanguageChange(option.value)}
              value={language}
              placeholder="Select language"
              className="language-dropdown"
            />

            <button
              onClick={handleRefreshSongs}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Home Data */}
        {home && (
          <>
            {/* Charts */}
            {home.charts && home.charts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Top Charts</h2>
                <div ref={chartsRef} className="flex gap-4 overflow-x-auto pb-4">
                  {home.charts.map((chart, i) => (
                    <div key={i} className="flex-shrink-0 w-48">
                      <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer">
                        <img src={chart.image?.[0]?.url} alt={chart.title} className="w-full h-32 object-cover rounded" />
                        <h3 className="font-medium mt-2 truncate">{chart.title}</h3>
                        <p className="text-sm text-gray-400 truncate">{chart.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Songs */}
            {home.trending?.songs && home.trending.songs.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Trending Songs</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {home.trending.songs.slice(0, 8).map((song, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
                         onClick={() => audioseter(i)}>
                      <img src={song.image?.[0]?.url} alt={song.name} className="w-full h-32 object-cover rounded" />
                      <h3 className="font-medium mt-2 truncate">{song.name}</h3>
                      <p className="text-sm text-gray-400 truncate">{song.album?.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Songs List */}
        {details.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{language} Songs ({details.length})</h2>
              <div className="flex gap-2">
                <button onClick={handleAiShuffle} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors">
                  🎲 AI Shuffle
                </button>
                <button onClick={handleRefreshSongs} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  Load More
                </button>
              </div>
            </div>

            <div ref={detailsRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {details.map((song, i) => (
                <div key={song.id || i} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer group"
                     onClick={() => audioseter(i)}>
                  <div className="relative">
                    <img src={song.image?.[0]?.url || song.image?.[0]?.link} alt={song.name} className="w-full h-40 object-cover rounded" />
                    {currentSong?.id === song.id && isPlaying && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <i className="ri-play-fill text-white text-sm"></i>
                        </div>
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium mt-2 truncate group-hover:text-purple-400 transition-colors">
                    {song.name || song.title}
                  </h3>
                  <p className="text-sm text-gray-400 truncate">{song.album?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{song.primaryArtists || song.artists}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Playlists */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestOf90s.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Best of 90s</h3>
              <div className="space-y-2">
                {bestOf90s.slice(0, 5).map((song, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer"
                       onClick={() => setQueue(bestOf90s) || playSong(song)}>
                    <img src={song.image?.[0]?.url} alt={song.name} className="w-12 h-12 rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{song.name}</p>
                      <p className="truncate text-sm text-gray-400">{song.primaryArtists}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {indiaSuperhitsTop50.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">India Superhits Top 50</h3>
              <div className="space-y-2">
                {indiaSuperhitsTop50.slice(0, 5).map((song, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer"
                       onClick={() => setQueue(indiaSuperhitsTop50) || playSong(song)}>
                    <img src={song.image?.[0]?.url} alt={song.name} className="w-12 h-12 rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{song.name}</p>
                      <p className="truncate text-sm text-gray-400">{song.primaryArtists}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {freshHitsData.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Fresh Hits</h3>
              <div className="space-y-2">
                {freshHitsData.slice(0, 5).map((song, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer"
                       onClick={() => setQueue(freshHitsData) || playSong(song)}>
                    <img src={song.image?.[0]?.url} alt={song.name} className="w-12 h-12 rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{song.name}</p>
                      <p className="truncate text-sm text-gray-400">{song.primaryArtists}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
