"use client";
import { useEffect, useState } from "react";
import { AlertCircle, FileWarning, Loader2 } from "lucide-react";

import { PdfPreview } from "../pdf-preview";
import { getEppCertificationInspection } from "@/actions/certificates.action";

import { EppCertificationInspection } from "@prisma/client";
import { EppInspectionCertificateTemplate } from "./epp-inspection-certificate-template";

const getEppInspectionByClient = async (eppInspectionId: string) => {
  try {
    const eppInspection = await getEppCertificationInspection(eppInspectionId);
    return eppInspection;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const ShowEppInspectionCertificate = ({
  eppInspectionId,
  showButtons = true,
  onDownload,
}: {
  eppInspectionId?: string;
  showButtons?: boolean;
  onDownload?: (eppInspection: EppCertificationInspection) => void;
}) => {
  const [eppInspection, setEppInspection] =
    useState<EppCertificationInspection | null>(null);
  const [pdfComponent, setPdfComponent] = useState<React.ReactNode | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCertificate = async () => {
      const certificate = await getEppInspectionByClient(eppInspectionId || "");
      setEppInspection(certificate);
      setIsLoading(false);
    };

    if (eppInspectionId) {
      loadCertificate();
    }
  }, [eppInspectionId]);

  useEffect(() => {
    if (eppInspection) {
      setPdfComponent(
        <EppInspectionCertificateTemplate 
          eppInspection={eppInspection} 
          hideCollaboratorInfo={eppInspection.isKitRescue}
        />
      );
    }
    console.log({ eppInspection });
  }, [eppInspection]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <Loader2 className="h-8 w-8 mr-2 animate-spin" />
        <span>Cargando certificado...</span>
      </div>
    );
  }

  if (!eppInspection) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <FileWarning className="h-8 w-8 mr-2" />
        <span>No se encontró el certificado</span>
      </div>
    );
  }
  const sanitizeFileName = (fileName: string) => {
    return fileName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-zA-Z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
      .toLowerCase();
  };

  const fileName = sanitizeFileName(
    `${eppInspection.collaboratorNumDoc}-${eppInspection.collaboratorName}- ${eppInspection.eppName}-${eppInspection.eppSerialNumber}`
  );

  console.log({ eppInspection });

  return (
    <div className="flex flex-col items-center justify-center bg-white m-0 p-0 w-full mx-auto gap-4">
      <div className="w-full">
        {/* {isExpired && (
          <Banner
            label="Certificado vencido"
            icon={AlertCircle}
            variant="danger"
            className="w-full"
          />
        )} */}
      </div>
      {pdfComponent ? (
        <PdfPreview
          pdfComponent={pdfComponent as React.ReactElement}
          dependencies={[eppInspection]}
          containerClassName="w-full"
          showDownloadButton={showButtons}
          showFullscreenButton={showButtons}
          fileName={fileName}
        />
      ) : (
        <div className="flex items-center justify-center p-8 text-gray-500">
          <AlertCircle className="h-8 w-8 mr-2" />
          <span>Datos insuficientes para generar el certificado</span>
        </div>
      )}
    </div>
  );
};

export default ShowEppInspectionCertificate;
