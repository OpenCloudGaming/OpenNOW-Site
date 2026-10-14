import { defineConfig, defineDocs } from 'fumadocs-mdx/config';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

const searchableAttributes = ['title', 'description', 'name'];

export default defineConfig({
  mdxOptions: {
    remarkStructureOptions: {
      stringify: {
        stringify(node) {
          if (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') return;
          if (node.children.length > 0) return;

          return node.attributes
            .flatMap((attr) =>
              attr.type === 'mdxJsxAttribute' && typeof attr.value === 'string' && searchableAttributes.includes(attr.name)
                ? [attr.value]
                : [],
            )
            .join(': ');
        },
      },
    },
  },
});
