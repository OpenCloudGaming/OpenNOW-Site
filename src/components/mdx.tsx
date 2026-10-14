import defaultMdxComponents from 'fumadocs-ui/mdx';
import { isValidElement, type ComponentProps } from 'react';
import type { MDXComponents } from 'mdx/types';
import { SectionHeading } from '@/components/docs/SectionHeading';
import { TerminalCode } from '@/components/docs/TerminalCode';
import { MdxTable } from '@/components/docs/MdxTable';
import { AppFigure } from '@/components/docs/AppFigure';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    h2: SectionHeading,
    pre: TerminalCode,
    table: MdxTable,
    img: AppFigure,
    p: ({ children, ...props }: ComponentProps<'p'>) =>
      isValidElement(children) && children.type === AppFigure ? children : <p {...props}>{children}</p>,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
