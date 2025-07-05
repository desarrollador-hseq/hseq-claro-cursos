"use client";

import Image from "next/image";
import logoClaro from "logo-claro.png";
import { LogoClaro } from "./logo-claro";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const TitleApp = ({ isNav }: { isNav?: boolean }) => {
  const [inNav, setInNav] = useState(isNav ? isNav : false);
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 mx-2",
        inNav ? "flex-row " : "flex-col"
      )}
    >
      <LogoClaro
        width={isNav ? 40 : 60}
        height={isNav ? 40 : 60}
        className={`${isNav && "mb-1"}`}
      />
      <h2 className={`${isNav ? "text-sm" : "text-lg"} font-semibold `}>Proyecto: Claro - ALTURA - 2025</h2>
    </div>
  );
};
