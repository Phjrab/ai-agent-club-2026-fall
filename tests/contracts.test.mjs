import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {root,config,selectLecture,loadLecture,validateDeck,validateSources,isApproved,contentDigest,sha,sanitizeDeck} from '../scripts/lib.mjs';

import {createPublicFixture} from './public-fixture.mjs';

const dir=selectLecture('01-agent-ai-intro'),original=loadLecture(dir);
const mutate=fn=>{const x=structuredClone(original);x.brief=original.brief;x.dir=original.dir;fn(x);return validateDeck(x)};
test('실제 1회차는 입력 해시, 요구 범위, 장수, 시간이 일치한다',()=>assert.deepEqual(validateDeck(original),[]));
test('사용자 주석의 화면 순서와 실제 예시 자산이 반영된다',()=>{
 const slides=original.deck.slides,at=id=>slides.findIndex(s=>s.id===id),get=id=>slides[at(id)];
 assert.equal(slides.filter(s=>s.kind==='main').length,36);
 assert.equal(at('L01-A01'),at('L01-S12')+1);
 assert.equal(at('L01-A04'),at('L01-A02')+1);
 assert.equal(at('L01-A05'),at('L01-S14')+1);
 assert.equal(at('L01-S24'),at('L01-A05')+1);
 assert.equal(at('L01-A06'),at('L01-S24')+1);
 assert.equal(at('L01-A03'),at('L01-A06')+1);
 assert.deepEqual(['L01-S09','L01-S09A','L01-S09B'].map(id=>get(id).screenshotLogoId),['brand-openai','brand-claude','brand-gemini']);
 assert.equal(at('L01-A02'),at('L01-S11')+1);
 assert.equal(at('L01-S29'),at('L01-S17')+1);
 assert.equal(at('L01-S10'),at('L01-S15')-1);
 assert.equal(slides.some(s=>['L01-S08','L01-S13','L01-QA'].includes(s.id)),false);
 assert.equal(get('L01-S15').blocks[0].showIndexAndDuration,false);
 assert.deepEqual(get('L01-S25').blocks.filter(b=>b.type==='figure').map(b=>b.assetId),['remote-gpt-01','remote-gpt-02']);
 assert.equal(slides.some(s=>s.blocks.some(b=>b.assetId==='brand-github')),false);
});
test('중복 slide ID와 없는 출처는 실패한다',()=>{const e=mutate(x=>{x.deck.slides[1].id=x.deck.slides[0].id;x.deck.slides[4].sourceIds=['SRC-NOT-FOUND']});assert.ok(e.some(x=>x.includes('중복')));assert.ok(e.some(x=>x.includes('없는 source ID')))});
test('오래된 brief 해시는 실패한다',()=>assert.ok(mutate(x=>x.deck.inputDigest='0'.repeat(64)).some(x=>x.includes('inputDigest'))));
test('요구 주제와 본편 시간 합계 누락은 실패한다',()=>{const e=mutate(x=>{for(const s of x.deck.slides)s.requirementIds=s.requirementIds.filter(i=>i!=='REQ-MCP');x.deck.slides[0].durationSec=1});assert.ok(e.some(x=>x.includes('REQ-MCP')));assert.ok(e.some(x=>x.includes('본편 시간 합계')))});
test('고정 질의응답 0분, 영상 단일 합산, 유동 여유 계산이 일치한다',()=>{assert.equal(original.deck.questionsSec,0);assert.equal(original.deck.questionsMode,'flexible');assert.equal(original.deck.slides.some(s=>s.kind==='qa'),false);assert.equal(original.deck.plannedMainDurationSec,3424);assert.equal(original.deck.plannedSpeakerDurationSec,2415);assert.equal(original.deck.actualVideoDurationSec,1009);assert.equal(original.deck.flexibleBufferSec,176);assert.equal(original.deck.estimatedFullDurationSec,3424)});
test('60분 상한 초과를 검출하고 회차별 다른 전체 시간은 허용한다',()=>{const over=mutate(x=>{x.deck.slides.find(s=>s.id==='L01-S01').durationSec+=177});assert.ok(over.some(x=>x.includes('수업 상한 초과')));const x=structuredClone(original);x.brief=Buffer.from(original.brief.toString().replace('duration_minutes: 60','duration_minutes: 70'));x.dir=original.dir;x.deck.sessionDurationSec=4200;x.deck.flexibleBufferSec=776;x.deck.inputDigest=sha(x.brief);assert.deepEqual(validateDeck(x),[])});
test('향후 회차의 기본 화면·대본 언어는 한국어다',()=>{assert.equal(config.slideLanguage,'ko');assert.equal(config.scriptLanguage,'ko');assert.match(fs.readFileSync(path.join(root,'scripts/cli.mjs'),'utf8'),/slide_language: \$\{config\.slideLanguage\}[\s\S]*script_language: \$\{config\.scriptLanguage\}/)});
test('비공개 썸네일은 공개 목록에서 제외하고 로컬 빌드에만 포함한다',()=>{
 const assets=structuredClone(original.assets.assets);
 for(const a of assets.filter(a=>a.id.startsWith('thumb-v'))){a.publicAllowed=false;a.rightsStatus='rights_unverified';a.sourcePath='.private/lecture-assets/fixture/'+path.basename(a.path)}
 const publicDeck=sanitizeDeck(original.deck,assets);
 assert.equal(publicDeck.assets.some(a=>a.id.startsWith('thumb-v')),false);
 assert.equal(publicDeck.slides.flatMap(s=>s.blocks).find(b=>b.type==='video-list').items.some(i=>i.assetId),false);
 assert.equal(sanitizeDeck(original.deck,assets,{includePrivateAssets:true}).assets.filter(a=>a.id.startsWith('thumb-v')).length,3);
});
test('공개 포트폴리오는 승인된 여러 회차를 각 날짜·목표로 표시하고 비공개 초안은 제외한다',()=>{
 const fixture=createPublicFixture();
 try{
  const termDir=path.join(fixture,'lectures','2026-fall'),first=path.join(termDir,'01-agent-ai-intro');
  const add=(slug,date,approved)=>{
   const target=path.join(termDir,slug);fs.cpSync(first,target,{recursive:true});
   const briefPath=path.join(target,'brief.md');
   const brief=fs.readFileSync(briefPath,'utf8').replace('slug: 01-agent-ai-intro',`slug: ${slug}`).replace('date: "2026-10-01"',`date: "${date}"`).replace('  - AI 선택 기준','  - 다음 회차 목표');
   fs.writeFileSync(briefPath,brief);
   const deckPath=path.join(target,'deck.json'),deck=JSON.parse(fs.readFileSync(deckPath,'utf8'));
   deck.slug=slug;deck.title=`${slug} 발표`;deck.inputDigest=sha(Buffer.from(brief));
   fs.writeFileSync(deckPath,JSON.stringify(deck,null,2)+'\n');
   const approvalPath=path.join(target,'publication.approval.json'),approval=JSON.parse(fs.readFileSync(approvalPath,'utf8'));
   approval.status=approved?'approved':'private';approval.scope.site=approved;
   approval.approvedContentDigest=contentDigest(loadLecture(target));
   fs.writeFileSync(approvalPath,JSON.stringify(approval,null,2)+'\n');
  };
  add('02-future-topic','2026-10-08',true);
  add('03-private-draft','2026-10-15',false);
  execFileSync('npm',['run','build:public'],{cwd:fixture,stdio:'pipe'});
  execFileSync('npm',['run','release:check'],{cwd:fixture,stdio:'pipe'});
  const publicDir=path.join(fixture,'dist','public'),cards=JSON.parse(fs.readFileSync(path.join(publicDir,'portfolio.json'),'utf8')).cards;
  assert.deepEqual(cards.map(x=>x.slug),['01-agent-ai-intro','02-future-topic']);
  assert.equal(cards[1].date,'2026-10-08');
  assert.ok(cards[1].goals.includes('다음 회차 목표'));
  assert.equal(fs.existsSync(path.join(publicDir,'lectures','02-future-topic','index.html')),true);
  assert.equal(fs.existsSync(path.join(publicDir,'lectures','03-private-draft')),false);
 }finally{fs.rmSync(fixture,{recursive:true,force:true})}
});
test('비공개 썸네일이 CI 체크아웃에 없어도 검증되며 공개 승인 해시에 포함되지 않는다',()=>{
 const x=structuredClone(original);x.brief=original.brief;x.dir=original.dir;
 for(const a of x.assets.assets.filter(a=>a.id.startsWith('thumb-v'))){a.publicAllowed=false;a.rightsStatus='rights_unverified';a.sourcePath='.private/lecture-assets/CI_MISSING/'+path.basename(a.path)}
 assert.deepEqual(validateDeck(x),[]);
 assert.equal(contentDigest(x),contentDigest({...x,assets:{...x.assets,assets:x.assets.assets.filter(a=>a.publicAllowed===true)}}));
});
test('0×0 또는 NaN 차트와 경로 탈출 자산은 실패한다',()=>{const e=mutate(x=>{x.deck.slides[2].blocks.push({type:'chart',data:{labels:['x'],values:[NaN]}});x.assets.assets=[{id:'BAD',path:'../private.png'}]});assert.ok(e.some(x=>x.includes('chart 데이터')));assert.ok(e.some(x=>x.includes('자산 경로 탈출')))});
test('승인 해시는 콘텐츠 변경 후 무효가 된다',()=>{const d=contentDigest(original),x=structuredClone(original);x.brief=original.brief;x.dir=original.dir;x.approval={status:'approved',approvedContentDigest:d,scope:{site:true}};assert.equal(isApproved(x),true);x.approval.approvedContentDigest=sha('stale');assert.equal(isApproved(x),false)});
test('출처 URL과 확인일 오류를 검출하고 접근 응답과 내용 검증을 구분한다',()=>{const x=structuredClone(original.sources);x.sources[0].url='javascript:alert(1)';x.sources[1].checked_at='2026-02-30';const result=validateSources(x,'2026-09-25');assert.ok(result.errors.some(e=>e.includes('HTTP URL')));assert.ok(result.errors.some(e=>e.includes('확인일 오류')));assert.ok(result.warnings.some(e=>e.includes('본문 검증 필요')))});
test('공개 빌드 시험본은 승인된 원본을 포함하고 대본을 제외한다',()=>{
 const fixture=createPublicFixture();
 try{
 execFileSync('npm',['run','build:public'],{cwd:fixture,stdio:'pipe'});
 const publicDir=path.join(fixture,'dist','public'),slug='01-agent-ai-intro';
 const txt=fs.readFileSync(path.join(publicDir,'portfolio.json'),'utf8');
 assert.deepEqual(JSON.parse(txt).cards.map(x=>x.slug),[slug]);
 const deckPath=path.join(publicDir,'lectures',slug,'deck.json');
 assert.equal(fs.existsSync(deckPath),true);
 const deckText=fs.readFileSync(deckPath,'utf8');
 assert.equal(deckText.includes('speakerNotes'),false);
 const publicDeck=JSON.parse(deckText);
 assert.equal(publicDeck.assets.filter(a=>a.id.startsWith('thumb-v')).length,3);
 const videoList=publicDeck.slides.flatMap(s=>s.blocks||[]).find(b=>b.type==='video-list');
 assert.ok(videoList);
 assert.deepEqual(videoList.items.map(item=>item.assetId),['thumb-v01','thumb-v02','thumb-v03']);
 const captures=['pricing-chatgpt','pricing-claude','pricing-google'];
 assert.equal(publicDeck.slides.filter(s=>s.layout==='screenshot').length,3);
 assert.deepEqual(publicDeck.slides.filter(s=>s.layout==='screenshot').map(s=>s.blocks.find(b=>b.type==='figure')?.assetId),captures);
 for(const id of captures){
  const capture=publicDeck.assets.find(a=>a.id===id);
  assert.ok(capture);
  const capturePath=path.join(publicDir,'lectures',slug,capture.path);
  assert.equal(fs.existsSync(capturePath),true);
  assert.equal(sha(fs.readFileSync(capturePath)),capture.sha256);
  const originalAsset=original.assets.assets.find(a=>a.id===id);
  assert.equal(capture.width,originalAsset.width);
  assert.equal(capture.height,originalAsset.height);
 }
 const publicAssets=new Map(publicDeck.assets.map(a=>[a.id,a]));
 const figures=publicDeck.slides.flatMap(s=>s.blocks||[]).filter(b=>b.type==='figure');
 for(const figure of figures){
  const asset=publicAssets.get(figure.assetId);
  assert.ok(asset,`공개 슬라이드의 그림 자산 누락: ${figure.assetId}`);
  assert.notEqual(asset.publicAllowed,false,`공개되지 않은 그림 자산 참조: ${figure.assetId}`);
  assert.equal(fs.existsSync(path.join(publicDir,'lectures',slug,asset.path)),true,`공개 파일 누락: ${figure.assetId}`);
 }
 assert.equal(fs.existsSync(path.join(publicDir,'lectures',slug,'presenter.html')),false);
 assert.equal(fs.existsSync(path.join(publicDir,'lectures',slug,'presenter-deck.json')),false);
 assert.equal(txt.includes('PRIVATE_TEST_SENTINEL_DO_NOT_PUBLISH'),false);
 execFileSync('npm',['run','release:check'],{cwd:fixture,stdio:'pipe'});
 }finally{fs.rmSync(fixture,{recursive:true,force:true})}
});
