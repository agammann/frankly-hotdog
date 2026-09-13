import fs from 'node:fs/promises';
import path from 'node:path';
import {build} from 'esbuild';
const assets={};
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.zip':'application/zip'};
async function walk(dir,prefix=''){for(const e of await fs.readdir(dir,{withFileTypes:true})){const name=prefix+'/'+e.name;if(e.isDirectory())await walk(path.join(dir,e.name),name);else assets[name]={type:types[path.extname(e.name)]||'application/octet-stream',data:(await fs.readFile(path.join(dir,e.name))).toString('base64')};}}
await walk('public');
await fs.writeFile('src/assets.generated.mjs',`export const assets=${JSON.stringify(assets)};\n`);
await fs.mkdir('dist/server',{recursive:true});
await build({entryPoints:['src/worker.mjs'],outfile:'dist/server/index.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true});
await fs.mkdir('dist/.openai/drizzle/meta',{recursive:true});
await fs.copyFile('.openai/hosting.json','dist/.openai/hosting.json');
await fs.copyFile('migrations/0000_budget.sql','dist/.openai/drizzle/0000_budget.sql');
await fs.writeFile('dist/.openai/drizzle/meta/_journal.json',JSON.stringify({version:'7',dialect:'sqlite',entries:[{idx:0,version:'6',when:1789260000000,tag:'0000_budget',breakpoints:true}]}));
console.log('Built worker and embedded public assets.');
