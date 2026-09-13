import test from 'node:test';import assert from 'node:assert/strict';import worker from '../src/worker.mjs';
import {DatabaseSync} from 'node:sqlite';
const env={LOCAL_DEV:'1'};
test('website and policy documents are served with restrictive headers',async()=>{for(const path of ['/','/privacy','/terms','/extension']){const r=await worker.fetch(new Request('https://unit.example'+path),env);assert.equal(r.status,200);assert.ok(r.headers.get('content-security-policy').includes("frame-ancestors 'none'"));}});
test('arbitrary browser origins are rejected',async()=>{const r=await worker.fetch(new Request('https://unit.example/api/classify',{method:'POST',headers:{Origin:'https://evil.example','Content-Type':'application/json'},body:'{}'}),env);assert.equal(r.status,403);});
test('MCP initialization and discovery expose exact tool and output schema',async()=>{const call=async(method,params)=>{const r=await worker.fetch(new Request('https://unit.example/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})}),env);assert.equal(r.status,200);return r.json();};const init=await call('initialize',{protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'tests',version:'1'}});assert.equal(init.result.serverInfo.name,'frankly-hotdog');const list=await call('tools/list',{});assert.equal(list.result.tools.length,1);assert.equal(list.result.tools[0].name,'classify_hotdog_image');assert.ok(list.result.tools[0].outputSchema);assert.equal(list.result.tools[0].annotations.readOnlyHint,false);});
test('MCP malformed and oversized bodies are bounded',async()=>{for(const [body,status] of [['[{}]',400],['{',400],['x'.repeat(2_020_000),413]]){const r=await worker.fetch(new Request('https://unit.example/mcp',{method:'POST',headers:{'Content-Type':'application/json'},body}),env);assert.equal(r.status,status);}});
test('production inference fails closed without durable budget storage',async()=>{const r=await worker.fetch(new Request('https://unit.example/api/classify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:'https://images.wikimedia.org/photo.jpg'})}),{OPENAI_API_KEY:'synthetic-test-credential'});assert.equal(r.status,503);});
test('daily SQL budget is atomic across requests and old aggregates expire',async()=>{
 const db=new DatabaseSync(':memory:');db.exec("CREATE TABLE daily_usage(day TEXT PRIMARY KEY,count INTEGER NOT NULL); INSERT INTO daily_usage VALUES ('2000-01-01', 9)");
 const DB={prepare(sql){return {
   run(){return db.prepare(sql).run();},
   bind(...values){return {first(){return db.prepare(sql).get(...values);}};}
 };}};
 const responses=await Promise.all(Array.from({length:10},(_,i)=>worker.fetch(new Request('https://unit.example/api/classify',{method:'POST',headers:{'Content-Type':'application/json','cf-connecting-ip':'budget-test-'+i},body:JSON.stringify({image:'https://images.wikimedia.org/photo.jpg'})}),{DB,DAILY_LIMIT:'5'})));
 assert.equal(db.prepare('SELECT sum(count) as n FROM daily_usage').get().n,5);assert.equal(responses.filter(r=>r.status===429).length,5);db.close();
});
