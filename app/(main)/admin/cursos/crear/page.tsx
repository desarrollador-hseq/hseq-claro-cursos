import React from "react";
import { AddCourseForm } from "../_components/add-course-form";
import { AdminOnly } from "@/components/rbac-wrapper";
import TitlePage from "@/components/title-page";
import { Book } from "lucide-react";

const CreateCoursePage = () => {
  return (
    <div className="container">
      <TitlePage
        icon={<Book className="w-8 h-8" />}
        title="Crear curso"
        description=""
      />
      <AdminOnly>
        <AddCourseForm />
      </AdminOnly>
    </div>
  );
};

export default CreateCoursePage;
