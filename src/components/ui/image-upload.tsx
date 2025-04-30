import { useState } from "react";
import { getImageUrl } from "~/lib/cloudflare/images";

interface ImageUploadProps {
  onUploadComplete: (imageUrl: string) => void;
  variant?: string;
  className?: string;
}

export function ImageUpload({ onUploadComplete, variant = "public", className = "" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      interface UploadResponse {
        result: {
          id: string;
        };
      }
      const data = await response.json() as UploadResponse;
      const imageUrl = getImageUrl(data.result.id);
      onUploadComplete(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg
            className="w-8 h-8 mb-4 text-gray-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 10MB)</p>
        </div>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>
      {isUploading && (
        <div className="text-sm text-gray-500">Uploading...</div>
      )}
      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}
    </div>
  );
}
