const status=document.querySelector('#status'),toggle=document.querySelector('#toggle');
let tab;
async function read(){[tab]=await chrome.tabs.query({active:true,currentWindow:true});const s=await chrome.storage.session.get('tab:'+tab.id);toggle.textContent=s['tab:'+tab.id]?'Pause on this tab':'Enable on this tab';}
read().catch(()=>status.textContent='Open a regular webpage to use Frankly Hotdog.');
toggle.addEventListener('click',async()=>{
  toggle.disabled=true;
  try{
    if(!/^https?:/.test(tab.url||''))throw Error('Open a regular webpage. Browser settings pages are protected.');
    const key='tab:'+tab.id,s=await chrome.storage.session.get(key),enabled=!s[key];
    if(enabled)await chrome.scripting.executeScript({target:{tabId:tab.id},files:['content.js']});
    await chrome.storage.session.set({[key]:enabled});
    await chrome.tabs.sendMessage(tab.id,{type:'FRANKLY_SET_ENABLED',enabled});
    status.textContent=enabled?'Enabled for this tab. Hover on an image for a moment. Press Escape to pause.':'Paused. No new images will be sent.';
    await read();
  }catch(e){status.textContent=e.message||'This page does not allow extensions.';}finally{toggle.disabled=false;}
});
