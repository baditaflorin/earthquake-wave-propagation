# Deploy

Live URL: https://baditaflorin.github.io/earthquake-wave-propagation/

Repository: https://github.com/baditaflorin/earthquake-wave-propagation

GitHub Pages serves the `main` branch from `/docs`.

## Publish

```bash
make build
git add docs src/generated/buildInfo.ts
git commit -m "build: publish pages artifact"
git push
```

## Rollback

Revert the publishing commit and push `main` again.

## Custom Domain

No custom domain is configured in v1. If one is added, commit `docs/CNAME` and
point DNS to GitHub Pages per GitHub's current Pages documentation.
