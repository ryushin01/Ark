import Link from "next/link";
import { notFound } from "next/navigation";

import { getFigures } from "@/entities/figure";
import { getPublishedWorks, WORK_MEDIUM_LABEL } from "@/entities/work";
import { SwipeGallery } from "@/features/swipe-gallery";
import { features } from "@/shared/config";
import { Divider, RevealText } from "@/shared/ui";
import { SiteFooter } from "@/widgets/site-footer";

import styles from "./ArchivePage.module.css";

/** 원제의 언어. 화면 낭독기가 올바른 발음으로 읽도록 lang을 지정합니다. (KWCAG 7.1.1) */
function guessLang(text: string) {
  if (/[\u3040-\u30ff]|[\u4e00-\u9fff]/.test(text)) return "ja";
  if (/^[\x20-\x7e]+$/.test(text)) return "en";
  return undefined;
}

export const archiveMetadata = {
  title: "영향 아카이브",
  // 저작권을 확인하기 전까지는 검색에 노출하지 않습니다.
  robots: { index: false, follow: false },
};

/**
 * 영향 아카이브: 신화의 영향을 받은 판타지·서브컬처 작품
 * 기능 플래그(NEXT_PUBLIC_FEATURE_ARCHIVE)가 꺼져 있으면 404입니다.
 */
export async function ArchivePage() {
  if (!features.archive) notFound();

  const [works, figures] = await Promise.all([getPublishedWorks(), getFigures()]);
  const figureName = (slug: string) => figures.find((figure) => figure.slug === slug)?.name;

  return (
    <>
      <header className={`${styles.header} px-global`}>
        <p className={styles.eyebrow}>Archive</p>
        <RevealText as="h1" mode="words" text="신화가 남긴 흔적" className={styles.title} />
        <RevealText
          className={styles.lead}
          text="게임과 애니메이션, 소설은 오래된 신의 이름과 이야기를 빌려 새로운 세계를 만들었습니다. 작품마다 어떤 신화가 어떻게 쓰였는지 모았습니다."
        />
      </header>

      <ol className={`${styles.list} px-global`}>
        {works.map((work) => (
          <li key={work.slug} id={work.slug} className={styles.item}>
            <Divider />
            <article
              className={`grid-default ${styles.article}`}
              aria-labelledby={`${work.slug}-title`}
            >
              <div className={styles.info}>
                <h2 id={`${work.slug}-title`} className={styles.workTitle}>
                  {work.title}
                </h2>
                <p className={styles.original} lang={guessLang(work.titleOriginal)}>
                  {work.titleOriginal}
                </p>
                <dl className={styles.facts}>
                  <div>
                    <dt>분류</dt>
                    <dd>{WORK_MEDIUM_LABEL[work.medium]}</dd>
                  </div>
                  {work.year && (
                    <div>
                      <dt>발표</dt>
                      <dd>{work.year}년</dd>
                    </div>
                  )}
                  {work.creator && (
                    <div>
                      <dt>제작</dt>
                      <dd>{work.creator}</dd>
                    </div>
                  )}
                </dl>
                {work.summary && <p className={styles.summary}>{work.summary}</p>}
                {work.figureSlugs.length > 0 && (
                  <p className={styles.refs}>
                    관련 신:{" "}
                    {work.figureSlugs.map((slug, index) => (
                      <span key={slug}>
                        {index > 0 && ", "}
                        <Link href={`/figures/${slug}`}>{figureName(slug) ?? slug}</Link>
                      </span>
                    ))}
                  </p>
                )}
              </div>
              <div className={styles.gallery}>
                <SwipeGallery label={work.title} images={work.images} />
              </div>
            </article>
          </li>
        ))}
      </ol>

      <SiteFooter />
    </>
  );
}
