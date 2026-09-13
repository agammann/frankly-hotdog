# not hotdog release status

## Release history

Frankly Hotdog was submitted, approved, and published in the OpenAI Plugins Directory on September 13, 2026 UTC (September 12 Pacific time). The published listing was independently viewed while logged out and shows an Install plugin button, Entertainment category, version 0.2.0, the verified developer, and both workflow descriptions.

[Official directory listing](https://chatgpt.com/plugins/plugins_6aa626290c748191b8e1b55ac99bf9d6)

[Public website](https://frankly-hotdog.alx21.chatgpt.site)

[Browser companion installation](https://frankly-hotdog.alx21.chatgpt.site/extension)

The skills only plugin uses the host assistant's image capabilities. The companion website and browser extension classify on device with bundled MobileNet weights. Installing the chat plugin does not install the extension. No publisher API key is required or used; normal host usage limits still apply.

Version 0.2.1 changes the display name to `not hotdog` and updates visible branding. Stable package identifiers, repository paths, and website links remain compatible. The renamed draft is being processed; version 0.2.0 remains published until its replacement is approved and published.

## Verification

1. The public website, privacy policy, terms, extension instructions, and extension ZIP returned HTTP 200 without authentication. The downloaded extension matches the tested local ZIP byte for byte.
2. The hosted health endpoint reports on_device inference and publisher_api false. The old classification API returns HTTP 410. No publisher API credentials are configured.
3. Both sample photographs returned the expected HOTDOG and NOT HOTDOG verdicts using the real model locally and on the hosted website.
4. Nine automated tests passed. GitHub build and tests passed for application commit 3627faca51967977e87a1f2f50ac9df4839eafd3 in run 34738290128. Subsequent changes only update release documentation.
5. Model downloads are verified against pinned SHA256 hashes. Weights total 1,902,176 bytes.
6. The OpenAI skill scan showed Passed before submission. The publisher completed identity verification and authorized the final declarations.

## Scope limitations

Extension behavior tests use simulated Chrome APIs and a DOM. A real installed Chrome or Edge extension session has not yet been verified. The companion extension is distributed as an unpacked preview; there is no Chrome or Edge store listing. Two successful sample images do not establish general accuracy. This is entertainment, not a food safety or allergy tool.
