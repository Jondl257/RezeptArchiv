import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createApi} from './api.mjs';
import {resolveStaticFile} from './static.mjs';
const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url))),api=createApi();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg'};
const server=createServer(async(req,res)=>{try{
 const origin='http://'+(req.headers.host||'localhost'),url=new URL(req.url,origin);
 if(url.pathname.startsWith('/api/')){
   const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),60000);let response;
   try{response=await api(new Request(url,{method:req.method,headers:req.headers,body:['GET','HEAD'].includes(req.method)?undefined:req,duplex:'half',signal:controller.signal}));}finally{clearTimeout(timer);}
   res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
 }
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 const file=resolveStaticFile(root,url.pathname);
 if(!(await stat(file)).isFile())throw Error();res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','x-content-type-options':'nosniff','cache-control':'no-cache'});res.end(req.method==='HEAD'?undefined:await readFile(file));
 }catch{if(!res.headersSent)res.writeHead(404);res.end('Nicht gefunden.');}});
server.requestTimeout=65000;server.headersTimeout=15000;server.listen(Number(process.env.PORT)||8080,process.env.HOST||'127.0.0.1',()=>console.log('RezeptArchiv: http://'+(process.env.HOST||'127.0.0.1')+':'+(Number(process.env.PORT)||8080)));
