const url = process.argv[2]
const timeoutMs = 15_000
const start = Date.now()

while (Date.now() - start < timeoutMs) {
  try {
    const response = await fetch(url)
    if (response.ok) {
      process.exit(0)
    }
  } catch {
    // Retry until the preview server is ready.
  }

  await new Promise((resolve) => setTimeout(resolve, 250))
}

console.error(`Timed out waiting for ${url}`)
process.exit(1)
