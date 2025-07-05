"use client";

import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ConfirmModalProps {
  children: ReactNode;
  title: ReactNode;
  desc?: string;
  textBtn?: ReactNode;
  btnClass?: string;
  btnCloseClass?: string;
  modalClass?: string;
  btnDisabled?: boolean;
  large?: boolean;
  onAccept?: () => void | Promise<void> | undefined;
  textBtnAccept?: string;
  onClose?: () => void | undefined;
  btnAsChild?: boolean;
  btnAcceptDisabled?: boolean;
  close?: boolean;
  setClose?: Dispatch<SetStateAction<boolean>>;
  openDefault?: boolean;
  open?: boolean;
  contentClass?: string;
}

export const SimpleModal = ({
  children,
  title,
  desc,
  open: shouldOpen,
  textBtn,
  btnClass,
  contentClass,
  btnCloseClass,
  btnDisabled,
  onAccept,
  textBtnAccept,
  btnAcceptDisabled,
  onClose,
  large = false,
  btnAsChild,
  close = false,
  setClose,
  modalClass,
  openDefault,
}: ConfirmModalProps) => {
  const [open, setOpen] = useState(openDefault);
  const [mounted, setMounted] = useState(false);
  const [wasClose, setWasClose] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    setOpen(shouldOpen);
  }, [shouldOpen]);

  // Asegurar que el componente responde al setClose desde componentes hijos
  useEffect(() => {
    if (close) {
      handleClose();
    }
  }, [close]);

  const handleClose = () => {
    setOpen(false);
    if (setClose) {
      setClose(false);
    }
  };

  useEffect(() => {
    setWasClose(close);
  }, [close]);

  useEffect(() => {
    if (!open && mounted) {
      if (onClose) {
        onClose();
      }
    }
  }, [open]);

  useEffect(() => {
    if (wasClose) {
      setOpen(false);
      if (setClose) {
        setClose(false);
      }
      // if (onClose) {
      //   onClose();
      // }
    }
    if (setClose) {
      setClose(false);
    }
  }, [wasClose, onClose]);

  const onClickAcept = () => {
    setOpen(false);
    if (onAccept) {
      onAccept();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          asChild={btnAsChild}
          disabled={btnDisabled}
          className={cn("rounded-sm", btnClass)}
        >
          {textBtn}
        </Button>
      </DialogTrigger>

      <DialogContent
        className={cn(
          !!modalClass
            ? modalClass
            : `overflow-y-auto pt-0 px-0  ${
                !!large
                  ? "max-w-screen-lg min-h-[300px]"
                  : "max-w-xl w-[95%] h-fit"
              }  max-h-screen rounded-sm h-fit`
        )}
      >
        <DialogHeader className="h-fit sticky top-0 z-50 bg-primary text-primary-foreground overflow-hidden py-3 rounded-tl-md rounded-tr-md shadow-sm border-b border-primary/40 flex flex-col -space-y-1 p-3 ">
          {/* Botón de cerrar */}
          <DialogClose asChild className="absolute right-2 top-">
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground focus:ring-2 focus:ring-primary-foreground/50 rounded-full"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </Button>
          </DialogClose>

          <DialogTitle className="w-full text-xl h-fit text-start p-0 pr-10">
            {title}
          </DialogTitle>
          <DialogDescription className="relative w-full px-3 animate-fadeI h-fit text-start text-slate-200 p-0 mt-0">
            {desc}
          </DialogDescription>
        </DialogHeader>
        <div className={cn("px-4 py-1 overflow-y-auto w-full", contentClass)}>
          {children}
        </div>

        <DialogFooter className="gap-3 border-slate-500 flex flex-row items-center h-full px-3">
          {onAccept && (
            <Button
              className={cn("bg-zinc-400 hover:bg-zinc-600")}
              onClick={handleClose}
            >
              Cancelar
            </Button>
          )}
          {onAccept && (
            <Button disabled={btnAcceptDisabled} onClick={onClickAcept}>
              {textBtnAccept ? textBtnAccept : "Aceptar"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
