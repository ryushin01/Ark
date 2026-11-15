/**
 * 부크크 명조(수정할 수 없어 원본 파일을 통째로 씀)를 다 받은 뒤 화면을 보여 줍니다.
 * - 받는 동안 오선 위로 음표가 지나가는 로딩 화면을 덮고, 뒤의 내용은 초점을 받지 않게 숨깁니다.
 * - 8초가 지나거나 글꼴을 받지 못하면 운영체제 명조로 그대로 보여 줍니다.
 * - 자바스크립트가 없으면 html.js가 없어 로딩 화면이 나오지 않습니다.
 */
export const FONT_LOADER_TIMEOUT_MS = 8000;

export const FONT_LOADER_SCRIPT = `(function(){var d=document.documentElement,f=document.fonts;function done(){d.dataset.fonts='ready'}if(!f||!f.load){done();return}var t=setTimeout(done,${FONT_LOADER_TIMEOUT_MS});Promise.all(['400 1em "Bookk Myungjo"','700 1em "Bookk Myungjo"'].map(function(w){return f.load(w,'가')})).then(function(){clearTimeout(t);done()},function(){clearTimeout(t);done()})})()`;

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
