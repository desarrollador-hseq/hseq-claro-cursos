import { HTMLInputTypeAttribute, useEffect, useState } from "react";
import { Input } from "./ui/input";

interface DebouncedInput {
  value: string;
  onChange: (value: string) => void;
  debounce?: number;
  type: HTMLInputTypeAttribute | undefined;
  min?: number;
  max?: number;
  placeholder?: string;
  list?: string;
}

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  type,
  list,
  ...props
}: DebouncedInput) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce]);

  return (
    <Input
      type={type}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="h-7 rounded-none placeholder:text-slate-400 placeholder:text-xs text-slate-700"
      list={list}
      {...props}
    />
  );
}

export default DebouncedInput;
