# Security — this repository is PUBLIC

Assume everything committed here can be read by anyone, forever (git history
included).

## Never commit
- passwords, API keys, auth tokens, cookies, session data
- private URLs, private music, personal library data
- production credentials of any kind
- private BAD-D (`bad_d_meomory`) source code, even fragments
- exported private datasets

## Rules for this lab
- Use synthetic fixtures (generated WAV tones, synthetic text/metadata) or
  genuinely public-domain/test media. Never real personal audio libraries.
- Anything genuinely secret belongs in an environment variable, never a
  committed file — and this lab shouldn't need secrets at all for its
  current scope (local-file/authorized-input processing, no platform auth).
- `reference/` holds a read-only BAD-D build snapshot pulled in for
  diagnostic testing. It is already-public-adjacent build output, not
  source control credentials — still never edited, and never used as a
  place to paste anything sensitive from the private repo.

## Acquisition scope boundary (bulk-media-intake specifically)
This lab's media-acquisition tooling is scoped to **local files the user
already has** and **direct URLs the user is authorized to fetch** (e.g.
their own file host, a CORS-permitting authorized source). It does not
implement, and will not implement, scraping or extraction from platforms
whose terms of service prohibit third-party downloading (e.g. YouTube
outside its own official offline-download feature). That's a legal/ToS
boundary, not a technical one this lab tries to route around.
