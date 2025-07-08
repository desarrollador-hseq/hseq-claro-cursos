"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToggleGroupContextValue {
  value?: string
  onValueChange?: (value: string) => void
  type: "single" | "multiple"
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(null)

interface ToggleGroupProps {
  type: "single" | "multiple"
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}

const ToggleGroup = React.forwardRef<
  HTMLDivElement,
  ToggleGroupProps
>(({ className, type, value, onValueChange, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-center gap-1", className)}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ value, onValueChange, type }}>
      {children}
    </ToggleGroupContext.Provider>
  </div>
))

ToggleGroup.displayName = "ToggleGroup"

interface ToggleGroupItemProps {
  value: string
  className?: string
  children: React.ReactNode
  "aria-label"?: string
}

const ToggleGroupItem = React.forwardRef<
  HTMLButtonElement,
  ToggleGroupItemProps
>(({ className, children, value, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)
  
  if (!context) {
    throw new Error("ToggleGroupItem must be used within ToggleGroup")
  }

  const isPressed = context.value === value
  
  const handleClick = () => {
    if (context.onValueChange) {
      context.onValueChange(value)
    }
  }

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
        "h-10 px-3",
        isPressed && "bg-accent text-accent-foreground",
        className
      )}
      aria-pressed={isPressed}
      data-state={isPressed ? "on" : "off"}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
})

ToggleGroupItem.displayName = "ToggleGroupItem"

export { ToggleGroup, ToggleGroupItem } 