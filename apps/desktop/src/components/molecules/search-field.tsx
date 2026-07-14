import { cn, Input } from '@launchos/ui';
import { Search } from 'lucide-react';
import { forwardRef, type InputHTMLAttributes } from 'react';

interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  containerClassName?: string;
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ className, containerClassName, ...props }, ref) => {
    return (
      <div className={cn('relative', containerClassName)}>
        <Search
          className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
          aria-hidden
        />
        <Input ref={ref} className={cn('h-8 pl-8', className)} type="search" {...props} />
      </div>
    );
  },
);
SearchField.displayName = 'SearchField';
