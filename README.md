<h1 align="center">OpenNOW Docs</h1>

<p align="center">
  <strong>Documentation site for <a href="https://github.com/OpenCloudGaming/OpenNOW">OpenCloudGaming/OpenNOW</a>, the open-source Electron-based GeForce NOW client.</strong>
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

This repo hosts the public documentation website for [OpenNOW](https://github.com/OpenCloudGaming/OpenNOW) — an open-source Electron desktop client for GeForce NOW. The app lives in `opennow-stable/` and uses Electron, React, and TypeScript.

## Pages

| Section | Description |
|---------|-------------|
| [Getting Started](https://opennow.zortos.me/guides/getting-started/) | Download releases or build from source |
| [Architecture](https://opennow.zortos.me/architecture/overview/) | Electron main / preload / renderer split |
| [Authentication](https://opennow.zortos.me/reference/authentication/) | OAuth + PKCE login flow |
| [WebRTC](https://opennow.zortos.me/reference/webrtc/) | Signaling, SDP, and data channels |
| [Media](https://opennow.zortos.me/reference/media/) | Screenshots, recordings, and local storage |
| [Input](https://opennow.zortos.me/reference/input/) | Shortcuts, pointer lock, gamepad, microphone |
| [Configuration](https://opennow.zortos.me/reference/configuration/) | Settings model and defaults |

## Local development

Built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build).

```bash
npm install
npm run dev      # dev server
npm run build    # production build
npm run preview  # preview production build
```

## Keeping docs current

These pages are anchored to the upstream repo's README, `docs/development.md`, and the Electron source under `opennow-stable/src/`. When the app changes, update docs to match.
