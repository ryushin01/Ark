"use client";

import { type ComponentProps, useState } from "react";
import { Select, TextArea, TextField } from "@radix-ui/themes";

import { describeUploadProblem, UPLOAD } from "@/shared/config";

import { FormField } from "./FormField";

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

/**
 * 이미지 파일 고르기
 * 고르는 즉시 형식과 크기(4MB)를 확인해, 서버로 보내기 전에 알려 줍니다. 문제가 있는 파일은 칸에서 비웁니다.
 * 서버 오류가 나면 파일은 다시 골라야 합니다. (브라우저가 파일 칸을 다시 채우지 못함)
 */
export function FileInput({
  name,
  label,
  hint,
  error,
  required,
  disabled,
}: Omit<BaseProps, "defaultValue"> & { disabled?: boolean }) {
  const [clientError, setClientError] = useState<string | null>(null);

  return (
    <FormField id={name} label={label} hint={hint} error={clientError ?? error} required={required}>
      {(describedBy, invalid) => (
        <input
          id={name}
          name={name}
          type="file"
          accept={UPLOAD.types.join(",")}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className="ark-file-input"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            const problem = file ? describeUploadProblem(file) : null;
            setClientError(problem);
            if (problem) event.currentTarget.value = "";
          }}
        />
      )}
    </FormField>
  );
}
