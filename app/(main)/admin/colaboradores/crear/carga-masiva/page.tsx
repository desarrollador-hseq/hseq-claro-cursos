import TitlePage from "@/components/title-page";
import { BtnDownloadTemplateExcel } from "./_components/btn-download-template-excel";
import { EmployeeValidationExcel } from "./_components/employee-validation-excel";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { getCities } from "@/actions/parameters";

const UploadEmployee = async () => {

  const cities = await getCities();

  return (
    <>
      <div className="p-5 w-full">
        <TitlePage
          title="Carga masiva de colaboradores"
          description="Carga masiva de colaboradores desde un archivo Excel"
        >
          <BtnDownloadTemplateExcel name="resources/plantilla-subir-colaboradores" />
        </TitlePage>
        <Card className="p-5">
          <CardContent>
            <EmployeeValidationExcel cities={cities || []} />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UploadEmployee;
