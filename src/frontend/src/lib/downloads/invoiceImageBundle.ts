import { getImage } from '../offline/repository';
import { downloadText } from './downloadUtils';

export async function downloadInvoiceImagesBundle(imageIds: string[], invoiceNumber: string): Promise<void> {
  try {
    const images = await Promise.all(
      imageIds.map(async (id) => {
        const img = await getImage(id);
        if (!img) return null;
        
        const reader = new FileReader();
        return new Promise<{ filename: string; data: string }>((resolve, reject) => {
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve({
              filename: img.filename,
              data: result.split(',')[1],
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(img.blob);
        });
      })
    );
    
    const validImages = images.filter((img): img is { filename: string; data: string } => img !== null);
    
    if (validImages.length === 0) {
      throw new Error('No images to download');
    }
    
    const bundle = {
      invoiceNumber,
      timestamp: Date.now(),
      images: validImages,
    };
    
    const json = JSON.stringify(bundle, null, 2);
    downloadText(json, `invoice_${invoiceNumber}_images.json`, 'application/json');
  } catch (error) {
    console.error('Failed to create image bundle:', error);
    throw new Error('Failed to download images');
  }
}
