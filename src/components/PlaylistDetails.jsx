import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMusic } from "../context/MusicContext";

import Loading from "./Loading";
const wavs = "/wavs.gif";
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
import { Bounce, Expo, Power4, Sine } from "gsap/all";
import { Circ } from "gsap/all";
import toast, { Toaster } from "react-hot-toast";
import handleGenerateAudio from "./../utils/audioUtils";
import { getArtistMetadata } from "../utils/artistUtils";
import { removeSourceAttribution, getAlbumFromTitle } from "../utils/stringUtils";
import { processSong, loadFFmpeg } from "../utils/audioProcessor";

import JSZip from "jszip";
import { saveAs } from "file-saver";
import { getApiUrl } from "../apiConfig";

const PlaylistDetails = () => {
  const navigate = useNavigate();
  let location = useLocation();
  let id = location.pathname;
  let newid = id.split("/");
  let finalid = newid[3];

  const { currentSong, isPlaying, playSong, togglePlay, setQueue } = useMusic();
  const [details, setdetails] = useState([]);
  // const [songlink, setsonglink] = useState([]);
  // var [index, setindex] = useState("");
  const [like, setlike] = useState("");
  const [like2, setlike2] = useState(false);
  const [existingData, setexistingData] = useState(null);
  // const audioRef = useRef();
  // const [audiocheck, setaudiocheck] = useState(false);

  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  // settitle(songlink.name);

  const handleDownloadAll = async () => {
    if (!details || details.length === 0) {
      toast.error("No songs to download.");
      return;
    }

    setIsDownloadingAll(true);
    const zip = new JSZip();
    const folder = zip.folder("Playlist");
    let downloadedCount = 0;

    // Concurrency limit
    const CONCURRENCY_LIMIT = 3;
    const totalSongs = details.length;

    toast.loading(`Starting download for ${totalSongs} songs...`, { id: "download-all-playlist" });

    try {
      // Load FFmpeg once for the batch
      const ffmpeg = await loadFFmpeg();

      // Chunk the details array
      for (let i = 0; i < totalSongs; i += CONCURRENCY_LIMIT) {
        const chunk = details.slice(i, i + CONCURRENCY_LIMIT);

        await Promise.all(chunk.map(async (song, index) => {
          const globalIndex = i + index;

          try {
            // Clean name
            let cleanName = removeSourceAttribution(song.name || "");
            cleanName = cleanName.replace(/[<>:"/\\|?*]/g, "").trim();
            if (!cleanName) cleanName = `track_${globalIndex + 1}`;

            // Add track number prefix
            const trackNumber = (globalIndex + 1).toString().padStart(2, '0');
            const fileName = `${trackNumber} ${cleanName}.m4a`;

            // Get the highest quality image for cover art
            const coverUrl = song.image?.[2]?.url || song.image?.[1]?.url || song.image?.[0]?.url;

            // Process song using FFmpeg
            // Fetching is parallel, processing is serialized via Mutex
            const blob = await processSong(song, coverUrl, ffmpeg);

            if (blob) {
              folder.file(fileName, blob);
              downloadedCount++;
              toast.loading(`Processed ${downloadedCount}/${totalSongs} songs...`, { id: "download-all-playlist" });
            }
          } catch (err) {
            console.error(`Failed to download ${song.name}`, err);
          }
        }));
      }

      if (downloadedCount === 0) {
        toast.error("Failed to download any songs. Check your connection or try again.", { id: "download-all-playlist" });
      } else {
        toast.loading("Zipping files...", { id: "download-all-playlist" });
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `Playlist_${finalid}.zip`);
        toast.success(`Downloaded ${downloadedCount} songs!`, { id: "download-all-playlist" });
      }

    } catch (error) {
      console.error("Error during batch download:", error);
      toast.error("An error occurred during download.", { id: "download-all-playlist" });
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const Getdetails = async () => {
    try {
      const { data } = await axios.get(
        getApiUrl("search", `/playlists?id=${finalid}&limit=100`)
      );
      // setdetails(data.data.songs);
      setdetails(data?.data?.songs);
    } catch (error) {
      console.log("error", error);
    }
  };

  function audioseter(i) {
    if (!details[i]) return;

    if (currentSong?.id === details[i].id) {
      togglePlay();
    } else {
      setQueue(details);
      playSong(details[i]);
    }
  }


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
          background: "rgb(115 115 115)",
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
        toast(`Song (${i?.name}) removed successfully.`, {
          icon: "⚠️",
          duration: 1500,
          style: {
            borderRadius: "10px",
            background: "rgb(115 115 115)",
            color: "#fff",
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

  function likehandle2(i) {
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
      setlike2(!like2);
      // toast.success(`Song (${i?.name}) added to Likes section. ✅`);
      toast(`Song (${i?.name}) added to Likes section`, {
        icon: "✅",
        duration: 1500,
        style: {
          borderRadius: "10px",
          background: "rgb(115 115 115)",
          color: "#fff",
        },
      });
    } else {
      // setlike(true);
      // Otherwise, inform the user that the song is already liked
      // console.log("You've already liked this song.");
      // toast.error("You've already liked this song.");

      setlike2(!like2);
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
        toast(`Song (${i?.name}) removed successfully.`, {
          icon: "⚠️",
          duration: 1500,
          style: {
            borderRadius: "10px",
            background: "rgb(115 115 115)",
            color: "#fff",
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

  function next() {
    // Global next handled by context
  }

  function pre() {
    // Global previous handled by context
  }


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

  //     const response = await axios.get("https://the-ultimate-songs-download-server-python.vercel.app/generate-audio", {
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

  // Media session handled by MusicContext


  function seccall() {
    const intervalId = setInterval(() => {
      if (details.length === 0) {
        Getdetails();
      }
    }, 3000);
    return intervalId;
  }

  useEffect(() => {
    var interval = seccall();

    return () => clearInterval(interval);
  }, [details]);

  useEffect(() => {
    likeset(currentSong);
  }, [details, like, currentSong, like2, existingData]);


  useEffect(() => {
    // Retrieve all data from localStorage
    const allData = localStorage.getItem("likeData");

    // Check if data exists in localStorage
    if (allData) {
      // Parse the JSON string to convert it into a JavaScript object
      const parsedData = JSON.parse(allData);

      // Now you can use the parsedData object
      setexistingData(parsedData);
    } else {
      console.log("No data found in localStorage.");
    }
  }, [details, like, currentSong, like2]);


  // useEffect(() => {
  //   Getdetails();
  // }, []);

  // Auto-play handled by context


  var title = currentSong?.name;


  document.title = `${title ? title : "MAX-VIBE"}`;
  // console.log(finalid);
  // console.log(details);
  // console.log(songscount);
  // console.log();
  // console.log(index);
  // console.log(like);

  return details.length ? (
    <div className="w-full h-screen bg-black">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Header */}
      <div className="w-full fixed z-[99] backdrop-blur-xl bg-black/40 border-b border-white/5 flex items-center gap-3 sm:h-[7vh] h-[10vh] px-6">
        <i
          onClick={() => navigate(-1)}
          className="cursor-pointer text-3xl p-2 bg-white/5 border border-white/10 rounded-full shadow-purple-glow hover:bg-purple-gradient text-white transition-all duration-300 ri-arrow-left-line"
        ></i>
        <h1 className="text-xl text-white font-black tracking-tighter">MAX-VIBE</h1>

        <button
          onClick={handleDownloadAll}
          disabled={isDownloadingAll}
          className={`ml-auto px-5 py-2 rounded-full border border-white/10 backdrop-blur-md transition-all duration-300 font-bold text-sm ${isDownloadingAll
            ? "bg-white/10 text-white/50 cursor-not-allowed"
            : "bg-purple-gradient text-white shadow-purple-glow hover:scale-105"
            }`}
        >
          {isDownloadingAll ? (
            <span className="flex items-center gap-2">
              <i className="ri-loader-4-line animate-spin"></i> Zipping...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <i className="ri-download-cloud-2-line"></i> Download All
            </span>
          )}
        </button>
      </div>

      {/* Song List */}
      <div className="flex w-full pt-[15vh] sm:pt-[10vh] pb-[25vh] sm:pb-[35vh] text-white p-10 sm:p-3 sm:gap-3 bg-black min-h-screen overflow-y-auto sm:block flex-wrap gap-5 justify-center">
        {details?.map((d, i) => (
          <div
            title="Click to play"
            key={i}
            className="items-center justify-center relative hover:scale-[1.02] duration-300 w-[45%] flex mb-3 sm:mb-4 sm:w-full sm:flex sm:items-center sm:gap-3 rounded-2xl h-[200px] sm:h-[220px] cursor-pointer bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all shadow-lg hover:shadow-purple-glow/20 group"
          >
            <div
              onClick={() => audioseter(i)}
              className="flex flex-1 min-w-0 items-center h-full px-5"
            >
              <div className="relative flex-shrink-0 p-2 rounded-2xl bg-white/10 border border-white/10">
                <motion.img
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-[180px] h-[180px] sm:w-[180px] sm:h-[180px] rounded-xl object-cover shadow-xl border border-white/10"
                  src={d.image[2].url}
                  alt=""
                />
                {d.id === currentSong?.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl backdrop-blur-[2px]">
                    <img className="w-[40%] opacity-90" src={wavs} alt="Playing" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-xl">
                  <i className={`text-4xl text-white ${d.id === currentSong?.id && isPlaying ? "ri-pause-circle-fill" : "ri-play-circle-fill"}`}></i>
                </div>

              </div>

              <div className="ml-6 flex flex-col justify-center overflow-hidden">
                <h3 className={`text-lg sm:text-base font-bold truncate tracking-tight ${d.id === currentSong?.id ? "text-p-magenta" : "text-white"}`}>

                  {removeSourceAttribution(d.name)}
                </h3>
                <div className="flex flex-col">
                  <span className="text-sm sm:text-xs text-zinc-400 truncate">
                    {getArtistMetadata(d.artists).singleLine}
                  </span>
                  <span className="text-[11px] text-zinc-500 uppercase tracking-tighter mt-0.5">
                    {removeSourceAttribution(d.album.name)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 pr-6">
              <i
                onClick={() => likehandle2(d)}
                className={`text-2xl transition-all duration-300 hover:scale-125 cursor-pointer ${existingData?.find((element) => element?.id == d?.id)
                  ? "text-p-magenta drop-shadow-[0_0_10px_rgba(191,64,255,0.6)] ri-heart-3-fill"
                  : "text-white/20 ri-heart-3-line"
                  }`}
              ></i>
              <i
                onClick={() =>
                  handleGenerateAudio({
                    audioUrl: d?.downloadUrl[4].url,
                    imageUrl: d?.image[2]?.url,
                    songName: removeSourceAttribution(d?.name),
                    year: d?.year,
                    album: getAlbumFromTitle(d?.name) || removeSourceAttribution(d?.album.name),
                    artist: d?.artists?.primary?.map((a) => a.name).join(","),
                  })
                }
                className="text-xl text-white/20 hover:text-white hover:scale-110 transition-all ri-download-2-fill"
              ></i>
            </div>
          </div>
        ))}
      </div>

      {/* Player bar removed (global PlayerBar used instead) */}
    </div>
  ) : (
    <Loading />
  );
};


export default PlaylistDetails;
