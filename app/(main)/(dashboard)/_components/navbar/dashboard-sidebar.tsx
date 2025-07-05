"use client";

import { useSession } from "next-auth/react";
import { Clipboard, ClipboardCheck, Globe2, Menu, Users } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DashboardSidebarContent } from "./dashboard-sidebar-content";

export const DashboardSidebar = () => {
  const { data: session } = useSession();

  const routes = [
    {
      icon: Users,
      label: "Colaboradores",
      href: "/admin/colaboradores",
    },
    {
      icon: ClipboardCheck,
      label: "Inspecciones",
      href: "/admin/inspecciones",
    },
    {
      icon: Clipboard,
      label: "Informes",
      href: "/admin/informes",
    },
    { icon: Globe2, label: "Ciudades", href: "/admin/ciudades" },
  ];
  return (
    <>
      <Sheet>
        <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
          <Menu />
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-56">
          <DashboardSidebarContent routes={routes} />
        </SheetContent>
      </Sheet>

      <div className="w-56 h-full min-h-screen hidden absolute left-0 top-[54px]">
        <DashboardSidebarContent routes={routes} />
      </div>
    </>
  );
};
