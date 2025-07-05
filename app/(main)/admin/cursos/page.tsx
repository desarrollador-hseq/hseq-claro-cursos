import Link from "next/link";
import { Book, PlusCircle } from "lucide-react";
import { coursesDataTableColumns } from "./_components/courses-datatable-column";
import { getCourses } from "@/actions/courses.action";
import { ClientTable } from "@/components/client-table";
import { buttonVariants } from "@/components/ui/button";
import TitlePage from "@/components/title-page";

const CoursesPage = async () => {
  const courses = await getCourses();

  return (
    <div className="container">
      <TitlePage icon={<Book className="w-8 h-8" />} title="Cursos" description="Listado de cursos registrados en el sistema">
        <Link className={buttonVariants()} href="/admin/cursos/crear">
          <PlusCircle className="w-4 h-4 mr-2" />
          Agregar curso
        </Link>
      </TitlePage>
      <ClientTable columns={coursesDataTableColumns} data={courses} />
    </div>
  );
};

export default CoursesPage;
