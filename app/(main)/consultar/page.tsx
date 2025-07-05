import React from "react";
import { LogoGrupoHseq } from "@/components/logo-grupo-hseq";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HandleConsultCertificates } from "./_components/handle-consult-certificates";
import TitlePage from "@/components/title-page";
import { Eye, FileBadge } from "lucide-react";
import Image from "next/image";
import logoClaro from "@/public/logo-claro.png";
import logoHseq from "@/public/logo-grupohseq.png";
import Link from "next/link";

const ConsultCertificatePage = () => {
  return (
    <div className=" min-h-screen container pt-5">
      <Card className="bg-primary border-none shadow-md mb-4">
        <CardHeader className="flex flex-col md:flex-row justify-between items-center">
          <div className="max-w-[100px]">
            <Image src={logoClaro} alt="logo claro" width={80} height={80} />
          </div>
          <CardTitle className="flex items-center gap-3 text-4xl text-white font-bold text-center">
            <div className="bg-blue-100 p-2 rounded-full">
              <FileBadge className="h-9 w-9 text-blue-600" />
            </div>
            Consulta de certificados
          </CardTitle>
          <Link
            href="https://www.grupohseq.com"
            target="_blank"
            rel="noopener noreferrer"
            className="max-w-[120px] md:flex hidden cursor-pointer"
          >
            <Image
              src={logoHseq}
              alt="logo Grupo HSEQ"
              width={100}
              height={100}
            />
          </Link>
        </CardHeader>
      </Card>

      <div className="container w-full flex items-start justify-center pt-1 h-fit">
        <HandleConsultCertificates />
      </div>
    </div>
  );
};

export default ConsultCertificatePage;
