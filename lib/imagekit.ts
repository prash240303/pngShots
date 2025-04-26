import ImageKit from "imagekit";
import axios from 'axios';
import { ImageType } from "@/types";
import { FileObject } from "imagekit/dist/libs/interfaces";

export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

export const getAuthenticationParameters = () => {
  return imagekit.getAuthenticationParameters();
};


// Get a list of all images
export const getImages = async () => {
  try {
    const images = await imagekit.listFiles({
      path: '/',
    });
    console.log('Raw ImageKit response:', images);

    return images;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
};

export const getAppThumbnails= async () => {
  try {
    const images = await imagekit.listFiles({
      path: '/thumbnail',
    });
    return images;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
};

export const getAppNames = async (): Promise<string[]> => {
  try {
    const images = await imagekit.listFiles({ path: "/" });
    
    // Filter out folders first
    const files = images.filter((item): item is FileObject => item.type === 'file');
    
    // Now safely extract app names from customMetadata
    const appNames = files
      .map((img) => (img.customMetadata as { app?: string })?.app || "Uncategorized")
      .filter((name): name is string => !!name);

    // Remove duplicates and sort
    const uniqueAppNames = Array.from(new Set(appNames)).sort();

    return uniqueAppNames;
  } catch (error) {
    console.error("Error fetching app names:", error);
    throw error;
  }
};
// Get unique app names from images' customMetadata
// Update getAppThumbnailNames function
export const getAppThumbnailNames = async (): Promise<string[]> => {
  try {
    const images = await imagekit.listFiles({ path: "/thumbnail" });
    
    // Filter out folders first
    const files = images.filter((item): item is FileObject => item.type === 'file');
    
    // Now safely extract app names from customMetadata
    const appNames = files
      .map((img) => (img.customMetadata as { app?: string })?.app || "Uncategorized")
      .filter((name): name is string => !!name);

    // Remove duplicates and sort
    const uniqueAppNames = Array.from(new Set(appNames)).sort();

    return uniqueAppNames;
  } catch (error) {
    console.error("Error fetching app names:", error);
    throw error;
  }
};

export const getImagesByApp = async (): Promise<{ [key: string]: ImageType[] }> => {
  try {
    const images = await imagekit.listFiles({ path: '/' });
    const categorizedImages: { [key: string]: ImageType[] } = {};

    images.forEach((img) => {
      if (img.type !== 'file') return; // Skip folders
      
      const appName = (img.customMetadata as { app?: string })?.app || "Uncategorized";
      
      if (!categorizedImages[appName]) {
        categorizedImages[appName] = [];
      }
      
      // Type assertion since we've verified it's a file
      categorizedImages[appName].push(img as unknown as ImageType);
    });
    
    return categorizedImages;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
};

export const getImageMetadata = async (fileId: string) => {
  const options = {
    method: 'GET',
    url: `https://api.imagekit.io/v1/files/${fileId}/metadata`,
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${process.env.IMAGEKIT_PRIVATE_KEY}`,
    },
  };

  try {
    const { data } = await axios.request(options);
    return data;
  } catch (error) {
    console.error('Error fetching image metadata:', error);
    throw error;
  }
};


// Delete an image by ID
export const deleteImage = async (fileId: string) => {
  try {
    await imagekit.deleteFile(fileId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Get URL for an image with transformations
export const getTransformedUrl = (
  url: string,
  options: { width?: number; height?: number; quality?: number }
) => {
  const { width, height, quality = 80 } = options;
  
  let transformationString = `q-${quality}`;
  if (width) transformationString += `,w-${width}`;
  if (height) transformationString += `,h-${height}`;
  
  return `${url}?tr=${transformationString}`;
};