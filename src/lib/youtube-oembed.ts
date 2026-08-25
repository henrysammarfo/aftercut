/** Public YouTube oEmbed — title + channel only. Never invent quotes. */

export type YoutubeMeta = {
  url: string;
  title?: string;
  author?: string;
};

export async function fetchYoutubeOembed(url: string): Promise<YoutubeMeta> {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const res = await fetch(endpoint, { headers: { Accept: "application/json" } });
  if (!res.ok) return { url };
  const data = (await res.json()) as { title?: unknown; author_name?: unknown };
  return {
    url,
    title: typeof data.title === "string" ? data.title.slice(0, 200) : undefined,
    author: typeof data.author_name === "string" ? data.author_name.slice(0, 120) : undefined,
  };
}
