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
  {
    slug: "chinese",
    name: "중국 신화",
    nameEn: "Chinese",
    region: "황허·창장 유역",
    earliestSource: "「산해경」·「초사」",
    eraLabel: "기원전 4세기경",
    eraYear: -350,
    summary:
      "하늘과 땅을 가른 거인 반고, 사람을 빚은 여와, 불사의 복숭아를 기르는 서왕모의 이야기가 여러 책에 흩어져 전하는 신화입니다.",
    description: [
      "중국 신화는 한 권의 경전이 아니라 「산해경」, 「초사」, 「회남자」 같은 여러 책에 조각조각 흩어져 전합니다.",
      "천지를 연 반고 이야기는 3세기 삼국 시대 오나라의 기록에 처음 보이는 등, 오래된 이야기와 후대에 덧붙은 이야기가 섞여 있습니다. 많은 신이 도교 신앙 속에서 오늘날까지 섬겨집니다.",
    ],
    coverExhibitId: "fuxi-nuwa",
  },
  {
    slug: "celtic",
    name: "켈트 신화",
    nameEn: "Celtic",
    region: "아일랜드·브리튼·갈리아",
    earliestSource: "「둔 카우의 서」 (아일랜드 필사본)",
    eraLabel: "12세기",
    eraYear: 1100,
    summary:
      "사슴뿔을 단 신, 까마귀로 날아다니는 전쟁의 여신, 아일랜드의 영웅 쿠 훌린이 등장하는 서유럽 켈트족의 신화입니다.",
    description: [
      "갈리아 등 대륙 켈트족의 신화는 로마에 정복된 뒤 대부분 사라지고, 유물과 로마인의 기록으로만 일부 전합니다.",
      "오늘날 알려진 이야기는 대부분 중세 아일랜드와 웨일스의 수도원에서 기록한 필사본에서 나왔습니다. 12세기 초에 만든 「둔 카우의 서」에는 쿠 훌린이 활약하는 얼스터 이야기가 실려 있습니다.",
    ],
    coverExhibitId: "cernunnos-gundestrup",
  },
  {
    slug: "aztec",
    name: "아즈텍 신화",
    nameEn: "Aztec",
    region: "멕시코 중앙 고원",
    earliestSource: "그림 문서(코덱스)",
    eraLabel: "15~16세기",
    eraYear: 1500,
    summary:
      "네 번 무너진 세상 뒤의 다섯 번째 태양 아래에서, 깃털 달린 뱀과 연기 나는 거울의 신이 맞서는 신화입니다.",
    description: [
      "아즈텍 사람들은 세상이 이미 네 번 멸망했고 지금은 다섯 번째 태양의 시대라고 믿었습니다. 테스카틀리포카, 케찰코아틀, 틀랄록이 앞선 시대의 태양이었다고 전합니다.",
      "신들의 모습은 그림 문서인 코덱스에 남아 있습니다. 스페인 정복 이전에 만든 「보르자 코덱스」와 정복 무렵의 「보르보니쿠스 코덱스」가 대표적입니다.",
    ],
    coverExhibitId: "tezcatlipoca-borgia",
  },
  {
    slug: "korean",
    name: "한국 신화",
    nameEn: "Korean",
    region: "한반도",
    earliestSource: "「삼국유사」",
    eraLabel: "13세기",
    eraYear: 1281,
    summary:
      "하늘에서 내려온 환웅과 웅녀의 아들 단군, 버려졌다가 저승길을 연 바리공주가 등장하는 신화입니다.",
    description: [
      "한국 신화는 한 권의 경전으로 정리되지 않았습니다. 고려 때 「삼국유사」에 기록된 단군 같은 건국 신화와, 무당이 굿에서 부르는 서사 무가로 입에서 입으로 전해진 신화가 함께 있습니다.",
      "무속에서는 산신, 제석, 바리공주처럼 집과 마을, 삶과 죽음을 지키는 여러 신을 무신도로 그려 모셨고, 이 그림들이 오늘날 신들의 모습을 보여 주는 자료가 되었습니다.",
    ],
    coverExhibitId: "sansin-honolulu",
  },
  {
    slug: "finnish",
    name: "핀란드 신화",
    nameEn: "Finnish",
    region: "핀란드·카렐리아",
    earliestSource: "아그리콜라의 신 목록 · 「칼레발라」",
    eraLabel: "1551년",
    eraYear: 1551,
    summary:
      "노래로 세상을 움직이는 현자 베이네뫼이넨과 북쪽 나라의 여주인 로우히가 보물 삼포를 두고 다투는 신화입니다.",
    description: [
      "핀란드 신화는 오랫동안 노래로만 전해졌습니다. 1551년 미카엘 아그리콜라가 시편 번역본 서문에 토착 신들의 이름을 적은 것이 가장 이른 기록입니다.",
      "19세기에 엘리아스 뢴로트가 카렐리아 지방의 옛 노래를 모아 서사시 「칼레발라」(1835년 초판, 1849년 완전판)로 엮었고, 화가 악셀리 갈렌칼렐라가 그 장면들을 그렸습니다.",
    ],
    coverExhibitId: "louhi-sampo",
  },
  {
    slug: "maya",
    name: "마야 신화",
    nameEn: "Maya",
    region: "유카탄반도·과테말라 고지",
    earliestSource: "고전기 비문 · 「드레스덴 코덱스」 · 「포폴 부」",
    eraLabel: "3~9세기 (고전기 비문)",
    eraYear: 250,
    summary:
      "옥수수로 사람을 빚은 창조 신들과, 저승의 신들을 꺾은 영웅 쌍둥이가 등장하는 마야 문명의 신화입니다.",
    description: [
      "마야 사람들은 고전기(3~9세기)의 돌 비문과 토기에 신들의 이름과 모습을 남겼고, 나무껍질 종이로 만든 그림 문서 「드레스덴 코덱스」에는 비의 신 차크와 이참나가 여러 번 나옵니다.",
      "창조 신화는 16세기 키체 마야 사람들이 기록한 「포폴 부」에 전합니다. 신들은 흙과 나무로 사람을 만들려다 실패하고, 마지막에 옥수수로 지금의 사람을 빚었다고 합니다.",
    ],
    coverExhibitId: "maize-god-copan",
  },
];
