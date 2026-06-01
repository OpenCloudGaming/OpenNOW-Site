import { localDataLocations } from '@/lib/docsData';
import { DocsTable } from './DocsTable';

interface LocalDataLocationsTableProps {
  variant?: 'data' | 'media';
  pathHeader?: string;
}

export default function LocalDataLocationsTable({
  variant = 'data',
  pathHeader = 'Location',
}: LocalDataLocationsTableProps) {
  const mediaRows = ['screenshots', 'recordings', 'thumbnailCache'].map(
    (key) => localDataLocations.find((row) => row.key === key)!,
  );

  if (variant === 'media') {
    return (
      <DocsTable
        columns={[
          { key: 'mediaType', header: 'Type' },
          { key: 'path', header: 'Directory' },
          { key: 'format', header: 'Format' },
        ]}
        rows={mediaRows}
      />
    );
  }

  return (
    <DocsTable
      columns={[
        { key: 'data', header: 'Data' },
        { key: 'path', header: pathHeader },
      ]}
      rows={localDataLocations}
    />
  );
}
