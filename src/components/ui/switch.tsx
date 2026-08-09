"use client";

import React, { useState } from "react";

interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
}

export function Switch({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  label,
  disabled,
  id,
  name,
}: SwitchProps) {
  const generatedId = React.useId();
  const switchId = id || generatedId;
  const isControlled = controlledChecked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const checked = isControlled ? controlledChecked : internalChecked;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newChecked = e.target.checked;
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    onCheckedChange?.(newChecked);
  }

  return (
    <label
      htmlFor={switchId}
      className="inline-flex cursor-pointer items-center gap-3"
    >
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
          checked ? "bg-violet-600" : "bg-slate-300"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <input
          id={switchId}
          name={name}
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
        />
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
      {label && <span className="text-sm text-slate-700">{label}</span>}
    </label>
  );
}
