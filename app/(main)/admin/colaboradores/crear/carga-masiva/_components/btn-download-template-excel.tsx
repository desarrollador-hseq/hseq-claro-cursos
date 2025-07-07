"use client";

import { FileDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";

export const BtnDownloadTemplateExcel = ({ name }: { name: string }) => {
  const handleDownloadTemplate = () => {
    // todo: crear plantilla

    const templateUrl = `/${name}.xlsx`;

    const link = document.createElement("a");
    link.href = templateUrl;
    link.download = `${name}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex items-center gap-2 ">
      <Button
        onClick={handleDownloadTemplate}
        className="gap-2 py-7 px-6 border-2 border-white"
      >
        <FileDown />
        Descargar plantilla de excel
      </Button>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Info className="text-white w-6 h-6" />
          </TooltipTrigger>
          <TooltipContent className="bg-primary text-white">
            Se debe descargar y llenar esta plantilla para cargar los
            colaboradores de la empresa
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
