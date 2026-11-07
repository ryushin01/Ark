import { Divider, RevealText } from "@/shared/ui";

import styles from "./SiteFooter.module.css";

const GITHUB_URL = "https://github.com/ryushin01/Ark";

/** 화면 높이를 채우는 바닥글. 신화에 관한 인용으로 사이트를 마무리합니다. */
export function SiteFooter() {
  return (
    <footer className={`${styles.footer} px-global`}>
      <figure className={styles.quote}>
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
        <div className={styles.meta}>
          <p>
            자료 이미지는 Wikimedia Commons의 퍼블릭 도메인·CC 라이선스 자료이며, 각 이미지에
            저작자와 라이선스를 표기했습니다.
          </p>
          <ul className={styles.links}>
            <li>
              <a href={GITHUB_URL} className={styles.link}>
                GitHub 저장소
              </a>
            </li>
          </ul>
        </div>
        <Divider />
        <p className={styles.wordmark} aria-hidden="true">
          Ark
        </p>
        <p className={styles.copyright}>© 2026 Ark · 포트폴리오 프로젝트</p>
      </div>
    </footer>
  );
}
