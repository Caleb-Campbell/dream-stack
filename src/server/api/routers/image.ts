import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { uploadImage, deleteImage } from "~/lib/cloudflare/images";

export const imageRouter = createTRPCRouter({
  upload: publicProcedure
    .input(
      z.object({
        file: z.instanceof(Blob),
        filename: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const response = await uploadImage(input.file, input.filename);
      return response;
    }),

  delete: publicProcedure
    .input(z.object({ imageId: z.string() }))
    .mutation(async ({ input }) => {
      await deleteImage(input.imageId);
      return { success: true };
    }),
}); 