import { ReactNode } from "react";
import { VariantProps, cva } from "class-variance-authority";
import {
  AlertTriangle,
  CheckCircleIcon,
  Info,
  LucideIcon,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const bannerVariants = cva(
  "border text-center p-4 text-sm flex items-center w-full ",
  {
    variants: {
      variant: {
        warning: "bg-yellow-200/80 border-yellow-30 text-yellow-800",
        success: "bg-emerald-700 border-emerald-800 text-white font-semibold",
        danger: "bg-[#fb2c36] border-[#d90016] text-white",
        info: "bg-blue-300 border-blue-400 text-blue-900",
      },
    },
    defaultVariants: {
      variant: "warning",
    },
  }
);

interface BannerProps extends VariantProps<typeof bannerVariants> {
  label: string;
  children?: ReactNode;
  className?: string;
  icon?: LucideIcon;
  desc?: string;
}

const iconMap = {
  warning: AlertTriangle,
  success: CheckCircleIcon,
  danger: XCircle,
  info: Info,
};

export const Banner = ({
  label,
  variant,
  icon: CustomIcon,
  children,
  className,
  desc,
}: BannerProps) => {
  const Icon = iconMap[variant || "warning"];
  return (
    <div
      className={cn(
        bannerVariants({ variant }),
        className,
        "flex justify-between items-center w-auto  gap-2"
      )}
    >
      <span className="flex justify-center items-center gap-2 h-fit">
        {CustomIcon ? (
          <CustomIcon />
        ) : (
          <Icon className="w-5 h-5 mr-2 min-w-5 min-h-fit" />
        )}

        <span className="font-normal text-start text-sm"> {label}</span>
        {desc && <span className="font-normal text-start text-sm"> {desc}</span>}
      </span>
      <div className="flex justify-center items-center h-fit overflow-hidden">{children}</div>
    </div>
  );
};
