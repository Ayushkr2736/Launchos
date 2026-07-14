import { useGitStore } from '@/stores/git-store';

/** Simple unified-diff viewer with basic coloring. */
export function GitDiffView() {
  const selectedDiff = useGitStore((state) => state.selectedDiff);
  const diffText = useGitStore((state) => state.diffText);
  const diffLoading = useGitStore((state) => state.diffLoading);

  if (!selectedDiff) {
    return (
      <p className="text-muted-foreground px-3 py-6 text-center text-[11px]">
        Select a changed file to view its diff.
      </p>
    );
  }

  if (diffLoading) {
    return <p className="text-muted-foreground px-3 py-6 text-center text-[11px]">Loading diff…</p>;
  }

  const lines = diffText.split('\n');

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-border text-muted-foreground flex h-7 shrink-0 items-center border-b px-2 text-[10px]">
        <span className="text-foreground truncate font-medium">{selectedDiff.path ?? 'Diff'}</span>
        <span className="ml-2 shrink-0">{selectedDiff.staged ? 'Staged' : 'Working tree'}</span>
      </div>
      <pre className="min-h-0 flex-1 overflow-auto p-2 font-mono text-[11px] leading-relaxed">
        {lines.map((line, index) => {
          let color = 'text-muted-foreground';
          if (line.startsWith('+') && !line.startsWith('+++')) {
            color = 'text-emerald-500';
          } else if (line.startsWith('-') && !line.startsWith('---')) {
            color = 'text-red-400';
          } else if (line.startsWith('@@')) {
            color = 'text-sky-400';
          } else if (line.startsWith('diff ') || line.startsWith('index ')) {
            color = 'text-foreground';
          }
          return (
            <div key={`${index}:${line.slice(0, 24)}`} className={color}>
              {line || ' '}
            </div>
          );
        })}
      </pre>
    </div>
  );
}
