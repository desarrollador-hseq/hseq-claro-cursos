import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { DashboardNavbar } from "./_components/navbar/dashboard-navbar";

import { ScrollUp } from "@/components/scroll-up";
import { authOptions } from "@/lib/auth-options";
import { AdminNavbar } from "../admin/_components/navbar/admin-navbar";

const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.role) {
    redirect("/auth");
  }

  if (session.user.role === "ADMIN") {
    // redirect("/admin");
  }

  return (
    <div className="">
      <main className="relative flex flex-col h-full m-0 p-0 w-full min-h-screen">
        {session.user.role === "ADMIN" || session.user.role === "COORDINATOR" ? (
          <AdminNavbar />
        ) : (
          <DashboardNavbar />
        )}
        <div className="relative mt-1 min-h-screen w-full max-w-[1500px] mx-auto">
          <div className="Loader w-full h-[calc(100vh-64px)] flex justify-center items-center absolute top-0 left-0 z-0">
            <Loader2 className="w-10 h-10 animate-spin text-secondary" />
          </div>
          <div className="mx-1">{children}</div>
        </div>
        <ScrollUp />
      </main>
    </div>
  );
};

export default DashboardLayout;
