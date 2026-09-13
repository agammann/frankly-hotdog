# not hotdog release status

Version 0.2.2 is approved and published in the OpenAI Plugins Directory with package name `not-hotdog`. The replacement listing was verified while logged out. It shows not hotdog, Entertainment, version 0.2.2, an Install plugin button, and the current website and policy links. The superseded package has been unpublished.

[Official directory listing](https://chatgpt.com/plugins/plugins_6aa62d11f8308191af4d7ab1aba34ec3)

[Public website](https://not-hotdog.alx21.chatgpt.site)

[Companion extension](https://not-hotdog.alx21.chatgpt.site/extension)

[Public repository](https://github.com/agammann/not-hotdog)

## Verification

1. All current tracked source files and all release archives were checked for the previous product name, with zero matches.
2. Public website, privacy, terms, extension instructions, health, and extension ZIP returned HTTP 200 without authentication. The downloaded ZIP matches the local release byte for byte.
3. The 0.2.3 companion release fixes local data decoding under the extension's strict connection policy, acknowledges activation, rolls back failed activation, prevents duplicate pause writes, validates fully visible images, discards stale image results, and rejects captures after a tab change. Regression tests cover local decoding with fetch forbidden, capture cleanup, tab changes, and activation failure. Earlier GitHub CI run 34739155586 covered the preceding 0.2.2 application.
4. Website and extension inference run on device. The host chat plugin uses existing assistant capabilities and normal host limits. No publisher API key is used or configured.
5. Both sample photographs passed real local and hosted model checks. The model weights total 1,902,176 bytes and are verified against pinned hashes.
6. The published chat plugin was installed and tested in ChatGPT: no image prompted an attachment request, the hotdog and banana photos returned the expected verdicts, and the companion instructions and URL were correct. The chat plugin remains version 0.2.2; the website and browser companion are version 0.2.3.

## Limits

The browser extension is an unpacked preview. Its behavior tests use simulated Chrome APIs and a DOM; a real installed Chrome or Edge session has not been verified. Two sample images do not establish general accuracy. No browser store listing is claimed.

Historical Git commits and retired platform records retain their original metadata. Current names, package identifiers, source files, URLs, directories, and downloads use not hotdog or not-hotdog.
