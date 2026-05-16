import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { APP_NAME } from "@/shared/app/meta";
import { EXAMPLE_PROCESSORS } from "@/shared/field/processor-examples";
import type { AppConfig, RuleGroup } from "@/shared/types";
import { cn } from "@/lib/utils";
import { SidebarSubList } from "./sidebar/SidebarSubList";
import { SubListItem } from "./sidebar/SubListItem";

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
  { id: "processors", label: "处理器", expandable: true },
  { id: "alias", label: "别名", expandable: true },
  { id: "about", label: "About", expandable: false },
];

const EXAMPLE_PROCESSOR_IDS = new Set(Object.keys(EXAMPLE_PROCESSORS));

function expandedForSection(section: EditorNavSection): Record<ExpandableSection, boolean> {
  return {
    "rule-groups": section === "rule-groups",
    processors: section === "processors",
    alias: section === "alias",
  };
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
  const [expanded, setExpanded] = useState(() => expandedForSection(section));

  const processorIds = Object.keys(config.customProcessors);
  const aliasEntries = Object.entries(config.aliasMaps);

  useEffect(() => {
    setExpanded((prev) => ({ ...prev, ...expandedForSection(section) }));
  }, [section]);

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

  const countFor = (id: EditorNavSection) => {
    if (id === "rule-groups") return ruleGroups.length;
    if (id === "processors") return processorIds.length;
    if (id === "alias") return aliasEntries.length;
    return null;
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
            const count = countFor(item.id);

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
                    className="flex min-w-0 flex-1 items-center py-2 pr-2 text-left text-sm font-medium"
                  >
                    <span className="truncate">{item.label}</span>
                    {count !== null && (
                      <span
                        className={cn(
                          "ml-auto text-[10px]",
                          active ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                </div>

                {item.id === "rule-groups" && (
                  <SidebarSubList
                    open={isOpen}
                    newLabel="新建规则组"
                    onNew={() => {
                      goSection("rule-groups");
                      onNewGroup();
                    }}
                  >
                    {ruleGroups.length === 0 ? (
                      <li className="px-2 py-1 text-[10px] text-muted-foreground">暂无</li>
                    ) : (
                      ruleGroups.map((g) => (
                        <SubListItem
                          key={g.id}
                          active={selectedGroupId === g.id && section === "rule-groups"}
                          primary={g.name}
                          onClick={() => {
                            goSection("rule-groups");
                            onSelectGroup(g.id);
                          }}
                          leading={
                            <span
                              className={cn(
                                "size-1.5 shrink-0 rounded-full",
                                g.enabled ? "bg-green-500" : "bg-muted-foreground/40",
                              )}
                            />
                          }
                        />
                      ))
                    )}
                  </SidebarSubList>
                )}

                {item.id === "processors" && (
                  <SidebarSubList
                    open={isOpen}
                    newLabel="新建处理器"
                    onNew={() => {
                      goSection("processors");
                      onNewProcessor();
                    }}
                  >
                    {processorIds.length === 0 ? (
                      <li className="px-2 py-1 text-[10px] text-muted-foreground">暂无</li>
                    ) : (
                      processorIds.map((id) => (
                        <SubListItem
                          key={id}
                          active={selectedProcessorId === id && section === "processors"}
                          primary={id}
                          secondary={
                            EXAMPLE_PROCESSOR_IDS.has(id) ? "示例" : undefined
                          }
                          onClick={() => {
                            goSection("processors");
                            onSelectProcessor(id);
                          }}
                        />
                      ))
                    )}
                  </SidebarSubList>
                )}

                {item.id === "alias" && (
                  <SidebarSubList
                    open={isOpen}
                    newLabel="新建别名组"
                    onNew={() => {
                      goSection("alias");
                      onNewAlias();
                    }}
                  >
                    {aliasEntries.length === 0 ? (
                      <li className="px-2 py-1 text-[10px] text-muted-foreground">暂无</li>
                    ) : (
                      aliasEntries.map(([mapkey, group]) => (
                        <SubListItem
                          key={mapkey}
                          active={selectedAliasKey === mapkey && section === "alias"}
                          primary={group.name || mapkey}
                          secondary={mapkey}
                          onClick={() => {
                            goSection("alias");
                            onSelectAlias(mapkey);
                          }}
                        />
                      ))
                    )}
                  </SidebarSubList>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
