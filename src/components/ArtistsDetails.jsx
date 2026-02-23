import axios from "axios";
import { getApiUrl } from "../apiConfig";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMusic } from "../context/MusicContext";

import Loading from "./Loading";
import InfiniteScroll from "react-infinite-scroll-component";
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
import { removeSourceAttribution, getAlbumFromTitle } from "../utils/stringUtils";
import handleGenerateAudio from "./../utils/audioUtils";
import handleGenerateAudio2 from "./../utils/audioUtils2";
import { getArtistMetadata } from "../utils/artistUtils";

const ArtistsDetails = () => {
  const navigate = useNavigate();
  let location = useLocation();
  let id = location.pathname;
  let newid = id.split("/");
  let finalid = newid[3];

  const { currentSong, isPlaying, playSong, togglePlay, setQueue } = useMusic();
  const [details, setdetails] = useState([]);
  // const [songlink, setsonglink] = useState([]);
  // var [index, setindex] = useState("");
  var [page, setpage] = useState(0);
  const [like, setlike] = useState(false);
  const [like2, setlike2] = useState(false);
  const [existingData, setexistingData] = useState(null);
  // const audioRef = useRef();
  const [hasMore, sethasMore] = useState(true);
  // const [audiocheck, setaudiocheck] = useState(true);


  const Getdetails = async () => {
    try {
      const { data } = await axios.get(
        getApiUrl("search", `/artists/${finalid}/songs?page=${page}`)
      );
      // setdetails(data?.data?.songs);
      // setdetails((prevState) => [...prevState, ...data.data.songs]);
      const newData = data.data.songs.filter(
        (newItem) => !details.some((prevItem) => prevItem.id === newItem.id)
      );
      setdetails((prevState) => [...prevState, ...newData]);
      sethasMore(newData.length > 0);
      setpage(page + 1);
      if (page >= 5 && details.length === 0) {
        navigate(-1);
      }
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


  function next() {
    // Global next handled by context
  }
  function pre() {
    // Global previous handled by context
  }


  // const handleDownloadSong = async (url, name, img) => {
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
        error: <b>Error downloading song.</b> // Error message
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

  function seccall() {
    const intervalId = setInterval(() => {
      if (!details.length > 0) {
        Getdetails();
      }
    }, 2000);
    return intervalId;
  }

  function newdata() {
    // if (page>=30) {
    //   sethasMore(false);
    // }
    // else{
    //   setTimeout(() => {
    //     Getsearch();
    // }, 1000);
    // }
    setTimeout(() => {
      Getdetails();
    }, 1000);
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


  // Auto-play handled by context


  var title = currentSong?.name;

  document.title = `${title ? title : "MAX-VIBE"}`;
  // console.log(details);
  // console.log(details);
  // console.log(page)
  // console.log(hasMore)


  return details.length ? (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
      className=" w-full h-screen  bg-black"
    >
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full fixed z-[99] backdrop-blur-xl flex items-center gap-3 sm:h-[7vh]  h-[10vh]">
        <i
          onClick={() => navigate(-1)}
          className="ml-5 cursor-pointer text-4xl p-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-purple-glow hover:bg-purple-gradient text-white transition-all duration-300 ease-out ri-arrow-left-line"
        ></i>
        <h1 className="text-xl text-white font-black">MAX-VIBE</h1>
      </div>

      {/* <div className="w-full text-white p-10 sm:p-3 sm:gap-3 h-[65vh] overflow-y-auto flex sm:block flex-wrap gap-7 justify-center ">
        {details?.map((d, i) => (
          <div
            key={i}
            onClick={() => audioseter(i)}
            className="relative hover:scale-90 sm:hover:scale-100 duration-150 w-[15vw] sm:mb-3 sm:w-full sm:flex sm:items-center sm:gap-3  rounded-md h-[20vw] sm:h-[15vh] cursor-pointer  "
          >
            <motion.img
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7 }}
              viewport={{ once: true }}
              className="w-full h-[15vw] sm:h-[15vh] sm:w-[15vh] rounded-md"
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
            <div className="flex flex-col mt-2">
              <h3
                className={`text-sm sm:text-xs leading-none  font-bold ${
                  i === index && "text-green-300"
                }`}
              >
                {d.name}
              </h3>
              <h4 className="text-xs sm:text-[2.5vw] text-zinc-300 ">
                {d.album.name}
              </h4>
            </div>
          </div>
        ))}

        <div className="flex gap-3 text-2xl  ">
          <h1>MADE BY ❤️ HARSH PATEL</h1>
          <a
            target="_blank"
            href="https://www.instagram.com/harsh_patel_80874/"
          >
            <i className=" ri-instagram-fill"></i>
          </a>
        </div>
      </div> */}
      <InfiniteScroll
        dataLength={details.length}
        next={newdata}
        hasMore={hasMore}
        loader={
          page > 2 && <h1 className="bg-black text-white">Loading...</h1>
        }
        endMessage={<p className="bg-black text-white text-center py-4">No more items</p>}
      // endMessage={()=>nomoredata()}
      >
        <div className="flex w-full pt-[15vh] sm:pt-[10vh] pb-[30vh] sm:pb-[35vh] text-white p-10 sm:p-3 sm:gap-3 bg-black min-h-[65vh] overflow-y-auto  sm:block flex-wrap gap-5 justify-center ">
          {details?.map((d, i) => (
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
                {currentSong && <i className={`absolute top-0 sm:h-[15vh] w-[10vw] h-full flex items-center justify-center text-5xl sm:w-[15vh]  opacity-90  duration-300 rounded-md ${d.id === currentSong?.id ? "block" : "hidden"
                  } ${isPlaying ? "ri-pause-circle-fill" : "ri-play-circle-fill"}`}></i>}

                <div className="ml-3 sm:ml-3 flex justify-center items-center gap-5 mt-2">
                  <div className="flex flex-col">
                    <h3
                      className={`text-lg sm:text-base leading-none font-bold ${d.id === currentSong?.id && "text-green-300"
                        }`}
                    >

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
                    <div className="flex flex-col mt-1">
                      <span className="text-xs sm:text-[10px] text-zinc-400">
                        {getArtistMetadata(d.artists).singleLine}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                {existingData?.find((element) => element?.id == d?.id) ? (
                  <i
                    onClick={() => likehandle2(d)}
                    className={`text-xl m-auto flex w-[3vw] sm:w-[9vw] rounded-full justify-center items-center h-[3vw] sm:h-[9vw]    duration-300 cursor-pointer text-red-500  ri-heart-3-fill`}
                  ></i>
                ) : (
                  <i
                    onClick={() => likehandle2(d)}
                    className={`text-xl m-auto flex w-[3vw] sm:w-[9vw] rounded-full justify-center items-center h-[3vw] sm:h-[9vw]   duration-300 cursor-pointer text-zinc-300  ri-heart-3-fill`}
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
                      album: getAlbumFromTitle(d?.name) || removeSourceAttribution(d?.album?.name),
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
        </div>
      </InfiniteScroll>
      {/* Player bar removed (global PlayerBar used instead) */}
    </motion.div>

  ) : (
    <Loading page={page} />
  );
};

export default ArtistsDetails;
