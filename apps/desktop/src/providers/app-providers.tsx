import { TooltipProvider } from '@launchos/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

import { GitHost } from '@/features/git';
import { TerminalHost } from '@/features/terminal';
import { EditorProvider } from '@/modules/editor';
import { ThemeProvider } from '@/providers/theme-provider';
import { WindowProvider } from '@/providers/window-provider';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WindowProvider>
          <EditorProvider>
            <TooltipProvider delayDuration={200}>
              <TerminalHost />
              <GitHost />
              {children}
            </TooltipProvider>
          </EditorProvider>
        </WindowProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
