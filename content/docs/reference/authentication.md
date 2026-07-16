---
title: Authentication
description: OAuth + PKCE, QR device login, and token lifecycle in OpenNOW
---

OpenNOW authenticates with NVIDIA services using two main-process flows: browser OAuth 2.0 + PKCE and QR/device authorization. The implementation lives in `opennow-stable/src/main/platforms/gfn/auth.ts`; the renderer only asks the preload bridge to start, poll, complete, or cancel login attempts.

## Provider discovery

On startup the main process fetches available login providers from:

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

1. The renderer calls `window.openNow.startDeviceLogin({ providerIdpId })`.
2. The main process requests device authorization from `https://login.nvidia.com/device/authorize` using the Steam Deck NVIDIA client ID and the selected provider's `idp_id`.
3. NVIDIA returns a `device_code`, `user_code`, `verification_uri`, `verification_uri_complete`, expiry timestamp, and poll interval.
4. The renderer renders `verificationUriComplete` as a QR code and shows the `userCode` beside it.
5. The renderer polls `window.openNow.pollDeviceLogin({ attemptId, deviceCode })` until NVIDIA returns `authorization_pending`, `slow_down`, `authorized`, `expired_token`, `access_denied`, or another error.
6. On `authorized`, the main process builds a pending session from the device-code token exchange; the renderer then calls `completeDeviceLogin({ attemptId })` to persist it.
7. Cancelling or expiring a QR attempt removes both the active device-code attempt and any pending session for that attempt.

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

Auth state is persisted at `app.getPath("userData")/auth-state.json` and includes:

- Selected provider
- Access, refresh, and client tokens with expiry timestamps
- Resolved user profile

The main process proactively refreshes tokens before they expire (10-minute window for access tokens, 5-minute window for client tokens). It prefers the client-token refresh path when available, then falls back to standard OAuth refresh tokens.

If refresh fails and the token is expired, the saved session is cleared and the user must log in again.

## User profile

`fetchUserInfo()` extracts claims from the JWT id_token first. If key fields are missing, it falls back to the `/userinfo` endpoint.

| Claim | Meaning |
|-------|---------|
| `sub` | Stable user ID |
| `email` | Email address |
| `preferred_username` | Display name |
| `gfn_tier` | Membership tier |
| `picture` | Avatar URL |

After a session is available, OpenNOW also calls the MES subscriptions endpoint to resolve the real `membershipTier`, time-allocation fields, storage add-on details, and the entitled stream profiles used by Settings. JWTs do not always include `gfn_tier`, so the MES result can replace the fallback `FREE` tier cached from `/userinfo`.

## Linked game accounts

The Settings account section uses NVIDIA's LCARS GraphQL endpoint (`https://apps.gxn.nvidia.com/graphql`) to discover supported store providers and read the current user's linked/synced accounts. Providers are normalized to stable codes such as `UPLAY`, `BATTLENET`, `EPIC`, `STEAM`, and `XBOX`; bundled provider definitions are used if the static provider query fails.

Linking uses the ALS API (`https://als.geforcenow.com/v1`) to request a provider login URL, opens the external browser, and waits on the same local callback port list as browser OAuth. Link, unlink, and resync actions invalidate account-scoped game/library/catalog caches, including proxy-scoped cache keys when a session proxy is configured, so the library can refresh after account changes.

## Implementation notes

- The login flow runs in the main process, not the renderer.
- QR login state is kept in memory as per-attempt device-code records plus pending sessions; only `completeDeviceLogin()` writes the session to `auth-state.json`.
- QR login uses Steam Deck-style device metadata (`STEAMOS`, `STEAMDECK`, browser/WEBRTC headers) for the device authorization request.
- Provider selection is persisted alongside session state.
- A deterministic device ID is derived from the hostname and OS username.
- Auth state is stored as plain JSON in the Electron `userData` directory — no OS keychain is used.
- Browser OAuth requests use a GFN desktop user-agent string; QR/device login requests use the Steam Deck browser user-agent.
- Subscription and linked-account requests use shared LCARS/GFN headers from `clientHeaders.ts`; the renderer receives typed DTOs through preload IPC rather than calling NVIDIA endpoints directly.

## Launch and membership errors

GFN can reject a launch with `INSUFFICIENT_PLAYABILITY` / `SessionInsufficientPlayabilityLevel (3237093718)` when the selected game requires a higher GeForce NOW membership tier. OpenNOW classifies that response as a membership-upgrade requirement, not a duplicate-session conflict. The launch UI prefers SKU-specific catalog copy from `catalogSkuStrings`, falls back to the game's `minimumMembershipTierLabel`, and otherwise uses the generic upgrade-required message.

## Source files

- `opennow-stable/src/main/platforms/gfn/auth.ts`
- `opennow-stable/src/main/ipc/accountCatalogHandlers.ts`
- `opennow-stable/src/main/platforms/gfn/subscription.ts`
- `opennow-stable/src/main/platforms/gfn/accountConnections.ts`
- `opennow-stable/src/preload/index.ts`
- `opennow-stable/src/renderer/src/components/LoginScreen.tsx`
- `opennow-stable/src/renderer/src/components/SettingsPage.tsx`
- `opennow-stable/src/main/platforms/gfn/errorCodes.ts`
- `opennow-stable/src/main/platforms/gfn/games.ts`
- `opennow-stable/src/renderer/src/lib/sessionState.ts`
- `opennow-stable/src/shared/gfn/` (type definitions)
