---
title: Authentication
description: OAuth + PKCE login flow and token lifecycle in OpenNOW
---

OpenNOW authenticates with NVIDIA services using OAuth 2.0 + PKCE. The implementation lives in `opennow-stable/src/main/gfn/auth.ts` and runs entirely in the Electron main process.

## Provider discovery

On startup the main process fetches available login providers from:

```
https://pcs.geforcenow.com/v1/serviceUrls
```

Each provider entry includes an `idpId`, display name, and streaming service base URL. The default provider is NVIDIA. Alliance partners (e.g. `BPC` → bro.game) are mapped to friendly display names.

## Login flow

1. Generate a PKCE verifier + SHA-256 challenge.
2. Find an available local port from `[2259, 6460, 7119, 8870, 9096]`.
3. Build an authorize URL including the selected provider's `idp_id`, PKCE challenge, and `http://localhost:{port}` as the redirect URI.
4. Open the URL in the system browser.
5. Wait for the authorization code on the local HTTP callback server.
6. Exchange the code + PKCE verifier for tokens at `https://login.nvidia.com/token`.
7. Fetch the user profile (JWT claims first, then `/userinfo` fallback).

### Key constants

| Item | Value |
|------|-------|
| Client ID | `ZU7sPN-miLujMD95LfOQ453IB0AtjM8sMyvgJ9wCXEQ` |
| Scopes | `openid consent email tk_client age` |
| Authorize URL | `https://login.nvidia.com/authorize` |
| Token URL | `https://login.nvidia.com/token` |
| Client-token URL | `https://login.nvidia.com/client_token` |
| Userinfo URL | `https://login.nvidia.com/userinfo` |
| Origin header | `https://nvfile` |

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

## Implementation notes

- The login flow runs in the main process, not the renderer.
- Provider selection is persisted alongside session state.
- A deterministic device ID is derived from the hostname and OS username.
- Auth state is stored as plain JSON in the Electron `userData` directory — no OS keychain is used.
- Requests use a GFN desktop user-agent string.

## Source files

- `opennow-stable/src/main/gfn/auth.ts`
- `opennow-stable/src/shared/gfn.ts` (type definitions)
