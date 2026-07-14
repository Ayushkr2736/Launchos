import { PanelHeader } from '@/components/molecules/panel-header';
import { useIncrementalSearch } from '@/features/search/hooks/use-incremental-search';
import { SearchForm } from '@/features/search/molecules/search-form';
import { SearchResults } from '@/features/search/molecules/search-results';
import { useProjectStore } from '@/stores/project-store';

export function SearchPanel() {
  useIncrementalSearch();
  const workspacePath = useProjectStore((state) => state.workspacePath);

  if (!workspacePath) {
    return (
      <div className="flex h-full flex-col">
        <PanelHeader title="Search" />
        <p className="text-muted-foreground px-3 py-8 text-center text-xs">
          Open a folder to search filenames and file contents, or replace across the workspace.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PanelHeader title="Search" />
      <SearchForm />
      <SearchResults />
    </div>
  );
}
