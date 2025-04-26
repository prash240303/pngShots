"use client";

import { ImageType } from "@/types";
import { getTransformedUrl } from "@/lib/imagekit";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Link } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
interface ImageListProps {
  images: ImageType[];
  onImageDelete: (id: string) => void;
}

export default function ImageList({ images, onImageDelete }: ImageListProps) {
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);

  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch("/api/images", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      toast("Image deleted successfully");

      onImageDelete(fileId);
    } catch (error) {
      console.error("Error deleting image:", error);
      toast("Error deleting image");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("URL copied to clipboard");
  };

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No images found</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card key={image.fileId} className="overflow-hidden">
            <CardHeader className="p-0">
              <AspectRatio ratio={4 / 3}>
                <Image
                  src={getTransformedUrl(image.url, {
                    width: 400,
                    quality: 80,
                  })}
                  alt={image.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedImage(image)}
                />
              </AspectRatio>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-base truncate" title={image.name}>
                {image.name}
              </CardTitle>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(image.url)}
              >
                <Link className="h-4 w-4 mr-2" />
                Copy URL
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the image from your gallery.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(image.fileId)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
      >
        {selectedImage && (
          <DialogContent className="max-w-4xl w-[90vw]">
            <div className="relative w-full h-[70vh]">
              <Image
                src={selectedImage.url}
                alt={selectedImage.name}
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />
            </div>
            <div className="mt-2">
              <h2 className="text-xl font-semibold">{selectedImage.name}</h2>
              <div className="flex items-center justify-between mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(selectedImage.url)}
                >
                  <Link className="h-4 w-4 mr-2" />
                  Copy URL
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
