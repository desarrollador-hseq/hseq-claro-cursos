// Función de prueba simple para debugging
export function testCompression(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    console.log('🧪 TEST: Iniciando prueba de compresión');
    console.log('📁 Archivo original:', file.name, (file.size / 1024 / 1024).toFixed(2), 'MB');
    
    if (!file.type.startsWith('image/')) {
      console.log('❌ TEST: No es imagen');
      resolve(file);
      return;
    }

    // Importar directamente sin dynamic import para test
    try {
      const Compressor = require('compressorjs').default;
      console.log('✅ TEST: CompressorJS importado exitosamente');
      
      new Compressor(file, {
        quality: 0.6,
        maxWidth: 1920,
        maxHeight: 1080,
        mimeType: 'image/jpeg',
        success: (result: Blob) => {
          console.log('✅ TEST: Compresión exitosa!', (result.size / 1024 / 1024).toFixed(2), 'MB');
          const compressedFile = new File([result], file.name, {
            type: result.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        error: (err: Error) => {
          console.error('❌ TEST: Error en compresión:', err);
          reject(err);
        },
      });
    } catch (error) {
      console.error('❌ TEST: Error al importar CompressorJS:', error);
      reject(error);
    }
  });
} 