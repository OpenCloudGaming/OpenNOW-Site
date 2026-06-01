interface DocsTableColumn {
  key: string;
  header: string;
  code?: boolean;
  fallbackKey?: string;
}

type DocsTableRow = object;

interface DocsTableProps {
  columns: DocsTableColumn[];
  rows: DocsTableRow[];
}

function formatInline(value: string | undefined, code = false) {
  if (!value) return null;

  if (code) return <code>{value}</code>;

  const parts = value.split(/(`[^`]+`)/g);
  return parts.map((part, index) =>
    part.startsWith('`') && part.endsWith('`') ? <code key={index}>{part.slice(1, -1)}</code> : part,
  );
}

function getValue(row: DocsTableRow, column: DocsTableColumn) {
  const values = row as Record<string, string | undefined>;
  return values[column.key] ?? (column.fallbackKey ? values[column.fallbackKey] : undefined);
}

export function DocsTable({ columns, rows }: DocsTableProps) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key}>{column.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column) => (
              <td key={column.key}>{formatInline(getValue(row, column), column.code)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
