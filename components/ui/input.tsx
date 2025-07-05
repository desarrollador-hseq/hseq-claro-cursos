import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ name, className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "bg-slate-100 border border-slate-200  focus:outline-secondary  text-sm rounded-lg focus:ring-secondary-foreground focus:border-red-500 block w-full p-2.5",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
