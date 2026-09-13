# Frankly Hotdog release status

## Current version

Version 0.2.0 combines a skills only OpenAI plugin with a companion website and Chrome or Edge hover extension. The browser paths classify on device using bundled MobileNet weights. The chat plugin uses the host assistant. No publisher API key is required or used.

## Verified

1. Both sample photographs returned the expected HOTDOG and NOT HOTDOG verdicts in the browser using the real local model.
2. Nine automated tests pass, covering activation, dwell, cache, pause, capture bounds, local asset serving, disabled former API routes, plugin and extension permission boundaries, and uncertain or invalid model output.
3. Model downloads are verified against pinned SHA256 hashes. The weights total 1,902,176 bytes.
4. The earlier hosted prototype's API credential was removed and the change deployed successfully. Its paid inference is disabled.

The local browser result is real model inference. Extension behavior tests use simulated Chrome APIs and a DOM. A real installed Chrome or Edge extension session has not yet been verified. Two successful sample images do not establish general classification accuracy.

## Pending

The rebuilt website is awaiting final deployment and public access. OpenAI submission and review are pending. The companion extension is distributed as an unpacked preview; no browser store listing is claimed. The publisher has completed identity verification in the OpenAI portal.
