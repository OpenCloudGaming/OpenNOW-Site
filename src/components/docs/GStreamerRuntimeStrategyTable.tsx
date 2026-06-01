import { gstreamerRuntimeStrategies } from '@/lib/docsData';
import { DocsTable } from './DocsTable';

export default function GStreamerRuntimeStrategyTable() {
  return (
    <DocsTable
      columns={[
        { key: 'platform', header: 'Platform' },
        { key: 'referenceStrategy', header: 'Runtime strategy' },
      ]}
      rows={gstreamerRuntimeStrategies}
    />
  );
}
