import { describe, expect, it } from "vitest";

import { formatBytes, formatDuration, formatMediaBrief, isMediaBrief } from "../src/lib/media-ingest";

describe("media ingest brief", () => {
  it("builds a Director-ready video brief without inventing quotes", () => {
    const text = formatMediaBrief({
      kind: "video",
      filename: "late-night-stream.mp4",
      mime: "video/mp4",
      size: 840_000_000,
      durationSec: 4320,
    });
    expect(isMediaBrief(text)).toBe(true);
    expect(text).toMatch(/1h 12m/);
    expect(text).toMatch(/Do not invent spoken quotes/);
    expect(text.length).toBeGreaterThan(48);
  });

  it("appends an optional transcript", () => {
    const text = formatMediaBrief(
      {
        kind: "image",
        filename: "thumb.png",
        mime: "image/png",
        size: 12000,
        width: 1080,
        height: 1350,
      },
      "We shipped the cut last night.",
    );
    expect(text).toContain("We shipped the cut last night.");
    expect(text).toContain("1080×1350");
  });

  it("formats sizes", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatDuration(65)).toBe("1m 5s");
  });
});
