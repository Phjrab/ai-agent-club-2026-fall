import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {execFileSync} from 'node:child_process';
import {root,selectLecture,loadLecture,contentDigest,writeJson} from './lib.mjs';
import {withBrowser} from './browser.mjs';

const args=process.argv.slice(2);if(args.includes('--help')){console.log('사용법: npm run qa -- --lecture <slug> [--term <term>]');process.exit(0)}
const opt=(k,f)=>{const i=args.indexOf(k);return i<0?f:args[i+1]};
const slug=opt('--lecture','01-agent-ai-intro'),dir=selectLecture(slug,opt('--term'));
const data=loadLecture(dir),runId=new Date().toISOString().replace(/[:.]/g,'-'),out=path.join(root,'reports',runId);fs.mkdirSync(out,{recursive:true});
const results=[],screens=[];const add=(id,status,detail)=>results.push({id,status,detail});
try{
 execFileSync('npm',['run','build'],{cwd:root,stdio:'pipe'});
 const fixtureDir=path.join(root,'dist','private','lectures','engine-fixture');fs.mkdirSync(fixtureDir,{recursive:true});
 const sample=(n,type,block)=>({id:`TEST-S00${n}`,kind:'main',sectionId:'test',layout:type,title:`Engine ${type}`,takeaway:'Renderer integration check',blocks:[block],sourceIds:[]});
 writeJson(path.join(fixtureDir,'deck.json'),{title:'Engine fixture',slides:[sample(1,'chart',{type:'chart',data:{type:'bar',labels:['A','B'],values:[2,3],label:'Illustrative'}}),sample(2,'math',{type:'math',latex:'E=mc^2'}),sample(3,'diagram',{type:'diagram',text:'flowchart LR\n A[Input] --> B[Result]'}),sample(4,'code-prompt',{type:'code',language:'javascript',text:'const result = 1 + 2;'})]});
 fs.writeFileSync(path.join(fixtureDir,'index.html'),'<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../assets/site.css"><link rel="stylesheet" href="../../assets/katex.min.css"></head><body><div id="presentation-app"></div><script type="module" src="../../assets/presentation.js"></script></body></html>');
 await withBrowser(async({browser,url})=>{
  const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  await context.route('**/*',route=>{const u=new URL(route.request().url());return u.hostname==='127.0.0.1'?route.continue():route.abort()});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${url}/lectures/${slug}/index.html?export=1`);await page.waitForFunction(()=>window.__PRESENTATION_READY__===true);
  const manifest=await page.evaluate(()=>window.presentation.getManifest());add('slide_count',manifest.slides.length===31?'PASS':'FAIL',`${manifest.slides.length}장`);add('asset_registry',manifest.failures.length===0?'PASS':'FAIL',JSON.stringify(manifest.failures));
  const font=await page.evaluate(()=>({faces:[...document.fonts].filter(x=>x.family==='Pretendard').map(x=>({weight:x.weight,status:x.status})),check400:document.fonts.check('400 40px Pretendard'),check700:document.fonts.check('700 64px Pretendard')}));
  add('font',font.check400&&font.check700&&['400','600','700'].every(w=>font.faces.some(x=>x.status==='loaded'&&x.weight===w))?'PASS':'FAIL',JSON.stringify(font));
  for(const s of manifest.slides){await page.evaluate(id=>window.presentation.goTo(id),s.id);await page.evaluate(id=>window.presentation.slideReady(id),s.id);
   const imageCheck=await page.evaluate(()=>[...document.querySelectorAll('.slide img')].map(img=>({src:img.getAttribute('src'),loaded:img.complete&&img.naturalWidth>0&&img.naturalHeight>0,width:img.naturalWidth,height:img.naturalHeight})));
   const expectedImages=data.deck.slides.find(x=>x.id===s.id).blocks.reduce((n,b)=>n+(b.type==='figure'?1:b.type==='video-list'?(b.items||[]).filter(x=>x.assetId).length:0),0);
   if(imageCheck.length!==expectedImages||imageCheck.some(x=>!x.loaded))add(`slide_assets_${s.id}`,'FAIL',JSON.stringify({expected:expectedImages,actual:imageCheck}));
   else if(expectedImages)add(`slide_assets_${s.id}`,'PASS',`${imageCheck.length}개 이미지 디코드 완료`);
   const bounds=await page.evaluate(()=>{const slide=document.querySelector('.slide'),footer=document.querySelector('.slide-footer'),body=document.querySelector('.slide-body'),r=slide.getBoundingClientRect(),f=footer.getBoundingClientRect(),b=body.getBoundingClientRect();const text=[...slide.querySelectorAll('.slide-title,.slide-takeaway,.slide-content p,.slide-content li,.block-card,.block-step,.block-callout,.block-table')].map(e=>{const x=e.getBoundingClientRect();return {text:e.textContent.slice(0,35),left:x.left,right:x.right,top:x.top,bottom:x.bottom}});return {bodyBottom:b.bottom,footerTop:f.top,scrollW:slide.scrollWidth,scrollH:slide.scrollHeight,violations:text.filter(x=>x.left<r.left+70||x.right>r.right-70||x.top<r.top+45||x.bottom>f.top-10)}});
   if(bounds.violations.length||bounds.bodyBottom>bounds.footerTop) add(`bounds_${s.id}`,'FAIL',JSON.stringify(bounds));
   const file=path.join(out,`${s.id}.png`);await page.locator('.slide').screenshot({path:file});screens.push(file);
  }
  add('browser_errors',errors.length?'FAIL':'PASS',errors.join(' | ')||'없음');
  await page.goto(`${url}/lectures/${slug}/index.html#slide=L01-S10`);await page.waitForFunction(()=>window.__PRESENTATION_READY__===true);add('deep_link',(await page.evaluate(()=>new URL(location.href).hash)==='#slide=L01-S10'?'PASS':'FAIL'),'L01-S10 직접 접속');
  await page.keyboard.press('ArrowRight');add('keyboard',(await page.evaluate(()=>new URL(location.href).hash)==='#slide=L01-S11'?'PASS':'FAIL'),'ArrowRight로 다음 ID 이동');
  await page.setViewportSize({width:1280,height:720});await page.waitForFunction(()=>document.querySelector('.slide').getBoundingClientRect().width<1281,{timeout:5000});add('scaled_stage','PASS','1280×720');
  await page.goto(`${url}/index.html`);await page.setViewportSize({width:390,height:844});add('mobile_portfolio',await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)?'PASS':'FAIL','390×844');
  await page.goto(`${url}/ai-agent-club-2026-fall/lectures/${slug}/index.html#slide=L01-S01`);await page.waitForFunction(()=>window.__PRESENTATION_READY__===true);add('base_path',(await page.evaluate(()=>new URL(location.href).hash))==='#slide=L01-S01'?'PASS':'FAIL','/ai-agent-club-2026-fall/');
  await page.evaluate(()=>window.presentation.goTo('L01-S15'));const videoThumbs=await page.locator('.block-video-card .video-thumb img').evaluateAll(imgs=>imgs.map(img=>({loaded:img.complete&&img.naturalWidth===1280&&img.naturalHeight===720,caption:img.closest('figure')?.querySelector('.asset-caption')?.textContent||''})));add('video_links',(await page.locator('.block-video-card a').count())===3?'PASS':'FAIL','V01 → V02 → V03');add('youtube_thumbnail_identity',videoThumbs.length===3&&videoThumbs.every(x=>x.loaded&&x.caption.includes('YouTube 썸네일')&&x.caption.includes('실제 제품 화면'))?'PASS':'FAIL',JSON.stringify(videoThumbs));
  await page.goto(`${url}/lectures/engine-fixture/index.html?export=1`);await page.waitForFunction(()=>window.__PRESENTATION_READY__===true);
  add('chart_fixture',await page.evaluate(()=>{const c=document.querySelector('canvas');return c&&c.width>0&&c.height>0})?'PASS':'FAIL','Chart.js illustrative 2-point canvas');
  await page.evaluate(()=>window.presentation.goTo('TEST-S002'));add('math_fixture',await page.locator('.katex').count()?'PASS':'FAIL','KaTeX E=mc²');
  await page.evaluate(()=>window.presentation.goTo('TEST-S003'));add('diagram_fixture',await page.locator('.block-diagram svg').count()?'PASS':'FAIL','Mermaid strict SVG');
  await page.evaluate(()=>window.presentation.goTo('TEST-S004'));add('code_fixture',await page.locator('.token').count()?'PASS':'FAIL','Prism highlighted code');
  await context.close();
 });
 const tiles=await Promise.all(screens.map(async(f,i)=>({input:await sharp(f).resize(320,180).png().toBuffer(),left:(i%5)*320,top:Math.floor(i/5)*180})));
 await sharp({create:{width:1600,height:Math.ceil(screens.length/5)*180,channels:3,background:'#ffffff'}}).composite(tiles).png().toFile(path.join(out,'contact-sheet.png'));
}catch(e){add('runtime','BLOCKED',e.message);}
const report={runId,checkedAt:new Date().toISOString(),command:`npm run qa -- --lecture ${slug}`,environment:{node:process.version,browser:'Playwright Chromium'},contentDigest:contentDigest(data),results,evidence:{screenshots:screens.length,contactSheet:screens.length?path.join(out,'contact-sheet.png'):null}};
writeJson(path.join(out,'qa.json'),report);fs.writeFileSync(path.join(out,'qa-summary.md'),`# QA ${runId}\n\n${results.map(r=>`- ${r.status} ${r.id}: ${r.detail}`).join('\n')}\n`);console.log(path.join(out,'qa-summary.md'));if(results.some(r=>r.status==='FAIL'||r.status==='BLOCKED'))process.exitCode=1;
