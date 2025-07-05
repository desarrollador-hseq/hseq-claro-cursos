"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { City, Collaborator } from "@prisma/client";
import axios from "axios";
import { Ban, Eye, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { GenerateCertificate } from "@/app/(main)/admin/colaboradores/[collaboratorId]/_components/generate-certificate";
import { GenerateCertificateBolivar } from "@/app/(main)/admin/colaboradores/[collaboratorId]/_components/generate-certificate-bolivar";

import { SimpleModal } from "@/components/simple-modal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import { FormattedNumberInput } from "@/app/(main)/admin/colaboradores/[collaboratorId]/_components/formatted-input-form";

const formSchema = z.object({
  numDoc: z.string().min(1, {
    message: "Número de cedula es requerido",
  }),
});

export const ConsultCertificateForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [consulted, setConsulted] = useState(false);
  const [collaborator, setCollaborator] = useState<
    (Collaborator & { city: City }) | null
  >();

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { numDoc: "" },
  });
  const { isSubmitting, isValid } = form.formState;
  const { reset } = form;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const { data } = await axios.get(
        `/api/collaborators/doc/${values.numDoc}`
      );

      setCollaborator(data);

      router.refresh();
    } catch (error) {
      toast.error(
        "Ocurrió un error al consultar el certificado por favor intentelo nuevamente"
      );
      console.log("errorr", error);
    } finally {
      setIsLoading(false);
      setConsulted(true);
      reset();
    }
  };

  const isPdf = (value: string) => {
    const urlParcial = value.split("/").pop();
    const fileExt: string | undefined = urlParcial
      ? urlParcial?.split(".").pop()
      : undefined;
    const ispdf = fileExt === "pdf";
    console.log({ fileExt });
    return ispdf;
  };

  const checkedCertificate = async (id: string) => {
    try {
      const { data } = await axios.patch(`/api/collaborators/${id}`, {
        checkCertificate: true,
      });

      console.log({ checkedCert: id });
      console.log({ data });
    } catch (error) {
      console.log("errorr", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-4">
        <div>
          <FormField
            control={form.control}
            name="numDoc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de documento</FormLabel>
                <FormControl>
                  <FormattedNumberInput
                    field={field}
                    className="text-lg font-semibold"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-center w-full">
          <div>
            {isLoading ? (
              <Loader2 className="w-12 h-12 animate-spin" />
            ) : (
              collaborator && (
                <div className="grid md:grid-cols-5 w-full">
                  <div className="w-full flex flex-col md:col-span-2 border-2 border-t-primary border-l-primary border-b-primary ">
                    <h3 className="border-2 border-b-primary h-[50%] text-sm p-2 font-bold text-center">
                      N° doc
                    </h3>
                    <p className="flex justify-center items-center h-[50%] line-clamp-1">
                      {collaborator?.numDoc}
                    </p>
                  </div>
                  <div className="flex flex-col  md:col-span-2  border-2 border-t-primary border-l-primary border-b-primary">
                    <h3 className=" border-2 border-b-primary h-[50%] text-sm p-2 font-bold text-center">
                      Nombres
                    </h3>
                    <p className="flex justify-center items-center h-[50%] line-clamp-1 p-1">
                      {collaborator?.fullname}
                    </p>
                  </div>
                  <div className="w-full flex flex-col h-full items-center border-2 border-t-primary border-l-primary border-b-primary border-r-primary">
                    <p className="w-full border-2 border-b-primary h-[50%] text-sm p-2 font-bold text-center ">
                      Certificado
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          onClick={() => checkedCertificate(collaborator.id)}
                          className={cn("bg-accent")}
                        >
                          <Eye className="w-4 h-4 text-white" />
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent
                        className={
                          " lg:max-w-screen-lg overflow-y-scroll max-h-screen min-h-[300px]"
                        }
                      >
                        <AlertDialogHeader className="flex justify-between flex-row">
                          <AlertDialogTitle className="text-2xl inline">
                            <div className="">
                              Certificado de{" "}
                              <span className="uppercase">
                                {collaborator?.fullname}
                              </span>
                              .
                              {/* <Button
                                className="w-fit h-fit flex rounded-md justify-center items-center p-1 hover:bg-slate-50"
                                variant="outline"
                                onClick={handleClose}
                              >
                                <X className="text-red-500" />
                              </Button> */}
                            </div>
                          </AlertDialogTitle>
                          <AlertDialogCancel className="inline">
                            <X className="text-red-500" />
                          </AlertDialogCancel>
                        </AlertDialogHeader>
                        <AlertDialogDescription className="w-full"></AlertDialogDescription>
                        <span className="w-full">
                          {!collaborator.byArl ? (
                            <GenerateCertificate collaborator={collaborator} />
                          ) : (
                            <GenerateCertificateBolivar
                              collaborator={collaborator}
                            />
                          )}
                        </span>
                        <AlertDialogFooter className="gap-3"></AlertDialogFooter>
                        <AlertDialogFooter></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    {/* <SimpleModal
                      btnClass="p-3 h-5 mt-1 flex items-center bg-blue-500 hover:bg-blue-700"
                      textBtn={<Eye className="w-4 h-4 text-white" />}
                      title="Certificado"
                      onAcept={() => checkedCertificate(collaborator.id)}
                    >
                    
                    </SimpleModal> */}
                    {/* <Badge
                      className={cn(
                        "bg-inherit hover:bg-inherit max-w-[30px] flex justify-center items-center mt-2",
                        collaborator.certificateUrl &&
                          "bg-blue-500 hover:bg-blue-700"
                      )}
                    >
                      {collaborator.certificateUrl ? (
                        <div>
                          {isPdf(collaborator.certificateUrl) ? (
                            <PdfFullscreen
                              icon={Eye}
                              fileUrl={collaborator.certificateUrl}
                              btnClass="p-0 h-fit hover:bg-blue-700"
                            />
                          ) : (
                            <div style={{ width: "15px", height: "15px" }}>
                              <ModalImage
                                showRotate
                                small={
                                  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSIyNSIgdmlld0JveD0iMCAwIDI1NiAyNTYiPjxwYXRoIGZpbGw9IiNmZmZmZmYiIGQ9Ik0yNTEgMTIzLjEzYy0uMzctLjgxLTkuMTMtMjAuMjYtMjguNDgtMzkuNjFDMTk2LjYzIDU3LjY3IDE2NCA0NCAxMjggNDRTNTkuMzcgNTcuNjcgMzMuNTEgODMuNTJDMTQuMTYgMTAyLjg3IDUuNCAxMjIuMzIgNSAxMjMuMTNhMTIuMDggMTIuMDggMCAwIDAgMCA5Ljc1Yy4zNy44MiA5LjEzIDIwLjI2IDI4LjQ5IDM5LjYxQzU5LjM3IDE5OC4zNCA5MiAyMTIgMTI4IDIxMnM2OC42My0xMy42NiA5NC40OC0zOS41MWMxOS4zNi0xOS4zNSAyOC4xMi0zOC43OSAyOC40OS0zOS42MWExMi4wOCAxMi4wOCAwIDAgMCAuMDMtOS43NW0tNDYuMDYgMzNDMTgzLjQ3IDE3Ny4yNyAxNTcuNTkgMTg4IDEyOCAxODhzLTU1LjQ3LTEwLjczLTc2LjkxLTMxLjg4QTEzMC4zNiAxMzAuMzYgMCAwIDEgMjkuNTIgMTI4YTEzMC40NSAxMzAuNDUgMCAwIDEgMjEuNTctMjguMTFDNzIuNTQgNzguNzMgOTguNDEgNjggMTI4IDY4czU1LjQ2IDEwLjczIDc2LjkxIDMxLjg5QTEzMC4zNiAxMzAuMzYgMCAwIDEgMjI2LjQ4IDEyOGExMzAuNDUgMTMwLjQ1IDAgMCAxLTIxLjU3IDI4LjEyWk0xMjggODRhNDQgNDQgMCAxIDAgNDQgNDRhNDQuMDUgNDQuMDUgMCAwIDAtNDQtNDRtMCA2NGEyMCAyMCAwIDEgMSAyMC0yMGEyMCAyMCAwIDAgMS0yMCAyMCIvPjwvc3ZnPg=="
                                }
                                color="white"
                                large={collaborator.certificateUrl}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <X className="w-4 h-4 text-slate-300" />
                      )}
                    </Badge> */}
                  </div>
                </div>
              )
            )}
          </div>
          {consulted && !collaborator && !isLoading && (
            <div className="flex justify-center">
              <h4 className="font-bold text-lg text-cente flex items-center gap-1 text-red-500 flex-col">
                <Ban className=" w-7 h-7" /> No se encontraron resultados
              </h4>
            </div>
          )}
        </div>

        <Button disabled={!isValid || isSubmitting} className="w-full">
          Consultar
        </Button>
      </form>
    </Form>
  );
};
