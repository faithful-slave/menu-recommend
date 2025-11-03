export async function onRequest({ env, request }) {
  const db = env.DB;
  const ip = getIP(request);
  const date = getLocalDate();
  await db.exec(`CREATE TABLE IF NOT EXISTS visits (date TEXT, ip TEXT, ts INTEGER, UNIQUE(date, ip))`);
  await db.prepare(`INSERT OR IGNORE INTO visits(date, ip, ts) VALUES (?, ?, strftime('%s','now'))`).bind(date, ip).run();
  const { results } = await db.prepare(`SELECT COUNT(1) as cnt FROM visits WHERE date = ?`).bind(date).all();
  return json({ ok:true, count: results?.[0]?.cnt ?? 0 });
}

function getIP(req){
  const h=req.headers;
  return h.get('cf-connecting-ip') || (h.get('x-forwarded-for')||'').split(',')[0].trim() || '0.0.0.0';
}
function getLocalDate(){
  const fmt = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'});
  const [y,m,d] = fmt.formatToParts(new Date()).filter(p=>p.type!=='literal').map(p=>p.value);
  return `${y}-${m}-${d}`;
}
function json(obj, init={}){ return new Response(JSON.stringify(obj), {status:200, headers:{'content-type':'application/json', ...init.headers}}); }
