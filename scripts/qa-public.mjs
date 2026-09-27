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
  await page.waitForSelector('.portfolio header');
  const cardCount=await page.locator('.card').count();
  if(cardCount===1&&(await page.locator('.card .tag').textContent())==='공개 전 검토 중'){
   check('unapproved lecture excluded',await page.locator('.card a').count()===0);
   check('editorial cover uses solid ink',await page.evaluate(()=>getComputedStyle(document.querySelector('.portfolio header'),'::before').backgroundImage==='none'));
   check('presenter excluded',(await page.request.get(`${url}/ai-agent-club-2026-fall/lectures/${slug}/presenter.html`)).status()===404);
   await page.setViewportSize({width:390,height:844});check('mobile portfolio',await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
   check('browser errors',errors.length===0,errors.join(' | '));await context.close();return;
  }
  const publicPortfolio=await (await page.request.get(`${url}/ai-agent-club-2026-fall/portfolio.json`)).json();
  check('portfolio card',await page.locator('.card .card-links a').count()===1+Object.keys(publicPortfolio.cards[0]?.downloads||{}).length);
  check('editorial cover uses solid ink',await page.evaluate(()=>getComputedStyle(document.querySelector('.portfolio header'),'::before').backgroundImage==='none'));
  for(const [format,href] of Object.entries(publicPortfolio.cards[0]?.downloads||{}))check(`${format} download`,(await page.request.get(`${url}/ai-agent-club-2026-fall/${href.replace(/^\.\//,'')}`)).ok());
  check('public draft label',(await page.locator('.card .tag').textContent())==='공개 초안');
  await page.getByRole('link',{name:'슬라이드 보기'}).click();
  await page.waitForFunction(()=>window.__PRESENTATION_READY__===true);
  const publicDeckResponse=await page.request.get(`${url}/ai-agent-club-2026-fall/lectures/${slug}/deck.json`),publicDeck=await publicDeckResponse.json();
  const screenshotSlides=publicDeck.slides.filter(s=>s.layout==='screenshot');
  check('presentation pages',(await page.evaluate(()=>window.presentation.getManifest().slides.length))===publicDeck.slides.length,`${publicDeck.slides.filter(s=>s.kind==='main').length}장 본편 + ${publicDeck.slides.filter(s=>s.kind==='qa').length}장 Q&A`);
  check('pricing screenshot order',screenshotSlides.map(s=>s.blocks?.find(b=>b.type==='figure')?.assetId).join(',')==='pricing-chatgpt,pricing-claude,pricing-google',screenshotSlides.map(s=>s.id).join(' → '));
  for(const s of screenshotSlides){
   await page.evaluate(id=>window.presentation.goTo(id),s.id);
   const asset=publicDeck.assets.find(a=>a.id===s.blocks.find(b=>b.type==='figure').assetId);
   const frame=await page.evaluate(()=>{const slide=document.querySelector('.slide'),figure=slide.querySelector('.block-figure'),img=figure?.querySelector('img'),a=figure?.getBoundingClientRect(),b=slide.getBoundingClientRect(),margin=b.width/1920*20;return {images:slide.querySelectorAll('.block-figure img').length,naturalWidth:img?.naturalWidth,naturalHeight:img?.naturalHeight,objectFit:img?getComputedStyle(img).objectFit:null,fullFrame:a&&Math.abs(a.left-b.left)<1&&Math.abs(a.top-b.top)<1&&Math.abs(a.width-b.width)<1&&Math.abs(a.height-b.height)<1,insetFrame:a&&a.left>=b.left+margin&&a.top>=b.top+margin&&a.right<=b.right-margin&&a.bottom<=b.bottom-margin}});
   check(`original screenshot ${s.id}`,frame.images===1&&frame.naturalWidth===asset.width&&frame.naturalHeight===asset.height&&frame.objectFit==='contain'&&(s.screenshotInset?frame.insetFrame:frame.fullFrame),JSON.stringify(frame));
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
