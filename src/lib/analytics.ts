import { isTrackerAvailable, track as trackEvent } from '@databuddy/sdk';

/**
 * Every explicit, named action we flag in the docs UI. Databuddy still records
 * page views, clicks, outgoing links, errors, and web vitals on its own; these
 * custom events exist so the high-signal conversions have stable names and
 * typed properties.
 */
export type AnalyticsEvent =
  | 'home_cta_clicked'
  | 'home_download_clicked'
  | 'home_doc_card_clicked'
  | 'home_open_full_docs_clicked'
  | 'docs_sidebar_release_clicked'
  | 'docs_footer_link_clicked'
  | 'docs_search_performed'
  | 'outbound_link_clicked';

type AnalyticsProperties = Record<string, unknown>;

/** Thin, typed wrapper around the Databuddy tracker. No-op until the SDK loads. */
export function track(event: AnalyticsEvent, properties?: AnalyticsProperties): void {
  if (typeof window === 'undefined') return;
  if (!isTrackerAvailable()) return;
  trackEvent(event, properties);
}
