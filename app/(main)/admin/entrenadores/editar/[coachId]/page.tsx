import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { authOptions } from "@/lib/auth-options";
import { Trash2 } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AddCoachForm } from "../../_components/add-coach-form";
import { db } from "@/lib/db";
import { AdminOnly } from "@/components/rbac-wrapper";
import TitlePage from "@/components/title-page";

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
      <div className="container">
        <TitlePage
          title="Editar entrenador"
          description="Actualiza la información del entrenador"
        />
        <AddCoachForm coach={coach} />
      </div>
    </AdminOnly>
  );
};

export default EditCoachPage;
