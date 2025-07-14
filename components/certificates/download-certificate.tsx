"use client";

import { useMemo, useCallback, useState } from "react";
import { Certificate } from "@prisma/client";
import { AlertCircle, FileWarning, Loader2, Download } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
  
import { CertificateTemplate } from "./certificate-template";
import { Banner } from "../ui/banner";
import { cn } from "@/lib/utils";

export const DownloadCertificate = ({
  showButtons = true,
  onDownload,
  certificate,
}: {
  showButtons?: boolean;
  onDownload?: (certificate: Certificate) => void;
  certificate: Certificate;
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const PdfComponent = useMemo(() => {
    if (!certificate) return null;
    return <CertificateTemplate certificate={certificate} />;
  }, [certificate]);

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
    `${certificate.collaboratorNumDoc}-${certificate.collaboratorFullname}`
  );

  const handleManualDownload = useCallback(async () => {
    if (!certificate || !PdfComponent || isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      // Generar el PDF usando la función pdf() directamente
      const blob = await pdf(PdfComponent).toBlob();
      
      // Crear URL para el blob
      const url = URL.createObjectURL(blob);
      
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL
      URL.revokeObjectURL(url);
      
      // Llamar a onDownload después de la descarga
      if (onDownload && certificate) {
        setTimeout(() => {
          onDownload(certificate);
        }, 500);
      }
    } catch (error) {
      console.error("Error generando/descargando PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  }, [PdfComponent, certificate, onDownload, fileName, isDownloading]);

  if (!certificate || !PdfComponent) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <FileWarning className="h-8 w-8 mr-2" />
        <span>No se encontró el certificado</span>
      </div>
    );
  }
  console.log({ certificate });

  const isExpired =
    certificate.dueDate && new Date(certificate.dueDate) < new Date();

  return (
    <div className="flex flex-col items-center justify-center bg-white m-0 p-0 w-full mx-auto gap-4">
      <div className="w-full">
        {isExpired && (
          <Banner
            label="Certificado vencido"
            icon={AlertCircle}
            variant="danger"
            className="w-full"
          />
        )}
      </div>
      {PdfComponent ? (
        <div className="flex flex-col gap-4 w-full">
          {/* Botón de descarga */}
          {showButtons && (
            <div className="flex justify-end">
              <div
                onClick={handleManualDownload}
                className={cn(
                  "bg-slate-400 hover:bg-slate-500 text-white rounded-md px-10 py-7 text-lg flex items-center transition-colors cursor-pointer",
                  isDownloading && "opacity-50 cursor-not-allowed"
                )}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Generando PDF...
                  </>
                ) : (
                  <>
                    <Download className="mr-3" />
                    Descargar
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center p-8 text-gray-500">
          <AlertCircle className="h-8 w-8 mr-2" />
          <span>Datos insuficientes para generar el certificado</span>
        </div>
      )}
    </div>
  );
};
