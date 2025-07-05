"use client";
import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

import { buttonVariants } from "./ui/button";

import { cn } from "@/lib/utils";
import PdfRenderer from "./pdf-renderer";
import { usePdfUrlGenerator } from "@/hooks/use-pdf-generator";

interface PdfPreviewProps {
  pdfComponent: React.ReactElement;
  fileName?: string;
  dependencies?: any[];
  showDownloadButton?: boolean;
  showFullscreenButton?: boolean;
  containerClassName?: string;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({
  pdfComponent,
  fileName,
  dependencies = [],
  showDownloadButton = true,
  showFullscreenButton = true,
  containerClassName = "",
}) => {
  const [isSSR, setIsSSR] = useState(true);
  const { url, isLoading, error, regenerate } = usePdfUrlGenerator({
    component: pdfComponent,
    deps: dependencies,
  });

  useEffect(() => {
    setIsSSR(false);
    regenerate();
  }, []);

  if (isSSR) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-4", containerClassName)}>
      {/* Visor del PDF */}
      <div className="w-full rounded-md overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-[500px]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col gap-2 justify-center items-center h-[500px] text-red-500">
            <AlertCircle className="h-10 w-10" />
            <p>Error al generar el PDF</p>
            <button
              onClick={regenerate}
              className={buttonVariants({ variant: "outline" })}
            >
              Reintentar
            </button>
          </div>
        ) : url ? (
          <PdfRenderer
            url={url}
            showDownloadButton={showDownloadButton}
            showFullscreenButton={showFullscreenButton}
            fileName={fileName}
          />
        ) : null}
      </div>
    </div>
  );
};
