import { z } from "zod";
import { looksLikeYoutubeUrl } from "@/lib/media-ingest";

export const emailSchema = z.string().trim().email("Enter a valid email.").max(254);
export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128, "Password is too long.");
export const nameSchema = z.string().trim().min(1, "Name is required.").max(80);
export const accessTokenSchema = z
  .string()
  .trim()
  .min(10, "Token looks too short.")
  .max(8192, "Token is too long.");

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required.").max(128),
});

export const inviteEmailSchema = emailSchema;

export const ingestMediaSchema = z.object({
  kind: z.enum(["image", "video"]),
  filename: z.string().trim().min(1).max(240),
  mime: z.string().trim().max(80),
  size: z.number().int().nonnegative(),
  durationSec: z.number().nonnegative().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  posterDataUrl: z.string().max(120_000).optional(),
});

export const ingestSchema = z
  .object({
    text: z.string().max(100_000).optional().default(""),
    title: z.string().trim().max(200).optional(),
    source: z.string().trim().max(100).optional(),
    media: ingestMediaSchema.optional(),
  })
  .refine((v) => Boolean(v.media) || looksLikeYoutubeUrl(v.text ?? "") || (v.text ?? "").trim().length >= 20, {
    message: "Paste at least a few sentences, a YouTube URL, or drop a file.",
  });

export const publishTextSchema = z.object({
  text: z.string().trim().min(1, "Post text is required.").max(3000),
  draftId: z.string().trim().max(64).optional(),
  brandId: z.string().trim().max(64).optional(),
});

export const resetTokenSchema = z.string().trim().min(16, "Invalid reset link.").max(512);

export function parseOrError<T>(schema: z.ZodType<T>, input: unknown): { ok: true; data: T } | { ok: false; error: string } {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input.";
    return { ok: false, error: msg };
  }
  return { ok: true, data: parsed.data };
}
