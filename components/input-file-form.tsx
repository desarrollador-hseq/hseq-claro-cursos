import { InputHTMLAttributes } from "react";
import { Control, FieldValues, UseControllerProps } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

interface InputFormProps<T extends FieldValues>
  extends UseControllerProps<T>,
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      "defaultValue" | "name" | "type"
    > {
  control: Control<T>;
  label: string;
  isSubmitting?: boolean;
}

export const InputFileForm: React.FC<InputFormProps<any>> = ({
  control,
  name,
  label,
  isSubmitting,
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              accept=".jpg, .jpeg, .png, .pdf"
              disabled={isSubmitting}
              type="file"
              onChange={(e) =>
                field.onChange(e.target.files ? e.target.files[0] : null)
              }
              className="hidden"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
