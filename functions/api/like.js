export async function onRequest({ env, request }) {
  const db = env.DB;
  const ip = getIP(request);
  const { item_id } = await request.json().catch(()=>({}));
  const item = String(item_id||'').slice(0,100);
  if(!item) return new Response(JSON.stringify({ ok:false, error:'item_id required' }), { status:400, headers:{'content-type':'application/json'} });

  await db.exec(`CREATE TABLE IF NOT EXISTS likes (item_id TEXT, ip TEXT, ts INTEGER, UNIQUE(item_id, ip))`);
  await db.prepare(`INSERT OR IGNORE INTO likes(item_id, ip, ts) VALUES (?, ?, strftime('%s','now'))`).bind(item, ip).run();
  const { results } = await db.prepare(`SELECT COUNT(1) as cnt FROM likes WHERE item_id = ?`).bind(item).all();
  return new Response(JSON.stringify({ ok:true, count: results?.[0]?.cnt ?? 0 }), { headers:{'content-type':'application/json'} });
}
function getIP(req){
  const h=req.headers;
  return h.get('cf-connecting-ip') || (h.get('x-forwarded-for')||'').split(',')[0].trim() || '0.0.0.0';
}
