import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMusic } from "../context/MusicContext";


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
import { getApiUrl } from "../apiConfig";

// Static playlist configuration removed

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
    // English / General
    "rhyme", "kids", "devotional", "god", "divine", "mantra", "chant", "baby",
    "children", "prayer", "worship", "gospel", "spiritual", "meditation", "nursery",
    "lullaby", "story", "stories",

    // Hindi / Sanskrit
    "bhajan", "aarti", "chalisa", "shloka", "sloka", "stotra", "stotram", "vandana",
    "namavali", "kirtan", "sankirtan", "dhun", "kath", "paath", "amritwani",

    // Tamil
    "bakthi", "bhakthi", "suprabhatam", "kavasam", "potri", "alar", "virutham",
    "padhigam", "thirumurai", "thevaram", "thiruvasagam",

    // Telugu
    "dandakam", "astakam", "ashtakam",

    // Malayalam
    "hindu devotional", "christian devotional", "muslim devotional",

    // Gods / Deities (Common across languages)
    "ganesh", "ganpati", "vinayagar", "pillaiyar",
    "hanuman", "anjaneya",
    "sai baba", "shirdi",
    "krishna", "govinda", "gopal",
    "rama", "sri ram", "seetharam",
    "shiva", "mahadev", "sivan", "nataraja",
    "durga", "kali", "devi", "amman", "mariamman",
    "lakshmi", "mahalakshmi",
    "saraswati",
    "vishnu", "perumal", "balaji", "venkateswara",
    "ayyappan", "murugan", "subramanya", "karthikeya", "vel",
    "jesus", "christ",
    "allah"
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
  // const [songlink, setsonglink] = useState([]);
  // const [songlink2, setsonglink2] = useState([]);
  // const [songlinkchecker, setsonglinkchecker] = useState(null);
  const [like, setlike] = useState(false);
  // var [index, setindex] = useState(null);
  // var [index2, setindex2] = useState(null);
  var [page, setpage] = useState(Math.floor(Math.random() * 50) + 1);
  var [page2, setpage2] = useState(Math.floor(Math.random() * 50) + 1);
  // const audioRef = useRef();
  // const [audiocheck, setaudiocheck] = useState(false);

  // const [selectedSongIds, setSelectedSongIds] = useState([]);
  const [suggSong, setsuggSong] = useState([]);
  const [freshHitsData, setFreshHitsData] = useState([]);
  const [bestOf90s, setBestOf90s] = useState([]);

  const [indiaSuperhitsTop50, setIndiaSuperhitsTop50] = useState([]);
  const [tamilPlaylists, setTamilPlaylists] = useState([]);
  const [devotionalPlaylists, setDevotionalPlaylists] = useState([]);
  const [jioSaavanUpdatePlaylists, setJioSaavanUpdatePlaylists] = useState([]);
  const [currentDevotionalKeyword, setCurrentDevotionalKeyword] = useState("");

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

  // Refs for horizontal scrolling
  const detailsRef = useRef(null);
  const suggRef = useRef(null);
  const chartsRef = useRef(null);
  const playlistsRef = useRef(null);
  const albumsRef = useRef(null);
  // const freshHitsRef = useRef(null); // Removed single ref
  const bestOf90sRef = useRef(null);
  const indiaSuperhitsTop50Ref = useRef(null);
  const tamilPlaylistsRef = useRef(null);
  const devotionalPlaylistsRef = useRef(null);
  const jioSaavanUpdatePlaylistsRef = useRef(null);

  // Initialize scroll hooks with dependencies
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
    // "hindi",
    // "english",
    // "punjabi",
    // "tamil",
    // "telugu",
    // "marathi",
    // "gujarati",
    // "bengali",
    // "kannada",
    // "bhojpuri",
    // "malayalam",
    // "urdu",
    // "haryanvi",
    // "rajasthani",
    // "odia",
    // "assamese",
    "Tamil",
    "Malayalam",
    "English",
    "Telugu",
    "Hindi",
    // "punjabi",
    // "hindi",
    // "marathi",
    // "gujarati",
    // "bengali",
    // "kannada",
    // "bhojpuri",
    // "urdu",
    // "haryanvi",
    // "rajasthani",
    // "odia",
    // "assamese",
  ];


  // Content categories: Music Playlists & New Songs & Devotional
  const Gethome = async () => {
    setError("");
    try {
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Use the new API endpoints with correct parameter names
      const [trendingSongsRes, trendingAlbumsRes, chartsRes, playlistsRes, albumsRes] = await Promise.all([
        axios.get(getApiUrl("search", `/search/songs?query=New ${language} Songs&limit=10`)),
        axios.get(getApiUrl("search", `/search/albums?query=New ${language} Albums&limit=10`)),
        axios.get(getApiUrl("search", `/search/playlists?query=${language} Music Playlists&limit=10`)),
        axios.get(getApiUrl("search", `/search/playlists?query=${language} Hits today&limit=10`)),
        axios.get(getApiUrl("search", `/search/albums?query=Latest ${language} today&limit=10`))
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
        charts: mapItems(chartsRes?.data?.data?.results || chartsRes?.data?.results || []),
        albums: mapItems(albumsRes?.data?.data?.results || albumsRes?.data?.results || []),
        playlists: mapItems(playlistsRes?.data?.data?.results || playlistsRes?.data?.results || []),
        trending: {
          songs: mapItems(trendingSongsRes?.data?.data?.results || trendingSongsRes?.data?.results || []),
          albums: mapItems(trendingAlbumsRes?.data?.data?.results || trendingAlbumsRes?.data?.results || [])
        }
      };
      sethome(homeData);
    } catch (error) {
      console.error("Error fetching home data:", error);

      // Check for specific error types
      if (error.response?.status === 429) {
        setError("API rate limit exceeded. Please wait a moment and try again.");
        toast.error("Rate limited - please wait");
      } else if (error.response?.status === 502) {
        // 502 Bad Gateway - upstream server error, retry once after delay
        console.log("502 error in home data, retrying after delay...");
        setTimeout(() => {
          toast.error("Server temporarily unavailable, retrying home data...");
          Gethome();
        }, 5000);
      } else if (error.response?.status === 402) {
        setError("Music service requires payment. Service temporarily unavailable.");
        toast.error("Music service temporarily unavailable");
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

      // Set fallback demo data to prevent crashes and show something on the page
      sethome({
        charts: [
          {
            id: "demo-chart-1",
            title: "Top 50 Songs",
            subtitle: "Most popular tracks",
            type: "playlist",
            image: [{ url: "https://via.placeholder.com/500x500/8A2BE2/FFFFFF?text=Top+50" }],
            url: "#"
          },
          {
            id: "demo-chart-2",
            title: "Trending Now",
            subtitle: "Latest hits",
            type: "playlist",
            image: [{ url: "https://via.placeholder.com/500x500/FF69B4/FFFFFF?text=Trending" }],
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
          },
          {
            id: "demo-album-2",
            title: "Top Albums",
            subtitle: "Popular albums",
            type: "album",
            image: [{ url: "https://via.placeholder.com/500x500/FFD700/FFFFFF?text=Top+Albums" }],
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
          },
          {
            id: "demo-playlist-2",
            title: "Discover Weekly",
            subtitle: "New music discovery",
            type: "playlist",
            image: [{ url: "https://via.placeholder.com/500x500/00CED1/FFFFFF?text=Discover" }],
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
            },
            {
              id: "demo-song-2",
              name: "Sample Song 2",
              album: { name: "Demo Album 2" },
              artists: [{ name: "Demo Artist 2" }],
              image: [{ url: "https://via.placeholder.com/500x500/20B2AA/FFFFFF?text=Song+2" }],
              type: "song"
            }
          ],
          albums: [
            {
              id: "demo-trending-album-1",
              title: "Trending Album 1",
              subtitle: "Popular album",
              type: "album",
              image: [{ url: "https://via.placeholder.com/500x500/FF69B4/FFFFFF?text=Trending+1" }],
              url: "#"
            },
            {
              id: "demo-trending-album-2",
              title: "Trending Album 2",
              subtitle: "Hot album",
              type: "album",
              image: [{ url: "https://via.placeholder.com/500x500/8A2BE2/FFFFFF?text=Trending+2" }],
              url: "#"
            }
          ]
        }
      });
    }
  };


  const GetBestOf90s = async () => {
    try {
      const query = `Best of 90s ${language}`;
      const { data } = await axios.get(
        getApiUrl("search", `/search/playlists?query=${encodeURIComponent(query)}&limit=20`)
      );
      setBestOf90s(data?.data?.results || []);
    } catch (error) {
      console.error("Error fetching Best of 90s:", error);
    }
  };




  const GetIndiaSuperhitsTop50 = async () => {
    if (language !== "Tamil") {
      setIndiaSuperhitsTop50([]);
      return;
    }
    try {
      let query = "";
      // specific queries based on language as requested
      if (language === "Tamil") {
        query = "India Superhits Top 50";
      } else if (language === "Telugu") {
        query = "India Superhits Top 50 -";
      } else if (language === "Malayalam") {
        query = "India Superhits Top 50";
      } else if (language === "Hindi") {
        query = "India Superhits Top 50";
      } else if (language === "Haryanvi") {
        query = "India Superhits Top 50";
      } else if (language === "English" || language === "International") {
        query = "India Superhits Top 50";
      } else {
        // Default fallback
        query = `India Superhits Top 50 ${language}`;
      }

      const { data } = await axios.get(
        getApiUrl("search", `/search/playlists?query=${encodeURIComponent(query)}&limit=20`)
      );
      setIndiaSuperhitsTop50(data?.data?.results || []);
    } catch (error) {
      console.error("Error fetching India Superhits Top 50:", error);
    }
  };

  const GetTamilPlaylists = async () => {
    if (language !== "Tamil") {
      setTamilPlaylists([]);
      return;
    }
    try {
      const { data } = await axios.get(
        getApiUrl("search", `/search/playlists?query=Tamil Featured Playlists&limit=20`)
      );
      setTamilPlaylists(data?.data?.results || []);
    } catch (error) {
      console.error("Error fetching Tamil Playlists:", error);
    }
  };

  const GetFreshHits = async () => {
    if (language !== "Tamil") {
      setFreshHitsData([]);
      return;
    }
    try {
      // IDs provided by user
      const ids = ["10763385", "146675675", "85481065", "6689255", "2912846", "976143557", "218822376",];
      const promises = ids.map(async (id) => {
        try {
          const { data } = await axios.get(
            getApiUrl("search", `/playlists?id=${id}`)
          );
          return data.data; // The API returns the playlist object directly in data.data
        } catch (err) {
          console.error(`Error fetching fresh hit playlist ${id}:`, err);
          return null;
        }
      });

      const results = await Promise.all(promises);
      // Filter out any nulls from failed requests
      const validResults = results.filter(item => item !== null);

      setFreshHitsData(validResults);

    } catch (error) {
      console.error("Error fetching fresh hits:", error);
    }
  };

  const GetJioSaavanUpdatePlaylists = async () => {
    try {
      const { data } = await axios.get(
        getApiUrl("search", `/search/playlists?query=Jio Saavan Update Playlists ${language}&limit=20`)
      );
      setJioSaavanUpdatePlaylists(data?.data?.results || []);
    } catch (error) {
      console.error("Error fetching Jio Saavan Update Playlists:", error);
    }
  };

  const GetDevotionalPlaylists = async (forceRefresh = false) => {
    try {
      const commonKeywords = [
        "ganesh", "ganpati", "vinayagar", "pillaiyar",
        "hanuman", "anjaneya",
        "sai baba", "shirdi",
        "krishna", "govinda", "gopal",
        "rama", "sri ram", "seetharam",
        "shiva", "mahadev", "sivan", "nataraja",
        "durga", "kali", "devi", "amman", "mariamman",
        "lakshmi", "mahalakshmi",
        "saraswati",
        "vishnu", "perumal", "balaji", "venkateswara",
        "ayyappan", "murugan", "subramanya", "karthikeya", "vel",
        "jesus", "christ",
        "allah"
      ];

      const languageKeywords = {
        Tamil: [
          "bakthi", "bhakthi", "suprabhatam", "kavasam", "potri", "alar", "virutham",
          "padhigam", "thirumurai", "thevaram", "thiruvasagam"
        ],
        Telugu: [
          "dandakam", "astakam", "ashtakam"
        ],
        Malayalam: [
          "hindu devotional", "christian devotional", "muslim devotional"
        ],
        Hindi: [
          "bhajan", "aarti", "chalisa", "shloka", "sloka", "stotra", "stotram", "vandana",
          "namavali", "kirtan", "sankirtan", "dhun", "kath", "paath", "amritwani"
        ],
        English: [
          "devotional", "god", "divine", "mantra", "chant", "baby",
          "children", "prayer", "worship", "gospel", "spiritual", "meditation", "nursery",
          "lullaby", "story", "stories"
        ]
      };

      // General fallback if language not found in map (though we cover most)
      // or if we just want to include generic terms
      const generalKeywords = [
        "devotional", "spiritual", "mantra", "chant"
      ];

      let availableKeywords = [...commonKeywords];

      if (languageKeywords[language]) {
        availableKeywords = [...availableKeywords, ...languageKeywords[language]];
      } else {
        // Default to English/General if language not specific (e.g. Sanskrit might fall under Hindi mostly)
        availableKeywords = [...availableKeywords, ...languageKeywords["English"], ...languageKeywords["Hindi"]];
      }

      // If we want to strictly follow the language selection for "English/General" set from user request:
      if (language === "English") {
        availableKeywords = [...commonKeywords, ...languageKeywords["English"]];
      }


      // Select a random keyword
      const randomKeyword = availableKeywords[Math.floor(Math.random() * availableKeywords.length)];

      // If we already have a keyword and it's not a forced refresh, maybe we want to keep it? 
      // But typically when language changes we want new data. 
      // Let's just set it.
      setCurrentDevotionalKeyword(randomKeyword);

      const query = `${randomKeyword} ${language !== "English" ? language : ""} devotional`;
      // We append "devotional" or language to ensure we get playlists and not just random movie songs 
      // However, the keywords are quite specific. Let's try searching just the keyword first or keyword + language.
      // The user list has names like "ganesh". "ganesh tamil" is better than just "ganesh" if language is Tamil.

      let searchQuery = randomKeyword;
      if (language && language !== "English" && !["jesus", "christ", "allah"].includes(randomKeyword)) {
        // For most hindu deities, appending language helps find regional content
        searchQuery = `${randomKeyword} ${language}`;
      }

      const { data } = await axios.get(
        getApiUrl("search", `/search/playlists?query=${encodeURIComponent(searchQuery)}&limit=20`)
      );

      setDevotionalPlaylists(data?.data?.results || []);

    } catch (error) {
      console.error("Error fetching devotional playlists:", error);
    }
  };
  const GetLanguageSongs = async (overridePage) => {
    try {
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Use sequential page number
      const queryPage = overridePage || page;

      const { data } = await axios.get(
        getApiUrl("search", `/search/songs?query=${encodeURIComponent(language.toLowerCase() + ' hits')}&page=${queryPage}&limit=20`)
      );

      setdetails((prevDetails) => {
        const results = data?.data?.data?.results || data?.data?.results || [];
        // Shuffle the newly fetched results to break up album clusters
        const shuffledResults = shuffleArray(results);
        // Filter out undesired content (kids/divine)
        const filteredResults = filterUndesiredSongs(shuffledResults);

        // Filter out duplicates
        const newData = filteredResults.filter(
          (newItem) => !prevDetails.some((prevItem) => prevItem.id === newItem.id)
        );
        return [...prevDetails, ...newData];
      });
    } catch (error) {
      console.error("Error fetching language songs:", error);

      // Handle specific error types
      if (error.response?.status === 429) {
        toast.error("Rate limited - please wait before loading more songs");
      } else if (error.response?.status === 502) {
        // 502 Bad Gateway - upstream server error, retry once after delay
        console.log("502 error, retrying after delay...");
        setTimeout(() => {
          toast.error("Server temporarily unavailable, retrying...");
          GetLanguageSongs(overridePage || page);
        }, 3000);
      } else if (error.response?.status === 402) {
        toast.error("Music service temporarily unavailable for songs");
      } else if (error.message?.includes('CORS') || error.message?.includes('Network Error')) {
        toast.error("Connection to music service failed for songs");
      } else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        toast.error("Network connection failed while fetching songs");
      } else {
        toast.error("Failed to load songs");
      }
    }
  };

  const Getdetails = async (overridePage, customQuery) => {
    try {
      let queryPage;
      if (overridePage) {
        queryPage = overridePage;
      } else {
        // For other languages, keep using random page (page2)
        // English is now handled by GetLanguageSongs, so we can default to page2 here for others
        queryPage = page2;
      }

      const searchQuery = customQuery || `${language.toLowerCase()} hits`;

      const { data } = await axios.get(
        getApiUrl("search", `/search/songs?query=${encodeURIComponent(searchQuery)}&page=${queryPage}&limit=20`)
      );

      setdetails((prevDetails) => {
        const results = data?.data?.results || [];
        // Shuffle the newly fetched results
        const shuffledResults = shuffleArray(results);
        // Filter out undesired content
        const filteredResults = filterUndesiredSongs(shuffledResults);

        const newData = filteredResults.filter(
          (newItem) => !prevDetails.some((prevItem) => prevItem.id === newItem.id)
        );
        return [...prevDetails, ...newData];
      });
    } catch (error) {
      console.log("error", error);
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
    setpage(randomPage); // Use randomized page
    setpage2(randomPage);

    Getdetails(randomPage, shuffleQuery); // Now actually uses the random modifier!
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
        axios.get(getApiUrl("search", `/search/songs?query=Trending ${language}&limit=10`)),
        axios.get(getApiUrl("search", `/search/albums?query=Trending ${language}&limit=10`)),
        axios.get(getApiUrl("search", `/search/playlists?query=Top ${language}&limit=10`)),
        axios.get(getApiUrl("search", `/search/playlists?query=${language} Hits&limit=10`)),
        axios.get(getApiUrl("search", `/search/albums?query=Latest ${language}&limit=10`))
      ]);

      const mapItems = (items) => items ? items.map(item => ({
        id: item.id,
        name: item.name,
        title: item.title || item.name,
        subtitle: item.subtitle || item.description || "",
        type: item.type,
        image: item.image ? item.image.map(img => ({ ...img, link: img.url })) : [],
        url: item.url,
        songs: item.songs || []
      })) : [];

      const homeData = {
        charts: mapItems(chartsRes.data.data.results),
        albums: mapItems(albumsRes.data.data.results),
        playlists: mapItems(playlistsRes.data.data.results),
        trending: {
          songs: mapItems(trendingSongsRes.data.data.results),
          albums: mapItems(trendingAlbumsRes.data.data.results)
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


  const Getartists = async () => {
    // If home is already being fetched, this might be redundant, 
    // but defining it resolves the undefined error.
    try {
      if (home === null) {
        await Gethome();
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const audioseter = (i) => {
    if (i === null || !details[i]) return;

    const song = details[i];

    // Check if clicking on the currently playing song
    if (song.id === currentSong?.id) {
      togglePlay(); // Just toggle play/pause if same song
    } else {
      // Set the queue to all songs in details and play the selected song
      setQueue(details);
      playSong(song);
    }
  };


  function audioseter2(i) {
    if (i === null || !suggSong[i]) return;

    const song = suggSong[i];

    // Check if clicking on the currently playing song
    if (song.id === currentSong?.id) {
      togglePlay(); // Just toggle play/pause if same song
    } else {
      // Set the queue to all suggested songs and play the selected song
      setQueue(suggSong);
      playSong(song);
    }
  }


  // Function to get a random subset of IDs without duplicates
  function getRandomIds(ids, num) {
    let shuffled = ids.sort(() => 0.5 - Math.random()); // Shuffle the array
    return shuffled.slice(0, num); // Return a subset of the shuffled array
  }

  // Main function to handle liked song IDs
  function processLikedSongIds() {
    // Get liked songs from localStorage
    const likedSongs = JSON.parse(localStorage.getItem("likeData")) || [];

    // Extract song IDs
    const songIds = likedSongs.map((song) => song.id);

    // Remove duplicates by converting to Set and back to Array
    const uniqueSongIds = Array.from(new Set(songIds));

    let selectedIds;

    if (uniqueSongIds.length <= 10) {
      // If less than or equal to 10 liked songs, select all IDs
      selectedIds = uniqueSongIds;
    } else {
      // If more than 10 liked songs, randomly select 10 IDs
      selectedIds = getRandomIds(uniqueSongIds, 10);
    }

    // Store selected IDs back to localStorage
    localStorage.setItem("selectedSongIds", JSON.stringify(selectedIds));
    fetchAllSongs();
    return selectedIds;
  }

  // // Function to handle fetching data for all IDs
  // const fetchAllSongs = async () => {
  //   const storedSelectedSongIds =
  //     JSON.parse(localStorage.getItem("selectedSongIds")) || [];
  //   console.log(storedSelectedSongIds);
  //   // const fetchedSongs = [];

  //   for (const id of storedSelectedSongIds) {
  //     try {
  //       const response = await axios.get(
  //         getApiUrl("search", `/songs/${id}/suggestions`)
  //       );
  //       setsuggSong((prevState) => [...prevState, ...response.data.data]);
  //     } catch (error) {
  //       console.error(`Error fetching data for ID ${id}:`, error);
  //     }
  //   }
  // };

  const fetchAllSongs = async () => {
    const storedSelectedSongIds =
      JSON.parse(localStorage.getItem("selectedSongIds")) || [];
    // console.log(storedSelectedSongIds);

    // Use a Set to keep track of unique songs
    const seenSongs = new Set();

    for (const id of storedSelectedSongIds) {
      try {
        const response = await axios.get(
          getApiUrl("search", `/songs/${id}/suggestions`)
        );

        const newSongs = response.data.data.filter((song) => {
          if (seenSongs.has(song.id)) {
            return false; // Song is a duplicate
          } else {
            seenSongs.add(song.id);
            return true; // Song is unique
          }
        });

        setsuggSong((prevSuggSongs) => {
          const uniqueNewSongs = newSongs.filter(
            (newSong) => !prevSuggSongs.some((prevSong) => prevSong.id === newSong.id)
          );
          return [...prevSuggSongs, ...uniqueNewSongs];
        });
      } catch (error) {
        console.error(`Error fetching data for ID ${id}:`, error);
      }
    }
  };

  function likeset(e) {
    // console.log(e);
    var tf =
      localStorage.getItem("likeData") &&
      JSON.parse(localStorage.getItem("likeData")).some(
        (item) => item.id == e?.id
      );
    // console.log(tf);
    // console.log(e?.id);
    setlike(tf);
    // console.log(like);
  }

  function likehandle(i) {
    // Retrieve existing data from localStorage
    let existingData = localStorage.getItem("likeData");

    // Initialize an array to hold the updated data
    let updatedData = [];

    // If existing data is found, parse it from JSON
    if (existingData) {
      updatedData = JSON.parse(existingData);
    }

    // Check if the new data already exists in the existing data
    let exists = updatedData.some((item) => item.id === i.id);

    if (!exists) {
      // If not, add the new data
      updatedData.push(i);
      // Store the updated data back into localStorage
      localStorage.setItem("likeData", JSON.stringify(updatedData));
      setlike(true);
      // toast.success(`Song (${i?.name}) added to Likes section ✅`);
      toast(`Song (${i?.name}) added to Likes section`, {
        icon: "✅",
        duration: 1500,
        style: {
          borderRadius: "10px",
          background: "linear-gradient(to right, #8A2BE2, #BF40FF)",
          color: "#fff",
        },
      });
    } else {
      // setlike(true);
      // Otherwise, inform the user that the song is already liked
      // console.log("You've already liked this song.");
      // toast.error("You've already liked this song.");

      setlike(false);
      let existingData = localStorage.getItem("likeData");

      // If no data exists, there's nothing to remove
      if (!existingData) {
        console.log("No data found in localStorage.");
        return;
      }
      // Parse the existing data from JSON
      let updatedData = JSON.parse(existingData);

      // Find the index of the song with the given ID in the existing data
      const indexToRemove = updatedData.findIndex((item) => item.id === i.id);

      // If the song is found, remove it from the array
      if (indexToRemove !== -1) {
        updatedData.splice(indexToRemove, 1);

        // Store the updated data back into localStorage
        localStorage.setItem("likeData", JSON.stringify(updatedData));
        //   console.log("Song removed successfully.");
        // toast.success(`Song (${i?.name}) removed successfully. 🚮`);
        // toast(`Song (${i?.name}) removed successfully. 🚮`, {
        //   icon: '⚠️',
        // });

        toast(`Song (${i?.name}) removed successfully.`, {
          icon: "⚠️",
          duration: 1500,
          style: {
            borderRadius: "10px",
            background: "#1a1a1a",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        });

        // if (index>0 && details.length>=0) {
        //     setrerender(!rerender)
        //     var index2 = index-1
        //     setindex(index2);
        //     setsonglink([details[index2]]);
        // }
        // else{
        //     setrerender(!rerender)
        // }
      } else {
        toast.error("Song not found in localStorage.");
        //   console.log("Song not found in localStorage.");
      }
    }
  }

  // function SongLike(e) {
  //   console.log(e);
  //   // Check if the song is already liked (exists in localStorage)
  //   const isLiked = localStorage.getItem('likeData') && JSON.parse(localStorage.getItem('likeData')).some(item => item.id === e.id);
  //   console.log(isLiked);
  // }

  // const initializeMediaSession = () => {
  //   if ("mediaSession" in navigator) {
  //     navigator.mediaSession.metadata = new MediaMetadata({
  //       title: songlink[0]?.name || "",
  //       artist: songlink[0]?.album?.name || "",
  //       artwork: [
  //         {
  //           src: songlink[0]?.image[2]?.url || "",
  //           sizes: "512x512",
  //           type: "image/jpeg",
  //         },
  //       ],
  //     });

  //     navigator.mediaSession.setActionHandler("play", function () {
  //       // Handle play action
  //       if (audioRef.current) {
  //         audioRef.current.play().catch((error) => {
  //           console.error("Play error:", error);
  //         });
  //       }
  //     });

  //     navigator.mediaSession.setActionHandler("pause", function () {
  //       // Handle pause action
  //       if (audioRef.current) {
  //         audioRef.current.pause().catch((error) => {
  //           console.error("Pause error:", error);
  //         });
  //       }
  //     });

  //     navigator.mediaSession.setActionHandler("previoustrack", function () {
  //       pre();
  //     });

  //     navigator.mediaSession.setActionHandler("nexttrack", function () {
  //       next();
  //     });
  //   } else {
  //     console.warn("MediaSession API is not supported.");
  //   }
  // };
  // Media session is now handled by MusicContext / PlayerBar
  const initializeMediaSession = () => { };


  // Media session 2 is now handled by MusicContext / PlayerBar
  const initializeMediaSession2 = () => { };




  // next/prev now handled globally by MusicContext
  function next() { }
  function next2() { }
  function pre() { }
  function pre2() { }


  // const handleDownloadSong = async (url, name) => {
  //   try {
  //     toast.success(`Song ${name} Downloading...`);
  //     const res = await fetch(url);
  //     const blob = await res.blob();
  //     const link = document.createElement("a");
  //     link.href = URL.createObjectURL(blob);
  //     link.download = `${name}.mp3`;

  //     document.body.appendChild(link);
  //     link.click();

  //     document.body.removeChild(link);
  //     toast.success("Song Downloaded ✅");
  //   } catch (error) {
  //     console.log("Error fetching or downloading files", error);
  //   }
  // };


  const handleDownloadSong = (url, name, poster) => {
    return toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          // Display loading message
          // toast.loading(`Song ${name} Downloading...`, {
          //   id: 'loading-toast' // Set a unique ID for the loading toast
          // });

          // Perform the download
          const res = await fetch(url);
          const blob = await res.blob();
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${name}.mp3`;

          document.body.appendChild(link);
          link.click();

          document.body.removeChild(link);



          resolve(); // Resolve the promise once the download is complete
        } catch (error) {
          console.log("Error fetching or downloading files", error);
          reject("Error downloading song");
        }
      }),
      {
        loading: `Song ${name} Downloading...`, // Loading message
        success: `Song Downloaded ✅`, // Success message
        error: <b>Error downloading song.</b>, // Error message
      }
    );
  };

  // const handleGenerateAudio = async (data) => {
  //   try {
  //     toast.loading(`Processing your audio (${data.songName}) Please wait...`);

  //     const response = await axios.get(getApiUrl("download", "/generate-audio"), {
  //       params: data,
  //       responseType: "blob", // Important to receive the file as a blob
  //     });

  //     if (response.status === 200) {
  //       // Create a link to download the file
  //       const blob = new Blob([response.data], { type: "audio/mp3" });
  //       const downloadLink = document.createElement("a");
  //       downloadLink.href = URL.createObjectURL(blob);
  //       downloadLink.download = `${data.songName || "your_audio"}.m4a`;
  //       document.body.appendChild(downloadLink);
  //       downloadLink.click();
  //       document.body.removeChild(downloadLink);

  //       toast.dismiss(); // Dismiss the loading toast
  //       toast.success(`Your audio file (${data.songName}) is ready and downloaded!`);
  //     } else {
  //       throw new Error("Failed to generate the audio.");
  //     }
  //   } catch (error) {
  //     toast.dismiss(); // Dismiss the loading toast
  //     toast.error(
  //       "An error occurred. Please check the audio or image URLs and try again."
  //     );
  //     console.error("Error generating audio:", error);
  //   }
  // };

  function detailsseter() {
    setpage(Math.floor(Math.random() * 50) + 1);
    setdetails([]);
    setsuggSong([]);
  }



  // Retry fetching home data if it failed
  function seccall() {
    const intervalId = setInterval(() => {
      // This will be checked using the ref to avoid stale closure
      if (!homeRef.current) {
        Getartists();
      } else {
        clearInterval(intervalId);
      }
    }, 3000);
    return intervalId;
  }
  // Preload a few extra pages of songs for smoother playback — runs once per language change only
  useEffect(() => {
    const sequentialLanguages = ["english", "tamil", "malayalam", "telugu"];
    const extraPages = [page + 1, page + 2]; // only 2 extra pages, not infinite

    const fetchExtraPages = async () => {
      for (const p of extraPages) {
        try {
          if (sequentialLanguages.includes(language.toLowerCase())) {
            await GetLanguageSongs(p);
          } else {
            await Getdetails();
          }
        } catch {
          // silently ignore
        }
      }
    };

    const timeoutId = setTimeout(fetchExtraPages, 1500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line
  }, [language]); // only re-run when language changes, NOT on every page change

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          Gethome(),
          GetFreshHits(),
          GetBestOf90s(),
          GetIndiaSuperhitsTop50(),
          GetTamilPlaylists(),
          GetDevotionalPlaylists(),
          GetJioSaavanUpdatePlaylists(),
        ]);

        // Initial fetch for songs based on language
        const sequentialLanguages = ["english", "tamil", "malayalam", "telugu"];
        if (sequentialLanguages.includes(language.toLowerCase())) {
          GetLanguageSongs(page);
        } else {
          Getdetails();
        }
      } catch (error) {
        console.error("Error in initial data fetch:", error);
        // Don't show error toast here as individual functions handle their own errors
      } finally {
        // Ensure loading is set to false after all operations
        setLoading(false);
      }
    };

    fetchData();

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000); // 5 seconds timeout

    return () => clearTimeout(timeout);
    // eslint-disable-next-line
  }, [language]);

  // Keep a ref for home to avoid stale closure in seccall
  const homeRef = useRef(home);
  useEffect(() => {
    homeRef.current = home;
  }, [home]);

  useEffect(() => {
    const interval = seccall();
    return () => clearInterval(interval);
  }, [language]);

  // Like state now tracked via currentSong from context
  useEffect(() => {
    likeset(currentSong);
  }, [currentSong]);




  useEffect(() => {
    processLikedSongIds();
    // console.log('Selected Song IDs:', selectedIds);
  }, [language]); // processLikedSongIds removed from deps to prevent infinite loop

  // useEffect(() => {
  //   initializeMediaSession();
  // }, [songlink]);

  // useEffect(() => {
  //   Getdetails();
  //   Getartists();
  // }, [language]);

  // useEffect(() => {
  //   var interval = seccall();

  //   return () => clearInterval(interval);
  // }, [details, page, language]);

  // useEffect(() => {
  //   var interval2 = seccall2();

  //   return () => clearInterval(interval2);
  // }, [details, page, language]);

  var title = currentSong?.name;

  document.title = `${title ? title : "Max-Vibe"}`;
  // console.log(details);
  // console.log(home);
  // console.log(page);
  // console.log(page2);
  // console.log(songlink);
  // console.log(index)
  // console.log(suggSong);
  // console.log(songlinkchecker);

  if (loading) {
    return (
      <div className="w-full h-screen bg-black text-white flex items-center justify-center">
        <Loading />
      </div>
    );
  }
  if (error) {
    return (
      <div className="w-full h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <i className="ri-wifi-off-line text-6xl text-red-400 mb-4"></i>
          </div>
          <p className="text-red-400 text-lg font-bold mb-4">{error}</p>
          <p className="text-white/60 text-sm mb-6">
            The external music service appears to be experiencing issues.
            This might be due to rate limiting or temporary service problems.
            {error.includes('502') && ' The upstream server is temporarily unavailable.'}
            {error.includes('rate limit') && ' Please wait a few minutes before trying again.'}
          </p>
          <div className="flex gap-4 justify-center flex-wrap mb-6">
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
              <i className="ri-refresh-line mr-2"></i>Reload Page
            </button>
            <button onClick={() => {
              setError("");
              setLoading(true);
              Gethome().finally(() => setLoading(false));
            }} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              <i className="ri-restart-line mr-2"></i>Retry
            </button>
          </div>

          {/* Show demo content when API is rate limited */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-white font-semibold mb-4">Demo Content</h3>
            <p className="text-white/60 text-xs mb-4">
              While the API is rate limited, here's what the app normally looks like:
            </p>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-3 bg-white/10 rounded border border-white/20">
                <h4 className="text-white font-medium text-sm mb-2">🎵 Trending Songs</h4>
                <p className="text-white/40 text-xs">Latest hits and popular tracks</p>
              </div>
              <div className="p-3 bg-white/10 rounded border border-white/20">
                <h4 className="text-white font-medium text-sm mb-2">📀 New Albums</h4>
                <p className="text-white/40 text-xs">Fresh album releases</p>
              </div>
              <div className="p-3 bg-white/10 rounded border border-white/20">
                <h4 className="text-white font-medium text-sm mb-2">🎼 Playlists</h4>
                <p className="text-white/40 text-xs">Curated music collections</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white/40 text-xs">
              <strong>Status:</strong> Connected to JioSaavn API<br />
              <strong>Note:</strong> Some requests may be rate limited (429)<br />
              <strong>Solution:</strong> Wait a moment and retry, or refresh the page
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-screen bg-black text-white">
      <Toaster position="top-center" reverseOrder={false} />
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: "circIn", duration: 0.5 }}
        className="logo fixed flex items-center z-[99] top-0 w-full duration-200 max-h-[20vh] flex sm:block backdrop-blur-xl py-3 px-10 sm:px-5 items-center gap-3 border-b border-white/5"
      >
        <div className="flex items-center sm:justify-center sm:pt-2 gap-2 w-auto">
          <img className="w-[5vw] sm:w-[10vw] rounded-full shadow-purple-glow" src={logo} alt="" />
          <h1 className="text-3xl text-white p-0 rounded-full sm:text-2xl font-bold whitespace-nowrap">MAX-VIBE</h1>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: "circIn", duration: 1 }}
          className="sm:pt-3 sm:ml-4 text-white ml-20 sm:justify-center"
        >
          {/* <h3 className="inline text-xl sm:hidden">Search : </h3> */}

          <Link
            className="ml-2 sm:ml-4 px-4 py-2 text-xl sm:text-sm font-bold text-white rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-purple-glow hover:bg-purple-gradient hover:shadow-purple-glow hover:border-white/20 transition-all duration-300 ease-out"
            to={"/songs"}
          >
            Songs
          </Link>
          <Link
            className="ml-2 sm:ml-4 px-4 py-2 text-xl sm:text-sm font-bold text-white rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-purple-glow hover:bg-purple-gradient hover:shadow-purple-glow hover:border-white/20 transition-all duration-300 ease-out"
            to={"/playlist"}
          >
            Playlist
          </Link>
          <Link
            className="ml-2 sm:ml-4 px-4 py-2 text-xl sm:text-sm font-bold text-white rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-purple-glow hover:bg-purple-gradient hover:shadow-purple-glow hover:border-white/20 transition-all duration-300 ease-out"
            to={"/album"}
          >
            Album
          </Link>
          <Link
            className="ml-2 sm:ml-4 px-4 py-2 text-xl sm:text-sm font-bold text-white rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-purple-glow hover:bg-purple-gradient hover:shadow-purple-glow hover:border-white/20 transition-all duration-300 ease-out"
            to={"/artists"}
          >
            Artists
          </Link>
          <Link
            className="ml-2 sm:ml-4 px-4 py-2 text-xl sm:text-sm font-bold text-white rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-purple-glow hover:bg-purple-gradient hover:shadow-purple-glow hover:border-white/20 transition-all duration-300 ease-out"
            to={"/likes"}
          >
            Likes
          </Link>

        </motion.div>
        {/* <div className="w-full flex sm:justify-center items-center justify-end p-1 sm:p-2">
          <a
            target="_blank"
            href={
              "https://github.com/vkvickkey/xman"
            }
            className="ml-2 sm:ml-4 cursor-pointer  text-3xl  text-zinc-100  ri-github-fill"
          ></a>
        </div> */}
      </motion.div>
      <div className="w-full bg-black min-h-[40vh] pt-[20vh] pb-[15vh] text-white p-2 flex flex-col gap-1 overflow-auto">
        <div className="w-full flex justify-end dropdown-control">
          <Dropdown
            className=" w-[100%] text-sm sm:w-[100%] mb-8 p-2 rounded-xl"
            options={options}
            onChange={(e) => {
              setlanguage(e.value);
              localStorage.setItem("language", e.value);
            }}
            placeholder={language ? ` ${language}  ` : "Select language"}
          />
        </div>



        <div className="trending songs flex flex-col gap-3 w-full ">
          <div className="relative w-full py-3 px-6 mb-2 flex items-center justify-between rounded-3xl bg-white/5 backdrop-blur-2xl border-t border-l border-r border-white/10 border-b-0 shadow-xl overflow-hidden shrink-0 group">
            {/* Ambient Bottom Glow */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#8A2BE2] via-[#BF40FF] to-[#8A2BE2] blur-[1px] shadow-[0_0_20px_rgba(191,64,255,0.6)]"></div>

            {/* Left Icon */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/20 border border-white/5 backdrop-blur-md shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] cursor-pointer hover:bg-white/10 hover:scale-105 transition-all duration-300">
              <i className="ri-music-fill text-white text-xl"></i>
            </div>

            {/* Center Title */}
            <div className="flex flex-col items-center">
              <h3 className="text-2xl font-bold text-white/90 tracking-wide capitalize drop-shadow-lg font-sans">
                Best {language} Hits
              </h3>
              <div className="flex gap-2 mt-1">
                <span className="text-[10px] text-white/40 uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 border border-white/10">Dynamic Mix</span>
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-3">
              <div
                onClick={handleAiShuffle}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-gradient/20 border border-purple-500/20 backdrop-blur-md shadow-purple-glow cursor-pointer hover:bg-purple-gradient/40 hover:scale-110 transition-all duration-300 group/ai"
                title="AI Shuffle"
              >
                <i className="ri-robot-2-line text-white text-xl group-hover/ai:animate-bounce"></i>
              </div>
              <div
                onClick={handleRefreshSongs}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-black/20 border border-white/5 backdrop-blur-md shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] cursor-pointer hover:bg-white/10 hover:scale-105 transition-all duration-300"
                title="Refresh List"
              >
                <i className="ri-refresh-line text-white text-xl"></i>
              </div>
            </div>
          </div>
          <div className="relative group w-full">
            <ScrollButtons scrollRef={detailsRef} />
            <motion.div ref={detailsRef} className="songs custom-scrollbar px-5 sm:px-3 flex flex-shrink gap-5 overflow-x-auto w-full pb-4">
              {details && details.length === 0 && (
                <div className="w-full text-center text-white/60 py-10">
                  <span>No songs found. Please try refreshing or check your connection.</span>
                </div>
              )}
              {Array.isArray(details) && details.map((t, i) => (
                <motion.div
                  initial={{ y: -100, scale: 0.5 }}
                  whileInView={{ y: 0, scale: 1 }}
                  transition={{ ease: "circIn", duration: 0.05 }}
                  onClick={() => audioseter(i)}
                  key={i}
                  className="relative group/card hover:scale-95 sm:hover:scale-105 duration-300 flex-shrink-0 w-[15%] sm:w-[40%] rounded-md flex flex-col gap-1 py-4 cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-md shadow-lg">
                    <motion.img
                      className="relative w-full rounded-md transition-transform duration-500 group-hover/card:scale-110"
                      src={t.image?.[2]?.url || t.image?.[0]?.url}
                      alt=""
                    />


                    {/* Play/Pause Button Overlay */}
                    <button
                      className="absolute inset-0 flex items-center justify-center w-full h-full bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 focus:opacity-100"
                      style={{ zIndex: 2 }}
                      onClick={e => {
                        e.stopPropagation();
                        audioseter(i);
                      }}
                      aria-label={t.id === currentSong?.id && isPlaying ? 'Pause' : 'Play'}
                    >
                      <i className={`text-6xl ${t.id === currentSong?.id && isPlaying ? 'ri-pause-circle-fill text-p-magenta' : 'ri-play-circle-fill text-white'} drop-shadow-glow`}></i>
                    </button>

                    {/* Wave animation for active song */}
                    <img
                      className={`absolute top-2 left-2 w-[20%] sm:w-[25%] rounded-md ${t.id === currentSong?.id ? "block" : "hidden"} `}
                      src={wavs}
                      alt=""
                    />

                  </div>

                  <div className="flex items-center gap-1 mt-1">
                    <p className="font-bold text-xs text-transparent bg-clip-text bg-gradient-to-r from-p-violet to-p-magenta">{i + 1}</p>
                    <h3
                      className={`text-sm sm:text-xs leading-none font-bold truncate ${t.id === currentSong?.id ? "text-p-magenta" : "text-white"
                        }`}
                    >
                      {removeSourceAttribution(t.name)}
                    </h3>

                  </div>

                  <motion.div className="flex flex-col">
                    <h4 className="text-xs sm:text-[2.5vw] text-white/50 truncate">
                      {removeSourceAttribution(t.album?.name || "")}
                    </h4>
                    <div className="flex flex-col mt-0.5">
                      <span className="text-[10px] sm:text-[8px] text-zinc-500 truncate">
                        {getArtistMetadata(t.artists).singleLine}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              ))}

              <img
                className={page >= 18 ? "hidden" : "w-[20%] h-[20%]"}
                src={wait}
              />
            </motion.div>
          </div>
        </div>
        {suggSong.length > 0 && (
          <div className="trending songs flex flex-col gap-3 w-full ">
            <div className="relative w-full py-3 px-6 mb-2 flex items-center justify-between rounded-3xl bg-white/5 backdrop-blur-2xl border-t border-l border-r border-white/10 border-b-0 shadow-xl overflow-hidden shrink-0 group">
              {/* Ambient Bottom Glow */}
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#8A2BE2] via-[#BF40FF] to-[#8A2BE2] blur-[1px] shadow-[0_0_20px_rgba(191,64,255,0.6)]"></div>

              {/* Left Icon */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/20 border border-white/5 backdrop-blur-md shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] cursor-pointer hover:bg-white/10 hover:scale-105 transition-all duration-300">
                <i className="ri-music-fill text-white text-xl"></i>
              </div>

              {/* Center Title */}
              <h3 className="text-2xl font-bold text-white/90 tracking-wide capitalize drop-shadow-lg font-sans flex flex-col items-center">
                Songs for you
                <span className="text-xs text-white/50 font-normal normal-case tracking-normal mt-1">
                  (based on your liked songs)
                </span>
              </h3>

              {/* Right Icon */}
              <div onClick={refreshSuggestions} className="flex items-center justify-center w-10 h-10 rounded-full bg-black/20 border border-white/5 backdrop-blur-md shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] cursor-pointer hover:bg-white/10 hover:scale-105 transition-all duration-300">
                <i className="ri-music-fill text-white text-xl"></i>
              </div>
            </div>
            <div className="relative group w-full">
              <ScrollButtons scrollRef={suggRef} />
              <motion.div ref={suggRef} className="songs custom-scrollbar px-5 sm:px-3 flex flex-shrink gap-5 overflow-x-auto w-full pb-4">
                {Array.isArray(suggSong) && suggSong.map((t, i) => (
                  <motion.div
                    //  whileHover={{  y: 0,scale: 0.9 }}
                    //  viewport={{ once: true }}
                    initial={{ y: -100, scale: 0.5 }}
                    whileInView={{ y: 0, scale: 1 }}
                    transition={{ ease: "circIn", duration: 0.05 }}
                    onClick={() => audioseter2(i)}
                    key={i}
                    className="relative hover:scale-95 sm:hover:scale-105 duration-300 flex-shrink-0 w-[15%] sm:w-[40%] rounded-md flex flex-col gap-1 py-4 cursor-pointer"
                  >
                    <motion.img
                      className="relative w-full  rounded-md"
                      // src={t.image[2].link}
                      src={t.image[2].url}
                      alt=""
                    />
                    <div className="flex  items-center ">
                      <p className=" font-bold text-transparent bg-clip-text bg-gradient-to-r from-p-violet to-p-magenta">{i + 1}</p>
                    </div>

                    {/* Wave animation for active song */}
                    <img
                      className={`absolute top-2 left-2 w-[20%] sm:w-[25%] rounded-md ${t.id === currentSong?.id ? "block" : "hidden"} `}
                      src={wavs}
                      alt=""
                    />

                    {/* Play/Pause Icons */}
                    {t.id === currentSong?.id ? (
                      <i className={`absolute inset-0 flex items-center justify-center text-5xl text-p-magenta drop-shadow-[0_0_20px_rgba(191,64,255,1)] opacity-100 duration-300 rounded-md bg-black/20 ${isPlaying ? "ri-pause-circle-fill" : "ri-play-circle-fill"}`}></i>
                    ) : (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <i className="ri-play-circle-fill text-5xl text-white drop-shadow-glow"></i>
                      </div>

                    )}


                    <motion.div
                      className="flex flex-col"
                    >
                      <h3
                        className={`text-sm sm:text-xs leading-none font-bold ${t.id === currentSong?.id ? "text-p-magenta shadow-purple-glow" : "text-white"
                          }`}
                      >
                        {removeSourceAttribution(t.name)}
                      </h3>

                      <h4 className="text-xs sm:text-[2.5vw] text-white/70">
                        {t.album.name}
                      </h4>
                      <div className="flex flex-col mt-1">
                        <span className="text-[10px] sm:text-[8px] text-zinc-400">
                          {getArtistMetadata(t.artists).singleLine}
                        </span>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        )}


        {/* <div className="trending flex flex-col gap-3 w-full ">
          <h3 className="text-xl h-[5vh] font-semibold">Trending Albums</h3>
          <div className="playlistsdata px-5 sm:px-3 flex flex-shrink  gap-5 overflow-x-auto overflow-hidden w-full ">
            {home?.trending?.albums.map((t, i) => (
              <Link
                to={`/albums/details/${t.id}`}
                key={i}
                className="hover:scale-110 sm:hover:scale-100  duration-150 flex-shrink-0 w-[15%] sm:w-[40%] rounded-md flex flex-col gap-2 py-4"
              >
                <img
                  className="w-full  rounded-md"
                  src={t.image[2].url}
                  alt=""
                />
                
                <h3 className="leading-none ">{t.name}</h3>
              
              </Link>
            ))}
          </div>
        </div>  */}
        <div className="charts w-full flex flex-col gap-3   ">
          <div className="relative w-full py-3 px-6 mb-2 flex items-center justify-between rounded-3xl bg-white/5 backdrop-blur-2xl border-t border-l border-r border-white/10 border-b-0 shadow-xl overflow-hidden shrink-0 group">
            {/* Ambient Bottom Glow */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#8A2BE2] via-[#BF40FF] to-[#8A2BE2] blur-[1px] shadow-[0_0_20px_rgba(191,64,255,0.6)]"></div>

            {/* Left Icon */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/20 border border-white/5 backdrop-blur-md shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] cursor-pointer hover:bg-white/10 hover:scale-105 transition-all duration-300">
              <i className="ri-music-fill text-white text-xl"></i>
            </div>

            {/* Center Title */}
            <h3 className="text-2xl font-bold text-white/90 tracking-wide capitalize drop-shadow-lg font-sans">
              Charts
            </h3>

            {/* Right Icon */}
            <div onClick={refreshHomeData} className="flex items-center justify-center w-10 h-10 rounded-full bg-black/20 border border-white/5 backdrop-blur-md shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] cursor-pointer hover:bg-white/10 hover:scale-105 transition-all duration-300">
              <i className="ri-music-fill text-white text-xl"></i>
            </div>
          </div>
          <div className="relative group w-full">
            <ScrollButtons scrollRef={chartsRef} />
            <div ref={chartsRef} className="chartsdata custom-scrollbar px-5 sm:px-3 flex flex-shrink gap-5 overflow-x-auto w-full pb-4">
              {home?.charts?.map((c, i) => (
                <motion.div
                  initial={{ y: -100, scale: 0.5 }}
                  whileInView={{ y: 0, scale: 1 }}
                  transition={{ ease: "circIn", duration: 0.05 }}
                  // onClick={`/playlist/details/${c.id}`}
                  onClick={() => navigateWithHomeCache(`/playlist/details/${c.id}`)}
                  key={i}
                  className="hover:scale-110 sm:hover:scale-105  duration-300 flex-shrink-0 w-[15%] sm:w-[40%] rounded-md flex flex-col gap-2 py-4 cursor-pointer"
                >
                  <img
                    className="w-full  rounded-md"
                    src={c.image[2].url}
                    alt=""
                  />
                  <motion.h3
                    // initial={{ y: 50, opacity: 0 }}
                    // whileInView={{ y: 0, opacity: 1 }}
                    // transition={{ease:Circ.easeIn,duration:0.05}}
                    className="leading-none"
                  >
                    {c.title}
                  </motion.h3>
                </motion.div>
              ))}
            </div>
          </div>
        </div>



        {indiaSuperhitsTop50.length > 0 && (
          <div className="india-superhits-top-50 w-full flex flex-col gap-3 ">
            <div className="relative w-full py-3 px-6 mb-2 flex items-center justify-between rounded-3xl bg-white/5 backdrop-blur-2xl border-t border-l border-r border-white/10 border-b-0 shadow-xl overflow-hidden shrink-0 group">
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#8A2BE2] via-[#BF40FF] to-[#8A2BE2] blur-[1px] shadow-[0_0_20px_rgba(191,64,255,0.6)]"></div>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/20 border border-white/5 backdrop-blur-md shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] cursor-pointer hover:bg-white/10 hover:scale-105 transition-all duration-300">
                <i className="ri-music-fill text-white text-xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-white/90 tracking-wide capitalize drop-shadow-lg font-sans">
                India Superhits Top 50
              </h3>
              <div onClick={GetIndiaSuperhitsTop50} className="flex items-center justify-center w-10 h-10 rounded-full bg-black/20 border border-white/5 backdrop-blur-md shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] cursor-pointer hover:bg-white/10 hover:scale-105 transition-all duration-300">
                <i className="ri-refresh-line text-white text-xl"></i>
              </div>
            </div>
            <div className="relative group w-full">
              <ScrollButtons scrollRef={indiaSuperhitsTop50Ref} />
              <div ref={indiaSuperhitsTop50Ref} className="indiasuperhitstop50data custom-scrollbar px-5 sm:px-3 flex flex-shrink gap-5 overflow-x-auto w-full pb-4">
                {Array.isArray(indiaSuperhitsTop50) && indiaSuperhitsTop50.map((f, i) => (
                  <motion.div
                    initial={{ y: -100, scale: 0.5 }}
                    whileInView={{ y: 0, scale: 1 }}
                    transition={{ ease: "circIn", duration: 0.05 }}
                    onClick={() => navigateWithHomeCache(`/playlist/details/${f.id}`)}
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
        )}

        {freshHitsData.length > 0 && (
          <FreshHitRow
            key="fresh-hits"
            language="All" // Not used for title anymore but might be needed for prop types if strictly typed (not here)
            data={freshHitsData}
            navigate={navigateWithHomeCache}
            onRefresh={() => GetFreshHits()}
          />
        )}
        {bestOf90s.length > 0 && (
          <div className="best-of-90s w-full flex flex-col gap-3 ">
            <div className="relative w-full py-3 px-6 mb-2 flex items-center justify-between rounded-3xl bg-white/5 backdrop-blur-2xl border-t border-l border-r border-white/10 border-b-0 shadow-xl overflow-hidden shrink-0 group">
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#8A2BE2] via-[#BF40FF] to-[#8A2BE2] blur-[1px] shadow-[0_0_20px_rgba(191,64,255,0.6)]"></div>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/20 border border-white/5 backdrop-blur-md shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] cursor-pointer hover:bg-white/10 hover:scale-105 transition-all duration-300">
                <i className="ri-music-fill text-white text-xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-white/90 tracking-wide capitalize drop-shadow-lg font-sans">
                Best Of 90s
              </h3>
              <div onClick={GetBestOf90s} className="flex items-center justify-center w-10 h-10 rounded-full bg-black/20 border border-white/5 backdrop-blur-md shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] cursor-pointer hover:bg-white/10 hover:scale-105 transition-all duration-300">
                <i className="ri-refresh-line text-white text-xl"></i>
              </div>
            </div>
            <div className="relative group w-full">
              <ScrollButtons scrollRef={bestOf90sRef} />
              <div ref={bestOf90sRef} className="bestof90sdata custom-scrollbar px-5 sm:px-3 flex flex-shrink gap-5 overflow-x-auto w-full pb-4">
                {Array.isArray(bestOf90s) && bestOf90s.map((f, i) => (
                  <motion.div
                    initial={{ y: -100, scale: 0.5 }}
                    whileInView={{ y: 0, scale: 1 }}
                    transition={{ ease: "circIn", duration: 0.05 }}
                    onClick={() => navigateWithHomeCache(`/playlist/details/${f.id}`)}
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
        )}
        <div>
          <p className="font-semibold text-white/50 sm:text-sm text-center py-10">
            <b>Made with ❤️ Max-Vibe</b>
          </p>
        </div>
      </div >

      {/* Global PlayerBar handles playback UI */}



    </div >
  );
};

export default Home;
