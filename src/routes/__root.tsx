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
        content: 'Documentation for OpenNOW, the open-source Electron GeForce NOW client.',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html suppressHydrationWarning>
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
