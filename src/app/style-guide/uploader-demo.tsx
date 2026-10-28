"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/shared/image-uploader";

// Temporary: exercises ImageUploader + /api/upload (step 17). Log in as a landlord first.
export function UploaderDemo() {
  const [urls, setUrls] = useState<string[]>([]);

  return (
    <div className="space-y-4">
      <ImageUploader value={urls} onChange={setUrls} />
      <pre className="overflow-x-auto rounded-2xl bg-secondary p-4 text-xs">
        {JSON.stringify(urls, null, 2)}
      </pre>
    </div>
  );
}
