import http from 'node:http';
import worker from './worker.mjs';
const port=Number(process.env.PORT)||4317;
http.createServer(async(req,res)=>{
  try{
    if(!['127.0.0.1:'+port,'localhost:'+port].includes(req.headers.host)){res.writeHead(403);res.end();return;}
    const request=new Request(`http://127.0.0.1:${port}${req.url}`,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:req,duplex:'half'}:{})});
    const response=await worker.fetch(request,{...process.env,LOCAL_DEV:'1'});
    res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
  }catch{res.writeHead(500);res.end('Request failed');}
}).listen(port,'127.0.0.1',()=>console.log(`not hotdog: http://127.0.0.1:${port}`));
