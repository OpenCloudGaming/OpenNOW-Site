'use client';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { create } from '@orama/orama';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics';

function initOrama() {
  return create({
    schema: { _: 'string' },
    // https://docs.orama.com/docs/orama-js/supported-languages
    language: 'english',
  });
}

export default function DefaultSearchDialog(props: SharedProps) {
  const { locale } = useI18n(); // (optional) for i18n
  const { search, setSearch, query } = useDocsSearch({
    type: 'static',
    initOrama,
    locale,
  });

  // Flag executed searches once results settle. Debounced by waiting for the
  // query to finish loading, and de-duplicated per (term, result-count) pair so
  // a single search produces a single event rather than one per keystroke.
  const lastTrackedRef = useRef<string>('');
  useEffect(() => {
    const term = search.trim();
    if (!term || query.isLoading) return;
    const resultsCount = query.data && query.data !== 'empty' ? query.data.length : 0;
    const signature = `${term}::${resultsCount}`;
    if (lastTrackedRef.current === signature) return;
    lastTrackedRef.current = signature;
    track('docs_search_performed', { query: term, results_count: resultsCount });
  }, [search, query.isLoading, query.data]);

  return (
    <SearchDialog search={search} onSearchChange={setSearch} isLoading={query.isLoading} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={query.data !== 'empty' ? query.data : null} />
      </SearchDialogContent>
    </SearchDialog>
  );
}
