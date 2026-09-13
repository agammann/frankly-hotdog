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

The rebuilt website was deployed successfully with an empty runtime environment and is currently restricted to the owner. Both hosted sample checks passed on device. Public access awaits the publisher's answer. The public source was published at commit 3627faca51967977e87a1f2f50ac9df4839eafd3, and its GitHub build and tests passed (run 34738290128). The OpenAI skills only draft is complete and its skill scan shows Passed. Final submission awaits acceptance of OpenAI's terms and publisher declarations, as well as public website access. No OpenAI directory approval is claimed. The companion extension is distributed as an unpacked preview; no browser store listing is claimed. The publisher has completed identity verification in the OpenAI portal.

