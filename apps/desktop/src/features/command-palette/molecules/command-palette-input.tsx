import { Kbd } from '@launchos/ui';
import { Command } from 'cmdk';
import { Search } from 'lucide-react';

interface CommandPaletteInputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function CommandPaletteInput({
  value,
  onValueChange,
  placeholder = 'Type a command or search…',
}: CommandPaletteInputProps) {
  return (
    <div className="border-border flex items-center gap-3 border-b px-4">
      <Search className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden />
      <Command.Input
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        aria-label="Search commands and files"
        autoFocus
        className="placeholder:text-muted-foreground flex h-12 w-full bg-transparent text-sm outline-none"
      />
      <Kbd>esc</Kbd>
    </div>
  );
}
