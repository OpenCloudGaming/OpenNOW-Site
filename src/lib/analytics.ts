import posthog from 'posthog-js';
import type { ConfigDefaults, PostHogConfig } from 'posthog-js';

/**
 * PostHog configuration for the OpenNOW docs site.
 *
 * The project key is a public, write-only ingestion key (safe to ship in a
 * static client bundle). Host values can be overridden at build time via Vite
 * env vars so self-hosted / preview deployments can repoint the reverse proxy
 * without code changes.
 */
export const POSTHOG_KEY: string =
  import.meta.env.VITE_POSTHOG_KEY ?? 'phc_xxPHzAtStRmmVnGyZrZCinTfKv6dVTQSH5C9nC7QM4yf';

/** Managed reverse-proxy domain that forwards to PostHog ingestion. */
export const POSTHOG_API_HOST: string = import.meta.env.VITE_POSTHOG_HOST ?? 'https://t.zortos.me';

/** Real PostHog UI host, required so generated links resolve when proxying. */
export const POSTHOG_UI_HOST: string =
  import.meta.env.VITE_POSTHOG_UI_HOST ?? 'https://eu.posthog.com/';

const POSTHOG_DEFAULTS: ConfigDefaults = '2026-05-30';

export const posthogOptions: Partial<PostHogConfig> = {
  api_host: POSTHOG_API_HOST,
  ui_host: POSTHOG_UI_HOST,
  // Opt into the latest default behaviors: history-based SPA pageviews,
  // head script injection (SSR-safe), and current autocapture defaults.
  defaults: POSTHOG_DEFAULTS,
  // Only create person profiles for identified users; anonymous docs readers
  // are still tracked at the event level without consuming person quota.
  person_profiles: 'identified_only',
};

/**
 * Every explicit, named action we flag in the docs UI. Autocapture still
 * records generic clicks/inputs/pageviews on top of these; these custom events
 * exist so the high-signal conversions have stable names and typed properties.
 */
export type AnalyticsEvent =
  | 'docs_page_viewed'
  | 'home_cta_clicked'
  | 'home_doc_card_clicked'
  | 'home_open_full_docs_clicked'
  | 'docs_sidebar_release_clicked'
  | 'docs_footer_link_clicked'
  | 'docs_search_performed'
  | 'outbound_link_clicked';

type AnalyticsProperties = Record<string, unknown>;

/** Thin, typed wrapper around posthog.capture. No-op until the SDK is loaded. */
export function track(event: AnalyticsEvent, properties?: AnalyticsProperties): void {
  if (typeof window === 'undefined') return;
  if (!posthog.__loaded) return;
  posthog.capture(event, properties);
}

export { posthog };
