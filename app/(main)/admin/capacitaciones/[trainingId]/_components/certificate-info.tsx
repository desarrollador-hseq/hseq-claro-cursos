"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { Card, CardContent } from "@/components/ui/card";
import { EditCertificateModal } from "./edit-certificate-modal";


import { Certificate } from "@prisma/client";
import { AdminOnly } from "@/components/rbac-wrapper";
import ShowCertificate from "@/components/certificates/show-certificate";

interface CertificateInfoProps {
  collaboratorId: string;
  certificate: Certificate;
}

export const CertificateInfo = ({
  collaboratorId,
  certificate,
}: CertificateInfoProps) => {
  // const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(false);



  const isExpired = certificate?.dueDate
    ? new Date(certificate.dueDate) < new Date()
    : false;

  if (isLoading) {
    return (
      <Card className="border-gray-200">
        <CardContent className="pt-4">
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!certificate) {
    return (
      <Card className="border-yellow-200">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-gray-600">
                Error al cargar certificado
              </span>
            </div>
            <Badge variant="destructive" className="text-xs">
              Error
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Verificar que tenemos los datos mínimos para el certificado
  const hasRequiredData =
    certificate &&
    certificate.collaboratorFullname &&
    certificate.collaboratorNumDoc;

  console.log({
    certificateexpeditionDate: certificate?.expeditionDate,
    certificateDueDate: certificate?.dueDate,
  });

  return (
    <Card className={`border-2 p-6`}>
      <CardContent className="p-0">
        <div className="space-y-3">
          {/* Header */}

          <div className="flex items-center justify-between bg-white m-3 p-3 max-w-[700px] mx-auto">
            <ShowCertificate certificateId={certificate.id} />
          </div>

          <div className="flex items-center justify-end bg-white m-3 p-3 text-secondary">
            <AdminOnly>
              <EditCertificateModal
                certificate={certificate}
                onUpdate={() => {}}
              />
            </AdminOnly>
          </div>

          {/* Fechas */}
          {/* <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-500">Fecha de Emisión</p>
              <p className="font-medium">
                {formatDate(certificate.expeditionDate)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Fecha de Vencimiento</p>
              <p
                className={`font-medium ${
                  isExpired ? "text-red-600" : "text-gray-900"
                }`}
              >
                {formatDate(certificate.dueDate)}
              </p>
            </div>
          </div> */}

          {/* Acciones */}
          <div className="flex items-center gap-2 pt-2"></div>
        </div>
      </CardContent>
    </Card>
  );
};
