"use client";

import { useEffect, useState } from "react";
import ImageGallery from "@/components/ImageGallery";
import { ImageType } from "@/types";
import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppsPage() {
  const [images, setImages] = useState<ImageType[]>([]);
  const pathname = usePathname();

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

  const groupedByApp = imageArray.reduce((acc, image) => {
    const appName = image.customMetadata?.app || "Uncategorized";
    (acc[appName] ??= []).push(image);
    return acc;
  }, {} as Record<string, ImageType[]>);

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
      <header className=" z-50 bg-transparent mb-4">
        <div className="container mx-auto flex items-end justify-between px-6 pb-4">
          {/* Left Navigation */}
          <nav className="flex items-center space-x-8">
            <Link
              href="/shots"
              className={`text-sm font-medium transition-colors hover:text-gray-900 ${
                pathname === "/shots" || pathname === "/"
                  ? "text-gray-900"
                  : "text-gray-600"
              }`}
            >
              Shots
            </Link>
            <Link
              href="/apps"
              className={`text-sm font-medium transition-colors hover:text-gray-900 ${
                pathname === "/apps" ? "text-gray-900" : "text-gray-600"
              }`}
            >
              Apps
            </Link>
          </nav>

          {/* Center Logo */}
          <Link href="/" className="flex items-center justify-center">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">.png</span>
            </div>
          </Link>

          {/* Right Navigation */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="p-2">
                <Search className="h-4 w-4 text-gray-600" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <MoreHorizontal className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>
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
    </div>
  );
}
