.PHONY: help install-hooks dev build test test-integration smoke lint fmt pages-preview data release clean hooks-pre-commit hooks-commit-msg hooks-pre-push

help:
	@printf '%s\n' \
		'make install-hooks     Wire .githooks into this checkout' \
		'make dev               Run the Vite dev server' \
		'make build             Build the static GitHub Pages site into docs/' \
		'make test              Run unit tests' \
		'make test-integration  Run integration tests (none for Mode A v1)' \
		'make smoke             Build, preview, and run Playwright smoke test' \
		'make lint              Run eslint, prettier check, and TypeScript' \
		'make fmt               Format source files' \
		'make pages-preview     Serve docs/ exactly like a static Pages folder' \
		'make clean             Remove build outputs'

install-hooks:
	git config core.hooksPath .githooks

dev:
	npm run dev

build:
	npm run build

test:
	npm run test

test-integration:
	@printf '%s\n' 'No separate integration suite for Mode A v1.'

smoke:
	npm run smoke

lint:
	npm run lint
	npm run fmt:check
	npx tsc --noEmit

fmt:
	npm run fmt

pages-preview:
	npx vite preview --host 127.0.0.1 --port 4173

data:
	@printf '%s\n' 'Mode A has no offline data pipeline.'

release:
	@printf '%s\n' 'Create a semver tag after local checks pass, then push the tag.'

clean:
	rm -rf dist coverage node_modules/.tmp
