import { useEffect, useState } from 'react';

import type { FileSystemProvider } from '@/features/explorer/fs/types';

/** Forces React re-render when the active filesystem notifies subscribers. */
export function useFileSystemRevision(provider: FileSystemProvider): number {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    return provider.subscribe(() => {
      setRevision((value) => value + 1);
    });
  }, [provider]);

  return revision;
}
