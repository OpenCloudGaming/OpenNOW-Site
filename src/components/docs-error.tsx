import { Link } from '@tanstack/react-router';
import { baseOptions } from '@/lib/layout.shared';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { AlertTriangle, RefreshCw } from 'lucide-react';

type DocsErrorProps = {
  error: Error;
  reset: () => void;
};

function isDocsDataLoadError(error: Error) {
  return (
    error.message.includes('Unexpected token') ||
    error.message.includes('is not valid JSON') ||
    error.message.includes('failed to fetch') ||
    error.message.includes('Failed to fetch')
  );
}

export function DocsError({ error, reset }: DocsErrorProps) {
  const docsDataError = isDocsDataLoadError(error);

  return (
    <HomeLayout {...baseOptions()}>
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-6 py-24 text-center">
        <div className="grid size-14 place-items-center rounded-2xl border border-amber-500/25 bg-amber-500/10 text-amber-500">
          <AlertTriangle className="size-7" />
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight">Couldn&apos;t load docs</h1>
          <p className="text-sm leading-7 text-fd-muted-foreground">
            {docsDataError
              ? 'The docs page data could not be loaded. This can happen when a network request is blocked or returns an unexpected response.'
              : 'Something went wrong while loading this docs page.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl border border-fd-border bg-fd-secondary px-4 py-2.5 text-sm font-medium transition hover:bg-fd-accent"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
          <a
            href="/docs"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
          >
            Open docs directly
          </a>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-fd-border px-4 py-2.5 text-sm font-medium transition hover:bg-fd-accent"
          >
            Back to home
          </Link>
        </div>
        {process.env.NODE_ENV !== 'production' ? (
          <pre className="w-full overflow-auto rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-left text-xs text-red-400">
            {error.message}
          </pre>
        ) : null}
      </div>
    </HomeLayout>
  );
}
