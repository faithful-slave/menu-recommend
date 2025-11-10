// server/server.js (교정본: 불필요한 `});` 제거 + SSE 하트비트 포함)
import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ── SSE 구독자 관리
const clients = new Set();
function broadcast(event) {
  const data = JSON.stringify(event);
  for (const res of clients) {
    res.write(`event: update\n`);
    res.write(`data: ${data}\n\n`);
  }
}

// ── 테이블 생성
async function ensureTables() {
  await pool.query(`
    create table if not exists menus (
      id text primary key,
      name text not null,
      spicy text not null,
      time text[] not null,
      age text[] not null,
      note text
    );
  `);
  await pool.query(`
    create table if not exists votes (
      menu_id text primary key references menus(id) on delete cascade,
      likes integer not null default 0,
      dislikes integer not null default 0
    );
  `);
}

// ── 공통 조회
async function getMenusWithCounts() {
  const { rows } = await pool.query(`
    select m.*,
           coalesce(v.likes,0) as likes,
           coalesce(v.dislikes,0) as dislikes
      from menus m
      left join votes v on v.menu_id = m.id
     order by m.name asc;
  `);
  return rows;
}

async function getCounts(menuId){
  const { rows } = await pool.query(
    `select coalesce(likes,0) as likes, coalesce(dislikes,0) as dislikes
       from votes where menu_id=$1`, [menuId]
  );
  return rows[0] || { likes: 0, dislikes: 0 };
}

// ── 라우팅
app.get('/health', (req,res)=> res.json({ ok:true }));

app.get('/menus', async (req,res,next)=>{
  try {
    res.json({ items: await getMenusWithCounts() });
  } catch (e) { next(e); }
});

// action: like | dislike | unlike | undislike
app.post('/vote', async (req,res,next)=>{
  const { menuId, action } = req.body || {};
  if(!menuId || !['like','dislike','unlike','undislike'].includes(action)){
    return res.status(400).json({ error: 'invalid payload' });
  }
  try {
    await pool.query('begin');
    await pool.query(
      `insert into votes(menu_id,likes,dislikes) values($1,0,0)
       on conflict(menu_id) do nothing`, [menuId]
    );
    if(action==='like')       await pool.query(`update votes set likes = likes + 1 where menu_id=$1`, [menuId]);
    if(action==='dislike')    await pool.query(`update votes set dislikes = dislikes + 1 where menu_id=$1`, [menuId]);
    if(action==='unlike')     await pool.query(`update votes set likes = greatest(likes - 1,0) where menu_id=$1`, [menuId]);
    if(action==='undislike')  await pool.query(`update votes set dislikes = greatest(dislikes - 1,0) where menu_id=$1`, [menuId]);

    const counts = await getCounts(menuId);
    await pool.query('commit');

    broadcast({ menuId, likes: Number(counts.likes), dislikes: Number(counts.dislikes) });
    res.json({ ok:true, menuId, ...counts });
  } catch (e) {
    try { await pool.query('rollback'); } catch(_) {}
    next(e);
  }
});

// ── SSE 스트림
app.get('/stream', (req,res)=>{
  res.set({
    'Content-Type':'text/event-stream',
    'Cache-Control':'no-cache',
    'Connection':'keep-alive',
    'Access-Control-Allow-Origin':'*'
  });
  res.flushHeaders();
  clients.add(res);

  // 하트비트(무료티어 유휴 끊김 방지)
  const timer = setInterval(() => { res.write(': ping\n\n'); }, 25000);
  req.on('close', () => { clearInterval(timer); clients.delete(res); });

  res.write(`event: hello\n`);
  res.write(`data: {"ok":true}\n\n`);
});

// ── 에러 핸들러
app.use((err, req, res, next)=>{
  console.error(err);
  res.status(500).json({ error: 'internal_error' });
});

const port = process.env.PORT || 3000;
ensureTables().then(()=>{
  app.listen(port, ()=> console.log(`server on :${port}`));
});
