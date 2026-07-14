import { LoaderCircle } from 'lucide-react';

import { EmptyState } from '@/components/molecules/empty-state';

interface EditorLoadingStateProps {
  title?: string;
  description?: string;
}

/** Loading chrome while Monaco or document content is initializing. */
export function EditorLoadingState({
  title = 'Loading editor',
  description = 'Preparing the language services and document buffer.',
}: EditorLoadingStateProps) {
  return (
    <EmptyState
      icon={LoaderCircle}
      title={title}
      description={description}
      className="animate-pulse"
    />
  );
}
