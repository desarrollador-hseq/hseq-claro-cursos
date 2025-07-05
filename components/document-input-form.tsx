"use client";
import React, { HTMLInputTypeAttribute, InputHTMLAttributes } from "react";
import {
  Control,
  FieldValues,
  Path,
  PathValue,
  useFormContext,
  useWatch,
} from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { ScrollArea } from "./ui/scroll-area";

interface DocumentInputFormProps<T extends FieldValues> {
  label: string;
  isSubmitting?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
  tooltip?: string;
  type?: React.HTMLInputTypeAttribute | undefined;
  placeholder?: string;
  typeFieldName: Path<T>;
  numberFieldName: Path<T>;
  defaultValues?: {
    type: DocumentType;
    number: string;
  };
  externalError?: string;
}


// Definición de tipos de documentos
export type DocumentType = "CC" | "TI" | "CE" | "PP" | "NIT" | "RUT";

// Opciones de tipos de documento
export const documentTypes: { value: DocumentType; label: string }[] = [
  { value: "CC", label: "Cédula de Ciudadanía" },
  { value: "TI", label: "Tarjeta de Identidad" },
//   { value: "CE", label: "Cédula de Extranjería" },
  { value: "PP", label: "Pasaporte" },
//   { value: "NIT", label: "NIT" },
//   { value: "RUT", label: "RUT" },
];

type DocumentInputProps = Omit<
  React.ComponentProps<"input">,
  "onChange" | "value" | "ref"
> & {
  value?: {
    type: DocumentType;
    number: string;
  };
  defaultValues?: {
    type: DocumentType;
    number: string;
  };
  onChange?: (value: { type: DocumentType; number: string }) => void;
  disabled?: boolean;
  placeholder?: string;
};

const DocumentInput: React.ForwardRefExoticComponent<DocumentInputProps> =
  React.forwardRef<HTMLInputElement, DocumentInputProps>(
    ({ className,defaultValues, onChange, value, disabled, placeholder = "", ...props }, ref) => {
      const [documentType, setDocumentType] = React.useState<DocumentType>(value?.type || "CC");
      const [documentNumber, setDocumentNumber] = React.useState<string>(value?.number || "");

      // Manejar cambios en el tipo de documento
      const handleTypeChange = (type: DocumentType) => {
        setDocumentType(type);
        onChange?.({ type, number: documentNumber });
      };

      // Manejar cambios en el número de documento
      const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newNumber = e.target.value;
        setDocumentNumber(newNumber);
        onChange?.({ type: documentType, number: newNumber });
      };

      // Actualizar el estado local cuando cambian las props
      React.useEffect(() => {
        if (value) {
          setDocumentType(value.type);
          setDocumentNumber(value.number);
        }
      }, [value]);

      return (
        <div className={cn("flex", className)}>
          <DocumentTypeSelect
            disabled={disabled}
            value={documentType}
            onChange={handleTypeChange}
            defaultValue={defaultValues?.type ?? "CC"}
          />
          <Input
            ref={ref}
            className="rounded-e-sm rounded-s-none"
            value={documentNumber}
            defaultValue={defaultValues?.number}
            onChange={handleNumberChange}
            disabled={disabled}
            placeholder={placeholder}
            {...props}
          />
        </div>
      );
    }
  );

DocumentInput.displayName = "DocumentInput";

type DocumentTypeSelectProps = {
  disabled?: boolean;
  value: DocumentType;
  defaultValue: DocumentType;
  onChange: (type: DocumentType) => void;
};

const DocumentTypeSelect = ({
  disabled,
  value: selectedType,
  defaultValue,
  onChange,
}: DocumentTypeSelectProps) => {
  return (
    <Popover>
      <PopoverTrigger defaultValue={defaultValue} asChild>
        <Button
          type="button"
          variant="outline"
          className="flex gap-1 rounded-e-none rounded-s-sm border-r-0 px-3 focus:z-10 h-auto min-h-full border border-secondary/30 bg-blue-50/70 focus:bg-blue-100/60 disabled:bg-slate-200/80"
          disabled={disabled}
        >
          <span className="text-secondary font-semibold">{selectedType}</span>
          <ChevronsUpDown
            className={cn(
              "-mr-2 size-4 opacity-50 text-secondary",
              disabled ? "hidden" : "opacity-100",
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-white">
        <Command defaultValue={defaultValue} className="bg-white">
          <CommandInput placeholder="Buscar tipo de documento" />
          <CommandList className="">
            <ScrollArea className="h-72">
              <CommandEmpty>Tipo no encontrado</CommandEmpty>
              <CommandGroup>
                {documentTypes.map(({ value, label }) => (
                  <CommandItem
                    key={value}
                    className="gap-2 h-full"
                    onSelect={() => onChange(value)}
                  >
                    <span className="flex-1 text-sm">{label}</span>
                    <span className="text-sm font-medium text-foreground/70">{value}</span>
                    <CheckIcon
                      className={`ml-auto size-4 h-full ${value === selectedType ? "opacity-100" : "opacity-0"}`}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export { DocumentInput };


export const DocumentInputForm = <T extends FieldValues>({
  label,
  isSubmitting,
  type,
  readOnly,
  tooltip,
  disabled,
  className,
  placeholder,
  typeFieldName,
  numberFieldName,
  defaultValues,
  externalError,
}: DocumentInputFormProps<T>) => {
  const { control, setValue, getValues } = useFormContext<T>();

  const rawDocumentType = useWatch({
    control,
    name: typeFieldName,
  }) as DocumentType;

  const rawDocumentNumber = useWatch({
    control,
    name: numberFieldName,
  }) as string;

  const documentType = rawDocumentType || "CC";
  const documentNumber = rawDocumentNumber || "";

  return (
    <FormItem className="w-full">
      <FormLabel
        className={cn(
          disabled && "text-slate-500",
          tooltip && "flex gap-2 items-center"
        )}
      >
        {label} 
      </FormLabel>
      <FormControl>
        <DocumentInput
          value={{
            type: documentType,
            number: documentNumber,
          }}
          onChange={(value) => {
            setValue(typeFieldName, value.type as PathValue<T, Path<T>>, {
              shouldValidate: true,
            });
            setValue(numberFieldName, value.number as PathValue<T, Path<T>>, {
              shouldValidate: true,
            });
          }}
          disabled={disabled || isSubmitting}
          placeholder={placeholder}
          type={type || "text"}
          className={cn("bg-blue-50/80", className)}
          readOnly={readOnly}
        />
      </FormControl>
      <FormMessage />
      {externalError && (
        <p className="text-sm font-medium text-destructive mt-1">{externalError}</p>
      )}
    </FormItem>
  );
};
