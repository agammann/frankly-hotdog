import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const base='https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_1.0_224/';
const digest=b=>createHash('sha256').update(b).digest('hex');
await fs.mkdir('.model-cache/v1-100',{recursive:true});
const lock=JSON.parse(await fs.readFile('MODEL.lock.json','utf8'));
if(lock.source!==base)throw Error('Model lock source does not match the configured model.');
async function obtain(name){
  let bytes;try{bytes=await fs.readFile('.model-cache/v1-100/'+name);}catch{const r=await fetch(base+name);if(!r.ok)throw Error('Model download failed: '+r.status);bytes=Buffer.from(await r.arrayBuffer());await fs.writeFile('.model-cache/v1-100/'+name,bytes);}
  const hash=digest(bytes);if(lock&&lock.files[name]!==hash)throw Error('Model integrity mismatch: '+name);
  return {bytes,hash};
}
const first=await obtain('model.json'),model=JSON.parse(first.bytes),files={'model.json':first.hash},parts=[],weights=[];
for(const group of model.weightsManifest){for(const name of group.paths){if(!/^group\d+-shard\d+of\d+$/.test(name))throw Error('Unexpected model filename');const f=await obtain(name);files[name]=f.hash;parts.push(f.bytes);}weights.push(...group.weights);}
model.weightsManifest=[{paths:['weights.bin'],weights}];
await fs.mkdir('public/model/v1-100',{recursive:true});
await fs.writeFile('public/model/v1-100/model.json',JSON.stringify(model));
await fs.writeFile('public/model/v1-100/weights.bin',Buffer.concat(parts));
console.log('Model source verified; bundled '+Buffer.concat(parts).length+' weight bytes.');
