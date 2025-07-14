"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import { toast } from "sonner";
import { useResizeDetector } from "react-resize-detector";
import { useForm } from "react-hook-form";
import PdfFullscreen from "./pdf-fullscreen";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  RotateCw,
  XCircle,
} from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SimpleBar from "simplebar-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

import "simplebar-react/dist/simplebar.min.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PdfRendererProps {
  url: string;
  className?: string;
  showDownloadButton?: boolean;
  showFullscreenButton?: boolean; 
  fileName?: string;
}

const PdfRenderer = ({
  url,
  className,
  showDownloadButton,
  showFullscreenButton,
  fileName,
}: PdfRendererProps) => {
  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);

  const isLoading = renderedScale !== scale;
  const { width, ref, height } = useResizeDetector();

  const CustomPageValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  });

  type TCustomPageValidator = z.infer<typeof CustomPageValidator>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(CustomPageValidator),
  });

  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    setCurrPage(Number(page));
    setValue("page", String(page));
  };

  return (
    <div
      ref={ref}
      className="w-full max-w-full bg-white rounded-md shadow flex flex-col min-w-full h-full border overflow-hidden"
    >
      <div className="h-14  w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5  justify-center">
          <Button
            disabled={currPage <= 1}
            onClick={() => {
              setCurrPage((prev) => (prev - 1 > 1 ? prev - 1 : 1));
              setValue("page", String(currPage - 1));
            }}
            variant="ghost"
            aria-label="previous page"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1.5">
            <Input
              {...register("page")}
              className={cn(
                "w-12 h-8",
                errors.page && "focus-visible:ring-red-500"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? "x"}</span>
            </p>
          </div>

          <Button
            disabled={numPages === undefined || currPage === numPages}
            onClick={() => {
              setCurrPage((prev) =>
                prev + 1 > numPages! ? numPages! : prev + 1
              );
              setValue("page", String(currPage + 1));
            }}
            variant="ghost"
            aria-label="next page"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-x-2 flex items-center">
          <Button
            type="button"
            onClick={() => setRotation((prev) => prev + 90)}
            variant="ghost"
            aria-label="rotate 90 degrees"
          >
            <RotateCw className="h-4 w-4" />
          </Button>


          {showFullscreenButton && <PdfFullscreen fileUrl={url} />}
          {showDownloadButton && (
              <Button variant="ghost" aria-label="download" onClick={() => {
                const link = document.createElement("a");
                link.href = url;
                link.download = fileName || "document.pdf";
                link.click();
              }}>
                <Download className="h-4 w-4" />
              </Button>
            )}
        </div>
      </div>

      <SimpleBar
        autoHide={false}
        className={cn(" w-full h-full", width && `w-[${width}px]`)}
      >
        <div
          className={cn("max-w-full w-full h-full", width && `w-[${width}px]`)}
        >
          <Document
            loading={
              <div>
                <Loader2 className="my-24 h-6 w-6 animate-spin text-primary" />
              </div>
            }
            onError={() => {
              toast.error("Error al cargar PDF");
            }}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            file={url}
            error={
              <div className="h-[500px] flex flex-col justify-center items-center text-lg">
                <XCircle className="w-7 h-7 text-red-500" />
                <span>Error al cargar PDF</span>
              </div>
            }
            className="max-h-full"
          >
            {isLoading && renderedScale ? (
              <Page
                width={width}
                height={height}
                pageNumber={currPage}
                scale={scale}
                rotate={rotation}
                key={"@" + renderedScale}
                className="w-full"
              />
            ) : null}
            <Page
              className={cn("w-full", isLoading ? "hidden" : "")}
              width={width}
              height={height}
              pageNumber={currPage}
              scale={scale}
              rotate={rotation}
              key={"@" + scale}
              loading={
                <div className="flex justify-center ">
                  <Loader2 className="my-24 h-6 w-6 animate-spin" />
                </div>
              }
              onRenderSuccess={() => setRenderedScale(scale)}
            />
          </Document>
        </div>
      </SimpleBar>
    </div>
  );
};

export default PdfRenderer;
