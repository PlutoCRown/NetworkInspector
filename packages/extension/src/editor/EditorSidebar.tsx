import { ChevronDown, ChevronRight, FileUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/shared/app/meta";
import type { RuleGroup } from "@/shared/types";
import { cn } from "@/lib/utils";

export type EditorNavSection = "rule-groups" | "processors" | "alias" | "about";

interface EditorSidebarProps {
  section: EditorNavSection;
  onSectionChange: (section: EditorNavSection) => void;
  ruleGroups: RuleGroup[];
  selectedId: string | null;
  onSelectGroup: (id: string) => void;
  onNewGroup: () => void;
  onImportJson: () => void;
}

const PRIMARY_NAV: { id: EditorNavSection; label: string }[] = [
  { id: "rule-groups", label: "规则组" },
  { id: "processors", label: "Processor" },
  { id: "alias", label: "Alias" },
  { id: "about", label: "About" },
];

export function EditorSidebar({
  section,
  onSectionChange,
  ruleGroups,
  selectedId,
  onSelectGroup,
  onNewGroup,
  onImportJson,
}: EditorSidebarProps) {
  const groupsOpen = section === "rule-groups";

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r bg-muted/30">
      <div className="border-b px-3 py-3">
        <p className="text-sm font-semibold">{APP_NAME}</p>
        <p className="text-[10px] text-muted-foreground">设置</p>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ul className="shrink-0 space-y-0.5 p-2">
          {PRIMARY_NAV.map((item) => {
            const active = section === item.id;
            const isRuleGroups = item.id === "rule-groups";
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "flex w-full items-center gap-1.5 rounded-md px-2.5 py-2 text-left text-sm font-medium transition-colors",
                    active ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                  )}
                >
                  {isRuleGroups ? (
                    groupsOpen ? (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                    )
                  ) : (
                    <span className="w-3.5 shrink-0" />
                  )}
                  <span className="truncate">{item.label}</span>
                  {isRuleGroups && (
                    <span
                      className={cn(
                        "ml-auto text-[10px]",
                        active ? "text-primary-foreground/80" : "text-muted-foreground",
                      )}
                    >
                      {ruleGroups.length}
                    </span>
                  )}
                </button>

                {isRuleGroups && groupsOpen && (
                  <div className="ml-2 mt-0.5 border-l border-border/60 pl-1">
                    <ul className="max-h-[min(280px,40vh)] space-y-0.5 overflow-y-auto py-0.5">
                      {ruleGroups.map((g) => (
                        <li key={g.id}>
                          <button
                            type="button"
                            onClick={() => onSelectGroup(g.id)}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                              selectedId === g.id && section === "rule-groups"
                                ? "bg-accent font-medium text-accent-foreground"
                                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 shrink-0 rounded-full",
                                g.enabled ? "bg-green-500" : "bg-muted-foreground/40",
                              )}
                            />
                            <span className="truncate">{g.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="space-y-1 border-t border-border/60 p-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-full justify-start px-2 text-xs"
                        onClick={onImportJson}
                      >
                        <FileUp className="h-3.5 w-3.5" />
                        导入 JSON
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-full justify-start px-2 text-xs"
                        onClick={onNewGroup}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        新建规则组
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
