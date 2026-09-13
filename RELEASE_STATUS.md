# Frankly Hotdog release status

## Preview scope

The implementation is available as public source. Public deployment and OpenAI submission are pending. No approval or directory listing is claimed.

The preview includes a website with image upload and opt in hover, a Chrome and Edge extension, a Responses API classifier, a Streamable HTTP MCP tool, an atomic daily service budget, policy pages, and draft submission materials.

## Verification

All 14 deterministic tests passed locally. Coverage includes input validation, provider errors and malformed output, uncertainty preservation, simulated extension activation and pause, capture rejection, HTTP policy routes, origin and request size bounds, MCP initialization and discovery, missing production database handling, and the atomic daily budget exercised against SQLite.

Browser preview rendering and API error presentation were inspected. The deterministic tests use synthetic provider responses and simulated extension contexts. Successful live classification and an installed extension session have not been verified. These checks do not establish classification accuracy or complete production readiness.

## Remaining release work

1. Verify real positive and negative image classifications with a configured API project.
2. Configure the hosting secret, apply the database migration, deploy, and verify the public HTTPS service and MCP endpoint.
3. Test a real installed browser extension, including protected image capture, pause, and navigation behavior.
4. Finalize the privacy policy against actual hosting practices, verify the publisher and domain, import the listing, scan the tools, and submit for OpenAI review.

The intended origin is `https://frankly-hotdog.alx21.chatgpt.site`. Bundled extension and submission URLs target that future deployment and are not proof of a live service.
