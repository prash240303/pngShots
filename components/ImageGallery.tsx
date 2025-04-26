"use client";
import { useEffect, useState } from "react";
import { ImageType } from "@/types";
import Image from "next/image";
import Link from "next/link";

interface ImageGalleryProps {
  imageList: ImageType[];
}

export default function AppGallery({ imageList }: ImageGalleryProps) {
  const [thumbnails, setThumbnails] = useState<ImageType[]>([]);

  useEffect(() => {
    const fetchThumbnails = async () => {
      try {
        const res = await fetch("/api/appthumbnails");
        if (!res.ok) throw new Error("Failed to fetch thumbnails");
        const thumbnails = await res.json();
        setThumbnails(thumbnails);
      } catch (error) {
        console.error(error);
      }
    };

    fetchThumbnails();
  }, []);

  const groupedImages = imageList.reduce((acc, image) => {
    const category = image.customMetadata?.app || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(image);
    return acc;
  }, {} as Record<string, ImageType[]>);

  return (
    <div className="container mx-auto">
      <div className="flex flex-wrap gap-16 p-8">
        {Object.keys(groupedImages).map((appName) => {
          const coverImage = thumbnails.find(
            (thumb) => thumb.customMetadata?.app === appName
          );

          return (
            <Link
              href={`/apps/${encodeURIComponent(appName)}`}
              key={appName}
              className="block"
            >
              <div className="flex flex-col items-center cursor-pointer group transition-all duration-300">
                <div className="w-24 h-24 rounded-3xl overflow-hidden flex items-center justify-center shadow-md mb-4 border border-gray-200">
                  {coverImage ? (
                    <Image
                      src={coverImage.url}
                      alt={appName}
                      width={300}
                      height={300}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full text-sm text-center px-3 bg-gray-100 text-gray-500">
                      No Thumbnail
                    </div>
                  )}
                </div>
                <h4 className="text-gray-700 text-xl font-medium truncate max-w-full">
                  {appName}
                </h4>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
