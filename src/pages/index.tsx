import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

import { api } from "~/utils/api";
import { ImageUpload } from "~/components/ui/image-upload";

export default function Home() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });
  const [uploadedImages, setUploadedImages] = useState<{ url: string; variant: string }[]>([]);

  const handleImageUpload = (imageUrl: string, variant: string) => {
    setUploadedImages((prev) => [...prev, { url: imageUrl, variant }]);
  };

  return (
    <>
      <Head>
        <title>Cloudflare Images Demo</title>
        <meta name="description" content="Demo of Cloudflare Images integration" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Cloudflare <span className="text-[hsl(280,100%,70%)]">Images</span> Demo
          </h1>

          {/* Image Upload Demo */}
          <div className="w-full max-w-2xl space-y-8 rounded-xl bg-white/10 p-8">
            <h2 className="text-2xl font-bold text-white">Image Upload Demo</h2>
            
            {/* Thumbnail Upload */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Thumbnail (150x150)</h3>
              <ImageUpload
                onUploadComplete={(url) => handleImageUpload(url, "thumbnail")}
                variant="thumbnail"
                className="bg-white/5"
              />
            </div>

            {/* Medium Upload */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Medium (800px width)</h3>
              <ImageUpload
                onUploadComplete={(url) => handleImageUpload(url, "medium")}
                variant="medium"
                className="bg-white/5"
              />
            </div>

            {/* Large Upload */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Large (1200px width)</h3>
              <ImageUpload
                onUploadComplete={(url) => handleImageUpload(url, "large")}
                variant="large"
                className="bg-white/5"
              />
            </div>
          </div>

          {/* Display Uploaded Images */}
          {uploadedImages.length > 0 && (
            <div className="w-full max-w-4xl space-y-8 rounded-xl bg-white/10 p-8">
              <h2 className="text-2xl font-bold text-white">Uploaded Images</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="space-y-2">
                    <div className="relative aspect-square overflow-hidden rounded-lg">
                      <Image
                        src={image.url}
                        alt={`Uploaded image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm text-white/80">Variant: {image.variant}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
              {hello.data ? hello.data.greeting : "Loading tRPC query..."}
            </p>
            <AuthShowcase />
          </div>
        </div>
      </main>
    </>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.post.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
}
