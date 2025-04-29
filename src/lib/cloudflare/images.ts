import { env } from "~/env";

// Client-safe variables
export const CLOUDFLARE_IMAGES_ACCOUNT_ID = env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_ID;

// Helper function to get server-side only variables
const getServerConfig = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Server-side configuration cannot be accessed on the client');
  }
  return {
    apiToken: env.CLOUDFLARE_IMAGES_API_TOKEN,
    accountId: env.CLOUDFLARE_IMAGES_ACCOUNT_ID,
  };
};

export interface CloudflareImageUploadResponse {
  result: {
    id: string;
    filename: string;
    uploaded: string;
    requireSignedURLs: boolean;
    variants: string[];
  };
  success: boolean;
  errors: string[];
  messages: string[];
}

export interface CloudflareImageVariant {
  id: string;
  options: {
    fit: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
    width?: number;
    height?: number;
    gravity?: 'auto' | 'side' | 'left' | 'right' | 'top' | 'bottom' | 'center';
    metadata?: 'keep' | 'copyright' | 'none';
    background?: string;
  };
}

// This function should only be called from the server
export async function uploadImage(file: Blob, filename: string): Promise<CloudflareImageUploadResponse> {
  const formData = new FormData();
  formData.append("file", file, filename);

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_IMAGES_ACCOUNT_ID}/images/v1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.CLOUDFLARE_IMAGES_API_TOKEN}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error("Failed to upload image to Cloudflare Images");
  }

  const data = await response.json();
  return data.result;
}

// This function is safe to call from the client
export function getImageUrl(imageId: string): string {
  return `https://imagedelivery.net/${env.CLOUDFLARE_IMAGES_ACCOUNT_ID}/${imageId}/public`;
}

// This function should only be called from the server
export async function deleteImage(imageId: string): Promise<void> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_IMAGES_ACCOUNT_ID}/images/v1/${imageId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${env.CLOUDFLARE_IMAGES_API_TOKEN}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete image from Cloudflare Images");
  }
}

// Predefined variants for common use cases
export const IMAGE_VARIANTS = {
  thumbnail: {
    id: 'thumbnail',
    options: {
      fit: 'cover',
      width: 150,
      height: 150,
    },
  },
  medium: {
    id: 'medium',
    options: {
      fit: 'contain',
      width: 800,
    },
  },
  large: {
    id: 'large',
    options: {
      fit: 'contain',
      width: 1200,
    },
  },
} as const; 