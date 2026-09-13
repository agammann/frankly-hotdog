---
name: hotdog-verdict
description: Use when the user explicitly wants a playful hotdog or not hotdog verdict for a selected image. Do not use for nutrition, food safety, identifying people, or unrelated images.
---

Use classify_hotdog_image only for the image the user selected to share. It accepts a public HTTPS image URL or a PNG, JPEG, or WebP data URL. Never send private access tokens, sensitive images, or other conversation content.

Return the tool's verdict plainly, with its short message if helpful. Keep UNCERTAIN as UNCERTAIN. If the tool fails, explain the failure; do not turn errors into NOT HOTDOG and do not fabricate a verdict.

This plugin does not inspect the user's browser or cursor. Hover detection requires the separate Frankly Hotdog extension, enabled by the user for the current tab. Direct users to the plugin website for that installation workflow if they ask for hover detection. Do not claim the extension is installed or active without evidence.

The classifier is entertainment. It cannot assess whether food is safe to eat, identify ingredients or allergens, or identify people.
