/**
 * Image processing utilities
 */

/**
 * Crops an image to a square from its center.
 * Uses Canvas API to extract the largest possible square from the center of the image.
 * 
 * @param file - The image file to crop
 * @param maxSize - Maximum size (width/height) of the output square (default: 512)
 * @returns Promise<File> - A new File object containing the cropped square image
 */
export async function cropToSquare(file: File, maxSize: number = 512): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate the size of the square to crop (smaller dimension)
      const size = Math.min(img.width, img.height);
      
      // Calculate the offset to center the crop
      const offsetX = (img.width - size) / 2;
      const offsetY = (img.height - size) / 2;
      
      // Determine output size (limit to maxSize)
      const outputSize = Math.min(size, maxSize);
      
      // Set canvas dimensions
      canvas.width = outputSize;
      canvas.height = outputSize;
      
      // Draw the cropped and resized image
      ctx.drawImage(
        img,
        offsetX, offsetY,       // Source x, y (top-left of crop area)
        size, size,             // Source width, height (square crop)
        0, 0,                   // Destination x, y
        outputSize, outputSize  // Destination width, height
      );
      
      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob from canvas'));
            return;
          }
          
          // Create a new File from the blob
          const croppedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          
          resolve(croppedFile);
        },
        'image/jpeg',
        0.9 // Quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load the image from the file
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}
