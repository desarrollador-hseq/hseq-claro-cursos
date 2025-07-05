import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AdminNavbar } from "./_components/navbar/admin-navbar";
import { authOptions } from "@/lib/auth-options";

const AdminLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }
  if (session.user?.role !== "ADMIN" && session.user?.role !== "COORDINATOR") {
    redirect("/");
  }

  return (
    <div>
      <main className="relative flex flex-col h-full m-0 p-0 ">
        <AdminNavbar />
        <div className="mt-1 p-2 min-h-screen h-fit w-full max-w-[1500px] mx-auto ">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
