import {classifyOnDevice} from './device-engine.mjs';
let busy=false;
self.onmessage=async({data})=>{
  if(!data||data.type!=='classify'||!Number.isInteger(data.id))return;
  if(busy){self.postMessage({id:data.id,error:'One image at a time.'});return;}
  busy=true;
  try{self.postMessage({id:data.id,result:await classifyOnDevice(data.image)});}
  catch{self.postMessage({id:data.id,error:'The local model could not finish. Reload and try a clear photo.'});}
  finally{busy=false;}
};
