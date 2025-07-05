import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AddCoachForm } from "../_components/add-coach-form";


const CreateCoachPage = () => {
    return (
      <div>
        <Card className="max-w-[1500px] h-fit mx-auto p-1 rounded-sm">
          <CardHeader className="flex flex-row justify-between gap-y-1 w-full">
            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold">Registrar entrenador</h1>
              <span className="text-sm text-slate-500 font-light">
                Registra un nuevo entrenador
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <AddCoachForm />
          </CardContent>
        </Card>
      </div>
    );
  };
  
  export default CreateCoachPage;
  