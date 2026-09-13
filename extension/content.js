(()=>{
  if(globalThis.__franklyHotdogLoaded)return;globalThis.__franklyHotdogLoaded=true;
  let enabled=false,timer,current,serial=0,busy=false;const cache=new Map();
  const host=document.createElement('div'),shadow=host.attachShadow({mode:'closed'}),bubble=document.createElement('div');
  bubble.setAttribute('role','status');bubble.setAttribute('aria-live','polite');
  const css=document.createElement('style');css.textContent='div{position:fixed;z-index:2147483647;pointer-events:none;background:#151515;color:white;font:900 17px/1.2 Arial,sans-serif;padding:14px 18px;border-radius:5px;box-shadow:0 5px 20px #0003;max-width:290px;display:none}';
  shadow.append(css,bubble);document.documentElement.append(host);
  function show(text,img){bubble.textContent=text;const r=img.getBoundingClientRect();bubble.style.display='block';bubble.style.left=Math.max(8,Math.min(r.left,innerWidth-310))+'px';bubble.style.top=Math.max(8,Math.min(r.bottom-52,innerHeight-100))+'px';}
  function pause(){enabled=false;clearTimeout(timer);serial++;bubble.style.display='none';chrome.runtime.sendMessage({type:'FRANKLY_PAUSE'}).catch(()=>{});}
  async function prepare(img){
    if(!img.complete||!img.naturalWidth)throw Error('Wait for the image to finish loading.');
    const c=document.createElement('canvas'),scale=Math.min(1,768/Math.max(img.naturalWidth,img.naturalHeight));c.width=Math.max(1,Math.round(img.naturalWidth*scale));c.height=Math.max(1,Math.round(img.naturalHeight*scale));
    try{c.getContext('2d').drawImage(img,0,0,c.width,c.height);return {type:'FRANKLY_CLASSIFY',image:c.toDataURL('image/jpeg',.85)};}catch{}
    // Crop a browser capture locally when the image cannot be read through canvas.
    // The full screenshot is never uploaded or returned to the content script.
    const r=img.getBoundingClientRect();return {type:'FRANKLY_CAPTURE_CLASSIFY',rect:{x:r.x,y:r.y,width:r.width,height:r.height,viewportWidth:innerWidth,viewportHeight:innerHeight}};
  }
  async function classify(img,requestId){
    if(!enabled||requestId!==serial)return;const key=img.currentSrc||img.src;
    if(cache.has(key)){show(cache.get(key),img);return;}
    if(busy){show('One image at a time.',img);return;}busy=true;show('A MOMENT OF FRANKNESS…',img);
    try{const request=await prepare(img);if(!enabled||requestId!==serial)return;
      if(request.type==='FRANKLY_CAPTURE_CLASSIFY'){bubble.style.display='none';await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));if(!enabled||requestId!==serial)return;}
      const r=await chrome.runtime.sendMessage(request);if(r.error)throw Error(r.error);if(!['HOTDOG','NOT HOTDOG','UNCERTAIN'].includes(r.verdict))throw Error('No verdict came back.');
      if(cache.size>=100)cache.delete(cache.keys().next().value);cache.set(key,r.verdict);if(enabled&&requestId===serial)show(r.verdict,img);
    }catch(e){if(enabled&&requestId===serial)show(e.message||'Try again.',img);}finally{busy=false;}
  }
  document.addEventListener('mouseover',e=>{if(!enabled)return;const img=e.composedPath().find(el=>el instanceof HTMLImageElement);if(!img||img===current)return;current=img;clearTimeout(timer);const id=++serial;timer=setTimeout(()=>classify(img,id),650);},true);
  document.addEventListener('mouseout',e=>{if(e.target===current){current=null;clearTimeout(timer);serial++;bubble.style.display='none';}},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')pause();},true);
  window.addEventListener('scroll',()=>{bubble.style.display='none';clearTimeout(timer);serial++;current=null;},true);
  chrome.runtime.onMessage.addListener(m=>{if(m.type==='FRANKLY_SET_ENABLED'){if(!m.enabled)pause();else{enabled=true;current=null;}}});
})();
