import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AddCoachForm } from "../_components/add-coach-form";
import TitlePage from "@/components/title-page";

const CreateCoachPage = () => {
  return (
    <div className="container">
      <TitlePage
        title="Registrar entrenador"
        description="Registra un nuevo entrenador"
      ></TitlePage>

      <AddCoachForm />
    </div>
  );
};

export default CreateCoachPage;
