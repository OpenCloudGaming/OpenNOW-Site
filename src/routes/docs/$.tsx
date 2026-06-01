import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { createServerFn } from '@tanstack/react-start';
import { slugsToMarkdownPath, source } from '@/lib/source';
import browserCollections from 'collections/browser';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { baseOptions } from '@/lib/layout.shared';
import { gitConfig } from '@/lib/shared';
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import { Code2, Download, MonitorPlay } from 'lucide-react';
import { Suspense } from 'react';
import { useMDXComponents } from '@/components/mdx';

export const Route = createFileRoute('/docs/$')({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split('/') ?? [];
    const data = await loader({ data: slugs });
    await clientLoader.preload(data.path);
    return data;
  },
});

const loader = createServerFn({
  method: 'GET',
})
  .inputValidator((slugs: string[]) => slugs)
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) throw notFound();

    return {
      path: page.path,
      markdownUrl: slugsToMarkdownPath(page.slugs).url,
      pageTree: await source.serializePageTree(source.getPageTree()),
    };
  });

const clientLoader = browserCollections.docs.createClientLoader({
  component(
    { toc, frontmatter, default: MDX },
    // you can define props for the component
    {
      markdownUrl,
      path,
    }: {
      markdownUrl: string;
      path: string;
    },
  ) {
    return (
      <DocsPage
        toc={toc}
        tableOfContent={{
          style: 'clerk',
          header: <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-fd-muted-foreground">On this page</p>,
        }}
      >
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <div className="-mt-3 mb-2 flex flex-wrap items-center gap-2 border-b pb-6">
          <MarkdownCopyButton markdownUrl={markdownUrl} />
          <ViewOptionsPopover
            markdownUrl={markdownUrl}
            githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${path}`}
          />
        </div>
        <DocsBody>
          <MDX components={useMDXComponents()} />
        </DocsBody>
      </DocsPage>
    );
  },
});

function Page() {
  const { pageTree, path, markdownUrl } = useFumadocsLoader(Route.useLoaderData());

  return (
    <DocsLayout
      {...baseOptions()}
      tree={pageTree}
      tabMode="top"
      sidebar={{
        collapsible: true,
        banner: (
          <a
            href="https://github.com/OpenCloudGaming/OpenNOW/releases"
            className="mb-3 flex items-center gap-3 rounded-xl border bg-fd-card p-3 text-sm transition hover:bg-fd-accent"
          >
            <span className="grid size-9 place-items-center rounded-lg bg-emerald-400/10 text-emerald-500">
              <Download className="size-4" />
            </span>
            <span>
              <span className="block font-medium">Latest release</span>
              <span className="text-xs text-fd-muted-foreground">Grab desktop builds</span>
            </span>
          </a>
        ),
        footer: (
          <div className="space-y-2 text-xs text-fd-muted-foreground">
            <a className="flex items-center gap-2 transition hover:text-fd-foreground" href="https://github.com/OpenCloudGaming/OpenNOW">
              <Code2 className="size-3.5" />
              App repository
            </a>
            <Link className="flex items-center gap-2 transition hover:text-fd-foreground" to="/">
              <MonitorPlay className="size-3.5" />
              OpenNOW home
            </Link>
          </div>
        ),
      }}
    >
      <Link to={markdownUrl} hidden />
      <Suspense>{clientLoader.useContent(path, { markdownUrl, path })}</Suspense>
    </DocsLayout>
  );
}
