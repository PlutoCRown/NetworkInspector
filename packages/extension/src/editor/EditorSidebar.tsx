import { useEffect, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import { APP_NAME } from "@/shared/app/meta";
import type { AppConfig, RuleGroup } from "@/shared/types";
import { cn } from "@/lib/utils";

export type EditorNavSection = "rule-groups" | "processors" | "alias" | "about";

type ExpandableSection = "rule-groups" | "processors" | "alias";

interface EditorSidebarProps {
  section: EditorNavSection;
  onSectionChange: (section: EditorNavSection) => void;
  ruleGroups: RuleGroup[];
  config: AppConfig;
  selectedGroupId: string | null;
  selectedProcessorId: string | null;
  selectedAliasKey: string | null;
  onSelectGroup: (id: string) => void;
  onNewGroup: () => void;
  onSelectProcessor: (id: string) => void;
  onNewProcessor: () => void;
  onSelectAlias: (mapkey: string) => void;
  onNewAlias: () => void;
}

const NAV: { id: EditorNavSection; label: string; expandable: boolean }[] = [
  { id: "rule-groups", label: "规则组", expandable: true },
  { id: "processors", label: "Processor", expandable: true },
  { id: "alias", label: "Alias", expandable: true },
  { id: "about", label: "About", expandable: false },
];

function defaultExpanded(): Record<ExpandableSection, boolean> {
  return { "rule-groups": true, processors: false, alias: false };
}

export function EditorSidebar({
  section,
  onSectionChange,
  ruleGroups,
  config,
  selectedGroupId,
  selectedProcessorId,
  selectedAliasKey,
  onSelectGroup,
  onNewGroup,
  onSelectProcessor,
  onNewProcessor,
  onSelectAlias,
  onNewAlias,
}: EditorSidebarProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const processorIds = Object.keys(config.customProcessors);
  const aliasEntries = Object.entries(config.aliasMaps);

  useEffect(() => {
    if (section === "processors" && processorIds.length > 0 && !selectedProcessorId) {
      onSelectProcessor(processorIds[0]!);
    }
  }, [section, processorIds, selectedProcessorId, onSelectProcessor]);

  useEffect(() => {
    if (section === "alias" && aliasEntries.length > 0 && !selectedAliasKey) {
      onSelectAlias(aliasEntries[0]![0]);
    }
  }, [section, aliasEntries, selectedAliasKey, onSelectAlias]);

  const toggleExpanded = (id: ExpandableSection, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const goSection = (id: EditorNavSection) => {
    onSectionChange(id);
    if (id === "rule-groups" || id === "processors" || id === "alias") {
      setExpanded((prev) => ({ ...prev, [id]: true }));
    }
  };

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r bg-muted/30">
      <div className="border-b px-3 py-3">
        <p className="text-sm font-semibold">{APP_NAME}</p>
        <p className="text-[10px] text-muted-foreground">设置</p>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto p-2">
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active = section === item.id;
            const expandable = item.expandable;
            const expandKey = item.id as ExpandableSection;
            const isOpen = expandable ? expanded[expandKey] : false;

            return (
              <li key={item.id}>
                <div
                  className={cn(
                    "flex w-full items-center gap-0.5 rounded-md transition-colors",
                    active ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                  )}
                >
                  {expandable ? (
                    <button
                      type="button"
                      className={cn(
                        "flex h-9 w-7 shrink-0 items-center justify-center rounded-md",
                        active ? "hover:bg-primary-foreground/10" : "hover:bg-accent",
                      )}
                      aria-label={isOpen ? "收起" : "展开"}
                      onClick={(e) => toggleExpanded(expandKey, e)}
                    >
                      <ChevronDown
                        className={cn(
                          "size-3.5 shrink-0 transition-transform duration-200",
                          !isOpen && "-rotate-90",
                        )}
                      />
                    </button>
                  ) : (
                    <span className="w-7 shrink-0" />
                  )}
                  <button
                    type="button"
                    onClick={() => goSection(item.id)}
                    className={cn(
                      "flex min-w-0 flex-1 items-center py-2 pr-2 text-left text-sm font-medium",
                    )}
                  >
                    <span className="truncate">{item.label}</span>
                    {item.id === "rule-groups" && (
                      <span
                        className={cn(
                          "ml-auto text-[10px]",
                          active ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {ruleGroups.length}
                      </span>
                    )}
                    {item.id === "processors" && (
                      <span
                        className={cn(
                          "ml-auto text-[10px]",
                          active ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {processorIds.length}
                      </span>
                    )}
                    {item.id === "alias" && (
                      <span
                        className={cn(
                          "ml-auto text-[10px]",
                          active ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {aliasEntries.length}
                      </span>
                    )}
                  </button>
                </div>

                {item.id === "rule-groups" && (
                  <CollapsiblePanel open={isOpen} className="ml-2 border-l border-border/60 pl-1">
                    <ul className="max-h-[min(280px,40vh)] space-y-0.5 overflow-y-auto py-1">
                      {ruleGroups.map((g) => (
                        <li key={g.id}>
                          <button
                            type="button"
                            onClick={() => {
                              goSection("rule-groups");
                              onSelectGroup(g.id);
                            }}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                              selectedGroupId === g.id && section === "rule-groups"
                                ? "bg-accent font-medium text-accent-foreground"
                                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                            )}
                          >
                            <span
                              className={cn(
                                "size-1.5 shrink-0 rounded-full",
                                g.enabled ? "bg-green-500" : "bg-muted-foreground/40",
                              )}
                            />
                            <span className="truncate">{g.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-border/60 p-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-full justify-start px-2 text-xs"
                        onClick={() => {
                          goSection("rule-groups");
                          onNewGroup();
                        }}
                      >
                        <Plus className="size-3.5" />
                        新建规则组
                      </Button>
                    </div>
                  </CollapsiblePanel>
                )}

                {item.id === "processors" && (
                  <CollapsiblePanel open={isOpen} className="ml-2 border-l border-border/60 pl-1">
                    <ul className="max-h-[min(240px,36vh)] space-y-0.5 overflow-y-auto py-1">
                      {processorIds.length === 0 ? (
                        <li className="px-2 py-1 text-[10px] text-muted-foreground">暂无</li>
                      ) : (
                        processorIds.map((id) => (
                          <li key={id}>
                            <button
                              type="button"
                              onClick={() => {
                                goSection("processors");
                                onSelectProcessor(id);
                              }}
                              className={cn(
                                "flex w-full rounded-md px-2 py-1.5 text-left font-mono text-xs transition-colors",
                                selectedProcessorId === id && section === "processors"
                                  ? "bg-accent font-medium text-accent-foreground"
                                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                              )}
                            >
                              <span className="truncate">{id}</span>
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                    <div className="border-t border-border/60 p-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-full justify-start px-2 text-xs"
                        onClick={() => {
                          goSection("processors");
                          onNewProcessor();
                        }}
                      >
                        <Plus className="size-3.5" />
                        新建 Processor
                      </Button>
                    </div>
                  </CollapsiblePanel>
                )}

                {item.id === "alias" && (
                  <CollapsiblePanel open={isOpen} className="ml-2 border-l border-border/60 pl-1">
                    <ul className="max-h-[min(240px,36vh)] space-y-0.5 overflow-y-auto py-1">
                      {aliasEntries.length === 0 ? (
                        <li className="px-2 py-1 text-[10px] text-muted-foreground">暂无</li>
                      ) : (
                        aliasEntries.map(([mapkey, group]) => (
                          <li key={mapkey}>
                            <button
                              type="button"
                              onClick={() => {
                                goSection("alias");
                                onSelectAlias(mapkey);
                              }}
                              className={cn(
                                "flex w-full flex-col rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                                selectedAliasKey === mapkey && section === "alias"
                                  ? "bg-accent font-medium text-accent-foreground"
                                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                              )}
                            >
                              <span className="truncate">{group.name || mapkey}</span>
                              <span className="truncate font-mono text-[10px] opacity-70">
                                {mapkey}
                              </span>
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                    <div className="border-t border-border/60 p-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-full justify-start px-2 text-xs"
                        onClick={() => {
                          goSection("alias");
                          onNewAlias();
                        }}
                      >
                        <Plus className="size-3.5" />
                        新建 Alias 组
                      </Button>
                    </div>
                  </CollapsiblePanel>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
