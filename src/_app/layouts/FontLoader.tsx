/**
 * 부크크 명조(수정할 수 없어 원본 파일을 통째로 씀)를 다 받은 뒤 화면을 보여 줍니다.
 * - 받는 동안 오선 위로 음표가 지나가는 로딩 화면을 덮고, 뒤의 내용은 초점을 받지 않게 숨깁니다.
 * - 8초가 지나거나 글꼴을 받지 못하면 글꼴 정의(#font-faces)를 꺼서 늦게 도착해도 글자가 바뀌지 않게 하고, 운영체제 명조로 그대로 보여 줍니다.
 * - 자바스크립트가 없으면 html.js가 없어 로딩 화면이 나오지 않습니다.
 */
export const FONT_LOADER_TIMEOUT_MS = 8000;

/** 글꼴 정의는 외부 CSS 대신 페이지에 바로 넣어, CSS를 기다리느라 제한 시간 타이머가 늦게 시작하지 않게 합니다. */
export const FONT_FACE_CSS =
  '@font-face {font-family: "Bookk Myungjo";font-style: normal;font-weight: 400;font-display: swap;src: url("/fonts/bookk-myungjo/BookkMyungjo-Lt.woff2") format("woff2");unicode-range: U+1100-11FF, U+3130-318F, U+A960-A97F, U+AC00-D7A3, U+D7B0-D7FF;}@font-face {font-family: "Bookk Myungjo";font-style: normal;font-weight: 700;font-display: swap;src: url("/fonts/bookk-myungjo/BookkMyungjo-Bd.woff2") format("woff2");unicode-range: U+1100-11FF, U+3130-318F, U+A960-A97F, U+AC00-D7A3, U+D7B0-D7FF;}';

export const FONT_LOADER_SCRIPT = `(function(){var d=document.documentElement,f=document.fonts;var end=false;function done(ok){if(end)return;end=true;if(!ok){var s=document.getElementById('font-faces');if(s)s.disabled=true}d.dataset.fonts='ready'}if(!f||!f.load){done(true);return}var t=setTimeout(function(){done(false)},${FONT_LOADER_TIMEOUT_MS});Promise.all(['400 1em "Bookk Myungjo"','700 1em "Bookk Myungjo"'].map(function(w){return f.load(w,'가')})).then(function(){clearTimeout(t);done(true)},function(){clearTimeout(t);done(false)})})()`;

export function FontLoader() {
  return (
    <>
      <div className="font-loader" role="status">
        <div className="font-loader__staff" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <i className="font-loader__note">♪</i>
        </div>
        <p className="font-loader__text">악보를 펼치는 중입니다</p>
      </div>
      <script dangerouslySetInnerHTML={{ __html: FONT_LOADER_SCRIPT }} />
    </>
  );
}
