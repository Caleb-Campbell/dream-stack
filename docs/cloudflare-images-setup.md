# Cloudflare Images Setup Guide

## Prerequisites

1. Cloudflare account
2. Access to Cloudflare dashboard
3. Domain added to Cloudflare (optional but recommended)

## Step 1: Find Your Account ID

Your Account ID (also called Account Hash) is required for the configuration. Here's how to find it:

### Method 1: From Dashboard URL
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Look at your browser's URL
3. The Account ID is the string after `https://dash.cloudflare.com/`
   - Example: `https://dash.cloudflare.com/1234567890abcdef`
   - Your Account ID would be: `1234567890abcdef`

### Method 2: From Account Home
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click on your account name in the top right
3. Select "Account Home"
4. Your Account ID is displayed under "Account ID"

## Step 2: Create API Token

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Click "Create Custom Token"
4. Configure the token:
   - **Token Name**: `Images API Token` (or any descriptive name)
   - **Permissions**:
     - Account > Images > Edit
   - **Account Resources**:
     - Include > All accounts
5. Click "Create Token"
6. **IMPORTANT**: Copy the token immediately - you won't be able to see it again!

## Step 3: Enable Cloudflare Images

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to Images
3. Click "Enable Images"
4. Note: You may need to add a payment method if you haven't already

## Step 4: Configure Environment Variables

### Server-Side Variables
These variables are only accessible on the server and should never be exposed to the client:

```env
# Server-side only
CLOUDFLARE_IMAGES_API_TOKEN=your_api_token_here
```

### Client-Side Variables
These variables are safe to expose to the client and are prefixed with `NEXT_PUBLIC_`:

```env
# Client-safe
NEXT_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_ID=your_account_id_here
```

### Important Security Notes
1. Never expose your API token to the client
2. The Account ID is safe to expose as it's required for image URLs
3. All image uploads and deletions must be handled server-side
4. Use API routes or server actions for image operations

## Step 5: API Usage

### Server-Side Functions
These functions should only be called from the server:

```typescript
// Server-side only
import { uploadImage, deleteImage } from "~/lib/cloudflare/images";

// Example: Upload image (server-side only)
const response = await uploadImage(file, filename);

// Example: Delete image (server-side only)
await deleteImage(imageId);
```

### Client-Side Functions
These functions are safe to use on the client:

```typescript
// Client-safe
import { getImageUrl } from "~/lib/cloudflare/images";

// Example: Get image URL (client-safe)
const imageUrl = getImageUrl(imageId, variant);
```

## Step 6: Implementation Example

### Server Action (API Route)
```typescript
// pages/api/images/upload.ts
import { uploadImage } from "~/lib/cloudflare/images";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await uploadImage(req.body.file, req.body.filename);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Client Component
```typescript
// components/ImageUpload.tsx
import { useState } from 'react';
import { getImageUrl } from "~/lib/cloudflare/images";

export function ImageUpload() {
  const [imageUrl, setImageUrl] = useState<string>();

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name);

    const response = await fetch('/api/images/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    setImageUrl(getImageUrl(data.result.id, 'thumbnail'));
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
      {imageUrl && <img src={imageUrl} alt="Uploaded" />}
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **"Attempted to access a server-side environment variable on the client"**
   - Ensure you're using `NEXT_PUBLIC_` prefix for client variables
   - Move server-side operations to API routes
   - Check for direct imports of server-side functions

2. **Invalid Account ID**
   - Verify the Account ID is correct
   - Check for any typos
   - Ensure you're using the Account ID, not the Zone ID

3. **Invalid API Token**
   - Verify the token has the correct permissions
   - Check for any typos
   - Create a new token if needed

4. **Images Not Loading**
   - Check if Images service is enabled
   - Verify your account has sufficient quota
   - Check network requests in browser dev tools

## Security Best Practices

1. **API Token Security**
   - Never commit tokens to version control
   - Use environment variables
   - Rotate tokens regularly
   - Use minimal required permissions

2. **Environment Variables**
   - Keep `.env` in `.gitignore`
   - Use different tokens for development/production
   - Consider using a secrets management service

3. **Access Control**
   - Implement proper authentication
   - Validate user permissions
   - Use signed URLs when needed

## Additional Resources

- [Cloudflare Images Documentation](https://developers.cloudflare.com/images/)
- [API Token Documentation](https://developers.cloudflare.com/api/tokens/create/)
- [Account Management](https://developers.cloudflare.com/fundamentals/account-and-billing/account-setup/)
- [Image Optimization Guide](https://developers.cloudflare.com/images/image-resizing/)

## Available Image Variants

The following variants are predefined:

1. `thumbnail`
   - Size: 150x150
   - Fit: cover

2. `medium`
   - Width: 800px
   - Fit: contain

3. `large`
   - Width: 1200px
   - Fit: contain

## API Functions

### Upload Image

```typescript
import { uploadImage } from "~/lib/cloudflare/images";

const response = await uploadImage(file, filename);
```

### Get Image URL

```typescript
import { getImageUrl } from "~/lib/cloudflare/images";

const imageUrl = getImageUrl(imageId, variant);
```

### Delete Image

```typescript
import { deleteImage } from "~/lib/cloudflare/images";

await deleteImage(imageId);
```

## Best Practices

1. **Image Optimization**
   - Use appropriate variants for different use cases
   - Consider using WebP format for better compression
   - Set appropriate quality levels

2. **Error Handling**
   - Always handle upload errors gracefully
   - Implement retry logic for failed uploads
   - Validate file types and sizes

3. **Security**
   - Keep API tokens secure
   - Implement proper access control
   - Validate user permissions

4. **Performance**
   - Use CDN caching
   - Implement lazy loading
   - Consider using blur placeholders

## Troubleshooting

### Common Issues

1. **Upload Failures**
   - Check API token permissions
   - Verify account ID
   - Check file size limits

2. **Image Display Issues**
   - Verify variant configuration
   - Check CDN cache
   - Validate image URLs

3. **Authentication Errors**
   - Verify API token
   - Check token expiration
   - Validate permissions

## Additional Resources

- [Cloudflare Images Documentation](https://developers.cloudflare.com/images/)
- [Image Optimization Guide](https://developers.cloudflare.com/images/image-resizing/)
- [API Reference](https://developers.cloudflare.com/api/operations/cloudflare-images-upload-image) 