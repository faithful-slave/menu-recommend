-- seed.sql
-- menus 기본 샘플 + votes 초기화
insert into menus(id, name, spicy, time, age, note) values
('kimchi-stew','김치찌개','매움', ARRAY['점심','저녁','야식'], ARRAY['10대','20대','30대','40대','50대'], '따끈하게 밥이랑') on conflict do nothing,
('doenjang','된장찌개','안매움', ARRAY['점심','저녁'], ARRAY['20대','30대','40대','50대'], null) on conflict do nothing,
('bibimbap','비빔밥','보통', ARRAY['점심','저녁'], ARRAY['10대','20대','30대','40대','50대'], null) on conflict do nothing,
('kimbap','김밥','안매움', ARRAY['아침','점심','간식'], ARRAY['10대','20대','30대','40대','50대'], null) on conflict do nothing,
('ramen','라면','보통', ARRAY['점심','저녁','야식'], ARRAY['10대','20대','30대'], null) on conflict do nothing,
('jajang','짜장면','안매움', ARRAY['점심','저녁'], ARRAY['10대','20대','30대','40대'], null) on conflict do nothing,
('jjamppong','짬뽕','매움', ARRAY['점심','저녁'], ARRAY['10대','20대','30대','40대'], null) on conflict do nothing,
('salad','샐러드','안매움', ARRAY['아침','점심','간식'], ARRAY['20대','30대','40대','50대'], null) on conflict do nothing,
('chicken','치킨','보통', ARRAY['저녁','야식'], ARRAY['10대','20대','30대','40대','50대'], null) on conflict do nothing,
('tteokbokki','떡볶이','매움', ARRAY['점심','간식','야식'], ARRAY['10대','20대','30대'], null) on conflict do nothing,
('samgyeopsal','삼겹살','안매움', ARRAY['저녁'], ARRAY['20대','30대','40대','50대'], null) on conflict do nothing,
('naengmyeon','물냉면','안매움', ARRAY['점심','저녁'], ARRAY['20대','30대','40대','50대'], null) on conflict do nothing,
('bibim-naeng','비빔냉면','매움', ARRAY['점심','저녁'], ARRAY['20대','30대','40대'], null) on conflict do nothing,
('pork-cutlet','돈가스','안매움', ARRAY['점심','저녁'], ARRAY['10대','20대','30대','40대'], null) on conflict do nothing,
('sushi','초밥','안매움', ARRAY['점심','저녁'], ARRAY['20대','30대','40대','50대'], null) on conflict do nothing,
('pho','쌀국수','안매움', ARRAY['점심','저녁'], ARRAY['20대','30대','40대'], null) on conflict do nothing,
('curry','카레','보통', ARRAY['아침','점심','저녁'], ARRAY['10대','20대','30대','40대','50대'], null) on conflict do nothing,
('toast','토스트','안매움', ARRAY['아침','간식'], ARRAY['10대','20대','30대','40대','50대'], null) on conflict do nothing,
('yukgaejang','육개장','아주매움', ARRAY['점심','저녁'], ARRAY['20대','30대','40대','50대'], null) on conflict do nothing,
('mandu','만두','안매움', ARRAY['아침','점심','간식','야식'], ARRAY['10대','20대','30대','40대','50대'], null) on conflict do nothing;
