#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const {pathToFileURL}=require('url');
function args(argv){
  const opt={};
  for(let i=0;i<argv.length;i++){
    if(['--force','--help'].includes(argv[i]))opt[argv[i].slice(2)]=true;
    else if(['--input','--browser','--executable'].includes(argv[i])&&argv[i+1]&&!argv[i+1].startsWith('--'))opt[argv[i++].slice(2)]=argv[i];
    else throw Error('Argumento desconhecido ou sem valor: '+argv[i]);
  }
  return opt;
}
async function main(){
  const opt=args(process.argv.slice(2));
  if(opt.help)return console.log('Uso: node render.cjs --input carrossel.html [--force] [--browser msedge|chrome] [--executable caminho-do-navegador]');
  const input=path.resolve(opt.input||path.join(__dirname,'carrossel.html'));
  if(!/\.html?$/i.test(input))throw Error('A entrada deve ser um arquivo HTML.');
  if(!fs.existsSync(input)||!fs.statSync(input).isFile())throw Error('HTML não encontrado: '+input);
  const out=fs.realpathSync(path.dirname(input));
  const installedSkill=path.resolve(__dirname,'..');
  if(fs.existsSync(path.join(installedSkill,'SKILL.md'))){const rel=path.relative(installedSkill,out);if(!rel||(!rel.startsWith('..'+path.sep)&&rel!=='..'&&!path.isAbsolute(rel)))throw Error('Renderize fora da pasta da skill.');}
  const imageDir=path.join(out,'instagram');
  if(fs.existsSync(imageDir)&&(!fs.statSync(imageDir).isDirectory()||fs.realpathSync(imageDir)!==path.join(out,'instagram')))throw Error('instagram deve ser uma pasta local, sem redirecionamento por link.');
  const names=['previa.png','visao-geral.png','validacao.json'];
  const oldSlides=fs.existsSync(imageDir)?fs.readdirSync(imageDir).filter(f=>/^slide-\d+\.png$/.test(f)):[];
  if([...names.map(f=>path.join(out,f)),...oldSlides.map(f=>path.join(imageDir,f))].some(f=>fs.existsSync(f)&&fs.lstatSync(f).isSymbolicLink()))throw Error('A saída contém arquivo redirecionado por link. Use uma pasta nova.');
  if(!opt.force&&(oldSlides.length||names.some(f=>fs.existsSync(path.join(out,f)))))throw Error('PNGs ou relatório já existem. Use outra pasta ou --force para substituir.');
  let chromium;
  try{({chromium}=require('playwright'));}catch{throw Error('Playwright não encontrado. Use uma instalação existente via NODE_PATH ou instale Playwright no ambiente de execução. Este script não instala dependências.');}
  const launch={headless:true};
  if(opt.executable)launch.executablePath=path.resolve(opt.executable);
  else if(opt.browser)launch.channel=opt.browser;
  else if(fs.existsSync(chromium.executablePath()))launch.executablePath=chromium.executablePath();
  else if(process.platform==='win32')launch.channel='msedge';
  else throw Error('Chromium do Playwright não encontrado. Informe --browser chrome ou --executable para um navegador já instalado.');
  let browser;
  try{browser=await chromium.launch(launch);}catch(e){throw Error('Não foi possível iniciar o navegador invisível. Verifique sua instalação e permissões do ambiente. '+e.message.split('\n')[0]);}
  try{
    const page=await browser.newPage({viewport:{width:1200,height:1450},deviceScaleFactor:1});
    await page.route('**/*',route=>/^https?:/.test(route.request().url())?route.abort():route.continue());
    await page.goto(pathToFileURL(input).href);
    await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(im=>im.decode()));});
    const result=await page.evaluate(()=>{
      const errors=[];
      const slides=[...document.querySelectorAll('.slide')];
      const box=el=>el.getBoundingClientRect();
      const overlap=(a,b)=>a.left<b.right-1&&a.right>b.left+1&&a.top<b.bottom-1&&a.bottom>b.top+1;
      if(slides.length<3||slides.length>12)errors.push('Quantidade de slides fora de 3–12.');
      slides.forEach((s,i)=>{
        const sr=box(s);const tag=`Slide ${i+1}`;
        if(sr.width!==1080||sr.height!==1350)errors.push(tag+': tamanho diferente de 1080×1350.');
        const card=s.querySelector('.tweet');const cr=box(card);
        if(cr.left<sr.left+40||cr.right>sr.right-40||cr.top<sr.top+220||cr.bottom>sr.bottom-125)errors.push(tag+': cartão excede a área segura; encurte o texto.');
        const brand=s.querySelector('.brand');const pager=s.querySelector('.page-counter');
        if(brand&&cr.top<box(brand).bottom+35)errors.push(tag+': cartão muito próximo da logo.');
        if(brand&&overlap(box(brand),box(pager)))errors.push(tag+': logo e contador sobrepostos.');
        s.querySelectorAll('h1,h2,p,.name,.handle,.brand,.page-counter').forEach(e=>{
          const r=box(e);
          if(r.left<sr.left||r.right>sr.right||r.top<sr.top||r.bottom>sr.bottom-100)errors.push(tag+': texto ou marca fora da arte.');
          if(e.scrollWidth>e.clientWidth+2)errors.push(tag+': conteúdo transbordando em '+e.className+' '+e.textContent.trim().slice(0,70));
        });
        const header=s.querySelector('.tweet-header');const identity=s.querySelector('.identity');const avatar=s.querySelector('.avatar');const more=s.querySelector('.more');
        if(overlap(box(identity),box(avatar))||overlap(box(identity),box(more)))errors.push(tag+': identidade sobreposta ao avatar/menu.');
        if(box(s.querySelector('.tweet-content')).top<box(header).bottom+20)errors.push(tag+': conteúdo próximo demais do cabeçalho.');
        const text=s.querySelector('h1,h2');const body=s.querySelector('.tweet-content p');
        if(body&&overlap(box(text),box(body)))errors.push(tag+': título e corpo sobrepostos.');
        const content=s.querySelector('.tweet-content');const actions=s.querySelector('.actions');
        if(box(content).bottom>box(actions).top)errors.push(tag+': conteúdo sobreposto aos ícones.');
      });
      const expectedFont=document.documentElement.dataset.font||'Arial';
      const fontLoaded=expectedFont!=='Inter'||['400 39px Inter','600 45px Inter','700 34px Inter'].every(f=>document.fonts.check(f));
      if(!fontLoaded)errors.push('A fonte Inter não carregou.');
      return {ok:errors.length===0,slideCount:slides.length,width:1080,height:1350,font:expectedFont,fontLoaded,errors};
    });
    fs.writeFileSync(path.join(out,'validacao.json'),JSON.stringify(result,null,2)+'\n');
    if(!result.ok)throw Error(result.errors.join('\n'));
    fs.mkdirSync(imageDir,{recursive:true});
    for(let i=0;i<result.slideCount;i++)await page.locator('.slide').nth(i).screenshot({path:path.join(imageDir,`slide-${String(i+1).padStart(2,'0')}.png`)});
    for(const name of oldSlides){const n=Number(name.match(/\d+/)[0]);if(n<1||n>result.slideCount)fs.unlinkSync(path.join(imageDir,name));}
    const html=await page.content();
    async function preview(indices,file,columns,scale){
      await page.setContent(html);
      await page.evaluate(({indices,columns,scale})=>{
        const all=[...document.querySelectorAll('.slide')];const main=document.querySelector('main');main.innerHTML='';
        main.style.cssText=`display:grid;grid-template-columns:repeat(${columns},${1080*scale}px);gap:22px;padding:28px;background:#dce2e7;width:max-content;align-items:start`;
        indices.forEach(i=>{const frame=document.createElement('div');frame.style.cssText=`position:relative;width:${1080*scale}px;height:${1350*scale}px;overflow:hidden`;all[i].style.cssText=`transform:scale(${scale});transform-origin:top left`;frame.append(all[i]);main.append(frame);});
      },{indices,columns,scale});
      await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(im=>im.decode()));});
      await page.locator('main').screenshot({path:path.join(out,file)});
    }
    await preview([0,1,result.slideCount-1],'previa.png',3,.45);
    await preview(Array.from({length:result.slideCount},(_,i)=>i),'visao-geral.png',3,1/3);
    console.log(JSON.stringify(result));
    console.log('PNGs, prévias e validacao.json salvos em '+out);
  }finally{await browser.close();}
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
