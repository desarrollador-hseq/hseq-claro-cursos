import React from "react";
import { db } from "@/lib/db";
import { AddMonthReportForm } from "./_components/add-month-report-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FileUploadForm } from "@/components/file-upload-form";

const CreateReport = async ({ params }: { params: { monthlyId: string } }) => {
  const monthlyReport = await db.monthlyReports.findUnique({
    where: {
      id: params.monthlyId,
      active: true
    },
    
  });

  if (!monthlyReport) {
    params.monthlyId = "crear";
  }

  return (
    <div>
      <Tabs defaultValue="info" className="w-full flex flex-col items-center">
        <TabsList className="w-[60%]">
          <TabsTrigger className="w-[60%]" value="info">Fecha</TabsTrigger>
          <TabsTrigger className="w-[60%]" value="file">Archivo</TabsTrigger>
        </TabsList>
        <TabsContent value="info" className="w-full">
          {monthlyReport ? (
            <AddMonthReportForm monthlyReport={monthlyReport} />
          ) : (
            <AddMonthReportForm />
          )}
        </TabsContent>
        <TabsContent value="file" className="w-full">
          <Card className="">
            <CardContent>
              {monthlyReport && (
                <div className=" ">
                  <FileUploadForm
                    apiUrl={`/api/monthly-report/${monthlyReport.id}/upload`}
                    field="reportUrl"
                    label="Informe"
                    file={monthlyReport!.reportUrl}
                    ubiPath="informes-mensuales"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreateReport;
