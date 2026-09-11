import { nativeStreamerEnvironmentVariables } from '@/lib/docsData';
import { DocsTable } from './DocsTable';

interface NativeEnvironmentVariablesTableProps {
  variant?: 'reference' | 'advanced';
}

export default function NativeEnvironmentVariablesTable({
  variant = 'reference',
}: NativeEnvironmentVariablesTableProps) {
  const columns =
    variant === 'advanced'
      ? [
          { key: 'variable', header: 'Variable', code: true },
          { key: 'diagnosticPurpose', fallbackKey: 'purpose', header: 'Purpose' },
        ]
      : [
          { key: 'variable', header: 'Variable', code: true },
          { key: 'setBy', header: 'Set by' },
          { key: 'purpose', header: 'Purpose' },
        ];

  return <DocsTable columns={columns} rows={nativeStreamerEnvironmentVariables} />;
}
