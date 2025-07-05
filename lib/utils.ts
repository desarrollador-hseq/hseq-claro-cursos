import { type ClassValue, clsx } from "clsx"
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function capitalizeFirstLetter(string: string): string {
  if (!string) return "";
  const words = string.split(" ");

  const capitalize = words.map((word) => { 
      return word[0].toUpperCase() + word.substring(1); 
  }).join(" ");

  return capitalize
}


export const formatDate = (date?: Date | null, formatString: string = "dd 'de' MMMM 'de' yyyy"): string => {
  if (!date) return "-";
  return format(date, formatString, { locale: es });
};

export const formatDateCert = (date?: Date | null) => {
  if (!date) return "-";
  console.log({datetype: typeof date})
  let formattedDate = format(date, "'día' dd' de' MMMM 'de' yyyy", {
    locale: es,
  });

  if (date.getDate() === 1) {
    formattedDate = formattedDate.replace("días", "día");
  }
  return formattedDate;
};

export const isPdf = (value: string) => {
  const urlParcial = value.split("/").pop();
  const fileExt: string | undefined = urlParcial
    ? urlParcial?.split(".").pop()
    : undefined;
  const ispdf = fileExt === "pdf";
  return ispdf;
};

/**
 * Redimensiona una imagen usando canvas
 * @param file - Archivo de imagen
 * @param maxWidth - Ancho máximo
 * @param maxHeight - Alto máximo
 * @param callback - Función que recibe el archivo redimensionado
 */
export function resizeImage(
  file: File,
  callback: (resizedFile: File) => void,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): void {
  // Si no es imagen, devolver archivo original
  if (!file.type.startsWith('image/')) {
    callback(file);
    return;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  img.onload = () => {
    // Calcular nuevas dimensiones manteniendo proporción
    let { width, height } = img;
    
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    // Solo redimensionar si es necesario
    if (width === img.width && height === img.height) {
      callback(file);
      return;
    }

    // Configurar canvas
    canvas.width = width;
    canvas.height = height;

    // Dibujar imagen redimensionada
    ctx?.drawImage(img, 0, 0, width, height);

    // Convertir a blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          callback(resizedFile);
        } else {
          callback(file); // Fallback al original
        }
      },
      file.type,
      0.95 // Alta calidad para redimensionado
    );
  };

  img.onerror = () => {
    callback(file); // Fallback al original en caso de error
  };

  img.src = URL.createObjectURL(file);
}

/**
 * Comprime y redimensiona una imagen usando compressorjs
 * @param file - Archivo de imagen a comprimir
 * @param onSuccess - Callback cuando la compresión es exitosa
 * @param onError - Callback cuando hay error
 * @param quality - Calidad de compresión 0-1 (default: 0.8)
 */
export function compressAndResizeImage(
  file: File,
  onSuccess: (compressedFile: File) => void,
  onError: (error: Error) => void,
  quality: number = 0.7
): void {
  // Si no es imagen, devolver archivo original
  if (!file.type.startsWith('image/')) {
    onSuccess(file);
    return;
  }

  // Si es PDF, devolver archivo original
  if (file.type === 'application/pdf') {
    onSuccess(file);
    return;
  }

  // Importar Compressor dinámicamente
  import('compressorjs').then(({ default: Compressor }) => {
    resizeImage(file, (resizedFile) => {
      new Compressor(resizedFile, {
        quality,
        maxWidth: 1920,
        maxHeight: 1080,
        convertSize: 2000000, // Convertir a JPEG si es mayor a 2MB
        success: (compressedBlob) => {
          const compressedFile = new File([compressedBlob], file.name, {
            type: compressedBlob.type,
            lastModified: Date.now(),
          });
          onSuccess(compressedFile);
        },
        error: (err) => {
          console.error("Error al comprimir la imagen:", err);
          onError(err);
        },
      });
    });
  }).catch((err) => {
    console.error("Error al cargar compressorjs:", err);
    onError(err);
  });
}

/**
 * Versión Promise de la función de compresión
 * @param file - Archivo de imagen a comprimir
 * @param quality - Calidad de compresión 0-1 (default: 0.8)
 * @returns Promise<File> - Archivo comprimido
 */
export async function compressImage(
  file: File,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    compressAndResizeImage(
      file,
      (compressedFile) => resolve(compressedFile),
      (error) => resolve(file), // Fallback al original en caso de error
      quality
    );
  });
}

/**
 * Formatea el tamaño de archivo en formato legible
 * @param bytes - Tamaño en bytes
 * @returns string - Tamaño formateado (ej: "1.2 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}