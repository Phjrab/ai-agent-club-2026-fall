import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import YAML from 'yaml';

export const root = path.resolve(import.meta.dirname, '..');
export const config = JSON.parse(fs.readFileSync(path.join(root, 'course.config.json'), 'utf8'));
export const sha = value => crypto.createHash('sha256').update(value).digest('hex');
export const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
export const writeJson = (file, value) => { fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file, JSON.stringify(value,null,2)+'\n'); };
export const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const safeSlug = s => /^[0-9]{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
export function lectureDirs() {
  const base=path.join(root,'lectures');
  if (!fs.existsSync(base)) return [];
  return fs.readdirSync(base).flatMap(term => {
    const dir=path.join(base,term);
    return fs.statSync(dir).isDirectory() ? fs.readdirSync(dir).map(slug=>path.join(dir,slug)).filter(x=>fs.statSync(x).isDirectory()) : [];
  });
}
export function selectLecture(slug,term) {
  if (!safeSlug(slug||'')) throw new Error('유효한 --lecture <slug>를 지정하세요.');
  const found=lectureDirs().filter(d=>path.basename(d)===slug && (!term || path.basename(path.dirname(d))===term));
  if (found.length!==1) throw new Error(found.length ? '동일 slug가 여러 학기에 있습니다. --term을 지정하세요.' : `강의를 찾을 수 없습니다: ${slug}`);
  return found[0];
}
export function loadLecture(dir) {
  const brief=fs.readFileSync(path.join(dir,'brief.md'));
  const deck=readJson(path.join(dir,'deck.json'));
  const sourceText=fs.readFileSync(path.join(dir,'sources.yaml'),'utf8');
  const sources=YAML.parse(sourceText);
  const assets=YAML.parse(fs.readFileSync(path.join(dir,'assets.yaml'),'utf8'));
  return {dir,brief,deck,sources,assets,approval:readJson(path.join(dir,'publication.approval.json'))};
}
export function contentDigest(data) {
  const files=['brief.md','deck.json','sources.yaml','assets.yaml'];
  const payload=files.map(f=>[f,fs.readFileSync(path.join(data.dir,f),'utf8')]);
  const chartDir=path.join(data.dir,'charts');
  if (fs.existsSync(chartDir)) for(const f of fs.readdirSync(chartDir).sort()) payload.push([`charts/${f}`,fs.readFileSync(path.join(chartDir,f),'utf8')]);
  return sha(JSON.stringify(payload));
}
export function isApproved(data) {
  const a=data.approval;
  return a.status==='approved' && a.scope?.site===true && a.approvedContentDigest===contentDigest(data);
}
export function validateDeck(data) {
  const e=[], {deck,brief,sources,assets}=data;
  if (deck.schemaVersion!==1 || deck.contentState!=='draft' && !['reviewed','archived'].includes(deck.contentState)) e.push('schemaVersion 또는 contentState 오류');
  if(deck.inputDigest!==sha(brief)) e.push('brief.md가 deck.json보다 변경되었습니다 (inputDigest 불일치)');
  if(deck.sourceRegistryDigest!==sha(fs.readFileSync(path.join(data.dir,'sources.yaml')))) e.push('sourceRegistryDigest 불일치');
  if(deck.slug!==path.basename(data.dir)) e.push('slug 불일치');
  const ids=new Set(), sourceIds=new Set((sources.sources||[]).map(s=>s.id));
  const assetIds=new Set((assets.assets||[]).map(a=>a.id));
  const allowed=new Set(['cover','statement','bullets','comparison','process','table','code-prompt','chart','math','diagram']);
  for(const s of deck.slides||[]) {
    if(!s.id || ids.has(s.id)) e.push(`중복/누락 slide ID: ${s.id}`); ids.add(s.id);
    if(!allowed.has(s.layout)) e.push(`미등록 layout: ${s.id}`);
    if(!['main','appendix','qa'].includes(s.kind)) e.push(`kind 오류: ${s.id}`);
    if(!Number.isInteger(s.durationSec)||s.durationSec<0) e.push(`duration 오류: ${s.id}`);
    if(!s.title || !s.takeaway || !Array.isArray(s.blocks) || s.blocks.length===0) e.push(`콘텐츠 누락: ${s.id}`);
    if(s.kind==='main' && (!s.speakerNotes?.say || !s.speakerNotes?.transition)) e.push(`원고 누락: ${s.id}`);
    if(s.sourcePolicy==='external' && !s.sourceIds?.length) e.push(`외부 출처 누락: ${s.id}`);
    for(const id of s.sourceIds||[]) if(!sourceIds.has(id)) e.push(`없는 source ID: ${s.id}/${id}`);
    for(const b of s.blocks||[]) {
      if(!['paragraph','bullets','callout','table','comparison','process','code','chart','math','diagram','figure','video-list'].includes(b.type)) e.push(`block type 오류: ${s.id}`);
      if(b.type==='figure' && !assetIds.has(b.assetId)) e.push(`없는 asset ID: ${s.id}`);
      if(b.type==='chart' && (!b.data?.labels?.length || !b.data?.values?.length || b.data.values.some(x=>!Number.isFinite(x)))) e.push(`chart 데이터 오류: ${s.id}`);
    }
  }
  const main=deck.slides?.filter(s=>s.kind==='main')||[];
  const qa=deck.slides?.filter(s=>s.kind==='qa')||[];
  if(main.length!==30) e.push(`본편 30장 필요, 현재 ${main.length}장`);
  if(main.reduce((n,s)=>n+s.durationSec,0)!==deck.plannedMainDurationSec || deck.plannedMainDurationSec!==3000) e.push('본편 시간 3000초 불일치');
  if(qa.reduce((n,s)=>n+s.durationSec,0)!==deck.questionsSec || deck.questionsSec!==600) e.push('Q&A 시간 600초 불일치');
  const needed=[...new Set([...brief.toString().matchAll(/\bREQ-[A-Z-]+\b/g)].map(x=>x[0]))];
  const covered=new Set(main.flatMap(s=>s.requirementIds||[]));
  for(const id of needed) if(!covered.has(id)) e.push(`요구 주제 누락: ${id}`);
  for(const a of assets.assets||[]) if(a.path && (path.isAbsolute(a.path)||a.path.split(/[\\/]/).includes('..'))) e.push(`자산 경로 탈출: ${a.id}`);
  if(deck.videoBlock){
    const v=deck.videoBlock,listed=(deck.slides||[]).find(s=>s.id===v.slide_id);
    if(!listed||listed.blocks.filter(b=>b.type==='video-list').length!==1) e.push('영상 슬라이드 누락');
    if(JSON.stringify(v.playback_order)!==JSON.stringify(['V01','V02','V03'])) e.push('지정 영상 순서 불일치');
    if(v.videos?.reduce((n,x)=>n+(x.duration_seconds||0),0)!==v.actual_total_seconds) e.push('영상 길이 합계 불일치');
    if(v.budget_seconds!==720||listed?.durationSec!==720) e.push('영상 임시 예산 720초 불일치');
    const concept=(deck.slides||[]).findIndex(s=>(s.requirementIds||[]).includes('REQ-LLM-AGENT'));
    if(concept>=0&&(deck.slides||[]).indexOf(listed)>=concept) e.push('영상이 본격 개념 설명 뒤에 있습니다');
  }
  return e;
}
export function sanitizeDeck(deck) { return {...deck, slides:deck.slides.map(({speakerNotes,...s})=>s)}; }

export function validateSources(registry, today=new Date().toISOString().slice(0,10)) {
  const errors=[], warnings=[], seen=new Set();
  for (const source of registry.sources||[]) {
    const id=source.id||'(ID 없음)';
    if (seen.has(id)) errors.push(`${id}: 중복 출처 ID`);
    seen.add(id);
    if (!source.id || !source.title || !source.publisher) errors.push(`${id}: 필수 메타데이터 누락`);
    if (source.url!==null && source.url!==undefined) {
      try {
        const url=new URL(source.url);
        if (!['https:','http:'].includes(url.protocol) || !url.hostname) throw new Error();
      } catch { errors.push(`${id}: 유효하지 않은 HTTP URL`); }
    } else if (source.type!=='personal_experience') errors.push(`${id}: 출처 URL 누락`);
    if (source.checked_at) {
      const date=source.checked_at;
      const parsed=new Date(`${date}T00:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0,10)!==date || date>today) errors.push(`${id}: 확인일 오류 (${date})`);
    } else if (source.verification_status==='unavailable') warnings.push(`${id}: 접근 실패로 확인일 미기록`);
    else errors.push(`${id}: 확인일 누락`);
    if (source.access_status==='HTTP 200' && source.verification_status==='needs_verification') warnings.push(`${id}: URL 응답만 확인, 본문 검증 필요`);
  }
  if (!seen.size) errors.push('출처 목록이 비어 있습니다');
  return {errors,warnings};
}
