"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { updateAvatar } from "@/actions/user.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import {
  CameraIcon,
  CheckIcon,
  LoaderCircleIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

interface AvatarUploaderProps {
  currentImage?: string | null;
  name?: string | null;
}

/** Draw crop to canvas and return a JPEG data URL at the given output size */
function cropToDataURL(
  image: HTMLImageElement,
  crop: PixelCrop,
  outputSize = 256
): string {
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d")!;

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Draw circular clip
  ctx.beginPath();
  ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
  ctx.clip();

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    outputSize,
    outputSize
  );

  return canvas.toDataURL("image/jpeg", 0.88);
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 70 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export default function AvatarUploader({
  currentImage,
  name,
}: AvatarUploaderProps) {
  const [srcFile, setSrcFile] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage ?? null);

  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSrcFile(reader.result as string);
      setCrop(undefined);
      setOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, 1));
    },
    []
  );

  const handleSave = async () => {
    if (!imgRef.current || !completedCrop) return;

    setSaving(true);
    try {
      const dataUrl = cropToDataURL(imgRef.current, completedCrop, 256);
      const res = await updateAvatar(dataUrl);
      setPreviewUrl(dataUrl);
      toast.success(res.message);
      setOpen(false);
      setSrcFile(null);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update avatar.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSrcFile(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  return (
    <>
      {/* Clickable avatar */}
      <div className="relative group">
        <Avatar className="size-28 ring-2 ring-border shadow-lg cursor-pointer">
          <AvatarImage
            src={previewUrl ?? undefined}
            alt={name ?? "User Avatar"}
            className="object-cover"
          />
          <AvatarFallback className="text-2xl font-bold">{initials}</AvatarFallback>
        </Avatar>

        {/* Camera overlay */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1"
          title="Change avatar"
        >
          <CameraIcon className="w-6 h-6 text-white" />
          <span className="text-white text-[10px] font-medium">Change</span>
        </button>

        {/* Camera badge */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full border-2 border-background flex items-center justify-center shadow-md hover:bg-primary/80 transition-colors"
          title="Upload photo"
        >
          <CameraIcon className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Crop Modal */}
      <AnimatePresence>
        {open && srcFile && (
          <motion.div
            key="crop-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <CameraIcon className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Crop your avatar</span>
                </div>
                <button
                  onClick={handleClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Hint */}
              <p className="text-xs text-muted-foreground px-5 pt-3 pb-1">
                Drag and resize the circle to crop your photo.
              </p>

              {/* Crop area */}
              <div className="flex items-center justify-center p-4 bg-muted/30 min-h-[280px]">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                  minWidth={60}
                  minHeight={60}
                  className="max-h-[55vh] rounded-lg overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    src={srcFile}
                    alt="Crop preview"
                    onLoad={onImageLoad}
                    style={{ maxHeight: "55vh", maxWidth: "100%", objectFit: "contain" }}
                  />
                </ReactCrop>
              </div>

              {/* Preview + actions */}
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-border">
                {/* Live circular preview */}
                <div className="flex items-center gap-3">
                  <CropPreview
                    imgRef={imgRef}
                    completedCrop={completedCrop}
                  />
                  <span className="text-xs text-muted-foreground">Preview</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleClose} disabled={saving}>
                    <XIcon className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={!completedCrop || saving}
                  >
                    {saving ? (
                      <LoaderCircleIcon className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <CheckIcon className="w-4 h-4 mr-1" />
                    )}
                    {saving ? "Saving..." : "Save Avatar"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Small live canvas preview of the cropped circle */
function CropPreview({
  imgRef,
  completedCrop,
}: {
  imgRef: React.RefObject<HTMLImageElement | null>;
  completedCrop?: PixelCrop;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Update canvas whenever crop changes
  if (canvasRef.current && imgRef.current && completedCrop?.width) {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const SIZE = 52;
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
      ctx.clip();
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;
      ctx.drawImage(
        img,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        SIZE,
        SIZE
      );
    }
  }

  return (
    <canvas
      ref={canvasRef}
      className="rounded-full border-2 border-border shadow-sm"
      style={{ width: 52, height: 52 }}
    />
  );
}
