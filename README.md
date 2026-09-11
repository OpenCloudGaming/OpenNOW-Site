<h1 align="center">OpenNOW Docs</h1>

<p align="center">
  <strong>Fumadocs + TanStack Start SPA documentation site for the OpenNOW desktop, mobile, and Nintendo Switch GeForce NOW clients.</strong>
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

This repo hosts the public documentation website for the [OpenNOW desktop client](https://github.com/OpenCloudGaming/OpenNOW), mobile builds, and native [OpenNOW-Switch](https://github.com/OpenCloudGaming/OpenNOW-Switch) homebrew client. The desktop app uses Qt Quick, a Rust core, and an in-process native NVST streamer; the Switch client is a separate C++ Horizon OS application.

Docs content lives in `content/docs` as MDX. Shared docs data and React MDX components live under `src/lib` and `src/components/docs`.

## Pages

| Section | Description |
|---------|-------------|
| [Getting Started](https://opennow.zortos.me/docs/guides/getting-started) | Download Qt packages or build from source with CMake |
| [Nintendo Switch](https://opennow.zortos.me/docs/guides/nintendo-switch) | Install the homebrew client, configure streaming, and use Switch controls and shortcuts |
| [Architecture](https://opennow.zortos.me/docs/architecture/overview) | Qt shell, Rust core, and in-process streamer |
| [Authentication](https://opennow.zortos.me/docs/reference/authentication) | OAuth + PKCE login flow |
| [Native Streamer](https://opennow.zortos.me/docs/reference/native-streamer) | Production NVST path, GPU presentation, and diagnostics |
| [Protocol notes](https://opennow.zortos.me/docs/reference/webrtc) | Historical Chromium/WebRTC notes |
| [Media](https://opennow.zortos.me/docs/reference/media) | Screenshots, recordings, and local storage |
| [Input](https://opennow.zortos.me/docs/reference/input) | Shortcuts, pointer lock, gamepad, microphone |
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

These pages are anchored to the upstream repo's README, `opennow-qt/README.md`, and Rust/Qt source under `opennow-qt/` and `native/`. When the app changes, update docs to match. Prefer `OpenNOW-Qt-…` package guidance from the upstream README over historical Electron release notes.
