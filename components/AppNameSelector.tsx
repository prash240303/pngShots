"use client";

import { useEffect, useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { AuthParams } from "@/types";
import { toast } from "sonner";

import Image from "next/image";
import { Input } from "./ui/input";

interface AppNameSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const AppNameSelector = ({
  value,
  onChange,
  disabled,
}: AppNameSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [newAppName, setNewAppName] = useState("");
  const [existingApps, setExistingApps] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddingNewApp, setIsAddingNewApp] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppNames = async () => {
      try {
        const res = await fetch("/api/appnames");
        if (!res.ok) throw new Error("Failed to fetch app names");
        const apps = await res.json();
        setExistingApps(apps);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAppNames();
  }, []);

  const handleSelect = (appName: string) => {
    onChange(appName);
    setOpen(false);
  };

  const handleThumbnailUpload = async () => {
    try {
      setUploading(true);
      setProgress(10);

      const authResponse = await fetch("/api/auth/imagekit");
      if (!authResponse.ok) {
        throw new Error("Failed to get authentication parameters");
      }
      const authParams: AuthParams = await authResponse.json();
      setProgress(30);

      const originalFile = fileInputRef.current?.files?.[0];
      if (!originalFile) {
        throw new Error("No file selected");
      }

      let finalFile: File;

      if (preview) {
        const res = await fetch(preview);
        const blob = await res.blob();
        finalFile = new File([blob], `${newAppName.trim()}.jpg`, {
          type: blob.type,
        });
      } else {
        finalFile = new File([originalFile], `${newAppName.trim()}.jpg`, {
          type: originalFile.type,
        });
      }
      const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
      if (!publicKey) {
        toast("Configuration Error");
        return;
      }

      const formData = new FormData();
      formData.append("file", finalFile);
      formData.append("fileName", `${newAppName.trim()}.jpg`);
      formData.append("publicKey", publicKey);
      formData.append("token", authParams.token);
      formData.append("expire", authParams.expire.toString());
      formData.append("signature", authParams.signature);
      formData.append("useUniqueFileName", "true");

      formData.append("folder", "/thumbnail");
      if (newAppName.trim()) {
        formData.append("customMetadata", `{"app":"${newAppName.trim()}"}`);
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

      setProgress(100);
      toast("thumbnail Upload successful");

      onChange(newAppName.trim());
      setNewAppName("");
      setIsAddingNewApp(false);
      setPreview(null);
      fileInputRef.current!.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      toast("Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleAddNewApp = () => {
    setIsAddingNewApp(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="space-y-2">
      <Label>App Name *</Label>
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" disabled={disabled}>
              {value ? value : "Select App Name"}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-2 space-y-1">
            {existingApps.map((app) => (
              <Button
                key={app}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleSelect(app)}
              >
                {app}
                {value === app && (
                  <Check className="ml-auto h-4 w-4 text-primary" />
                )}
              </Button>
            ))}

            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={handleAddNewApp}
              disabled={disabled}
            >
              Add New App
            </Button>

            {isAddingNewApp && (
              <div className="pt-2 border-t border-border space-y-2">
                <div className="space-y-2">
                  <Label htmlFor="appname">New App Name</Label>
                  <Input
                    name="appname"
                    placeholder="New app name"
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    disabled={disabled}
                  />
                </div>

                <Input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={disabled}
                />

                {preview && (
                  <Image
                    width={500}
                    height={500}
                    src={preview}
                    alt="Thumbnail Preview"
                    className="w-full rounded-md object-cover h-32 border"
                  />
                )}

                <Button
                  onClick={handleThumbnailUpload}
                  className="w-full"
                  disabled={
                    !newAppName.trim() ||
                    !fileInputRef.current?.files?.[0] ||
                    disabled
                  }
                >
                  {uploading
                    ? `Uploading... ${progress}%`
                    : `Upload Thumbnail & Add "${newAppName || "New App"}"`}
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
