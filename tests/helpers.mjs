import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,join} from 'node:path';
export async function server(port=8701){const s=createServer(async(req,res)=>{let p=req.url.split('?')[0];if(p==='/')p='/index.html';try{const b=await readFile(join('dist',p));res.writeHead(200,{'content-type':extname(p)==='.js'?'text/javascript':'text/html'});res.end(b)}catch{res.writeHead(404);res.end()}});await new Promise(r=>s.listen(port,r));return s}
export const chrome='/usr/bin/google-chrome';
