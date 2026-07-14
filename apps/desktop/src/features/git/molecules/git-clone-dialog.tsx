import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '@launchos/ui';
import { useCallback } from 'react';

import { fileSystemService } from '@/modules/filesystem';
import { useWorkspaceManagerStore } from '@/modules/workspace-manager';
import { useGitStore } from '@/stores/git-store';

export function GitCloneDialog() {
  const open = useGitStore((state) => state.cloneOpen);
  const url = useGitStore((state) => state.cloneUrl);
  const destination = useGitStore((state) => state.cloneDestination);
  const busy = useGitStore((state) => state.busy);
  const errorMessage = useGitStore((state) => state.errorMessage);
  const setCloneOpen = useGitStore((state) => state.setCloneOpen);
  const setCloneUrl = useGitStore((state) => state.setCloneUrl);
  const setCloneDestination = useGitStore((state) => state.setCloneDestination);
  const cloneRepo = useGitStore((state) => state.cloneRepo);
  const switchWorkspace = useWorkspaceManagerStore((state) => state.switchWorkspace);

  const pickDestination = useCallback(async () => {
    try {
      const folder = await fileSystemService.openFolder({
        title: 'Clone into…',
      });
      if (folder) {
        setCloneDestination(folder);
      }
    } catch {
      // Dialog unavailable in web / cancelled.
    }
  }, [setCloneDestination]);

  const onClone = useCallback(async () => {
    const path = await cloneRepo();
    if (!path) {
      return;
    }
    try {
      await switchWorkspace(path);
    } catch {
      // Opening is best-effort after a successful clone.
    }
  }, [cloneRepo, switchWorkspace]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setCloneOpen(next);
      }}
    >
      <DialogContent className="max-w-md p-0">
        <DialogHeader>
          <DialogTitle>Clone Repository</DialogTitle>
          <DialogDescription>
            Clone a remote Git repository into a local folder, then open it in LaunchOS.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 px-4 py-2">
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-muted-foreground">Repository URL</span>
            <Input
              value={url}
              placeholder="https://github.com/org/repo.git"
              disabled={busy}
              onChange={(event) => {
                setCloneUrl(event.target.value);
              }}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-muted-foreground">Destination</span>
            <div className="flex gap-1">
              <Input
                value={destination}
                placeholder="/absolute/path/to/folder"
                disabled={busy}
                onChange={(event) => {
                  setCloneDestination(event.target.value);
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shrink-0"
                disabled={busy}
                onClick={() => {
                  void pickDestination();
                }}
              >
                Browse
              </Button>
            </div>
          </label>
          {errorMessage && open ? <p className="text-destructive text-xs">{errorMessage}</p> : null}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              setCloneOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={busy || !url.trim() || !destination.trim()}
            onClick={() => {
              void onClone();
            }}
          >
            {busy ? 'Cloning…' : 'Clone'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
