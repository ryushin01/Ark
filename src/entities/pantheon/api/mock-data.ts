import type { Pantheon } from "../model/types";

/**
 * 목업 데이터. Supabase를 연결하기 전까지 쓰고, 연결 후에는 시드 데이터로 옮깁니다.
 * 연대는 각 신화를 전하는 가장 이른 주요 문헌의 대략적인 시기입니다.
 */
export const MOCK_PANTHEONS: Pantheon[] = [
  {
    slug: "egyptian",
    name: "이집트 신화",
    nameEn: "Egyptian",
    region: "나일강 유역",
    earliestSource: "피라미드 텍스트",
    eraLabel: "기원전 24세기경",
    eraYear: -2400,
    summary: "죽음 이후의 삶과 심판, 태양의 순환을 중심으로 삼천 년 넘게 이어진 신화입니다.",
    description: [
      "이집트 신화는 나일강의 범람과 태양의 운행처럼 되풀이되는 자연의 질서를 신들의 이야기로 풀어냈습니다.",
      "왕의 무덤 벽에 새긴 피라미드 텍스트에서 시작해 관 텍스트, 사자의 서로 이어지며 죽은 이가 저승을 지나 심판을 받는 과정이 자세히 기록되었습니다.",
    ],
    coverExhibitId: "weighing-heart",
  },
  {
    slug: "mesopotamian",
    name: "메소포타미아 신화",
    nameEn: "Mesopotamian",
    region: "티그리스·유프라테스강 유역",
    earliestSource: "수메르어 길가메시 시가",
    eraLabel: "기원전 21세기경",
    eraYear: -2100,
    summary: "점토판에 쐐기문자로 새긴, 인류가 남긴 가장 오래된 영웅 서사가 있는 신화입니다.",
    description: [
      "수메르, 아카드, 바빌로니아, 아시리아로 이어진 도시 문명들은 신들을 도시의 수호자로 섬겼습니다.",
      "죽음을 피하려 길을 떠난 길가메시의 이야기와 혼돈의 바다를 무찌르고 세계를 세운 마르두크의 창조 서사시 「에누마 엘리시」가 대표적입니다.",
    ],
    coverExhibitId: "ishtar-gate-lion",
  },
  {
    slug: "hindu",
    name: "인도 신화",
    nameEn: "Hindu",
    region: "인도 아대륙",
    earliestSource: "리그베다",
    eraLabel: "기원전 15세기경",
    eraYear: -1500,
    summary: "창조와 유지, 파괴가 끝없이 되풀이되는 우주관 위에 수많은 신과 화신이 등장합니다.",
    description: [
      "베다의 찬가에서 시작한 인도 신화는 「마하바라타」, 「라마야나」 같은 서사시와 푸라나 문헌으로 넓어졌습니다.",
      "세계를 유지하는 비슈누와 파괴와 재생의 신 시바, 지혜와 시작의 신 가네샤처럼 지금도 널리 숭배되는 신들이 많습니다.",
    ],
    coverExhibitId: "shiva-nataraja",
  },
  {
    slug: "greek",
    name: "그리스 신화",
    nameEn: "Greek",
    region: "에게해 연안",
    earliestSource: "호메로스 「일리아스」·「오디세이아」",
    eraLabel: "기원전 8세기경",
    eraYear: -800,
    summary: "올림포스의 열두 신과 영웅들의 이야기로, 서양 예술과 문학의 뿌리가 된 신화입니다.",
    description: [
      "그리스 신화의 신들은 사람처럼 사랑하고 질투하며 다툽니다. 호메로스와 헤시오도스의 서사시가 그 이야기를 처음 글로 남겼습니다.",
      "로마는 그리스의 신들을 자기 신들과 동일시해 받아들였고, 로마 시대에 만든 대리석 모작 덕분에 사라진 그리스 원작의 모습을 지금도 볼 수 있습니다.",
    ],
    coverExhibitId: "artemision-bronze",
  },
  {
    slug: "japanese",
    name: "일본 신화",
    nameEn: "Japanese",
    region: "일본 열도",
    earliestSource: "「고사기」",
    eraLabel: "712년",
    eraYear: 712,
    summary:
      "천지가 열리고 섬들이 태어나는 이야기에서 시작해 태양신의 후손으로 이어지는 신화입니다.",
    description: [
      "712년에 엮은 「고사기」와 720년의 「일본서기」에 이자나기와 이자나미의 국토 창조, 아마테라스와 스사노오의 이야기가 실려 있습니다.",
      "에도 시대와 메이지 시대의 우키요에 화가들은 이 장면들을 목판화로 즐겨 그렸습니다.",
    ],
    coverExhibitId: "amaterasu-iwato",
  },
  {
    slug: "norse",
    name: "북유럽 신화",
    nameEn: "Norse",
    region: "스칸디나비아·아이슬란드",
    earliestSource: "「산문 에다」·「시 에다」",
    eraLabel: "13세기",
    eraYear: 1220,
    summary: "거인과 싸우는 신들, 그리고 피할 수 없는 종말 라그나로크로 끝나는 신화입니다.",
    description: [
      "북유럽 신화는 오랫동안 입으로 전해지다가 13세기 아이슬란드에서 스노리 스튀르류손의 「산문 에다」와 「시 에다」로 기록되었습니다.",
      "19세기 낭만주의 시대에 스칸디나비아 화가들이 오딘과 토르를 다시 그리면서 오늘날 우리가 떠올리는 북유럽 신들의 모습이 만들어졌습니다.",
    ],
    coverExhibitId: "thor-jotnar",
  },
];
