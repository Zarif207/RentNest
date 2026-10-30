"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Link2, Loader2, RotateCcw, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ALLOWED_IMAGE_TYPES, validateImageFile } from "@/lib/uploads";
import { cn } from "@/lib/utils";

type PendingUpload = {
  id: string;
  file: File;
  /** Local blob: URL for the preview while uploading. */
  preview: string;
  progress: number;
  error?: string;
};

type ImageUploaderProps = {
  /** Image URLs; the first one is the cover. */
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  invalid?: boolean;
  id?: string;
};

/** POSTs one file to /api/upload; XHR (not fetch) so we get upload progress. */
function uploadImage(file: File, onProgress: (percent: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      let body: { url?: string; message?: string } | null = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // Non-JSON (e.g. a platform 413 page); handled below.
      }
      if (xhr.status >= 200 && xhr.status < 300 && body?.url) {
        resolve(body.url);
      } else {
        reject(
          new Error(
            body?.message ??
              (xhr.status === 413 ? "This image is too large to upload." : "Upload failed. Please try again."),
          ),
        );
      }
    };
    xhr.onerror = () => reject(new Error("Network error. Check your connection and try again."));
    const form = new FormData();
    form.append("image", file);
    xhr.send(form);
  });
}

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Controlled image picker for React Hook Form (outputs string[]): drag-and-drop
 * or browse, per-file progress, remove, "set as cover", or paste a URL.
 */
export function ImageUploader({ value, onChange, max = 8, invalid, id }: ImageUploaderProps) {
  const [uploads, setUploads] = useState<PendingUpload[]>([]);
  const [dragging, setDragging] = useState(false);
  const [pastedUrl, setPastedUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Uploads finish asynchronously; append to the latest value, not a stale one.
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);

  const append = (url: string) => {
    const next = [...latest.current, url];
    latest.current = next;
    onChange(next);
  };

  const activeUploads = uploads.filter((upload) => !upload.error).length;
  const remaining = max - value.length - activeUploads;

  const updateUpload = (uploadId: string, patch: Partial<PendingUpload>) =>
    setUploads((list) => list.map((upload) => (upload.id === uploadId ? { ...upload, ...patch } : upload)));

  const dropUpload = (upload: PendingUpload) => {
    URL.revokeObjectURL(upload.preview);
    setUploads((list) => list.filter((item) => item.id !== upload.id));
  };

  const start = (upload: PendingUpload) => {
    uploadImage(upload.file, (progress) => updateUpload(upload.id, { progress }))
      .then((url) => {
        append(url);
        dropUpload(upload);
      })
      .catch((error: Error) => updateUpload(upload.id, { error: error.message }));
  };

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    let slots = remaining;
    const accepted: PendingUpload[] = [];

    for (const file of Array.from(files)) {
      const problem = validateImageFile(file);
      if (problem) {
        toast.error(problem);
        continue;
      }
      if (slots <= 0) {
        toast.error(`You can add up to ${max} images.`);
        break;
      }
      slots -= 1;
      accepted.push({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file), progress: 0 });
    }

    if (accepted.length === 0) return;
    setUploads((list) => [...list, ...accepted]);
    accepted.forEach(start);
  };

  const retry = (upload: PendingUpload) => {
    if (remaining <= 0) {
      toast.error(`You can add up to ${max} images.`);
      return;
    }
    const reset = { ...upload, error: undefined, progress: 0 };
    updateUpload(upload.id, { error: undefined, progress: 0 });
    start(reset);
  };

  const addPastedUrl = () => {
    const url = pastedUrl.trim();
    if (!isHttpsUrl(url)) return setUrlError("Enter a full https:// image link.");
    if (value.includes(url)) return setUrlError("That image is already added.");
    if (remaining <= 0) return setUrlError(`You can add up to ${max} images.`);
    append(url);
    setPastedUrl("");
    setUrlError(null);
  };

  const setCover = (url: string) => onChange([url, ...value.filter((item) => item !== url)]);
  const remove = (url: string) => onChange(value.filter((item) => item !== url));

  return (
    <div className="space-y-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragging ? "border-foreground bg-secondary" : "border-border",
          invalid && "border-destructive",
        )}
      >
        <span className="grid size-14 place-items-center rounded-full bg-secondary">
          <ImagePlus className="size-6 text-muted-foreground" aria-hidden />
        </span>
        <p className="mt-4 font-medium">Drag photos here</p>
        <p className="mt-1 text-sm text-muted-foreground">
          JPEG, PNG or WebP · up to 5 MB each · {value.length + activeUploads}/{max} added
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          disabled={remaining <= 0}
          onClick={() => fileInput.current?.click()}
        >
          Browse files
        </Button>
        <input
          ref={fileInput}
          id={id}
          type="file"
          multiple
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              type="url"
              value={pastedUrl}
              onChange={(event) => {
                setPastedUrl(event.target.value);
                setUrlError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addPastedUrl();
                }
              }}
              placeholder="…or paste an image URL"
              aria-label="Image URL"
              aria-invalid={Boolean(urlError)}
              className="pl-9"
            />
          </div>
          <Button type="button" variant="outline" onClick={addPastedUrl} disabled={!pastedUrl.trim()}>
            Add
          </Button>
        </div>
        {urlError && <p className="text-sm text-destructive">{urlError}</p>}
      </div>

      {(value.length > 0 || uploads.length > 0) && (
        // Bento: the cover photo takes a 2×2 tile, the rest fill around it.
        <ul className="grid auto-rows-[7rem] grid-cols-2 gap-3 sm:auto-rows-[8.5rem] sm:grid-cols-4" aria-label="Selected images">
          {value.map((url, index) => (
            <li
              key={url}
              className={cn("group relative overflow-hidden rounded-2xl bg-muted", index === 0 && "col-span-2 row-span-2")}
            >
              <Image
                src={url}
                alt={`Property photo ${index + 1}`}
                fill
                sizes={index === 0 ? "(min-width: 640px) 360px, 100vw" : "200px"}
                className="object-cover"
              />
              {index === 0 && (
                <span className="absolute bottom-2 left-2 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium shadow-sm">
                  Cover
                </span>
              )}
              <div className="absolute top-2 right-2 flex gap-1.5">
                {index > 0 && (
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="secondary"
                    aria-label={`Set photo ${index + 1} as cover`}
                    title="Set as cover"
                    onClick={() => setCover(url)}
                  >
                    <Star />
                  </Button>
                )}
                <Button
                  type="button"
                  size="icon-xs"
                  variant="secondary"
                  aria-label={`Remove photo ${index + 1}`}
                  title="Remove"
                  onClick={() => remove(url)}
                >
                  <X />
                </Button>
              </div>
            </li>
          ))}

          {uploads.map((upload) => (
            <li key={upload.id} className="relative overflow-hidden rounded-2xl bg-muted">
              {/* Blob previews can't go through the image loader. */}
              <Image src={upload.preview} alt="" fill unoptimized className="object-cover opacity-50" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/40 p-3 text-center">
                {upload.error ? (
                  <>
                    <p className="text-xs font-medium text-destructive">{upload.error}</p>
                    <div className="flex gap-1.5">
                      <Button type="button" size="xs" onClick={() => retry(upload)}>
                        <RotateCcw /> Retry
                      </Button>
                      <Button type="button" size="xs" variant="secondary" onClick={() => dropUpload(upload)}>
                        Remove
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Loader2 className="size-6 animate-spin" aria-hidden />
                    <span className="text-xs font-medium" aria-live="polite">
                      Uploading {upload.progress}%
                    </span>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
