import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { authOptions } from "@/lib/auth-options";
import { Trash2 } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AddCoachForm } from "../../_components/add-coach-form";
import { db } from "@/lib/db";
import { AdminOnly } from "@/components/rbac-wrapper";

const EditCoachPage = async ({ params }: { params: { coachId: string } }) => {
  const session = await getServerSession(authOptions);
  const { coachId } = await params;
  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const coach = await db.coach.findUnique({
    where: {
      id: coachId,
      active: true,
    },
  });

  if (!coach) {
    return <div>Entrenador no encontrado</div>;
  }

  return (
    <AdminOnly>
      <Card className="max-w-[1500px] h-fit mx-auto p-1 rounded-sm">
        <CardHeader className="flex flex-row justify-between gap-y-1 w-full">
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold">Editar entrenador</h1>
            <span className="text-sm text-slate-500 font-light">
              Actualiza la información del entrenador
            </span>
          </div>
          {/* {session && session.user.role === "ADMIN" && ( */}
            {/* // <div className="flex flex-row gap-x-2">
            //   <Button variant="outline">
            //     <Trash2 className="w-4 h-4 mr-2" />
            //     Eliminar entrenador
            //   </Button>
            // </div>
            <div></div> */}
          {/* )} */}
        </CardHeader>
        <CardContent>
          <AddCoachForm coach={coach} />
        </CardContent>
      </Card>
    </AdminOnly>
  );
};

export default EditCoachPage;
