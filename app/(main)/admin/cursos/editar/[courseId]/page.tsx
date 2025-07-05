import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { getCourseById } from "@/actions/courses.action";
import { AddCourseForm } from "../../_components/add-course-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth-options";
import { Button } from "@/components/ui/button";
import { Book, FileStack, Trash2 } from "lucide-react";
import { ClientTable } from "@/components/client-table";
import { levelsDataTableColumns } from "../../_components/levels-datatable-column";
import { AddLevelForm } from "../../_components/add-level-form";
import { AdminOnly } from "@/components/rbac-wrapper";
import TitlePage from "@/components/title-page";
import { Separator } from "@/components/ui/separator";

const EditCoursePage = async ({ params }: { params: { courseId: string } }) => {
  const { courseId } = await params;
  const session = await getServerSession(authOptions);
  const course = await getCourseById(courseId, true);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  if (!course) {
    return <div>Curso no encontrado</div>;
  }

  return (
    <AdminOnly>
      <div className="container space-y-3">
        <TitlePage
          icon={<Book className="w-8 h-8" />}
          title="Editar curso"
          description=""
        />

        <AddCourseForm course={course} />
        <Separator className="my-5 bg-slate-400" />
        <div>
          <TitlePage
            icon={<FileStack className="w-8 h-8" />}
            title="Niveles"
            description=""
          >
            <AddLevelForm course={course} canManagePermissions={true} />
          </TitlePage>
          <div>
            <ClientTable
              columns={levelsDataTableColumns as any}
              data={course.courseLevels || []}
            />
          </div>
        </div>
      </div>
    </AdminOnly>
  );
};

export default EditCoursePage;
