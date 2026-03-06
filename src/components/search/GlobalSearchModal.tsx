import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { FileText, Flag, FolderKanban, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { listClients } from "@/api/clients";
import { listRecentProjectFilesForSearch } from "@/api/files";
import { listAdminProjects, listMyProjects } from "@/api/projects";
import { listRecentMilestonesForSearch } from "@/api/project-workspace";
import { SearchInput } from "@/components/search/SearchInput";
import { cn } from "@/lib/utils";

type SearchGroupKey = "projects" | "clients" | "files" | "milestones";

interface SearchResultItem {
  group: SearchGroupKey;
  href: string;
  id: string;
  subtitle?: string;
  title: string;
}

interface IndexedSearchResultItem extends SearchResultItem {
  flatIndex: number;
}

interface GlobalSearchModalProps {
  isAdmin: boolean;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const GROUP_LABELS: Record<SearchGroupKey, string> = {
  clients: "Clients",
  files: "Files",
  milestones: "Milestones",
  projects: "Projects",
};

const GROUP_ORDER: SearchGroupKey[] = ["projects", "clients", "files", "milestones"];

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function GlobalSearchModal({ isAdmin, onOpenChange, open }: GlobalSearchModalProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const projectsQuery = useQuery({
    enabled: open,
    queryFn: isAdmin ? listAdminProjects : listMyProjects,
    queryKey: ["search", "projects", isAdmin ? "admin" : "client"],
  });

  const clientsQuery = useQuery({
    enabled: open && isAdmin,
    queryFn: listClients,
    queryKey: ["search", "clients"],
  });

  const filesQuery = useQuery({
    enabled: open && isAdmin,
    queryFn: () => listRecentProjectFilesForSearch(80),
    queryKey: ["search", "files", "recent"],
  });

  const milestonesQuery = useQuery({
    enabled: open && isAdmin,
    queryFn: () => listRecentMilestonesForSearch(80),
    queryKey: ["search", "milestones", "recent"],
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setQuery("");
    setDebouncedQuery("");
    setActiveIndex(0);
  }, [open]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 150);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  const groupedResults = useMemo(() => {
    const normalizedQuery = normalize(debouncedQuery);
    const maxPerGroup = normalizedQuery ? 7 : 5;

    const projects: SearchResultItem[] = (projectsQuery.data ?? [])
      .filter((project) => {
        const haystack = normalize(`${project.title} ${project.description ?? ""} ${project.clients?.name ?? ""}`);
        return normalizedQuery.length === 0 || haystack.includes(normalizedQuery);
      })
      .slice(0, maxPerGroup)
      .map((project) => ({
        group: "projects",
        href: isAdmin ? `/admin/projects/${project.id}` : `/project/${project.id}`,
        id: `project:${project.id}`,
        subtitle: project.clients?.name ? `Client: ${project.clients.name}` : undefined,
        title: project.title,
      }));

    const clients: SearchResultItem[] = (clientsQuery.data ?? [])
      .filter((client) => {
        const haystack = normalize(`${client.name} ${client.email} ${client.company ?? ""}`);
        return normalizedQuery.length === 0 || haystack.includes(normalizedQuery);
      })
      .slice(0, maxPerGroup)
      .map((client) => ({
        group: "clients",
        href: `/admin/clients/${client.id}`,
        id: `client:${client.id}`,
        subtitle: client.email,
        title: client.name,
      }));

    const files: SearchResultItem[] = (filesQuery.data ?? [])
      .filter((file) => {
        const haystack = normalize(`${file.filename} ${file.projects?.title ?? ""}`);
        return normalizedQuery.length === 0 || haystack.includes(normalizedQuery);
      })
      .slice(0, maxPerGroup)
      .map((file) => ({
        group: "files",
        href: `/admin/projects/${file.project_id}?tab=overview#file-upload`,
        id: `file:${file.id}`,
        subtitle: file.projects?.title ? `Project: ${file.projects.title}` : "Project file",
        title: file.filename,
      }));

    const milestones: SearchResultItem[] = (milestonesQuery.data ?? [])
      .filter((milestone) => {
        const haystack = normalize(`${milestone.title} ${milestone.projects?.title ?? ""}`);
        return normalizedQuery.length === 0 || haystack.includes(normalizedQuery);
      })
      .slice(0, maxPerGroup)
      .map((milestone) => ({
        group: "milestones",
        href: `/admin/projects/${milestone.project_id}?tab=milestones`,
        id: `milestone:${milestone.id}`,
        subtitle: milestone.projects?.title ? `Project: ${milestone.projects.title}` : "Milestone",
        title: milestone.title,
      }));

    return {
      clients,
      files,
      milestones,
      projects,
    };
  }, [clientsQuery.data, debouncedQuery, filesQuery.data, isAdmin, milestonesQuery.data, projectsQuery.data]);

  const indexedGroups = useMemo(
    () => {
      let runningIndex = 0;

      return GROUP_ORDER.map((group) => ({
        key: group,
        label: GROUP_LABELS[group],
        items: groupedResults[group].map((item) => {
          const indexedItem: IndexedSearchResultItem = {
            ...item,
            flatIndex: runningIndex,
          };

          runningIndex += 1;
          return indexedItem;
        }),
      }));
    },
    [groupedResults],
  );

  const flatResults = useMemo(() => indexedGroups.flatMap((group) => group.items), [indexedGroups]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (flatResults.length === 0) {
      setActiveIndex(-1);
      return;
    }

    setActiveIndex((current) => {
      if (current < 0 || current >= flatResults.length) {
        return 0;
      }

      return current;
    });
  }, [flatResults, open]);

  function handleSelect(item: SearchResultItem) {
    onOpenChange(false);
    navigate(item.href);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown") {
      if (flatResults.length === 0) {
        return;
      }

      event.preventDefault();
      setActiveIndex((current) => {
        const nextIndex = current + 1;
        return nextIndex >= flatResults.length ? 0 : nextIndex;
      });
      return;
    }

    if (event.key === "ArrowUp") {
      if (flatResults.length === 0) {
        return;
      }

      event.preventDefault();
      setActiveIndex((current) => {
        const nextIndex = current - 1;
        return nextIndex < 0 ? flatResults.length - 1 : nextIndex;
      });
      return;
    }

    if (event.key === "Enter") {
      const selectedItem = flatResults[activeIndex];
      if (!selectedItem) {
        return;
      }

      event.preventDefault();
      handleSelect(selectedItem);
      return;
    }

    if (event.key === "Escape") {
      onOpenChange(false);
    }
  }

  const hasAnyResults = flatResults.length > 0;
  const isLoading =
    projectsQuery.isLoading || (isAdmin && (clientsQuery.isLoading || filesQuery.isLoading || milestonesQuery.isLoading));

  return (
    <DialogPrimitive.Root onOpenChange={onOpenChange} open={open}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm transition-opacity duration-200 data-[state=closed]:opacity-0 data-[state=open]:opacity-100" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-[90] w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200/90 bg-white p-4 shadow-xl outline-none transition-all duration-200 data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100"
          onKeyDown={handleKeyDown}
        >
          <div className="space-y-3">
            <SearchInput
              aria-label="Command palette search"
              autoFocus
              containerClassName="w-full"
              onValueChange={setQuery}
              placeholder="Search..."
              value={query}
            />

            <div className="max-h-[60vh] overflow-y-auto pr-1">
              {isLoading ? <p className="px-2 py-8 text-center text-sm text-slate-500">Loading results...</p> : null}

              {!isLoading && !hasAnyResults ? (
                <p className="px-2 py-8 text-center text-sm text-slate-500">No matching results found.</p>
              ) : null}

              {!isLoading && hasAnyResults ? (
                <div className="space-y-3">
                  {indexedGroups.map((group) => {
                    if (group.items.length === 0) {
                      return null;
                    }

                    return (
                      <div key={group.key}>
                        <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{group.label}</p>
                        <div className="space-y-1">
                          {group.items.map((item) => {
                            const isActive = item.flatIndex === activeIndex;
                            return (
                              <button
                                className={cn(
                                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors duration-150",
                                  isActive ? "bg-violet-50 text-violet-900" : "text-slate-700 hover:bg-slate-100",
                                )}
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                onMouseEnter={() => setActiveIndex(item.flatIndex)}
                                type="button"
                              >
                                <span
                                  className={cn(
                                    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                                    isActive ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-500",
                                  )}
                                >
                                  {item.group === "projects" ? <FolderKanban className="h-4 w-4" /> : null}
                                  {item.group === "clients" ? <UserRound className="h-4 w-4" /> : null}
                                  {item.group === "files" ? <FileText className="h-4 w-4" /> : null}
                                  {item.group === "milestones" ? <Flag className="h-4 w-4" /> : null}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-sm font-medium">{item.title}</span>
                                  {item.subtitle ? <span className="block truncate text-xs text-slate-500">{item.subtitle}</span> : null}
                                </span>
                                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{item.group}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
