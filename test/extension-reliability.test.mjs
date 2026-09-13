import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {JSDOM} from 'jsdom';
import {imageDataBlob} from '../src/image-data.mjs';

test('local image decoding works with all fetch calls forbidden', async () => {
  const before = globalThis.fetch;
  globalThis.fetch = () => { throw Error('Blocked by connect-src'); };
  try {
    const blob = imageDataBlob('data:image/jpeg;base64,/9j/AA==');
    assert.equal(blob.type, 'image/jpeg');
    assert.deepEqual([...new Uint8Array(await blob.arrayBuffer())], [255,216,255,0]);
    assert.throws(() => imageDataBlob('https://remote.test/photo.jpg'), /supported/);
    assert.throws(() => imageDataBlob('data:image/png;base64,A'), /invalid/);
    assert.throws(() => imageDataBlob('data:image/png;base64,AAAA', 10), /large/);
  } finally { globalThis.fetch = before; }
});

async function backgroundHarness({switchTab = false} = {}) {
  let listener, gets = 0, captures = 0, decodes = 0, closed = 0, predictions = 0;
  const context = {
    Set, Number, Error, Uint8Array, btoa, imageDataBlob,
    chrome: {
      runtime: {id: 'unit', onMessage: {addListener(fn) { listener = fn; }}},
      tabs: {
        onRemoved: {addListener() {}}, onUpdated: {addListener() {}},
        async get() { return {active: !(switchTab && ++gets > 1), windowId: 1, url: 'https://site.test'}; },
        async captureVisibleTab() { captures++; return 'data:image/png;base64,AAAA'; },
      },
      storage: {session: {async get() { return {'tab:2': true}; }, async remove() {}}},
    },
    fetch() { throw Error('No image fetch allowed'); },
    async createImageBitmap(blob) {
      assert.equal(blob.type, 'image/png'); decodes++;
      return {width: 800, height: 600, close() { closed++; }};
    },
    OffscreenCanvas: class {
      constructor(width, height) { this.width = width; this.height = height; }
      getContext() { return {drawImage() {}}; }
      async convertToBlob() { return new Blob([new Uint8Array([255,216,255,0])], {type: 'image/jpeg'}); }
    },
    async classifyOnDevice(image) { assert.match(image, /^data:image\/jpeg;base64,/); predictions++; return {verdict: 'HOTDOG'}; },
  };
  vm.runInNewContext((await fs.readFile('src/extension-background.mjs','utf8')).replace(/^import[^\n]+\n/gm,''), context);
  return {
    send(message, sender = {id:'unit', frameId:0, tab:{id:2}}) { return new Promise(resolve => listener(message, sender, resolve)); },
    listener,
    counts: () => ({captures, decodes, closed, predictions}),
  };
}
const capture = {type:'NOT_HOTDOG_CAPTURE_CLASSIFY',rect:{x:10,y:10,width:100,height:100,viewportWidth:800,viewportHeight:600}};

test('screenshot crop is decoded locally and bitmap is closed', async () => {
  const h = await backgroundHarness();
  assert.equal((await h.send(capture)).verdict, 'HOTDOG');
  assert.deepEqual(h.counts(), {captures:1,decodes:1,closed:1,predictions:1});
  let replied = false;
  assert.equal(h.listener(capture,{id:'unit',frameId:1,tab:{id:2}},()=>{replied=true;}), undefined);
  assert.equal(replied,false);
});

test('switching tabs during capture discards the screenshot before decoding', async () => {
  const h = await backgroundHarness({switchTab:true});
  assert.match((await h.send(capture)).error,/tab changed/);
  assert.deepEqual(h.counts(), {captures:1,decodes:0,closed:0,predictions:0});
});

test('popup rolls back activation when the page does not acknowledge it', async () => {
  const dom = new JSDOM('<button id="toggle"></button><p id="status"></p>',{runScripts:'outside-only'});
  const w = dom.window;
  let state = false;
  w.chrome = {
    tabs: {async query(){return [{id:2,url:'https://site.test'}];},async sendMessage(){throw Error('Page navigated');}},
    scripting: {async executeScript(){}},
    storage: {session: {
      async get(){return {'tab:2':state};}, async set(value){state=value['tab:2'];}, async remove(){state=false;},
    }},
  };
  try {
    w.eval(await fs.readFile('extension/popup.js','utf8'));
    await new Promise(resolve=>setTimeout(resolve,0));
    w.document.querySelector('button').click();
    await new Promise(resolve=>setTimeout(resolve,0));
    assert.equal(state,false);
    assert.match(w.document.querySelector('#status').textContent,/Page navigated/);
    assert.equal(w.document.querySelector('button').disabled,false);
  } finally { w.close(); }
});

test('content activation acknowledges the popup and popup pause does not race storage writes', async () => {
  const dom = new JSDOM('<img>',{runScripts:'outside-only'});
  const w = dom.window;
  let listener, pauses = 0, acknowledgements = 0;
  w.chrome = {runtime:{onMessage:{addListener(fn){listener=fn;}},async sendMessage(){pauses++;return {};}}};
  try {
    w.eval(await fs.readFile('extension/content.js','utf8'));
    listener({type:'NOT_HOTDOG_SET_ENABLED',enabled:true},{},()=>{acknowledgements++;});
    listener({type:'NOT_HOTDOG_SET_ENABLED',enabled:false},{},()=>{acknowledgements++;});
    assert.equal(acknowledgements,2);
    assert.equal(pauses,0);
    listener({type:'NOT_HOTDOG_SET_ENABLED',enabled:true},{},()=>{});
    w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));
    assert.equal(pauses,1);
  } finally { w.close(); }
});
