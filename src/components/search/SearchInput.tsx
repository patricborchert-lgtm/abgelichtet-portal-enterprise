import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  containerClassName?: string;
  onValueChange?: (value: string) => void;
  showShortcut?: boolean;
  value?: string;
}

export function SearchInput({
  className,
  containerClassName,
  onValueChange,
  showShortcut = false,
  value,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative", containerClassName)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        className={cn(
          "h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-16 text-sm text-slate-800 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20",
          className,
        )}
        onChange={(event) => onValueChange?.(event.target.value)}
        value={value ?? ""}
        {...props}
      />
      {showShortcut ? (
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
          ⌘K
        </span>
      ) : null}
    </div>
  );
}
