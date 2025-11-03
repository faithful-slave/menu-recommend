export async function onRequest({ env, request }) {
  const db = env.DB;
  const url = new URL(request.url);
  const item = String(url.searchParams.get('item_id')||'').slice(0,100);
  if(!item) return new Response(JSON.stringify({ count: 0 }), { headers:{'content-type':'application/json'} });

  await db.exec(`CREATE TABLE IF NOT EXISTS likes (item_id TEXT, ip TEXT, ts INTEGER, UNIQUE(item_id, ip))`);
  const { results } = await db.prepare(`SELECT COUNT(1) as cnt FROM likes WHERE item_id = ?`).bind(item).all();
  return new Response(JSON.stringify({ count: results?.[0]?.cnt ?? 0 }), { headers:{'content-type':'application/json'} });
}
