declare module 'compressorjs' {
  interface CompressorOptions {
    strict?: boolean;
    checkOrientation?: boolean;
    retainExif?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    minWidth?: number;
    minHeight?: number;
    width?: number;
    height?: number;
    resize?: 'contain' | 'cover';
    quality?: number;
    mimeType?: string;
    convertTypes?: string | string[];
    convertSize?: number;
    beforeDraw?: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;
    drew?: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;
    success?: (result: Blob) => void;
    error?: (err: Error) => void;
  }

  class Compressor {
    constructor(file: File | Blob, options?: CompressorOptions);
  }

  export default Compressor;
} 