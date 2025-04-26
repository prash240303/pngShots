"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, X, Crop } from "lucide-react";
import { toast } from "sonner";

import {
  FixedCropper,
  FixedCropperRef,
  ImageRestriction,
} from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import { AuthParams } from "@/types";
import { AppNameSelector } from "@/components/AppNameSelector";
import Image from "next/image";

export default function ImageUploader({
  onUploadComplete,
}: {
  onUploadComplete: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [title, setTitle]= useState("")
  const [tags, setTags] = useState<string>("");
  const [app, setApp] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<FixedCropperRef>(null);
  const [cropping, setCropping] = useState(false);

  const handleCropDone = () => {
    if (cropperRef.current) {
      const canvas = cropperRef.current.getCanvas();
      if (canvas) {
        const croppedDataUrl = canvas.toDataURL(file?.type || "image/png");
        setPreview(croppedDataUrl);
      }
    }
    setCropping(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
        setCropping(true);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setFileName("");
    setTags("");
    setApp("");
    setTitle("");
    setProgress(0);
    setCropping(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast("No file selected");
      return;
    }

    if (!app) {
      toast("App name required");
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
    if (!publicKey) {
      toast("Configuration Error");
      return;
    }

    try {
      setUploading(true);
      setProgress(10);

      const authResponse = await fetch("/api/auth/imagekit");
      if (!authResponse.ok) {
        throw new Error("Failed to get authentication parameters");
      }
      const authParams: AuthParams = await authResponse.json();
      setProgress(30);

      let finalFile = file;

      if (preview && !cropping) {
        // Convert DataURL to Blob
        const res = await fetch(preview);
        const blob = await res.blob();
        finalFile = new File([blob], fileName, { type: blob.type });
      }

      const formData = new FormData();
      formData.append("file", finalFile);
      formData.append("fileName", fileName);
      formData.append("publicKey", publicKey);
      formData.append("token", authParams.token);
      formData.append("expire", authParams.expire.toString());
      formData.append("signature", authParams.signature);
      formData.append("useUniqueFileName", "true");

      const tagsList = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag)
        .join(",");
      if (tagsList) {
        formData.append("tags", tagsList);
      }
      if (app || title) {
        const metadata = {
          ...(app && { app: app.trim() }),
          ...(title && { title }),
        };
        formData.append("customMetadata", JSON.stringify(metadata));
      }
      

      setProgress(50);

      const uploadResponse = await fetch(
        "https://upload.imagekit.io/api/v1/files/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      setProgress(90);

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        console.error("Upload error response:", errorData);
        throw new Error(errorData.message || "Upload failed");
      }

      await uploadResponse.json();

      setProgress(100);
      toast("Upload successful");

      onUploadComplete();
      resetForm();
    } catch (error) {
      console.error("Upload error:", error);
      toast("Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">Select Image</Label>
            <input
              ref={fileInputRef}
              id="image"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>

          {preview && cropping && (
            <div className="mt-4">
              <FixedCropper
                ref={cropperRef}
                src={preview}
                className="cropper border border-border rounded-lg"
                stencilProps={{
                  handlers: false,
                  lines: false,
                  movable: false,
                  resizable: false,
                }}
                stencilSize={{
                  width: 300,
                  height: 500, // 3:5 
                }}
                imageRestriction={ImageRestriction.stencil}
              />
              <Button
                type="button"
                onClick={handleCropDone}
                className="mt-3 w-full"
              >
                <Crop className="w-4 h-4 mr-2" />
                Done Cropping
              </Button>
            </div>
          )}

          {preview && !cropping && (
            <div className="relative mt-4 rounded-lg overflow-hidden border border-border">
              <Image
                src={preview}
                alt="Preview"
                width={500}
                height={500}
                className="w-full max-h-[300px] object-contain bg-secondary/20"
              />
              {!uploading && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={resetForm}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {file && !cropping && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <AppNameSelector
                value={app}
                onChange={setApp}
                disabled={uploading}
              />

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  disabled={uploading}
                  placeholder="Enter tags separated by commas"
                />
              </div>
            </>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Upload Progress</Label>
                <span className="text-xs text-muted-foreground">
                  {progress}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!file || uploading || cropping}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
