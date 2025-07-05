"use client";

import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Clipboard, ClipboardCheck, Globe2, Menu, Users } from "lucide-react";
import { AdminSidebarContent } from "./admin-sidebar-content";

const routes = [
  { icon: Users, label: "Colaboradores", href: "/admin/colaboradores" },
  { icon: ClipboardCheck, label: "Inspecciones", href: "/admin/inspecciones" },
  { icon: Clipboard, label: "Informes", href: "/admin/informes" },
  { icon: Globe2, label: "Ciudades", href: "/admin/ciudades" },
];


export const AdminSidebar = () => {
  return (
    <>
      <Sheet>
        <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
          <Menu />
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-56">
          <AdminSidebarContent routes={routes} />
        </SheetContent>
      </Sheet>

      <div className="w-56 h-full min-h-screen hidden absolute left-0 top-[54px]">
        <AdminSidebarContent routes={routes} />
      </div>
    </>
  );
};
