// Tremor Raw TabNavigation [v0.0.1]

import * as NavigationMenuPrimitives from "@radix-ui/react-navigation-menu";
import React from "react";

import { cn } from "@/lib/utils";

function getSubtree(
  options: { asChild: boolean | undefined; children: React.ReactNode },
  content: React.ReactNode | ((children: React.ReactNode) => React.ReactNode)
) {
  const { asChild, children } = options;
  if (!asChild)
    return typeof content === "function" ? content(children) : content;

  const firstChild = React.Children.only(children) as React.ReactElement;
  return React.cloneElement(firstChild, {
    children:
      typeof content === "function"
        ? content(firstChild.props.children)
        : content,
  });
}

const TabNavigation = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitives.Root>,
  Omit<
    React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitives.Root>,
    "orientation" | "defaultValue" | "dir"
  >
>(({ className, children, ...props }, forwardedRef) => (
  <NavigationMenuPrimitives.Root ref={forwardedRef} {...props} asChild={false}>
    <NavigationMenuPrimitives.List
      className={cn(
        // base
        "my-0.5 flex items-center justify-center flex-wrap border shadow-md bg-white w-fit p-1 rounded-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        // border color
        "border-gray-200 dark:border-gray-800",
        className
      )}
    >
      {children}
    </NavigationMenuPrimitives.List>
  </NavigationMenuPrimitives.Root>
));

TabNavigation.displayName = "TabNavigation";

const TabNavigationLink = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitives.Link>,
  Omit<
    React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitives.Link>,
    "onSelect"
  > & { disabled?: boolean }
>(({ asChild, disabled, className, children, ...props }, forwardedRef) => (
  <NavigationMenuPrimitives.Item className="flex" aria-disabled={disabled}>
    <NavigationMenuPrimitives.Link
      aria-disabled={disabled}
      className={cn(
        "group relative flex shrink-0 select-none items-center justify-center",
        disabled ? "pointer-events-none" : ""
      )}
      ref={forwardedRef}
      onSelect={() => {}}
      asChild={asChild}
      {...props}
    >
      {getSubtree({ asChild, children }, (children) => (
        <span
          className={cn(
            // base
            "-mb-p flex items-center justify-center whitespace-nowrap border-transparent px-3 py-1 text-sm font-medium transition-all",
            // text color
            "text-gray-300 dark:text-gray-500",
            // hover
            "group-hover:text-gray-700 group-hover:dark:text-gray-400",
            // border hover
            "group-hover:border-gray-300 group-hover:dark:border-gray-400",
            // selected
            "group-data-[active]:border-primary group-data-[active]:text-secondary group-data-[active]:bg-secondary group-data-[active]:rounded-sm group-data-[active]:text-white group-data-[active]:font-bold",
            "group-data-[active]:dark:border-secondary group-data-[active]:dark:text-secondary ",
            // disabled
            disabled
              ? "pointer-events-none text-gray-300 dark:text-gray-700"
              : "",

            className
          )}
        >
          {children}
        </span>
      ))}
    </NavigationMenuPrimitives.Link>
  </NavigationMenuPrimitives.Item>
));

TabNavigationLink.displayName = "TabNavigationLink";

export { TabNavigation, TabNavigationLink };
