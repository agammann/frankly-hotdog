# Frankly Hotdog

An entertainment image classifier with an opt in browser hover extension and an MCP plugin. Select an image to get **HOTDOG**, **NOT HOTDOG**, or **UNCERTAIN**.

Publisher and support: [agammann](https://github.com/agammann). Report reproducible problems in [Issues](https://github.com/agammann/frankly-hotdog/issues).

## Status

Public source preview. The hosted service, real browser extension installation, and OpenAI directory submission are pending. The bundled hosted URLs describe the intended deployment and should not be treated as a live service. See [release status](RELEASE_STATUS.md) for verification limits.

## Run locally

Use Node.js 24 and pnpm 11.19.0. From the repository directory:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm dev
```

For real inference, create `.env.local` in this directory and set `OPENAI_API_KEY` to your own project credential using a private editor. This file is ignored by Git. Alternatively set the environment variable in your shell or deployment secret manager. Do not put credentials in the extension, plugin manifest, issues, or source code. OpenAI API access with available billing credit is required for inference.

Open http://127.0.0.1:4317. Select Enable hover, point at a sample, or upload an image. Click and keyboard activation are also available. The local MCP endpoint is http://127.0.0.1:4317/mcp. Without a configured key the interface loads and reports inference errors explicitly.

`pnpm test:live` sends the two bundled sample images to the real API and checks their verdicts. This is separate from the deterministic test suite and may incur API charges.

## Browser extension

The `extension` directory contains a Chrome and Edge Manifest V3 extension. Load it unpacked through the browser's extension management page after configuring a working service endpoint. The default endpoint targets the intended hosted service, which is not deployed yet.

For local development, replace the hosted origin in `extension/background.js` with `http://127.0.0.1:4317` and replace the manifest host permission with `http://127.0.0.1:4317/*`. Keep the local server running. Enable the extension separately on each tab. Escape pauses it and navigation resets activation.

Only visible top level HTML images are supported. CSS backgrounds, videos, frames, and browser settings pages are outside this preview. If canvas access is blocked, the extension crops a temporary local active tab capture to the fully visible hovered image. The full capture is never uploaded. Page overlays can affect the resulting crop.

## Service and deployment

The Worker exposes `/api/classify`, `/mcp`, `/health`, policy pages, and the domain verification challenge path. It uses the OpenAI Responses API with `gpt-4.1-mini`, low detail image input, strict structured output, and response storage disabled.

Production requires a private `OPENAI_API_KEY` secret and a D1 database binding named `DB`. Apply `migrations/0000_budget.sql` before enabling inference. `.openai/hosting.json` is a generic hosting template; configure your own project when deploying. `pnpm build` generates the bundled Worker and migration metadata in `dist`.

The service defaults to 100 attempted classifications per UTC day, with a configurable maximum of 1,000. A D1 atomic counter enforces the shared daily budget. An additional in memory limit allows six attempts per source per minute per isolate. Invalid inputs are rejected before budget reservation; provider failures still consume a reservation. Production inference fails closed if durable budget storage is missing.

This limited public entertainment endpoint has no authentication. It does not persist images or verdicts. Aggregate counts expire after 30 days on subsequent requests. Confirm hosting provider operational logging and update the privacy policy before a public deployment.

The MCP tool declares `readOnlyHint: false` because inference reserves a usage counter, `destructiveHint: false`, and `openWorldHint: true` because user selected external images may be processed. The output schema includes uncertainty. Errors are never labeled NOT HOTDOG.

## OpenAI plugin

The `.codex-plugin`, `.mcp.json`, and `skills` directories contain the plugin package. `chatgpt-app-submission.json` contains draft listing metadata and test cases. Update the deployment URLs and complete the publisher, domain, policy, and live tool checks before submission. The OpenAI plugin and browser extension are separate installation surfaces.

## Rights and credits

No open source license has been granted for the application source. Public visibility does not grant additional reuse rights. Third party packages and sample images retain their own licenses. Photo attribution and license links are in [credits](public/credits.html).
