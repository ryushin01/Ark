/**
 * 등장 효과를 자바스크립트 번들보다 먼저 시작합니다.
 *
 * `RevealText`·`RevealImage`는 화면에 들어오면 떠오르는데, 그 판단(useInView)은 React가 화면을 넘겨받은 뒤(hydration)에야 돕니다.
 * 휴대폰에서는 그 사이 1초 넘게 첫 문단·그림이 숨어 있어 LCP가 늦어지고, 번들을 받지 못하면 끝내 숨어 있습니다.
 * 이 스크립트는 화면에 들어온 `[data-reveal]` 요소에 `data-revealed`를 붙입니다(그림은 다 받은 뒤).
 * 본문은 스트리밍으로 이 스크립트보다 늦게(숨긴 영역에 먼저) 도착하므로, MutationObserver로 새로 들어오는 요소도 관찰하고
 * 제자리로 옮겨져 화면에 들어오는 순간 드러냅니다.
 * CSS는 `.inView`·`.shown`과 똑같이 보여 주므로 효과는 그대로이고 시작만 빨라집니다.
 * React가 넘겨받으면 `EarlyRevealHandoff`가 관찰을 끝내, 그 뒤 옮겨 간 화면은 지금처럼 React가 맡고 메모리에도 남지 않습니다.
 */
export const EARLY_REVEAL_SCRIPT = `(function(){if(typeof IntersectionObserver!=="function")return;var o=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var t=e.target,show=function(){t.setAttribute("data-revealed","")};o.unobserve(t);if(t.getAttribute("data-reveal")!=="image")return show();var i=t.querySelector("img");if(!i||i.complete)return show();i.addEventListener("load",show,{once:true});i.addEventListener("error",show,{once:true})})},{rootMargin:"0px 0px -5% 0px"});var scan=function(n){if(n.nodeType!==1)return;if(n.hasAttribute("data-reveal"))o.observe(n);n.querySelectorAll("[data-reveal]").forEach(function(t){o.observe(t)})};scan(document.documentElement);var m=typeof MutationObserver==="function"?new MutationObserver(function(rs){rs.forEach(function(r){r.addedNodes.forEach(scan)})}):null;if(m)m.observe(document.documentElement,{childList:true,subtree:true});window.__arkEarlyReveal={disconnect:function(){o.disconnect();if(m)m.disconnect()}}})();`;

export function EarlyReveal() {
  return <script dangerouslySetInnerHTML={{ __html: EARLY_REVEAL_SCRIPT }} />;
}
