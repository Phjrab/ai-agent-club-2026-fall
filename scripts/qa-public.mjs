import fs from 'node:fs';
import path from 'node:path';
import {root,writeJson} from './lib.mjs';
import {withBrowser} from './browser.mjs';

const checks=[];
const check=(name,pass,detail='')=>checks.push({name,status:pass?'PASS':'FAIL',detail});
const slug='01-agent-ai-intro';
try{
 await withBrowser(async({browser,url})=>{
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${url}/ai-agent-club-2026-fall/`);
  await page.waitForFunction(()=>document.querySelectorAll('.card').length===1);
  check('portfolio card',await page.locator('.card a').count()===1);
  check('public draft label',(await page.locator('.card .tag').textContent())==='공개 초안');
  await page.locator('.card a').click();
  await page.waitForFunction(()=>window.__PRESENTATION_READY__===true);
  const publicDeckResponse=await page.request.get(`${url}/ai-agent-club-2026-fall/lectures/${slug}/deck.json`),publicDeck=await publicDeckResponse.json();
  const screenshotSlides=publicDeck.slides.filter(s=>s.layout==='screenshot');
  check('presentation pages',(await page.evaluate(()=>window.presentation.getManifest().slides.length))===publicDeck.slides.length,`${publicDeck.slides.filter(s=>s.kind==='main').length}장 본편 + ${publicDeck.slides.filter(s=>s.kind==='qa').length}장 Q&A`);
  check('pricing screenshot order',screenshotSlides.map(s=>s.blocks?.find(b=>b.type==='figure')?.assetId).join(',')==='pricing-chatgpt,pricing-claude,pricing-google',screenshotSlides.map(s=>s.id).join(' → '));
  for(const s of screenshotSlides){
   await page.evaluate(id=>window.presentation.goTo(id),s.id);
   const frame=await page.evaluate(()=>{const slide=document.querySelector('.slide'),img=slide.querySelector('.block-figure img'),a=img?.getBoundingClientRect(),b=slide.getBoundingClientRect();return {images:slide.querySelectorAll('.block-figure img').length,naturalWidth:img?.naturalWidth,naturalHeight:img?.naturalHeight,objectFit:img?getComputedStyle(img).objectFit:null,fullFrame:a&&Math.abs(a.left-b.left)<1&&Math.abs(a.top-b.top)<1&&Math.abs(a.width-b.width)<1&&Math.abs(a.height-b.height)<1}});
   check(`original screenshot ${s.id}`,frame.images===1&&frame.naturalWidth===1920&&frame.naturalHeight===1080&&frame.objectFit==='contain'&&frame.fullFrame,JSON.stringify(frame));
  }
  check('font',await page.evaluate(()=>document.fonts.check('400 40px Pretendard')));
  await page.goto(`${url}/ai-agent-club-2026-fall/lectures/${slug}/index.html#slide=L01-S15`);
  await page.waitForFunction(()=>document.querySelectorAll('.block-video-card a').length===3);
  const links=await page.locator('.block-video-card a').count();
  check('deep link',links===3,`${links} video links; ${await page.locator('.slide-title').textContent()}`);
  const response=await page.request.get(`${url}/ai-agent-club-2026-fall/lectures/${slug}/deck.json`);
  const deckText=await response.text();
  check('student deck',response.ok()&&!deckText.includes('speakerNotes'));
  check('presenter excluded',(await page.request.get(`${url}/ai-agent-club-2026-fall/lectures/${slug}/presenter.html`)).status()===404);
  check('license notice',(await page.request.get(`${url}/ai-agent-club-2026-fall/licenses/PROJECT_POLICY.md`)).ok());
  await page.setViewportSize({width:390,height:844});await page.goto(`${url}/ai-agent-club-2026-fall/`);
  check('mobile portfolio',await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
  check('browser errors',errors.length===0,errors.join(' | '));
  await context.close();
 },'dist/public');
}catch(e){checks.push({name:'browser runtime',status:'BLOCKED',detail:e.message});}
const runId=new Date().toISOString().replace(/[:.]/g,'-'),out=path.join(root,'reports',runId);
fs.mkdirSync(out,{recursive:true});writeJson(path.join(out,'public-qa.json'),{runId,checks});
fs.writeFileSync(path.join(out,'public-qa-summary.md'),`# Public QA ${runId}\n\n${checks.map(c=>`- ${c.status} ${c.name}${c.detail?`: ${c.detail}`:''}`).join('\n')}\n`);
console.log(path.join(out,'public-qa-summary.md'));
if(checks.some(c=>c.status!=='PASS'))process.exitCode=1;
