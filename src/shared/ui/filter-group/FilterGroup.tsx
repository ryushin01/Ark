import { HandCircle } from "../hand";
import styles from "./FilterGroup.module.css";

export type FilterOption<T extends string> = { value: T; label: string; count: number };

type FilterGroupProps<T extends string> = {
  /** 묶음의 이름 (화면 낭독기) */
  label: string;
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** 하나를 고르는 버튼 묶음. 고른 버튼은 aria-pressed로 알리고, 색이 아니라 손으로 그린 타원으로 표시합니다. */
export function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: FilterGroupProps<T>) {
  return (
    <div role="group" aria-label={label} className={styles.group}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.button}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {value === option.value && <HandCircle className={styles.circle} />}
          {option.label} <span className={styles.count}>{option.count}</span>
        </button>
      ))}
    </div>
  );
}
