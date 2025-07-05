import { HTMLInputTypeAttribute, InputHTMLAttributes } from "react";
import { Control, FieldValues, UseControllerProps } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { es } from "date-fns/locale";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./ui/button";
import { cn, formatDate } from "@/lib/utils";
import { Calendar } from "./ui/calendar";

interface CalendarInputFormProps<T extends FieldValues>
  extends UseControllerProps<T>,
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      "defaultValue" | "name" | "type"
    > {
  control: Control<T>;
  label: string;
  isSubmitting?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  type?: HTMLInputTypeAttribute | undefined;
  setValue?: any; // Para usar setValue como respaldo
  icon?: React.ReactNode;
}

export const CalendarInputForm: React.FC<CalendarInputFormProps<any>> = ({
  control,
  name,
  label,
  isSubmitting,
  disabled,
  setValue,
  icon,
}) => {
  return (
    <FormField
      disabled={isSubmitting || disabled}
      control={control}
      name={name}
      render={({ field }) => {
        console.log(`CalendarInputForm ${name} - field.value:`, field.value);
        console.log(`CalendarInputForm ${name} - field.value type:`, typeof field.value);
        return (
        <FormItem className="flex flex-col w-full">
          <FormLabel className="text-secondary flex items-center gap-x-2">{icon}{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild disabled={disabled} className="w-full">
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    " pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    formatDate(field.value)
                  ) : (
                    <span>Selecciona la fecha</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                locale={es}
                mode="single"
                selected={field.value}
                onSelect={(date) => {
                  console.log(`Calendar onSelect - received date:`, date);
                  console.log(`Calendar onSelect - date type:`, typeof date);
                  if (date instanceof Date && !isNaN(date.getTime())) {
                    console.log(`Calendar onSelect - calling field.onChange with:`, date);
                    field.onChange(date);
                    // Usar setValue como respaldo
                    if (setValue) {
                      console.log(`Calendar onSelect - also calling setValue with:`, date);
                      setValue(name, date, { shouldValidate: true, shouldDirty: true });
                    }
                    console.log(`Calendar onSelect - field.value after onChange:`, field.value);
                  } else if (date === undefined) {
                    console.log(`Calendar onSelect - clearing date`);
                    field.onChange(undefined);
                    if (setValue) {
                      setValue(name, undefined, { shouldValidate: true, shouldDirty: true });
                    }
                  }
                }}
                disabled={(date) => disabled || date < new Date("2010-01-01")}
                initialFocus
                fromYear={2000}
                toYear={2050}
                captionLayout="dropdown-buttons"
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
        );
      }}
    />
  );
};
