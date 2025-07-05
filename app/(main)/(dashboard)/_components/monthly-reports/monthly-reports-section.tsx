import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { MonthlyReports } from "@prisma/client";
import { authOptions } from "@/lib/auth-options";
import { MonthlyReportsTable } from "./monthly-reports-table";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MonthlyReportsTableProps {
  monthlyReports: MonthlyReports[];
}

export const MonthlyReportsSection = async ({
  monthlyReports,
}: MonthlyReportsTableProps) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect("/");
  }

  return (
    <div
      className="w-full flex flex-col justify-center items-center mb-6"
      id="inspection"
    >
      <div className="w-full grid grid-cols-3 my-1 h-max md:my-3 px-3 ">
        <div />
        <h2 className="text-3xl font-bold text-center">Informes mensuales</h2>
        {session.user.role === "ADMIN" && (
          <Link
            href={`/admin/informes-mensuales/crear`}
            className={cn(buttonVariants(), "w-fit place-self-end")}
          >
            Agregar
          </Link>
        )}
      </div>

      <MonthlyReportsTable monthlyReports={monthlyReports} />
    </div>
  );
};
