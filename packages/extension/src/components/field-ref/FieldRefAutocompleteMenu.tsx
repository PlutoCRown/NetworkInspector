import { MenuItemButton } from "@/components/ui/menu-item-button";
import type { AutocompleteItem } from "@/components/field-ref-autocomplete";

interface FieldRefAutocompleteMenuProps {
  items: AutocompleteItem[];
  highlightIdx: number;
  showHighlight: boolean;
  onPick: (item: AutocompleteItem) => void;
}

export function FieldRefAutocompleteMenu({
  items,
  highlightIdx,
  showHighlight,
  onPick,
}: FieldRefAutocompleteMenuProps) {
  const groups = [...new Set(items.map((i) => i.group))];

  return (
    <ul className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-auto rounded-md border bg-popover py-1 shadow-md">
      {groups.map((group) => (
        <li key={group}>
          <div className="px-3 py-1 text-[10px] font-medium text-muted-foreground">{group}</div>
          {items
            .filter((i) => i.group === group)
            .map((item) => {
              const idx = items.indexOf(item);
              return (
                <li key={item.id}>
                  <MenuItemButton
                    active={showHighlight && idx === highlightIdx}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onPick(item);
                    }}
                  >
                    <span>{item.label}</span>
                    {item.hint ? (
                      <span className="text-[10px] text-muted-foreground">{item.hint}</span>
                    ) : null}
                  </MenuItemButton>
                </li>
              );
            })}
        </li>
      ))}
    </ul>
  );
}
