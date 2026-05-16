import { MenuItemButton } from "@/components/ui/menu-item-button";
import { SOURCE_TAG_OPTIONS } from "@/shared/field/expr";
import type { FieldRefInputMode } from "@/components/field-ref-autocomplete";
import type { AppConfig, FieldSource } from "@/shared/types";
import type { FieldExpr } from "@/shared/field/expr";

interface FieldRefPickerMenuProps {
  mode: FieldRefInputMode;
  splitNames: string[];
  expr: FieldExpr;
  config: AppConfig;
  hasSource: boolean;
  hasSplitRef: boolean;
  onPickSource: (source: FieldSource) => void;
  onPickSplitRef: (name: string) => void;
  onAddProcessor: (id: string) => void;
  onSetAlias: (mapkey: string) => void;
}

export function FieldRefPickerMenu({
  mode,
  splitNames,
  expr,
  config,
  hasSource,
  hasSplitRef,
  onPickSource,
  onPickSplitRef,
  onAddProcessor,
  onSetAlias,
}: FieldRefPickerMenuProps) {
  const processorOptions = Object.keys(config.customProcessors);
  const aliasOptions = Object.entries(config.aliasMaps).map(([mapkey, group]) => ({
    mapkey,
    label: group.name ? `${group.name} (${mapkey})` : mapkey,
  }));

  return (
    <ul className="absolute right-0 z-50 mt-1 max-h-56 w-52 overflow-auto rounded-md border bg-popover py-1 shadow-md">
      {!hasSource && !hasSplitRef && (
        <>
          <li className="px-3 py-1 text-[10px] font-medium text-muted-foreground">数据来源</li>
          {SOURCE_TAG_OPTIONS.map((s) => (
            <li key={s.id}>
              <MenuItemButton
                onMouseDown={(e) => {
                  e.preventDefault();
                  onPickSource(s.id as FieldSource);
                }}
              >
                source:{s.id}
              </MenuItemButton>
            </li>
          ))}
        </>
      )}
      {mode === "field" && splitNames.length > 0 && !hasSplitRef && (
        <>
          <li className="px-3 py-1 text-[10px] font-medium text-muted-foreground">拆分项</li>
          {splitNames.map((name) => (
            <li key={name}>
              <MenuItemButton
                onMouseDown={(e) => {
                  e.preventDefault();
                  onPickSplitRef(name);
                }}
              >
                aggregate:{name}
              </MenuItemButton>
            </li>
          ))}
        </>
      )}
      {(hasSource || hasSplitRef) && (
        <li className="px-3 py-1 text-[10px] font-medium text-muted-foreground">Processor</li>
      )}
      {processorOptions.map((id) => (
        <li key={id}>
          <MenuItemButton
            disabled={expr.processors.includes(id)}
            className="disabled:opacity-40"
            onMouseDown={(e) => {
              e.preventDefault();
              onAddProcessor(id);
            }}
          >
            processor:{id}
          </MenuItemButton>
        </li>
      ))}
      {(hasSource || hasSplitRef) && !expr.aliasMap && (
        <li className="px-3 py-1 text-[10px] font-medium text-muted-foreground">Alias</li>
      )}
      {aliasOptions.map(({ mapkey, label }) => (
        <li key={mapkey}>
          <MenuItemButton
            mono={false}
            onMouseDown={(e) => {
              e.preventDefault();
              onSetAlias(mapkey);
            }}
          >
            <span className="font-mono">alias:{mapkey}</span>
            {label !== mapkey && (
              <span className="ml-1 font-sans text-muted-foreground">· {label}</span>
            )}
          </MenuItemButton>
        </li>
      ))}
    </ul>
  );
}
