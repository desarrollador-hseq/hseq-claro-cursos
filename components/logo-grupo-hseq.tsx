"use client";

import { useMemo } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";


export const LogoGrupoHseq = ({ goRoot, className, height=40, width=65 }: { goRoot?: boolean, height?: number, width?: number, className?: string }) => {
  const pathname = usePathname();

  const isDashboard = useMemo(() => pathname.includes("dashboard"), [pathname]);

  const router = useRouter();

  const navigate = () => {
    if (!goRoot) return;

    router.push(!isDashboard ? "/" : "/dashboard");
  };

  return (
    <Image
      className={cn(goRoot && "cursor-pointer" , className)}
      onClick={navigate}
      src="/logo-grupohseq.png"
      alt="logo de Grupo HSEQ"
      height={height}
      width={width}
      style={{ width: '70%', height: 'auto' }}
    />
  );
};
