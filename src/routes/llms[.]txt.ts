import { createFileRoute } from '@tanstack/react-router';
import { llms } from 'fumadocs-core/source';
import { getPageMarkdownUrl, source } from '@/lib/source';

const homeEntry =
  '- [OpenNOW home page](/): Download links for the desktop, Android, Nintendo Switch, and iPhone and iPad builds, the ports table showing every platform, its status, and its maintainer, and cards into the docs';

function renderIndex() {
  const tree = source.pageTree;
  const formatter = llms(source);
  const title = typeof tree.name === 'string' ? tree.name : 'OpenNOW';
  const description = typeof tree.description === 'string' ? tree.description : '';
  const docs = tree.children.map((node) => formatter.indexNode(node)).join('\n');
  const docsMarkdown = getPageMarkdownUrl([]).url;

  return [
    `# ${title}`,
    '',
    ...(description ? [`> ${description}`, ''] : []),
    '## Site',
    '',
    homeEntry,
    '',
    '## Docs',
    '',
    docs,
    '',
    '## Machine-readable copies',
    '',
    `- Every docs page is also served as plain Markdown: append \`.md\` to its URL, for example [\`${docsMarkdown}\`](${docsMarkdown}).`,
    '- [`/llms-full.txt`](/llms-full.txt): every docs page in full, as one document.',
  ].join('\n');
}

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET() {
        return new Response(renderIndex());
      },
    },
  },
});
