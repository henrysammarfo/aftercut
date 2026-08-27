import { readFileSync } from "node:fs";
const lines = readFileSync("C:/Users/jessi/Desktop/scoutbot/agent/.env", "utf8").split(/\n/);
for (const k of ["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "TAVILY_API_KEY", "TINYFISH_API_KEY"]) {
  const hit = lines.find((l) => l.trim().startsWith(k + "="));
  if (!hit) {
    console.log(k + ": missing");
    continue;
  }
  let v = hit.slice(k.length + 1).trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  console.log(k + ": " + (v.length > 8 ? "present len=" + v.length : "empty_or_short"));
}
