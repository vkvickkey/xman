import React, { useEffect } from "react";
const loader = "/loading.gif";
import toast, { Toaster } from "react-hot-toast";

const Loading = ({ page }) => {
  useEffect(() => {
    toast.success(`Searching... , Wait For Results`);
  }, [])

  useEffect(() => {
    if (page >= 5) {
      // console.log(page)
      toast.error(`no results found`);
    }
  }, [page])

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black text-white">
      <Toaster position="top-center" reverseOrder={false} />
      <img className="scale-150" src={loader} alt="" />
    </div>
  );
};

export default Loading;
