import type { FormEvent, ReactNode } from "react";

import { Input } from "@apzhub/ui";

export interface LawSearchBarProps {
  readonly placeholder?: string;
  readonly value?: string;
  readonly onChange?: (value: string) => void;
  readonly onSubmit?: (value: string) => void;
  readonly trailing?: ReactNode;
  readonly ariaLabel?: string;
  readonly "data-testid"?: string;
}

/** Presentational search container — optional submit for global search (LAW-001-02 / LAW-013-07). */
export function LawSearchBar({
  placeholder = "Search…",
  value = "",
  onChange,
  onSubmit,
  trailing,
  ariaLabel = "Search",
  "data-testid": testId = "law-search-bar",
}: LawSearchBarProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.(value);
  }

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      data-testid={testId}
      onSubmit={handleSubmit}
    >
      <div className="min-w-[16rem] flex-1">
        <Input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          aria-label={ariaLabel}
        />
      </div>
      {trailing}
    </form>
  );
}
