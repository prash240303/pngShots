"use client";

import { ImageType } from "@/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface AppsPageClientProps {
  appName: string;
}

export function AppsPageClient({ appName }: AppsPageClientProps) {
  const [images, setImages] = useState<ImageType[]>([]);
  const [thumbnails, setThumbnails] = useState<ImageType[]>([]);
  const [thumbnailsLoading, setThumbnailsLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

  const imageFiles = images.filter((item): item is ImageType => {
    return item.type === "file";
  });

  const groupedImages = imageFiles.reduce((acc, image) => {
    const customMetadata = image.customMetadata as { app?: string } | undefined;
    const category = customMetadata?.app || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(image);
    return acc;
  }, {} as Record<string, ImageType[]>);

  const appImages = groupedImages[appName] || [];

  // Tag filtering logic
  const allTags = Array.from(
    appImages.reduce((acc, img) => {
      (img.tags || []).forEach((tag) => acc.add(tag));
      return acc;
    }, new Set<string>())
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredImages =
    selectedTags.length > 0
      ? appImages.filter((img) =>
          selectedTags.some((tag) => img.tags?.includes(tag))
        )
      : appImages;

  return (
    <div className="container bg-[#F5F5F5] mx-auto py-8">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md mb-4">
          {thumbnailsLoading ? (
            <div className="w-full h-full animate-pulse bg-gray-200" />
          ) : appThumbnail ? (
            <Image
              src={appThumbnail.url}
              alt={appName}
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center text-xs text-gray-400 bg-gray-100 w-full h-full">
              No Thumbnail
            </div>
          )}
        </div>
        <h1 className="text-3xl font-bold">
          {appName.charAt(0).toUpperCase() + appName.slice(1)}
        </h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
          <span className="bg-gray-200 px-2 py-0.5 rounded-full text-xs font-medium text-gray-800">
            Apple Design Awards
          </span>
          <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium text-gray-800">
            Utilities
          </span>
          <span className="text-sm text-gray-500">
            ({filteredImages.length} images)
          </span>
        </div>
      </div>

      {/* Tags filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {allTags.map((tag, index) => (
            <Badge
              key={index}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
          {selectedTags.length > 0 && (
            <Badge
              variant="destructive"
              className="cursor-pointer"
              onClick={() => setSelectedTags([])}
            >
              Clear filters
            </Badge>
          )}
        </div>
      )}

      {filteredImages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Loading images...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {filteredImages.map((image) => (
            <div
              key={image.fileId}
              className="rounded-3xl group bg-[#FAFAFA] dark:bg-[#111] border border-[#eee] hover:shadow-md transition p-3 pt-2"
            >
              <div className="w-full mb-2 flex items-center gap-2 justify-end">
                <div className="w-6 h-6 rounded-sm overflow-hidden border border-gray-300 shadow-sm">
                  {thumbnailsLoading ? (
                    <div className="w-full h-full animate-pulse bg-gray-200" />
                  ) : appThumbnail ? (
                    <Image
                      src={appThumbnail.url}
                      alt={appName}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center text-xs text-gray-400 bg-gray-100 w-full h-full">
                      No Thumbnail
                    </div>
                  )}
                </div>
                <div className="text-sm pr-2">
                  {appName.charAt(0).toUpperCase() + appName.slice(1)}
                </div>
              </div>
              <div className="relative bg-white w-full aspect-[3/4]  rounded-xl overflow-hidden flex items-end justify-center">
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
                    <path
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                      2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 
                      2.09C13.09 3.81 14.76 3 16.5 3 
                      19.58 3 22 5.42 22 8.5c0 3.78-3.4 
                      6.86-8.55 11.54L12 21.35z"
                    />
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
