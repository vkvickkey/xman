import axios from "axios";
import { getApiUrl } from "../apiConfig";
import React, { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useMusic } from "../context/MusicContext";

import Loading from "./Loading";
const wavs = "/wavs.gif";
import { getArtistMetadata } from "../utils/artistUtils";
const noimg = "/noimg.png";
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

const SongDetails = () => {
  let { id } = useParams();
  // let { pathname } = useLocation();
  const Navigate = useNavigate();
  const { currentSong, isPlaying, playSong, togglePlay, setQueue } = useMusic();
  const [details, setdetails] = useState([]);
  const [song, setsong] = useState([]);
  // const [songlink, setsonglink] = useState([]);
  // var [index, setindex] = useState("");
  const [like, setlike] = useState("");
  const [like2, setlike2] = useState(false);
  const [existingData, setexistingData] = useState(null);


  const Getdetails = async () => {
    try {
      const { data } = await axios.get(
        getApiUrl("search", `/songs/${id}/suggestions?limit=70`)
      );
      // setdetails(data.data.songs);
      setdetails(data?.data);
    } catch (error) {
      console.log("error", error);
    }
  };

  const Getsong = async () => {
    try {
      const { data } = await axios.get(
        getApiUrl("search", `/songs/${id}?lyrics=true`)
      );
      // setdetails(data.data.songs);
      setsong(data?.data);
    } catch (error) {
      console.log("error", error);
    }
  };

  function audioseter(i) {
    if (!details?.[i]) return;

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
      toast.success("Song added to Likes section ✅");
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
        toast.success("Song removed successfully. 🚮");

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
      toast.success("Song added to Likes section. ✅");
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
        toast.success("Song removed successfully. 🚮");

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


  const handleDownloadSong = async (url, name) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${name}.mp3`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
    } catch (error) {
      console.log("Error fetching or downloading files", error);
    }
  };

  // function idch(e) {
  //   id = e;
  //   setdetails([]);
  //   setsong([]);
  //   setsonglink([]);
  // }

  function seccall() {
    const intervalId = setInterval(() => {
      if (details.length === 0 && song.length === 0) {
        Getdetails();
        Getsong();
      }
    }, 3000);
    return intervalId;
  }

  useEffect(() => {
    var interval = seccall();

    return () => clearInterval(interval);
  }, [details, song]);

  useEffect(() => {
    likeset(currentSong);
  }, [details, song, like, currentSong, like2, existingData]);


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
  }, [details, song, like, currentSong, like2]);


  // useEffect(() => {
  //   Getdetails();
  // }, []);

  var title = currentSong?.name;


  document.title = `${title ? title : "MAX-VIBE"}`;

  // console.log(id);
  //   console.log(song);
  //   console.log(song[0]?.artists?.primary);

  return details.length ? (
    <div className="w-full h-screen  bg-black">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full flex items-center gap-3 sm:h-[7vh]  h-[10vh]">
        <i
          onClick={() => Navigate(-1)}
          className="ml-5 cursor-pointer text-4xl p-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-purple-glow hover:bg-purple-gradient text-white transition-all duration-300 ease-out ri-arrow-left-line"
        ></i>
        <h1 className="text-xl text-white font-black">MAX-VIBE</h1>
      </div>
      <div className="px-7 w-full h-[65vh] overflow-hidden overflow-y-auto">
        {song?.map((e, i) => (
          <div
            key={i}
            className="w-full p-3 h-[50vh]  sm:min-h-fit flex sm:block gap-3 "
          >
            <div className="w-[20%] sm:w-[70%] h-full sm:h-[50%]">
              <img
                className="w-full h-full rounded-md"
                src={e.image[2].url}
                alt=""
              />
            </div>
            <div className="w-[80%] sm:w-full flex flex-col gap-1 h-full text-white ">
              <p className="text-3xl flex  gap-5  font-bold text-white">
                {removeSourceAttribution(e.name)}
                {existingData?.find((element) => element.id == e.id) ? (
                  <i
                    onClick={() => likehandle2(e)}
                    className={`text-xl w-[3vw] sm:w-[9vw] rounded-full  h-[3vw] sm:h-[9vw]    duration-300 cursor-pointer text-red-500  ri-heart-3-fill`}
                  ></i>
                ) : (
                  <i
                    onClick={() => likehandle2(e)}
                    className={`text-xl  w-[3vw] sm:w-[9vw] rounded-full  h-[3vw] sm:h-[9vw]   duration-300 cursor-pointer text-white/40  ri-heart-3-fill`}
                  ></i>
                )}

              </p>
              <p
                onClick={() => Navigate(`/albums/details/${e.album.id}`)}
                className="text-lg font-semibold cursor-pointer"
              >
                {removeSourceAttribution(e.album.name)}
              </p>
              <p className="text-xl">
                {e.type} - {Math.floor(e.duration / 60) + " min"} - {e.language}{" "}
                - {e.year}
              </p>
              <div className="flex flex-col mt-1">
                <span className="text-sm text-zinc-400">
                  {getArtistMetadata(e.artists).singleLine}
                </span>
              </div>
              <p>{e.copyright}</p>
              <div className="sm:hidden mt-2 flex flex-col text-[1vw] items-start  gap-2">
                <div>
                  <h3 className="font-bold text-sm text-white/80">
                    Download Options
                  </h3>
                </div>
                <div className="flex flex-row-reverse gap-2 ">
                  <p
                    onClick={() =>
                      handleDownloadSong(
                        e.downloadUrl[0].url,
                        e.name + " 12kbps"
                      )
                    }
                    className="duration-300 cursor-pointer hover:text-white hover:bg-purple-gradient hover:scale-90 w-fit p-1 font-semibold rounded-md shadow-purple-glow bg-white/10 border border-white/10 flex flex-col items-center"
                  >
                    12kbps <br />
                    <p className="text-xs">Very low quality</p>
                  </p>
                  <p
                    onClick={() =>
                      handleDownloadSong(
                        e.downloadUrl[1].url,
                        e.name + " 48kbps"
                      )
                    }
                    className="duration-300 cursor-pointer hover:text-white hover:bg-purple-gradient hover:scale-90 w-fit p-1 font-semibold rounded-md shadow-purple-glow bg-white/10 border border-white/10 flex flex-col items-center"
                  >
                    48kbps <br />
                    <p className="text-xs">Low quality</p>
                  </p>
                  <p
                    onClick={() =>
                      handleDownloadSong(
                        e.downloadUrl[2].url,
                        e.name + " 96kbps"
                      )
                    }
                    className="duration-300 cursor-pointer hover:text-white hover:bg-purple-gradient hover:scale-90 w-fit p-1 font-semibold rounded-md shadow-purple-glow bg-white/10 border border-white/10 flex flex-col items-center"
                  >
                    96kbps <br />
                    <p className="text-xs">Fair quality</p>
                  </p>
                  <p
                    onClick={() =>
                      handleDownloadSong(
                        e.downloadUrl[3].url,
                        e.name + " 160kbps"
                      )
                    }
                    className="duration-300 cursor-pointer hover:text-white hover:bg-purple-gradient hover:scale-90 w-fit p-1 font-semibold rounded-md shadow-purple-glow bg-white/10 border border-white/10 flex flex-col items-center"
                  >
                    160kbps <br />
                    <p className="text-xs">Good quality</p>
                  </p>
                  <p
                    onClick={() =>
                      handleGenerateAudio({
                        audioUrl: e.downloadUrl[4].url,
                        imageUrl: e.image[2].url,
                        songName: removeSourceAttribution(e.name),
                        year: e.year,
                        album: getAlbumFromTitle(e?.name) || removeSourceAttribution(e?.album.name),
                        artist: e?.artists?.primary?.map((a) => a.name).join(", "),
                      })
                    }
                    className="duration-300 cursor-pointer hover:text-white hover:bg-purple-gradient hover:scale-90 w-fit p-1 font-semibold rounded-md shadow-purple-glow bg-white/10 border border-white/10 flex flex-col items-center"
                  >
                    320kbps <br />
                    <p className="text-xs"> High quality</p>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* <div className="w-full h-[35vh] mt-3 text-zinc-300 ">
          <p className="text-xl">Artists</p>
          <div className="w-full flex overflow-hidden overflow-x-auto gap-2 h-[30vh]">
            {song[0]?.artists?.primary.map((e, i) => (
              <div className="w-[15%] flex flex-col justify-center items-center h-[30vh] ">
                <img
                  key={i}
                  className="w-[80%] p-1  h-[23vh] rounded-full bg-black"
                  src={e?.image[2]?.url || noimg}
                />
                <h1 className="text-center">{e.name}</h1>
              </div>
            ))}
          </div>
        </div> */}

        <div className="playlists w-full mt-3  flex flex-col gap-3 text-white ">
          <h3 className="text-xl h-[5vh] font-semibold">Artists</h3>
          <div className="playlistsdata px-5 sm:px-3 flex flex-shrink  gap-5 overflow-x-auto overflow-hidden w-full ">
            {song[0]?.artists?.primary?.map((p, i) => (
              <motion.div
                initial={{ y: -100, scale: 0.5 }}
                whileInView={{ y: 0, scale: 1 }}
                transition={{ ease: Circ.easeIn, duration: 0.05 }}
                // to={`/playlist/details/${p.id}`}
                onClick={() => Navigate(`/artists/details/${p.id}`)}
                key={i}
                className="hover:scale-110  sm:hover:scale-100  duration-150 flex-shrink-0 w-[15%] sm:w-[40%] rounded-md  flex flex-col gap-2 py-4 cursor-pointer"
              >
                <img
                  className="w-full  rounded-md"
                  src={p?.image[2]?.url || noimg}
                  alt=""
                />
                <motion.h3
                  // initial={{ y: 50, opacity: 0 }}
                  // whileInView={{ y: 0, opacity: 1 }}
                  // transition={{ease:Circ.easeIn,duration:0.05}}
                  className="leading-none"
                >
                  {p.name}
                </motion.h3>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="trending songs flex flex-col gap-3 w-full  text-white ">
          <h3 className="text-xl h-[5vh] font-semibold">Similar Songs</h3>
          <motion.div className="songs px-5 sm:px-3 flex flex-shrink  gap-5 overflow-x-auto overflow-hidden w-full ">
            {details?.map((t, i) => (
              <motion.div
                //  whileHover={{ scale: 1.2 }}
                //  viewport={{ once: true }}
                initial={{ y: -100, scale: 0.5 }}
                whileInView={{ y: 0, scale: 1 }}
                transition={{ ease: Circ.easeIn, duration: 0.05 }}
                onClick={() => audioseter(i)}
                key={i}
                className="relative hover:scale-90 sm:hover:scale-100  duration-150 flex-shrink-0 w-[15%] sm:w-[40%] rounded-md flex flex-col gap-2 py-4 cursor-pointer"
              >
                <motion.img
                  className="relative w-full  rounded-md"
                  // src={t.image[2].link}
                  src={t.image[2].url}
                  alt=""
                />
                <img
                  className={`absolute top-4 w-[20%] sm:w-[25%] rounded-md ${t.id === currentSong?.id ? "block" : "hidden"
                    } `}
                  src={wavs}
                  alt=""
                />

                <motion.div
                  //  initial={{ y: 50, scale:0}}
                  //  whileInView={{ y: 0,scale: 1 }}
                  //  transition={{ease:Circ.easeIn,duration:0.05}}
                  className="flex flex-col"
                >
                  <div className="flex flex-col">
                    <h3 className="text-xl sm:text-base leading-none font-bold text-green-300">
                      {removeSourceAttribution(t.name)}
                    </h3>
                    {(() => {
                      const extractedAlbum = getAlbumFromTitle(t.name);
                      const displayAlbum = extractedAlbum || removeSourceAttribution(t.album.name);
                      return (
                        removeSourceAttribution(t.name) !== displayAlbum && (
                          <h4 className="text-sm sm:text-xs text-zinc-300">
                            {displayAlbum}
                          </h4>
                        )
                      );
                    })()}
                    <div className="flex flex-col mt-2">
                      <span className="text-xs text-zinc-400">
                        {getArtistMetadata(t.artists).singleLine}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      {/* Player bar removed (global PlayerBar used instead) */}
    </div>
  ) : (
    <Loading />
  );
};

export default SongDetails;
