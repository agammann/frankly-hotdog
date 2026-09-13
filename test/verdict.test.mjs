import test from 'node:test';import assert from 'node:assert/strict';
import {verdictFromScores} from '../src/verdict.mjs';
test('only a sufficiently strong hotdog class produces HOTDOG',()=>{const s=new Float32Array(1000);s[934]=.6;s[1]=.2;assert.equal(verdictFromScores(s).verdict,'HOTDOG');});
test('a strong competing class produces NOT HOTDOG',()=>{const s=new Float32Array(1000);s[934]=.02;s[954]=.7;assert.equal(verdictFromScores(s).verdict,'NOT HOTDOG');});
test('ambiguous rankings stay UNCERTAIN and malformed model output fails',()=>{const s=new Float32Array(1000);s[934]=.3;s[1]=.29;assert.equal(verdictFromScores(s).verdict,'UNCERTAIN');s[0]=NaN;assert.throws(()=>verdictFromScores(s));assert.throws(()=>verdictFromScores([]));});
