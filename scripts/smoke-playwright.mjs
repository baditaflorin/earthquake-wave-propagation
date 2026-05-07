import { chromium } from 'playwright'

const url = process.argv[2]
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } })

const consoleErrors = []
page.on('console', (message) => {
  if (message.type() === 'error') {
    consoleErrors.push(message.text())
  }
})

await page.goto(url, { waitUntil: 'networkidle' })
await page.getByRole('heading', { name: /Earthquake-Wave Propagation/i }).waitFor()
await page.getByRole('button', { name: /Strike fault/i }).click()
await page.locator('canvas').waitFor()
await page.waitForTimeout(1500)

const canvasBox = await page.locator('canvas').boundingBox()
if (!canvasBox || canvasBox.width < 320 || canvasBox.height < 240) {
  throw new Error('Simulation canvas did not render at a usable size')
}

if (consoleErrors.length > 0) {
  throw new Error(`Console errors found:\n${consoleErrors.join('\n')}`)
}

await browser.close()
