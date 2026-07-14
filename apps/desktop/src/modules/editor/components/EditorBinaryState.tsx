import { FileWarning } from 'lucide-react';

import { EmptyState } from '@/components/molecules/empty-state';

interface EditorBinaryStateProps {
  fileName: string;
}

/** Shown when a binary/media file cannot be opened in Monaco. */
export function EditorBinaryState({ fileName }: EditorBinaryStateProps) {
  return (
    <EmptyState
      icon={FileWarning}
      title="Binary file"
      description={`${fileName} is a binary file and cannot be opened in the text editor.`}
    />
  );
}
