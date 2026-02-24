import axios from "axios";
import { getApiUrl } from "../apiConfig";
import React, { useEffect, useRef, useState } from "react";
import { useMusic } from "../context/MusicContext";

import { Link, useNavigate } from "react-router-dom";
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
import InfiniteScroll from "react-infinite-scroll-component";
import handleGenerateAudio from "./../utils/audioUtils";
import { removeSourceAttribution, getAlbumFromTitle } from "../utils/stringUtils";
import { getArtistMetadata } from "../utils/artistUtils";

const Songs = () => {
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong, togglePlay, setQueue } = useMusic();
  const [query, setquery] = useState("");
  const [requery, setrequery] = useState("");
  const [search, setsearch] = useState([]);
  // var [index, setindex] = useState("");
  // const [songlink, setsonglink] = useState([]);
  const [page, setpage] = useState(null);
  const [searchclick, setsearchclick] = useState(false);
  const [like, setlike] = useState(false);
  const [like2, setlike2] = useState(false);
  const [existingData, setexistingData] = useState(null);
  // const audioRef = useRef();
  const [hasMore, sethasMore] = useState(true);
  // const [audiocheck, setaudiocheck] = useState(true);


  // const Getsearch = async () => {
  //   try {
  //     const { data } = await axios.get(
  //       `https://jiosavan-api-with-playlist.vercel.app/api/search/songs?query=${query}&page=${page}&limit=10`
  //       // `https://jiosaavan-harsh-patel.vercel.app/search/songs?query=${query}&page=${page}&limit=10`
  //     );

  //     setsearch((prevState) => [...prevState, ...data.data.results]);
  //   } catch (error) {
  //     console.log("error", error);
  //   }
  // };

  const Getsearch = async () => {
    try {
      if (hasMore === false) {
        setpage(page + 1);
        toast(`SEARCHING NEW SONGS IN PAGE ${page} `, {
          icon: "🔃",
          duration: 1000,
          style: {
            borderRadius: "10px",
            background: "rgb(115 115 115)",
            color: "#fff",
          },
        });
      }

      const pagesToFetch = 40; // Fetch 40 pages at once
      const itemsPerPage = 50; // 50 items per page
      const requests = [];

      for (let i = 0; i < pagesToFetch; i++) {
        requests.push(
          axios.get(
            getApiUrl("search", `/search/songs?query=${requery}&page=${page + i}&limit=${itemsPerPage}`)
          )
        );
      }

      const responses = await Promise.all(requests);

      const allNewResults = [];
      let foundData = false;

      responses.forEach((response) => {
        const results = response?.data?.data?.results;
        if (results && results.length > 0) {
          allNewResults.push(...results);
          foundData = true;
        }
      });

      if (foundData) {
        setsearch((prevSearch) => {
          const newData = allNewResults.filter(
            (newItem) => !prevSearch.some((prevItem) => prevItem.id === newItem.id)
          );
          return [...prevSearch, ...newData];
        });
        sethasMore(true);
        setpage((prev) => prev + pagesToFetch);
      } else {
        sethasMore(false);
        if (search.length === 0) { // Only show if we truly have nothing, valid for initial search
          // logic handled below
        }
        toast(
          `NO MORE NEW SONGS FOUND, CLICK ON (LOAD MORE) AGAIN TO CHECK NEXT BATCH`,
          {
            icon: "⚠️",
            duration: 2000,
            style: {
              borderRadius: "10px",
              background: "rgb(115 115 115)",
              color: "#fff",
            },
          }
        );
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  // function setdata() {
  //   setsearch([]);
  //   setsonglink([]);
  //   setindex("");
  //   setpage(1);
  // }
  function searchClick() {
    if (query !== requery) {
      toast.success(`Searching ${query} , Wait For Results`);
      setsearch([]);
      // setsonglink([]);
      sethasMore(true);
      // setindex("");
      setpage(1);
      setrequery(query);
      setsearchclick(!searchclick);

    } else {
      toast.error(`Please Check Your Search Query , Its Same As Before `);
    }
  }

  function audioseter(i) {
    if (!search[i]) return;

    if (currentSong?.id === search[i].id) {
      togglePlay();
    } else {
      setQueue(search);
      playSong(search[i]);
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

  // const initializeMediaSession = () => {
  //   const isIOS = /(iPhone|iPod|iPad)/i.test(navigator.userAgent);

  //   if (!isIOS && "mediaSession" in navigator) {
  //     navigator.mediaSession.metadata = new MediaMetadata({
  //       title: songlink[0]?.name || "",
  //       artist: songlink[0]?.album?.name || "",
  //       // artist: songlink[0]?.artists?.primary?.map((e)=>e.name) || "",
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
  //     console.warn("MediaSession API is not supported or the device is iOS.");
  //   }
  // };

  // Media session handled by MusicContext


  // const initializeMediaSession = () => {
  //   const isIOS = /(iPhone|iPod|iPad)/i.test(navigator.userAgent);

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
  //       audioRef.play();
  //       audioRef.current.play();
  //       audioset();
  //     });

  //     navigator.mediaSession.setActionHandler("nexttrack", function () {
  //       next();
  //       audioRef.play();
  //       audioRef.current.play();
  //       audioset();
  //     });
  //   } else {
  //     console.warn("MediaSession API is not supported.");
  //   }

  //   if (isIOS) {
  //     // Enable background audio playback for iOS
  //     document.addEventListener("visibilitychange", () => {
  //       if (document.visibilityState === "visible") {
  //         if (audioRef.current && audioRef.current.paused) {
  //           // Start playing when returning to the app
  //           audioRef.current.play().catch((error) => {
  //             console.error("Play error:", error);
  //           });
  //         }
  //       } else {
  //         if (audioRef.current && !audioRef.current.paused) {
  //           // Pause when leaving the app
  //           audioRef.current.pause().catch((error) => {
  //             console.error("Pause error:", error);
  //           });
  //         }
  //       }
  //     });

  //     // Handle iOS background audio restrictions
  //     document.addEventListener("pause", () => {
  //       if (audioRef.current && !audioRef.current.paused) {
  //         // Pause when app goes to background
  //         audioRef.current.pause().catch((error) => {
  //           console.error("Pause error:", error);
  //         });
  //       }
  //     });

  //     document.addEventListener("resume", () => {
  //       if (audioRef.current && audioRef.current.paused) {
  //         // Resume playing when app returns from background
  //         audioRef.current.play().catch((error) => {
  //           console.error("Play error:", error);
  //         });
  //       }
  //     });
  //   }
  // };

  function next() {
    // Global next handled by context
  }
  function pre() {
    // Global previous handled by context
  }


  // const handleDownloadSong = async (url, name, poster) => {
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

  const handleDownloadSong = async (url, name, album, artist, image, year, id) => {
    const data = {
      audioUrl: url,
      imageUrl: image,
      songName: removeSourceAttribution(name),
      album: removeSourceAttribution(album),
      artist: artist,
      year: year,
    };
    await handleGenerateAudio(data);
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

  // function seccall() {
  //   const intervalId = setInterval(
  //     () => {
  //       if (
  //         (search.length >= 0 && page < 25) ||
  //         query.length !== requery.length
  //       ) {
  //         setpage(page + 1);
  //         Getsearch();
  //         // setrequery(query);
  //       }
  //     },
  //     page <= 2 ? 1000 : 2500
  //   );
  //   return intervalId;
  // }

  // useEffect(() => {
  //   if (query.length > 0) {
  //     var interval = seccall();
  //   }

  //   return () => clearInterval(interval);
  // }, [searchclick, search, page]);

  // useEffect(() => {
  //   if (requery.length > 0) {
  //     Getsearch();
  //   }
  // }, [searchclick]);

  useEffect(() => {
    setTimeout(() => {
      if (requery.length > 0) {
        Getsearch();
      }
    }, 1000);
  }, [searchclick]);

  function newdata() {
    // if (page>=30) {
    //   sethasMore(false);
    // }
    // else{
    //   setTimeout(() => {
    //     Getsearch();
    // }, 1000);
    // }
    if (page >= 2) {
      setTimeout(() => {
        Getsearch();
      }, 1000);
    }
  }
  // const fetchMoreData = () => {
  //   console.log("Fetching more data...");
  //   Getsearch();
  // };

  // const refershHandler = async () => {
  //   if (search.length === 0) {
  //     Getsearch();
  //   } else {
  //     setpage(1);
  //     setsearch([]);
  //     Getsearch();
  //   }
  // };

  // useEffect(() => {
  //   if (query.length > 0) {
  //     refershHandler();
  //   }
  // }, [searchclick]);

  useEffect(() => {
    likeset(currentSong);
  }, [search, like, currentSong, like2, existingData]);


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
  }, [search, like, currentSong, like2]);


  // useEffect(() => {
  //   if (query !== "") {
  //     setdata();
  //   }
  // }, [query]);

  // Auto-play handled by context


  // useEffect(() => {
  //   const isIOS = /(iPhone|iPod|iPad)/i.test(navigator.userAgent);

  //   if (songlink.length > 0) {
  //     // Check if the current environment is iOS
  //     if (isIOS) {
  //       // On iOS, audio cannot be played without user interaction due to autoplay restrictions
  //       // We need to rely on user interaction to start playing audio
  //       // You might want to display a play button or some user interaction element to trigger audio playback

  //       // Initialize media session regardless of playback
  //       initializeMediaSession();
  //     } else {
  //       // For non-iOS devices, we can attempt to play the audio
  //       // Audio will be played if autoplay is allowed
  //       // Otherwise, it will require user interaction to start playing
  //       audioRef.current.play().catch((error) => {
  //         console.error("Play error:", error);
  //       });

  //       // Initialize media session if not on iOS
  //       initializeMediaSession();
  //       audioRef.play();
  //       audioRef.current.play();
  //       audioset();
  //     }
  //   }
  // }, [songlink]);

  var title = currentSong?.name;


  document.title = `${title ? title : "MAX-VIBE"}`;
  // console.log(search);
  // console.log(page);
  // console.log(hasMore);
  // console.log(searchclick);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
      className="w-full  min-h-screen overflow-hidden bg-black "
    >
      <Toaster position="top-center" reverseOrder={false} />
      <motion.div
        initial={{ y: -50, scale: 0 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ ease: Circ.easeIn, duration: 0.7, delay: 0.7 }}
        className="search absolute top-0 z-[99] bg-black/80 backdrop-blur-xl gap-3 w-full sm:w-full h-[15vh] flex items-center justify-center px-3 border-b border-white/5"
      >
        <i
          onClick={() => navigate(-1)}
          className="ml-2 cursor-pointer text-4xl p-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-purple-glow hover:bg-purple-gradient text-white transition-all duration-300 ease-out ri-arrow-left-line"
        ></i>
        {/* <i className=" text-2xl ri-search-2-line"></i> */}

        <input
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-purple-glow focus:shadow-purple-glow focus:border-white/20 p-4 sm:text-sm text-white outline-none w-[50%] sm:h-[7vh] sm:w-[50%] h-[10vh] placeholder-white/40 transition-all duration-300 ease-out tracking-wide font-sans"
          onChange={(e) => setquery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchClick();
            }
          }}
          placeholder="Search Songs"
          type="search"
          name=""
          id=""
        />
        <h3 onClick={() => searchClick()} className="ml-2 cursor-pointer text-xl p-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-purple-glow hover:bg-purple-gradient text-white transition-all duration-300 ease-out flex items-center gap-2 hover:scale-95">Search<i
          className="ri-search-2-line"></i></h3>
      </motion.div>
      {/* <div className="w-full text-white mt-[3vh] p-10 sm:p-3 sm:gap-3 h-[64vh] overflow-y-auto flex sm:block flex-wrap gap-7 justify-center ">
        {search?.map((d, i) => (
          <div
            key={i}
            onClick={() => audioseter(i)}
            className=" relative hover:scale-90 sm:hover:scale-100 duration-150 w-[15vw] sm:mb-3 sm:w-[100%] sm:flex sm:items-center sm:gap-3  rounded-md h-[20vw] sm:h-[15vh] cursor-pointer  "
          >
            <motion.img
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ ease: Circ.easeIn, duration: 0.3 }}
              className=" w-full h-[15vw] sm:h-[15vh] sm:w-[15vh] rounded-md"
              src={d.image[2].url}
              alt=""
            />
            <img
              className={`absolute top-0 w-[20%] sm:w-[10%] rounded-md ${
                i === index ? "block" : "hidden"
              } `}
              src={wavs}
              alt=""
            />
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ ease: Circ.easeIn, duration: 0.3 }}
              className="flex flex-col"
            >
              <h3
                className={`text-sm sm:text-xs  font-bold ${
                  i === index && "text-green-300"
                }`}
              >
                {d.name}
              </h3>
              <h4 className="text-xs sm:text-[2.5vw] text-zinc-300 ">
                {d.album.name}
              </h4>
            </motion.div>
          </div>
        ))}
        {search.length > 0 && (
          <div className="flex gap-3 text-2xl  ">
            <h1>MADE BY ❤️ HARSH PATEL</h1>
            <a
              target="_blank"
              href="https://www.instagram.com/harsh_patel_80874/"
            >
              <i className=" ri-instagram-fill"></i>
            </a>
          </div>
        )}
      </div> */}
      <InfiniteScroll
        dataLength={search.length}
        next={newdata}
        hasMore={hasMore}
        loader={
          page > 2 && <h1 className="bg-black text-white">Loading...</h1>
        }
        endMessage={<p className="bg-black text-white">No more items</p>}
      // endMessage={()=>nomoredata()}
      >
        <div className="flex w-full h-screen overflow-y-auto pt-[15vh] pb-[25vh] sm:pb-[35vh] text-white p-10 sm:p-3 sm:gap-3 bg-black sm:block flex-wrap gap-5 justify-center ">
          {search?.map((d, i) => (
            <div
              title="click on song image or name to play the song"
              key={i}
              className="items-center justify-center relative hover:scale-95 sm:hover:scale-100 duration-150 w-[40%] flex mb-3 sm:mb-3 sm:w-full sm:flex sm:items-center sm:gap-3 rounded-xl h-[10vw] sm:h-[15vh] cursor-pointer bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all shadow-lg hover:shadow-purple-glow"
            >
              <div
                onClick={() => audioseter(i)}
                className="flex w-[80%] items-center"
              >
                <motion.img
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 }}
                  viewport={{ once: true }}
                  className="w-[10vw] h-[10vw] sm:h-[15vh] sm:w-[15vh] rounded-md"
                  src={d.image[2].url}
                  alt=""
                />
                <p className="pl-1 text-white opacity-50">{i + 1}</p>
                <img
                  className={`absolute top-0 w-[8%] sm:w-[10%] rounded-md ${d.id === currentSong?.id ? "block" : "hidden"
                    } `}
                  src={wavs}
                  alt=""
                />
                {currentSong?.id === d.id && (
                  <i
                    className={`absolute top-0 sm:h-[15vh] w-[10vw] h-full flex items-center justify-center text-5xl sm:w-[15vh]  opacity-90  duration-300 rounded-md ${d.id === currentSong?.id ? "block" : "hidden"
                      } ${isPlaying
                        ? "ri-pause-circle-fill"
                        : "ri-play-circle-fill"
                      }`}
                  ></i>
                )}

                {/* Old commented-out icon block removed */}


                <div className="ml-3 sm:ml-3 flex justify-center items-center gap-5 mt-2">
                  <div className="flex flex-col">
                    <h3 className="text-lg sm:text-base leading-none font-bold text-green-300">
                      {removeSourceAttribution(d.name)}
                    </h3>
                    {(() => {
                      const extractedAlbum = getAlbumFromTitle(d.name);
                      const displayAlbum = extractedAlbum || removeSourceAttribution(d.album.name);
                      return (
                        removeSourceAttribution(d.name) !== displayAlbum && (
                          <h4 className="text-sm sm:text-xs text-zinc-300">
                            {displayAlbum}
                          </h4>
                        )
                      );
                    })()}
                  </div>
                  <div className="flex flex-col mt-1">
                    <span className="text-[10px] sm:text-[8px] text-zinc-400">
                      {getArtistMetadata(d.artists).singleLine}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                {existingData?.find((element) => element?.id == d?.id) ? (
                  <i
                    title="Unlike"
                    onClick={() => likehandle2(d)}
                    className={` text-xl m-auto flex w-[3vw] sm:w-[9vw] rounded-full justify-center items-center h-[3vw] sm:h-[9vw]   duration-300 cursor-pointer text-red-500  ri-heart-3-fill`}
                  ></i>
                ) : (
                  <i
                    title="Like"
                    onClick={() => likehandle2(d)}
                    className={` text-xl m-auto flex w-[3vw] sm:w-[9vw] rounded-full justify-center items-center h-[3vw] sm:h-[9vw]   duration-300 cursor-pointer text-white/40  ri-heart-3-fill`}
                  ></i>
                )}

                <i
                  title="Download"
                  onClick={() =>
                    handleGenerateAudio({
                      audioUrl: d?.downloadUrl[4].url,
                      imageUrl: d?.image[2]?.url,
                      songName: removeSourceAttribution(d?.name),
                      year: d?.year,
                      album: getAlbumFromTitle(d.name) || removeSourceAttribution(d.album.name),
                      artist: d?.artists?.primary
                        ?.map((artist) => artist.name)
                        .join(","),
                    })
                  }
                  className={` text-xl m-auto flex w-[3vw] sm:w-[9vw] rounded-full justify-center items-center h-[3vw] sm:h-[9vw]   duration-300 cursor-pointer text-white/40 hover:text-white ri-download-2-fill`}
                ></i>
              </div>

              {/* <i
                onClick={() => likehandle(d)}
                className={`text-xl m-auto flex w-[3vw] sm:w-[9vw] rounded-full justify-center items-center h-[3vw] sm:h-[9vw]  bg-red-500   text-zinc-300 hover:scale-150 sm:hover:scale-100 duration-300 cursor-pointer ${
                  like ? "text-red-500" : "text-zinc-300"
                }  ri-heart-3-fill`}
              ></i> */}

              {/* <i
              title="Remove Song "
              onClick={() => removehandle(d.id)}
              className="m-auto flex w-[3vw] sm:w-[9vw] rounded-full justify-center items-center h-[3vw] sm:h-[9vw] text-xl bg-red-500  duration-300 cursor-pointer text-zinc-300 ri-dislike-fill"
            ></i> */}
            </div>
          ))}

          {/* <div className="flex gap-3 text-2xl  ">
          <h1>MADE BY ❤️ HARSH PATEL</h1>
          <a
            target="_blank"
            href="https://www.instagram.com/harsh_patel_80874/"
          >
            <i className=" ri-instagram-fill"></i>
          </a>
        </div> */}
          {search.length > 0 && !hasMore && (
            <div
              className={`w-full flex flex-col items-center  justify-center`}
            >
              <button
                onClick={newdata}
                className={` bg-red-400 shadow-2xl py-2 px-1 rounded-md`}
              >
                Load more
              </button>
              <span>wait for some seconds after click</span>
            </div>
          )}
        </div>
      </InfiniteScroll>

      {/* Player bar removed (global PlayerBar used instead) */}
    </motion.div>
  );
};

export default Songs;

