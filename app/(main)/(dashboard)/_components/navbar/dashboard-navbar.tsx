
import Link from "next/link";
import { getServerSession } from "next-auth";
import { LogOut } from "lucide-react";
import { LogoGrupoHseq } from "@/components/logo-grupo-hseq";
import { DashboardSidebar } from "./dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { TitleApp } from "@/components/title-app";
import { authOptions } from "@/lib/auth-options";

export const DashboardNavbar = async () => {
  const session = await getServerSession(authOptions);

  return (
    <div className="relative p-1 border-b min-h-[55px] max-h-[70px] text-white w-full bg-primary  shadow-sm flex items-center">
      <div className="mx-auto w-full max-w-[1500px] mt-1">
        <div className="mx-3 flex items-center justify-between">
          <div className="p-2 flex gap-1">
            {session && session.user.role === "ADMIN" && <DashboardSidebar />}
            <LogoGrupoHseq goRoot className="flex" />
            {/* <LogoClaro goRoot className="flex" /> */}
          </div>

          <TitleApp isNav={true} />

          {session && session.user.role === "ADMIN" && (
            <div className="hidden md:flex ">
              <Link href="/admin/colaboradores" className="w-fit p-2">
                Colaboradores
              </Link>
              <Link href="/admin/inspecciones" className="w-fit p-2">
                Inspecciones
              </Link>
              <Link href="/admin/informes" className="w-fit p-2">
                Informes
              </Link>
              <Link href="/admin/ciudades" className="w-fit p-2">
                Ciudades
              </Link>
            </div>
          )}

          <Link href="/logout" className="w-fit h-full flex items-center">
            <Button variant="ghost" className=" gap-2 bg-slate-500">
              Salir
              <LogOut className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
