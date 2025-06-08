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
  const [thumbnails, setThumbnails] = useState<ImageType[]>([]);
  const [thumbnailsLoading, setThumbnailsLoading] = useState(true);

  useEffect(() => {
    const fetchThumbnails = async () => {
      try {
        const res = await fetch("/api/appthumbnails");
        if (!res.ok) throw new Error("Failed to fetch thumbnails");
        const data = await res.json();
        setThumbnails(data);
      } catch (err) {
        console.error("Error fetching thumbnails:", err);
      } finally {
        setThumbnailsLoading(false);
      }
    };
    fetchThumbnails();
  }, []);

  const appThumbnail = thumbnails.find(
    (thumb) => thumb.customMetadata?.app === appName
  );

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
  console.log("appImages");
  return (
    <div className="container bg-[#FAFAFA] mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link href="/" className="text-blue-600 hover:underline mr-4">
          ← Back to Apps
        </Link>
        <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-300 shadow-sm mr-4">
          {thumbnailsLoading ? (
            <div className="w-full h-full animate-pulse bg-gray-200" />
          ) : appThumbnail ? (
            <Image
              src={appThumbnail.url}
              alt={appName}
              width={56}
              height={56}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center text-xs text-gray-400 bg-gray-100 w-full h-full">
              No Thumbnail
            </div>
          )}
        </div>
        <h1 className="text-2xl font-bold">{appName}</h1>
        <span className="ml-2 text-gray-600">({appImages.length} images)</span>
      </div>

      {appImages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No images found for this app.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {appImages.map((image) => (
            <div
              key={image.fileId}
              className="rounded-3xl group bg-[#eee] dark:bg-[#111] border border-[#eee] shadow-sm hover:shadow-md transition p-3"
            >
              <div className="w-full flex items-end">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-300 shadow-sm mr-4">
                  {thumbnailsLoading ? (
                    <div className="w-full h-full animate-pulse bg-gray-200" />
                  ) : appThumbnail ? (
                    <Image
                      src={appThumbnail.url}
                      alt={appName}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center text-xs text-gray-400 bg-gray-100 w-full h-full">
                      No Thumbnail
                    </div>
                  )}
                </div>
                <div className="text-sm mb-2 text-end pr-2">{appName}</div>
              </div>
              <div className="relative bg-white w-full aspect-[3/4]  rounded-xl overflow-hidden flex items-end justify-center">
                {/* User Image (smaller and pinned to bottom) */}
                <div className="absolute group-hover:scale-105 duration-300 ease-in-out bottom-0 w-[68%] z-0">
                  <Image
                    src={image.url}
                    alt={image.name}
                    width={image.width || 300}
                    height={image.height || 400}
                    className="object-contain rounded-t-2xl w-full h-auto"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                {/* Phone Mockup (on top) */}
                <div className="absolute group-hover:scale-105 duration-300 ease-in-out bottom-0 w-[75%] z-10 pointer-events-none">
                  <Image
                    src="/mockup.png"
                    alt="Phone mockup"
                    width={300}
                    height={600}
                    className="object-contain w-full h-auto"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 w-full">
                <h3 className="text-sm font-semibold text-black truncate">
                  {image.customMetadata?.title || "undefined"}
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
