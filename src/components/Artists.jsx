import axios from "axios";
import { getApiUrl } from "../apiConfig";
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
import { useAnimate, stagger } from "framer-motion";
import { Bounce, Expo, Power4, Sine } from "gsap/all";
import { Circ } from "gsap/all";
import toast, { Toaster } from "react-hot-toast";

const Artists = () => {
  const navigate = useNavigate();
  const [query, setquery] = useState("");
  const [requery, setrequery] = useState("");
  const [artists, setartists] = useState([]);
  const [search, setsearch] = useState(false)

  const Getartists = async () => {
    try {
      const { data } = await axios.get(
        // `https://saavn.dev/api/search/artists?query=${query}&limit=10`
        // `https://jiosaavan-harsh-patel.vercel.app/search/artists?query=${query}&limit=10`
        getApiUrl("search", `/search/artists?query=${query}&limit=100`)
      );
      setartists(data?.data?.results);
      localStorage.setItem("artists", JSON.stringify(data?.data?.results));
    } catch (error) {
      console.log("error", error);
    }
  };

  function searchClick() {
    if (query !== requery) {
      toast.success(`Searching ${query} , Wait For Results`);
      setrequery(query);
      setartists([])
      setsearch(!search)
    }
    else {
      toast.error(`Please Check Your Search Query , Its Same As Before `);
    }
  }

  function seccall() {
    const intervalId = setInterval(() => {
      if (artists.length === 0 || query.length !== requery.length) {
        Getartists();
      }
    }, 1000);
    return intervalId;
  }

  useEffect(() => {
    if (query.length > 0) {
      var interval = seccall();
    }

    return () => clearInterval(interval);
  }, [search, artists]);

  useEffect(() => {
    const cache = sessionStorage.getItem("artists_cache");
    if (cache) {
      const { artists, query, requery, scrollY } = JSON.parse(cache);
      setartists(artists);
      setquery(query);
      setrequery(requery);
      setTimeout(() => window.scrollTo(0, scrollY), 100);
      sessionStorage.removeItem("artists_cache");
      return;
    }

    const allData = localStorage.getItem("artists");

    // Check if data exists in localStorage
    if (allData) {
      // Parse the JSON string to convert it into a JavaScript object
      const parsedData = JSON.parse(allData);

      // Now you can use the parsedData object
      setartists(parsedData);
    } else {
      console.log("No data found in localStorage.");
    }
  }, []);

  // console.log(artists);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
      className="w-full bg-black">
      <Toaster position="top-center" reverseOrder={false} />
      <motion.div className="w-full h-[100vh] bg-black">
        <motion.div
          initial={{ y: -50, scale: 0 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ ease: Circ.easeIn, duration: 0.7, delay: 1 }}
          className="search absolute top-0 z-[99] bg-black/80 backdrop-blur-xl gap-3 w-full sm:w-full h-[15vh] flex items-center justify-center px-3 border-b border-white/5">
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
            placeholder="Search Artists by Name Like Arijit Singh , Shreya Ghoshal..."
            type="search"
            name=""
            id=""
          />
          <h3 onClick={() => searchClick()} className="ml-2 cursor-pointer text-xl p-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-purple-glow hover:bg-purple-gradient text-white transition-all duration-300 ease-out flex items-center gap-2 hover:scale-95 heading-font">Search<i
            className="ri-search-2-line"></i></h3>
        </motion.div>
        <motion.div
          className="w-full overflow-hidden overflow-y-auto h-screen pt-[15vh] sm:min-h-[85vh] flex flex-wrap px-5 gap-5 sm:gap-5 justify-center bg-black text-white">
          {artists?.map((e, i) => (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              key={i}
              onClick={() => {
                sessionStorage.setItem(
                  "artists_cache",
                  JSON.stringify({
                    artists,
                    query,
                    requery,
                    scrollY: window.scrollY,
                  })
                );
                navigate(`/artists/details/${e.id}`);
              }}
              className="w-[15vw] h-[30vh] sm:w-[40vw] mb-5  sm:h-[20vh] sm:mb-12 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-purple-glow"
            >
              <img
                className="w-full h-full object-fill rounded-md"
                src={e?.image[2]?.url}
                alt=""
              />
              <h3 className="text-white text-sm">{e.name}</h3>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Artists;
