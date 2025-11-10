// server.js
try {
const data = await getMenusWithCounts();
res.json({ items: data });
} catch(err){ next(err); }
});


// 투표: action ∈ like | dislike | unlike | undislike
app.post('/vote', async (req,res,next)=>{
try {
const { menuId, action } = req.body || {};
if(!menuId || !['like','dislike','unlike','undislike'].includes(action)){
return res.status(400).json({ error: 'invalid payload' });
}


await pool.query('begin');
await pool.query(`insert into votes(menu_id, likes, dislikes) values($1,0,0)
on conflict(menu_id) do nothing`, [menuId]);


if(action === 'like') {
await pool.query(`update votes set likes = likes + 1 where menu_id=$1`, [menuId]);
} else if(action === 'dislike') {
await pool.query(`update votes set dislikes = dislikes + 1 where menu_id=$1`, [menuId]);
} else if(action === 'unlike') {
await pool.query(`update votes set likes = greatest(likes - 1, 0) where menu_id=$1`, [menuId]);
} else if(action === 'undislike') {
await pool.query(`update votes set dislikes = greatest(dislikes - 1, 0) where menu_id=$1`, [menuId]);
}


const counts = await getCounts(menuId);
await pool.query('commit');


// 실시간 갱신 전파
broadcast({ menuId, likes: Number(counts.likes), dislikes: Number(counts.dislikes) });


res.json({ ok:true, menuId, ...counts });
} catch(err){
await pool.query('rollback');
next(err);
}
});


// SSE 스트림: 좋아요/싫어요 업데이트를 실시간으로 push
app.get('/stream', (req,res)=>{
res.set({
'Content-Type': 'text/event-stream',
'Cache-Control': 'no-cache',
'Connection': 'keep-alive',
'Access-Control-Allow-Origin': '*'
});
res.flushHeaders();


// 연결 보관
clients.add(res);


// 초기 핑
res.write(`event: hello\n`);
res.write(`data: {"ok":true}\n\n`);


// 연결 종료 처리
req.on('close', ()=>{
clients.delete(res);
});
});


// 오류 핸들링
app.use((err, req, res, next)=>{
console.error(err);
res.status(500).json({ error: 'internal_error' });
});


// 서버 시작
const port = process.env.PORT || 3000;
ensureTables().then(()=>{
app.listen(port, ()=> console.log(`server on :${port}`));
});
