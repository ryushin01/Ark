"use client";

import { Select, TextArea, TextField } from "@radix-ui/themes";

import { FormField } from "./FormField";

import type { ComponentProps } from "react";

type BaseProps = {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  defaultValue?: string;
};

/** 한 줄 입력. 레이블·안내·오류가 연결되어 있습니다. */
export function TextInput({
  name,
  label,
  hint,
  error,
  required,
  defaultValue,
  ...rest
}: BaseProps & Omit<ComponentProps<typeof TextField.Root>, keyof BaseProps | "id">) {
  return (
    <FormField id={name} label={label} hint={hint} error={error} required={required}>
      {(describedBy, invalid) => (
        <TextField.Root
          {...rest}
          id={name}
          name={name}
          defaultValue={defaultValue}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
        />
      )}
    </FormField>
  );
}

/** 여러 줄 입력 */
export function TextAreaInput({
  name,
  label,
  hint,
  error,
  required,
  defaultValue,
  rows = 6,
}: BaseProps & { rows?: number }) {
  return (
    <FormField id={name} label={label} hint={hint} error={error} required={required}>
      {(describedBy, invalid) => (
        <TextArea
          id={name}
          name={name}
          rows={rows}
          defaultValue={defaultValue}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
        />
      )}
    </FormField>
  );
}

/** 목록에서 고르기 (Radix Select). 폼에는 name으로 값이 실립니다. */
export function SelectInput({
  name,
  label,
  hint,
  error,
  required,
  defaultValue,
  placeholder = "고르세요",
  options,
}: BaseProps & { placeholder?: string; options: { value: string; label: string }[] }) {
  return (
    <FormField id={name} label={label} hint={hint} error={error} required={required}>
      {(describedBy, invalid) => (
        <Select.Root name={name} defaultValue={defaultValue || undefined}>
          <Select.Trigger
            id={name}
            placeholder={placeholder}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
          />
          <Select.Content>
            {options.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      )}
    </FormField>
  );
}
