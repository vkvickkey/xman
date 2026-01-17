import axios from "axios";
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
import InfiniteScroll from "react-infinite-scroll-component";

const Album = () => {
  const navigate = useNavigate();
  const [query, setquery] = useState("");
  const [requery, setrequery] = useState("");
  const [albums, setalbums] = useState([]);
  const [search, setsearch] = useState(false)
  var [page, setpage] = useState(1);
  const [hasMore, sethasMore] = useState(true);
  const Getalbums = async () => {
    try {
      const { data } = await axios.get(
        // `https://saavn.dev/api/search/albums?query=${query}&page=1&limit=10`
        // `https://jiosaavan-harsh-patel.vercel.app/search/albums?query=${query}`
        `https://jiosavan-api-with-playlist.vercel.app/api/search/albums?query=${requery}&page=${page}&limit=0`
      );
      // setalbums(data?.data?.results);
      // setalbums((prevState) => [...prevState, ...data?.data?.results]);
      // setalbums((prevState) => [...prevState, ...data?.data?.results]);
      setpage(page + 1);
      // sethasMore(true);
      const newData = data.data.results.filter(newItem => !albums.some(prevItem => prevItem.id === newItem.id));
      setalbums(prevState => [...prevState, ...newData]);
      sethasMore(newData.length > 0)
      localStorage.setItem("albums", JSON.stringify(data?.data?.results));
    } catch (error) {
      console.log("error", error);
    }
  };

  function searchClick() {
    if (query !== requery) {
      toast.success(`Searching ${query} , Wait For Results`);
      setrequery(query);
      setalbums([])
      setpage(1);
      setsearch(!search)
    }
    else {
      toast.error(`Please Check Your Search Query , Its Same As Before `);
    }
  }

  // function seccall() {
  //   const intervalId = setInterval(() => {
  //     if (albums.length >= 0 && page<20 || query.length !== requery.length ) {
  //       setpage(page + 1)
  //       Getalbums();
  //     }
  //   }, page<=2 ? 1000 : 2000);
  //   return intervalId;
  // }
  // useEffect(() => {
  //   if (query.length > 0) {
  //     var interval = seccall();
  //   }

  //   return () => clearInterval(interval);
  // }, [search, albums,page]);


  useEffect(() => {
    setTimeout(() => {
      if (query.length > 0) {
        Getalbums();
      }
    }, 1000);

  }, [search]);

  function newdata() {
    // if (page>=25) {
    //   sethasMore(false);
    // }
    // else{
    //   setTimeout(() => {
    //     Getalbums();
    // }, 1000);
    // }

    setTimeout(() => {
      Getalbums();
    }, 1000);

  }

  useEffect(() => {
    const allData = localStorage.getItem("albums");

    // Check if data exists in localStorage
    if (allData) {
      // Parse the JSON string to convert it into a JavaScript object
      const parsedData = JSON.parse(allData);

      // Now you can use the parsedData object
      setalbums(parsedData);
    } else {
      console.log("No data found in localStorage.");
    }
  }, []);

  // console.log(albums);
  // console.log(hasMore);
  // console.log(page)
  return (
    <InfiniteScroll
      dataLength={albums.length}
      next={newdata}
      hasMore={hasMore}
      loader={page > 2 && <h1 className="bg-black text-white">Loading...</h1>}
      endMessage={<p className="bg-black text-white text-center py-4">No more items</p>}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="w-full min-h-[100vh] bg-black">
        <Toaster position="top-center" reverseOrder={false} />
        <motion.div className="w-full min-h-[100vh] ">
          <motion.div
            initial={{ y: -50, scale: 0 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ ease: Circ.easeIn, duration: 0.7, delay: 1 }}
            className="search fixed z-[99] bg-black/80 backdrop-blur-xl gap-3 w-full sm:w-full h-[15vh] flex items-center justify-center border-b border-white/5">
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
              placeholder="Search Albums  "
              type="search"
              name=""
              id=""
            />
            <h3 onClick={() => searchClick()} className="ml-2 cursor-pointer text-xl p-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-purple-glow hover:bg-purple-gradient text-white transition-all duration-300 ease-out flex items-center gap-2 hover:scale-95 heading-font">Search<i
              className="ri-search-2-line"></i></h3>
          </motion.div>

          <motion.div className="w-full pt-[15vh] overflow-hidden min-h-[85vh] sm:min-h-[85vh] flex flex-wrap p-5 gap-5 justify-center bg-black text-white">
            {albums?.map((e, i) => (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                // transition={{delay:i*0.1 }}
                viewport={{ once: true }}
                key={i}
                onClick={() => navigate(`/albums/details/${e.id}`)}
                className="w-[15vw] h-[30vh] sm:w-[40vw] mb-8 sm:h-[20vh] sm:mb-12 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-purple-glow"
              >
                <img
                  className="w-full h-full object-fill rounded-md"
                  src={e?.image[2]?.url}
                  alt=""
                />
                <h3 className="text-white">{e.name}</h3>
              </motion.div>
            ))}
          </motion.div>

        </motion.div>
      </motion.div>
    </InfiniteScroll>
  );
}

export default Album