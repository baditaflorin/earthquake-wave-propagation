import { chromium } from "playwright";
import { PNG } from "pngjs";

const url = process.argv[2];
const browser = await chromium.launch({ headless: true });

for (const viewport of [
  { name: "desktop", width: 1366, height: 900 },
  { name: "mobile", width: 390, height: 844 },
]) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto(url, { waitUntil: "networkidle" });
  await page
    .getByRole("heading", { name: /Earthquake-Wave Propagation/i })
    .waitFor();
  await page.getByRole("button", { name: /Strike fault/i }).click();
  await page.locator("canvas").waitFor();
  await page.waitForTimeout(1500);

  const canvas = page.locator("canvas");
  const canvasBox = await canvas.boundingBox();
  if (!canvasBox || canvasBox.width < 320 || canvasBox.height < 240) {
    throw new Error(
      `${viewport.name} simulation canvas did not render at a usable size`,
    );
  }

  const screenshot = await canvas.screenshot({
    path: `/tmp/earthquake-wave-propagation-${viewport.name}.png`,
  });
  assertNonBlankPng(screenshot, viewport.name);

  if (consoleErrors.length > 0) {
    throw new Error(
      `${viewport.name} console errors found:\n${consoleErrors.join("\n")}`,
    );
  }

  await page.close();
}

await browser.close();

function assertNonBlankPng(buffer, label) {
  const png = PNG.sync.read(buffer);
  const stride = Math.max(1, Math.floor(png.width / 24));
  let samples = 0;
  let sum = 0;
  let sumSquares = 0;

  for (let y = 0; y < png.height; y += stride) {
    for (let x = 0; x < png.width; x += stride) {
      const index = (png.width * y + x) * 4;
      const luminance =
        png.data[index] * 0.2126 +
        png.data[index + 1] * 0.7152 +
        png.data[index + 2] * 0.0722;
      samples += 1;
      sum += luminance;
      sumSquares += luminance * luminance;
    }
  }

  const mean = sum / samples;
  const variance = sumSquares / samples - mean * mean;
  if (variance < 20) {
    throw new Error(`${label} canvas screenshot appears blank`);
  }
}
