"use client";

import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function FormSelect({
  name,
  value,
  options,
  placeholder,
  required = false,
  allowEmpty = false,
  emptyLabel = "None"
}) {
  const [selected, setSelected] = React.useState(value ? String(value) : "");

  return (
    <>
      <input name={name} type="hidden" value={selected} />
      <Select
        value={selected || (allowEmpty ? "__empty__" : "")}
        onValueChange={(nextValue) => {
          setSelected(nextValue === "__empty__" ? "" : nextValue);
        }}
      >
        <SelectTrigger aria-required={required}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {allowEmpty ? <SelectItem value="__empty__">{emptyLabel}</SelectItem> : null}
          {(options || []).map((option) => (
            <SelectItem key={String(option.value)} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

export { FormSelect };
