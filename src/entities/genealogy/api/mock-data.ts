import type { Genealogy, GenealogyNode } from "../model/types";

/** 사람: 이름, 영문 이름, Ark 신·인물 주소(있을 때), 메모 */
const p = (name: string, nameEn: string, slug?: string, note?: string): GenealogyNode => ({
  name,
  nameEn,
  ...(slug && { slug }),
  ...(note && { note }),
});
/** 사람에 혼인(배우자와 자식)을 붙입니다. 배우자가 없으면 null */
const withUnions = (
  node: GenealogyNode,
  ...unions: { partner: GenealogyNode | null; children: GenealogyNode[]; note?: string }[]
): GenealogyNode => ({ ...node, unions });
const u = (partner: GenealogyNode | null, children: GenealogyNode[], note?: string) => ({
  partner,
  children,
  ...(note && { note }),
});

/**
 * 신화별 신들의 계보
 * 대표 문헌의 전승을 따르고, 문헌마다 다르면 note에 적습니다.
 * slug는 Ark에 있는 신·인물만 적습니다. (e2e/genealogy.spec.ts가 주소를 확인합니다)
 */
export const MOCK_GENEALOGIES: Genealogy[] = [
  {
    pantheonSlug: "greek",
    source: "헤시오도스 「신들의 계보」, 아폴로도로스 「비블리오테케」, 「일리아스」",
    roots: [
      withUnions(
        p("가이아", "Gaia", undefined, "카오스 다음에 생겨난 대지"),
        u(p("우라노스", "Uranus"), [
          p("오케아노스", "Oceanus"),
          withUnions(
            p("히페리온", "Hyperion"),
            u(p("테이아", "Theia"), [
              withUnions(
                p("헬리오스", "Helios"),
                u(p("페르세", "Perse"), [p("키르케", "Circe", "circe")]),
              ),
              p("셀레네", "Selene"),
              p("에오스", "Eos"),
            ]),
          ),
          withUnions(
            p("코이오스", "Coeus"),
            u(p("포이베", "Phoebe"), [
              withUnions(
                p("레토", "Leto"),
                u(p("제우스", "Zeus", "zeus"), [
                  p("아폴론", "Apollo", "apollo"),
                  p("아르테미스", "Artemis", "artemis"),
                ]),
              ),
            ]),
          ),
          withUnions(
            p("이아페토스", "Iapetus"),
            u(p("클리메네", "Clymene"), [p("아틀라스", "Atlas"), p("프로메테우스", "Prometheus")]),
          ),
          withUnions(
            p("크로노스", "Cronus"),
            u(p("레아", "Rhea"), [
              p("헤스티아", "Hestia"),
              withUnions(
                p("데메테르", "Demeter", "demeter"),
                u(p("제우스", "Zeus", "zeus"), [
                  withUnions(p("페르세포네", "Persephone"), u(p("하데스", "Hades", "hades"), [])),
                ]),
              ),
              withUnions(
                p("헤라", "Hera", "hera"),
                u(p("제우스", "Zeus", "zeus"), [
                  p("아레스", "Ares"),
                  p("헤베", "Hebe"),
                  p(
                    "헤파이스토스",
                    "Hephaestus",
                    "hephaestus",
                    "헤라 혼자 낳았다는 전승도 있습니다",
                  ),
                ]),
              ),
              p("하데스", "Hades", "hades"),
              withUnions(
                p("포세이돈", "Poseidon", "poseidon"),
                u(
                  p("메두사", "Medusa", "medusa"),
                  [p("페가수스", "Pegasus", "pegasus"), p("크리사오르", "Chrysaor")],
                  "메두사의 목이 베일 때 태어났습니다",
                ),
                u(p("토오사", "Thoosa"), [p("폴리페모스", "Polyphemus", "polyphemus")]),
              ),
              withUnions(
                p("제우스", "Zeus", "zeus"),
                u(p("메티스", "Metis"), [
                  p("아테나", "Athena", "athena", "제우스의 머리에서 태어났습니다"),
                ]),
                u(p("마이아", "Maia"), [p("헤르메스", "Hermes", "hermes")]),
                u(p("세멜레", "Semele"), [p("디오니소스", "Dionysus", "dionysus")]),
                u(p("알크메네", "Alcmene"), [p("헤라클레스", "Heracles", "heracles")]),
                u(p("다나에", "Danaë"), [
                  withUnions(
                    p("페르세우스", "Perseus", "perseus"),
                    u(p("안드로메다", "Andromeda", "andromeda"), []),
                  ),
                ]),
                u(p("레다", "Leda"), [
                  p(
                    "디오스쿠로이",
                    "Dioscuri",
                    "dioscuri",
                    "폴리데우케스는 제우스의, 카스토르는 틴다레오스의 아들이라는 전승도 있습니다",
                  ),
                  p("헬레네", "Helen"),
                ]),
              ),
            ]),
          ),
          p("키클롭스 삼형제", "Cyclopes"),
        ]),
        u(p("타르타로스", "Tartarus"), [
          withUnions(
            p("티폰", "Typhon", "typhon"),
            u(p("에키드나", "Echidna"), [
              p("케르베로스", "Cerberus", "cerberus"),
              p("히드라", "Hydra", "hydra"),
              p("키마이라", "Chimera", "chimera"),
            ]),
          ),
        ]),
      ),
      withUnions(
        p("우라노스", "Uranus"),
        u(
          null,
          [
            p(
              "아프로디테",
              "Aphrodite",
              "aphrodite",
              "크로노스가 자른 우라노스의 몸에서 일어난 바다 거품에서 태어났습니다",
            ),
          ],
          "「신들의 계보」의 전승",
        ),
      ),
      withUnions(
        p("포르키스", "Phorcys"),
        u(p("케토", "Ceto"), [
          p("스텐노", "Stheno"),
          p("에우리알레", "Euryale", "euryale"),
          p("메두사", "Medusa", "medusa"),
        ]),
      ),
      withUnions(
        p("펠레우스", "Peleus"),
        u(p("테티스", "Thetis", undefined, "바다의 님프"), [
          p("아킬레우스", "Achilles", "achilles"),
        ]),
      ),
      withUnions(
        p("프리아모스", "Priam", undefined, "트로이의 왕"),
        u(p("헤카베", "Hecuba"), [
          p("헥토르", "Hector", "hector"),
          p("파리스", "Paris", "paris"),
          p("카산드라", "Cassandra"),
        ]),
      ),
    ],
  },
  {
    pantheonSlug: "norse",
    source: "스노리 스투를루손 「산문 에다」",
    roots: [
      withUnions(
        p("부리", "Búri", undefined, "암소 아우둠라가 핥은 소금 바위에서 나왔습니다"),
        u(null, [
          withUnions(
            p("보르", "Borr"),
            u(p("베스틀라", "Bestla", undefined, "거인의 딸"), [
              withUnions(
                p("오딘", "Odin", "odin"),
                u(p("프리그", "Frigg", "frigg"), [
                  p("발드르", "Baldr", "baldr"),
                  p("회드", "Höðr"),
                ]),
                u(p("요르드", "Jörð", undefined, "대지의 여신"), [
                  withUnions(
                    p("토르", "Thor", "thor"),
                    u(p("시프", "Sif"), [p("스루드", "Þrúðr")]),
                  ),
                ]),
                u(p("아홉 어머니", "Nine Mothers", undefined, "바다의 파도 처녀들"), [
                  p("헤임달", "Heimdall", "heimdall"),
                ]),
                u(null, [
                  p(
                    "티르",
                    "Týr",
                    "tyr",
                    "「산문 에다」의 전승. 「히미르의 노래」에서는 거인 히미르의 아들입니다",
                  ),
                ]),
              ),
              p("빌리", "Vili"),
              p("베", "Vé"),
            ]),
          ),
        ]),
      ),
      withUnions(
        p("뇨르드", "Njörðr", undefined, "바다의 신. 바니르 신족"),
        u(
          null,
          [p("프레이르", "Freyr"), p("프레이야", "Freyja", "freyja")],
          "어머니는 뇨르드의 누이라고 전합니다",
        ),
      ),
      withUnions(
        p("로키", "Loki", "loki", "거인 파르바우티와 라우페이의 아들"),
        u(p("앙그르보다", "Angrboða", undefined, "거인"), [
          p("펜리르", "Fenrir", "fenrir"),
          p("요르문간드", "Jörmungandr", "jormungandr"),
          p("헬", "Hel"),
        ]),
        u(
          p("스바딜파리", "Svaðilfari", undefined, "거인의 말"),
          [p("슬레이프니르", "Sleipnir", "sleipnir")],
          "로키가 암말로 변해 낳았습니다",
        ),
        u(p("시긴", "Sigyn"), [p("발리", "Váli"), p("나르피", "Narfi")]),
      ),
    ],
  },
  {
    pantheonSlug: "egyptian",
    source: "헬리오폴리스의 아홉 신(엔네아드) 전승, 플루타르코스 「이시스와 오시리스」",
    roots: [
      withUnions(
        p("아툼", "Atum", undefined, "스스로 생겨난 창조신. 라와 합쳐 라-아툼으로도 섬겼습니다"),
        u(null, [
          withUnions(
            p("슈", "Shu", undefined, "공기"),
            u(p("테프누트", "Tefnut", undefined, "습기"), [
              withUnions(
                p("게브", "Geb", undefined, "땅"),
                u(p("누트", "Nut", undefined, "하늘"), [
                  withUnions(
                    p("오시리스", "Osiris", "osiris"),
                    u(p("이시스", "Isis", "isis"), [p("호루스", "Horus", "horus")]),
                  ),
                  p("이시스", "Isis", "isis"),
                  p("세트", "Set", "set"),
                  withUnions(
                    p("네프티스", "Nephthys"),
                    u(
                      p("오시리스", "Osiris", "osiris"),
                      [p("아누비스", "Anubis", "anubis")],
                      "플루타르코스의 전승",
                    ),
                  ),
                ]),
              ),
            ]),
          ),
        ]),
      ),
      withUnions(
        p("라", "Ra", "ra"),
        u(null, [
          p("하토르", "Hathor", "hathor", "‘라의 눈’"),
          p("바스테트", "Bastet", "bastet"),
          p("마아트", "Maat"),
        ]),
      ),
    ],
  },
  {
    pantheonSlug: "mesopotamian",
    source: "「에누마 엘리시」, 수메르 신화",
    roots: [
      withUnions(
        p("압주", "Apsu", undefined, "민물"),
        u(p("티아마트", "Tiamat", "tiamat", "바닷물"), [
          withUnions(
            p("라흐무", "Lahmu"),
            u(p("라하무", "Lahamu"), [
              withUnions(
                p("안샤르", "Anshar"),
                u(p("키샤르", "Kishar"), [
                  withUnions(
                    p("아누", "Anu", undefined, "하늘의 신"),
                    u(null, [
                      withUnions(
                        p("엔키(에아)", "Enki (Ea)", "enki"),
                        u(p("담키나", "Damkina"), [p("마르두크", "Marduk", "marduk")]),
                      ),
                    ]),
                  ),
                ]),
              ),
            ]),
          ),
        ]),
      ),
      withUnions(
        p("난나(신)", "Nanna (Sin)", undefined, "달의 신"),
        u(p("닌갈", "Ningal"), [
          p(
            "이난나(이슈타르)",
            "Inanna (Ishtar)",
            "ishtar",
            "하늘의 신 아누의 딸이라는 전승도 있습니다",
          ),
          p("우투(샤마시)", "Utu (Shamash)"),
        ]),
      ),
      withUnions(
        p("루갈반다", "Lugalbanda", undefined, "우루크의 왕"),
        u(p("닌순", "Ninsun", undefined, "들소의 여신"), [p("길가메시", "Gilgamesh", "gilgamesh")]),
      ),
    ],
  },
  {
    pantheonSlug: "hindu",
    source: "푸라나 문헌, 「라마야나」",
    roots: [
      withUnions(p("브라흐마", "Brahma", "brahma"), u(p("사라스바티", "Saraswati"), [])),
      withUnions(
        p("비슈누", "Vishnu", "vishnu"),
        u(p("락슈미", "Lakshmi", "lakshmi"), [], "크리슈나와 라마는 비슈누의 화신입니다"),
      ),
      withUnions(
        p("시바", "Shiva", "shiva"),
        u(p("파르바티", "Parvati", undefined, "두르가는 파르바티의 무서운 모습으로도 섬깁니다"), [
          p("가네샤", "Ganesha", "ganesha"),
          p("카르티케야", "Kartikeya"),
        ]),
      ),
      withUnions(
        p("바유", "Vayu", undefined, "바람의 신"),
        u(p("안자나", "Anjana"), [p("하누만", "Hanuman", "hanuman")]),
      ),
    ],
  },
  {
    pantheonSlug: "japanese",
    source: "「고사기」, 「일본서기」",
    roots: [
      withUnions(
        p("이자나기와 이자나미", "Izanagi and Izanami", "izanagi-izanami"),
        u(
          null,
          [p("일본의 섬들과 여러 신", "the islands and many kami")],
          "부부가 함께 낳았습니다",
        ),
        u(
          null,
          [
            withUnions(
              p("아마테라스", "Amaterasu", "amaterasu"),
              u(null, [
                withUnions(
                  p("아메노오시호미미", "Ame-no-Oshihomimi"),
                  u(null, [p("니니기", "Ninigi", undefined, "증손이 첫 천황 진무라고 전합니다")]),
                ),
              ]),
            ),
            p("쓰쿠요미", "Tsukuyomi"),
            withUnions(
              p("스사노오", "Susanoo", "susanoo"),
              u(p("구시나다히메", "Kushinadahime"), [], "야마타노오로치에게서 구한 아내"),
              u(p("가무오이치히메", "Kamu-ōichi-hime"), [
                p("우카노미타마", "Ukanomitama", undefined, "이나리와 같은 신으로 섬깁니다"),
              ]),
            ),
          ],
          "이자나기가 저승에서 돌아와 몸을 씻을 때 태어났습니다",
        ),
      ),
    ],
  },
  {
    pantheonSlug: "korean",
    source: "「삼국유사」, 「동명왕편」, 서사 무가 「바리공주」",
    roots: [
      withUnions(
        p("환인", "Hwanin", "hwanin"),
        u(null, [
          withUnions(
            p("환웅", "Hwanung", "hwanung"),
            u(p("웅녀", "Ungnyeo", "ungnyeo"), [p("단군", "Dangun", "dangun")]),
          ),
        ]),
      ),
      withUnions(
        p("하백", "Habaek", undefined, "물의 신"),
        u(null, [
          withUnions(
            p("유화", "Yuhwa", "yuhwa"),
            u(
              p("해모수", "Haemosu", "haemosu"),
              [
                withUnions(
                  p("동명성왕(주몽)", "Dongmyeong (Jumong)", "dongmyeong"),
                  u(p("예씨 부인", "Lady Ye"), [p("유리왕", "King Yuri")]),
                  u(
                    p("소서노", "Soseono"),
                    [p("비류", "Biryu"), p("온조", "Onjo", undefined, "백제를 세웠습니다")],
                    "「삼국사기」의 한 전승",
                  ),
                ),
              ],
              "「삼국사기」는 주몽이 햇빛을 받아 잉태되었다고도 적습니다",
            ),
          ),
        ]),
      ),
      withUnions(
        p("오구대왕", "King Ogu"),
        u(p("길대부인", "Lady Gildae"), [p("바리공주", "Princess Bari", "bari", "일곱째 딸")]),
      ),
    ],
  },
  {
    pantheonSlug: "aztec",
    source: "「멕시코인의 역사」(16세기), 「피렌체 코덱스」",
    roots: [
      withUnions(
        p("오메테쿠틀리", "Ometecuhtli", undefined, "두 겹의 주인"),
        u(p("오메시우아틀", "Omecihuatl"), [
          p("붉은 테스카틀리포카(시페 토텍)", "Red Tezcatlipoca (Xipe Totec)"),
          p("검은 테스카틀리포카", "Black Tezcatlipoca", "tezcatlipoca"),
          p("케찰코아틀", "Quetzalcoatl", "quetzalcoatl"),
          p(
            "우이칠로포치틀리",
            "Huitzilopochtli",
            "huitzilopochtli",
            "다른 전승에서는 대지의 여신 코아틀리쿠에의 아들입니다",
          ),
        ]),
      ),
    ],
  },
  {
    pantheonSlug: "inca",
    source: "에스파냐 연대기 작가들의 기록",
    roots: [
      withUnions(
        p("비라코차", "Viracocha", "viracocha"),
        u(null, [
          withUnions(
            p("인티", "Inti", "inti"),
            u(p("마마 킬랴", "Mama Quilla", undefined, "달의 여신"), [
              p("망코 카팍", "Manco Cápac", undefined, "쿠스코를 세운 첫 잉카"),
              p("마마 오클료", "Mama Ocllo"),
            ]),
          ),
        ]),
      ),
    ],
  },
  {
    pantheonSlug: "polynesian",
    source: "마오리 전승",
    roots: [
      withUnions(
        p("랑기누이", "Ranginui", undefined, "하늘의 아버지"),
        u(p("파파투아누쿠", "Papatūānuku", undefined, "땅의 어머니"), [
          p("탕가로아", "Tangaroa", "tangaroa"),
          p("타네", "Tāne", undefined, "숲의 신. 부모를 떼어 놓았습니다"),
          p("투마타우엥가", "Tūmatauenga", undefined, "전쟁의 신. 하와이의 쿠에 해당합니다"),
          p("롱고", "Rongo"),
          p("타휘리마테아", "Tāwhirimātea", undefined, "바람의 신"),
        ]),
      ),
      withUnions(
        p("타랑가", "Taranga"),
        u(p("마케아투타라", "Makeatutara"), [
          p("마우이", "Māui", "maui", "막내로 태어나 바다에 버려졌다가 살아났습니다"),
        ]),
      ),
    ],
  },
  {
    pantheonSlug: "maya",
    source: "「포폴 부」",
    roots: [
      withUnions(
        p("슈피야코크", "Xpiyacoc"),
        u(p("슈무카네", "Xmucane"), [
          withUnions(
            p("훈 우나푸", "Hun Hunahpu", "maize-god", "옥수수 신으로 보는 해석이 있습니다"),
            u(
              p("슈킥", "Xquic", undefined, "저승 지배자의 딸"),
              [p("우나푸", "Hunahpu"), p("슈발랑케", "Xbalanque")],
              "영웅 쌍둥이",
            ),
          ),
          p("부쿠브 우나푸", "Vucub Hunahpu"),
        ]),
      ),
    ],
  },
  {
    pantheonSlug: "celtic",
    source: "아일랜드의 「침략의 책」과 얼스터·핀 이야기",
    roots: [
      withUnions(
        p("다그다", "The Dagda", undefined, "투어허 데 다넌의 아버지 신"),
        u(null, [p("브리지트", "Brigid", "brigid")]),
        u(p("보안", "Boann", undefined, "보인강의 여신"), [p("앵거스", "Aengus")]),
      ),
      withUnions(
        p("루", "Lugh"),
        u(p("데크티네", "Deichtine"), [
          p("쿠 훌린", "Cú Chulainn", "cuchulainn", "사람인 아버지 수알탐의 아들이라고도 합니다"),
        ]),
      ),
      withUnions(p("리르", "Lir"), u(null, [p("마나난 막 리르", "Manannán mac Lir", "manannan")])),
      withUnions(
        p("핀 막 쿨", "Fionn mac Cumhaill", "fionn"),
        u(p("사브", "Sadhbh", undefined, "사슴으로 변한 여인"), [p("오신", "Oisín", "oisin")]),
      ),
    ],
  },
  {
    pantheonSlug: "finnish",
    source: "「칼레발라」",
    roots: [
      withUnions(
        p("일마타르", "Ilmatar", undefined, "공기의 여신"),
        u(null, [p("베이네뫼이넨", "Väinämöinen", "vainamoinen")]),
      ),
      withUnions(
        p("로우히", "Louhi", "louhi"),
        u(null, [
          withUnions(
            p("포흐욜라의 처녀", "Maiden of Pohjola"),
            u(p("일마리넨", "Ilmarinen", "ilmarinen"), [], "삼포를 벼려 바치고 맞은 아내"),
          ),
        ]),
      ),
    ],
  },
  {
    pantheonSlug: "chinese",
    source: "「삼오역기」, 「회남자」 등",
    roots: [
      p("반고", "Pangu", "pangu", "알 같은 혼돈에서 깨어나 하늘과 땅을 갈랐습니다"),
      withUnions(
        p("복희", "Fuxi", undefined, "여와의 오빠"),
        u(
          p("여와", "Nüwa", "nuwa"),
          [p("사람들", "humankind")],
          "남매가 부부가 되어 사람의 조상이 되었다는 전승",
        ),
      ),
      withUnions(p("후예", "Hou Yi", "hou-yi"), u(p("항아", "Chang'e", "change"), [])),
    ],
  },
  {
    pantheonSlug: "canaanite",
    source: "우가리트 점토판",
    roots: [
      withUnions(
        p("엘", "El", undefined, "신들의 아버지"),
        u(
          p("아세라", "Asherah"),
          [p("얌", "Yam", undefined, "바다의 신"), p("모트", "Mot", undefined, "죽음의 신")],
          "‘엘의 일흔 아들’이라 불린 신들",
        ),
      ),
      withUnions(
        p("다곤", "Dagan"),
        u(null, [
          withUnions(
            p("바알", "Baal", "baal"),
            u(p("아낫", "Anat", undefined, "바알의 누이이자 짝으로 그려집니다"), []),
          ),
        ]),
      ),
    ],
  },
  {
    pantheonSlug: "hittite",
    source: "후르리·히타이트의 「쿠마르비 노래」",
    roots: [
      withUnions(
        p("알랄루", "Alalu", undefined, "하늘의 첫 왕"),
        u(null, [p("쿠마르비", "Kumarbi", undefined, "아누를 몰아낸 신들의 아버지")]),
      ),
      withUnions(
        p("아누", "Anu"),
        u(null, [p("테슈브", "Teshub", "teshub", "쿠마르비가 삼킨 아누의 정기에서 태어났습니다")]),
      ),
    ],
  },
  {
    pantheonSlug: "vietnamese",
    source: "「영남척괴열전」",
    roots: [
      withUnions(
        p("락롱꾸언", "Lạc Long Quân", "lac-long-quan"),
        u(p("어우꺼", "Âu Cơ", undefined, "산의 선녀"), [
          p("백 명의 아들", "one hundred sons", undefined, "맏아들이 첫 훙왕이 되었습니다"),
        ]),
      ),
    ],
  },
  {
    pantheonSlug: "arthurian",
    source: "몬머스의 제프리 「브리타니아 열왕사」, 맬러리 「아서 왕의 죽음」",
    roots: [
      withUnions(
        p("이그레인", "Igraine"),
        u(p("우서 펜드래건", "Uther Pendragon"), [
          withUnions(p("아서 왕", "King Arthur", "king-arthur"), u(p("귀네비어", "Guinevere"), [])),
        ]),
        u(p("콘월 공작 고를루아", "Gorlois"), [
          p("모르간 르 페이", "Morgan le Fay", "morgan-le-fay"),
          withUnions(
            p("모르고스", "Morgause"),
            u(p("로트 왕", "King Lot"), [
              p("가웨인", "Gawain", "gawain"),
              p("가레스", "Gareth", "gareth"),
            ]),
            u(
              p("아서 왕", "King Arthur", "king-arthur"),
              [p("모드레드", "Mordred", "mordred")],
              "맬러리의 전승",
            ),
          ),
        ]),
      ),
      withUnions(
        p("랜슬롯", "Lancelot", "lancelot"),
        u(p("일레인", "Elaine of Corbenic"), [p("갤러해드", "Galahad", "galahad")]),
      ),
      withUnions(
        p("퍼시벌", "Percival", "percival"),
        u(null, [p("로엔그린", "Lohengrin", "lohengrin", "볼프람의 「파르치팔」")]),
      ),
    ],
  },
  {
    pantheonSlug: "germanic",
    source: "「니벨룽겐의 노래」",
    roots: [
      withUnions(
        p("지크문트", "Siegmund"),
        u(p("지클린트", "Sieglind"), [
          withUnions(
            p("지크프리트", "Siegfried", "siegfried"),
            u(p("크림힐트", "Kriemhild", "kriemhild"), []),
          ),
        ]),
      ),
      withUnions(
        p("당크라트", "Dankrat", undefined, "부르군트의 왕"),
        u(p("우테", "Ute"), [p("군터", "Gunther"), p("크림힐트", "Kriemhild", "kriemhild")]),
      ),
    ],
  },
  {
    pantheonSlug: "roman",
    source: "베르길리우스 「아이네이스」, 리비우스 「로마사」",
    roots: [
      withUnions(
        p("베누스", "Venus", undefined, "그리스의 아프로디테"),
        u(p("안키세스", "Anchises"), [
          withUnions(
            p("아이네이아스", "Aeneas", "aeneas"),
            u(p("크레우사", "Creusa"), [
              p("아스카니우스", "Ascanius", undefined, "알바롱가를 세웠습니다"),
            ]),
          ),
        ]),
      ),
      withUnions(
        p("마르스", "Mars"),
        u(p("레아 실비아", "Rhea Silvia", undefined, "알바롱가 왕의 딸"), [
          p("로물루스", "Romulus", "romulus"),
          p("레무스", "Remus"),
        ]),
      ),
    ],
  },
  {
    pantheonSlug: "iranian",
    source: "페르도우시 「샤나메」",
    roots: [
      withUnions(
        p("페레이둔", "Fereydun", "fereydun"),
        u(
          null,
          [p("살름", "Salm"), p("투르", "Tur"), p("이라지", "Iraj")],
          "세상을 셋으로 나누어 준 세 아들",
        ),
      ),
      withUnions(
        p("잘", "Zal"),
        u(p("루다베", "Rudaba"), [
          withUnions(
            p("루스탐", "Rostam", "rostam"),
            u(p("타흐미네", "Tahmineh"), [
              p("소흐랍", "Sohrab", undefined, "아버지인 줄 모른 채 루스탐과 싸워 죽었습니다"),
            ]),
          ),
        ]),
      ),
    ],
  },
];
