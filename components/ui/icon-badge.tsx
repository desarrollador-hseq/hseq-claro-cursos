import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react";

const backgroundVariants = cva("rounded-md flex items-center justify-center", {
  variants: {
    variant: {
      default: "bg-blue-100",
      success: "bg-emerald-100",
      warning: "bg-amber-100",
      info: "bg-blue-100",
      danger: "bg-red-100",
      invert: "bg-primary",
    },
    size: {
      lg: "p-2",
      default: "p-2",
      md: "p-1",
      sm: "p-1",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const iconVariants = cva("", {
  variants: {
    variant: {
      default: "text-primary",
      success: "text-emerald-700",
      warning: "text-amber-500",
      info: "text-blue-600",
      danger: "text-red-900",
      invert: "text-white",
    },
    size: {
      default: "h-8 w-8",
      lg: "h-10 w-10",
      md: "h-6 w-6",
      sm: "h-4 w-4",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type BackgroundVariantsProps = VariantProps<typeof backgroundVariants>;
type IconVariantsProps = VariantProps<typeof iconVariants>;

interface IconBadgeProps extends BackgroundVariantsProps, IconVariantsProps {
  icon: LucideIcon;
  className?: string;
}

export const IconBadge = ({
  icon: Icon,
  variant,
  size,
  className,
}: IconBadgeProps) => {
  return (
    // <div className={cn(backgroundVariants({ variant, size }))}>
    <div className="my-3 mr-3">
    <Icon className={cn(iconVariants({ variant, size }), className)} />
    </div>
  );
};
