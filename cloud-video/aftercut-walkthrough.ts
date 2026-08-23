/**
 * AFTERCUT jam film automation — headed Chrome on DISPLAY for screen capture.
 * Usage: npx tsx cloud-video/aftercut-walkthrough.ts
 */
import { chromium, type Page } from "playwright";

const BASE = process.env.AFTERCUT_URL ?? "http://localhost:8080";
const EMAIL = process.env.FILM_EMAIL ?? `film+cloud${Date.now()}@example.com`;
const PASSWORD = "FilmDemo!2026";
const NAME = "Northline";
const LONG_FORM = `Last week we closed a 90-minute founder AMA on shipping multi-surface content without losing brand DNA. Three takeaways: (1) native hooks beat identical cross-posts; (2) human approve gate; (3) overnight follow-up with memory wins. Shorts under 90 chars; X one claim; LinkedIn lessons; newsletter subject as preview. Never promise guaranteed virality. CTA: reply with your long-form.`;

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function dismissOverlay(page: Page) {
  await page.evaluate(() => {
    document.querySelectorAll("vite-error-overlay").forEach((el) => el.remove());
  }).catch(() => undefined);
}

async function main() {
  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
    args: ["--start-maximized", "--window-size=1920,1080", "--window-position=0,0"],
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // Beat 1 — Landing
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await dismissOverlay(page);
  await pause(2500);

  // Beat 2 — Sign up
  await dismissOverlay(page);
  await page.getByRole("link", { name: /get started/i }).first().click({ force: true });
  await pause(1500);
  await page.getByPlaceholder(/name/i).fill(NAME);
  await page.getByPlaceholder(/email/i).fill(EMAIL);
  await page.getByPlaceholder(/password/i).fill(PASSWORD);
  await pause(800);
  await page.getByRole("button", { name: /create account/i }).click();
  await page.waitForURL(/\/(onboarding|brand-kit|dashboard)/, { timeout: 20000 });
  await pause(2000);

  // Beat 3 — Brand voice
  await page.goto(BASE + "/brand-kit");
  await pause(1500);
  await page.getByPlaceholder("Your brand").fill("Northline Studio");
  await page
    .getByPlaceholder("Blunt operator voice. Short sentences. Concrete numbers.")
    .fill("calm, sharp founder");
  for (const phrase of ["overnight riches", "set and forget spam", "guaranteed virality"]) {
    const banned = page.getByPlaceholder("Add a banned phrase");
    await banned.fill(phrase);
    await banned.press("Enter");
    await pause(400);
  }
  await pause(800);
  await page.getByRole("button", { name: /save brand voice/i }).click();
  await page.getByText(/saved|next: import|open import/i).first().waitFor({ timeout: 45000 });
  await pause(2000);

  // Beat 4 — Import
  await page.goto(BASE + "/ingest");
  await pause(1500);
  const ta = page.getByPlaceholder("Paste transcript…");
  await ta.click();
  // Controlled React inputs: set value via native setter + input event
  await ta.evaluate((el, value) => {
    const node = el as HTMLTextAreaElement;
    const proto = window.HTMLTextAreaElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, "value");
    desc?.set?.call(node, value);
    node.dispatchEvent(new Event("input", { bubbles: true }));
  }, LONG_FORM);
  await page.locator("p").filter({ hasText: /^\d+ chars$/ }).waitFor({ timeout: 8000 });
  const charLabel = await page.locator("p").filter({ hasText: /^\d+ chars$/ }).textContent();
  if (!charLabel || Number(charLabel.split(" ")[0]) < 48) {
    throw new Error(`Ingest paste too short: ${charLabel}`);
  }
  await pause(500);
  await page.getByRole("button", { name: /add to queue/i }).click();
  await page.getByText(/Added to queue/i).waitFor({ timeout: 10000 });
  await pause(1000);
  await page.getByRole("button", { name: /generate drafts/i }).click();
  try {
    await page.getByText(/drafts ready|open studio/i).first().waitFor({ timeout: 200000 });
  } catch (err) {
    const notice = await page.locator("p").allTextContents();
    console.error("ATOMIZE_FAIL_NOTICES", notice.slice(0, 25));
    throw err;
  }
  await pause(2000);

  // Beat 5 — Studio
  await page.goto(BASE + "/studio");
  await pause(2000);
  const advanceBtn = page.getByRole("button", { name: /start drafting|submit for approval/i }).first();
  if ((await advanceBtn.count()) > 0) {
    await advanceBtn.click();
    await pause(1500);
  }
  await page.evaluate(() => window.scrollBy(0, 200));
  await pause(1500);

  // Beat 6 — Publish denied
  await page.getByRole("button", { name: /publish all now/i }).click();
  await page.getByText("Publishing blocked").first().waitFor({ timeout: 10000 });
  await pause(2500);

  // Beat 7 — Day-2 follow-up
  await page.getByRole("button", { name: /improve weakest hook/i }).click();
  await page
    .getByText(/updated draft|needs approval|improving|Improved/i)
    .first()
    .waitFor({ timeout: 90000 });
  await pause(2000);

  // Beat 8 — Timeline
  await page.goto(BASE + "/timeline");
  await pause(2500);

  // Beat 9 — Circle
  await page.goto(BASE + "/circle");
  await pause(2500);

  await browser.close();
  console.log(JSON.stringify({ ok: true, email: EMAIL }));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
