---
title: Authentication
description: OAuth + PKCE, QR device login, and token lifecycle in OpenNOW
---

OpenNOW authenticates with NVIDIA services using browser OAuth 2.0 + PKCE and QR/device authorization. The Rust core owns provider discovery, token exchange, refresh, and session persistence. The Qt shell starts and displays login flows over the shell/core protocol.

## Provider discovery

On startup the core fetches available login providers from:

```
https://pcs.geforcenow.com/v1/serviceUrls
```

Each provider entry includes an `idpId`, display name, and streaming service base URL. The default provider is NVIDIA. Alliance partners (e.g. `BPC` → bro.game) are mapped to friendly display names.

## Browser login flow

1. Generate a PKCE verifier + SHA-256 challenge.
2. Find an available local port from `[2259, 6460, 7119, 8870, 9096]`.
3. Build an authorize URL including the selected provider's `idp_id`, PKCE challenge, and `http://localhost:{port}` as the redirect URI.
4. Open the URL in the system browser.
5. Wait for the authorization code on the local HTTP callback server.
6. Exchange the code + PKCE verifier for tokens at `https://login.nvidia.com/token`.
7. Fetch the user profile (JWT claims first, then `/userinfo` fallback).

## QR/device login flow

The login screen also exposes a **Sign in with QR** path for users who prefer authorizing from another device.

1. The Qt shell starts device login for the selected provider.
2. The core requests device authorization from `https://login.nvidia.com/device/authorize` using the Steam Deck NVIDIA client ID and the selected provider's `idp_id`.
3. NVIDIA returns a `device_code`, `user_code`, `verification_uri`, `verification_uri_complete`, expiry timestamp, and poll interval.
4. The shell renders `verificationUriComplete` as a QR code and shows the `userCode` beside it.
5. The shell polls until NVIDIA returns `authorization_pending`, `slow_down`, `authorized`, `expired_token`, `access_denied`, or another error.
6. On `authorized`, the core builds and persists the session.
7. Cancelling or expiring a QR attempt removes that in-progress authorization attempt.

### Key constants

| Item | Value |
|------|-------|
| Client ID | `ZU7sPN-miLujMD95LfOQ453IB0AtjM8sMyvgJ9wCXEQ` |
| QR/device client ID | `q61ddeJrVt7O90Nl-P-N7I36yctih4Ml6FyXLrb6j-U` |
| Scopes | `openid consent email tk_client age` |
| Authorize URL | `https://login.nvidia.com/authorize` |
| Device authorize URL | `https://login.nvidia.com/device/authorize` |
| Token URL | `https://login.nvidia.com/token` |
| Client-token URL | `https://login.nvidia.com/client_token` |
| Userinfo URL | `https://login.nvidia.com/userinfo` |
| Origin header | `https://nvfile` |
| QR/device Origin header | `https://play.geforcenow.com` |

## Token management

Auth state is persisted under the OpenNOW data directory as `accounts.json` plus `sessions/*.json`. Legacy Electron `auth-state.json` may still be migrated. Session secrets can also be mirrored through the OS credential store when available.

Persisted session data includes:

- Selected provider
- Access, refresh, and client tokens with expiry timestamps
- Resolved user profile

The core refreshes tokens before they expire. If refresh fails and the token is expired, the saved session is cleared and the user must log in again.

## User profile

User profile claims are extracted from the JWT id_token first. If key fields are missing, OpenNOW falls back to the `/userinfo` endpoint.

| Claim | Meaning |
|-------|---------|
| `sub` | Stable user ID |
| `email` | Email address |
| `preferred_username` | Display name |
| `gfn_tier` | Membership tier |
| `picture` | Avatar URL |

After a session is available, OpenNOW also calls the MES subscriptions endpoint to resolve membership tier, time-allocation fields, storage add-on details, and the entitled stream profiles used by Settings. JWTs do not always include `gfn_tier`, so the MES result can replace a fallback `FREE` tier cached from `/userinfo`.

## Linked game accounts

The Settings account section uses NVIDIA's LCARS GraphQL endpoint (`https://apps.gxn.nvidia.com/graphql`) to discover supported store providers and read the current user's linked/synced accounts. Providers are normalized to stable codes such as `UPLAY`, `BATTLENET`, `EPIC`, `STEAM`, and `XBOX`; bundled provider definitions are used if the static provider query fails.

Linking uses the ALS API (`https://als.geforcenow.com/v1`) to request a provider login URL, opens the external browser, and waits on the same local callback port list as browser OAuth. Link, unlink, and resync actions invalidate account-scoped game/library/catalog caches, including proxy-scoped cache keys when a session proxy is configured, so the library can refresh after account changes.

## Implementation notes

- Login orchestration runs in the Rust core, not in QML business logic.
- QR login state is kept in memory while an attempt is active; completed sessions are persisted under the OpenNOW data directory.
- QR login uses Steam Deck-style device metadata for the device authorization request.
- Provider selection is persisted alongside session state.
- Do not post session files, tokens, or device codes to public issues.

## Launch and membership errors

GFN can reject a launch with `INSUFFICIENT_PLAYABILITY` / `SessionInsufficientPlayabilityLevel (3237093718)` when the selected game requires a higher GeForce NOW membership tier. OpenNOW classifies that response as a membership-upgrade requirement, not a duplicate-session conflict. The launch UI prefers SKU-specific catalog copy when available, falls back to a minimum membership label, and otherwise uses a generic upgrade-required message.

## Source areas

- `native/opennow-core/` — auth, sessions, subscription, and account-connection services
- `opennow-qt/` — sign-in and account Settings UI
- `docs/core-protocol.md` — shell/core methods used by login and account flows
