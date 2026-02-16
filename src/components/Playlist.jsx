import axios from "axios";
import { getApiUrl } from "../apiConfig";
import { removeSourceAttribution } from "../utils/stringUtils";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useAnimate, stagger } from "framer-motion";
import { Bounce, Expo, Power4, Sine } from "gsap/all";
import { Circ } from "gsap/all";
import toast, { Toaster } from "react-hot-toast";

const Playlist = () => {
  const navigate = useNavigate();
  const [query, setquery] = useState("");
  const [requery, setrequery] = useState("");
  var [page, setpage] = useState(1);
  const [playlist, setplaylist] = useState([]);
  const [search, setsearch] = useState(false);
  // const [existingData, setexistingData] = useState(null)

  const Getplaylist = async () => {
    try {
      const { data } = await axios.get(
        // `https://saavn.dev/api/search?query=${query}&page=1&limit=10`
        // `https://jiosaavan-harsh-patel.vercel.app/search/playlists?query=${query}`
        getApiUrl("search", `/search/playlists?query=${query}&page=${page}&limit=10`)
      );

      // setplaylist(data?.data?.results);
      setplaylist((prevState) => {
        const newData = data?.data?.results || [];
        const uniqueNewData = newData.filter(
          (newItem) => !prevState.some((prevItem) => prevItem.id === newItem.id)
        );
        return [...prevState, ...uniqueNewData];
      });
      // localStorage.setItem("playlist", JSON.stringify(playlist)); // Removed to avoid saving stale state
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleDownloadPlaylist = async (id, name, imageUrl) => {
    try {
      toast.loading(`Fetching songs for ${name}...`, { id: "download-playlist" });
      const { data } = await axios.get(
        getApiUrl("search", `/playlists?id=${id}&limit=100`)
      );
      const songs = data.data.songs;

      if (!songs || songs.length === 0) {
        toast.error("No songs found to download.", { id: "download-playlist" });
        return;
      }

      const zip = new JSZip();
      const folder = zip.folder(name.replace(/[^a-z0-9]/gi, '_'));

      let downloadedCount = 0;
      toast.loading(`Initializing FFmpeg...`, { id: "download-playlist" });

      // Load FFmpeg once
      const { loadFFmpeg, processSong } = await import("../utils/audioProcessor");
      const ffmpeg = await loadFFmpeg();

      toast.loading(`Processing ${songs.length} songs (This may take a while)...`, { id: "download-playlist" });

      for (let i = 0; i < songs.length; i++) {
        const song = songs[i];
        const safeName = song.name ? song.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : `track_${i + 1}`;

        try {
          toast.loading(`Processing ${i + 1}/${songs.length}: ${song.name}`, { id: "download-playlist" });

          // Use the playlist image if song image is missing/low quality, or specific logic
          const coverUrl = song.image?.[2]?.url || imageUrl;

          const audioBlob = await processSong(song, coverUrl, ffmpeg);
          folder.file(`${safeName}.m4a`, audioBlob);
          downloadedCount++;
        } catch (err) {
          console.error(`Failed to download/process ${song.name}`, err);
          // Optional: Add a dummy file or log
        }
      }

      if (downloadedCount === 0) {
        toast.error("Failed to download any songs.", { id: "download-playlist" });
      } else {
        toast.loading("Zipping files...", { id: "download-playlist" });
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `${name}.zip`);
        toast.success(`Downloaded ${downloadedCount} songs from ${name}!`, { id: "download-playlist" });
      }
    } catch (error) {
      console.error("Error downloading playlist:", error);
      toast.error("Failed to download playlist.", { id: "download-playlist" });
    }
  };

  function searchClick() {
    if (query !== requery) {
      toast.success(`Searching ${query} , Wait For Results`);
      setrequery(query);
      setplaylist([]);
      setpage(1);
      setsearch(!search);
    }
    else {
      toast.error(`Please Check Your Search Query , Its Same As Before `);
    }
  }

  // function seccall() {
  //   const intervalId = setInterval(() => {
  //     if (playlist.length === 0 || query.length !== requery.length) {
  //       Getplaylist();
  //     }
  //   }, 1000);
  //   return intervalId;
  // }

  function seccall() {
    const intervalId = setInterval(() => {
      if (
        (playlist.length >= 0 && page < 20) ||
        query.length !== requery.length
      ) {
        setpage(page + 1);
        Getplaylist();
        // setrequery(query);
      }
    }, 1000);
    return intervalId;
  }

  useEffect(() => {
    if (query.length > 0) {
      var interval = seccall();
    }

    return () => clearInterval(interval);
  }, [search, playlist]);

  useEffect(() => {
    const cache = sessionStorage.getItem("playlist_cache");
    if (cache) {
      const { playlist, query, requery, page, scrollY } = JSON.parse(cache);
      setplaylist(playlist);
      setquery(query);
      setrequery(requery);
      setpage(page);
      setTimeout(() => window.scrollTo(0, scrollY), 100);
      sessionStorage.removeItem("playlist_cache");
    } else {
      const allData = localStorage.getItem("playlist");

      // Check if data exists in localStorage
      if (allData) {
        // Parse the JSON string to convert it into a JavaScript object
        const parsedData = JSON.parse(allData);

        // Now you can use the parsedData object
        setplaylist(parsedData);
      } else {
        console.log("No data found in localStorage.");
      }
    }
  }, []);

  // console.log(playlist);
  // console.log(search);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
      className="w-full h-[100vh] bg-black"
    >
      <Toaster position="top-center" reverseOrder={false} />
      <motion.div className="w-full h-full relative">
        <motion.div
          initial={{ y: -50, scale: 0 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ ease: Circ.easeIn, duration: 0.7, delay: 1 }}
          className="search absolute top-0 z-[99] bg-black/80 backdrop-blur-xl gap-3 w-full sm:w-full h-[15vh] flex items-center justify-center px-3 border-b border-white/5"
        >
          <i
            onClick={() => navigate(-1)}
            className="ml-2 cursor-pointer text-4xl p-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-purple-glow hover:bg-purple-gradient text-white transition-all duration-300 ease-out ri-arrow-left-line"
          ></i>
          <input
            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-purple-glow focus:shadow-purple-glow focus:border-white/20 p-4 sm:text-sm text-white outline-none w-[50%] sm:h-[7vh] sm:w-[50%] h-[10vh] placeholder-white/40 transition-all duration-300 ease-out tracking-wide font-sans"
            onChange={(e) => setquery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchClick();
              }
            }}
            placeholder="Search anything like 2025 tamil  "
            type="search"
            name=""
            id=""
          />
          <h5
            onClick={() => searchClick()}
            className="ml-2 cursor-pointer text-xl p-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-purple-glow hover:bg-purple-gradient text-white transition-all duration-300 ease-out flex items-center gap-2 hover:scale-95 heading-font"
          >
            Search<i className="ri-search-2-line"></i>
          </h5>
        </motion.div>
        <motion.div className="w-full overflow-hidden overflow-y-auto h-screen pt-[15vh] flex flex-wrap p-5 gap-5 justify-center bg-black">
          {playlist?.map((e, i) => (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              viewport={{ once: true }}
              key={i}
              onClick={() => {
                sessionStorage.setItem("playlist_cache", JSON.stringify({
                  playlist, query, requery, page, scrollY: window.scrollY
                }));
                navigate(`/playlist/details/${e.id}`);
              }}
              className="w-[15vw] h-[30vh] sm:w-[40vw] mb-8 sm:h-[20vh] sm:mb-12 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-purple-glow"
            >
              <img
                className="w-full h-full object-fill rounded-md"
                src={e?.image[2]?.url}
                alt=""
              />
              <div className="flex justify-between items-center px-1">
                <h3 className="text-white truncate w-4/5">{removeSourceAttribution(e.name)}</h3>
                <i
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDownloadPlaylist(e.id, e.name, e?.image[2]?.url);
                  }}
                  className="ri-download-cloud-2-line text-white/70 hover:text-white text-xl p-2 bg-white/10 rounded-full hover:bg-purple-600 transition-all duration-300 z-10"
                  title="Download Playlist"
                ></i>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Playlist;
