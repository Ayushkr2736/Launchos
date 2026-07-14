export interface TerminalSessionController {
  clear: () => void;
  copy: () => Promise<boolean>;
  paste: () => Promise<boolean>;
  focus: () => void;
  hasSelection: () => boolean;
}

const controllers = new Map<string, TerminalSessionController>();

export function registerTerminalSession(
  id: string,
  controller: TerminalSessionController,
): () => void {
  controllers.set(id, controller);
  return () => {
    if (controllers.get(id) === controller) {
      controllers.delete(id);
    }
  };
}

export function getTerminalSession(id: string): TerminalSessionController | undefined {
  return controllers.get(id);
}

export function clearTerminalSession(id: string): boolean {
  const controller = controllers.get(id);
  if (!controller) {
    return false;
  }
  controller.clear();
  return true;
}

export async function copyTerminalSession(id: string): Promise<boolean> {
  return (await controllers.get(id)?.copy()) ?? false;
}

export async function pasteTerminalSession(id: string): Promise<boolean> {
  return (await controllers.get(id)?.paste()) ?? false;
}

export function focusTerminalSession(id: string): void {
  controllers.get(id)?.focus();
}
