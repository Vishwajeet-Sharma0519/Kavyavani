import { chromium } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const base = process.env.PREVIEW_URL || "http://127.0.0.1:4173";
const folder = "artifacts/themes";
await mkdir(folder, { recursive: true });
try {
  for (const [key, name] of [
    ["rose", "Rose & Romance"],
    ["forest", "Forest Poetry"],
    ["mono", "Minimal Monochrome"],
    ["parchment", "Classic Parchment"],
    ["midnight", "Midnight Ink"],
  ]) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${base}/settings`);
    await page.getByRole("button", { name, exact: true }).click();
    await page.goto(base);
    await page.getByText("Words that stay\nwith you.").waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${folder}/${key}-desktop.png` });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: `${folder}/${key}-mobile.png` });
    if (
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      )
    ) {
      throw new Error(`Horizontal overflow in ${name}`);
    }
    console.log(`${name}: desktop and mobile captured`);
  }
  await page.goto(`${base}/settings`);
  await page
    .getByRole("button", { name: "Rose & Romance", exact: true })
    .click();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: `${folder}/settings.png` });
  const catalog = JSON.parse(
    await readFile("src/generated/catalog.json", "utf8"),
  );
  await page.goto(`${base}/poem/${catalog.poems[0].id}`);
  await page.getByTestId("poem-text").waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: `${folder}/rose-reader.png` });
  if (errors.length) throw new Error(errors.join("\n"));
  console.log("Theme captures complete; no browser errors or mobile overflow.");
} finally {
  await browser.close();
}
