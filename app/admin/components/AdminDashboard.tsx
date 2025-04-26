"use client";

import { useState, useEffect } from "react";
import { ImageType } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ImageUploader from "@/components/admin/ImageUploader";
import ImageList from "@/components/admin/ImageList";
import { Layers } from "lucide-react";

interface AdminDashboardProps {
  initialImages: ImageType[];
}

export default function AdminDashboard({ initialImages }: AdminDashboardProps) {
  const [images, setImages] = useState<ImageType[]>(initialImages);

  const refreshImages = async () => {
    try {
      const response = await fetch("/api/images");
      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error("Error refreshing images:", error);
    } 
  };

  const handleImageDelete = (fileId: string) => {
    setImages(images.filter(image => image.fileId !== fileId));
  };

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your image gallery - upload new images and organize your collection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Image</CardTitle>
              <CardDescription>
                Add new images to your gallery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader onUploadComplete={refreshImages} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layers className="mr-2 h-5 w-5" />
                Your Images
              </CardTitle>
              <CardDescription>
                Manage and organize your gallery images
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageList 
                images={images} 
                onImageDelete={handleImageDelete} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}