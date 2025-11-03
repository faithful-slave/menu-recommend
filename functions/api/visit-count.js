export async function onRequest({ env }) {
  const db = env.DB;
  await db.exec(`CREATE TABLE IF NOT EXISTS visits (date TEXT, ip TEXT, ts INTEGER, UNIQUE(date, ip))`);
  const date = getLocalDate();
  const { results } = await db.prepare(`SELECT COUNT(1) as cnt FROM visits WHERE date = ?`).bind(date).all();
  return new Response(JSON.stringify({ count: results?.[0]?.cnt ?? 0 }), { headers:{'content-type':'application/json'} });
}
function getLocalDate(){
  const fmt = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'});
  const [y,m,d] = fmt.formatToParts(new Date()).filter(p=>p.type!=='literal').map(p=>p.value);
  return `${y}-${m}-${d}`;
}
