import { z } from 'zod';

export const ImageDTO = z.object({
  id: z.string(),
  filename: z.string(),
  url: z.string(),
});
export type ImageDTO = z.infer<typeof ImageDTO>;

// Images are uploaded directly to storage by the client; this registers the
// resulting asset (filename + url) as an ImageBlob owned by the caller.
export const CreateImageDTO = ImageDTO.omit({ id: true });
export type CreateImageDTO = z.infer<typeof CreateImageDTO>;
