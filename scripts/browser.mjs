import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';
import {root} from './lib.mjs';

const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.css':'text/css; charset=utf-8','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.svg':'image/svg+xml','.png':'image/png'};
export async function withBrowser(fn,dir='dist/private') {
 const base=path.resolve(root,dir);
 const server=http.createServer((req,res)=>{
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return}
  if(pathname.startsWith('/ai-agent-club-2026-fall/'))pathname=pathname.slice('/ai-agent-club-2026-fall'.length);
  let file=path.resolve(base,'.'+pathname);
  if(!file.startsWith(base+path.sep)&&file!==base){res.writeHead(403).end();return}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404).end();return}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const port=server.address().port,browser=await chromium.launch({headless:true});
 try {return await fn({browser,url:`http://127.0.0.1:${port}`});}
 finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
