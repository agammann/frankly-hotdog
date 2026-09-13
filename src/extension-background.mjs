import {classifyOnDevice} from './device-engine.mjs';
import {imageDataBlob} from './image-data.mjs';
const active=new Set();
chrome.tabs.onRemoved.addListener(id=>chrome.storage.session.remove('tab:'+id));
chrome.tabs.onUpdated.addListener((id,change)=>{if(change.status==='loading')chrome.storage.session.remove('tab:'+id);});
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
  if(!message||sender.id!==chrome.runtime.id||sender.tab?.id===undefined||sender.frameId!==0)return;
  const id=sender.tab.id;
  if(message.type==='NOT_HOTDOG_PAUSE'){chrome.storage.session.remove('tab:'+id).then(()=>reply({ok:true}),()=>reply({error:'Could not save pause state.'}));return true;}
  if(!['NOT_HOTDOG_CLASSIFY','NOT_HOTDOG_CAPTURE_CLASSIFY'].includes(message.type))return;
  (async()=>{
    const s=await chrome.storage.session.get('tab:'+id);
    if(!s['tab:'+id])throw Error('Enable not hotdog on this tab first.');
    if(active.size)throw Error('One image at a time. Try again in a moment.');
    active.add(id);
    try{
      let image=message.image;
      if(message.type==='NOT_HOTDOG_CAPTURE_CLASSIFY'){
        const tab=await chrome.tabs.get(id);if(!tab.active)throw Error('Keep this tab active to classify the image.');
        const r=message.rect;
        if(!r||!['x','y','width','height','viewportWidth','viewportHeight'].every(k=>Number.isFinite(r[k]))||r.x<0||r.y<0||r.width<16||r.height<16||r.viewportWidth>16000||r.viewportHeight>16000||r.x+r.width>r.viewportWidth||r.y+r.height>r.viewportHeight)throw Error('Scroll so the entire image is visible, then hover again.');
        const screenshot=await chrome.tabs.captureVisibleTab(tab.windowId,{format:'png'});
        // captureVisibleTab targets a window's active tab. Discard a capture if
        // the user switched tabs or navigated while the capture was pending.
        const current=await chrome.tabs.get(id);
        if(!current.active||current.url!==tab.url||!(await chrome.storage.session.get('tab:'+id))['tab:'+id])throw Error('The tab changed. Hover over the image again.');
        const bitmap=await createImageBitmap(imageDataBlob(screenshot,32_000_000));
        try{
          const scaleX=bitmap.width/r.viewportWidth,scaleY=bitmap.height/r.viewportHeight;
          const scale=Math.min(1,768/Math.max(r.width,r.height));
          const canvas=new OffscreenCanvas(Math.max(1,Math.round(r.width*scale)),Math.max(1,Math.round(r.height*scale)));
          canvas.getContext('2d').drawImage(bitmap,r.x*scaleX,r.y*scaleY,r.width*scaleX,r.height*scaleY,0,0,canvas.width,canvas.height);
          const blob=await canvas.convertToBlob({type:'image/jpeg',quality:.85}),bytes=new Uint8Array(await blob.arrayBuffer());let raw='';for(const b of bytes)raw+=String.fromCharCode(b);image='data:image/jpeg;base64,'+btoa(raw);
        }finally{bitmap.close();}
      }
      if(typeof image!=='string'||image.length>2_000_000||!/^data:image\/jpeg;base64,/.test(image))throw Error('This image could not be prepared.');
      reply(await classifyOnDevice(image));
    }finally{active.delete(id);}
  })().catch(e=>reply({error:e.message?.slice(0,160)||'The local model could not finish. Reload and try a clear image.'}));
  return true;
});
