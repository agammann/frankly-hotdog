import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const base='https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/';
const digest=b=>createHash('sha256').update(b).digest('hex');
await fs.mkdir('.model-cache',{recursive:true});
let lock;try{lock=JSON.parse(await fs.readFile('MODEL.lock.json','utf8'));}catch{}
async function obtain(name){
  let bytes;try{bytes=await fs.readFile('.model-cache/'+name);}catch{const r=await fetch(base+name);if(!r.ok)throw Error('Model download failed: '+r.status);bytes=Buffer.from(await r.arrayBuffer());await fs.writeFile('.model-cache/'+name,bytes);}
  const hash=digest(bytes);if(lock&&lock.files[name]!==hash)throw Error('Model integrity mismatch: '+name);
  return {bytes,hash};
}
const first=await obtain('model.json'),model=JSON.parse(first.bytes),files={'model.json':first.hash},parts=[],weights=[];
for(const group of model.weightsManifest){for(const name of group.paths){if(!/^group\d+-shard\d+of\d+$/.test(name))throw Error('Unexpected model filename');const f=await obtain(name);files[name]=f.hash;parts.push(f.bytes);}weights.push(...group.weights);}
model.weightsManifest=[{paths:['weights.bin'],weights}];
await fs.mkdir('public/model',{recursive:true});
await fs.writeFile('public/model/model.json',JSON.stringify(model));
await fs.writeFile('public/model/weights.bin',Buffer.concat(parts));
if(!lock)await fs.writeFile('MODEL.lock.json',JSON.stringify({source:base,model:'MobileNet V1 0.25 ImageNet',files},null,2)+'\n');
console.log('Model assets verified: '+Buffer.concat(parts).length+' weight bytes.');
