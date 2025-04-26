"use client";

import { ImageType } from "@/types";
import { FileObject } from "imagekit/dist/libs/interfaces";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface AppsPageClientProps {
  appName: string;
}

export function AppsPageClient({ appName }: AppsPageClientProps) {
  const [images, setImages] = useState<ImageType[]>([]);

  useEffect(() => {
    const fetchInitialImages = async () => {
      try {
        const response = await fetch("/api/images");
        if (!response.ok) {
          throw new Error("Failed to fetch images");
        }
        const data = await response.json();
        const formattedImages = data.map((image: ImageType) => ({
          ...image,
          tags: image.tags ?? [],
        }));
        setImages(formattedImages);
      } catch (error) {
        console.error("Error fetching initial images:", error);
      }
    };
    fetchInitialImages();
  }, []);


  // Filter and safely cast the images
  const imageFiles = images.filter((item): item is ImageType => {
    if (item.type !== "file") return false;

    const fileItem = item as FileObject;
    console.log("Processing file:", {
      id: fileItem.fileId,
      name: fileItem.name,
      customMetadata: fileItem.customMetadata,
    });

    return true;
  });

  // Group images by app
  const groupedImages = imageFiles.reduce((acc, image) => {
    const customMetadata = image.customMetadata as { app?: string } | undefined;
    const category = customMetadata?.app || "Uncategorized";

    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(image);
    return acc;
  }, {} as Record<string, ImageType[]>);

  const appImages = groupedImages[appName] || [];

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link href="/" className="text-blue-600 hover:underline mr-4">
          ← Back to Apps
        </Link>
        <h1 className="text-2xl font-bold">{appName}</h1>
        <span className="ml-2 text-gray-600">({appImages.length} images)</span>
      </div>

      {appImages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No images found for this app.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {appImages.map((image) => (
            <div
              key={image.fileId}
              className="rounded-2xl overflow-hidden bg-[#FAFAFA] border border-[#EAEAEA] text-white p-4 flex flex-col items-center justify-center"
            >
              <div className="relative w-full scale-75 border border-red-500 aspect-[2/3] bg-white rounded-xl overflow-hidden">
                <Image
                  src={image.url}
                  alt={image.name}
                  width={image.width || 300}
                  height={image.height || 400}
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <Image
                  src="/mockup.png"
                  alt="Phone mockup"
                  fill
                  className="object-contain z-10 pointer-events-none"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              <div className="flex justify-between items-center mt-4 w-full">
                <h3 className="text-sm font-semibold text-black truncate">
                  {image.name}
                </h3>
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    className="w-4 h-4 text-gray-400"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="text-sm text-gray-400">9</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
