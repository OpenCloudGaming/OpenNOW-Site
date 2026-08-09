import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import * as React from 'react';
import appCss from '@/styles/app.css?url';
import { RootProvider } from 'fumadocs-ui/provider/tanstack';
import { PostHogProvider } from 'posthog-js/react';
import SearchDialog from '@/components/search';
import { POSTHOG_KEY, posthogOptions } from '@/lib/analytics';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'OpenNOW Docs' },
      {
        name: 'description',
        content: 'Download, configure, and troubleshoot OpenNOW, the open-source GeForce NOW client for desktop, mobile, and Nintendo Switch.',
      },
      { name: 'theme-color', content: '#071410' },
      { property: 'og:site_name', content: 'OpenNOW Docs' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'OpenNOW — Open-source GeForce NOW client' },
      { property: 'og:description', content: 'Install, tune, and troubleshoot OpenNOW across desktop, mobile, and Nintendo Switch.' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-screen flex-col">
        <PostHogProvider apiKey={POSTHOG_KEY} options={posthogOptions}>
          <RootProvider search={{ SearchDialog }}>
            <Outlet />
          </RootProvider>
        </PostHogProvider>
        <Scripts />
      </body>
    </html>
  );
}
