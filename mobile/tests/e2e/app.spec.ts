import { test, expect } from "@playwright/test";
import catalog from "../../src/generated/catalog.json";
import { readFileSync } from "node:fs";
const ghalib = catalog.poets.find((p) => p.name === "Mirza Ghalib")!;
const poem = catalog.poems.find((p) => p.poetId === ghalib.id)!;
const canonical = JSON.parse(
  readFileSync(`public/data/${poem.chunk}`, "utf8"),
).find((p: { id: string }) => p.id === poem.id);
test("desktop home, real search, supplied scripts, saving and persistence", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByText("Words that stay\nwith you.")).toBeVisible();
  await page.screenshot({
    path: "test-results/home-desktop.png",
    fullPage: true,
  });
  await page.getByRole("tab", { name: "Discover" }).click();
  await page.getByRole("textbox").fill("Ghalib");
  await expect(page.getByText("Searching the full verses…")).toBeHidden({
    timeout: 45000,
  });
  // Full-text search also finds ten other poets' verses mentioning Ghalib.
  await expect(page.getByText("244 results")).toBeVisible();
  await page.getByRole("button", { name: "Poets", exact: true }).click();
  await expect(page.getByText("1 results")).toBeVisible();
  await page.getByRole("button", { name: "Mirza Ghalib, 234 poems" }).click();
  await page.getByRole("button", { name: "Save poet", exact: true }).click();
  await page
    .getByRole("button", { name: `${poem.title} by Mirza Ghalib`, exact: true })
    .click();
  await page.getByRole("button", { name: "Roman", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Roman", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "اردو", exact: true }).click();
  await expect(page.getByTestId("poem-text")).toHaveCSS("direction", "rtl");
  await page.screenshot({
    path: "test-results/reader-urdu.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "देवनागरी", exact: true }).click();
  await expect(page.getByTestId("poem-text")).toHaveText(canonical.text.hi, {
    useInnerText: true,
  });
  await page.getByRole("button", { name: "Save poem", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Remove from saved poems", exact: true }),
  ).toBeVisible();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("kavyavani.library.v1")!),
  );
  expect(saved.favourites).toContain(poem.id);
  expect(saved.poets).toContain(ghalib.id);
  expect(saved.history).toContain(poem.id);
  await page
    .getByRole("button", {
      name: "Listen with feeling · coming later",
      exact: true,
    })
    .click();
  await expect(page.getByText("AI NARRATION · COMING LATER")).toBeVisible();
  expect(errors).toEqual([]);
});

test("failure recovery, backup restore, cached offline reading and smallest mobile layout", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await context.route("**/data/*/*.json", (route) => route.abort());
  await page.goto(`/poem/${poem.id}`);
  await expect(page.getByText("A little pause")).toBeVisible();
  await context.unroute("**/data/*/*.json");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.getByTestId("poem-text")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => resolve(),
          { once: true },
        ),
      );
  });
  await page.reload();
  await expect(page.getByTestId("poem-text")).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByTestId("poem-text")).toBeVisible();
  await context.setOffline(false);
  await page.goto("/settings");
  await page
    .getByRole("button", { name: "Restore backup", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Backup JSON", exact: true })
    .fill("{broken");
  await page.getByRole("button", { name: "Check backup", exact: true }).click();
  await expect(
    page.getByText(
      "This is not a supported Kavyavani backup. Nothing was changed.",
    ),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Backup JSON", exact: true })
    .fill(
      JSON.stringify({
        version: 1,
        theme: "forest",
        profileName: "Test reader",
        favourites: [poem.id],
      }),
    );
  await page.getByRole("button", { name: "Check backup", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Replace library with this backup",
      exact: true,
    })
    .click();
  await page.goto("/profile");
  await expect(page.getByText("Test reader", { exact: true })).toBeVisible();
  await page.goto("/settings");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export backup", exact: true })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("kavyavani-library.json");
});
test("collection create, add, rename, reorder, remove, and confirmed deletion", async ({
  page,
}) => {
  await page.goto(`/poem/${poem.id}`);
  await page
    .getByRole("button", { name: "Add to collection", exact: true })
    .click();
  await page
    .getByRole("button", { name: "+ New collection", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Collection name", exact: true })
    .fill("Quiet evening");
  await page
    .getByRole("button", { name: "Save collection", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Quiet evening · 1", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  const secondPoem = catalog.poems.find(
    (p) => p.poetId === ghalib.id && p.id !== poem.id,
  )!;
  await page.goto(`/poem/${secondPoem.id}`);
  await page
    .getByRole("button", { name: "Add to collection", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Quiet evening · 1", exact: true })
    .click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.goto("/library");
  await page
    .getByRole("button", { name: "Quiet evening", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Edit collection", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Collection name", exact: true })
    .fill("Words to keep");
  await page
    .getByRole("button", { name: "Save collection", exact: true })
    .click();
  await expect(
    page.getByText("Words to keep", { exact: true }).filter({ visible: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText("Words to keep", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Move poem up", exact: true }).click();
  await expect
    .poll(async () =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("kavyavani.library.v1")!)
            .collections[0].poemIds[0],
      ),
    )
    .toBe(secondPoem.id);
  await page
    .getByRole("button", { name: "Remove from this collection", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Remove from this collection", exact: true })
    .click();
  await expect(
    page.getByText("A blank page, full of possibilities."),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete collection", exact: true })
    .click();
  await page.getByRole("button", { name: "Keep it", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page
    .getByRole("button", { name: "Delete collection", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Yes, delete collection", exact: true })
    .click();
  await expect(
    page.getByText("Every collection starts with a verse."),
  ).toBeVisible();
});

test("real genre filtering, sort order, reading preferences and restored position", async ({
  page,
}) => {
  await page.goto("/discover");
  await page.getByRole("button", { name: "bhajan", exact: true }).click();
  await expect(page.getByText("4 results", { exact: true })).toBeVisible();
  const sorted = catalog.poems
    .filter((p) => p.genre === "bhajan")
    .sort((a, b) =>
      new Intl.Collator("hi", { numeric: true, sensitivity: "base" }).compare(
        a.title,
        b.title,
      ),
    );
  const name = (id: string) => catalog.poets.find((p) => p.id === id)!.name;
  const visibleCards = page
    .getByRole("button")
    .filter({ hasText: / · bhajan/ });
  await expect(visibleCards.first()).toHaveAttribute(
    "aria-label",
    `${sorted[0].title} by ${name(sorted[0].poetId)}`,
  );
  await page.getByRole("button", { name: "A → Z", exact: true }).click();
  await expect(visibleCards.first()).toHaveAttribute(
    "aria-label",
    `${sorted.at(-1)!.title} by ${name(sorted.at(-1)!.poetId)}`,
  );
  await page.goto(`/poem/${poem.id}`);
  await page
    .getByRole("button", { name: "Reading settings", exact: true })
    .click();
  await page.getByRole("button", { name: "Large", exact: true }).click();
  await page.getByRole("button", { name: "2.2×", exact: true }).click();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByTestId("poem-text")).toHaveCSS("font-size", "28px");
  await page
    .getByRole("button", {
      name: "Listen with feeling · coming later",
      exact: true,
    })
    .scrollIntoViewIfNeeded();
  await expect
    .poll(async () =>
      page.evaluate(
        (id) =>
          JSON.parse(localStorage.getItem("kavyavani.library.v1")!).positions[
            id
          ] ?? 0,
        poem.id,
      ),
    )
    .toBeGreaterThan(0.2);
  await page.reload();
  await expect(page.getByTestId("poem-text")).toHaveCSS("font-size", "28px");
  await expect(
    page.getByRole("button", { name: "Back to the beginning", exact: true }),
  ).toBeInViewport();
});
test("all themes persist and apply beyond settings; mobile layout, Hindi and empty search", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/settings");
  for (const name of [
    "Midnight Ink",
    "Rose & Romance",
    "Forest Poetry",
    "Minimal Monochrome",
    "Classic Parchment",
  ]) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(
      page.getByRole("button", { name, exact: true }),
    ).toHaveAttribute("aria-selected", "true");
  }
  await page.getByRole("button", { name: "Midnight Ink", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Midnight Ink", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.goto("/");
  await expect(page.getByText("Words that stay\nwith you.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Kavyavani home" }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/home-mobile-midnight.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.getByRole("button", { name: "हिन्दी", exact: true }).click();
  await expect(page.getByText("शब्द, जो आपके\nसाथ ठहर जाएँ।")).toBeVisible();
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.getByRole("tab", { name: "Discover" }).click();
  await page.getByRole("textbox").fill("zzzzzznotapoem");
  await expect(page.getByText("No verse found, yet")).toBeVisible({
    timeout: 45000,
  });
});
