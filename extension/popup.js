const status=document.querySelector('#status'),toggle=document.querySelector('#toggle');
let tab;
async function read(){[tab]=await chrome.tabs.query({active:true,currentWindow:true});if(!tab)throw Error('Open a regular webpage to use not hotdog.');const s=await chrome.storage.session.get('tab:'+tab.id);toggle.textContent=s['tab:'+tab.id]?'Pause on this tab':'Enable on this tab';}
toggle.disabled=true;
read().catch(()=>status.textContent='Open a regular webpage to use not hotdog.').finally(()=>toggle.disabled=false);
toggle.addEventListener('click',async()=>{
  toggle.disabled=true;
  try{
    if(!tab||!/^https?:/.test(tab.url||''))throw Error('Open a regular webpage. Browser settings pages are protected.');
    const key='tab:'+tab.id,s=await chrome.storage.session.get(key),enabled=!s[key];
    if(enabled)await chrome.scripting.executeScript({target:{tabId:tab.id},files:['content.js']});
    await chrome.storage.session.set({[key]:enabled});
    try{await chrome.tabs.sendMessage(tab.id,{type:'NOT_HOTDOG_SET_ENABLED',enabled});}
    catch(error){await chrome.storage.session.remove(key);throw error;}
    status.textContent=enabled?'Enabled for this tab. Hover on an image for a moment. Press Escape to pause.':'Paused. No new images will be checked.';
    await read();
  }catch(e){status.textContent=e.message||'This page does not allow extensions.';}finally{toggle.disabled=false;}
});
