import { HandNote, RevealText } from "@/shared/ui";

import styles from "./SiteFooter.module.css";

const GITHUB_URL = "https://github.com/ryushin01/Ark";
/** 자료 이미지·글꼴의 출처 (README의 `## 출처`) */
const CREDITS_URL = `${GITHUB_URL}#출처`;
/** 앱과 함께 배포하는 Storybook(디자인 시스템). 개발 서버에는 빌드 결과물이 없어 Storybook 개발 서버로 보냅니다. */
const STORYBOOK_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:6006" : "/storybook/index.html";

/** 바닥글. 신화에 관한 인용을 오선 위에 크게 적어 사이트를 마무리합니다. */
export function SiteFooter() {
  return (
    <footer className={`${styles.footer} px-global`}>
      <figure className={`${styles.quote} staff`}>
        <HandNote className={styles.note}>마지막 장</HandNote>
        <blockquote>
          <RevealText
            text="이 일들은 한 번도 일어난 적이 없지만, 언제나 존재한다."
            className={styles.quoteText}
          />
        </blockquote>
        <figcaption className={styles.cite}>
          살루스티우스, 「신들과 세계에 관하여」 (4세기)
        </figcaption>
      </figure>

      <div className={styles.bottom}>
        <p>
          자료 이미지는 Wikimedia Commons의 퍼블릭 도메인·CC 라이선스 자료입니다. 이미지와 글꼴의
          저작자·라이선스는{" "}
          <a href={CREDITS_URL} className={styles.link}>
            README의 출처
          </a>
          에 밝혔습니다.
        </p>
        <p className={styles.center}>© 2026 Ark · 포트폴리오 프로젝트</p>
        <p className={styles.end}>
          <a href={STORYBOOK_URL} className={styles.link}>
            디자인 시스템(Storybook)
          </a>
          <a href={GITHUB_URL} className={styles.link}>
            GitHub 저장소
          </a>
        </p>
      </div>
    </footer>
  );
}
