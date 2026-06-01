<h1 align="center">OpenNOW Docs</h1>

<p align="center">
  <strong>Fumadocs + TanStack Start SPA documentation site for <a href="https://github.com/OpenCloudGaming/OpenNOW">OpenCloudGaming/OpenNOW</a>, the open-source Electron-based GeForce NOW client.</strong>
</p>

<p align="center">
  <a href="https://github.com/OpenCloudGaming/OpenNOW">
    <img src="https://img.shields.io/badge/App_Repo-OpenCloudGaming%2FOpenNOW-brightgreen?style=for-the-badge&logo=github" alt="App Repository">
  </a>
  <a href="https://github.com/OpenCloudGaming/OpenNOW/releases">
    <img src="https://img.shields.io/github/v/tag/OpenCloudGaming/OpenNOW?style=for-the-badge&label=Latest+Release" alt="Latest Release">
  </a>
  <a href="https://discord.gg/8EJYaJcNfD">
    <img src="https://img.shields.io/badge/Discord-Join_Us-7289da?style=for-the-badge&logo=discord&logoColor=white" alt="Discord">
  </a>
</p>

---

## About

This repo hosts the public documentation website for [OpenNOW](https://github.com/OpenCloudGaming/OpenNOW) — an open-source Electron desktop client for GeForce NOW. The app lives in `opennow-stable/` and uses Electron, React, TypeScript, and an optional Rust/GStreamer native streamer.

Docs content lives in `content/docs` as MDX. Shared docs data and React MDX components live under `src/lib` and `src/components/docs`.

## Pages

| Section | Description |
|---------|-------------|
| [Getting Started](https://opennow.zortos.me/docs/guides/getting-started) | Download releases or build from source |
| [Architecture](https://opennow.zortos.me/docs/architecture/overview) | Electron main / preload / renderer split |
| [Authentication](https://opennow.zortos.me/docs/reference/authentication) | OAuth + PKCE login flow |
| [WebRTC](https://opennow.zortos.me/docs/reference/webrtc) | Signaling, SDP, and data channels |
| [Media](https://opennow.zortos.me/docs/reference/media) | Screenshots, recordings, and local storage |
| [Input](https://opennow.zortos.me/docs/reference/input) | Shortcuts, pointer lock, gamepad, microphone |
| [Native Streamer](https://opennow.zortos.me/docs/reference/native-streamer) | Experimental Rust/GStreamer streaming path, diagnostics, and fallback behavior |
| [Configuration](https://opennow.zortos.me/docs/reference/configuration) | Settings model and defaults |

## Local development

Built with [Fumadocs](https://www.fumadocs.dev/docs) on the TanStack Start SPA template.

```bash
npm install
npm run dev          # dev server on http://localhost:3000
npm run types:check  # generate MDX collections and type-check
npm run build        # production SPA build
npm run start        # serve .output/public with SPA rewrites
```

## Keeping docs current

These pages are anchored to the upstream repo's README, development notes, and Electron source under `opennow-stable/src/`. When the app changes, update docs to match. The native streamer docs describe an experimental opt-in feature that may have platform-specific bugs or fallback behavior.
