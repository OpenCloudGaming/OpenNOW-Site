import { notFound } from '@tanstack/react-router';
import type { SerializedPageTree } from 'fumadocs-core/source/client';
import { slugsToMarkdownPath } from '@/lib/source';

export type DocsLoaderData = {
  path: string;
  markdownUrl: string;
  pageTree: SerializedPageTree;
};

export async function loadDocsPageData(slugs: string[]): Promise<DocsLoaderData> {
  if (import.meta.env.SSR) {
    const { source } = await import('@/lib/source');
    const page = source.getPage(slugs);
    if (!page) throw notFound();

    return {
      path: page.path,
      markdownUrl: slugsToMarkdownPath(page.slugs).url,
      pageTree: await source.serializePageTree(source.getPageTree()),
    };
  }

  const { getDocsPageData, pageTree } = await import('@/lib/docsStaticData.gen');
  const page = getDocsPageData(slugs);
  if (!page) throw notFound();

  return {
    ...page,
    pageTree,
  };
}
