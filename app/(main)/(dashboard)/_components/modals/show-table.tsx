"use client";

import { ReactNode, useState } from "react";

import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import {
  AlertDialog,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { TableProperties, X } from "lucide-react";

interface ConfirmModalProps {
  children: ReactNode;
  title?: string;
}

export const ShowTableModal = ({ children, title }: ConfirmModalProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button className="bg-accent ">
            <TableProperties className="w-5 h-5 mr-2" /> Resumen
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent className=" lg:max-w-screen-xl md:max-w-screen-lg overflow-y-scroll max-h-screen">
          <AlertDialogHeader className="">
            <AlertDialogTitle className="text-2xl mt-3">
              Resumen de{title ? ` ${title}` : " datos"}{" "}
            </AlertDialogTitle>
            <Button
              className="w-fit h-fit mt-0 flex rounded-md bg-primary p-1 absolute top-0 left-2"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              <X className="text-white" />
            </Button>
          </AlertDialogHeader>
          <AlertDialogDescription className="w-full"></AlertDialogDescription>
          <span className="w-full">{children}</span>
          <AlertDialogFooter></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
