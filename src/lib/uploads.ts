// Shared by /api/upload (server) and ImageUploader (client-side pre-checks).

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Returns a user-facing problem with the file, or null if it can be uploaded. */
export function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `${file.name}: only JPEG, PNG or WebP images are allowed.`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `${file.name}: images must be 5 MB or smaller.`;
  }
  return null;
}
