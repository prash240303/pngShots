"use client";

import { useEffect, useState } from "react";
import ImageGallery from "@/components/ImageGallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ImageType } from "@/types";

export default function Home() {
  const [images, setImages] = useState<ImageType[]>([]);
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
    <div className="container bg-[#FAFAFA] mx-auto py-8">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-2">
            {filteredImages.map((image, index) => (
              <div
                key={index}
                className="rounded-md overflow-hidden border border-gray-200 bg-white hover:shadow-sm transition-all duration-200"
              >
                <div className="relative aspect-[5/6] bg-gray-100">
                  <Image
                    src={image.url}
                    alt={image.name || "Image"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 440px) 50vw, (max-width: 990px) 12vw, 14vw"
                  />
                </div>

                <div className="p-3">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {image.customMetadata?.title || "Untitled"}
                  </h3>
                </div>
              </div>
            ))}
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
