import { Children, isValidElement, type ComponentProps, type ReactElement, type ReactNode } from 'react';
import { DataGrid } from './DataGrid';

type WithChildren = ReactElement<{ children?: ReactNode }>;

const elements = (node: ReactNode): WithChildren[] =>
  Children.toArray(node).filter((child): child is WithChildren => isValidElement(child));

/** Markdown tables → DataGrid. Reads the thead/tbody/tr/th/td elements MDX produces. */
export function MdxTable({ children }: ComponentProps<'table'>) {
  const sections = elements(children);
  const rowsOf = (tag: string) => sections.filter((s) => s.type === tag).flatMap((s) => elements(s.props.children));
  const cellsOf = (row: WithChildren) => elements(row.props.children).map((cell) => cell.props.children);
  const [head, ...headBody] = rowsOf('thead');
  const body = [...headBody, ...rowsOf('tbody')];
  if (!head) return <table>{children}</table>;
  return <DataGrid headers={cellsOf(head)} rows={body.map(cellsOf)} />;
}
