import {readFile} from 'node:fs/promises';
import {classify} from '../src/classifier.mjs';
const report=[];
for(const [name,expected] of [['hotdog','HOTDOG'],['banana','NOT HOTDOG']]){
 const image='data:image/jpeg;base64,'+(await readFile(`public/samples/${name}.jpg`)).toString('base64');
 const started=Date.now();const result=await classify(image,process.env);
 const item={sample:name,expected,actual:result.verdict,passed:result.verdict===expected,elapsed_ms:Date.now()-started};report.push(item);console.log(JSON.stringify(item));
}
if(report.some(r=>!r.passed))process.exitCode=1;
