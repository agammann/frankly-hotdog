import {classify, validateImage, PublicError, MAX_IMAGE} from './classifier.mjs';
import {handleMcp} from './mcp.mjs';
import {assets} from './assets.generated.mjs';
const buckets = new Map();
let localDay='', localCount=0;
function json(value,status=200,extra={}) { return new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...extra}}); }
async function limitedBody(request) {
  if (Number(request.headers.get('content-length')) > MAX_IMAGE+8192) throw new PublicError('Image is too large.',413);
  const reader=request.body?.getReader(); if(!reader)throw new PublicError('Missing request body.');
  let size=0; const chunks=[];
  while(true) {const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX_IMAGE+8192){await reader.cancel();throw new PublicError('Image is too large.',413);}chunks.push(value);}
  const bytes=new Uint8Array(size);let p=0;for(const c of chunks){bytes.set(c,p);p+=c.length;}
  return new TextDecoder().decode(bytes);
}
async function reserve(env,ip) {
  const now=Date.now(), minute=Math.floor(now/60000);
  for(const [k,v]of buckets)if(v.minute!==minute)buckets.delete(k);
  const b=buckets.get(ip); if(b?.minute===minute&&b.count>=6)throw new PublicError('A little breather. Try again in a minute.',429);
  if(!b&&buckets.size>=4096)throw new PublicError('The service is busy. Try again shortly.',429);
  buckets.set(ip,{minute,count:b?.minute===minute?b.count+1:1});
  const day=new Date().toISOString().slice(0,10), limit=Math.min(Number(env.DAILY_LIMIT)||100,1000);
  if(env.DB) {
    await env.DB.prepare("DELETE FROM daily_usage WHERE day < date('now','-30 days')").run();
    const row=await env.DB.prepare('INSERT INTO daily_usage(day,count) VALUES (?,1) ON CONFLICT(day) DO UPDATE SET count=count+1 WHERE count < ? RETURNING count').bind(day,limit).first();
    if(!row)throw new PublicError('Today’s free classifications are all used. Come back tomorrow.',429);
  } else if(env.LOCAL_DEV==='1') {
    if(localDay!==day){localDay=day;localCount=0;} if(localCount>=limit)throw new PublicError('Today’s free classifications are all used. Come back tomorrow.',429);localCount++;
  } else throw new PublicError('The service is not ready yet.',503);
}
export default {async fetch(request,env={}) {
  const url=new URL(request.url),origin=request.headers.get('origin');
  const allowed=!origin||origin===url.origin||/^chrome-extension:\/\/[a-p]{32}$/.test(origin)||/^moz-extension:\/\/[a-f\d-]+$/.test(origin);
  const headers={'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob: data:; connect-src 'self'; frame-ancestors 'none'"};
  if(origin&&allowed){headers['Access-Control-Allow-Origin']=origin;headers.Vary='Origin';}
  if(!allowed)return json({error:'This origin is not allowed.'},403,headers);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, MCP-Protocol-Version','Access-Control-Max-Age':'600'}});
  try {
    if(url.pathname==='/health')return json({status:env.OPENAI_API_KEY&&(env.DB||env.LOCAL_DEV==='1')?'configured':'configuration_required'},200,headers);
    if(url.pathname==='/.well-known/openai-apps-challenge')return new Response(env.OPENAI_DOMAIN_CHALLENGE||'',{status:env.OPENAI_DOMAIN_CHALLENGE?200:404,headers});
    const budget=()=>reserve(env,request.headers.get('cf-connecting-ip')||'local');
    if(url.pathname==='/mcp') {
      if(request.method!=='POST')return new Response(null,{status:405,headers:{...headers,Allow:'POST'}});
      if(!request.headers.get('content-type')?.includes('application/json'))throw new PublicError('Use application/json.',415);
      const raw=await limitedBody(request);
      let parsed;try{parsed=JSON.parse(raw);}catch{throw new PublicError('Invalid JSON.');}
      if(Array.isArray(parsed))throw new PublicError('Batch requests are not supported.');
      const res=await handleMcp(new Request(request.url,{method:'POST',headers:request.headers,body:raw}),env,budget);
      const out=new Response(res.body,res);for(const[k,v]of Object.entries(headers))out.headers.set(k,v);return out;
    }
    if(url.pathname==='/api/classify'&&request.method==='POST') {
      if(!request.headers.get('content-type')?.includes('application/json'))throw new PublicError('Use application/json.',415);
      let body;try{body=JSON.parse(await limitedBody(request));}catch(e){if(e instanceof PublicError)throw e;throw new PublicError('Invalid JSON.');}
      validateImage(body.image); await budget();return json(await classify(body.image,env),200,headers);
    }
    if(!['GET','HEAD'].includes(request.method))return json({error:'Method not allowed.'},405,headers);
    const key=url.pathname==='/'?'/index.html':url.pathname;
    const file=assets[key]||assets[`${key}.html`];
    if(!file)return json({error:'Not found.'},404,headers);
    return new Response(request.method==='HEAD'?null:Uint8Array.from(atob(file.data),c=>c.charCodeAt(0)),{headers:{...headers,'Content-Type':file.type,'Cache-Control':'public, max-age=300'}});
  }catch(e){return json({error:e instanceof PublicError?e.message:'The service is temporarily unavailable.'},e instanceof PublicError?e.status:503,headers);}
}};
