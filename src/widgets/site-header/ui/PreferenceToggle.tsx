"use client";

import { HandCircle } from "@/shared/ui";

import { type Preference, usePreference } from "../model/preferences";
import styles from "./SiteHeader.module.css";

/** 세로 띠의 켬·끔 설정. 현재 상태에 손으로 그린 타원을 두릅니다. */
export function PreferenceToggle({ name, label }: { name: Preference; label: string }) {
  const [isOn, toggle] = usePreference(name);
  return (
    <button type="button" className={styles.toggle} aria-pressed={isOn} onClick={toggle}>
      {label}
      <span className={styles.toggleStates} aria-hidden="true">
        <span className={styles.toggleState}>
          {isOn && <HandCircle className={styles.toggleCircle} />}켬
        </span>
        <span className={styles.toggleState}>
          {!isOn && <HandCircle className={styles.toggleCircle} />}끔
        </span>
      </span>
    </button>
  );
}
