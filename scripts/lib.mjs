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
  for(const asset of [...(data.assets.assets||[])].sort((a,b)=>a.id.localeCompare(b.id))) {
    if(asset.publicAllowed===false && asset.sourcePath?.startsWith('.private/lecture-assets/')) continue;
    try { const file=assetSourceFile(data,asset); payload.push([`asset:${asset.id}`,fs.readFileSync(file)]); } catch {}
  }
  return sha(JSON.stringify(payload));
}
export function assetSourceFile(data,asset) {
  let base,relative;
  if(asset.sourcePath) {
    const prefix='.private/lecture-assets/';
    if(asset.publicAllowed!==false || !asset.sourcePath.startsWith(prefix)) throw new Error('비공개 자산의 sourcePath는 .private/lecture-assets 아래에 있어야 합니다');
    relative=asset.sourcePath.slice(prefix.length); base=path.join(root,'.private','lecture-assets');
  } else { relative=asset.path; base=data.dir; }
  if(!relative || path.isAbsolute(relative) || relative.split(/[\\/]/).includes('..')) throw new Error('자산 원본 경로가 유효하지 않습니다');
  const rootReal=fs.realpathSync(base); let cursor=base;
  for(const part of relative.split(/[\\/]/).filter(Boolean)) { cursor=path.join(cursor,part); if(fs.lstatSync(cursor).isSymbolicLink()) throw new Error('자산 원본에 symlink가 있습니다'); }
  const real=fs.realpathSync(cursor);
  if(real!==rootReal&&!real.startsWith(rootReal+path.sep)) throw new Error('자산 원본 경로가 허용 범위를 벗어났습니다');
  return real;
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
  const assetById=new Map((assets.assets||[]).map(a=>[a.id,a]));
  const assetIds=new Set(assetById.keys());
  const usedAssets=new Map();
  const allowed=new Set(['cover','statement','bullets','comparison','process','table','figure-focus','text-figure','case-study','summary','qa','code-prompt','chart','math','diagram']);
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
      if(b.type==='figure') {
        const a=assetById.get(b.assetId);
        if(!a) e.push(`없는 asset ID: ${s.id}/${b.assetId}`);
        else { usedAssets.set(a.id,(usedAssets.get(a.id)||[]).concat(s.id)); if(!b.alt) e.push(`figure 대체 설명 누락: ${s.id}/${b.assetId}`); }
      }
      if(b.type==='video-list') for(const item of b.items||[]) if(item.assetId) {
        const a=assetById.get(item.assetId);
        if(!a) e.push(`없는 video thumbnail asset ID: ${s.id}/${item.assetId}`);
        else usedAssets.set(a.id,(usedAssets.get(a.id)||[]).concat(s.id));
      }
      if(b.type==='chart' && (!b.data?.labels?.length || !b.data?.values?.length || b.data.values.some(x=>!Number.isFinite(x)))) e.push(`chart 데이터 오류: ${s.id}`);
      if(!['paragraph','bullets','callout','table','comparison','process','code','chart','math','diagram','figure','video-list'].includes(b.type)) e.push(`지원되지 않는 block type: ${s.id}/${b.type}`);
    }
  }
  const main=deck.slides?.filter(s=>s.kind==='main')||[];
  const qa=deck.slides?.filter(s=>s.kind==='qa')||[];
  const mainSeconds=main.reduce((n,s)=>n+s.durationSec,0), qaSeconds=qa.reduce((n,s)=>n+s.durationSec,0);
  const frontmatter=brief.toString().match(/^---\s*\n([\s\S]*?)\n---/), briefMeta=frontmatter?YAML.parse(frontmatter[1])||{}:{};
  if(briefMeta.slide_language&&deck.slideLanguage!==briefMeta.slide_language) e.push('slideLanguage와 brief 설정 불일치');
  if(briefMeta.script_language&&deck.scriptLanguage!==briefMeta.script_language) e.push('scriptLanguage와 brief 설정 불일치');
  if(Number.isInteger(briefMeta.duration_minutes)&&deck.sessionDurationSec!==briefMeta.duration_minutes*60) e.push('sessionDurationSec와 brief 수업 시간 불일치');
  if(Number.isInteger(briefMeta.questions_minutes)&&deck.questionsSec!==briefMeta.questions_minutes*60) e.push('questionsSec와 brief 고정 질의응답 불일치');
  if(briefMeta.questions_mode&&deck.questionsMode!==briefMeta.questions_mode) e.push('questionsMode와 brief 설정 불일치');
  if(Number.isInteger(briefMeta.target_main_slides)&&main.length!==briefMeta.target_main_slides) e.push(`본편 목표 ${briefMeta.target_main_slides}장 불일치 (${main.length}장)`);
  if(mainSeconds!==deck.plannedMainDurationSec) e.push(`본편 시간 합계 불일치 (${mainSeconds}초)`);
  if(qaSeconds!==deck.questionsSec) e.push(`Q&A 시간 합계 불일치 (${qaSeconds}초)`);
  const videoSeconds=deck.videoBlock?.videos?.reduce((n,x)=>n+(x.duration_seconds||0),0)||0;
  const speakerSeconds=mainSeconds-videoSeconds;
  if(deck.plannedSpeakerDurationSec!==undefined&&speakerSeconds!==deck.plannedSpeakerDurationSec) e.push(`설명·전환 시간 불일치 (${speakerSeconds}초)`);
  if(deck.actualVideoDurationSec!==undefined&&deck.actualVideoDurationSec!==videoSeconds) e.push(`영상 메타데이터 합계 불일치 (${videoSeconds}초)`);
  if(deck.plannedVideoBudgetSec!==undefined&&deck.plannedVideoBudgetSec!==videoSeconds) e.push(`영상 계획 시간 불일치 (${videoSeconds}초)`);
  const estimated=mainSeconds+qaSeconds;
  if(deck.estimatedFullDurationSec!==undefined&&deck.estimatedFullDurationSec!==estimated) e.push(`전체 예상 시간 중복/합계 오류 (${estimated}초)`);
  if(deck.questionsSec!==undefined&&deck.questionsSec!==qaSeconds) e.push('questionsSec와 Q&A 장 합계 불일치');
  if(deck.questionsMode==='flexible'&&deck.questionsSec!==0) e.push('유동 질의응답은 고정 questionsSec가 0이어야 합니다');
  if(deck.sessionDurationSec!==undefined) {
    if(!Number.isInteger(deck.sessionDurationSec)||deck.sessionDurationSec<0) e.push('sessionDurationSec 오류');
    const buffer=deck.sessionDurationSec-estimated;
    if(buffer<0) e.push(`수업 상한 초과: ${-buffer}초`);
    if(deck.flexibleBufferSec!==buffer) e.push(`유동 여유 시간 불일치 (${buffer}초)`);
  }
  const needed=[...new Set([...brief.toString().matchAll(/\bREQ-[A-Z-]+\b/g)].map(x=>x[0]))];
  const covered=new Set(main.flatMap(s=>s.requirementIds||[]));
  for(const id of needed) if(!covered.has(id)) e.push(`요구 주제 누락: ${id}`);
  for(const a of assets.assets||[]) {
    if(!a.id||!a.path||path.isAbsolute(a.path)||a.path.split(/[\\/]/).includes('..')) { e.push(`자산 경로 탈출: ${a.id}`); continue; }
    if(!a.alt||!a.caption||!a.kind||!a.acquisitionMethod||!a.rightsStatus||!a.rightsBasis||typeof a.publicAllowed!=='boolean') e.push(`자산 provenance 누락: ${a.id}`);
    if((usedAssets.get(a.id)||[]).length===0) e.push(`사용되지 않는 자산: ${a.id}`);
    try {
      const real=assetSourceFile(data,a);
      const stat=fs.statSync(real), ext=path.extname(real).toLowerCase();
      if(!stat.isFile()||stat.size===0||stat.size>10*1024*1024) throw new Error('size');
      if(!['.svg','.png','.jpg','.jpeg','.webp'].includes(ext)) throw new Error('format');
      if(a.sha256&&sha(fs.readFileSync(real))!==a.sha256) throw new Error('sha256');
      if(ext==='.svg') {
        const svg=fs.readFileSync(real,'utf8');
        if(!/<svg\b/i.test(svg)||/<script\b|<foreignObject\b|<image\b|\son\w+\s*=|javascript:|(?:href|src)\s*=\s*["'](?:https?:|\/\/|data:)/i.test(svg)) throw new Error('unsafe-svg');
      }
      if(Number.isInteger(a.width)&&Number.isInteger(a.height)&&a.ratio&&Math.abs(a.width/a.height-a.ratio)>0.02) throw new Error('ratio');
    } catch(err) {
      const privateSourceUnavailable=a.publicAllowed===false&&a.sourcePath?.startsWith('.private/lecture-assets/')&&err.code==='ENOENT';
      if(!privateSourceUnavailable) e.push(`자산 파일/해시/안전 검사 실패: ${a.id} (${err.message})`);
    }
  }
  if(deck.videoBlock){
    const v=deck.videoBlock,listed=(deck.slides||[]).find(s=>s.id===v.slide_id);
    if(!listed||listed.blocks.filter(b=>b.type==='video-list').length!==1) e.push('영상 슬라이드 누락');
    if(JSON.stringify(v.playback_order)!==JSON.stringify(['V01','V02','V03'])) e.push('지정 영상 순서 불일치');
    if(v.videos?.reduce((n,x)=>n+(x.duration_seconds||0),0)!==v.actual_total_seconds) e.push('영상 길이 합계 불일치');
    if(v.budget_seconds!==v.actual_total_seconds||listed?.durationSec!==v.actual_total_seconds) e.push('영상 시간과 영상 슬라이드 duration 불일치');
    const concept=(deck.slides||[]).findIndex(s=>(s.requirementIds||[]).includes('REQ-LLM-AGENT'));
    if(concept>=0&&(deck.slides||[]).indexOf(listed)>=concept) e.push('영상이 본격 개념 설명 뒤에 있습니다');
  }
  return e;
}
export function sanitizeDeck(deck, assets=[], {includePrivateAssets=false}={}) {
  const safeAssets=assets.filter(a=>includePrivateAssets||a.publicAllowed).map(({id,path,alt,caption,kind,width,height,sha256})=>({id,path,alt,caption,kind,width,height,sha256}));
  const safeAssetIds=new Set(safeAssets.map(a=>a.id));
  const slides=deck.slides.map(({speakerNotes,...s})=>({...s,blocks:(s.blocks||[]).map(block=>{
    if(block.type!=='video-list')return block;
    let omitted=false;
    const items=(block.items||[]).map(item=>{
      if(!item.assetId||safeAssetIds.has(item.assetId))return item;
      omitted=true;
      const {assetId,alt,thumbnailCaption,...publicItem}=item;
      return publicItem;
    });
    return omitted?{...block,items,caption:'공개 권리가 확인되지 않은 썸네일은 공개하지 않고, 영상 제목과 링크만 제공합니다.'}:{...block,items};
  })}));
  return {...deck, assets:safeAssets, slides};
}

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
    } else if (!['personal_experience','user_provided_reference'].includes(source.type)) errors.push(`${id}: 출처 URL 누락`);
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
