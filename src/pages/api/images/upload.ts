import type { NextApiRequest, NextApiResponse } from "next";
import { uploadImage } from "~/lib/cloudflare/images";
import formidable from "formidable";
import type { File } from "formidable";
import { createReadStream } from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({});
    
    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Create a Blob from the file
    const fileStream = createReadStream(file.filepath);
    const chunks: Buffer[] = [];

    for await (const chunk of fileStream) {
      chunks.push(Buffer.from(chunk));
    }

    const buffer = Buffer.concat(chunks);
    const blob = new Blob([buffer], { type: file.mimetype || 'application/octet-stream' });

    // Upload to Cloudflare
    const response = await uploadImage(blob, file.originalFilename || 'unnamed');
    res.status(200).json(response);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to upload image" 
    });
  }
} 