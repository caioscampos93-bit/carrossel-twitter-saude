#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const skillDir = path.resolve(__dirname, '..');
const assetsDir = path.join(skillDir, 'assets');
const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lines = text => escape(text).replace(/\r?\n/g, '<br>');
const isWithin = (parent, child) => { const rel = path.relative(parent, child); return !rel || (!rel.startsWith('..'+path.sep) && rel !== '..' && !path.isAbsolute(rel)); };
function canonical(p) {
  p = path.resolve(p);
  if (fs.existsSync(p)) return fs.realpathSync(p);
  return path.join(canonical(path.dirname(p)), path.basename(p));
}
function args(argv) {
  const result = {};
  for (let i=0; i<argv.length; i++) {
    if (['--force','--help'].includes(argv[i])) result[argv[i].slice(2)] = true;
    else if (['--input','--output'].includes(argv[i]) && argv[i+1] && !argv[i+1].startsWith('--')) result[argv[i++].slice(2)] = argv[i];
    else throw Error('Argumento desconhecido ou sem valor: '+argv[i]);
  }
  return result;
}
function string(value, name, optional=false) {
  if (optional && value == null) return '';
  if (typeof value !== 'string' || (!optional && !value.trim())) throw Error(name+' deve ser texto'+(optional?'':' não vazio')+'.');
  return value;
}
function imageData(value, base, name) {
  if (!value) return null;
  string(value, name);
  if (/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=\s]+$/.test(value)) return value;
  const imagePath = path.resolve(base, value);
  const mime = {'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'}[path.extname(imagePath).toLowerCase()];
  if (!mime) throw Error(name+' deve ser PNG, JPG ou WebP local (ou data URI desses formatos).');
  if (!fs.existsSync(imagePath) || !fs.statSync(imagePath).isFile()) throw Error(name+' não encontrado: '+imagePath);
  return `data:${mime};base64,${fs.readFileSync(imagePath).toString('base64')}`;
}
const iconPaths = [
  '<path d="M20 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-1 1v-9.5A8.5 8.5 0 1 1 20 11.5Z"/>',
  '<path d="m4 8 4-4 4 4M8 4v12a3 3 0 0 0 3 3h3m6-3-4 4-4-4m4 4V8a3 3 0 0 0-3-3h-3"/>',
  '<path d="M20.6 4.8a5.5 5.5 0 0 0-7.8 0L12 5.6l-.8-.8a5.5 5.5 0 0 0-7.8 7.8L12 21l8.6-8.4a5.5 5.5 0 0 0 0-7.8Z"/>',
  '<path d="M6 3h12v18l-6-4-6 4V3Z"/>',
  '<path d="M12 15V3m-4 4 4-4 4 4M5 13v7h14v-7"/>'
];
const icons = iconPaths.map(p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`).join('');
function main() {
  const opt = args(process.argv.slice(2));
  if (opt.help) return console.log('Uso: node generate.cjs --input conteudo.json --output pasta-de-saida [--force]');
  if (!opt.input || !opt.output) throw Error('Informe --input <JSON> e --output <pasta>.');
  const inputPath = canonical(opt.input);
  const output = canonical(opt.output);
  const canonicalSkill = canonical(skillDir);
  if (isWithin(canonicalSkill, output) || isWithin(output, canonicalSkill)) throw Error('A saída não pode ser a pasta da skill, um ancestral dela, nem uma subpasta dela.');
  if (fs.existsSync(output) && !fs.statSync(output).isDirectory()) throw Error('A saída deve ser uma pasta.');
  const filenames = ['carrossel.html','texto.md','legenda.md','conteudo.json','render.js'];
  if (filenames.some(f => fs.existsSync(path.join(output,f)) && fs.lstatSync(path.join(output,f)).isSymbolicLink())) throw Error('A saída contém arquivo redirecionado por link. Use uma pasta nova.');
  if (filenames.some(f => canonical(path.join(output, f)) === inputPath)) throw Error('A saída substituiria o arquivo de entrada. Use outra pasta.');
  if (!opt.force && filenames.some(f => fs.existsSync(path.join(output,f)))) throw Error('A saída já contém entregáveis. Use outra pasta ou --force para substituir.');
  const input = JSON.parse(fs.readFileSync(inputPath,'utf8').replace(/^\uFEFF/,''));
  const title = string(input.title,'title');
  const caption = string(input.caption,'caption');
  if (!Array.isArray(input.slides) || input.slides.length<3 || input.slides.length>12) throw Error('slides deve conter de 3 a 12 itens.');
  const slides = input.slides.map((s,i) => {
    if (!s || !['cover','content','closing'].includes(s.type)) throw Error(`slides[${i}].type deve ser cover, content ou closing.`);
    return {type:s.type,title:string(s.title,`slides[${i}].title`),body:string(s.body,`slides[${i}].body`,true)};
  });
  if (slides[0].type !== 'cover' || slides.at(-1).type !== 'closing' || slides.slice(1,-1).some(s => s.type !== 'content')) throw Error('Use capa primeiro, conteúdo no meio e fechamento no final.');
  const defaults = JSON.parse(fs.readFileSync(path.join(assetsDir,'brand.json'),'utf8').replace(/^\uFEFF/,''));
  if (input.brand != null && (typeof input.brand !== 'object' || Array.isArray(input.brand))) throw Error('brand deve ser um objeto.');
  const custom = input.brand || {};
  const brand = {...defaults,...custom};
  const changedIdentity = brand.displayName !== defaults.displayName || brand.handle !== defaults.handle;
  if (changedIdentity) for (const key of ['logo','portrait']) if (!Object.hasOwn(custom,key)) brand[key] = null;
  string(brand.displayName,'brand.displayName'); string(brand.handle,'brand.handle');
  if (!/^#[\da-f]{6}$/i.test(brand.background)) throw Error('brand.background deve ser uma cor hexadecimal com 6 dígitos.');
  if (!['image','instagram-screenshot'].includes(brand.portraitMode || 'image')) throw Error('portraitMode deve ser image ou instagram-screenshot.');
  for (const key of ['logo','portrait']) brand[key] = imageData(brand[key],Object.hasOwn(custom,key)?path.dirname(inputPath):assetsDir,'brand.'+key);
  if (Object.hasOwn(custom,'portrait') && !Object.hasOwn(custom,'portraitMode')) brand.portraitMode = 'image';
  const fontPath = path.join(assetsDir,'fonts.css');
  const fonts = fs.existsSync(fontPath) ? fs.readFileSync(fontPath,'utf8') : '';
  if (!fonts) console.warn('Aviso: assets/fonts.css ausente; será usada Arial.');
  const css = fs.readFileSync(path.join(assetsDir,'template.css'),'utf8');
  const initials = brand.displayName.split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0]).join('');
  const photo = brand.portrait ? `<img class="portrait ${brand.portraitMode==='instagram-screenshot'?'screenshot-crop':''}" src="${brand.portrait}" alt="Foto de ${escape(brand.displayName)}">` : `<span class="initials">${escape(initials)}</span>`;
  const markup = slides.map((s,i)=>{
    const waveId='waves-'+i;
    const waves=`<svg class="backdrop" viewBox="0 0 1080 1350" aria-hidden="true"><defs><pattern id="${waveId}" width="420" height="640" patternUnits="userSpaceOnUse" patternTransform="rotate(-15)"><path d="M0 0C105 0 105 320 210 320S315 0 420 0V320C315 320 315 640 210 640S105 320 0 320Z" fill="#70b2dd" fill-opacity=".095"/></pattern></defs><path fill="url(#${waveId})" d="M0 0h1080v1350H0z"/></svg>`;
    return `<div class="slide ${s.type}" aria-label="Slide ${i+1}">${waves}${brand.logo?`<div class="brand"><img src="${brand.logo}" alt="Logo de ${escape(brand.displayName)}"></div>`:''}<div class="page-counter">${String(i+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}</div><article class="tweet"><header class="tweet-header"><div class="avatar">${photo}</div><div class="identity"><div class="name">${escape(brand.displayName)}</div><div class="handle">${escape(brand.handle)}</div></div><div class="more" aria-hidden="true"><span></span><span></span><span></span></div></header><div class="tweet-content"><${i?'h2':'h1'}>${lines(s.title)}</${i?'h2':'h1'}>${s.body?`<p class="${s.type==='closing'?'cta':''}">${lines(s.body)}</p>`:''}</div><div class="actions" aria-hidden="true">${icons}</div></article><div class="pagination" aria-hidden="true">${slides.map((_,j)=>`<i class="${j===i?'active':''}"></i>`).join('')}</div></div>`;
  }).join('\n');
  const html=`<!doctype html><html lang="pt-BR" data-font="${fonts?'Inter':'Arial'}"><head><meta charset="utf-8"><meta name="viewport" content="width=1080"><title>${escape(title)}</title><style>${fonts}\n${css}\n:root{--background:${brand.background};}</style></head><body><main>${markup}</main></body></html>`;
  const normalized = {title,caption,slides,brand};
  fs.mkdirSync(output,{recursive:true});
  fs.writeFileSync(path.join(output,'carrossel.html'),html);
  fs.writeFileSync(path.join(output,'texto.md'),`# ${title}\n\n`+slides.map((s,i)=>`## Slide ${i+1}\n\n${s.title}\n\n${s.body}`).join('\n\n')+'\n');
  fs.writeFileSync(path.join(output,'legenda.md'),caption.trim()+'\n');
  fs.writeFileSync(path.join(output,'conteudo.json'),JSON.stringify(normalized,null,2)+'\n');
  fs.copyFileSync(path.join(__dirname,'render.cjs'),path.join(output,'render.js'));
  console.log(`Criados ${slides.length} slides editáveis em ${output}`);
  console.log('Exporte os PNGs com: node render.js --input carrossel.html (dentro da pasta de saída).');
}
try { main(); } catch(error) { console.error(error.message); process.exitCode=1; }
