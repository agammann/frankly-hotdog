import test from 'node:test';import assert from 'node:assert/strict';
import {verdictFromScores} from '../src/verdict.mjs';
test('only a sufficiently strong hotdog class produces HOTDOG',()=>{const s=new Float32Array(1000);s[934]=.6;s[1]=.2;assert.equal(verdictFromScores(s).verdict,'HOTDOG');});
test('a strong competing class produces NOT HOTDOG',()=>{const s=new Float32Array(1000);s[934]=.02;s[954]=.7;assert.equal(verdictFromScores(s).verdict,'NOT HOTDOG');});
test('weak and ambiguous valid results use the binary NOT HOTDOG fallback',()=>{
  for(const [hotdog,other] of [[.3,.29],[.000013,.12456],[.1,.11],[.2,.2]]){
    const scores=new Float32Array(1000);scores[934]=hotdog;scores[1]=other;
    assert.equal(verdictFromScores(scores).verdict,'NOT HOTDOG');
  }
});
test('missing and invalid inference output stays an error, never a negative verdict',()=>{
  for(const value of [null,undefined,[],new Float32Array(1000)])assert.throws(()=>verdictFromScores(value));
  for(const bad of [NaN,Infinity,-.1,1.1]){const scores=new Float32Array(1000);scores[934]=.9;scores[0]=bad;assert.throws(()=>verdictFromScores(scores));}
});
