import { FileCode2 } from 'lucide-react';

import { EmptyState } from '@/components/molecules/empty-state';

interface EditorEmptyStateProps {
  title?: string;
  description?: string;
}

/** Empty chrome when no document is open in the editor surface. */
export function EditorEmptyState({
  title = 'No file open',
  description = 'Select a file from the explorer or open a new tab to start editing.',
}: EditorEmptyStateProps) {
  return <EmptyState icon={FileCode2} title={title} description={description} />;
}
