"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { Collaborator } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Download, Loader2 } from "lucide-react";
import { CertificateTemplate } from "../../../../../../components/certificates/certificate-template";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const GenerateCertificate = ({
  collaborator,
}: {
  collaborator: Collaborator & {
    city: { realName: string | undefined } | null;
  };
}) => {

  const path = usePathname();
  const lastPath = path.split("/").pop();
  const [isClient, setIsClient] = useState(false);
  const isRoot = useMemo(() => lastPath === "dashboard", [lastPath]);
  const [endDateformat, setEndDateFormat] = useState(
    format(new Date(collaborator.endDate), "PPP", { locale: es })
  );

  const nameandNumFormated = `${collaborator.fullname.replace(" ", "-")}-${
    collaborator.numDoc
  }`;

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="w-full h-full">
      <Card className="w-full min-h-[80vh]">
        <CardHeader className="flex items-end">
          <div>
            {!isRoot && isClient && (
              <PDFDownloadLink
                document={
                  <CertificateTemplate
                    collaboratorName={collaborator.fullname}
                    city={collaborator.city?.realName}
                    collaboratorDoc={collaborator.numDoc}
                    endDate={endDateformat}
                  />
                }
                fileName={`${nameandNumFormated}`}
              >
                {({ blob, url, loading, error }) => {
                  return (
                    <div className="">
                      {loading ? (
                        <div className="flex self-center justify-self-center">
                          <Loader2 className="text-secondary w-12 h-12 animate-spin" />
                        </div>
                      ) : (
                        <div
                          className={cn(
                            buttonVariants({
                              className: "bg-emerald-600 hover:bg-emerald-700",
                            }),
                            "px-10 py-7 text-lg"
                          )}
                        >
                          <Download className="mr-3" />
                          Descargar
                        </div>
                      )}
                    </div>
                  );
                }}
              </PDFDownloadLink>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isClient && (
            <PDFViewer className="w-full h-full min-h-screen">
              <CertificateTemplate
                collaboratorName={collaborator.fullname}
                city={collaborator.city?.realName}
                collaboratorDoc={collaborator.numDoc}
                endDate={endDateformat}
              />
            </PDFViewer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
