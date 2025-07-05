"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
}

export const AdminSidebarItems = ({
  icon: Icon,
  label,
  href,
}: SidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = useMemo(
    () =>
      (href === "/dashboard" &&
        pathname === "/dashboard" &&
        href === "/dashboard") ||
      pathname === href ||
      pathname?.startsWith(`/dashboard${href}/`),
    [pathname, href]
  );

  const onClick = () => {
    router.push(href);
  };

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20",
        isActive &&
          "text-blue-950 bg-sky-200/20 hover:bg-sky-200/20 hover:text-blue-950"
      )}
    >
      <div className="flex items-center gap-x-2 py-4">
        <Icon
          size={22}
          className={cn("text-slate-500", isActive && "text-blue-950")}
        />

        {label}
      </div>
      <div
        className={cn(
          "ml-auto opacity-0 border-2 border-blue-950 h-full transition-all",
          isActive && "opacity-100"
        )}
      />
    </button>
  );
};
