/** Public site URL + share preview assets (OG / Twitter). */

export const SITE_NAME = "AFTERCUT";
export const SITE_TAGLINE = "The editor that never forgets your creative DNA";
export const DEFAULT_DESCRIPTION =
  "AFTERCUT is a Minds agent that remembers your creative DNA and keeps turning long-form into platform-native posts while you sleep.";

export function appBaseUrl(): string {
  const vercel = process.env.VERCEL_URL?.trim();
  return (
    process.env.BETTER_AUTH_URL?.trim() ||
    (vercel ? `https://${vercel.replace(/^https?:\/\//, "")}` : "") ||
    "https://aftercut-sandy.vercel.app"
  ).replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const base = appBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/** 1200×630 share card — public/og-image.png */
export const OG_IMAGE_PATH = "/og-image.png";

export function defaultHeadMeta(): Array<
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string }
> {
  const ogImage = absoluteUrl(OG_IMAGE_PATH);
  const siteUrl = appBaseUrl();
  return [
    { title: `${SITE_NAME} — ${SITE_TAGLINE}` },
    { name: "description", content: DEFAULT_DESCRIPTION },
    { name: "author", content: SITE_NAME },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:url", content: siteUrl },
    { property: "og:title", content: `${SITE_NAME} — the editor that never forgets` },
    { property: "og:description", content: DEFAULT_DESCRIPTION },
    { property: "og:image", content: ogImage },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: `${SITE_NAME} logo — diagonal cut mark` },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: `${SITE_NAME} — the editor that never forgets` },
    { name: "twitter:description", content: DEFAULT_DESCRIPTION },
    { name: "twitter:image", content: ogImage },
  ];
}

export function defaultHeadLinks() {
  return [
    { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    { rel: "icon", href: "/brand/aftercut-logo-200.png", type: "image/png", sizes: "200x200" },
    { rel: "apple-touch-icon", href: "/brand/aftercut-logo-512.png", sizes: "512x512" },
  ];
}
