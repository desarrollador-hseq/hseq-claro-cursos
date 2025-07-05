
import { db } from "@/lib/db";
import { AddReportForm } from "./_components/add-report-form";

const CreateReport = async ({
  params,
}: {
  params: { reportId: string };
}) => {
  const report = await db.report.findUnique({
    where: {
      id: params.reportId,
    },
  });

  if (!report) {
    params.reportId = "crear";
  }

  return (
    <div>
      {report ? (
        <AddReportForm report={report} />
      ) : (
        <AddReportForm />
      )}
    </div>
  );
};

export default CreateReport;
