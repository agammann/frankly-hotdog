import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import vm from 'node:vm';
import {JSDOM} from 'jsdom';
test('hover does nothing before activation, runs after dwell, caches, and pauses on Escape',async()=>{
 const dom=new JSDOM('<img id="photo" src="https://images.test/one.jpg">',{url:'https://site.test',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,img=w.document.querySelector('img');let listener,calls=0;
 Object.defineProperties(img,{complete:{value:true},naturalWidth:{value:100},naturalHeight:{value:100}});
 img.getBoundingClientRect=()=>({x:0,y:0,left:0,right:100,bottom:100,width:100,height:100});
 w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){}});w.HTMLCanvasElement.prototype.toDataURL=()=> 'data:image/jpeg;base64,/9j/'+ 'A'.repeat(40);
 w.chrome={runtime:{onMessage:{addListener(fn){listener=fn;}},async sendMessage(m){if(m.type==='NOT_HOTDOG_CLASSIFY'){calls++;return {verdict:'HOTDOG'};}return {};}}};
 w.eval(await fs.readFile('extension/content.js','utf8'));
 const over=()=>img.dispatchEvent(new w.MouseEvent('mouseover',{bubbles:true})),out=()=>img.dispatchEvent(new w.MouseEvent('mouseout',{bubbles:true}));
 over();await new Promise(r=>setTimeout(r,700));assert.equal(calls,0);
 listener({type:'NOT_HOTDOG_SET_ENABLED',enabled:true},{},()=>{});over();await new Promise(r=>setTimeout(r,700));assert.equal(calls,1);
 out();over();await new Promise(r=>setTimeout(r,700));assert.equal(calls,1);
 w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));out();over();await new Promise(r=>setTimeout(r,700));assert.equal(calls,1);dom.window.close();
});
test('background rejects disabled tabs and out of bounds screenshot crops without network calls',async()=>{
 let listener,fetches=0,captures=0,enabled=false;
 const ctx={Set,Number,Error,console,AbortSignal,chrome:{runtime:{id:'unit',onMessage:{addListener(fn){listener=fn;}}},tabs:{onRemoved:{addListener(){}},onUpdated:{addListener(){}},async get(){return {active:true,windowId:1};},async captureVisibleTab(){captures++;}},storage:{session:{async get(){return {'tab:2':enabled};},async remove(){}}}},fetch:async()=>{fetches++;}};
 ctx.classifyOnDevice=async()=>{throw Error('Inference should not run');};
 vm.runInNewContext((await fs.readFile('src/extension-background.mjs','utf8')).replace(/^import[^\n]+\n/gm,''),ctx);
 const send=m=>new Promise(resolve=>listener(m,{id:'unit',frameId:0,tab:{id:2}},resolve));
 let r=await send({type:'NOT_HOTDOG_CLASSIFY',image:'data:image/jpeg;base64,/9j/AAAA'});assert.match(r.error,/Enable/);
 enabled=true;r=await send({type:'NOT_HOTDOG_CAPTURE_CLASSIFY',rect:{x:-1,y:0,width:100,height:100,viewportWidth:800,viewportHeight:600}});assert.match(r.error,/entire image/);assert.equal(fetches,0);assert.equal(captures,0);
});
