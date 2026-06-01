import { dataChannels } from '@/lib/docsData';
import { DocsTable } from './DocsTable';

export default function DataChannelsTable() {
  return (
    <DocsTable
      columns={[
        { key: 'channel', header: 'Channel', code: true },
        { key: 'reliability', header: 'Reliability' },
        { key: 'traffic', header: 'Traffic' },
      ]}
      rows={dataChannels}
    />
  );
}
