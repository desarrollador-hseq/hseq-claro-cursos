"use client";

import React, { useEffect, useState } from "react";
import { DateFilter } from "./date-filter";
import { cn } from "@/lib/utils";

export const Dashboardtitle = () => {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(false);

  // new function:
  const handleScroll = () => {
    setPrevScrollPos(window.scrollY);
    setVisible(prevScrollPos > 100);
  };

  // new useEffect:
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos, visible, handleScroll]);
  return (
    <div
      className={cn(
        "w-full top-0 h-25 p-5 bg-primary  flex flex-col md:flex-row  items-center justify-between gap-2",
        visible &&
          "fixed py-1 px-5 top-0 left-0 right-0 z-50 h-fit max-w-[1500px] mx-auto rounded-b-lg gap-1"
      )}
    >
      <h2 className=" text-3xl font-bold text-white self-center">Dashboard</h2>
      <DateFilter />
    </div>
  );
};
