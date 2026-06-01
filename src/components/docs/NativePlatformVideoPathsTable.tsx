import { nativePlatformVideoPaths } from '@/lib/docsData';
import { DocsTable } from './DocsTable';

interface NativePlatformVideoPathsTableProps {
  variant?: 'concise' | 'preferred';
}

export default function NativePlatformVideoPathsTable({ variant = 'concise' }: NativePlatformVideoPathsTableProps) {
  return (
    <DocsTable
      columns={[
        { key: 'platform', header: 'Platform' },
        {
          key: variant === 'preferred' ? 'preferredPaths' : 'concisePaths',
          header: variant === 'preferred' ? 'Preferred paths' : 'Native backend paths',
        },
      ]}
      rows={nativePlatformVideoPaths}
    />
  );
}
