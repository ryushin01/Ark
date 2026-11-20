-- 작가가 1955년 이후에 죽어 아직 저작권 보호 기간(사후 70년)이 남았거나, 작가의 사망 연도를 확인할 수 없는 자료 그림 6점을 운영 DB에서도 뺍니다. (1.1.0)
-- Commons에는 '퍼블릭 도메인'으로 올라 있지만 미국에서만 보호 기간이 끝났거나(PD-US-expired), 근거 없이 PD-scan만 붙은 파일입니다.
--   베아트리스 엘버리(1970년 사망)의 「Heroes of the Dawn」(1914) 삽화 4점: 스카하크, 디어무드, 핀 막 쿨, 오신
--   자벨 보야지안(1957년 사망)의 「Armenian Legends and Poems」(1916) 삽화: 바하근
--   삽화가 R. de Rosciszewski의 사망 연도를 알 수 없는 「A Russian Garland of Fairy Tales」(1916) 삽화: 도브리냐 니키티치
-- 시드(목업 데이터)에서는 이미 뺐지만, 배포 워크플로는 코드에서 사라진 행을 지우지 않으므로 여기서 지웁니다.
-- 유물의 그림(relics.exhibit_id)은 on delete set null이고, 계열 대표 자료로 쓰는 곳은 없습니다.
-- 디어무드·핀·오신·도브리냐는 1.1.0에서 퍼블릭 도메인 그림으로 바꿨고, 스카하크·바하근은 맞는 그림을 찾지 못해 소개만 둡니다.
delete from public.exhibits
where id in (
  'scathach-commons',
  'diarmuid-commons',
  'fionn-commons',
  'oisin-commons',
  'vahagn-commons',
  'dobrynya-commons'
);
