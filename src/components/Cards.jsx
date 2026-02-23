import React, { useState } from "react";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import { removeSourceAttribution } from "../utils/stringUtils";
import { useMusic } from "../context/MusicContext";



const Cards = ({ searches, query, requery }) => {
  //   console.log(searches);

  const { currentSong, isPlaying, playSong, togglePlay, setQueue } = useMusic();

  const audioseter = (i) => {
    if (!searches[i]) return;

    if (currentSong?.id === searches[i].id) {
      togglePlay();
    } else {
      setQueue(searches);
      playSong(searches[i]);
    }
  };







  return (
    searches?.length > 0 ? (
      <div className="w-full min-h-[85vh] p-10 sm:p-5  text-white flex   gap-10 flex-wrap justify-center">

        {searches.map((d, i) => (
          <div
            key={i}
            className="w-[20%] sm:w-full sm:flex sm:flex-col  h-[50vh] sm:h-[25vh] rounded-md overflow-hidden bg-slate-200"
          >
            <div className="sm:flex sm:w-full sm:h-[15vh] ">
              <div className="img w-full sm:w-[35%] h-[30vh] sm:h-[15vh] bg-slate-500">
                <img
                  className="w-full h-full object-fill"
                  src={d.image?.[2]?.url || d.image?.[2]?.link}
                  alt=""
                />
              </div>
              <div
                onClick={() => audioseter(i)}
                className="w-full sm:w-[75%] flex justify-between px-5 sm:px-3 items-center h-[10vh] sm:h-[15vh] bg-slate-700 cursor-pointer"
              >
                <div className="flex flex-col">
                  <h3 className="text-sm sm:text-lg font-bold">{removeSourceAttribution(d.name)}</h3>
                  <p className="text-xs text-white/50">{d.album?.name}</p>
                </div>
                <i
                  className={`text-3xl ${currentSong?.id === d.id && isPlaying ? "ri-pause-circle-fill text-p-magenta" : "ri-play-circle-fill"}`}
                ></i>
              </div>

            </div>
            {/* Local audio player removed */}

          </div>
        ))}
        {/* <div className="flex gap-3 text-2xl  ">
            <h1>MADE BY ❤️ Max-vibe </h1>
            <a
              target="_blank"
              href="https://www.instagram.com/harsh_patel_80874/"
            >
              <i className=" ri-instagram-fill"></i>
            </a>
          </div> */}
      </div>
    ) : <h1 className={`${query == requery ? "hidden" : "block"}`}>Loading</h1>
  );
};

export default Cards;
