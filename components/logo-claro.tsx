"use client";

import { useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";


export const LogoClaro = ({ goRoot, className, height=20, width=50 }: { goRoot?: boolean, height?: number, width?: number, className?: string }) => {
  const pathname = usePathname();

  const isDashboard = useMemo(() => pathname.includes("dashboard"), [pathname]);

  const router = useRouter();

  const navigate = () => {
    if (!goRoot) return;

    router.push(!isDashboard ? "/" : "/dashboard");
  };

  return (
    <Image
      className={cn("inline",goRoot && "cursor-pointer" , className)}
      onClick={navigate}
      src="/logo-claro.png"
      alt="logo de Claro"
      height={height}
      width={width}
      style={{
        width: 'auto',
        height: 'auto',
      }}
    />
  );
};
