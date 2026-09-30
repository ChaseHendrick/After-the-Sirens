'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
async function createDirectory(options={}){
  const token=options.token||process.env.SIRENS_DIRECTORY_TOKEN;if(typeof token!=='string'||token.length<12||token.length>128)throw new Error('Set SIRENS_DIRECTORY_TOKEN to a registration key of 12 to 128 characters.');
  const file=path.resolve(options.file||path.join(__dirname,'../server-data/directory.json')),now=options.now||Date.now;
  let rows={};if(fs.existsSync(file)){rows=JSON.parse(fs.readFileSync(file,'utf8'));if(!rows||typeof rows!=='object'||Array.isArray(rows)||Object.keys(rows).length>100)throw new Error('Invalid directory file.');}
  const windows=new Map();let writes=Promise.resolve();
  const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
  function valid(raw){if(!raw||typeof raw!=='object'||typeof raw.name!=='string'||raw.name.length<1||raw.name.length>60||/[\u0000-\u001f\u007f]/.test(raw.name)||raw.public!==true||raw.capacity!==20||!Number.isInteger(raw.players)||raw.players<0||raw.players>20||!['calm','standard','hard'].includes(raw.difficulty))throw new Error('Invalid public listing.');const url=new URL(raw.url);if(!['ws:','wss:'].includes(url.protocol)||url.username||url.password||url.hash||url.search||url.href.length>300)throw new Error('Invalid world address.');return{name:raw.name,url:url.href,public:true,capacity:20,players:raw.players,difficulty:raw.difficulty};}
  for(const [id,r]of Object.entries(rows)){if(id!==hash(r.url)||!Number.isFinite(r.expires))throw new Error('Invalid directory file.');valid(r);}
  function listings(){for(const [id,row]of Object.entries(rows))if(row.expires<=now())delete rows[id];return Object.values(rows).map(({expires,...r})=>r).sort((a,b)=>a.name.localeCompare(b.name));}
  function persist(){const data=JSON.stringify(rows);writes=writes.catch(()=>{}).then(async()=>{await fs.promises.mkdir(path.dirname(file),{recursive:true});await fs.promises.writeFile(file+'.tmp',data,{mode:0o600});await fs.promises.rename(file+'.tmp',file);});return writes;}
  const server=http.createServer(async(req,res)=>{
    const headers={'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Authorization, Content-Type','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
    const respond=(status,value)=>{res.writeHead(status,headers);res.end(JSON.stringify(value));};
    if(req.url!=='/servers'){respond(404,{error:'Not found'});return;}
    if(req.method==='OPTIONS'){respond(204,{});return;}
    if(req.method==='GET'){respond(200,{version:1,servers:listings()});return;}
    if(req.method!=='POST'){respond(405,{error:'Use GET or POST'});return;}
    const key=String(req.headers.authorization||'').replace(/^Bearer /,'');if(!crypto.timingSafeEqual(Buffer.from(hash(key)),Buffer.from(hash(token)))){respond(403,{error:'Registration key required'});return;}
    const ip=req.socket.remoteAddress,clock=now();let window=windows.get(ip);if(!window||clock-window.at>=10000){window={at:clock,n:0};windows.set(ip,window);if(windows.size>512)windows.delete(windows.keys().next().value);}if(++window.n>48){respond(429,{error:'Registration rate exceeded'});return;}
    let body='',large=false;try { for await(const chunk of req){body+=chunk;if(body.length>4096){large=true;break;}} } catch (_) { if (!res.destroyed) respond(400,{error:'Incomplete listing'}); return; }if(large){respond(413,{error:'Listing too large'});return;}
    try{const row=valid(JSON.parse(body)),id=hash(row.url);listings();if(!rows[id]&&Object.keys(rows).length>=100){respond(503,{error:'Directory full'});return;}rows[id]={...row,expires:now()+180000};await persist();respond(201,{ok:true,expiresIn:180});}catch(_){respond(400,{error:'Invalid public listing'});}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(options.port===undefined?8788:options.port,options.host||'127.0.0.1',resolve);});
  return{url:'http://'+(options.host||'127.0.0.1')+':'+server.address().port+'/servers',listings,async close(){await writes;await new Promise(resolve=>server.close(resolve));}};
}
module.exports={createDirectory};
if(require.main===module){const args=process.argv.slice(2),get=(name,fallback)=>{const n=args.indexOf('--'+name);return n<0?fallback:args[n+1];};createDirectory({host:get('host','127.0.0.1'),port:Number(get('port',8788)),file:get('file',undefined)}).then(service=>{console.log('After the Sirens public directory: '+service.url);const end=()=>service.close().then(()=>process.exit(0));process.once('SIGINT',end);process.once('SIGTERM',end);}).catch(error=>{console.error(error.message);process.exitCode=1;});}
