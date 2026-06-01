import { gstreamerRuntimeStrategies } from '@/lib/docsData';
import { DocsTable } from './DocsTable';

export default function ReleasePackageMatrixTable() {
  return (
    <DocsTable
      columns={[
        { key: 'platform', header: 'Target' },
        { key: 'releaseBehavior', header: 'Native/GStreamer behavior' },
        { key: 'artifacts', header: 'Artifacts' },
      ]}
      rows={gstreamerRuntimeStrategies}
    />
  );
}
