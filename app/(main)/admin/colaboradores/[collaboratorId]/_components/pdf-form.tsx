"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Download, ImageIcon, Pencil, PlusCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
// import { FileUpload } from "@/components/FileUpload";
import PdfRenderer from "@/components/pdf-renderer";
import { cn } from "@/lib/utils";
import { FileUploadForm } from "@/components/file-upload-form";

interface ImageFormProps {
  CollaboratorId: string;
  url?: string | null;
}

const formSchema = z.object({
  pdfUrl: z.string().min(1, {
    message: "Image is required",
  }),
});

export const PdfForm = ({ CollaboratorId, url }: ImageFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const toggleEdit = () => setIsEditing((current) => !current);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/collaborators/${CollaboratorId}`, values);
      toast.success("El colaborador actualizado");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };



  return (
    <div className="mt-1 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-center">
        <Button
          type="button"
          onClick={toggleEdit}
          variant="default"
          className={cn(
            "text-white w-[30%] hover:bg-slate-300 my-1",
            isEditing
              ? "bg-slate-400 hover:bg-slate-600 text-white"
              : !url
              ? "bg-emerald-700 hover:bg-emerald-900"
              : "bg-primary/60"
          )}
        >
          {isEditing && (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </>
          )}
          {!isEditing && !url && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Agregar
            </>
          )}
          {!isEditing && url && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Actualizar
            </>
          )}
        </Button>
      </div>
      {!isEditing &&
        (!url ? (
          <div className="flex items-center justify-center h-fit mt-5 py-3 bg-slate-200 rounded-md w-full">
            <svg
              className="text-secondary"
              xmlns="http://www.w3.org/2000/svg"
              width="80"
              height="80"
              viewBox="0 0 16 16"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="m13.85 4.44l-3.28-3.3l-.35-.14H2.5l-.5.5V7h1V2h6v3.5l.5.5H13v1h1V4.8l-.15-.36zM10 5V2l3 3h-3zM2.5 8l-.5.5v6l.5.5h11l.5-.5v-6l-.5-.5h-11zM13 13v1H3V9h10v4zm-8-1h-.32v1H4v-3h1.06c.75 0 1.13.36 1.13 1a.94.94 0 0 1-.32.72A1.33 1.33 0 0 1 5 12zm-.06-1.45h-.26v.93h.26c.36 0 .54-.16.54-.47c0-.31-.18-.46-.54-.46zM9 12.58a1.48 1.48 0 0 0 .44-1.12c0-1-.53-1.46-1.6-1.46H6.78v3h1.06A1.6 1.6 0 0 0 9 12.58zm-1.55-.13v-1.9h.33a.94.94 0 0 1 .7.25a.91.91 0 0 1 .25.67a1 1 0 0 1-.25.72a.94.94 0 0 1-.69.26h-.34zm4.45-.61h-.97V13h-.68v-3h1.74v.55h-1.06v.74h.97v.55z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        ) : (
          <div className="relative my-2 w-full h-fit flex justify-center">
            <PdfRenderer url={url} />
            <div className="h-full flex items-center">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-0 right-0 rounded-full bg-primary p-3"
              >
                <Download
                  className="w-4 h-4 text-white"
                />
              </a>
            </div>
          </div>
        ))}
      {isEditing && (
        <div>
          {/* <FileUploadForm
            endpoint="collaboratorPdf"
            onChange={(url) => {
              if (url) {
                onSubmit({ pdfUrl: url });
              }
            }}
          /> */}
          {/* <div className="text-xs text-muted-foreground mt-4">
            El archivo debe pesar menos de 1MB en formato PDF
          </div> */}
        </div>
      )}
    </div>
  );
};
