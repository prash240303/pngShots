"use client";

import { useEffect, useState } from "react";
import ImageGallery from "@/components/ImageGallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ImageType } from "@/types";

export default function Home() {
  const [images, setImages] = useState<ImageType[]>([]);
  const [thumbnails, setThumbnails] = useState<ImageType[]>([]);
  const [thumbnailsLoading, setThumbnailsLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch("/api/images");
        if (!res.ok) throw new Error("Failed to fetch images");
        const fetchedImages = await res.json();
        setImages(fetchedImages);
      } catch (error) {
        console.error(error);
      }
    }

    fetchImages();
  }, []);

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

  const imageArray = Array.isArray(images) ? images : [];

  const allTags = Array.from(
    imageArray.reduce((acc, img) => {
      (img.tags || []).forEach((tag: string) => acc.add(tag));
      return acc;
    }, new Set<string>())
  );

  const groupedByApp = imageArray.reduce((acc, image) => {
    const appName = image.customMetadata?.app || "Uncategorized";
    (acc[appName] ??= []).push(image);
    return acc;
  }, {} as Record<string, ImageType[]>);

  const filteredImages =
    selectedTags.length > 0
      ? imageArray.filter((img) =>
          selectedTags.some((tag) => img.tags && img.tags.includes(tag))
        )
      : imageArray;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const groupedEntries = Object.entries(groupedByApp) as [
    string,
    ImageType[]
  ][];
  const sortedGroupedEntries = groupedEntries.sort(([a], [b]) =>
    a.localeCompare(b)
  );

  const groupedByFirstLetter = sortedGroupedEntries.reduce<
    Record<string, Array<[string, ImageType[]]>>
  >((groups, [appName, appImages]) => {
    const firstLetter = appName.charAt(0).toUpperCase();
    (groups[firstLetter] ??= []).push([appName, appImages]);
    return groups;
  }, {});

  return (
    <div className="container bg-[#F5F5F5] mx-auto py-8">
      <Tabs defaultValue="shots" className="w-full">
        <TabsList className="flex w-full max-w-xl mx-auto mb-8">
          <TabsTrigger
            value="shots"
            className="px-4 py-2 text-sm font-medium text-gray-800 transition-colors duration-200
    data-[state=active]:text-gray-900"
          >
            Shots
          </TabsTrigger>
          <TabsTrigger
            value="apps"
            className="px-4 py-2 text-sm font-medium text-gray-800 transition-colors duration-200
    data-[state=active]:text-gray-900"
          >
            Apps
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shots" className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-6">
            {allTags.map((tag, index) => (
              <Badge
                key={index}
                variant={
                  selectedTags.includes(tag as string) ? "default" : "outline"
                }
                className="cursor-pointer"
                onClick={() => toggleTag(tag as string)}
              >
                {tag as React.ReactNode}
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
          <div className=" gap-2 p-2">
            {filteredImages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600">
                  No images found for this app.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-2">
                {filteredImages.map((image, index) => (
                  <CardUI
                    key={image.fileId}
                    image={image}
                    index={index}
                    appName={image.customMetadata?.app || "Unknown"}
                    appThumbnail={thumbnails.find(
                      (thumb) => thumb.customMetadata?.app === image.customMetadata?.app
                    )}
                    thumbnailsLoading={thumbnailsLoading}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="apps">
          <div className="space-y-12">
            {Object.entries(groupedByFirstLetter).map(([letter, apps]) => (
              <div key={letter} className="space-y-4">
                <h2 className="text-lg font-bold tracking-tight">{letter}</h2>
                <div className="flex flex-wrap w-full gap-2">
                  {apps.map(([appName, appImages]) => (
                    <div key={appName}>
                      <ImageGallery imageList={appImages} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface CardUIProps {
  image: ImageType;
  index: number;
  appName: string;
  appThumbnail?: ImageType;
  thumbnailsLoading?: boolean;
}

function CardUI({
  image,
  index,
  appName,
  appThumbnail,
  thumbnailsLoading,
}: CardUIProps) {
  return (
    <div
      key={index}
      className="rounded-3xl group bg-[#FAFAFA] dark:bg-[#111] border border-[#eee] hover:shadow-md transition p-3 pt-2"
    >
      {/* App Thumbnail & Name */}
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

      {/* Image Mockup */}
      <div className="relative bg-white w-full aspect-[3/4] rounded-xl overflow-hidden flex items-end justify-center">
        <div className="absolute group-hover:scale-105 duration-300 ease-in-out bottom-0 w-[68%] z-0">
          <Image
            src={image.url}
            alt={image.name || "Image"}
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

      {/* Title & Like */}
      <div className="flex justify-between items-center mt-4 w-full">
        <h3 className="text-sm font-semibold text-black truncate">
          {image.customMetadata?.title || "Untitled"}
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
  );
}