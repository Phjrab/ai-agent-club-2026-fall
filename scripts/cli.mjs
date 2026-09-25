import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {build} from 'esbuild';
import {root,config,lectureDirs,loadLecture,validateDeck,validateSources,isApproved,sanitizeDeck,escapeHtml,selectLecture,readJson,writeJson} from './lib.mjs';

const [cmd,...args]=process.argv.slice(2);
const option=(name, fallback)=>{const i=args.indexOf(name);return i<0?fallback:args[i+1];};
const help=`사용법: npm run <command> [-- options]\n명령: setup:assets, dev, build, build:public, serve -- --dir dist/private, validate, lecture:new, sources:check, release:check\n개별 강의: --lecture <slug> [--term <term>]`;
if(!cmd || args.includes('--help')) { console.log(help); process.exit(0); }

function copy(from,to){fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);}
function setupAssets(){
 const dest=path.join(root,'.cache','fonts');fs.mkdirSync(dest,{recursive:true});
 for(const weight of ['Regular','SemiBold','Bold']) copy(path.join(root,'node_modules','pretendard','dist','web','static','woff',`Pretendard-${weight}.woff`),path.join(dest,`Pretendard-${weight}.woff`));
 copy(path.join(root,'node_modules','pretendard','dist','LICENSE.txt'),path.join(dest,'OFL-LICENSE.txt'));
 console.log('Pretendard 1.3.9: '+dest);
}
function validate(){let errors=[];for(const d of lectureDirs()) {if(!fs.existsSync(path.join(d,'deck.json'))) continue; errors.push(...validateDeck(loadLecture(d)).map(x=>`${path.basename(d)}: ${x}`));} if(errors.length) throw new Error(errors.join('\n')); console.log('검증 PASS');}
function makePage(title,css,js,body){return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><link rel="stylesheet" href="${css}"><link rel="stylesheet" href="${css.replace('site.css','katex.min.css')}"></head><body>${body}<script type="module" src="${js}"></script></body></html>`;}
async function buildSite(isPublic=false){
 validate();setupAssets();
 const out=path.join(root,'dist',isPublic?'public':'private');fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
 fs.mkdirSync(path.join(out,'assets','fonts'),{recursive:true});
 for(const f of fs.readdirSync(path.join(root,'.cache','fonts'))) copy(path.join(root,'.cache','fonts',f),path.join(out,'assets','fonts',f));
 if(isPublic){
  for(const [name,file] of [['Chart.js','chart.js/LICENSE.md'],['KaTeX','katex/LICENSE'],['Mermaid','mermaid/LICENSE'],['Prism.js','prismjs/LICENSE']])
   copy(path.join(root,'node_modules',file),path.join(out,'licenses',`${name}.txt`));
  copy(path.join(root,'docs','LICENSE_POLICY.md'),path.join(out,'licenses','PROJECT_POLICY.md'));
 }
 copy(path.join(root,'src','site.css'),path.join(out,'assets','site.css'));
 const katexDir=path.join(root,'node_modules','katex','dist');copy(path.join(katexDir,'katex.min.css'),path.join(out,'assets','katex.min.css'));
 fs.cpSync(path.join(katexDir,'fonts'),path.join(out,'assets','fonts'),{recursive:true});
 for(const entry of ['presentation','portfolio']) await build({entryPoints:[path.join(root,'src',`${entry}.js`)],bundle:true,minify:true,format:'esm',platform:'browser',outfile:path.join(out,'assets',`${entry}.js`),logLevel:'silent'});
 const cards=[];
 for(const dir of lectureDirs()) {
  if(!fs.existsSync(path.join(dir,'deck.json'))) continue;
  const d=loadLecture(dir), slug=d.deck.slug, approved=isApproved(d);
  if(isPublic&&!approved) continue;
  const target=path.join(out,'lectures',slug);fs.mkdirSync(target,{recursive:true});
  const student={...sanitizeDeck(d.deck),sources:d.sources.sources};writeJson(path.join(target,'deck.json'),student);
  const css='../../assets/site.css',js='../../assets/presentation.js';
  fs.writeFileSync(path.join(target,'index.html'),makePage(d.deck.title,css,js,'<div id="presentation-app"></div>'));
  if(!isPublic) {
   writeJson(path.join(target,'presenter-deck.json'),{...d.deck,sources:d.sources.sources});
   fs.writeFileSync(path.join(target,'presenter.html'),makePage(d.deck.title+' · 발표자',css,js,'<div id="presentation-app" data-presenter="true"></div>'));
  }
  cards.push({slug,title:d.deck.title,state:d.deck.contentState,date:'2026-10-01',goals:['AI 선택 기준','Agent 작업과 검증','GitHub 포트폴리오'],sourceChecked:'2026-09-25'});
 }
 const payload={title:config.title,term:config.term,startDate:config.startDate,startTime:config.startTime,classroom:config.classroom,plannedSessionCount:config.plannedSessionCount,cards,public:isPublic,repositoryUrl:isPublic?`https://github.com/${config.githubOwner}/${config.repoName}`:null};
 writeJson(path.join(out,'portfolio.json'),payload);
 fs.writeFileSync(path.join(out,'index.html'),makePage(config.title,'./assets/site.css','./assets/portfolio.js','<div id="portfolio-app"></div>'));
 console.log(`${isPublic?'공개':'비공개'} 빌드: ${out} (${cards.length}회차)`);
}
function mime(file){return ({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.css':'text/css; charset=utf-8','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.svg':'image/svg+xml','.png':'image/png'})[path.extname(file)]||'application/octet-stream';}
export function server(dir,port=4173){const base=path.resolve(root,dir);return http.createServer((req,res)=>{let u;try{u=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return} if(u.startsWith('/ai-agent-club-2026-fall/'))u=u.slice('/ai-agent-club-2026-fall'.length);let f=path.resolve(base,'.'+u);if(!f.startsWith(base+path.sep)&&f!==base){res.writeHead(403).end();return}if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f)){res.writeHead(404).end();return}res.setHeader('Content-Type',mime(f));fs.createReadStream(f).pipe(res)}).listen(port,()=>console.log(`http://127.0.0.1:${port}/`));}
try {
 if(cmd==='setup:assets')setupAssets();
 else if(cmd==='validate')validate();
 else if(cmd==='build')await buildSite(false);
 else if(cmd==='build:public')await buildSite(true);
 else if(cmd==='serve')server(option('--dir','dist/private'),Number(option('--port',4173)));
 else if(cmd==='dev'){await buildSite(false);server('dist/private',4173);}
 else if(cmd==='lecture:new'){
  const slug=option('--slug'),title=option('--title');if(!slug||!title)throw new Error('--slug와 --title이 필요합니다');
  const target=path.join(root,'lectures',config.term,slug);if(fs.existsSync(target))throw new Error('동일 강의 폴더가 이미 있습니다');
  fs.mkdirSync(target,{recursive:true});fs.writeFileSync(path.join(target,'brief.md'),`---\nslug: ${slug}\nterm: ${config.term}\ntitle: "${title.replaceAll('"','')}"\ncontent_state: planned\nevent_state: unknown\n---\n\n# ${title}\n\n## 목표\n\n## 필수 내용\n\n## 확인할 자료\n`);console.log(target);
 }
 else if(cmd==='sources:check') {
  let count=0,errors=[];
  for(const d of lectureDirs()){
   if(!fs.existsSync(path.join(d,'sources.yaml')))continue;
   const {sources}=loadLecture(d), result=validateSources(sources);count+=(sources.sources||[]).length;
   for(const message of result.warnings)console.warn(`주의 ${path.basename(d)}: ${message}`);
   errors.push(...result.errors.map(message=>`${path.basename(d)}: ${message}`));
  }
  if(errors.length)throw new Error(errors.join('\n'));
  console.log(`출처 메타데이터 PASS: ${count}건. URL 응답 상태는 저장된 기록이며 본문 사실 확인을 뜻하지 않습니다.`);
 }
 else if(cmd==='release:check') {
  if(config.publishSite!==true||config.publicReleaseApproved!==true)throw new Error('공개 플래그가 승인되지 않았습니다');
  if(config.publicTranscript!==false)throw new Error('공개 사이트 대본 제외 설정이 필요합니다');
  const expected=[];
  for(const d of lectureDirs()){
   if(!fs.existsSync(path.join(d,'deck.json')))continue;
   const x=loadLecture(d),a=x.approval;
   if(!isApproved(x))throw new Error(`${x.deck.slug} 공개 승인 해시 불일치`);
   if(a.scope?.repositorySource!==true||a.scope?.includeSpeakerNotesInRepository!==true||!a.approvedAt||!a.approvalEvidence)throw new Error(`${x.deck.slug} 공개 저장소와 대본 범위 승인 누락`);
   expected.push(x.deck.slug);
  }
  const out=path.join(root,'dist','public');
  const portfolio=readJson(path.join(out,'portfolio.json'));
  if(JSON.stringify(portfolio.cards.map(x=>x.slug).sort())!==JSON.stringify(expected.sort()))throw new Error('공개 강의 목록 불일치');
  for(const slug of expected){
   const dir=path.join(out,'lectures',slug);
   if(fs.existsSync(path.join(dir,'presenter.html'))||fs.existsSync(path.join(dir,'presenter-deck.json')))throw new Error(`${slug} 발표자 화면 누출`);
   const deckText=fs.readFileSync(path.join(dir,'deck.json'),'utf8');
   if(deckText.includes('speakerNotes')||deckText.includes('PRIVATE_TEST_SENTINEL_DO_NOT_PUBLISH'))throw new Error(`${slug} 대본 또는 비공개 표식 누출`);
  }
  const files=[];const visit=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())visit(p);else files.push(path.relative(out,p));}};visit(out);
  if(files.some(f=>/^(?:\.private|reports|exports|private)\/|(?:presenter|speaker-script|\.env)/i.test(f)))throw new Error('공개 파일 목록에 비공개 산출물 포함');
  if(files.some(f=>/\.(pdf|pptx|docx)$/i.test(f)))throw new Error('PDF/PPTX/DOCX는 이번 사이트 게시 범위가 아닙니다');
  console.log(`공개 게이트 PASS: ${expected.length}회차, ${files.length}개 파일`);
 }
 else throw new Error('알 수 없는 명령. --help를 확인하세요.');
} catch(e){console.error(e.message);process.exitCode=1;}
