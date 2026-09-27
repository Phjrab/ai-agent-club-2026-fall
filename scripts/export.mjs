import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {PDFDocument} from 'pdf-lib';
import pptxgen from 'pptxgenjs';
import {root,config,selectLecture,loadLecture,contentDigest,sha,writeJson} from './lib.mjs';
import {withBrowser} from './browser.mjs';

const args=process.argv.slice(2);if(args.includes('--help')){console.log('사용법: npm run export -- --lecture <slug> [--term <term>]');process.exit(0)}
const opt=(k,f)=>{const i=args.indexOf(k);return i<0?f:args[i+1]};
const slug=opt('--lecture','01-agent-ai-intro'),dir=selectLecture(slug,opt('--term'));
if(config.standaloneSpeakerScript!==false)throw new Error('별도 발표 대본 생성은 현재 프로젝트 설정에서 지원하지 않습니다');
const data=loadLecture(dir),deck=data.deck;
const out=path.join(root,'exports',deck.term,slug,deck.revision);fs.mkdirSync(out,{recursive:true});
fs.rmSync(path.join(out,'speaker-script.docx'),{force:true});
execFileSync('npm',['run','build'],{cwd:root,stdio:'inherit'});
const pngDir=path.join(out,'slide-png');fs.rmSync(pngDir,{recursive:true,force:true});fs.mkdirSync(pngDir,{recursive:true});
const images=[];
await withBrowser(async({browser,url})=>{
 const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 await page.goto(`${url}/lectures/${slug}/index.html?export=1`);await page.waitForFunction(()=>window.__PRESENTATION_READY__===true);
 for(const s of deck.slides){await page.evaluate(id=>window.presentation.goTo(id),s.id);await page.evaluate(id=>window.presentation.slideReady(id),s.id);const file=path.join(pngDir,`${s.id}.png`);await page.locator('.slide').screenshot({path:file});images.push(file)}
 await page.close();
});
const pdf=await PDFDocument.create();for(const file of images){const bytes=fs.readFileSync(file),img=await pdf.embedPng(bytes),p=pdf.addPage([960,540]);p.drawImage(img,{x:0,y:0,width:960,height:540})}const pdfFile=path.join(out,'slides.pdf');fs.writeFileSync(pdfFile,await pdf.save());
const pptx=new pptxgen();pptx.layout='LAYOUT_WIDE';pptx.author='AI Agent Club';pptx.subject='Visual compatibility deck';pptx.title=deck.title;
deck.slides.forEach((s,i)=>{const slide=pptx.addSlide();slide.background={color:'FFFFFF'};slide.addImage({path:images[i],x:0,y:0,w:13.333333,h:7.5});slide.addNotes(s.speakerNotes?.say||'')});const pptxFile=path.join(out,'slides.visual.pptx');await pptx.writeFile({fileName:pptxFile});
const htmlDir=path.join(out,'html');fs.rmSync(htmlDir,{recursive:true,force:true});fs.cpSync(path.join(root,'dist','private'),htmlDir,{recursive:true});
const files=[['PDF',pdfFile],['PPTX visual',pptxFile]];const manifest={lecture:slug,revision:deck.revision,contentDigest:contentDigest(data),sourceCommit:(()=>{try{return execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim()}catch{return null}})(),slideCount:deck.slides.length,mainCount:deck.slides.filter(s=>s.kind==='main').length,files:files.map(([format,file])=>({format,file:path.relative(out,file),bytes:fs.statSync(file).size,sha256:sha(fs.readFileSync(file))})),htmlPackage:'html/',qa:{pdfPageCount:'NOT_RUN',pptxVisual:'NOT_RUN'}};
const {PDFDocument:ReadPdf}=await import('pdf-lib');const loaded=await ReadPdf.load(fs.readFileSync(pdfFile));manifest.qa.pdfPageCount=loaded.getPageCount()===images.length?'PASS':'FAIL';
writeJson(path.join(out,'manifest.json'),manifest);console.log(path.join(out,'manifest.json'));if(manifest.qa.pdfPageCount!=='PASS')process.exitCode=1;
