"use client";
import { useEffect, useState } from "react";
import { Certificate } from "@prisma/client";
import { AlertCircle, FileWarning, Loader2 } from "lucide-react";

import { formatDateCert } from "@/lib/utils";
import { PdfPreview } from "../pdf-preview";
import { CertificateTemplate } from "./certificate-template";
import { getCertificate } from "@/actions/certificates.action";

const getCertificateByClient = async (certificateId: string) => {
  try {
    const certificate = await getCertificate(certificateId);
    return certificate;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const ShowCertificate = ({
  certificateId,
  showButtons = true,
}: {
  certificateId: string;
  showButtons?: boolean;
}) => {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [pdfComponent, setPdfComponent] = useState<React.ReactNode | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCertificate = async () => {
      const certificate = await getCertificateByClient(certificateId);
      setCertificate(certificate);
      setIsLoading(false);
    };
    loadCertificate();
  }, [certificateId]);

  useEffect(() => {
    if (certificate) {
      setPdfComponent(<CertificateTemplate certificate={certificate} />);
    }
  }, [certificate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <Loader2 className="h-8 w-8 mr-2 animate-spin" />
        <span>Cargando certificado...</span>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <FileWarning className="h-8 w-8 mr-2" />
        <span>No se encontró el certificado</span>
      </div>
    );
  }
  const sanitizeFileName = (fileName: string) => {
    return fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .toLowerCase();
  };

  const fileName = sanitizeFileName(`${certificate.collaboratorNumDoc}-${certificate.collaboratorFullname}`);


  return (
    <div className="flex items-center justify-between bg-white m-0 p-0 w-full mx-auto">
      {pdfComponent ? (
        <PdfPreview
          pdfComponent={pdfComponent as React.ReactElement}
          dependencies={[certificate]}
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

export default ShowCertificate;
