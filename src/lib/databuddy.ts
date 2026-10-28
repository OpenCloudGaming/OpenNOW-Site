/**
 * Databuddy configuration for the OpenNOW docs site.
 *
 * The client ID is a public, write-only ingestion identifier (safe to ship in a
 * static client bundle). It can be overridden at build time via a Vite env var
 * so preview / self-hosted deployments can point at a different Databuddy site
 * without code changes.
 */
export const DATABUDDY_CLIENT_ID: string =
  import.meta.env.VITE_DATABUDDY_CLIENT_ID ?? '68ffafef-93aa-4a06-bfe3-98ee8bf2fe1f';
