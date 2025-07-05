import { useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { Download, Expand, Loader2, LucideIcon, X } from "lucide-react";
import SimpleBar from "simplebar-react";
import { toast } from "sonner";
import { useResizeDetector } from "react-resize-detector";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "./ui/button";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { cn } from "@/lib/utils";

interface PdfFullscreenProps {
  fileUrl: string;
  icon?: LucideIcon;
  btnClass?: string;
}

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PdfFullscreen = ({
  fileUrl,
  icon: Icon,
  btnClass,
}: PdfFullscreenProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [numPages, setNumPages] = useState<number>();

  const { width, ref } = useResizeDetector();

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}
    >
      <AlertDialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button
          variant="ghost"
          className={cn("p-0", btnClass)}
          aria-label="fullscreen"
        >
          {Icon ? <Icon className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-7xl w-full overflow-y-auto pt-1">
        <div>
          <div className="flex justify-between my-1">
            <a
              href={fileUrl}
              download="Example-PDF-document"
              target="_blank"
              rel="noreferrer"
            >
              <Button><Download className="w-4 h-4" /></Button>
            </a>
            <Button
              variant="destructive"
              className=""
              onClick={() => setIsOpen(false)}
            >
              <X className="w-3 h-3 text-white" />
            </Button>
          </div>

          <SimpleBar
            autoHide={false}
            className="max-h-[calc(100vh-10rem)] border border-slate-300"
          >
            <div ref={ref} className="">
              <Document
                loading={
                  <div className="flex justify-center">
                    <Loader2 className="my-24 h-9 w-10 animate-spin text-primary/60" />
                  </div>
                }
                onLoadError={() => {
                  toast.error("Error al cargar PDF", {
                    description: "Por favor intentelo nuevamente",
                  });
                }}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                file={fileUrl}
                className="overflow-hidden"
              >
                {new Array(numPages).fill(0).map((_, i) => (
                  <Page key={i} width={width ? width : 1} pageNumber={i + 1} />
                ))}
              </Document>
            </div>
          </SimpleBar>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PdfFullscreen;
