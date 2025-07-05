import { Input } from "@/components/ui/input";
import { useState } from "react";

export const FormattedNumberInput = ({ field, className, placeholder }: any) => {
  const [displayValue, setDisplayValue] = useState(
    field.value
      ? new Intl.NumberFormat("es-ES").format(
          Number(field.value.toString().replace(/\./g, ""))
        )
      : ""
  );

  const handleChange = (e: any) => {
    const rawValue = e.target.value.replace(/\./g, "");
    if (/^\d*$/.test(rawValue)) {
      setDisplayValue(
        rawValue ? new Intl.NumberFormat("es-ES").format(Number(rawValue)) : ""
      );
      field.onChange(rawValue);
    }
  };

  const handlePaste = (e: any) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const cleanValue = pastedText.replace(/[^\d]/g, "");
    if (/^\d*$/.test(cleanValue)) {
      setDisplayValue(
        cleanValue
          ? new Intl.NumberFormat("es-ES").format(Number(cleanValue))
          : ""
      );
      field.onChange(cleanValue);
    }
  };

  return (
    <Input
      type="text"
      value={displayValue}
      className={className}
      onChange={handleChange}
      onPaste={handlePaste}
      placeholder={placeholder}
    />
  );
};
