import { createFileRoute, Link } from '@tanstack/react-router';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import browserCollections from 'collections/browser';
import { DocsBody, DocsPage } from 'fumadocs-ui/layouts/docs/page';
import { TOCProvider } from 'fumadocs-ui/layouts/docs/page/slots/toc';
import { gitConfig } from '@/lib/shared';
import { loadDocsPageData } from '@/lib/docsLoader';
import { DocsError } from '@/components/docs-error';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import { Suspense, useEffect } from 'react';
import { useMDXComponents } from '@/components/mdx';
import { track } from '@/lib/analytics';
import { createConsoleSlots } from '@/components/docs-layout/slots';
import { ConsoleArticle, ConsolePageHeader, ConsolePager, ConsoleTocPanel, MobileToc, NoTocPopover } from '@/components/docs-layout/page';
import { DocsHero, JumpTo } from '@/components/docs-layout/home';

export const Route = createFileRoute('/docs/$')({
  component: Page,
  errorComponent: DocsError,
  loader: async ({ params }) => {
    const slugs = params._splat?.split('/') ?? [];
    const data = await loadDocsPageData(slugs);
    await clientLoader.preload(data.path);
    return data;
  },
});

const layoutSlots = createConsoleSlots({
  onTopBarLink: (target) => {
    if (target === 'home') track('docs_footer_link_clicked', { target: 'home' });
    if (target === 'github') track('docs_footer_link_clicked', { target: 'app_repository' });
  },
  onStatusBarLink: (target) => {
    if (target === 'stable' || target === 'nightly' || target === 'releases') track('docs_sidebar_release_clicked', { target });
    if (target === 'github') track('docs_footer_link_clicked', { target: 'app_repository' });
  },
});

const pageSlots = {
  container: ConsoleArticle,
  footer: ConsolePager,
  toc: { provider: TOCProvider, main: ConsoleTocPanel, popover: NoTocPopover },
};

const clientLoader = browserCollections.docs.createClientLoader({
  component({ toc, frontmatter, default: MDX }, { markdownUrl, path }: { markdownUrl: string; path: string }) {
    const isHome = path === 'index.mdx';
    return (
      <DocsPage toc={toc} slots={pageSlots} breadcrumb={{ enabled: false }}>
        {isHome ? <DocsHero /> : null}
        <div className="flex flex-col gap-6 lg:gap-11">
          <ConsolePageHeader
            title={frontmatter.title}
            description={frontmatter.description}
            markdownUrl={markdownUrl}
            githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${path}`}
          />
          <MobileToc />
        </div>
        {isHome ? <JumpTo /> : null}
        <DocsBody className="console-prose">
          <MDX components={useMDXComponents()} />
        </DocsBody>
      </DocsPage>
    );
  },
});

function Page() {
  const { pageTree, path, markdownUrl } = useFumadocsLoader(Route.useLoaderData());

  useEffect(() => {
    track('docs_page_viewed', { path, markdown_url: markdownUrl });
  }, [path, markdownUrl]);

  return (
    <DocsLayout tree={pageTree} tabs={false} themeSwitch={{ enabled: false }} slots={layoutSlots}>
      <Link to={markdownUrl} hidden />
      <Suspense>{clientLoader.useContent(path, { markdownUrl, path })}</Suspense>
    </DocsLayout>
  );
}
