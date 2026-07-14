import { useWorkspaceStore } from '@/stores/workspace-store';

export function WorkspaceName() {
  const workspaceName = useWorkspaceStore((state) => state.workspaceName);

  return (
    <div className="text-foreground min-w-0 max-w-[14rem] truncate text-sm font-medium">
      {workspaceName}
    </div>
  );
}
