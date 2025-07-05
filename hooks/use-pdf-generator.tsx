"use client";
import { useState, useEffect, cloneElement } from "react";
import { pdf } from "@react-pdf/renderer";

type PdfComponent = React.ReactElement;

interface UsePdfGeneratorOptions {
  component: PdfComponent;
  data?: any;
  deps?: any[];
}

interface UsePdfGeneratorResult {
  url: string | null;
  blob: Blob | null;
  isLoading: boolean;
  error: Error | null;
  regenerate: () => Promise<void>;
}

/**
 * Hook para generar una URL de PDF a partir de un componente PDF.
 *
 * @param options.component - El componente React PDF a renderizar
 * @param options.data - Datos que se pasan al componente
 * @param options.deps - Array de dependencias que, al cambiar, provocan la regeneración del PDF
 * @returns Objeto con la URL, el blob, estado de carga, error y función para regenerar
 */
export const usePdfUrlGenerator = ({
  component,
  deps = [],
}: UsePdfGeneratorOptions) => {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const generatePdf = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Si hay una URL previa, revocarla
      if (url) {
        URL.revokeObjectURL(url);
      }

      // Esperar un poco para asegurar que el componente esté listo
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Crear una nueva instancia del componente para evitar conflictos
      const clonedComponent = cloneElement(component);

      try {
        // Primer intento
        const blob = await pdf(clonedComponent).toBlob();
        const newUrl = URL.createObjectURL(blob);
        setUrl(newUrl);
      } catch (initialError) {
        // Si falla el primer intento, esperar más y reintentar
        console.warn("Primer intento fallido, reintentando:", initialError);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Segundo intento con un componente fresco
        const freshComponent = cloneElement(component);
        const blob = await pdf(freshComponent).toBlob();
        const newUrl = URL.createObjectURL(blob);
        setUrl(newUrl);
      }
    } catch (err) {
      console.error("Error final al generar PDF:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generatePdf();

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { url, isLoading, error, regenerate: generatePdf };
};
