import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {root,selectLecture,loadLecture,validateDeck,validateSources,isApproved,contentDigest,sha} from '../scripts/lib.mjs';

const dir=selectLecture('01-agent-ai-intro'),original=loadLecture(dir);
const mutate=fn=>{const x=structuredClone(original);x.brief=original.brief;x.dir=original.dir;fn(x);return validateDeck(x)};
test('실제 1회차는 입력 해시, 요구 범위, 장수, 시간이 일치한다',()=>assert.deepEqual(validateDeck(original),[]));
test('중복 slide ID와 없는 출처는 실패한다',()=>{const e=mutate(x=>{x.deck.slides[1].id=x.deck.slides[0].id;x.deck.slides[4].sourceIds=['SRC-NOT-FOUND']});assert.ok(e.some(x=>x.includes('중복')));assert.ok(e.some(x=>x.includes('없는 source ID')))});
test('오래된 brief 해시는 실패한다',()=>assert.ok(mutate(x=>x.deck.inputDigest='0'.repeat(64)).some(x=>x.includes('inputDigest'))));
test('요구 주제와 발표 시간 누락은 실패한다',()=>{const e=mutate(x=>{for(const s of x.deck.slides)s.requirementIds=s.requirementIds.filter(i=>i!=='REQ-MCP');x.deck.slides[0].durationSec=1});assert.ok(e.some(x=>x.includes('REQ-MCP')));assert.ok(e.some(x=>x.includes('3000초')))});
test('0×0 또는 NaN 차트와 경로 탈출 자산은 실패한다',()=>{const e=mutate(x=>{x.deck.slides[2].blocks.push({type:'chart',data:{labels:['x'],values:[NaN]}});x.assets.assets=[{id:'BAD',path:'../private.png'}]});assert.ok(e.some(x=>x.includes('chart 데이터')));assert.ok(e.some(x=>x.includes('자산 경로 탈출')))});
test('승인 해시는 콘텐츠 변경 후 무효가 된다',()=>{const d=contentDigest(original),x=structuredClone(original);x.brief=original.brief;x.dir=original.dir;x.approval={status:'approved',approvedContentDigest:d,scope:{site:true}};assert.equal(isApproved(x),true);x.approval.approvedContentDigest=sha('stale');assert.equal(isApproved(x),false)});
test('출처 URL과 확인일 오류를 검출하고 접근 응답과 내용 검증을 구분한다',()=>{const x=structuredClone(original.sources);x.sources[0].url='javascript:alert(1)';x.sources[1].checked_at='2026-02-30';const result=validateSources(x,'2026-09-25');assert.ok(result.errors.some(e=>e.includes('HTTP URL')));assert.ok(result.errors.some(e=>e.includes('확인일 오류')));assert.ok(result.warnings.some(e=>e.includes('본문 검증 필요')))});
test('승인된 공개 빌드에 1회차가 보이고 사이트 대본은 제외된다',()=>{
 execFileSync('npm',['run','build:public'],{cwd:root,stdio:'pipe'});
 const publicDir=path.join(root,'dist','public'),slug='01-agent-ai-intro';
 const txt=fs.readFileSync(path.join(publicDir,'portfolio.json'),'utf8');
 assert.deepEqual(JSON.parse(txt).cards.map(c=>c.slug),[slug]);
 const deck=fs.readFileSync(path.join(publicDir,'lectures',slug,'deck.json'),'utf8');
 assert.equal(deck.includes('speakerNotes'),false);
 assert.equal(fs.existsSync(path.join(publicDir,'lectures',slug,'presenter.html')),false);
 assert.equal(fs.existsSync(path.join(publicDir,'lectures',slug,'presenter-deck.json')),false);
 assert.equal(txt.includes('PRIVATE_TEST_SENTINEL_DO_NOT_PUBLISH'),false);
 const release=()=>execFileSync('npm',['run','release:check'],{cwd:root,stdio:'pipe'});
 if(original.approval.scope.repositorySource)release();else assert.throws(release);
});
