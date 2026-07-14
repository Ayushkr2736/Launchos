import { FileCode2 } from 'lucide-react';

import { EmptyState } from '@/components/molecules/empty-state';

interface EditorBinaryStateProps {
  fileName: string;
}

/** Shown when a tab points at a binary / non-text file. */
export function EditorBinaryState({ fileName }: EditorBinaryStateProps) {
  return (
    <EmptyState
      icon={FileCode2}
      title="Binary file"
      description={`${fileName} is a binary file and cannot be opened in the text editor.`}
    />
  );
}
