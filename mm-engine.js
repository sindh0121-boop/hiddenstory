(function(){ if (window.__mmEngine) return; window.__mmEngine = 1;

// 모바일 안정화: 위로 스크롤할 때 주소창이 나타나며 창 높이가 바뀌어도 화면이 다시 배치되거나 튀지 않게 한다
(function mobileStable(){
  const touch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window; if (!touch) return;
  const de = document.documentElement; de.style.overscrollBehaviorY = 'none'; document.body && (document.body.style.overscrollBehaviorY = 'none');
  const desc = Object.getOwnPropertyDescriptor(window, 'innerHeight') || Object.getOwnPropertyDescriptor(Window.prototype, 'innerHeight');
  const rawH = () => desc && desc.get ? desc.get.call(window) : de.clientHeight;
  let w0 = innerWidth, H = Math.max(rawH(), de.clientHeight);
  try { Object.defineProperty(window, 'innerHeight', {configurable: true, get: () => H}); } catch(e){}
  const dsc = Object.getOwnPropertyDescriptor(window, 'scrollY') || Object.getOwnPropertyDescriptor(Window.prototype, 'scrollY');
  if (dsc && dsc.get){ try { Object.defineProperty(window, 'scrollY', {configurable: true, get: () => Math.max(0, dsc.get.call(window))}); } catch(e){} }
  window.addEventListener('resize', e => { if (!e.isTrusted) return; const w = innerWidth, h = rawH();
    if (Math.abs(w - w0) < 2 && Math.abs(h - H) < 200){ if (h > H) H = h; e.stopImmediatePropagation(); return; }
    w0 = w; H = h; }, true);
  window.addEventListener('orientationchange', () => setTimeout(() => { w0 = innerWidth; H = rawH(); window.dispatchEvent(new Event('resize')); }, 250));
})();

/* ==========================================================
   1. 프레임 생성기 — 흑백 명암 합성 → 하프톤 → 오버프린트
   (영상·실사가 오면 같은 파이프라인으로 첫·끝 프레임을 만든다)
   ========================================================== */
const FW = 800, FH = 500;
function lum(ctx, fn){ fn(ctx); }
const g = v => { const c = Math.round(255 * Math.max(0, Math.min(1, v))); return 'rgb(' + c + ',' + c + ',' + c + ')'; };
function grad(ctx, y0, y1, stops){ const gr = ctx.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, v]) => gr.addColorStop(o, g(v))); return gr; }
function radial(ctx, x, y, r, stops){ const gr = ctx.createRadialGradient(x, y, 0, x, y, r); stops.forEach(([o, v]) => gr.addColorStop(o, g(v))); return gr; }
function fill(ctx, style){ ctx.fillStyle = style; ctx.fillRect(0, 0, FW, FH); }
function waves(ctx, y0, y1, amp, freq, base, contrast){
  for (let y = y0; y < y1; y += 2){
    const t = (y - y0) / (y1 - y0);
    for (let x = 0; x < FW; x += 4){
      const v = base + contrast * (Math.sin(x * freq * (1 + t*2) + y * .35) * .5 + Math.sin(x * freq * .37 + y * .11) * .5) * amp * (0.35 + t);
      ctx.fillStyle = g(v); ctx.fillRect(x, y, 4, 2);
    }
  }
}
function ripples(ctx, cx, cy, base, contrast, k){
  for (let y = 0; y < FH; y += 3) for (let x = 0; x < FW; x += 3){
    const d = Math.hypot(x - cx, (y - cy) * 1.15);
    const v = base + contrast * Math.sin(d * k - Math.atan2(y - cy, x - cx) * 2.5) * Math.exp(-d / 520);
    ctx.fillStyle = g(v); ctx.fillRect(x, y, 3, 3);
  }
}
function silhouette(ctx, cx, bottom, w, h, v){
  ctx.fillStyle = g(v); ctx.beginPath();
  ctx.moveTo(cx - w/2, bottom); ctx.lineTo(cx - w/2, bottom - h*.55); ctx.quadraticCurveTo(cx - w*.42, bottom - h*.72, cx - w*.2, bottom - h*.74);
  ctx.quadraticCurveTo(cx - w*.24, bottom - h*1.02, cx, bottom - h*1.05); ctx.quadraticCurveTo(cx + w*.24, bottom - h*1.02, cx + w*.2, bottom - h*.74);
  ctx.quadraticCurveTo(cx + w*.42, bottom - h*.72, cx + w/2, bottom - h*.55); ctx.lineTo(cx + w/2, bottom); ctx.closePath(); ctx.fill();
}
function paperGrain(ctx, amt){ for (let i = 0; i < 9000 * amt; i++){ const x = Math.random()*FW, y = Math.random()*FH; ctx.fillStyle = 'rgba(0,0,0,' + (Math.random()*.25) + ')'; ctx.fillRect(x, y, 1.5, 1.5); } }

const COMPOSE = {
  'sea-dusk': c => { fill(c, grad(c, 0, FH, [[0,.10],[.38,.42],[.46,.62],[.47,.12],[1,.05]])); waves(c, FH*.47, FH, .16, .05, .16, 1); c.fillStyle = radial(c, FW*.5, FH*.47, 220, [[0,.95],[.35,.45],[1,.12]]); c.globalAlpha=.9; c.beginPath(); c.ellipse(FW*.5, FH*.66, 110, 210, 0, 0, Math.PI*2); c.fill(); c.globalAlpha=1; },
  'sea-dawn': c => { fill(c, grad(c, 0, FH, [[0,.62],[.4,.86],[.47,.30],[1,.08]])); waves(c, FH*.47, FH, .14, .05, .22, 1); c.fillStyle = radial(c, FW*.5, FH*.47, 260, [[0,.98],[.4,.5],[1,.2]]); c.beginPath(); c.ellipse(FW*.5, FH*.68, 150, 240, 0, 0, Math.PI*2); c.fill(); },
  'board-empty': c => { fill(c, radial(c, FW*.5, FH*.45, 700, [[0,.22],[1,.03]])); c.fillStyle = g(.14); c.fillRect(FW*.12, FH*.16, FW*.76, FH*.62); c.strokeStyle = g(.5); c.lineWidth = 3; c.strokeRect(FW*.12, FH*.16, FW*.76, FH*.62); },
  'board-full': c => { COMPOSE['board-empty'](c); [[.16,.2],[.3,.44],[.46,.19],[.63,.5],[.24,.6],[.72,.24],[.56,.62]].forEach(([x,y],i)=>{ c.save(); c.translate(FW*x, FH*y); c.rotate((i%3-1)*.06); c.fillStyle = g(.95); c.fillRect(0,0,110,132); c.fillStyle = radial(c,55,52,60,[[0,.55],[1,.15]]); c.fillRect(8,8,94,96); c.fillStyle=g(.05); c.beginPath(); c.arc(55,4,4,0,7); c.fill(); c.restore(); }); },
  'room-far': c => { fill(c, radial(c, FW*.5, FH*.55, 620, [[0,.38],[.6,.14],[1,.02]])); c.fillStyle = g(.2); c.fillRect(FW*.08, FH*.12, FW*.3, FH*.5); silhouette(c, FW*.5, FH, 190, 300, .03); },
  'room-near': c => { fill(c, radial(c, FW*.5, FH*.4, 560, [[0,.42],[.55,.12],[1,.02]])); silhouette(c, FW*.5, FH*1.08, 440, 560, .04); c.fillStyle = radial(c, FW*.46, FH*.42, 90, [[0,.22],[1,.04]]); c.beginPath(); c.ellipse(FW*.5, FH*.42, 120, 150, 0, 0, 7); c.fill(); },
  'docs': c => { fill(c, grad(c, 0, FH, [[0,.9],[1,.62]])); c.save(); c.translate(FW*.5, FH*.55); c.rotate(-.1); c.fillStyle = g(.2); c.fillRect(-300, -190, 600, 400); c.fillStyle = g(.97); c.fillRect(-290, -200, 600, 400); c.fillStyle = g(.35); for (let i=0;i<14;i++) c.fillRect(-250, -160 + i*26, 380 + (i%3)*60, 4); c.restore(); paperGrain(c, 1); },
  'road': c => { fill(c, grad(c, 0, FH, [[0,.8],[.4,.7],[.42,.2],[1,.1]])); c.fillStyle = g(.85); for (let i=0;i<7;i++){ const t=i/7; c.fillRect(FW*.5 - 6 - t*10, FH*.42 + t*t*FH*.58, 12 + t*20, 24 + t*30); } c.fillStyle = radial(c, FW*.5, FH*.42, 240, [[0,.95],[1,.3]]); c.globalAlpha=.6; c.fillRect(FW*.3, FH*.3, FW*.4, FH*.14); c.globalAlpha=1; },
  'filming': c => { fill(c, radial(c, FW*.4, FH*.55, 640, [[0,.4],[1,.03]])); silhouette(c, FW*.3, FH*1.02, 260, 420, .04); silhouette(c, FW*.66, FH, 220, 330, .08); c.fillStyle = g(.5); c.fillRect(FW*.34, FH*.36, 40, 26); },
  'file': c => { fill(c, grad(c, 0, FH, [[0,.86],[1,.6]])); c.fillStyle = g(.97); c.fillRect(FW*.2, FH*.1, FW*.6, FH*.9); c.fillStyle = g(.3); for (let i=0;i<18;i++) c.fillRect(FW*.24, FH*.16 + i*24, FW*.3 + (i*37)%180, 3); c.fillStyle = g(.6); c.fillRect(FW*.22, FH*.13, 36, 36); paperGrain(c, 1); },
  'elder': c => { fill(c, radial(c, FW*.55, FH*.5, 600, [[0,.45],[.6,.15],[1,.03]])); silhouette(c, FW*.58, FH*1.04, 380, 520, .05); c.fillStyle = g(.55); c.beginPath(); c.ellipse(FW*.4, FH*.62, 60, 34, -.5, 0, 7); c.fill(); },
  'map': c => { fill(c, radial(c, FW*.5, FH*.5, 700, [[0,.2],[1,.04]])); c.fillStyle = g(.86); c.beginPath(); [[.12,.36],[.3,.2],[.55,.26],[.78,.14],[.9,.44],[.76,.72],[.58,.88],[.34,.8],[.15,.64]].forEach(([x,y],i)=> i? c.lineTo(FW*x,FH*y) : c.moveTo(FW*x,FH*y)); c.closePath(); c.fill(); [[.28,.42],[.5,.36],[.66,.54],[.42,.66]].forEach(([x,y])=>{ c.fillStyle=g(.98); c.fillRect(FW*x-46,FH*y-52,92,104); c.fillStyle=g(.25); c.fillRect(FW*x-38,FH*y-44,76,72); }); },
  'cemetery': c => { fill(c, grad(c, 0, FH, [[0,.9],[.34,.72],[.36,.45],[1,.22]])); c.fillStyle = g(.32); for (let i=0;i<9;i++){ const x = 60 + i*105 + (i%2)*30, y = FH*.5 + (i%3)*60; c.beginPath(); c.ellipse(x, y, 70, 32, 0, Math.PI, 0); c.fill(); } },
  'path': c => { fill(c, grad(c, 0, FH, [[0,.12],[.5,.3],[1,.06]])); c.fillStyle = g(.4); for (let i=0;i<260;i++){ const x=Math.random()*FW, y=FH*.35+Math.random()*FH*.65; c.fillRect(x, y, 2, 30 + Math.random()*60); } silhouette(c, FW*.5, FH*1.02, 220, 360, .03); },
  'house-out': c => { fill(c, grad(c, 0, FH, [[0,.85],[.36,.7],[.38,.28],[1,.14]])); c.fillStyle = g(.2); c.fillRect(FW*.28, FH*.3, FW*.44, FH*.44); c.fillStyle = g(.12); c.beginPath(); c.moveTo(FW*.24, FH*.32); c.lineTo(FW*.5, FH*.14); c.lineTo(FW*.76, FH*.32); c.closePath(); c.fill(); c.fillStyle = g(.03); c.fillRect(FW*.46, FH*.42, FW*.08, FH*.32); },
  'house-in': c => { fill(c, radial(c, FW*.5, FH*.6, 620, [[0,.3],[.5,.1],[1,.02]])); c.fillStyle = g(.28); c.fillRect(FW*.26, FH*.48, FW*.48, FH*.2); c.fillStyle = g(.5); c.fillRect(FW*.26, FH*.46, FW*.48, 6); c.fillRect(FW*.3, FH*.3, FW*.4, 4); c.fillStyle = g(.38); c.beginPath(); c.moveTo(FW*.3, FH*.48); c.lineTo(FW*.5, FH*.3); c.lineTo(FW*.7, FH*.48); c.closePath(); c.fill(); },
  'monitor': c => { fill(c, g(.02)); c.fillStyle = g(.6); c.fillRect(FW*.23, FH*.28, FW*.54, FH*.42); c.save(); c.beginPath(); c.rect(FW*.24, FH*.29, FW*.52, FH*.4); c.clip(); ripples(c, FW*.5, FH*.5, .45, .3, .09); c.restore(); },
  'eye': c => { ripples(c, FW*.58, FH*.5, .42, .5, .05); c.fillStyle = radial(c, FW*.58, FH*.5, 70, [[0,.0],[.7,.02],[.75,.6],[1,.2]]); c.beginPath(); c.arc(FW*.58, FH*.5, 70, 0, 7); c.fill(); },
  'sangyeo': c => { fill(c, grad(c, 0, FH, [[0,.95],[1,.8]])); c.fillStyle = g(.15); c.beginPath(); c.moveTo(FW*.2, FH*.7); c.lineTo(FW*.27, FH*.5); c.lineTo(FW*.5, FH*.34); c.lineTo(FW*.73, FH*.5); c.lineTo(FW*.8, FH*.7); c.closePath(); c.fill(); c.fillStyle = g(.3); for (let i=0;i<8;i++) c.fillRect(FW*.2 + i*FW*.08, FH*.7, 14, FH*.22); c.fillStyle = g(.5); c.fillRect(FW*.18, FH*.66, FW*.64, 10); paperGrain(c, 1.2); },
  'sajabap': c => { fill(c, grad(c, 0, FH, [[0,.92],[1,.74]])); for (let i=0;i<3;i++){ const x = FW*(.3 + i*.2); c.fillStyle = g(.18); c.beginPath(); c.ellipse(x, FH*.62, 62, 22, 0, 0, 7); c.fill(); c.fillStyle = g(.3); c.fillRect(x-62, FH*.62, 124, 40); c.fillStyle = g(.85); c.beginPath(); c.ellipse(x, FH*.58, 40, 16, 0, 0, 7); c.fill(); } c.fillStyle = g(.45); c.fillRect(FW*.16, FH*.7, FW*.68, 8); paperGrain(c, 1.2); },
  'makgeolli': c => { fill(c, grad(c, 0, FH, [[0,.9],[1,.7]])); c.fillStyle = g(.22); c.beginPath(); c.ellipse(FW*.5, FH*.66, 130, 46, 0, 0, 7); c.fill(); c.fillStyle = g(.96); c.beginPath(); c.ellipse(FW*.5, FH*.62, 110, 34, 0, 0, 7); c.fill(); c.fillStyle = g(.9); c.fillRect(FW*.5-6, FH*.2, 12, FH*.4); c.fillStyle=g(.5); c.fillRect(FW*.5-40, FH*.72, 80, 14); paperGrain(c, 1.2); },
  'room-bare': c => { fill(c, radial(c, FW*.5, FH*.55, 620, [[0,.38],[.6,.14],[1,.02]])); c.fillStyle = g(.22); c.fillRect(FW*.08, FH*.12, FW*.3, FH*.5); c.fillStyle = g(.3); c.fillRect(FW*.225, FH*.12, 4, FH*.5); c.fillRect(FW*.08, FH*.36, FW*.3, 4); },
  'desk': c => { COMPOSE['room-bare'](c); c.fillStyle = g(.2); c.beginPath(); c.moveTo(0, FH); c.lineTo(FW*.12, FH*.62); c.lineTo(FW*.88, FH*.62); c.lineTo(FW, FH); c.closePath(); c.fill(); c.fillStyle = g(.32); c.fillRect(FW*.12, FH*.62, FW*.76, 4); },
  'gate': c => { fill(c, grad(c, 0, FH, [[0,.62],[.7,.78],[.72,.36],[1,.28]])); c.fillStyle = g(.15); c.fillRect(0, 0, FW, FH*.1); for (let i = 0; i < 20; i++){ c.beginPath(); c.arc(i*FW/19, FH*.1, FW/40, 0, Math.PI); c.fill(); } c.fillStyle = g(.2); c.fillRect(FW*.26, FH*.14, FW*.05, FH*.6); c.fillRect(FW*.69, FH*.14, FW*.05, FH*.6); c.fillStyle = g(.45); c.fillRect(FW*.31, FH*.2, FW*.38, FH*.52); c.strokeStyle = g(.3); c.lineWidth = 3; c.strokeRect(FW*.31, FH*.2, FW*.19, FH*.52); c.strokeRect(FW*.5, FH*.2, FW*.19, FH*.52); paperGrain(c, .8); },
  'wardrobe': c => { fill(c, g(.05)); c.fillStyle = radial(c, FW*.5, FH*.6, 380, [[0,.34],[1,.05]]); c.fillRect(FW*.14, FH*.08, FW*.72, FH*.84); c.strokeStyle = g(.2); c.lineWidth = 10; c.strokeRect(FW*.14, FH*.08, FW*.72, FH*.84); c.fillStyle = g(.16); c.fillRect(FW*.14, FH*.38, FW*.72, 8); [[.2,.16],[.36,.2],[.6,.14]].forEach(([x,w]) => { c.fillStyle = g(.22); c.fillRect(FW*x, FH*.2, FW*w, FH*.18); }); },
  'field-dawn': c => { fill(c, grad(c, 0, FH, [[0,.94],[.5,.82],[.52,.6],[1,.48]])); for (let i = 0; i < 900; i++){ const x = Math.random()*FW, y = FH*.52 + Math.random()*FH*.48, t = (y - FH*.52)/(FH*.48); c.fillStyle = g(.35 + Math.random()*.25); c.fillRect(x, y, 1 + t*2, 4 + t*18); } c.globalAlpha = .5; c.fillStyle = g(1); c.beginPath(); c.arc(FW*.7, FH*.38, 70, 0, 7); c.fill(); c.globalAlpha = 1; },
  'cairn': c => { const gr = c.createLinearGradient(0, 0, FW, 0); gr.addColorStop(0, g(.1)); gr.addColorStop(.45, g(.14)); gr.addColorStop(.55, g(.78)); gr.addColorStop(1, g(.86)); c.fillStyle = gr; c.fillRect(0, 0, FW, FH); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, FH*.72, FW, FH*.28); },
  'shore-road': c => { fill(c, grad(c, 0, FH, [[0,.9],[.3,.84],[.31,.38],[.44,.46],[.45,.62],[1,.5]])); waves(c, FH*.31, FH*.44, .12, .05, .42, .6); c.fillStyle = g(.3); [.51,.555,.6].forEach((x,i) => c.fillRect(FW*x, FH*.405 - i*3, 16, 10 + i*3)); c.fillStyle = g(.82); c.beginPath(); c.moveTo(FW*.3, FH); c.lineTo(FW*.47, FH*.45); c.lineTo(FW*.53, FH*.45); c.lineTo(FW*.75, FH); c.closePath(); c.fill(); for (let i = 0; i < 500; i++){ const x = Math.random()*FW, y = FH*.46 + Math.random()*FH*.54; c.fillStyle = g(.3 + Math.random()*.25); c.fillRect(x, y, 1.5, 3 + Math.random()*8); } },
  'hill': c => { fill(c, grad(c, 0, FH, [[0,.93],[.6,.84],[1,.72]])); c.fillStyle = g(.32); c.beginPath(); c.moveTo(0, FH*.72); c.quadraticCurveTo(FW*.25, FH*.42, FW*.5, FH*.5); c.quadraticCurveTo(FW*.75, FH*.58, FW, FH*.62); c.lineTo(FW, FH); c.lineTo(0, FH); c.closePath(); c.fill(); for (let i = 0; i < 700; i++){ const x = Math.random()*FW, y = FH*.55 + Math.random()*FH*.45; c.fillStyle = g(.18 + Math.random()*.2); c.beginPath(); c.arc(x, y, 1 + Math.random()*3, 0, 7); c.fill(); } c.fillStyle = g(.55); c.fillRect(0, FH*.86, FW, FH*.14); },
  'table-dark': c => { fill(c, g(.03)); c.fillStyle = radial(c, FW*.3, FH*.55, 280, [[0,.42],[.6,.12],[1,.03]]); c.fillRect(0, 0, FW, FH); c.fillStyle = g(.09); c.fillRect(0, FH*.9, FW, 3); },
  'mtn-path': c => { fill(c, grad(c, 0, FH, [[0,.8],[.35,.62],[1,.42]])); for (let i = 0; i < 120; i++){ const side = i % 2 ? 1 : -1, x = FW*.5 + side*(FW*.18 + Math.random()*FW*.35), h = FH*(.3 + Math.random()*.5); c.fillStyle = g(.1 + Math.random()*.15); c.fillRect(x, FH*.05 + Math.random()*FH*.2, 3 + Math.random()*6, h); } c.fillStyle = g(.85); c.beginPath(); c.moveTo(FW*.34, FH); c.quadraticCurveTo(FW*.46, FH*.6, FW*.48, FH*.3); c.lineTo(FW*.52, FH*.3); c.quadraticCurveTo(FW*.56, FH*.6, FW*.66, FH); c.closePath(); c.fill(); for (let i = 0; i < 400; i++){ c.fillStyle = g(.25 + Math.random()*.3); c.fillRect(Math.random()*FW, FH*.55 + Math.random()*FH*.45, 1.5, 4 + Math.random()*10); } },
  'black': c => { fill(c, g(.0)); }
};
const LIGHT = new Set(['shore-road','hill','field-dawn','gate','docs','file','sangyeo','sajabap','makgeolli','cemetery','road','house-out']);

function grainify(src, light){
  const out = document.createElement('canvas'); out.width = FW; out.height = FH; const o = out.getContext('2d');
  // 1) 흐림·번짐: 축소-확대 두 번 (Safari 호환, ctx.filter 불필요)
  const tiny = document.createElement('canvas'); tiny.width = FW/6|0; tiny.height = FH/6|0; const t = tiny.getContext('2d');
  t.drawImage(src, 0, 0, tiny.width, tiny.height);
  o.imageSmoothingEnabled = true; o.drawImage(tiny, 0, 0, FW, FH);
  o.globalAlpha = .55; o.drawImage(src, 0, 0);                 // 원본 디테일 55%
  o.globalAlpha = .22; o.drawImage(src, 2, 1);                 // 오버프린트: 어긋난 판
  o.globalAlpha = .18; o.drawImage(tiny, 0, 6, FW, FH);        // 세로 번짐
  o.globalAlpha = 1;
  // 2) 대비 + 그레인 (중간 명도에서 가장 거칠게)
  const img = o.getImageData(0, 0, FW, FH), d = img.data;
  for (let i = 0; i < d.length; i += 4){
    let L = d[i] / 255; L = (L - .5) * 1.35 + .5;
    const amp = .10 + .42 * (1 - Math.abs(2*L - 1));
    L += (Math.random() - .5) * amp;
    if (Math.random() < .012) L += (Math.random() - .5) * 1.2;   // 튀는 입자
    const v = Math.max(0, Math.min(255, Math.round(L * 255)));
    d[i] = d[i+1] = d[i+2] = v; d[i+3] = 255;
  }
  o.putImageData(img, 0, 0);
  if (light){ o.globalCompositeOperation = 'multiply'; o.fillStyle = '#f2efe9'; o.fillRect(0, 0, FW, FH); o.globalCompositeOperation = 'source-over'; }
  return out;
}
const FRAMES = {};
function frameImage(key){
  if (FRAMES[key]) return FRAMES[key];
  const src = document.createElement('canvas'); src.width = FW; src.height = FH;
  const c = src.getContext('2d'); c.fillStyle = '#000'; c.fillRect(0, 0, FW, FH);
  (COMPOSE[key] || COMPOSE.black)(c);
  FRAMES[key] = grainify(src, LIGHT.has(key)).toDataURL('image/jpeg', .9); return FRAMES[key];
}

/* ==========================================================
   2. 데이터 — 각본(1~3부)
   ========================================================== */
const S = (id, shot, fin, fout, vo, opt={}) => Object.assign({k:'scene', id, shot, fin, fout, vo}, opt);
const B = (type, fout, fin, opt={}) => Object.assign({k:'bridge', type, fout, fin}, opt);
const C = (title, fout, fin) => ({k:'chapter', title, fout, fin});
const items = [
  S('5-01','illu','room-bare','room-bare','',{label:'인터뷰 원경 → 근경', push:.28, lines:[{t:'조사하면서 전혀 예상하지 못했던 이야기도 있었습니다.'}],
    pups:[{c:'person', x:.5, y:1.03, h:.62, in:'up', at:.2, talk:1, sway:.5}]}),
  B('dissolve','room-bare','shore-road'),
  S('5-02','broll','shore-road','shore-road','',{label:'황도리 바다 → 마을 길 (고정)', lines:[{t:'일찍이 세상을 떠난 아이들은\n상여도, 장례도 없이 떠나보냈다고 합니다.'}]}),
  B('dissolve','shore-road','hill'),
  S('5-03','broll','hill','hill','',{label:'마을 뒤 산자락 원경 (고정)', lines:[{t:'그런 아이들은 마을과 떨어진 곳에 따로 묻었습니다. 어르신들은 그곳을 ‘애장터’라고 불렀습니다.'}]}),
  B('focus','hill','table-dark'),
  S('5-04','illu','table-dark','table-dark','',{label:'탑뷰 · 향로 연기 → 삼베 매듭', pan:.22, lines:[{t:'혼인을 하고 자식을 두어야 장례를 치뤄주던 시절이었습니다. 그러지 못한 아이들에게는 올려 줄 제사도 없었습니다. 그렇게 조용히 잊혀졌습니다.'}],
    pups:[{c:'censer', x:.3, y:.8, h:.34, in:'fade', at:0}, {c:'smoke', x:.3, y:.68, h:.62, in:'fade', at:.4, dur:2.4, sway:2.6, sf:.6}, {c:'knot', x:.92, y:.86, h:.28, in:'fade', at:.2, dim:1}]}),
  B('ink','table-dark','mtn-path'),
  S('5-05','broll','mtn-path','mtn-path','',{label:'이곡2리 산길 · 보따리 안은 뒷모습', place:'원북면 이곡2리', lines:[{t:'이곡2리에서도 아이가 세상을 떠나면\n부모가 애장터에 조용히 묻는 것이 보통이었습니다. 관례도, 혼례도 치르지 않은 아이에게\n상여를 내주는 것은 허락되지 않는 일이었으니까요.'}],
    pups:[{c:'walker', x:.5, y:1.02, h:.5, in:'recede', at:.3, dur:16, y2:.36, s2:.18}]}),
  B('dissolve','mtn-path','sangyeo'),
  S('5-06','illu','sangyeo','table-dark','',{label:'상여 뚜껑 장식 → 수레 위 삼베 매듭 · 종이 뚜껑 · 손', push:.12, foutChunk:1, lines:[{t:'그런데 그 규율을\n어기는 경우도 있었습니다. 상여는 꾸리지 못하니, 상여의 뚜껑만 수레에 얹어 아이를 보낸 겁니다. 상여는 고인을 보내는 산 사람들의 마음이니, 뚜껑 하나라도 얹어 보낸 것은 자식에게 무엇이라도 더 해 주고 싶었던 부모의 마음이었을 겁니다.'}],
    pups:[{c:'cart', x:.5, y:.96, h:.62, in:'fade', atChunk:1, at:.8}, {c:'knot', x:.5, y:.84, h:.3, in:'fade', atChunk:1, at:1.1}, {c:'lid', x:.5, y:.9, h:.5, in:'lower', atChunk:1, at:2.4, dur:1.8}, {c:'hand', x:.74, y:.9, h:.5, in:'right', atChunk:2, at:.4, dur:1.6, stroke:1, outChunk:3, outAt:1.6, outDir:1}]}),
];

/* ==========================================================
   3. 렌더 — 무대에 프레임을 미리 만들고, 스페이서가 스크롤 길이를 준다
   ========================================================== */
const VH = () => window.innerHeight;
const PX_PER_SEC = 80;
const BRIDGE_VH = {dissolve:120, focus:120, push:150, ink:150, polaroid:180, zoom:180};
const story = document.getElementById('story'), stage = document.getElementById('stage');
const ui = {black:document.getElementById('black'), ttl:document.getElementById('ttl'), scrim:document.getElementById('scrim'), sub:document.getElementById('sub'), cap:document.getElementById('cap'), who:document.getElementById('who'), dots:document.getElementById('dots')};
const frames = {};
function frameEl(key){
  if (frames[key]) return frames[key];
  const f = document.createElement('div'); f.className = 'frame'; f.style.cssText = 'position:absolute;inset:0;background:#000 center/cover no-repeat;opacity:0;will-change:transform,opacity,filter;filter:grayscale(1)'; f.dataset.key = key;
  f.style.backgroundImage = 'url(' + frameImage(key) + ')';
  stage.insertBefore(f, ui.dots); frames[key] = f; return f;
}


function splitVO(t){
  const sents = t.replace(/([.!?])\s+/g, '$1\u0001').split('\u0001').map(x=>x.trim()).filter(Boolean);
  return sents.flatMap(x => x.length > 44 ? x.replace(/([,\uFF0C])\s+/g, '$1\u0001').split('\u0001').map(y=>y.trim()) : [x]);
}
const SHOT = {near:'근경', far:'원경', broll:'B-roll', illu:'일러스트'};
const BR = {dissolve:'디졸브',focus:'초점',push:'밀기',ink:'먹 번짐',polaroid:'폴라로이드',zoom:'줌스루'};
const nodes = [];
items.forEach(it => {
  const sec = document.createElement('section');
  if (it.k === 'scene'){
    const vo = it.vo || '', secs = it.subs ? it.subs.length * 3.2 : Math.max(4, Math.round(vo.length / 5.2));
    sec.className = 'scene'; sec.style.height = Math.round(secs * PX_PER_SEC) + 'px'; frameEl(it.fin); frameEl(it.fout);
    nodes.push({it, el:sec, secs, chunks: it.subs ? it.subs : splitVO(vo), t:0, chunkIdx:-1, label:'S ' + it.id + ' · ' + (it.label || '') + ' · ' + SHOT[it.shot]});
  } else if (it.k === 'bridge'){
    sec.className = 'bridge'; sec.style.height = BRIDGE_VH[it.type] + 'vh'; frameEl(it.fin); frameEl(it.fout);
    nodes.push({it, el:sec, label:'브리지 · ' + BR[it.type] + (it.label ? ' · ' + it.label : '')});
  } else { sec.className = 'chapter'; sec.style.height = '160vh'; frameEl(it.fin); frameEl(it.fout); nodes.push({it, el:sec, label:'챕터 전환 · ' + it.title + '부'}); }
  story.appendChild(sec);
});

/* ==========================================================
   4. 스크롤 엔진 + 질감 층(그레인·스캔라인·글리치)
   ========================================================== */
const ease = p => p < .5 ? 2*p*p : 1 - Math.pow(-2*p + 2, 2)/2;
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let sy = null, lastT = performance.now(), current = null, lastY = window.scrollY, vel = 0, glitch = 0;

const fx = document.getElementById('fx'), fxc = fx.getContext('2d');
const noise = []; (function(){ for (let n = 0; n < 6; n++){ const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d'); const d = x.createImageData(256,256); for (let i = 0; i < d.data.length; i += 4){ const v = Math.random() * 255; d.data[i] = d.data[i+1] = d.data[i+2] = v; d.data[i+3] = 255; } x.putImageData(d, 0, 0); noise.push(c); } })();
let grainFrame = 0;
function sizeFx(){ fx.width = Math.ceil(window.innerWidth / 2); fx.height = Math.ceil(window.innerHeight / 2); }
sizeFx(); addEventListener('resize', sizeFx);
function drawFx(y, dt){
  const W = fx.width, H = fx.height; fxc.clearRect(0, 0, W, H);
  // 그레인: 항상 흐른다
  if (!reduced){ grainFrame = (grainFrame + dt * 24) % 100000; const n = noise[((Math.floor(grainFrame) % noise.length) + noise.length) % noise.length]; if (n) { fxc.globalAlpha = .10; const pat = fxc.createPattern(n, 'repeat'); fxc.save(); fxc.translate((grainFrame*37)%256, (grainFrame*19)%256); fxc.fillStyle = pat; fxc.fillRect(-256, -256, W + 512, H + 512); fxc.restore(); } }
  // 스캔라인: 스크롤 위치에 드리프트
  fxc.globalAlpha = .12; fxc.fillStyle = '#000'; fxc.globalCompositeOperation = 'multiply';
  const off = ((y * (reduced ? .15 : .3)) % 4); for (let ly = -off; ly < H; ly += 4) fxc.fillRect(0, ly, W, 1);
  fxc.globalCompositeOperation = 'source-over';
  // 글리치: 스크롤 속도에 비례
  if (glitch > .02 && !reduced){
    const k = Math.min(1, glitch); fxc.globalAlpha = .9 * k; fxc.strokeStyle = '#f2efe9'; fxc.lineWidth = .7;
    const cnt = Math.round(3 + 12 * k);
    for (let i = 0; i < cnt; i++){
      const yy = Math.random() * H, x0 = Math.random() * W * .6, len = W * (.3 + Math.random() * .7), bend = (Math.random() - .5) * 60 * k;
      fxc.beginPath(); fxc.moveTo(x0, yy); fxc.bezierCurveTo(x0 + len*.3, yy + bend, x0 + len*.7, yy - bend, x0 + len, yy + bend*.3); fxc.stroke();
    }
    fxc.fillStyle = '#f2efe9'; for (let i = 0; i < 80 * k; i++){ fxc.globalAlpha = Math.random() * .8 * k; fxc.fillRect(Math.random()*W, Math.random()*H, 1, 1); }
    // 수평 슬라이스 어긋남
    if (k > .5){ const sl = 2 + Math.round(4*k); for (let i = 0; i < sl; i++){ const sy = Math.random()*H, sh = 2 + Math.random()*10; fxc.globalAlpha = .18*k; fxc.fillStyle = '#f2efe9'; fxc.fillRect((Math.random()-.5)*40*k, sy, W, sh); } }
  }
  fxc.globalAlpha = 1;
}

function resetFrames(){ for (const k in frames){ const f = frames[k]; f.style.opacity = 0; f.style.transform = ''; f.style.filter = 'grayscale(1)'; f.style.boxShadow = ''; f.style.maskImage = f.style.webkitMaskImage = ''; } ui.black.style.opacity = 0; ui.ttl.style.opacity = 0; ui.ttl.style.transform = ''; ui.ttl.style.filter = ''; }

/* 모션 정체성 (motion-design-skill · Premium 아카이브)
   시그니처 곡선 1개 + 방향별 진입(감속)/퇴장(가속), 길이 팔레트 200 / 400 / 1200ms, 진입이 퇴장보다 약 40% 길다 */
const EZ = {sig:'cubic-bezier(.4,0,.2,1)', out:'cubic-bezier(.05,.7,.1,1)', in:'cubic-bezier(.3,0,1,1)'};
const D = {quick:200, std:400, slow:1200};
function vis(el, on, dy, dIn, dOut, delay){
  dy = dy || 0; dIn = dIn || D.std; dOut = dOut || 280; delay = delay || 0;
  if (el._on === on) return; el._on = on;
  el.style.transition = reduced ? 'none' : on ? 'opacity '+dIn+'ms '+EZ.out+' '+delay+'ms, transform '+dIn+'ms '+EZ.out+' '+delay+'ms' : 'opacity '+dOut+'ms '+EZ.in+', transform '+dOut+'ms '+EZ.in;
  el.style.opacity = on ? 1 : 0; el.style.transform = on ? 'none' : 'translateY('+dy+'px)';
}
function swap(el, text, dy){
  if (el._t === text) return; el._t = text; clearTimeout(el._sw);
  if (!el._on || reduced || !el.textContent){ el.textContent = text; return; }
  el.style.transition = 'opacity 180ms '+EZ.in+', transform 180ms '+EZ.in; el.style.opacity = 0; el.style.transform = 'translateY('+(-dy/2)+'px)';
  el._sw = setTimeout(() => { el.textContent = text; el.style.transition = 'none'; el.style.transform = 'translateY('+dy+'px)'; void el.offsetWidth;
    el.style.transition = 'opacity '+D.std+'ms '+EZ.out+', transform '+D.std+'ms '+EZ.out; if (el._on){ el.style.opacity = 1; el.style.transform = 'none'; } }, 190);
}
function skipVis(on){ const k = document.getElementById('skip'); if (k._on === on) return; k._on = on;
  k.style.transition = 'opacity '+(on?D.std:280)+'ms '+(on?EZ.out:EZ.in)+', transform '+(on?D.std:280)+'ms '+(on?EZ.out:EZ.in);
  k.style.opacity = on ? .45 : 0; k.style.transform = on ? 'none' : 'translateX(6px)'; k.style.pointerEvents = on ? 'auto' : 'none'; }
// 먹 번짐 마스크 — 가장자리가 불규칙하게 스며드는 원
const INK = (() => { const S = 256, n = document.createElement('canvas'); n.width = n.height = 10; const nx = n.getContext('2d'), nd = nx.createImageData(10, 10);
  for (let i = 0; i < nd.data.length; i += 4){ nd.data[i] = nd.data[i+1] = nd.data[i+2] = Math.random()*255; nd.data[i+3] = 255; } nx.putImageData(nd, 0, 0);
  const up = document.createElement('canvas'); up.width = up.height = S; const ux = up.getContext('2d'); ux.imageSmoothingEnabled = true; ux.drawImage(n, 0, 0, S, S); const ud = ux.getImageData(0, 0, S, S).data;
  const c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'), id = x.createImageData(S, S);
  for (let yy = 0; yy < S; yy++) for (let xx = 0; xx < S; xx++){ const i = (yy*S + xx)*4, dd = Math.hypot(xx - S/2, yy - S/2)/(S/2), nz = ud[i]/255 + (Math.random()-.5)*.2;
    id.data[i+3] = Math.max(0, Math.min(1, (.72 - dd + (nz - .5)*.4) * 8)) * 255; }
  x.putImageData(id, 0, 0); return 'url(' + c.toDataURL('image/png') + ')'; })();
function paintBridge(n, p){
  const e = ease(p), o = frames[n.it.fout], f = frames[n.it.fin], type = reduced ? 'dissolve' : n.it.type;
  o.style.zIndex = 2; f.style.zIndex = 1;
  switch(type){
    case 'dissolve': o.style.opacity = 1 - e; o.style.transform = 'scale(' + (1 + .04*e) + ')'; f.style.opacity = e; f.style.transform = 'scale(' + (1.04 - .04*e) + ')'; break;
    case 'focus': o.style.opacity = 1 - e; o.style.filter = 'grayscale(1) blur(' + (10*e) + 'px)'; o.style.transform = 'scale(' + (1 + .03*e) + ')'; f.style.opacity = e; f.style.filter = 'grayscale(1) blur(' + (10*(1-e)) + 'px)'; f.style.transform = 'scale(' + (1.03 - .03*e) + ')'; break;
    case 'push': o.style.opacity = 1; o.style.transform = 'translate3d(0,' + (-60*e) + '%,0) scale(' + (1 - .08*e) + ')'; o.style.filter = 'grayscale(1) brightness(' + (1 - .6*e) + ')'; f.style.opacity = 1; f.style.zIndex = 3; f.style.transform = 'translate3d(0,' + (100*(1-e)) + '%,0)'; f.style.boxShadow = '0 -30px 60px rgba(0,0,0,' + (.7*(1-e)) + ')'; break;
    case 'polaroid': { const s = 1 - .72*e, arc = Math.sin(Math.PI*e), lag = ease(clamp(p - .08, 0, 1));
      o.style.opacity = 1; o.style.transform = 'translate(' + (-22*e) + 'vw,' + (-10*e - 4*arc) + 'vh) rotate(' + (-4*e - 3*arc) + 'deg) scale(' + s + ')';
      o.style.boxShadow = '0 0 0 ' + (44*e) + 'px #f2efe9, 0 ' + (30*lag) + 'px ' + (60*lag) + 'px rgba(0,0,0,.8)';
      f.style.opacity = clamp(e*1.6, 0, 1); f.style.transform = 'scale(' + (1.06 - .06*e) + ')'; break; }
    case 'zoom': o.style.opacity = e < .6 ? 1 : 1 - (e-.6)/.4; o.style.transform = 'scale(' + (1 + 1.4*e) + ')'; o.style.filter = 'grayscale(1) blur(' + (8*e) + 'px) brightness(' + (1 - .7*e) + ')'; f.style.opacity = clamp((e-.3)/.7, 0, 1); f.style.transform = 'scale(' + (1.3 - .3*e) + ')'; break;
    case 'ink': { const sz = Math.round(320 * e) + 'vmax'; f.style.opacity = 1; o.style.opacity = 1; f.style.zIndex = 3;
      o.style.filter = 'grayscale(1) brightness(' + (1 - .35*e) + ')'; f.style.transform = 'scale(' + (1.05 - .05*e) + ')';
      f.style.maskImage = f.style.webkitMaskImage = INK; f.style.maskSize = f.style.webkitMaskSize = sz + ' ' + sz;
      f.style.maskPosition = f.style.webkitMaskPosition = '50% 55%'; f.style.maskRepeat = f.style.webkitMaskRepeat = 'no-repeat'; break; }
  }
}
function paintChapter(n, p){
  const e = ease(p); frames[n.it.fout].style.opacity = 1; frames[n.it.fout].style.zIndex = 1;
  frames[n.it.fin].style.opacity = clamp((e - .72)/.28, 0, 1); frames[n.it.fin].style.zIndex = 2;
  ui.black.style.opacity = clamp(Math.min(e*3, (1 - e)*3.5), 0, 1);
  const q = clamp((e - .12)/.72, 0, 1), a = clamp(Math.sin(Math.PI * q) * 1.4, 0, 1);
  ui.ttl.textContent = n.it.title; ui.ttl.style.opacity = a;
  if (!reduced){ ui.ttl.style.transform = 'translateY(' + ((.5 - q) * 3) + 'vh) scale(' + (1.08 - .1*q) + ')'; ui.ttl.style.filter = 'blur(' + ((1 - a) * 10) + 'px)'; }
}
// 5부: 종이 인형극 — 컷아웃이 막대에 달린 것처럼 들어오고(걸음·흔들림), 가운데 자막이 오디오 속도로 한 글자씩 적힌다
ui.mid = document.getElementById('mid'); ui.spk = document.getElementById('spk'); ui.attr = document.getElementById('attr'); ui.vig = document.getElementById('vig');
const pupLayer = document.getElementById('pup');
ui.place = document.createElement('div'); ui.place.style.cssText = "position:absolute;left:6vw;bottom:7vh;z-index:8;font-size:13px;letter-spacing:.3em;color:#e6e1d8;opacity:0;pointer-events:none;text-shadow:0 1px 2px #000,0 0 12px rgba(0,0,0,.8)"; stage.appendChild(ui.place);
const hash = k => { const v = Math.sin(k * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };
const backOut = k => { const c1 = .9, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
function buildChars(el, text){ const spans = []; text.split(' ').forEach((wd, wi, arr) => { const w = document.createElement('span'); w.style.display = 'inline-block'; w.style.whiteSpace = 'nowrap';
  [...wd].forEach(ch => { const sp = document.createElement('span'); sp.textContent = ch; sp.style.display = 'inline-block'; w.appendChild(sp); spans.push(sp); }); el.appendChild(w); if (wi < arr.length - 1) el.appendChild(document.createTextNode(' ')); }); return spans; }
function paintChars(spans, w){ const N = spans.length;
  for (let k = 0; k < N; k++){ const sp = spans[k], c = Math.round(clamp((w * (N + 5) - k) / 5, 0, 1) * 40) / 40; if (sp._c === c) continue; sp._c = c; const e = 1 - Math.pow(1 - c, 3);
    sp.style.opacity = e; sp.style.filter = c > 0 && c < 1 ? 'blur(' + ((1 - e) * 5).toFixed(2) + 'px)' : ''; sp.style.transform = c < 1 ? 'translateY(' + ((1 - e) * .14).toFixed(3) + 'em) rotate(' + ((1 - e) * -5).toFixed(2) + 'deg)' : ''; } }
const CUTS = {
  person: (c, S) => { silhouette(c, S*.5, S, S*.6, S*.9, .1); c.strokeStyle = g(.32); c.lineWidth = S*.012; c.beginPath(); c.moveTo(S*.4, S*.34); c.lineTo(S*.5, S*.5); c.lineTo(S*.6, S*.34); c.stroke(); },
  rope: (c, S) => { const y0 = S*.1; for (let i = 0; i <= 64; i++){ const t = i/64, x = S*.02 + t*S*.96, y = y0 + Math.sin(t*Math.PI)*S*.08; c.fillStyle = g(.2 + (i%2)*.12); c.save(); c.translate(x, y); c.rotate(i%2 ? .6 : -.6); c.beginPath(); c.ellipse(0, 0, S*.011, S*.022, 0, 0, 7); c.fill(); c.restore(); }
    [.16,.3,.44,.58,.72,.86].forEach((t, i) => { const x = S*.02 + t*S*.96, y = y0 + Math.sin(t*Math.PI)*S*.08; c.fillStyle = g(.18); c.fillRect(x - 1, y, 2, S*.06);
      if (i % 2){ c.fillStyle = g(.04); c.beginPath(); c.moveTo(x - S*.03, y + S*.06); c.lineTo(x + S*.028, y + S*.065); c.lineTo(x + S*.022, y + S*.11); c.lineTo(x - S*.025, y + S*.105); c.closePath(); c.fill(); }
      else { c.fillStyle = g(.3); c.beginPath(); c.moveTo(x - S*.018, y + S*.06); c.quadraticCurveTo(x + S*.035, y + S*.14, x + S*.006, y + S*.21); c.quadraticCurveTo(x - S*.012, y + S*.13, x - S*.018, y + S*.06); c.fill(); } }); },
  bowl: (c, S) => { const cx = S*.5, by = S*.96; c.fillStyle = g(.22); c.beginPath(); c.moveTo(cx - S*.34, by - S*.3); c.quadraticCurveTo(cx - S*.3, by, cx, by); c.quadraticCurveTo(cx + S*.3, by, cx + S*.34, by - S*.3); c.closePath(); c.fill();
    c.fillStyle = g(.93); c.beginPath(); c.ellipse(cx, by - S*.31, S*.31, S*.14, 0, Math.PI, 0); c.fill(); c.fillStyle = g(.4); c.beginPath(); c.ellipse(cx, by - S*.3, S*.34, S*.045, 0, 0, 7); c.fill(); c.fillStyle = g(.12); c.fillRect(cx - S*.12, by - S*.025, S*.24, S*.025); },
  jeogori: (c, S) => { const cx = S*.5, t = S*.3, b = S*.97; c.fillStyle = g(.86);
    [-1, 1].forEach(d => { c.beginPath(); c.moveTo(cx + d*S*.16, t); c.lineTo(cx + d*S*.46, t + S*.12); c.lineTo(cx + d*S*.44, t + S*.34); c.lineTo(cx + d*S*.18, t + S*.3); c.closePath(); c.fill(); });
    c.beginPath(); c.moveTo(cx - S*.18, t); c.lineTo(cx + S*.18, t); c.lineTo(cx + S*.24, b); c.lineTo(cx - S*.24, b); c.closePath(); c.fill();
    c.strokeStyle = g(.25); c.lineWidth = S*.03; c.beginPath(); c.moveTo(cx - S*.1, t); c.lineTo(cx + S*.06, t + S*.26); c.stroke(); c.beginPath(); c.moveTo(cx + S*.1, t); c.lineTo(cx, t + S*.12); c.stroke();
    c.lineWidth = S*.014; c.beginPath(); c.moveTo(cx + S*.06, t + S*.26); c.quadraticCurveTo(cx + S*.02, t + S*.42, cx - S*.04, t + S*.5); c.stroke(); c.beginPath(); c.moveTo(cx + S*.06, t + S*.26); c.quadraticCurveTo(cx + S*.12, t + S*.4, cx + S*.1, t + S*.48); c.stroke();
    c.strokeStyle = g(.6); c.lineWidth = S*.005; for (let i = 0; i < 3; i++){ c.beginPath(); c.moveTo(cx - S*.2 + i*S*.02, t + S*.4 + i*S*.12); c.lineTo(cx + S*.2, t + S*.42 + i*S*.12); c.stroke(); }
    c.strokeStyle = g(.1); c.lineWidth = S*.02; c.beginPath(); c.arc(cx - S*.07, t + S*.58, S*.04, .3, 5.2); c.stroke(); },
  grass: (c, S) => { for (let i = 0; i < 130; i++){ const x = (i/130)*S + (Math.random() - .5)*S*.02, h = S*(.22 + Math.random()*.55), lean = (Math.random() - .5)*S*.14, w = S*(.007 + Math.random()*.01);
    c.fillStyle = g(.04 + Math.random()*.12); c.beginPath(); c.moveTo(x - w, S); c.quadraticCurveTo(x + lean*.3, S - h*.6, x + lean, S - h); c.quadraticCurveTo(x + lean*.3 + w, S - h*.55, x + w, S); c.fill(); } },
  stones: (c, S) => { [[.5,.88,.22,.1],[.3,.9,.16,.08],[.7,.9,.17,.08],[.42,.77,.15,.08],[.6,.78,.14,.07],[.5,.67,.12,.07],[.2,.94,.1,.05],[.82,.94,.1,.05]].forEach(([x,y,rx,ry], i) => {
    c.fillStyle = g(.22 + (i%3)*.12); c.beginPath(); c.ellipse(S*x, S*y, S*rx, S*ry, (i%2 - .5)*.2, 0, 7); c.fill(); c.strokeStyle = g(.06); c.lineWidth = S*.006; c.stroke(); }); },
  bier: (c, S) => { const cx = S*.5, by = S*.6; c.fillStyle = g(.1); c.beginPath(); c.moveTo(cx - S*.34, by); c.lineTo(cx - S*.28, by - S*.16); c.quadraticCurveTo(cx, by - S*.34, cx + S*.28, by - S*.16); c.lineTo(cx + S*.34, by); c.closePath(); c.fill();
    c.fillStyle = g(.82); for (let i = 0; i < 5; i++) c.fillRect(cx - S*.26 + i*S*.13, by - S*.1, S*.04, S*.08); c.fillStyle = g(.15); c.fillRect(cx - S*.48, by, S*.96, S*.03);
    for (let i = 0; i < 6; i++) silhouette(c, cx - S*.4 + i*S*.16, S*.995, S*.1, S*.38, .07);
    c.fillStyle = g(.9); [-.3, .3].forEach(d => c.fillRect(cx + S*d - S*.005, by - S*.16, S*.01, S*.1)); },
  bottle: (c, S) => { const cx = S*.5; c.fillStyle = g(.82); c.beginPath(); c.moveTo(cx - S*.06, S*.1); c.lineTo(cx + S*.06, S*.1); c.lineTo(cx + S*.06, S*.3); c.quadraticCurveTo(cx + S*.18, S*.36, cx + S*.18, S*.5); c.lineTo(cx + S*.18, S*.97); c.lineTo(cx - S*.18, S*.97); c.lineTo(cx - S*.18, S*.5); c.quadraticCurveTo(cx - S*.18, S*.36, cx - S*.06, S*.3); c.closePath(); c.fill();
    c.fillStyle = g(.15); c.fillRect(cx - S*.07, S*.06, S*.14, S*.06); c.fillStyle = g(.3); c.fillRect(cx - S*.18, S*.56, S*.36, S*.22); c.fillStyle = g(.85); c.fillRect(cx - S*.02, S*.6, S*.04, S*.14); },
  book: (c, S) => { c.fillStyle = g(.15); c.fillRect(S*.12, S*.62, S*.76, S*.36); c.fillStyle = g(.88); c.fillRect(S*.14, S*.6, S*.72, S*.34); c.fillStyle = g(.25); c.fillRect(S*.14, S*.6, S*.72, S*.03);
    for (let i = 0; i < 5; i++) c.fillRect(S*.22, S*.68 + i*S*.045, S*.4 - (i%2)*S*.1, S*.012); c.fillStyle = g(.1); c.fillRect(S*.7, S*.66, S*.06, S*.2); },
  censer: (c, S) => { const cx = S*.5, cy = S*.62; c.fillStyle = g(.12); c.beginPath(); c.arc(cx, cy, S*.3, 0, 7); c.fill(); c.fillStyle = g(.35); c.beginPath(); c.arc(cx, cy, S*.26, 0, 7); c.fill(); c.fillStyle = g(.72); c.beginPath(); c.arc(cx, cy, S*.2, 0, 7); c.fill(); for (let i = 0; i < 40; i++){ c.fillStyle = g(.5 + Math.random()*.4); c.fillRect(cx + (Math.random() - .5)*S*.3, cy + (Math.random() - .5)*S*.3, 2, 2); } c.fillStyle = g(.95); c.beginPath(); c.arc(cx, cy, S*.014, 0, 7); c.fill(); },
  smoke: (c, S) => { for (let k = 0; k < 3; k++){ c.strokeStyle = 'rgba(235,232,226,' + (.4 - .1*k) + ')'; c.lineWidth = S*(.01 + k*.012); c.beginPath(); for (let y = S; y >= S*.02; y -= 6){ const t = (S - y)/S, xx = S*.5 + Math.sin(t*9 + k*1.7)*S*.06*t*(1 + k*.6) + (k - 1)*t*S*.03; y === S ? c.moveTo(xx, y) : c.lineTo(xx, y); } c.stroke(); } },
  knot: (c, S) => { const cx = S*.5, cy = S*.6; c.fillStyle = g(.68); c.beginPath(); for (let a = 0; a < 6.3; a += .3){ const r = S*(.22 + .03*Math.sin(a*5)); a ? c.lineTo(cx + Math.cos(a)*r, cy + Math.sin(a)*r*.85) : c.moveTo(cx + r, cy); } c.closePath(); c.fill(); c.strokeStyle = g(.45); c.lineWidth = S*.006; for (let i = 0; i < 14; i++){ c.beginPath(); c.moveTo(cx - S*.2, cy - S*.16 + i*S*.024); c.lineTo(cx + S*.2, cy - S*.15 + i*S*.024); c.stroke(); } c.fillStyle = g(.3); c.fillRect(cx - S*.22, cy - S*.02, S*.44, S*.035); c.fillRect(cx - S*.017, cy - S*.19, S*.035, S*.36); c.fillStyle = g(.55); c.beginPath(); c.ellipse(cx - S*.05, cy - S*.2, S*.05, S*.03, -.6, 0, 7); c.fill(); c.beginPath(); c.ellipse(cx + S*.05, cy - S*.2, S*.05, S*.03, .6, 0, 7); c.fill(); },
  cart: (c, S) => { const cx = S*.5, cy = S*.55; c.fillStyle = g(.12); c.fillRect(cx - S*.4, cy - S*.22, S*.07, S*.44); c.fillRect(cx + S*.33, cy - S*.22, S*.07, S*.44); c.fillStyle = g(.42); c.fillRect(cx - S*.3, cy - S*.28, S*.6, S*.56); c.strokeStyle = g(.25); c.lineWidth = S*.008; for (let i = 1; i < 6; i++){ c.beginPath(); c.moveTo(cx - S*.3, cy - S*.28 + i*S*.093); c.lineTo(cx + S*.3, cy - S*.28 + i*S*.093); c.stroke(); } c.fillStyle = g(.3); c.fillRect(cx - S*.03, cy + S*.28, S*.06, S*.16); },
  lid: (c, S) => { const cx = S*.5, cy = S*.6; c.fillStyle = g(.9); c.fillRect(cx - S*.26, cy - S*.2, S*.52, S*.4); c.fillStyle = g(.2); c.fillRect(cx - S*.26, cy - S*.012, S*.52, S*.024); c.strokeStyle = g(.3); c.lineWidth = S*.008; c.strokeRect(cx - S*.26, cy - S*.2, S*.52, S*.4); c.beginPath(); c.moveTo(cx - S*.26, cy - S*.2); c.lineTo(cx - S*.1, cy); c.lineTo(cx - S*.26, cy + S*.2); c.moveTo(cx + S*.26, cy - S*.2); c.lineTo(cx + S*.1, cy); c.lineTo(cx + S*.26, cy + S*.2); c.stroke(); for (let i = 0; i < 10; i++){ const px = cx - S*.2 + i*S*.044; c.fillStyle = g(i % 2 ? .35 : .6); c.beginPath(); c.arc(px, cy - S*.16, S*.014, 0, 7); c.fill(); c.beginPath(); c.arc(px, cy + S*.16, S*.014, 0, 7); c.fill(); } },
  hand: (c, S) => { c.fillStyle = g(.55); c.beginPath(); c.moveTo(S, S*.52); c.lineTo(S*.55, S*.5); c.quadraticCurveTo(S*.4, S*.48, S*.32, S*.52); for (let i = 0; i < 4; i++){ const fy = S*(.5 + i*.035); c.lineTo(S*.18, fy); c.quadraticCurveTo(S*.14, fy + S*.012, S*.18, fy + S*.025); c.lineTo(S*.34, fy + S*.02); } c.lineTo(S*.4, S*.66); c.quadraticCurveTo(S*.45, S*.72, S*.55, S*.7); c.lineTo(S, S*.72); c.closePath(); c.fill(); c.fillStyle = g(.2); c.fillRect(S*.78, S*.49, S*.22, S*.25); },
  walker: (c, S) => { silhouette(c, S*.5, S, S*.42, S*.86, .08); c.fillStyle = g(.72); c.beginPath(); c.ellipse(S*.3, S*.55, S*.07, S*.1, .3, 0, 7); c.fill(); c.beginPath(); c.ellipse(S*.7, S*.55, S*.07, S*.1, -.3, 0, 7); c.fill(); },
  polaroid: (c, S) => { c.fillStyle = g(.95); c.fillRect(S*.18, S*.14, S*.64, S*.82); const gr = c.createRadialGradient(S*.5, S*.44, 0, S*.5, S*.44, S*.34); gr.addColorStop(0, g(.55)); gr.addColorStop(1, g(.12)); c.fillStyle = gr; c.fillRect(S*.23, S*.19, S*.54, S*.54); silhouette(c, S*.5, S*.73, S*.2, S*.3, .06); }
};
const CUTIMG = {};
function cutImage(key){ if (CUTIMG[key]) return CUTIMG[key]; const S = 600, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'); (CUTS[key] || (() => {}))(x, S);
  const im = x.getImageData(0, 0, S, S), d = im.data; for (let i = 0; i < d.length; i += 4){ if (!d[i+3]) continue; let L = d[i] / 255; L = (L - .5) * 1.25 + .5; L += (Math.random() - .5) * (.12 + .3 * (1 - Math.abs(2*L - 1))); const v = clamp(L, 0, 1) * 255; d[i] = d[i+1] = d[i+2] = v; }
  x.putImageData(im, 0, 0); return CUTIMG[key] = c.toDataURL('image/png'); }
function initScene(n){
  const it = n.it; n.chunks = [];
  (it.lines || []).forEach(l => { (l.q || l.sub ? [l.t] : splitVO(l.t)).forEach(t => n.chunks.push({t, who: l.who || '', q: !!l.q, sub: !!l.sub, attr: l.attr || '', wd: Math.min(1.5, .3 + t.length / 28), d: Math.min(1.5, .3 + t.length / 28) + Math.max(1.3, t.length / 10) + (l.q || l.sub ? .8 : .3)})); });
  if (!n.chunks.length) n.chunks.push({t:'', who:'', attr:'', wd:.1, d:3});
  n.starts = []; let acc = .4; n.chunks.forEach(c => { n.starts.push(acc); acc += c.d; }); n.secs = acc + .3; n.t = 0; n.w = 0;
  n.el.style.height = Math.round(n.secs * PX_PER_SEC) + 'px';
  n.box = document.createElement('div'); n.box.style.cssText = 'position:absolute;inset:0;display:none'; pupLayer.appendChild(n.box);
  n.pups = (it.pups || []).map((p, i) => { const el = document.createElement('div');
    el.style.cssText = 'position:absolute;left:0;top:0;background:center/contain no-repeat;will-change:transform,opacity;opacity:0;filter:drop-shadow(5px 7px 0 rgba(0,0,0,.45))'; el.style.backgroundImage = 'url(' + cutImage(p.c) + ')'; if (p.dim) el.style.filter = 'brightness(.45) drop-shadow(5px 7px 0 rgba(0,0,0,.45))'; n.box.appendChild(el);
    return {p, el, seed: i * 1.7 + 1, at: (p.atChunk != null ? n.starts[p.atChunk] : 0) + (p.at || 0), out: p.outChunk != null ? n.starts[p.outChunk] + (p.outAt || 0) : null}; });
}
let shownBox = null;
function showBox(n, op){ const b = n && n.box; if (shownBox && shownBox !== b) shownBox.style.display = 'none'; if (b){ b.style.display = 'block'; b.style.opacity = op; } shownBox = b || null; }
function posePups(n){
  const W = stage.clientWidth, H = stage.clientHeight;
  n.pups.forEach(({p, el, seed, at, out}) => {
    const S = p.h * H, t = n.t - at; let X = p.x * W, Y = p.y * H, rot = p.rot || 0, sy = 1, sx = 1, op = 1;
    if (t < 0){ el.style.opacity = 0; return; }
    if (!reduced){
      const D = p.dur || 1.3, k = clamp(t / D, 0, 1), e = 1 - Math.pow(1 - k, 3), eb = backOut(k);
      if (p.in === 'left' || p.in === 'right'){ const from = p.in === 'left' ? -S*.7 : W + S*.7; X = from + (X - from) * e; if (k < 1){ const ph = t * Math.PI * 2.2; Y -= Math.abs(Math.sin(ph)) * S * .045; rot += Math.sin(ph) * 2.2; } }
      else if (p.in === 'up'){ Y += (1 - eb) * (S * .9 + H * .1); }
      else if (p.in === 'drop'){ Y = -S * .9 + (Y + S * .9) * e; rot += (p.swing || 6) * Math.exp(-t * 1.3) * Math.sin(t * 4.2); }
      else if (p.in === 'drop2'){ Y -= (1 - e) * H * .7; rot += (1 - eb) * 16 * (rot < 0 ? -1 : 1); op = clamp(k * 4, 0, 1); }
      else if (p.in === 'unfold'){ sy = .05 + .95 * eb; }
      else if (p.in === 'fade'){ op = e; sx = sy = 1.03 - .03 * e; }
      else if (p.in === 'lower'){ const sc2 = 1 + (1 - e) * .35; sx = sy = sc2; op = clamp(k * 2.5, 0, 1); rot += (1 - eb) * 6; }
      else if (p.in === 'recede'){ const kk = clamp(t / (p.dur || 10), 0, 1), ee = kk * kk * (3 - 2 * kk); Y = p.y * H + (p.y2 - p.y) * H * ee; sx = sy = 1 + (p.s2 - 1) * ee; Y -= Math.abs(Math.sin(t * Math.PI * 1.6)) * S * sx * .02; rot += Math.sin(t * Math.PI * 1.6) * 1.2; op = clamp(t * 2, 0, 1); }
      if (p.stroke && k >= 1) X += Math.sin((t - D) * 3.2) * S * .06 * clamp((t - D) / .4, 0, 1);
      if (out != null && n.t > out){ const ko = clamp((n.t - out) / 1.1, 0, 1), eo = ko * ko * ko; X += (p.outDir != null ? p.outDir : (p.in === 'right' ? -1 : 1)) * eo * W * .6; op *= 1 - eo; }
      rot += Math.sin(n.t * (p.sf || 1.1) + seed) * (p.sway != null ? p.sway : 1); Y += Math.sin(n.t * 1.3 + seed) * S * .006;
      if (p.talk && n.w > 0 && n.w < 1) Y += Math.sin(n.t * 11) * S * .005;
    }
    if (!reduced && n._p != null){ const dp = p.depth != null ? p.depth : .25 + p.h * .9, q = n._p - .5; X -= q * W * .05 * dp * (p.x < .5 ? 1 : -1); Y -= q * H * .22 * dp; sx *= 1 + q * .04 * dp; sy *= 1 + q * .04 * dp; }
    el.style.width = el.style.height = S + 'px'; el.style.transformOrigin = p.hang ? '50% 0' : '50% 100%';
    el.style.transform = 'translate(' + (X - S/2).toFixed(1) + 'px,' + (p.hang ? Y : Y - S).toFixed(1) + 'px) rotate(' + rot.toFixed(2) + 'deg) scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')';
    el.style.opacity = op;
  });
}
let capSpans = [];
function setCaption(ch){ ui.mid.textContent = ''; capSpans = buildChars(ui.mid, ch.q ? '“' + ch.t + '”' : ch.t);
  ui.mid.style.fontWeight = ch.q || ch.sub ? '400' : '700'; ui.mid.style.fontSize = ch.q || ch.sub ? 'clamp(26px,3.6vw,48px)' : 'clamp(24px,3.2vw,42px)';
  ui.spk.textContent = ch.who; ui.attr.textContent = ch.attr ? '— ' + ch.attr : ''; }
function paintScene(n, dt, p){
  n._p = p;
  const fi = frames[n.it.fin], fo = frames[n.it.fout];
  const br = reduced ? 0 : Math.sin(performance.now() / 1000 * 2 * Math.PI / 9) * .006;
  n.t = Math.min(n.secs, n.t + dt);
  const cp = ease(clamp(n.t / n.secs, 0, 1)), push = n.it.push ? 1 + n.it.push * cp : 1, pz = n.it.pan ? 1.35 : 1, pan = n.it.pan ? -n.it.pan * cp * 100 : 0;
  const tf = 'scale(' + ((1 + .04*p + br) * push * pz).toFixed(4) + ') translate3d(' + (((p - .5) * -1.2) + pan / pz).toFixed(3) + '%,0,0)';
  fi.style.opacity = 1; fi.style.zIndex = 1; fi.style.transform = tf;
  if (n.it.fout !== n.it.fin){ fo.style.opacity = n.it.foutChunk != null ? clamp((n.t - n.starts[n.it.foutChunk] + .2) / 1.2, 0, 1) : clamp((n.t/n.secs - .6)/.35, 0, 1); fo.style.zIndex = 2; fo.style.transform = tf; }
  pupLayer.style.transformOrigin = '50% 62%'; pupLayer.style.transform = push !== 1 || pan ? 'translate(' + (pan * .8).toFixed(3) + '%,0) scale(' + push.toFixed(4) + ')' : '';
  if (ui.place._t !== (n.it.place || '')){ ui.place._t = n.it.place || ''; ui.place.textContent = ui.place._t; }
  ui.place.style.transition = 'none'; const pl = n.it.place ? clamp((n.t - 1) / .6, 0, 1) : 0; ui.place.style.opacity = pl; ui.place.style.transform = 'translateY(' + ((1 - pl) * 6).toFixed(1) + 'px)';
  if (n.it.invert){ const inv = reduced ? 0 : ease(clamp((n.t / n.secs - .3) / .35, 0, 1)); fi.style.filter = fo.style.filter = 'grayscale(1) invert(' + inv.toFixed(3) + ')'; pupLayer.style.filter = 'invert(' + inv.toFixed(3) + ')'; }
  else pupLayer.style.filter = '';
  showBox(n, 1); posePups(n);
  let idx = n.chunks.length - 1; for (let k = 0; k < n.chunks.length; k++){ if (n.t < n.starts[k] + n.chunks[k].d){ idx = k; break; } }
  const ch = n.chunks[idx], q = clamp((n.t - n.starts[idx]) / ch.d, 0, 1);
  if (idx !== n.chunkIdx){ n.chunkIdx = idx; setCaption(ch); }
  const lt = n.t - n.starts[idx], w = reduced ? (lt >= 0 ? 1 : 0) : clamp(lt / ch.wd, 0, 1), out = idx === n.chunks.length - 1 ? 0 : clamp((lt - ch.d + .25) / .25, 0, 1); n.w = w;
  paintChars(capSpans, w);
  [ui.mid, ui.spk, ui.attr].forEach(el => el.style.transition = 'none');
  ui.mid.style.opacity = 1 - out; ui.mid.style.transform = 'translateY(' + (-out * 10 + (reduced ? 0 : (.5 - p) * 46)).toFixed(1) + 'px)';
  if (!reduced){ ui.spk.style.transform = 'translateY(' + ((.5 - p) * 70).toFixed(1) + 'px)'; }
  ui.spk.style.opacity = ch.who ? Math.min(clamp(q * 8, 0, 1), 1 - out) : 0;
  const ai = ch.attr ? clamp((lt - ch.wd) / .3, 0, 1) : 0; ui.attr.style.opacity = ai * (1 - out); ui.attr.style.transform = 'translateY(' + ((1 - ai) * 6).toFixed(1) + 'px)';
  ui.vig.style.opacity = ch.t ? 1 : 0;
}
function enterScene(n){ n.chunkIdx = -1; }
function leaveScene(){ pupLayer.style.transform = ''; [ui.place, ui.mid, ui.spk, ui.attr].forEach(el => { el.style.transition = 'opacity 280ms ' + EZ.in; el.style.opacity = 0; }); ui.vig.style.opacity = 0; }
function oldFilm(now, on){ if (reduced || !on){ if (stage._wv){ stage.style.transform = ''; stage._wv = 0; } return; } stage._wv = 1;
  const tt = now / 1000, f = Math.floor(tt * 12); stage.style.transform = 'translate(' + ((hash(f) - .5) * 1.4).toFixed(2) + 'px,' + ((hash(f + 99) - .5) * 1.1).toFixed(2) + 'px) scale(1.01)';
  if (!(current && current.it.k === 'chapter')) ui.black.style.opacity = (hash(Math.floor(tt * 20) + 3) * .06).toFixed(3); }
{ let last = null; nodes.forEach(n => { if (n.it.k === 'scene'){ initScene(n); last = n; } else n.prev = last; }); }

function tick(now){
  const dt = Math.max(0, Math.min(.1, (now - lastT)/1000)); lastT = now;
  const vh = VH(); { const ry = window.scrollY; sy = sy === null ? ry : sy + (ry - sy) * (1 - Math.exp(-dt * 8)); if (Math.abs(ry - sy) < .4) sy = ry; } const y = sy;
  vel = dt > 0 ? (y - lastY) / dt : 0; lastY = y;
  const target = clamp((Math.abs(vel) - 400) / 2200, 0, 1); glitch += (target - glitch) * (target > glitch ? .5 : dt * 2.5);
  document.getElementById('progress').style.height = (y / Math.max(1, document.documentElement.scrollHeight - vh) * 100) + 'vh';
  ui.dots.style.transform = 'translate3d(0,' + (-(y * .3) % 3 - 10) + 'px,0)';  // 스캔라인 드리프트
  const storyTop = story.offsetTop; let act = null, p = 0;
  if (y >= storyTop - vh*.5){
    for (const n of nodes){ const top = storyTop + n.el.offsetTop, h = n.el.offsetHeight; if (y < top + h){ act = n; p = clamp((y - top) / Math.max(1, h - (n.it.k === 'scene' ? 0 : vh)), 0, 1); break; } }
    if (!act) act = nodes[nodes.length - 1], p = 1;
  } else { act = nodes[0]; p = 0; }
  if (act !== current){ if (current && current.it.k === 'scene') leaveScene(); current = act; if (act.it.k === 'scene') enterScene(act); }
  resetFrames();
  if (act.it.k === 'scene') paintScene(act, y >= storyTop - vh*.5 ? dt : 0, p);
  else if (act.it.k === 'bridge'){ paintBridge(act, p); if (act.prev){ showBox(act.prev, clamp(1 - ease(p) * 2.5, 0, 1)); posePups(act.prev); } else showBox(null); } else paintChapter(act, p);
  drawFx(y, dt); titleFx(y, vh); partCards(y, vh); oldFilm(now, y >= storyTop - vh);
  skipVis(act.it.k === 'scene' && y >= storyTop - vh*.5);
  if (auto && !userScrolling) window.scrollBy(0, 1.6);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ==========================================================
   5. UI
   ========================================================== */
const $ = id => document.getElementById(id);
const pref = (k, d) => { try { const v = localStorage.getItem('mm.' + k); return v === null ? d : v === '1'; } catch(e){ return d; } };
const save = (k, v) => { try { localStorage.setItem('mm.' + k, v ? '1' : '0'); } catch(e){} };
let caps = pref('caps', true), auto = false, userScrolling = false, usTimer, panelOpen = false;
const setSt = (id, on) => $(id).querySelector('.st').textContent = on ? '켬' : '끔';
setSt('b-caps', caps);
const gear = $('gear'), panel = $('panel'), gearSvg = $('gear-svg');
function setPanel(open){
  if (open === panelOpen) return; panelOpen = open; gear.setAttribute('aria-expanded', String(open));
  gearSvg.style.transition = 'transform ' + D.std + 'ms ' + EZ.sig; gearSvg.style.transform = open ? 'rotate(60deg)' : 'none';
  if (open){
    panel.style.display = 'block';
    if (!reduced){ panel.animate([{opacity:0, transform:'translateY(-6px) scale(.97)'},{opacity:1, transform:'none'}], {duration:300, easing:EZ.out});
      [...panel.children].forEach((b, i) => b.animate([{opacity:0, transform:'translateX(6px)'},{opacity:1, transform:'none'}], {duration:300, delay:40 + i*30, easing:EZ.out, fill:'backwards'})); }
  } else if (reduced){ panel.style.display = 'none'; }
  else { const a = panel.animate([{opacity:1, transform:'none'},{opacity:0, transform:'translateY(-4px) scale(.98)'}], {duration:D.quick, easing:EZ.in}); a.onfinish = () => { if (!panelOpen) panel.style.display = 'none'; }; }
}
gear.addEventListener('click', () => setPanel(!panelOpen));
$('b-caps').addEventListener('click', () => { caps = !caps; save('caps', caps); setSt('b-caps', caps); });
$('b-auto').addEventListener('click', () => { auto = !auto; setSt('b-auto', auto); });
$('b-top').addEventListener('click', () => { if (!window.__mmStarted) return; setPanel(false); window.scrollTo({top:0, behavior:'smooth'}); });
$('start').addEventListener('click', () => { window.__mmStarted = 1; if (!introPlay()) window.scrollTo({top: story.offsetTop, behavior:'smooth'}); });
$('skip').addEventListener('click', () => { if (current && current.it.k === 'scene'){ current.t = current.secs; } if (current && current.it.k === 'scene') window.scrollTo({top: story.offsetTop + current.el.offsetTop + current.el.offsetHeight + 2, behavior:'smooth'}); });
['wheel','touchstart','keydown'].forEach(ev => window.addEventListener(ev, () => { userScrolling = true; clearTimeout(usTimer); usTimer = setTimeout(() => userScrolling = false, 1500); }, {passive:true}));
document.addEventListener('click', e => { if (panelOpen && !panel.contains(e.target) && !gear.contains(e.target)) setPanel(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') setPanel(false); });
// 자막이 끝나기 전에는 다음 장면으로 넘어가지 않는다 — 아직 끝나지 않은 첫 장면의 끝에서 스크롤을 멈춘다
function typingLock(){ const list = [typeof TT !== 'undefined' ? TT : null].concat(typeof cards !== 'undefined' ? cards.map(c => c.T) : []); for (const T of list){ if (T && T.next && T.i < T.steps.length) return T.lockY; } return null; }
function lockLimit(){ if (window.__mmFree) return null; if (!window.__mmStarted) return 0; if (introOn) return 0; const tl = typingLock(); if (tl != null) return tl; for (const n of nodes){ if (n.it.k === 'scene' && n.el.offsetParent !== null && n.t < n.secs - .05) return story.offsetTop + n.el.offsetTop + n.el.offsetHeight - 2; } return null; }
// 부드러운 관성 스크롤 — 휠 입력을 목표값으로 모으고 매 프레임 따라간다 (잠금 한계도 여기서 적용)
const SM = {cur: window.scrollY, tgt: window.scrollY, on: false, raf: 0};
function smLoop(){ const L = lockLimit(), max = document.documentElement.scrollHeight - innerHeight;
  if (L !== null) SM.tgt = Math.min(SM.tgt, L); SM.tgt = clamp(SM.tgt, 0, max);
  SM.cur += (SM.tgt - SM.cur) * .085; if (Math.abs(SM.tgt - SM.cur) < .4){ SM.cur = SM.tgt; SM.on = false; }
  SM.lock = true; window.scrollTo(0, SM.cur); SM.lock = false; if (SM.on) SM.raf = requestAnimationFrame(smLoop); }
const startByScroll = () => { if (window.__mmStarted) return; const b = $('start'); if (b) b.click(); };
addEventListener('wheel', e => { if (e.ctrlKey) return; const L = lockLimit(); e.preventDefault(); if (L === 0){ const C = window.__coverCP; if (C && !window.__mmStarted){ C.tgt = clamp(C.tgt + e.deltaY * (e.deltaMode === 1 ? 36 : 1) / (innerHeight * 1.2), 0, 1); if (reduced && C.tgt >= 1) startByScroll(); } return; }
  if (!SM.on){ SM.cur = SM.tgt = window.scrollY; } const d = e.deltaY * (e.deltaMode === 1 ? 36 : e.deltaMode === 2 ? innerHeight : 1);
  SM.tgt += clamp(d, -240, 240) * (reduced ? 1 : 1.1); if (L !== null && SM.tgt > L) SM.tgt = L;
  if (reduced){ window.scrollTo(0, SM.tgt); return; } if (!SM.on){ SM.on = true; SM.raf = requestAnimationFrame(smLoop); } }, {passive:false});
addEventListener('scroll', () => { if (SM.lock) return; if (!SM.on){ SM.cur = SM.tgt = window.scrollY; } }, {passive:true});
let touchY = 0; addEventListener('touchstart', e => { touchY = e.touches[0].clientY; }, {passive:true});
addEventListener('touchmove', e => { if (!window.__mmStarted && window.__coverCP){ const C = window.__coverCP, y = e.touches[0].clientY; C.tgt = clamp(C.tgt + (touchY - y) / (innerHeight * .9), 0, 1); touchY = y; } const L = lockLimit(); if (L !== null && (L === 0 || e.touches[0].clientY < touchY) && window.scrollY >= L - 1) e.preventDefault(); }, {passive:false});
addEventListener('keydown', e => { const L = lockLimit(); if (L === 0 && ['ArrowDown','ArrowUp','PageDown','PageUp',' ','End','Home'].includes(e.key) && e.target === document.body){ e.preventDefault(); if (window.__coverCP && !window.__mmStarted){ const C = window.__coverCP; C.tgt = clamp(C.tgt + (['ArrowUp','PageUp'].includes(e.key) ? -.2 : ['ArrowDown','PageDown',' '].includes(e.key) ? .2 : 0), 0, 1); } return; }
  if (L !== null && ['ArrowDown','PageDown',' ','End'].includes(e.key) && window.scrollY >= L - 40){ e.preventDefault(); window.scrollTo(0, L); } });
addEventListener('scroll', () => { const L = lockLimit(); if (L !== null && window.scrollY > L + 1) window.scrollTo(0, L); }, {passive:true});

// 타이틀: 이미지가 먼저 떠오르고(1.2s+), 글자가 110ms 간격으로 내려앉고, 시작 줄이 마지막에 따라온다
(function intro(){
  const inner = $('title-inner'), row = $('title-row'), st = $('start');
  inner.style.opacity = 1;
  if (reduced) return;
  
  [...($('title-h1') ? $('title-h1').querySelectorAll('span') : [])].forEach((c, i) => c.animate([{opacity:0, transform:'translateY(.28em)', filter:'blur(8px)'},{opacity:1, transform:'none', filter:'blur(0)'}], {duration:D.slow, delay:700 + i*110, easing:EZ.out, fill:'backwards'}));
  row.animate([{opacity:0, transform:'translateY(10px)'},{opacity:1, transform:'none'}], {duration:600, delay:900, easing:EZ.out, fill:'backwards'});
})();
// 표지: 크라프트지 노트 표지에 제목이 펀칭 구멍(도트)으로 찍힌다. 도트 프린터처럼 왼쪽 열부터 차례로 뚫린다
// 표지 — 어둠 속 먹빛 바다. 바다·안개 두 겹·제목·시작 줄이 각자 다른 깊이에서 천천히 흐르고(마우스·시간), 거친 입자가 덮는다
const COVER = (() => {
  const cover = $('cover'), sea = $('cv-sea'), f1 = $('cv-fog1'), f2 = $('cv-fog2'), gr = $('cv-grain'), h1 = $('cover-title'), row = $('title-row'); if (!cover) return {open(){}};
  sea.style.backgroundImage = 'url(assets/cover-incense.jpg)'; sea.style.inset = '-6% -6% -30% -6%'; sea.style.backgroundPosition = '50% 62%'; f2.style.display = 'none'; f1.style.top = '-6%'; f1.style.height = '36%'; sea.style.filter = 'grayscale(1) contrast(1.04)';
  { const gs = $('gear-svg'), gb = $('gear'); if (gs) gs.style.stroke = '#141210'; if (gb) gb.style.opacity = '.6'; }
  const place = () => { const r = h1.getBoundingClientRect(), ti = $('title-inner'); if (ti && r.height) ti.style.paddingTop = Math.round(r.bottom - cover.getBoundingClientRect().top + innerHeight * .07) + 'px'; };
  // 제목: 글자마다 먹이 스미듯 — 흐림 → 선명, 아래에서 조금 떠오름, 120ms 간격
  const chars = []; { const lines = ['숨겨진 이야기에 대하여']; h1.textContent = ''; h1.setAttribute('aria-label', '숨겨진 이야기에 대하여');
    lines.forEach((ln, li) => { if (li) h1.appendChild(document.createElement('br')); [...ln].forEach(ch => { const sp = document.createElement('span'); sp.textContent = ch; sp.setAttribute('aria-hidden', 'true'); sp.style.cssText = 'display:inline-block;white-space:pre;opacity:0'; h1.appendChild(sp); chars.push(sp); }); }); }
  // 마우스를 올리면 그 글자가 튀어 오르고, 양옆 글자가 조금 늦게 작게 따라 오른다
  { h1.style.pointerEvents = 'auto'; { const ti = $('title-inner'); if (ti){ ti.style.pointerEvents = 'none'; [...ti.querySelectorAll('button,a,input,[role=button]')].forEach(el => el.style.pointerEvents = 'auto'); if (row) row.style.pointerEvents = 'auto'; } } const live = chars.length ? chars : [...h1.querySelectorAll('span')];
    live.forEach(sp => { if (getComputedStyle(sp).display === 'inline') sp.style.display = 'inline-block'; });
    h1.style.cursor = 'default';
    const lift = new Map(), apply = () => live.forEach(sp => { const v = lift.get(sp) || 0; sp.style.translate = v ? '0 ' + (-v) + 'em' : ''; });
    live.forEach(sp => { sp.style.cursor = 'default'; sp.style.transition = 'translate 260ms cubic-bezier(.2,0,0,1)'; });
    live.forEach((sp, i) => { if (!sp.textContent.trim()) return;
      sp.addEventListener('mouseenter', () => { if (reduced) return; lift.clear(); lift.set(sp, .24); [live[i - 1], live[i + 1]].forEach(n => { if (n && n.textContent.trim()) lift.set(n, .08); }); apply(); });
      sp.addEventListener('mouseleave', () => { lift.clear(); apply(); }); }); }
  const gx = gr.getContext('2d'); let gw = 0, gh = 0;
  const grain = () => { const w = Math.ceil(gr.clientWidth / 2), h = Math.ceil(gr.clientHeight / 2); if (!w) return; if (w !== gw || h !== gh){ gr.width = gw = w; gr.height = gh = h; }
    const im = gx.createImageData(gw, gh), d = im.data; for (let i = 0; i < d.length; i += 4){ const v = Math.random() * 255; d[i] = d[i+1] = d[i+2] = v; d[i+3] = 255; } gx.putImageData(im, 0, 0); };
  let mx = 0, my = 0, sx = 0, sy = 0, live = true, last = 0;
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, {passive:true});
  const t0 = performance.now(), CP = {cur: 0, tgt: 0, fired: false, done: () => { const b = $('start'); if (b) b.click(); }}; window.__coverCP = CP;
  function frame(now){ if (!live) return; const t = (now - t0) / 1000; sx += (mx - sx) * .04; sy += (my - sy) * .04;
    CP.cur += (CP.tgt - CP.cur) * .09; if (Math.abs(CP.tgt - CP.cur) < .0005) CP.cur = CP.tgt; const k = CP.cur, vh = innerHeight, sm = x => x * x * (3 - 2 * x);
    // 깊이: 바다(멀리) .4 · 안개1 1.0 · 안개2 1.6 · 제목 .7 · 시작 줄 .9
    sea.style.transform = 'translate3d(' + (sx * -14).toFixed(2) + 'px,' + (sy * -10 + Math.sin(t * .25) * 4 - k * vh * .18).toFixed(2) + 'px,0) scale(' + (1.04 + Math.sin(t * .12) * .01).toFixed(4) + ')';
    sea.style.filter = 'grayscale(1) contrast(1.04) blur(' + (k * 12).toFixed(2) + 'px)';
    cover.style.opacity = (1 - sm(clamp((k - .35) / .65, 0, 1))).toFixed(4); { const vg = $('cv-vig'); if (vg) vg.style.opacity = (1 - clamp(k * 2.5, 0, 1)).toFixed(3); }
    if (k >= .999 && !CP.fired){ CP.fired = true; CP.done(); }
    f1.style.transform = 'translate3d(' + (((t * 9) % 400) - 200 + sx * -36).toFixed(1) + 'px,' + (sy * -16 - k * vh * .4).toFixed(1) + 'px,0)'; f1.style.opacity = (1 - k).toFixed(3);
    f2.style.transform = 'translate3d(' + (200 - ((t * 15) % 400) + sx * -60).toFixed(1) + 'px,' + (sy * -26).toFixed(1) + 'px,0)';
    h1.style.transform = 'translate3d(' + (sx * 22).toFixed(2) + 'px,' + (sy * 14 + Math.sin(t * .5) * 2 - k * vh * .8).toFixed(2) + 'px,0)'; h1.style.opacity = (1 - sm(clamp(k / .6, 0, 1))).toFixed(3);
    if (row) row.style.transform = 'translate3d(' + (sx * 30).toFixed(2) + 'px,' + (sy * 18).toFixed(2) + 'px,0)';
    if (now - last > 160){ grain(); last = now; }
    requestAnimationFrame(frame); }
  if (!reduced) requestAnimationFrame(frame); else grain();
  if (reduced){ sea.style.opacity = 1; chars.forEach(c => c.style.opacity = 1); }
  else {
    sea.animate([{opacity:0, filter:'grayscale(1) contrast(1.04) blur(8px)'}, {opacity:1, filter:'grayscale(1) contrast(1.04) blur(0px)'}], {duration:2400, easing:EZ.out}).onfinish = () => {}; sea.style.opacity = 1;
    chars.forEach((c, i) => c.animate([{opacity:0, filter:'blur(10px)', transform:'translateY(.18em)'}, {opacity:.6, filter:'blur(3px)', offset:.55}, {opacity:1, filter:'blur(0px)', transform:'none'}], {duration:1600, delay:900 + i * 120, easing:'cubic-bezier(.2,.6,.2,1)', fill:'forwards'}));
  }
  { const ti = $('title-inner'), sb = $('start'), ln = $('start-dots'), nt = $('start-note'); if (ti){ ti.style.color = '#141210'; ti.style.alignItems = 'center'; ti.style.paddingLeft = ti.style.paddingRight = '0'; } if (row) row.style.alignItems = 'center'; if (sb){ sb.style.alignItems = 'flex-start'; sb.style.paddingLeft = '0'; } { const si = $('start-ink'); if (si){ si.style.fontFamily = "'NohHaeChan','Nanum Myeongjo',serif"; si.style.fontWeight = '400'; si.style.paddingLeft = '0'; } } if (sb) sb.style.color = '#141210'; if (ln) ln.style.background = '#141210'; if (nt) nt.style.color = '#4a463f'; }
  // 글자 노이즈: 가장자리가 아주 조금 거칠고, 군데군데 잉크가 덜 묻은 입자
  if (!document.getElementById('cv-txt-noise')){ const d = document.createElement('div'); d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    d.innerHTML = '<svg width="0" height="0"><filter id="cv-txt-noise" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G" result="d"/><feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="1" seed="3" result="n2"/><feColorMatrix in="n2" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.1 0 0 0 1.35" result="m"/><feComposite in="d" in2="m" operator="in"/></filter></svg>';
    d.id = 'cv-txt-noise-wrap'; document.body.appendChild(d); }
  h1.style.filter = 'url(#cv-txt-noise)'; { const si = $('start-ink'); if (si) si.style.filter = 'url(#cv-txt-noise)'; }
  place(); new ResizeObserver(place).observe(h1); { let shown = false; const show = () => { if (shown) return; shown = true; place(); h1.style.visibility = 'visible'; h1.animate([{filter: 'url(#cv-txt-noise) blur(6px)', clipPath: 'inset(0 0 0 0)'}, {filter: 'url(#cv-txt-noise) blur(0px)', clipPath: 'inset(0 0 0 0)'}], {duration: 900, easing: 'cubic-bezier(0,0,.2,1)'}); };
    (document.fonts ? document.fonts.load("40px 'NohHaeChan'", '숨겨진이야기에대하여').then(show, show) : Promise.resolve().then(show)); setTimeout(show, 3000); }
  const st = $('start'), sInk = $('start-ink'), sLine = $('start-dots');
  const hov = on => { if (sInk) sInk.style.letterSpacing = on ? '.46em' : '.32em'; if (sLine){ sLine.style.width = on ? '100%' : '28px'; sLine.style.opacity = on ? 1 : .7; } };
  if (st){ st.addEventListener('mouseenter', () => hov(true)); st.addEventListener('mouseleave', () => hov(false)); st.addEventListener('focus', () => hov(true)); st.addEventListener('blur', () => hov(false)); }
  const gearLight = () => { const gs = $('gear-svg'), gb = $('gear'); if (gs){ gs.style.transition = 'stroke 1200ms ' + EZ.sig; gs.style.stroke = '#f2efe9'; } if (gb) gb.style.opacity = ''; };
  return { open(){ gearLight(); live = false; cover.style.display = 'none'; } };
})();
// 인트로 영상: 타이틀 섹션 안에서 창을 꽉 채워 재생. '시작'을 누르면 소리와 함께 처음부터, 끝나거나 건너뛰면 본편으로
let introOn = false, introDone = false;
const iv = $('intro-video'), ictl = $('intro-ctl'), ibar = $('intro-bar'); let ivOk = false;
const IV_REST = 'brightness(.42) blur(7px) grayscale(.6)';
const ivReady = () => { if (ivOk) return; ivOk = true; iv.style.transition = 'none'; iv.style.opacity = 1; return;  iv.style.transition = 'opacity ' + D.slow + 'ms ' + EZ.sig; iv.style.opacity = 1; };
iv.addEventListener('loadedmetadata', ivReady); iv.addEventListener('loadeddata', ivReady); $('title').style.background = '#e8e6e2'; iv.style.background = 'transparent'; if (iv.readyState >= 1) ivReady();
iv.addEventListener('error', () => { ivOk = false; iv.style.display = 'none'; });
const fadeEl = (el, on, dy) => { el.style.transition = 'opacity ' + (on ? D.std : 280) + 'ms ' + (on ? EZ.out : EZ.in) + ', transform ' + (on ? D.std : 280) + 'ms ' + (on ? EZ.out : EZ.in);
  el.style.opacity = on ? 1 : 0; el.style.transform = on ? 'none' : 'translateY(' + dy + 'px)'; el.style.pointerEvents = on ? 'auto' : 'none'; };
const sndLabel = () => {};
function unmuteOnGesture(){ const f = () => { iv.muted = false; sndLabel(); ['pointerdown','keydown','touchstart'].forEach(ev => removeEventListener(ev, f, true)); }; ['pointerdown','keydown','touchstart'].forEach(ev => addEventListener(ev, f, true)); }
function introPlay(){
  if (!ivOk) return false; introOn = true; $('skip').style.display = 'none';
  window.scrollTo({top:0, behavior:'smooth'});
  iv.currentTime = 0; iv.muted = false; iv.volume = 1; iv.play().catch(() => { iv.muted = true; iv.play(); sndLabel(); unmuteOnGesture(); }); sndLabel();
  // 재생 모션: 버튼이 눌려 퍼지며 사라지고, 흐리고 어두운 정지 화면이 옛 영사기처럼 몇 번 깜박이며 밝아지고 초점이 맞는다. 컨트롤은 그 뒤에 올라온다
  const st = $('start');
  if (!reduced){
    st.animate([{transform:'scale(.96)', opacity:1}, {transform:'scale(1)', opacity:0}], {duration:D.std, easing:EZ.out, fill:'forwards'});
    iv.style.transition = 'none';
    iv.style.filter = ''; iv.style.transform = ''; iv.style.opacity = 1;
  } else { iv.style.filter = ''; iv.style.transform = ''; }
  COVER.open(); { const gs = $('gear-svg'), gb = $('gear'); if (gs){ gs.style.transition = 'stroke ' + D.slow + 'ms ' + EZ.sig; gs.style.stroke = '#f2efe9'; } if (gb) gb.style.opacity = ''; } fadeEl($('title-inner'), false, 12); setTimeout(() => fadeEl(ictl, true, 0), reduced ? 0 : D.slow); ensureTypeAudio(); return true;
}
// 끝나거나 건너뛰면 마지막 프레임을 그대로 두고, 다음은 스크롤에 맡긴다
// 마지막 프레임(수첩에 적는 할아버지)을 연필 소묘로 바꿔 둔다 → 스크롤하면 영상이 그림으로 번지고, 그림이 다음 섹션으로 넘겨준다
const isk = $('intro-sketch'); let skC = null;
const PAPER = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), d = x.createImageData(256, 256);
  for (let i = 0; i < d.data.length; i += 4){ const v = 242 * .98 + (Math.random() - .5) * 18; d.data[i] = v * .949 / .95; d.data[i+1] = v * .937 / .95; d.data[i+2] = v * .914 / .95; d.data[i+3] = 255; }
  x.putImageData(d, 0, 0); return 'url(' + c.toDataURL('image/png') + ')'; })();
// 마지막 프레임을 그대로 잡아 둔다 (소묘 변환 없음) — 검정 타일 전환의 바탕으로만 쓴다
function makeSketch(){
  try { const w = iv.videoWidth || 1280, h = iv.videoHeight || 720, c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(iv, 0, 0, w, h); skC = c; ier._n = -1; return true; }
  catch(e){ return false; }
}
function introEnd(){
  if (!introOn) return; introOn = false; introDone = true;
  const done = () => { iv.pause(); ibar.style.transform = 'scaleX(1)'; fadeEl(ictl, false, 0); makeSketch(); $('p2').style.display = 'none'; $('title').style.height = '370vh'; $('title').style.background = 'transparent'; };
  if (!iv.ended && iv.duration){ iv.addEventListener('seeked', done, {once:true}); iv.currentTime = Math.max(0, iv.duration - .05); } else done();
}
iv.addEventListener('ended', () => introEnd());
iv.addEventListener('timeupdate', () => { if (iv.duration) ibar.style.transform = 'scaleX(' + (iv.currentTime / iv.duration) + ')'; });
$('intro-skip').addEventListener('click', () => introEnd());
document.addEventListener('keydown', e => { if (introOn && e.key === 'Escape') introEnd(); });
new IntersectionObserver(en => { if (!introOn) return; if (en[0].intersectionRatio < .5) iv.pause(); else if (iv.paused && !iv.ended) iv.play().catch(() => {}); }, {threshold:[0, .5, 1]}).observe($('title-sticky'));
// 타이틀 이탈: 배경은 느리게(시차), 글자는 먼저 떠나며 흐려진다
// 인트로 → 2부 전환 (화면 고정, 스크롤로 조절)
//  0.10–1.20  마지막 프레임 위로 검은 세로 타일이 가운데부터 내려와 화면을 덮는다
//  1.90~      화면이 완전히 검게 덮이면 2부 제목이 타자기로 자모 하나씩 찍힌다 (타자 소리 · 끝에 종소리) → 이어서 2부 영상 자리가 아래에서 올라온다
const ier = $('intro-erase'), iwr = $('intro-write'); let wrSpans = null;
// 파도: 모래 위 그림이 밀려온 파도에 씻겨 나간다 (motion-design-skill: fluid 1.5×, overshoot 5%, 예비동작 → 밀려옴(감속) → 머묾 → 빠져나감(가속))
//  층: 주동작 = 물마루/거품선, 보조 = 그림이 번지고 씻김, 배경 = 젖은 모래가 마르고 거품이 꺼짐
// 먹 번짐 — 실제 먹 얼룩 이미지를 알파 마스크로 바꿔, 화면 가운데서부터 여러 겹이 조금씩 어긋나며 번져 나간다
//  (fluid 1.5×, 감속 진입 · 번짐 테두리가 한 박자 먼저 · 겹마다 지연과 회전이 달라 한 덩어리로 보이지 않게)
let inkImg = null, inkSoft = null;
(function loadInk(){ const im = new Image(); im.onload = () => { const S = 720, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'); x.drawImage(im, 0, 0, S, S);
  const d = x.getImageData(0, 0, S, S), p = d.data; for (let k = 0; k < p.length; k += 4){ const L = (p[k]*.3 + p[k+1]*.59 + p[k+2]*.11) / 255; p[k] = p[k+1] = p[k+2] = 10; p[k+3] = clamp((1 - L) * 1.15, 0, 1) * 255; }
  x.putImageData(d, 0, 0); inkImg = c;
  const t = document.createElement('canvas'); t.width = t.height = 80; t.getContext('2d').drawImage(c, 0, 0, 80, 80);
  const sf = document.createElement('canvas'); sf.width = sf.height = S; const sx = sf.getContext('2d'); sx.imageSmoothingEnabled = true; sx.imageSmoothingQuality = 'high'; sx.drawImage(t, 0, 0, S, S); inkSoft = sf; drawInk.pe = null; };
  im.src = 'assets/ink-blot.jpg'; })();
const INK_LAYERS = [[0, 0, 1], [.05, 2.1, .88], [.1, 4.2, .76], [.02, 1.2, .64], [.14, 3.3, .52]];
// Vertical Tiles (Mage-UI preloader/vertical-tiles 응용) — 세로 타일이 가운데부터 바깥으로 차례로 내려와 화면을 검게 덮는다
//  원본: minTileWidth 32 · duration .5 · stagger .05 · ease [.45,0,.55,1] · order = 가운데로부터의 거리. 여기서는 y:-100% → 0 으로 덮고, 시간 대신 스크롤로 진행
const TILE_MIN_W = 32, TILE_DUR = .5, TILE_STAGGER = .05;
const bez = (() => { const x1 = .45, y1 = 0, x2 = .55, y2 = 1; const bx = t => 3*x1*t*(1-t)*(1-t) + 3*x2*t*t*(1-t) + t*t*t, by = t => 3*y1*t*(1-t)*(1-t) + 3*y2*t*t*(1-t) + t*t*t;
  return x => { if (x <= 0) return 0; if (x >= 1) return 1; let lo = 0, hi = 1; for (let i = 0; i < 18; i++){ const m = (lo + hi) / 2; bx(m) < x ? lo = m : hi = m; } return by((lo + hi) / 2); }; })();
function drawInk(e, px){
  px = px || 0; const W = ier.clientWidth, H = ier.clientHeight; if (!W || !skC) return;
  if (drawInk.pe === e && drawInk.pp === px && drawInk.W === W && drawInk.H === H) return; drawInk.pe = e; drawInk.pp = px; drawInk.W = W; drawInk.H = H;
  const x = ier.getContext('2d'); if (ier.width !== W || ier.height !== H){ ier.width = W; ier.height = H; }
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.clearRect(0, 0, W, H);
  coverDraw(x, W, H, 0);
  if (e <= 0) return;
  const n = Math.max(3, Math.floor(W / TILE_MIN_W)), tw = W / n, mid = Math.floor((n - 1) / 2), maxO = Math.max(mid, n - 1 - mid);
  const total = TILE_DUR + maxO * TILE_STAGGER, t = clamp(e / .92, 0, 1) * total;
  x.fillStyle = '#f2efe9';
  for (let i = 0; i < n; i++){ const k = bez(clamp((t - Math.abs(i - mid) * TILE_STAGGER) / TILE_DUR, 0, 1)); if (k <= 0) continue;
    x.fillRect(Math.floor(i * tw), 0, Math.ceil(tw) + 1, Math.ceil(H * k)); }
  if (e >= .92){ x.fillRect(0, 0, W, H); }
  if (px > 0) pixelTo(x, W, H, px);
}
// 2부 영상으로: 아주 작은 픽셀들이 무작위 순서로 하나씩 색을 바꿔 영상 첫 화면이 된다 (스크롤 연동)
const PX = {cell: 3, c: null, thr: null, tgt: null, key: ''};
function pixTarget(cw, ch){ const t = document.createElement('canvas'); t.width = cw; t.height = ch; const x = t.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, cw, ch);
  const v = document.querySelector('#v2 video'); try { if (v && v.readyState >= 2){ const sc = Math.max(cw / v.videoWidth, ch / v.videoHeight), w = v.videoWidth * sc, h = v.videoHeight * sc; x.drawImage(v, (cw - w) / 2, (ch - h) / 2, w, h); } } catch(e){}
  return x.getImageData(0, 0, cw, ch).data; }
function pixelTo(x, W, H, px){ const cw = Math.ceil(W / PX.cell), ch = Math.ceil(H / PX.cell), key = cw + 'x' + ch;
  if (PX.key !== key){ PX.key = key; PX.done = false; PX.c = document.createElement('canvas'); PX.c.width = cw; PX.c.height = ch; PX.thr = new Float32Array(cw * ch); for (let i = 0; i < PX.thr.length; i++) PX.thr[i] = Math.random(); PX.tgt = null; }
  if (!PX.tgt) PX.tgt = pixTarget(cw, ch);
  const c = PX.c.getContext('2d'); if (!PX.done){ const im = c.createImageData(cw, ch), d = im.data, T = PX.tgt; for (let j = 0; j < d.length; j += 4){ d[j] = T[j]; d[j+1] = T[j+1]; d[j+2] = T[j+2]; d[j+3] = 255; } c.putImageData(im, 0, 0); PX.done = true; }
  x.globalAlpha = px * px * (3 - 2 * px); x.drawImage(PX.c, 0, 0, W, H); x.globalAlpha = 1; }
function pathEdge(){}
function coverDraw(x, W, H, dy){ const sc = Math.max(W / skC.width, H / skC.height), dw = skC.width * sc, dh = skC.height * sc; x.drawImage(skC, (W - dw)/2, (H - dh)/2 + (dy || 0), dw, dh); }
// 타자기 — 자모 하나씩 찍힌다 (초성 → 중성 → 종성). 한 번 찍힐 때마다 타자 소리, 끝나면 종소리
const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
function jamoSteps(ch){ const c = ch.charCodeAt(0) - 0xAC00; if (c < 0 || c > 11171) return [ch];
  const cho = Math.floor(c / 588), jung = Math.floor((c % 588) / 28), jong = c % 28, st = [CHO[cho], String.fromCharCode(0xAC00 + cho * 588 + jung * 28)]; if (jong) st.push(ch); return st; }
// 옛 타자기 한글 — 직접 그린 탈네모꼴 글꼴. 자모를 한 번씩 따로 찍는다 (초성 · 중성 · 종성, 겹자모는 두 번).
// 칸 폭은 고정, 윗선 맞춤, 받침은 아래로 늘어진다. 잉크는 SVG 필터로 거친 가장자리와 덜 묻은 자국을 낸다.
const TWF = (() => {
  if (!document.getElementById('tw-ink-defs')){ const d = document.createElement('div'); d.id = 'tw-ink-defs'; d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    d.innerHTML = '<svg width="0" height="0"><filter id="tw-ink" x="-15%" y="-15%" width="130%" height="130%">'
      + '<feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="d"/>'
      + '<feGaussianBlur in="d" stdDeviation=".9" result="b"/><feComponentTransfer in="b" result="t"><feFuncA type="linear" slope="3" intercept="-.6"/></feComponentTransfer>'
      + '<feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves="1" seed="11" result="n2"/><feColorMatrix in="n2" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.6 0 0 0 1.75" result="m"/>'
      + '<feComposite in="t" in2="m" operator="in"/></filter></svg>';
    document.body.appendChild(d); }
  if (!document.getElementById('tw-courier')){ const l = document.createElement('link'); l.id = 'tw-courier'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap'; document.head.appendChild(l); }
  const C = {
    'ㄱ': [[[0,0],[1,0],[1,1]]], 'ㄴ': [[[0,0],[0,1],[1,1]]], 'ㄷ': [[[1,0],[0,0],[0,1],[1,1]]],
    'ㄹ': [[[0,0],[1,0],[1,.5],[0,.5],[0,1],[1,1]]], 'ㅁ': [[[0,0],[1,0],[1,1],[0,1],[0,0]]], 'ㅂ': [[[0,0],[0,1],[1,1],[1,0]],[[0,.5],[1,.5]]],
    'ㅅ': [[[0,1],[.5,0],[1,1]]], 'ㅇ': [{e:[.5,.52,.46,.46]}], 'ㅈ': [[[0,0],[1,0]],[[0,1],[.5,0],[1,1]]],
    'ㅊ': [[[.5,-.1],[.5,.12]],[[0,.2],[1,.2]],[[0,1],[.5,.2],[1,1]]], 'ㅋ': [[[0,0],[1,0],[1,1]],[[0,.5],[1,.5]]],
    'ㅌ': [[[1,0],[0,0],[0,1],[1,1]],[[0,.5],[1,.5]]], 'ㅍ': [[[0,0],[1,0]],[[0,1],[1,1]],[[.3,0],[.3,1]],[[.7,0],[.7,1]]],
    'ㅎ': [[[.5,-.1],[.5,.1]],[[0,.18],[1,.18]],{e:[.5,.64,.42,.34]}]
  };
  const DBL = {'ㄲ':'ㄱㄱ','ㄸ':'ㄷㄷ','ㅃ':'ㅂㅂ','ㅆ':'ㅅㅅ','ㅉ':'ㅈㅈ','ㄳ':'ㄱㅅ','ㄵ':'ㄴㅈ','ㄶ':'ㄴㅎ','ㄺ':'ㄹㄱ','ㄻ':'ㄹㅁ','ㄼ':'ㄹㅂ','ㄽ':'ㄹㅅ','ㄾ':'ㄹㅌ','ㄿ':'ㄹㅍ','ㅀ':'ㄹㅎ','ㅄ':'ㅂㅅ'};
  const VV = {
    'ㅣ': [[[.5,0],[.5,1]]], 'ㅏ': [[[.4,0],[.4,1]],[[.4,.46],[.92,.46]]], 'ㅑ': [[[.4,0],[.4,1]],[[.4,.34],[.92,.34]],[[.4,.6],[.92,.6]]],
    'ㅓ': [[[.62,0],[.62,1]],[[.06,.46],[.62,.46]]], 'ㅕ': [[[.62,0],[.62,1]],[[.06,.34],[.62,.34]],[[.06,.6],[.62,.6]]],
    'ㅐ': [[[.22,0],[.22,1]],[[.22,.46],[.58,.46]],[[.86,0],[.86,1]]], 'ㅒ': [[[.22,0],[.22,1]],[[.22,.36],[.58,.36]],[[.22,.58],[.58,.58]],[[.86,0],[.86,1]]],
    'ㅔ': [[[.04,.46],[.44,.46]],[[.44,0],[.44,1]],[[.88,0],[.88,1]]], 'ㅖ': [[[.04,.36],[.44,.36]],[[.04,.58],[.44,.58]],[[.44,0],[.44,1]],[[.88,0],[.88,1]]]
  };
  const HV = {
    'ㅡ': [[[0,.62],[1,.62]]], 'ㅗ': [[[.5,.12],[.5,.62]],[[0,.62],[1,.62]]], 'ㅛ': [[[.32,.12],[.32,.62]],[[.68,.12],[.68,.62]],[[0,.62],[1,.62]]],
    'ㅜ': [[[0,.28],[1,.28]],[[.5,.28],[.5,.96]]], 'ㅠ': [[[0,.28],[1,.28]],[[.32,.28],[.32,.96]],[[.68,.28],[.68,.96]]]
  };
  const COMP = {'ㅘ':'ㅗㅏ','ㅙ':'ㅗㅐ','ㅚ':'ㅗㅣ','ㅝ':'ㅜㅓ','ㅞ':'ㅜㅔ','ㅟ':'ㅜㅣ','ㅢ':'ㅡㅣ'}, WIDE = 'ㅐㅒㅔㅖ';
  const CHOS = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ', JUNGS = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ', JONGS = ['', ...'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ'];
  const f = v => v.toFixed(1), R = () => Math.random();
  // 한 자모 → {d: 기본 획, v: 세로 획(더 굵게), s: 획 끝 세리프}
  function jamo(shape, b, sw){ const o = {d: '', v: '', s: ''};
    shape.forEach(sh => {
      if (sh.e){ const cx = b[0] + sh.e[0]*b[2], cy = b[1] + sh.e[1]*b[3], rx = sh.e[2]*b[2], ry = sh.e[3]*b[3];
        o.d += 'M' + f(cx - rx) + ' ' + f(cy) + 'a' + f(rx) + ' ' + f(ry) + ' 0 1 0 ' + f(2*rx) + ' 0a' + f(rx) + ' ' + f(ry) + ' 0 1 0 ' + f(-2*rx) + ' 0'; return; }
      const P = sh.map(([x, y]) => [b[0] + x*b[2] + (R() - .5) * .8, b[1] + y*b[3] + (R() - .5) * .8]);
      o.d += 'M' + P.map(p => f(p[0]) + ' ' + f(p[1])).join('L');
      for (let i = 1; i < P.length; i++){ const dx = P[i][0] - P[i-1][0], dy = P[i][1] - P[i-1][1]; if (Math.abs(dx) < Math.abs(dy) * .25) o.v += 'M' + f(P[i-1][0]) + ' ' + f(P[i-1][1]) + 'L' + f(P[i][0]) + ' ' + f(P[i][1]); }
      [[P[0], P[1]], [P[P.length-1], P[P.length-2]]].forEach(([e, q]) => { const dx = e[0] - q[0], dy = e[1] - q[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L; if (Math.abs(ux) > .2 && Math.abs(uy) > .2) return; const nx = -uy, ny = ux, h = sw * (.7 + R() * .25), bx = e[0] - ux * sw * .15, by = e[1] - uy * sw * .15;
        o.s += 'M' + f(bx - nx*h) + ' ' + f(by - ny*h) + 'L' + f(bx + nx*h) + ' ' + f(by + ny*h); });
    });
    return o; }
  const cons = (ch, b, sw) => { if (DBL[ch]){ const w = b[2] * .45; return [jamo(C[DBL[ch][0]], [b[0], b[1], w, b[3]], sw), jamo(C[DBL[ch][1]], [b[0] + b[2] - w, b[1], w, b[3]], sw)]; } return [jamo(C[ch], b, sw)]; };
  // 네모꼴 배치 (받침이 있으면 위를 줄여 칸 안에 넣는다)
  function strikes(ch, sw){ const c = ch.charCodeAt(0) - 0xAC00; if (c < 0 || c > 11171) return null;
    const cho = CHOS[Math.floor(c / 588)], jung = JUNGS[Math.floor((c % 588) / 28)], jong = JONGS[c % 28], comp = COMP[jung], type = comp ? 'C' : HV[jung] ? 'H' : 'V', wide = WIDE.includes(comp ? comp[1] : jung);
    let out = [];
    if (!jong){
      if (type === 'V'){ out = out.concat(cons(cho, wide ? [6,14,34,70] : [8,14,40,70], sw)); out.push(jamo(VV[jung], wide ? [42,2,56,96] : [52,2,44,96], sw)); }
      else if (type === 'H'){ out = out.concat(cons(cho, [20,6,60,44], sw)); out.push(jamo(HV[jung], [4,50,92,46], sw)); }
      else { out = out.concat(cons(cho, [8,6,40,38], sw)); out.push(jamo(HV[comp[0]], [4,48,58,46], sw)); out.push(jamo(VV[comp[1]], wide ? [58,2,40,94] : [66,2,30,94], sw)); }
    } else {
      if (type === 'V'){ out = out.concat(cons(cho, wide ? [6,6,34,40] : [8,6,40,40], sw)); out.push(jamo(VV[jung], wide ? [42,0,56,60] : [52,0,44,60], sw)); }
      else if (type === 'H'){ out = out.concat(cons(cho, [22,2,56,26], sw)); out.push(jamo(HV[jung], [4,30,92,30], sw)); }
      else { out = out.concat(cons(cho, [8,2,38,26], sw)); out.push(jamo(HV[comp[0]], [4,30,56,28], sw)); out.push(jamo(VV[comp[1]], wide ? [58,0,40,60] : [66,0,30,60], sw)); }
      out = out.concat(cons(jong, [16,70,68,27], sw));
    }
    return out; }
  const NS = 'http://www.w3.org/2000/svg';
  function strikeEl(inner, vbw){ const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + vbw + ' 100'); svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;visibility:hidden;transform-origin:50% 50%'; svg.innerHTML = '<g filter="url(#tw-ink)">' + inner + '</g>'; return svg; }
  const pth = (d, w, op) => d ? '<path d="' + d + '" stroke="currentColor" fill-opacity="1"' + (op ? ' stroke-opacity="' + op + '"' : '') + ' stroke-width="' + w.toFixed(1) + '" fill="none" stroke-linecap="butt" stroke-linejoin="miter"/>' : '';
  // 실제 글꼴(고운바탕 굵게, OFL)로 찍고 잉크 필터로 타자 자국을 낸다. 한 칸 안에서 ㅇ → 여 → 연 처럼 단계가 바뀐다
  if (!document.getElementById('tw-gowun')){ const l = document.createElement('link'); l.id = 'tw-gowun'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@700&display=swap'; document.head.appendChild(l); }
  const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  function build(T, line, text, row){ line.textContent = ''; line.setAttribute('aria-label', text);
    line.style.display = 'inline-flex'; line.style.flexWrap = 'wrap'; line.style.justifyContent = 'center'; line.style.whiteSpace = 'nowrap'; line.style.maxWidth = '100%';
    [...text].forEach(ch => {
      if (ch === ' '){ const sp = document.createElement('span'); sp.style.cssText = 'display:inline-block;flex:none;width:.42em;height:1em;vertical-align:top'; line.appendChild(sp); T.steps.push({ink: null, space: true, last: true, row}); return; }
      const hangul = /[가-힣]/.test(ch), punct = /[,.!?:;'’]/.test(ch), cell = document.createElement('span'), vbw = hangul ? 100 : punct ? 34 : 62;
      cell.style.cssText = 'position:relative;display:inline-block;height:1em;vertical-align:top;flex:none;width:' + (vbw / 100 * .92).toFixed(3) + 'em'; line.appendChild(cell);
      const fam = hangul ? "Gowun Batang,'Nanum Myeongjo',serif" : "Courier Prime,'Courier New',monospace", steps = hangul ? jamoSteps(ch) : [ch];
      const tf = 'translate(' + ((R() - .5) * .03).toFixed(3) + 'em,' + ((R() - .5) * .05).toFixed(3) + 'em) rotate(' + ((R() - .5) * 2.4).toFixed(2) + 'deg)', op = (.88 + R() * .12).toFixed(2);
      const dbl = R() < .35, dx = (R() * 1.6 + .4).toFixed(1), dy = (R() * 1.1).toFixed(1); let prev = null;
      steps.forEach((stp, k) => { const tx = '<text x="' + (vbw / 2) + '" y="86" text-anchor="middle" font-family="' + fam + '" font-weight="700" font-size="100" fill="currentColor">' + esc(stp) + '</text>';
        const el = strikeEl((dbl ? '<g transform="translate(' + dx + ' ' + dy + ')" opacity=".22">' + tx + '</g>' : '') + tx, vbw);
        el.style.transform = tf; el.style.opacity = op; cell.appendChild(el); T.steps.push({ink: el, prev, tf, op, space: false, last: k === steps.length - 1, row}); prev = el; });
    }); }
  return {build};
})();
function typeInto(T, line, text, row){ TWF.build(T, line, text, row); }
function makeTyper(noEl, lineEl, noTxt, txt){ const T = {steps: [], i: 0, next: 0, bell: false}; typeInto(T, noEl, noTxt, 0); typeInto(T, lineEl, txt, 1); return T; }
let tac = null;
function ensureTypeAudio(){ try { if (!tac){ tac = new (window.AudioContext || window.webkitAudioContext)(); const len = Math.round(tac.sampleRate * .25), b = tac.createBuffer(1, len, tac.sampleRate), d = b.getChannelData(0); for (let k = 0; k < len; k++) d[k] = Math.random() * 2 - 1; tac._n = b; }
  if (tac.state === 'suspended') tac.resume(); } catch(err){} }
['pointerdown','keydown','touchstart'].forEach(ev => addEventListener(ev, ensureTypeAudio, {passive:true}));
function typeClick(soft){
  if (!tac || tac.state !== 'running' || (introOn || introDone) && iv.muted) return; const t = tac.currentTime + .005, r = .85 + Math.random() * .3, v = soft ? .55 : 1, out = tac.destination;
  const n = tac.createBufferSource(); n.buffer = tac._n; n.playbackRate.value = r; const bp = tac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2400 * r; bp.Q.value = 1.1;
  const g = tac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.6 * v, t + .002); g.gain.exponentialRampToValueAtTime(.001, t + .055); n.connect(bp); bp.connect(g); g.connect(out); n.start(t); n.stop(t + .09);
  const o = tac.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(210 * r, t); o.frequency.exponentialRampToValueAtTime(65, t + .07); const og = tac.createGain(); og.gain.setValueAtTime(.4 * v, t); og.gain.exponentialRampToValueAtTime(.001, t + .09); o.connect(og); og.connect(out); o.start(t); o.stop(t + .11);
  const n2 = tac.createBufferSource(); n2.buffer = tac._n; const hp = tac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 5200; const g2 = tac.createGain();
  g2.gain.setValueAtTime(0, t + .014); g2.gain.linearRampToValueAtTime(.22 * v, t + .016); g2.gain.exponentialRampToValueAtTime(.001, t + .05); n2.connect(hp); hp.connect(g2); g2.connect(out); n2.start(t + .012); n2.stop(t + .07);
}
// 타자가 끝나면 종소리 대신 낮은 현악 화음이 얕게 깔렸다 사라진다 (D단조: 첼로·비올라 음역, 느린 어택, 긴 릴리스)
function typeBell(){ if (!tac || tac.state !== 'running' || (introOn || introDone) && iv.muted) return;
  const t = tac.currentTime + .05, out = tac.createGain(), lp = tac.createBiquadFilter(), rv = tac.createDelay(1), fb = tac.createGain(), wet = tac.createGain();
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(380, t); lp.frequency.linearRampToValueAtTime(900, t + 2.2); lp.frequency.linearRampToValueAtTime(420, t + 6); lp.Q.value = .4;
  out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(.085, t + 1.8); out.gain.setValueAtTime(.085, t + 3.2); out.gain.linearRampToValueAtTime(0, t + 6.5);
  rv.delayTime.value = .19; fb.gain.value = .45; wet.gain.value = .35; lp.connect(out); out.connect(tac.destination); out.connect(rv); rv.connect(fb); fb.connect(rv); rv.connect(wet); wet.connect(tac.destination);
  [73.42, 110, 146.83, 174.61, 220].forEach((f, i) => [-6, 0, 7].forEach(dt => { const o = tac.createOscillator(), g = tac.createGain(), vib = tac.createOscillator(), vg = tac.createGain();
    o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = dt + (Math.random() - .5) * 4; vib.frequency.value = 4.6 + Math.random() * .8; vg.gain.value = 3.5; vib.connect(vg); vg.connect(o.detune);
    g.gain.value = (i === 0 ? .5 : i === 4 ? .22 : .34) / 3; o.connect(g); g.connect(lp); o.start(t + i * .12); vib.start(t); o.stop(t + 7); vib.stop(t + 7); })); }
function runTyper(T, on){
  if (!on){ if (T.i > 0 || T.next){ T.steps.forEach(st => { if (st.ink) st.ink.style.visibility = 'hidden'; }); T.i = 0; T.next = 0; T.bell = false; } return; }
  const now = performance.now(); if (!T.next){ T.next = now + 380; T.lockY = Math.round(window.scrollY); }
  if (reduced){ T.steps.forEach(st => { if (st.ink) st.ink.style.visibility = st.last ? 'visible' : 'hidden'; }); T.i = T.steps.length; return; }
  let guard = 0;
  while (T.i < T.steps.length && now >= T.next && guard++ < 6){
    const st = T.steps[T.i], nx = T.steps[T.i + 1]; if (st.prev) st.prev.style.visibility = 'hidden'; if (st.ink) st.ink.style.visibility = 'visible';
    if (st.ink) st.ink.animate([{opacity: .15, transform: st.tf + ' translateY(-.05em) scale(1.07)'}, {opacity: +st.op, transform: st.tf}], {duration: 90, easing: EZ.out});
    typeClick(st.space || st.row === 0); T.i++;
    T.next += st.space ? 230 : (nx && nx.row !== st.row) ? 520 : (st.last ? 120 : 75) + Math.random() * 70;
  }
  if (T.i >= T.steps.length && !T.bell){ T.bell = true; setTimeout(typeBell, 180); }
}
// 제목: 타자 대신 표지와 같은 노회찬체로, 스크롤에 따라 층별로 떠오른다 (data-depth)
function plainTitle(no, h2, noTxt, txt){ no.textContent = noTxt; h2.textContent = txt;
  no.style.fontFamily = "'GriunKimTang','Griun KimTang','그리운 김탕체','NohHaeChan',serif"; h2.style.fontFamily = "'NohHaeChan','Nanum Myeongjo',serif"; [no, h2].forEach(el => { el.style.fontWeight = '400'; el.style.textShadow = 'none'; });
  h2.style.letterSpacing = '-.01em'; h2.style.webkitTextStroke = '.035em currentColor'; h2.style.paintOrder = 'stroke fill'; no.style.letterSpacing = '.24em'; }
if (!document.getElementById('ff-kimtang')){ const st = document.createElement('style'); st.id = 'ff-kimtang'; st.textContent = "@font-face{font-family:'GriunKimTang';src:local('그리운 김탕체'),local('그리운김탕체'),local('Griun KimTang'),local('GriunKimTang'),local('Griun KimTang Regular'),local('GriunKimTang-Regular'),local('Griun_KimTang'),url('assets/fonts/GriunKimTang.woff2') format('woff2'),url('assets/fonts/GriunKimTang.woff') format('woff'),url('assets/fonts/GriunKimTang.ttf') format('truetype'),url('assets/fonts/GriunKimTang.otf') format('opentype');font-display:swap}"; document.head.appendChild(st); }
const cards = [...document.querySelectorAll('[data-part]')].map(sec => { const h2 = sec.querySelector('[data-part-title]'), no = sec.querySelector('[data-part-no]'), txt = h2.textContent.trim(), noTxt = no.textContent.trim();
  no.style.opacity = 1; plainTitle(no, h2, noTxt, txt); return {sec, no, txt, noTxt, T: {steps: [], i: 0, next: 0, bell: false}}; });
function partCards(y, vh){ cards.forEach(c => { if (c.sec.style.display === 'none') return; const top = c.sec.offsetTop, h = c.sec.offsetHeight;
  if (y < top - vh * 1.2 || y > top + h){ if (c.T.i || c.T.next) runTyper(c.T, false); return; } runTyper(c.T, y >= top - vh * .12); }); }
let TT = null;
function typeTitle(on, px, rv){
  if (!TT){ iwr.textContent = ''; iwr.style.color = '#141210'; iwr.style.textShadow = 'none';
    const c2 = cards.find(c => c.sec.id === 'p2'), lb = document.createElement('div'), line = document.createElement('div');
    lb.style.cssText = "font-size:16px;font-weight:400;letter-spacing:.3em;color:#4a463f;margin-bottom:22px;min-height:1.4em"; iwr.appendChild(lb); iwr.appendChild(line);
    plainTitle(lb, line, c2 ? c2.noTxt : 'CHAPTER 1', c2 ? c2.txt : ''); lb.style.transition = line.style.transition = 'none'; TT = {steps: [], i: 0, next: 0, bell: false, lb, line}; }
  const k = clamp(rv || 0, 0, 1), vh = innerHeight, p = clamp(px || 0, 0, 1), mix = (a, b) => 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * p)).join(',') + ')';
  iwr.style.opacity = 1; TT.lb.style.opacity = TT.line.style.opacity = clamp(k * 8, 0, 1).toFixed(3);
  TT.lb.style.transform = 'translate3d(0,' + ((.6 - k * 1.25) * vh).toFixed(1) + 'px,0)'; TT.line.style.transform = 'translate3d(0,' + ((.6 - k * 1.2) * vh).toFixed(1) + 'px,0)';
  iwr.style.color = mix([20, 18, 16], [242, 239, 233]); TT.lb.style.color = mix([74, 70, 63], [189, 184, 174]);
  runTyper(TT, on);
}
function titleFx(y, vh){
  const u = y / vh;
  if (introDone){
    const er = clamp((u - .1) / 1.1, 0, 1), px = clamp((u - 1.35) / 1.05, 0, 1);
    isk.style.opacity = 0; ier.style.opacity = er > 0 && skC ? 1 : 0; ier.style.transform = 'none'; iv.style.filter = '';
    iv.style.visibility = er > 0 && skC ? 'hidden' : 'visible';
    drawInk(reduced ? (er > 0 ? 1 : 0) : er, reduced ? (px > .5 ? 1 : 0) : px); typeTitle(er >= 1, px, clamp((u - 1.05) / 1.5, 0, 1));
    $('title-par').style.opacity = 1; $('title-par').style.transform = 'none';
    return;
  }
  const p = clamp(u, 0, 1); if (p >= 1 && titleFx.done) return; titleFx.done = p >= 1;
  if (introOn || introDone){ const ti = $('title-inner'); ti.style.opacity = 0; ti.style.pointerEvents = 'none'; ti.style.visibility = 'hidden'; }
  if (reduced){ if (!introOn && !introDone) $('title-inner').style.opacity = 1 - p; return; }
  $('title-par').style.transform = 'translate3d(0,' + (p * 35) + '%,0) scale(' + (1 + .06*p) + ')';
  $('title-inner').style.transform = 'translate3d(0,' + (-p * 60) + 'px,0)';
  if (!introOn && !introDone) $('title-inner').style.opacity = clamp(1 - p * 1.6, 0, 1);
}
// 크레딧·기록실: 묶음 단위로 80ms씩 차례로 올라온다(총 400ms 이내). 마지막 폴라로이드는 종이처럼 살짝 넘치고 자리 잡는다
(function reveal(){
  const els = [...document.querySelectorAll('[data-rev]')];
  if (reduced || !('IntersectionObserver' in window)) return;
  els.forEach(el => { el.style.opacity = 0; el.style.transform = 'translateY(16px)'; });
  const io = new IntersectionObserver(ents => ents.forEach(en => {
    if (!en.isIntersecting) return; io.unobserve(en.target); const el = en.target;
    const sib = [...el.parentElement.children].filter(x => x.hasAttribute('data-rev')), i = Math.min(4, sib.indexOf(el));
    el.style.transition = 'opacity 600ms ' + EZ.out + ' ' + (i*80) + 'ms, transform 600ms ' + EZ.out + ' ' + (i*80) + 'ms';
    el.style.opacity = 1; el.style.transform = 'none';
  }), {rootMargin:'0px 0px -12% 0px'});
  els.forEach(el => io.observe(el));
  const pol = $('pol'); if (!pol) return; pol.style.opacity = 0;
  const io2 = new IntersectionObserver(ents => { if (!ents[0].isIntersecting) return; io2.disconnect(); pol.style.opacity = 1;
    pol.animate([{opacity:0, transform:'translateY(-28px) rotate(-11deg)', boxShadow:'0 2px 4px rgba(0,0,0,0)'},{opacity:1, transform:'translateY(2px) rotate(-2.6deg)', offset:.7, boxShadow:'0 18px 30px rgba(0,0,0,.6)'},{opacity:1, transform:'rotate(-3deg)', boxShadow:'0 10px 22px rgba(0,0,0,.55)'}], {duration:D.slow, easing:EZ.sig, fill:'forwards'});
  }, {rootMargin:'0px 0px -15% 0px'});
  io2.observe(pol);
})();

})();

// 챕터 전환 — 다음 챕터가 아래에서 덮어 올라오는 동안 앞 챕터는 늦게 따라 올라가며 작아지고 어두워진다.
// 같은 화면 안의 요소들은 data-depth 값에 따라 서로 다른 속도로 움직인다 (깊을수록 느리게, 가까울수록 빠르게)
(function chapters(){
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), ease = t => 1 - Math.pow(1 - t, 3);
  const secs = [...document.querySelectorAll('[data-part],[data-video-slot],#credits')];
  [...document.querySelectorAll('[data-part],[data-video-slot],[data-comic],#credits')].forEach(sec => { sec.style.boxShadow = 'none';
    let pv = sec.previousElementSibling; while (pv && (getComputedStyle(pv).display === 'none' || pv.tagName === 'DIV')) pv = pv.previousElementSibling;
    if (!pv || pv.hasAttribute('data-part') || pv.hasAttribute('data-comic') || pv.id === 'title') return; const c = getComputedStyle(pv).backgroundColor; if (c === getComputedStyle(sec).backgroundColor) return;
    const g = document.createElement('div'); g.setAttribute('aria-hidden', 'true'); g.style.cssText = 'position:absolute;left:0;right:0;top:-1px;height:45vh;pointer-events:none;z-index:6;background:linear-gradient(' + c + ',' + c.replace('rgb(', 'rgba(').replace(')', ',0)') + ')'; sec.appendChild(g); });
  const inner = el => { const f = el.firstElementChild; return f && getComputedStyle(f).position === 'sticky' ? f : null; };
  const layers = secs.map(sec => ({sec, pin: inner(sec), prev: sec.previousElementSibling, deps: [...sec.querySelectorAll('[data-depth]')].map(el => ({el, d: +el.dataset.depth}))}));
  const lum = c => { const m = (c || '').match(/\d+(\.\d+)?/g) || [0, 0, 0]; return (+m[0] * .3 + +m[1] * .59 + +m[2] * .11) / 255; };
  function partFx(L, q, vh){
    if (!L.ov){ const nx = L.sec.nextElementSibling, bg = nx ? getComputedStyle(nx).backgroundColor : '#000', ov = document.createElement('div'); ov.setAttribute('aria-hidden', 'true');
      ov.style.cssText = 'position:absolute;inset:0;pointer-events:none;opacity:0;background:' + bg; const v = nx && nx.querySelector('video');
      if (v){ const c = v.cloneNode(); c.removeAttribute('id'); c.muted = true; c.autoplay = false; c.preload = 'auto'; c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover'; ov.appendChild(c); }
      L.pin.insertBefore(ov, L.pin.firstChild); L.ov = ov; L.box = L.pin.querySelector('[data-part-title]').parentElement; L.box.style.position = 'relative';
      L.c0 = getComputedStyle(L.sec).color; L.c1 = lum(bg) < .5 ? 'rgb(242,239,233)' : 'rgb(20,18,16)'; L.light = lum(getComputedStyle(L.pin).backgroundColor) > .5; }
    const f = q * q * (3 - 2 * q), a = L.c0.match(/\d+/g).map(Number), b = L.c1.match(/\d+/g).map(Number), sw = (lum(L.c0) > .5) === (lum(L.c1) > .5) ? 0 : clamp((f - .46) / .08, 0, 1), mix = 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * sw)).join(',') + ')';
    L.ov.style.opacity = f.toFixed(3); L.box.style.color = mix;
    L.deps.forEach(({el, d}) => { el.style.opacity = 1; el.style.transform = 'translate3d(0,' + ((.55 - q * 1.1) * .8 * vh * (1 + d * .35)).toFixed(1) + 'px,0)'; if (el.hasAttribute('data-part-no')) el.style.color = mix; });
  }
  function frame(){
    const vh = innerHeight;
    layers.forEach(L => { const r = L.sec.getBoundingClientRect(); if (r.bottom < -vh * .2 || r.top > vh * 1.2 || L.sec.style.display === 'none') return;
      const e = clamp(1 - r.top / vh, 0, 1), span = Math.max(1, r.height - vh), q = clamp(-r.top / span, 0, 1);
      if (L.sec.hasAttribute('data-part') && L.pin){ partFx(L, q, vh); }
      if (!(L.sec.hasAttribute('data-part') && L.pin)) L.deps.forEach(({el, d}) => { const y = (1 - ease(e)) * vh * d * .55 + (L.pin ? (.5 - q) * vh * d * .35 : 0); el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)'; el.style.opacity = clamp(e * 1.6 - d * .4, 0, 1).toFixed(3); });
    });
    requestAnimationFrame(frame);
  }
  if (!reduced) requestAnimationFrame(frame);
})();

// 대사 상자 위치: 코드에 고정된 값(CAP_BAKED) → 이 브라우저에서 옮긴 값(localStorage) 순으로 덮어쓴다
const CAP_BAKED = {"4-0-0":{"l":-26.6,"t":-14.82},"4-8-1":{"l":82.62,"t":3.89,"w":44.17},"4-8-0":{"l":37.42,"t":-16.56,"w":69.98},"4-1-0":{"l":-13.83,"t":5.25,"w":61.26},"4-5-1":{"l":-31.38,"t":20.57,"w":71.45},"4-4-0":{"l":-22.52,"t":-25.36,"w":81.08},"4-0-1":{"l":63.12,"t":78.98},"4-1-1":{"l":52.96,"t":88.71,"w":53.95},"4-2-0":{"l":-12.4,"t":92.73,"w":75.54},"4-3-0":{"l":-48.67,"t":5.36,"w":78.73},"4-4-1":{"l":71.89,"t":-7.42,"w":62.15},"4-4-2":{"l":36.18,"t":101.72,"w":79.04},"4-5-0":{"l":-25.89,"t":1.42,"w":47.52},"4-5-2":{"l":24.47,"t":128.19},"4-6-0":{"l":-32.21,"t":-10.1,"w":41.1},"4-6-1":{"l":87.15,"t":10.84,"w":54.35},"4-6-2":{"l":10.87,"t":139.66},"4-7-0":{"l":-18.35,"t":44.18,"w":50.74},"4-7-1":{"l":80.17,"t":89.67,"w":39.49},"4-8-2":{"l":63.8,"t":92.02,"w":61.31},"5-2-0":{"l":-15.7,"t":-4.3},"5-2-1":{"l":71.74,"t":14.21,"w":39.83},"5-3-0":{"l":-30.27,"t":-17.6,"w":64.48},"5-3-1":{"l":60.94,"t":87.24,"w":53.91},"5-3-2":{"l":24.74,"t":147.96},"5-4-0":{"l":-16.7,"t":7.64,"w":84.26},"5-4-1":{"l":47.5,"t":89.16,"w":83.11},"5-5-0":{"l":56.74,"t":-6.38,"w":49.82},"5-5-1":{"l":75.35,"t":11.52,"w":38.72},"5-5-2":{"l":23.4,"t":108.33,"w":56.15},"5-6-0":{"l":-33,"t":85.71,"w":57.11},"5-6-1":{"l":64.43,"t":138.67,"w":38.45},"5-7-1":{"l":73.39,"t":21.54,"w":55.56},"5-8-2":{"l":0.61,"t":126.18,"w":102.75},"5-8-1":{"l":71.57,"t":73.01,"w":65.24},"5-8-0":{"l":-34.97,"t":23.31,"w":53.49},"5-10-0":{"l":27.03,"t":-31.27},"5-10-1":{"l":28.49,"t":150.97},"img:4-0":{"x":50,"y":28.9,"s":100},"img:4-1":{"x":50,"y":37.4,"s":100},"img:4-3":{"x":0,"y":64.7,"s":119.1},"img:4-4":{"x":50,"y":17.6,"s":100},"img:4-2":{"x":50,"y":50,"s":100},"frame:4-4":{"fw":51.4},"img:4-5":{"x":92,"y":50,"s":124.96},"img:4-7":{"x":50,"y":50,"s":100},"img:4-6":{"x":50,"y":50,"s":100},"img:5-1":{"x":50,"y":50,"s":100},"5-1-0":{"w":77.51},"img:5-2":{"x":85.5,"y":50,"s":124.96},"img:5-3":{"x":50,"y":58.6,"s":100},"img:5-4":{"x":50,"y":50,"s":100},"img:5-5":{"x":50,"y":50,"s":124.96},"img:5-6":{"x":50,"y":50,"s":100},"img:5-7":{"x":50,"y":50,"s":100},"5-7-0":{"w":50.6},"5-9-0":{"l":-30.8,"t":-9.49},"img:5-9":{"x":50,"y":50,"s":100},"5-9-1":{"w":64.11,"l":64.56,"t":97.45},"img:5-10":{"x":50,"y":100,"s":100},"frame:5-10":{"fw":64.11},"img:4-8":{"x":50,"y":50,"s":124.96},"5-0-0":{"w":50.53},"img:5-8":{"x":50,"y":50,"s":124.96}};
const CAP_FIX = {"4-0-0":["이곡2리에서는 조금 더","오래된 이야기를 만날 수 있었습니다."],"4-0-1":["‘초분’이라는 장례 절차였습니다."],"4-1-0":["돌아가신 분을 바로 땅에 묻지 않고,","한동안 시신의 곁을 지키는 겁니다."],"4-1-1":["살이 썩고, 뼈만 남았을 때에야","비로소 땅에 묻었죠."],"4-4-1":["삼년상을 모시는 자식에게 그만두라니,","이런 불효가 어디 있느냐고요."],"4-4-2":["결국 순사는 효자라며","아버님을 돌려보냈습니다."],"4-5-1":["이장님의 할머니, 할아버지 되시는 분들의","기록된 사망 연도가 모두","해방 이후였던 겁니다."],"4-6-0":["실마리는 이장님의 한마디에 있었습니다."],"4-6-1":["상을 다 치르기 전까지는,","돌아가신 게 아니라","여전히 한 식구였다는 겁니다."],"4-7-1":["시신이 뼈만 남을 때까지","곁을 지켰습니다."],"4-8-0":["기록상 시기가 일치하지 않는 부분도,","초분의 성격을 생각해 보면 그 이유를","알 수 있었습니다."],"4-8-1":["이런 것들을 하나하나","찾아가는 과정 속에서,"],"4-8-2":["그 시절 어른들이 가지고 계시던","생각을 알 수 있었습니다."],"5-2-1":["어르신들은 그곳을","‘애장터’라고 불렀습니다."],"5-3-1":["그러지 못한 아이들에게는","올려 줄 제사도 없었습니다."],"5-4-1":["관례도, 혼례도 치르지 않은 아이에게 상여를 내주는 것은","허락되지 않는 일이었으니까요."],"5-5-0":["그런데 그 규율을","어기는 경우도 있었습니다."],"5-5-1":["상여는 꾸리지 못하니, 뚜껑만","수레에 얹어 아이를 보낸 겁니다."],"5-7-1":["뚜껑 하나 얹어 아이를 보낸 부모도,","모두 한 시대를 살아낸 사람들입니다."],"5-8-1":["그 곁에서 슬퍼하고, 지키고, 떠나보낸","마음까지 들여다볼 때 그 시절의 삶이","온전히 보였습니다."],"5-8-2":["결국 저희가 찾아 나선 건 의례가 아니라, 사람이었습니다."],"5-9-1":["하지만 남은 건, 한 사람 한 사람이","안고 살아온 저마다의 이야기였습니다."]};
const CAPPOS = { reg: [], LS: 'mm-cap-pos', load(){ try { return JSON.parse(localStorage.getItem(this.LS) || '{}'); } catch(e){ return {}; } }, get(k){ return this.load()[k] || CAP_BAKED[k]; }, set(k, v){ const o = this.load(); o[k] = Object.assign({}, o[k] || CAP_BAKED[k] || {}, v); localStorage.setItem(this.LS, JSON.stringify(o)); }, clear(){ localStorage.removeItem(this.LS); } };
window.__mmCapPos = CAPPOS;
// 4부·5부 만화 — 배경(종이·먹 번짐)과 만화 칸, 칸 속 말풍선이 각자 다른 속도로 스크롤을 따라간다
(function comics(){
  const MQ = () => innerWidth < 760 ? 'P' : innerHeight < 520 ? 'L' : '';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), sm = x => x * x * (3 - 2 * x);
  if (!customElements.get('image-slot')){ const sc = document.createElement('script'); sc.src = './image-slot.js'; document.head.appendChild(sc); }
  const A = 'assets/', DATA = {
    4: [['c-straw.jpg', ['이곡2리에서는 조금 더 오래된 이야기를 만날 수 있었습니다.', '‘초분’이라는 장례 절차였습니다.']],
        [null, ['돌아가신 분을 바로 땅에 묻지 않고, 한동안 시신의 곁을 지키는 겁니다.', '살이 썩고, 뼈만 남았을 때에야 비로소 땅에 묻었죠.'], '짚으로 덮은 초분'],
        ['c-gat.jpg', ['이장님의 아버님은 돌아가신 부모님을 초분하여 모시고, 그 곁을 삼 년 동안 지키셨다고 합니다.']],
        [null, ['그런데 냄새 때문에 마을에 신고가 들어갔고, 일본 순사가 아버님을 불렀습니다.'], '마을에 들어선 순사'],
        ['c-police.jpg', ['아버님은 상복을 입은 채 불려가 따졌다고 합니다.', '삼년상을 모시는 자식에게 그만두라니, 이런 불효가 어디 있느냐고요.', '결국 순사는 효자라며 아버님을 돌려보냈습니다.']],
        [null, ['그런데 족보를 확인해 보니 이상한 점이 있었습니다.', '이장님의 할머니, 할아버지 되시는 분들의 기록된 사망 연도가 모두 해방 이후였던 겁니다.', '일본 순사가 있을 수 없는 때였죠.'], '펼쳐진 족보'],
        [null, ['실마리는 이장님의 한마디에 있었습니다.', '상을 다 치르기 전까지는, 돌아가신 게 아니라\n여전히 한 식구였다는 겁니다.', '상을 마친 뒤에야 사망을 기록했다고 보면, 이야기가 비로소 맞아떨어집니다.'], '이장님'],
        ['cover-incense.jpg', ['살아 있는 부모를 대하듯\n고인에게 하루 세 끼 밥을 올렸고,', '시신이 뼈만 남을 때까지 곁을 지켰습니다.']],
        [null, ['기록상 시기가 일치하지 않는 부분도, 초분의 성격을 생각해 보면 그 이유를 알 수 있었습니다.', '이런 것들을 하나하나 찾아가는 과정 속에서,', '그 시절 어른들이 가지고 계시던 생각을 알 수 있었습니다.'], '마을 원경']],
    5: [[null, ['조사하면서 전혀 예상하지 못했던 이야기도 있었습니다.'], '이야기를 듣는 조사자'],
        ['c-mother.jpg', ['일찍이 세상을 떠난 아이들은\n상여도, 장례도 없이 떠나보냈다고 합니다.']],
        [null, ['그런 아이들은 마을과 떨어진 곳에 따로 묻었습니다.', '어르신들은 그곳을 ‘애장터’라고 불렀습니다.'], '마을 뒤 산자락, 애장터'],
        ['c-wedding.jpg', ['혼인을 하고 자식을 두어야\n장례를 치러 주던 시절이었습니다.', '그러지 못한 아이들에게는 올려 줄 제사도 없었습니다.', '그렇게 조용히 잊혔습니다.']],
        [null, ['이곡2리에서도 아이가 세상을 떠나면\n부모가 애장터에 조용히 묻는 것이 보통이었습니다.', '관례도, 혼례도 치르지 않은 아이에게\n상여를 내주는 것은 허락되지 않는 일이었으니까요.'], '보따리를 안고 산길을 오르는 뒷모습'],
        [null, ['그런데 그 규율을\n어기는 경우도 있었습니다.', '상여는 꾸리지 못하니, 뚜껑만 수레에 얹어 아이를 보낸 겁니다.', '뚜껑 하나라도 얹어 보내고 싶었던, 부모의 마음이었을 겁니다.'], '수레 위 상여 뚜껑'],
        [null, ['그 이야기를 듣고, 저희는 한동안 말을 잇지 못했습니다.', '기록된 적 없는 이야기였으니까요.'], '말을 잃은 조사자들'],
        [null, ['상여를 함께 메던 마을 사람들도, 초분 곁을 지키던 아들도,', '뚜껑 하나 얹어 아이를 보낸 부모도, 모두 한 시대를 살아낸 사람들입니다.'], '한 시대의 사람들'],
        [null, ['잘 갖춰진 의례의 형식보다 중요한 것들이 있었습니다.', '그 곁에서 슬퍼하고, 지키고, 떠나보낸 마음까지 들여다볼 때 그 시절의 삶이 온전히 보였습니다.', '결국 저희가 찾아 나선 건 의례가 아니라, 사람이었습니다.'], '곁을 지키는 손'],
        [null, ['저희 조사는 일생의례로 출발했습니다.', '하지만 남은 건, 한 사람 한 사람이 안고 살아온 저마다의 이야기였습니다.'], '조사 노트'],
        [null, ['이야기는 숨겨져 있지 않았습니다.', '묻는 사람이 없었을 뿐입니다.'], '빈 마루']]
  };
  if (!window.MMArt){ const sa = document.createElement('script'); sa.src = './mm-art.js'; document.head.appendChild(sa); }
  const artQ = []; const pump = () => { if (!window.MMArt) return setTimeout(pump, 120); const j = artQ.shift(); if (!j) return; try { MMArt.draw(j[0], j[1]); } catch(e){} setTimeout(pump, 20); };
  const BEAT = 1.15, comics = [], grains = [], FIN = {'4': {i: 8, extra: 2.4}}, BGS = {'4': {i: 5, src: 'assets/bg-liberation.jpg'}}, SCAT = {'5': {i: 3, extra: 2.6}};
  const hsh = k => { const v = Math.sin(k * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); }, eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  function inkPts(caps, step){ const out = []; caps.forEach(cap => { const r = cap.getBoundingClientRect(); if (!r.width) return; const c = document.createElement('canvas'); c.width = Math.ceil(r.width); c.height = Math.ceil(r.height); const x = c.getContext('2d'), cs = getComputedStyle(cap), solid = cap !== undefined && cap.__fillBg;
      if (solid){ x.fillStyle = cs.backgroundColor; x.fillRect(0, 0, c.width, c.height); } x.fillStyle = cs.color || '#000'; x.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily; if ('letterSpacing' in x) x.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing; x.textBaseline = 'alphabetic'; const mt = x.measureText('가'), fa = mt.fontBoundingBoxAscent, fd = mt.fontBoundingBoxDescent;
      cap.querySelectorAll('[data-ln], p').forEach(sp => { if (sp.tagName === 'P' && sp.querySelector('[data-ln]')) return; const rects = [...sp.getClientRects()]; const q = rects[0] || sp.getBoundingClientRect(), lh = parseFloat(getComputedStyle(sp).lineHeight) || q.height; x.fillText(sp.textContent, q.left - r.left, q.top - r.top + (lh - (fa + fd)) / 2 + fa); });
      x.strokeStyle = solid ? cs.borderTopColor : '#000'; x.lineWidth = solid ? parseFloat(cs.borderTopWidth) || 2 : 2; x.strokeRect(x.lineWidth / 2, x.lineWidth / 2, c.width - x.lineWidth, c.height - x.lineWidth);
      const d = x.getImageData(0, 0, c.width, c.height).data; for (let yy = 0; yy < c.height; yy += step) for (let xx = 0; xx < c.width; xx += step){ { const k = (yy * c.width + xx) * 4; if (d[k + 3] > 110) out.push({x: r.left + xx, y: r.top + yy, v: solid ? Math.round(d[k] * .3 + d[k + 1] * .59 + d[k + 2] * .11) : 20, ink: solid && d[k] > 128 ? 2 : 1}); } } }); return out; }
  function scatter(S, vw, vh, fNow){ const P = S.P, p = clamp((S.p - .28) / .72, 0, 1), cv = S.cv;
    { const dr = fNow - S.i - .5, fadeOut = S.p >= 1 ? 1 - sm(clamp((dr - .25) / .35, 0, 1)) : 1; S.big.style.opacity = (sm(clamp((p - .9) / .08, 0, 1)) * fadeOut).toFixed(3); }
    if (p > .01 && !S.wh){ S.wh = 1; SFX('wind', 1.4); } if (p <= 0) S.wh = 0; const hide = p > 0 ? 0 : 1; P.fr.style.opacity = hide; P.caps.forEach(c => { if (c !== S.last) c.cap.style.opacity = hide; });
    if (p <= 0 || p >= 1){ if (cv.width) cv.width = 0; if (p <= 0) S.A = null; return; }
    const W = Math.ceil(cv.clientWidth), H = Math.ceil(cv.clientHeight); if (cv.width !== W || cv.height !== H){ cv.width = W; cv.height = H; S.img = null; }
    const pr = cv.getBoundingClientRect();
    if (!S.A){ const fr = P.fr, FW = fr.offsetWidth, FH = fr.offsetHeight, bd = 3, br = fr.getBoundingClientRect(), cx = br.left + br.width / 2 - pr.left, cy = br.top + br.height / 2 - pr.top;
      const th = ((fr.style.transform.match(/rotate\((-?[\d.]+)deg/) || [0, 0])[1]) * Math.PI / 180, cs = Math.cos(th), sn = Math.sin(th);
      // 칸 그림을 화면에 그려진 그대로(테두리·여백·배경 크기·위치·확대·회전) 다시 그린다
      const oc = document.createElement('canvas'); oc.width = FW; oc.height = FH; const o = oc.getContext('2d'); o.fillStyle = '#f7f5f1'; o.fillRect(0, 0, FW, FH);
      const art = fr._art, im = S.im; if (art && im.complete && im.naturalWidth){ const iw = im.naturalWidth, ih = im.naturalHeight, IW = FW - bd * 2, IH = FH - bd * 2, aw = IW * 1.16, ah = IH * 1.16, ax = bd - IW * .08, ay = bd - IH * .08;
        const bsz = art.style.backgroundSize || '', bp = (art.style.backgroundPosition || '50% 50%').split(' ').map(v => parseFloat(v) / 100); let bw, bh;
        if (/%/.test(bsz)){ bw = aw * parseFloat(bsz) / 100; bh = bw * ih / iw; } else { const k = Math.max(aw / iw, ah / ih); bw = iw * k; bh = ih * k; }
        o.save(); o.beginPath(); o.rect(bd, bd, IW, IH); o.clip(); o.translate(ax + aw / 2, ay + ah / 2); o.scale(1.04, 1.04); o.translate(-(ax + aw / 2), -(ay + ah / 2)); o.filter = 'grayscale(1) contrast(1.12)';
        o.drawImage(im, ax + (aw - bw) * (isNaN(bp[0]) ? .5 : bp[0]), ay + (ah - bh) * (isNaN(bp[1]) ? .5 : bp[1]), bw, bh); o.restore(); }
      o.strokeStyle = '#141210'; o.lineWidth = bd; o.strokeRect(bd / 2, bd / 2, FW - bd, FH - bd);
      const od = o.getImageData(0, 0, FW, FH).data, st = Math.max(1, FW / 1000), pts = [];
      for (let ly = 0; ly < FH; ly += st) for (let lx = 0; lx < FW; lx += st){ const k = ((ly | 0) * FW + (lx | 0)) * 4, rx = lx + st / 2 - FW / 2, ry = ly + st / 2 - FH / 2; pts.push(cx + rx * cs - ry * sn, cy + rx * sn + ry * cs, od[k] * .3 + od[k + 1] * .59 + od[k + 2] * .11, 0); }
      inkPts(P.caps.filter(c => c !== S.last).map(c => (c.cap.__fillBg = 1, c.cap)), 1).forEach(q => pts.push(q.x - pr.left, q.y - pr.top, q.v, q.ink));
      const tg = []; { const bb = S.bs.getBoundingClientRect(), c = document.createElement('canvas'); c.width = Math.ceil(bb.width) + 4; c.height = Math.ceil(bb.height) + 4; const tx = c.getContext('2d'), ccs = getComputedStyle(S.bs); tx.font = ccs.fontWeight + ' ' + ccs.fontSize + ' ' + ccs.fontFamily; if ('letterSpacing' in tx) tx.letterSpacing = ccs.letterSpacing === 'normal' ? '0px' : ccs.letterSpacing; tx.fillStyle = '#000'; tx.textBaseline = 'alphabetic'; const m2 = tx.measureText(S.bs.textContent), lh2 = parseFloat(ccs.lineHeight) || bb.height; tx.fillText(S.bs.textContent, 2, 2 + (lh2 - (m2.fontBoundingBoxAscent + m2.fontBoundingBoxDescent)) / 2 + m2.fontBoundingBoxAscent);
        const td = tx.getImageData(0, 0, c.width, c.height).data; for (let yy = 0; yy < c.height; yy++) for (let xx = 0; xx < c.width; xx++) if (td[(yy * c.width + xx) * 4 + 3] > 120) tg.push(bb.left - 2 + xx - pr.left, bb.top - 2 + yy - pr.top); }
      const N = pts.length / 4, T = tg.length / 2, A = {N, x: new Float32Array(N), y: new Float32Array(N), v: new Uint8Array(N), dx: new Float32Array(N), dy: new Float32Array(N), ph: new Float32Array(N), dl: new Float32Array(N), tx: new Float32Array(N), ty: new Float32Array(N), go: new Uint8Array(N)};
      const every = Math.max(1, Math.floor(N / Math.max(1, T * 1.15)));
      for (let k = 0; k < N; k++){ A.x[k] = pts[k * 4]; A.y[k] = pts[k * 4 + 1]; A.v[k] = pts[k * 4 + 2]; const ink = pts[k * 4 + 3]; A.dx[k] = 460 + Math.random() * 260; A.dy[k] = 120 + Math.random() * 90; A.ph[k] = Math.random() * 6.283; A.dl[k] = clamp(A.x[k] / Math.max(1, W), 0, 1) * .26 + Math.random() * .07;
        if (T && (ink === 1 || k % every === 0)){ const t = (k * 7919) % T; A.tx[k] = tg[t * 2]; A.ty[k] = tg[t * 2 + 1]; A.go[k] = 1; } }
      S.A = A; }
    const A = S.A, x = cv.getContext('2d'); if (!S.img) S.img = x.createImageData(W, H); const buf = new Uint32Array(S.img.data.buffer); buf.fill(0);
    for (let k = 0; k < A.N; k++){ const u = clamp((p - .02 - A.dl[k]) / .5, 0, 1), su = u * u, go = A.go[k], x0 = A.x[k], y0 = A.y[k];
      // 바람: 왼쪽부터 차례로 떨어져 나가 같은 기류(물결 치는 흐름선)를 따라 오른쪽 위로 흘러간다
      const X = x0 + A.dx[k] * su, flow = Math.sin(X * .0075 + y0 * .0035 + su * 2.6) * 46 + Math.sin(X * .019 - y0 * .006 + su * 4.1) * 14;
      let px = X + Math.sin(A.ph[k] + su * 6) * 3 * su, py = y0 - A.dy[k] * su + flow * su + Math.cos(A.ph[k] + su * 5) * 3 * su, al = 1, v = A.v[k];
      if (go){ const w2 = clamp((p - .48 - A.dl[k] * .3) / .4, 0, 1), gw = eio(w2); px += (A.tx[k] - px) * gw; py += (A.ty[k] - py) * gw; v = v + (20 - v) * gw; }
      else al = 1 - sm(clamp((p - .4 - A.dl[k] * .3) / .3, 0, 1));
      if (al <= .02) continue; const ix = px | 0, iy = py | 0; if (ix < 0 || iy < 0 || ix >= W || iy >= H) continue;
      const vv = v | 0; buf[iy * W + ix] = ((al * 255) << 24) | ((Math.max(0, vv - 3)) << 16) | ((Math.max(0, vv - 1)) << 8) | vv; }
    x.putImageData(S.img, 0, 0); }
  // 칸별 효과: 상여 뚜껑은 쿵·쿵 좌우로 기울고, 순사 칸은 발소리에 흔들리고, 애장터에는 바람이 지난다
  const SFX = (k, a) => { try { window.MMSfx && window.MMSfx.play(k, a); } catch(e){} };
  const FXK = {'수레 위 상여 뚜껑': 'tilt', '마을에 들어선 순사': 'steps', '마을 뒤 산자락, 애장터': 'wind', '보따리를 안고 산길을 오르는 뒷모습': 'wind'};
  function panelFx(P, d){ const kind = FXK[P.ph]; if (!kind || window.__mmCapEdit) return; const now = performance.now(), st = P.fxs || (P.fxs = {stage: 0, off: 0, v: 0, yb: 0, vy: 0, tg: 0, t: now, env: 0}), dt = Math.min(.05, (now - st.t) / 1000); st.t = now;
    const marks = kind === 'tilt' ? [-.14, .16] : [-.22], stage = marks.filter(m => d > m).length;
    if (stage !== st.stage){ if (stage > st.stage){
        if (kind === 'tilt'){ SFX('thump', stage === 1 ? -.6 : .6); st.vy += 170; }
        if (kind === 'steps'){ SFX('steps'); st.kick = [now + 60, now + 560]; }
        if (kind === 'wind'){ SFX('wind'); st.env = 1; } }
      st.tg = kind === 'tilt' ? [0, -3.2, 3.2][stage] : 0; st.stage = stage; }
    if (st.kick) st.kick = st.kick.filter(t => { if (now >= t){ st.vy += 95; return false; } return true; });
    st.env = Math.max(0, st.env - dt / 4.5); const sway = kind === 'wind' ? Math.sin(now / 520) * .8 * st.env : 0;
    st.v += ((st.tg - st.off) * 150 - st.v * 11) * dt; st.off += st.v * dt; st.vy += (-st.yb * 320 - st.vy * 17) * dt; st.yb += st.vy * dt;
    P.fr.style.transform = 'translateY(' + st.yb.toFixed(1) + 'px) rotate(' + (P.rot0 + st.off + sway).toFixed(2) + 'deg)'; P.fr.style.transformOrigin = kind === 'tilt' ? '50% 92%' : '50% 50%'; }
  let gl = 0; const grainTick = now => { if (now - gl > 170){ gl = now; grains.forEach(c => { const w = Math.ceil(c.clientWidth / 2), h = Math.ceil(c.clientHeight / 2); if (!w || c.getBoundingClientRect().bottom < 0 || c.getBoundingClientRect().top > innerHeight) return; if (c.width !== w){ c.width = w; c.height = h; } const x = c.getContext('2d'), im = x.createImageData(w, h), d = im.data; for (let i = 0; i < d.length; i += 4){ const v = 120 + Math.random() * 135; d[i] = d[i+1] = d[i+2] = v; d[i+3] = 255; } x.putImageData(im, 0, 0); }); } };
  document.querySelectorAll('[data-comic]').forEach(sec => { const part = sec.dataset.comic, beats = DATA[part]; if (!beats) return;
    const fin = FIN[part], sct = SCAT[part]; sec.style.height = ((beats.length + (fin ? fin.extra : 0) + (sct ? sct.extra : 0)) * BEAT * 100 + 150) + 'vh';
    const pin = document.createElement('div'); pin.style.cssText = 'position:sticky;top:0;height:100vh;overflow:hidden;background:#e6e5e2'; sec.appendChild(pin);
    // 사진과 같은 톤: 회백색 안개 + 가장자리 살짝 어둡게 + 고운 입자
    const tone = document.createElement('div'); tone.setAttribute('aria-hidden', 'true'); tone.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse 70% 60% at 50% 42%,rgba(250,249,247,.85),rgba(250,249,247,0) 70%),radial-gradient(ellipse 120% 90% at 50% 50%,rgba(0,0,0,0) 55%,rgba(40,38,35,.18) 100%)'; pin.appendChild(tone);
    const gcv = document.createElement('canvas'); gcv.setAttribute('aria-hidden', 'true'); gcv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:.16;mix-blend-mode:multiply;pointer-events:none'; pin.appendChild(gcv); grains.push(gcv);
    // 배경: 종이 결 + 큰 먹 번짐 두 장 — 칸보다 훨씬 느리게, 서로 반대로
    const bg = document.createElement('div'); bg.setAttribute('aria-hidden', 'true'); bg.style.cssText = 'position:absolute;left:-10%;right:-10%;top:-20%;height:' + (140 + beats.length * 12) + '%;will-change:transform'; pin.appendChild(bg);
    [[8, 4, 70, .05], [52, 38, 90, .035], [14, 70, 80, .045]].forEach(([l, t, w, o]) => { const b = document.createElement('div'); b.style.cssText = 'position:absolute;left:' + l + '%;top:' + t + '%;width:' + w + 'vmin;height:' + w + 'vmin;background:url(assets/ink-blot.jpg) center/contain no-repeat;opacity:' + o + ';filter:blur(1px)'; bg.appendChild(b); });
    const bg2 = document.createElement('div'); bg2.setAttribute('aria-hidden', 'true'); bg2.style.cssText = 'position:absolute;inset:-30% -10%;will-change:transform;background:repeating-linear-gradient(0deg,rgba(20,18,16,.025) 0 1px,transparent 1px 5px)'; pin.appendChild(bg2);
    const GEN = {'짚으로 덮은 초분': 'c4-1', '마을에 들어선 순사': 'c4-2', '펼쳐진 족보': 'c4-3', '이장님': 'c4-4', '마을 원경': 'c4-5', '이야기를 듣는 조사자': 'c5-1', '마을 뒤 산자락, 애장터': 'c5-2', '보따리를 안고 산길을 오르는 뒷모습': 'c5-3', '수레 위 상여 뚜껑': 'c5-4', '말을 잃은 조사자들': 'c5-5', '한 시대의 사람들': 'c5-6', '곁을 지키는 손': 'c5-7', '조사 노트': 'c5-8', '빈 마루': 'c5-9'};
    const panels = beats.map(([img, lines, ph], i) => { if (!img && GEN[ph]) img = 'comic/' + GEN[ph] + '.jpg';
      const side = i % 2 ? 1 : -1, w = (CAPPOS.get('frame:' + part + '-' + i) || {}).fw || [52, 47, 56, 45, 50][i % 5], wrap = document.createElement('div'); wrap.dataset.frameKey = 'frame:' + part + '-' + i; wrap.dataset.fw = w;
      wrap.style.cssText = 'position:absolute;left:50%;top:50%;width:min(' + w + 'vw,' + Math.round(w * 1.3) + 'vh);will-change:transform,opacity';
      const fr = document.createElement('div'); fr.style.cssText = 'position:relative;aspect-ratio:' + (i % 3 === 1 ? '4/3' : i % 3 === 2 ? '1/1' : '5/4') + ';background:#f7f5f1;border:3px solid #141210;box-shadow:6px 7px 0 rgba(20,18,16,.12);transform:rotate(' + (side * (0.6 + (i % 3) * .4)).toFixed(2) + 'deg);overflow:hidden';
      if (img){ const im = document.createElement('div'); im.style.cssText = 'position:absolute;inset:-8%;background:url(' + A + img + ') center/cover no-repeat;filter:grayscale(1) contrast(1.12);will-change:transform'; im.dataset.imgKey = 'img:' + part + '-' + i; { const sp = CAPPOS.get(im.dataset.imgKey); if (sp){ im.style.backgroundPosition = sp.x + '% ' + sp.y + '%'; if (sp.s) im.style.backgroundSize = sp.s + '% auto'; } } fr.appendChild(im); fr._art = im; }
      else { const cv = document.createElement('canvas'); cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', ph); cv.style.cssText = 'position:absolute;left:-8%;top:-8%;width:116%;height:116%;object-fit:cover;will-change:transform'; fr.appendChild(cv); fr._art = cv; artQ.push([cv, ph]); }
      // 대사 상자: 한 상자에 최대 두 문장, 칸 둘레에 2~3개 — 그림은 가장자리만 살짝 덮는다
      const groups = []; if (lines.length <= 3) lines.forEach(l => groups.push([l])); else for (let g = 0; g < lines.length; g += 2) groups.push(lines.slice(g, g + 2));
      const A_ = side < 0 ? 'left:-10%' : 'right:-10%', B_ = side < 0 ? 'right:-12%' : 'left:-12%', spots = groups.length === 1 ? [[B_, 'bottom:-12%']] : groups.length === 2 ? [[A_, 'top:-8%'], [B_, 'bottom:-12%']] : [[A_, 'top:-8%'], [B_, 'top:38%'], [A_, 'bottom:-14%']];
      wrap.appendChild(fr);
      const wide = innerWidth >= 900 && groups.length >= 2, hs = k => { const v = Math.sin((i * 7.13 + k) * 12.9898) * 43758.5453; return v - Math.floor(v); }, FW = 'min(' + w + 'vw,' + Math.round(w * 1.3) + 'vh)', ovl = [34, 62, 46, 78, 54], n = groups.length;
      // 읽는 순서: 왼쪽 위 → 오른쪽 아래. 첫 상자는 칸 위나 왼쪽, 마지막 상자는 칸 아래나 오른쪽, 가운데는 어느 쪽이든
      const firstAbove = hs(6) < .5, lastBelow = hs(7) < .55, G = (o, gi) => 'min(' + [320, 260, 360, 290, 340][(i + gi * 2) % 5] + 'px,calc((100vw - ' + FW + ') / 2 - ' + (26 - o) + 'px))', TB = gi => 'min(' + [380, 320, 420, 350][(i + gi) % 4] + 'px,74%)';
      const plan = wide ? groups.map((_, gi) => { const o = ovl[(i * 2 + gi) % 5], r = (() => {
        if (gi === 0) return firstAbove ? {sd: 'T', h: 'left:' + (-10 + hs(8) * 14).toFixed(1) + '%', v: 'bottom:calc(100% - ' + (18 + hs(9) * 34 | 0) + 'px)', mw: TB(gi), k: 1.5} : {sd: -1, h: 'right:calc(100% - ' + o + 'px)', v: 'top:' + (hs(1) * 22 - 16).toFixed(1) + '%', mw: G(o, gi), k: 1.38};
        if (gi === n - 1) return lastBelow ? {sd: 'B', h: 'right:' + (-10 + hs(10) * 14).toFixed(1) + '%', v: 'top:calc(100% - ' + (18 + hs(11) * 34 | 0) + 'px)', mw: TB(gi), k: .82} : {sd: 1, h: 'left:calc(100% - ' + o + 'px)', v: 'top:' + (56 + hs(2) * 34).toFixed(1) + '%', mw: G(o, gi), k: .96};
        const sd = hs(12 + gi) < .5 ? -1 : 1; return {sd, h: (sd < 0 ? 'right' : 'left') + ':calc(100% - ' + o + 'px)', v: 'top:' + (18 + hs(3) * 36).toFixed(1) + '%', mw: G(o, gi), k: sd < 0 ? 1.38 : .96}; })(); r.o = o; return r; }) : null;
      const sides = plan ? plan.map(p => p.sd) : [], gTop = plan ? plan.map(p => p.v) : [];
      const caps = groups.map((grp, gi) => { const cap = document.createElement('div'), [h, v] = wide ? [plan[gi].h, plan[gi].v] : spots[gi];
        cap.style.cssText = 'position:absolute;' + h + ';' + v + ';max-width:' + (wide ? plan[gi].mw + ';width:max-content;box-sizing:border-box' : 'min(56%,340px)') + ';background:#fffdf8;border:2px solid #141210;padding:12px 14px;font-family:\'Nanum Myeongjo\',serif;font-weight:700;font-size:18.5px;line-height:1.6;color:#141210;text-wrap:pretty;word-break:keep-all;overflow-wrap:break-word;will-change:transform;z-index:2';
        cap.dataset.capKey = part + '-' + i + '-' + gi; grp.forEach(t => { const p = document.createElement('p'); p.style.margin = '0'; t.split('\n').forEach((seg, k) => { if (k) p.appendChild(document.createElement('br')); const NW = '그 시절의 삶이 온전히 보였습니다'; const at = seg.indexOf(NW); if (at < 0){ p.appendChild(document.createTextNode(seg)); return; } p.appendChild(document.createTextNode(seg.slice(0, at))); const sp = document.createElement('span'); sp.style.whiteSpace = 'nowrap'; sp.textContent = NW; p.appendChild(sp); p.appendChild(document.createTextNode(seg.slice(at + NW.length))); }); cap.appendChild(p); }); wrap.appendChild(cap); return {cap, k: wide ? plan[gi].k : [1.4, .9, 1.25][gi % 3], dx: wide ? (plan[gi].sd === -1 || plan[gi].sd === 'T' ? -1 : 1) : (gi % 2 ? 1 : -1)}; });
      caps.forEach(({cap}, gi) => { const FX = CAP_FIX[cap.dataset.capKey], L = FX || [].concat(...groups[gi].map(t => t.split('\n'))).map(t => t.trim()).filter(Boolean); cap.textContent = ''; if (FX) cap.dataset.fix = '1'; const p = document.createElement('p'); p.style.margin = '0'; L.forEach(t => { const sp = document.createElement('span'); sp.dataset.ln = '1'; sp.style.cssText = 'display:block' + (FX ? ';white-space:nowrap' : ''); sp.textContent = t; p.appendChild(sp); }); cap.appendChild(p); cap.dataset.hug = '1'; cap.style.width = FX ? 'max-content' : 'fit-content'; if (FX) cap.style.maxWidth = 'none'; });
      pin.appendChild(wrap);
      const applyPos = () => caps.forEach(({cap}) => { if (MQ() || cap.dataset.solo) return; const p = CAPPOS.get(cap.dataset.capKey); if (!p) return; if (p.l != null) ['top', 'bottom', 'left', 'right'].forEach(k => cap.style[k] = ''); if (p.l != null){ cap.style.left = p.l + '%'; cap.style.top = p.t + '%'; } if (p.w && !cap.dataset.fix){ cap.style.width = cap.dataset.hug ? 'fit-content' : p.w + '%'; cap.style.maxWidth = cap.dataset.hug ? p.w + '%' : 'none'; } });
      const clampVW = () => { if (MQ()) return; caps.forEach(({cap}) => { if (!cap.dataset.fix) return; cap.querySelectorAll('[data-ln]').forEach(l => l.style.whiteSpace = 'nowrap'); cap.style.width = 'max-content'; cap.style.maxWidth = 'none'; }); const wl = innerWidth / 2 - wrap.offsetWidth / 2; caps.forEach(({cap}) => { if (cap.dataset.solo) return; const left = wl + cap.offsetLeft, room = innerWidth - 14 - left; if (cap.offsetWidth > room && room > 120){ if (cap.dataset.fix){ cap.querySelectorAll('[data-ln]').forEach(l => l.style.whiteSpace = 'normal'); cap.style.width = 'fit-content'; } cap.style.maxWidth = Math.floor(room) + 'px'; } }); };
      const applyPos2 = () => { applyPos(); requestAnimationFrame(clampVW); };
      CAPPOS.reg.push({caps, wrap, relayout: () => { if (wide && caps.length > 1) window.dispatchEvent(new Event('resize')); else spotsReset(); applyPos(); }});
      const spotsReset = () => caps.forEach(({cap}, gi) => { if (wide) return; ['top', 'bottom', 'left', 'right'].forEach(k => cap.style[k] = ''); const [h, v] = spots[gi]; const [hp, hv] = h.split(':'), [vp, vv] = v.split(':'); cap.style[hp] = hv; cap.style[vp] = vv; });
      requestAnimationFrame(applyPos2); (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(applyPos2)); addEventListener('resize', () => requestAnimationFrame(applyPos2));
      if (wide && caps.length > 1){ const fix = () => { if (MQ()) return; const fh = fr.offsetHeight; if (!fh) return; const vh = innerHeight, room = {T: vh / 2 - .58 * fh - 12, B: vh / 2 - .42 * fh - 12};
          caps.forEach(({cap}, gi) => { const p = plan[gi]; ['top', 'bottom', 'left', 'right'].forEach(k => cap.style[k] = ''); cap.style.maxWidth = cap.dataset.fix ? 'none' : p.mw; let [hp, hv] = p.h.split(':'), [vp, vv] = p.v.split(':');
            cap.style[hp] = hv; cap.style[vp] = vv;
            if (p.sd === 'T' || p.sd === 'B'){ const inside = p.sd === 'T' ? cap.offsetTop + cap.offsetHeight : fh - cap.offsetTop, out = cap.offsetHeight - inside;
              if (out > room[p.sd]){ cap.style[hp] = ''; cap.style[vp] = ''; hp = p.sd === 'T' ? 'right' : 'left'; hv = 'calc(100% - ' + p.o + 'px)'; vp = 'top'; vv = p.sd === 'T' ? '-4%' : '60%'; cap.style.maxWidth = G(p.o, gi); cap.style[hp] = hv; cap.style[vp] = vv; } } });
          caps.forEach(({cap}, gi) => { for (let j = 0; j < gi; j++){ const q = caps[j].cap, ax = q.offsetLeft, aw = q.offsetWidth, bx = cap.offsetLeft, bw = cap.offsetWidth; if (bx + bw <= ax || bx >= ax + aw) continue; const need = q.offsetTop + q.offsetHeight + 14; if (cap.offsetTop < need){ cap.style.bottom = ''; cap.style.top = need + 'px'; } } }); applyPos(); clampVW(); };
        requestAnimationFrame(fix); (document.fonts ? document.fonts.ready : Promise.resolve()).then(fix); addEventListener('resize', () => { fix(); }); }
      return {ph, rot0: parseFloat((fr.style.transform.match(/rotate\((-?[\d.]+)deg/) || [0, 0])[1]) || 0, w0: wrap.style.width, relayout: () => { if (wide && caps.length > 1) window.dispatchEvent(new Event('resize')); else spotsReset(); applyPos(); }, wrap, fr, caps, side, xo: wide ? 0 : 1, sp: [1.0, 1.25, .9, 1.15, 1.05][i % 5], cs: [1.35, 1.5, 1.3][i % 3]}; });
    // 모바일: 세로는 칸 위·아래로 상자를 쌓고, 가로는 칸 양옆 두 줄로 — 읽는 순서는 그대로
    const mob = P => { const m = MQ(), {wrap, fr, caps} = P, n = caps.length, half = Math.ceil(n / 2);
      if (!P.colL){ P.colL = document.createElement('div'); P.colR = document.createElement('div'); [P.colL, P.colR].forEach(c => c.style.cssText = 'display:flex;flex-direction:column;gap:10px;min-width:0'); P.ar = (fr.style.aspectRatio || '5/4').split('/').map(Number); }
      if (!m){ if (!P.mode) return; caps.forEach(({cap}) => { wrap.appendChild(cap); Object.assign(cap.style, {position: 'absolute', fontSize: '18.5px', padding: '12px 14px', lineHeight: '1.6', width: cap.dataset.fix ? 'max-content' : cap.dataset.hug ? 'fit-content' : '', maxWidth: cap.dataset.fix ? 'none' : '', alignSelf: ''}); if (cap.dataset.fix) cap.querySelectorAll('[data-ln]').forEach(l => l.style.whiteSpace = 'nowrap'); }); P.colL.remove(); P.colR.remove(); Object.assign(wrap.style, {display: '', width: P.w0, gap: '', flexDirection: '', alignItems: ''}); fr.style.width = ''; fr.style.flex = ''; P.mode = ''; P.relayout(); return; }
      P.mode = m; Object.assign(wrap.style, {display: 'flex', alignItems: 'center', gap: m === 'P' ? '12px' : '16px', flexDirection: m === 'P' ? 'column' : 'row'});
      if (m === 'P'){ wrap.style.width = '88vw'; fr.style.width = 'min(100%, calc((100vh - ' + (n > 2 ? 300 : 240) + 'px) * ' + (P.ar[0] / P.ar[1]).toFixed(3) + '))'; fr.style.flex = ''; [P.colL, P.colR].forEach(c => { c.style.width = '100%'; c.style.flex = ''; }); }
      else { wrap.style.width = '94vw'; fr.style.width = 'min(46vw, calc((100vh - 56px) * ' + (P.ar[0] / P.ar[1]).toFixed(3) + '))'; fr.style.flex = '0 0 auto'; [P.colL, P.colR].forEach(c => { c.style.width = ''; c.style.flex = '1 1 0'; }); }
      wrap.insertBefore(P.colL, fr); wrap.appendChild(P.colR);
      caps.forEach(({cap}, gi) => { ['top', 'bottom', 'left', 'right'].forEach(k => cap.style[k] = ''); Object.assign(cap.style, {position: 'relative', width: 'auto', maxWidth: m === 'P' ? '86%' : 'none', fontSize: m === 'P' ? '15.5px' : '14px', padding: m === 'P' ? '10px 12px' : '8px 10px', lineHeight: '1.55', alignSelf: m === 'P' ? (gi % 2 ? 'flex-end' : 'flex-start') : 'stretch'}); cap.querySelectorAll('[data-ln]').forEach(l => l.style.whiteSpace = 'normal'); if (m === 'P') cap.style.width = 'fit-content'; (gi < half ? P.colL : P.colR).appendChild(cap); });
      if (n === 1 && m === 'L') P.colL.style.flex = '1 1 0'; };
    panels.forEach(mob); let mobT = 0; const reMob = () => { clearTimeout(mobT); mobT = setTimeout(() => panels.forEach(mob), 120); }; addEventListener('resize', reMob); addEventListener('orientationchange', reMob);
    let skin = null, prevT = sec.previousElementSibling;
    if (prevT && prevT.hasAttribute('data-part') && prevT.firstElementChild){ const tp = prevT.firstElementChild, box = tp.lastElementChild; box.style.position = 'relative';
      skin = document.createElement('div'); skin.setAttribute('aria-hidden', 'true'); skin.style.cssText = 'position:absolute;inset:0;pointer-events:none;opacity:0;background:#e6e5e2';
      skin.appendChild(tone.cloneNode()); const g2 = gcv.cloneNode(); skin.appendChild(g2); grains.push(g2); tp.insertBefore(skin, box); prevT.style.boxShadow = 'none'; }
    pin.style.background = '#e6e5e2'; bg.style.opacity = bg2.style.opacity = 0; panels.forEach(P => P.wrap.style.opacity = 0);
    let nx = sec.nextElementSibling; while (nx && (nx.tagName !== 'SECTION' || getComputedStyle(nx).display === 'none')) nx = nx.nextElementSibling;
    const tail = document.createElement('div'); tail.setAttribute('aria-hidden', 'true'); tail.style.cssText = 'position:absolute;inset:0;pointer-events:none;opacity:0;z-index:200;background:' + (nx ? getComputedStyle(nx).backgroundColor : '#000'); pin.appendChild(tail);
    if (nx) nx.style.boxShadow = 'none';
    // 마지막 칸 피날레: 그림이 커지며 화면을 채우고, 상자 없이 가운데 위에 글이 떠오른다
    let F = null; if (fin && panels[fin.i]){ const P = panels[fin.i];
      Object.assign(P.fr.style, {border: 'none', boxShadow: 'none', transform: 'none'});
      const ov = document.createElement('div'); ov.setAttribute('aria-hidden', 'true'); ov.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none;z-index:150;background:#f3f2ef';
      const art = P.fr._art, ia = document.createElement('div'); ia.style.cssText = 'position:absolute;inset:-8%;overflow:hidden;filter:grayscale(1) contrast(1.12);will-change:transform';
      const url = art && art.tagName !== 'CANVAS' ? (art.style.backgroundImage || (art.style.background.match(/url\([^)]*\)/) || [''])[0]) : '';
      const scene = document.createElement('div'); scene.style.cssText = 'position:absolute;left:0;top:0;background:' + url + ' 0 0/100% 100% no-repeat'; ia.appendChild(scene);
      const tree = document.createElement('div'); tree.style.cssText = 'position:absolute;inset:0;background:' + url + ' 0 0/100% 100% no-repeat;transform-origin:9% 66%;will-change:transform;-webkit-mask-image:radial-gradient(ellipse 25% 24% at 21% 40%,#000 62%,transparent 100%);mask-image:radial-gradient(ellipse 25% 24% at 21% 40%,#000 62%,transparent 100%)'; scene.appendChild(tree);
      const SM = 'radial-gradient(ellipse 4.6% 6.2% at 43.6% 58.2%,#000 45%,transparent 100%)', patch = document.createElement('div'); patch.style.cssText = 'position:absolute;inset:0;background:#f2f2f1;-webkit-mask-image:' + SM + ';mask-image:' + SM; scene.appendChild(patch);
      const puffs = [0, 1, 2].map(() => { const el = document.createElement('div'); el.style.cssText = 'position:absolute;inset:0;background:' + url + ' 0 0/100% 100% no-repeat;transform-origin:39.9% 64.3%;opacity:0;will-change:transform,opacity;-webkit-mask-image:' + SM + ';mask-image:' + SM; scene.appendChild(el); return el; });
      const amb = document.createElement('canvas'); amb.style.cssText = 'position:absolute;inset:0;width:100%;height:100%'; scene.appendChild(amb);
      ov.appendChild(ia); const veil = document.createElement('div'); veil.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse 55% 45% at 88% 8%,rgba(243,242,239,.85),rgba(243,242,239,0) 70%);opacity:0'; ov.appendChild(veil); pin.appendChild(ov);
      const txt = document.createElement('div'); txt.style.cssText = "position:absolute;right:6vw;top:10vh;z-index:151;display:grid;gap:20px;justify-items:end;text-align:right;max-width:min(88vw,720px);pointer-events:none;font-family:'Nanum Myeongjo',serif;font-weight:700;font-size:clamp(19px,2.3vw,27px);line-height:1.6;color:#141210;word-break:keep-all";
      const blocks = P.caps.slice(1).map(({cap}) => { const bl = document.createElement('p'); bl.style.cssText = 'margin:0;opacity:0;will-change:transform,opacity'; (CAP_FIX[cap.dataset.capKey] || [cap.textContent]).forEach(t => { const sp = document.createElement('span'); sp.style.display = 'block'; sp.textContent = t; bl.appendChild(sp); }); txt.appendChild(bl); cap.remove(); return bl; });
      pin.appendChild(txt);
      const c0 = P.caps[0], holder = document.createElement('div'); holder.style.cssText = 'position:absolute;left:0;right:0;top:9vh;z-index:152;display:flex;justify-content:center;pointer-events:none;padding:0 6vw;opacity:0';
      c0.cap.dataset.solo = '1'; ['left', 'top', 'right', 'bottom'].forEach(k => c0.cap.style[k] = ''); c0.cap.style.position = 'relative'; holder.appendChild(c0.cap); pin.appendChild(holder); c0.k = 1.1; c0.dx = 0; P.caps = [c0];
      const smoke = [], birds = [[0, .16, 1], [-.05, .2, .82], [-.09, .14, .7]].map(([x0, y, sc]) => ({x: x0 - .05, y, v: .016, ph: Math.random() * 6.28, s: sc, cyc: 2.4 + Math.random() * 1.6}));
      F = {P, i: fin.i, extra: fin.extra, ov, ia, scene, tree, puffs, amb, veil, txt, blocks, holder, smoke, birds, last: 0, spawn: 0}; }
    // 칸 바깥 배경 그림: 해당 칸이 오면 안개처럼 떠오르고, 꽃잎이 바람을 타고 흩날린다
    let BG = null; const bgc = BGS[part]; if (bgc && panels[bgc.i]){ const lay = document.createElement('div'); lay.setAttribute('aria-hidden', 'true'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;opacity:0;z-index:1;overflow:hidden';
      const pic = document.createElement('div'); pic.style.cssText = 'position:absolute;inset:-6%;background:url(' + bgc.src + ') center/cover no-repeat;will-change:transform'; lay.appendChild(pic);
      const veil = document.createElement('div'); veil.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse 46% 52% at 50% 46%,rgba(230,229,226,.55),rgba(230,229,226,0) 75%)'; lay.appendChild(veil);
      const pc = document.createElement('canvas'); pc.style.cssText = 'position:absolute;inset:0;width:100%;height:100%'; lay.appendChild(pc);
      const pins = [...pin.children]; const firstPanel = panels[0] && panels[0].wrap; pin.insertBefore(lay, firstPanel || null);
      const PET = Array.from({length: 46}, () => ({x: Math.random(), y: Math.random(), z: .4 + Math.random() * .9, r: Math.random() * 6.28, vr: (Math.random() - .5) * 2.2, ph: Math.random() * 6.28, hue: Math.random()}));
      BG = {i: bgc.i, lay, pic, pc, PET, t: performance.now()}; }
    // 흩어짐: 그림과 앞의 두 상자가 조각으로 부서져 바람에 흩어지고, 그 조각들이 모여 다음 상자의 글자가 된다
    let S = null; if (sct && panels[sct.i] && !reduced){ const P = panels[sct.i], cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:160'; pin.appendChild(cv);
      const last = P.caps[P.caps.length - 1]; last.cap.dataset.solo = '1'; last.cap.style.display = 'none';
      const big = document.createElement('div'); big.style.cssText = "position:absolute;inset:0;z-index:159;display:flex;align-items:center;justify-content:center;padding:0 6vw;pointer-events:none;opacity:0"; const bs = document.createElement('span'); bs.style.cssText = "font-family:'NohHaeChan','Nanum Myeongjo',serif;font-weight:400;font-size:clamp(30px,5.4vw,78px);line-height:1.2;color:#141210;letter-spacing:-.01em;white-space:nowrap"; bs.textContent = (last.cap.textContent || '').trim(); big.appendChild(bs); pin.appendChild(big);
      const art = P.fr._art, m = art && art.style.backgroundImage ? art.style.backgroundImage.match(/url\(["']?([^"')]+)/) : null, im = new Image(); if (m) im.src = m[1];
      S = {i: sct.i, extra: sct.extra, P, cv, last, im, big, bs, parts: null, p: 0}; }
    comics.push({sec, bg, bg2, panels, skin, prevT, tail, F, BG, S});
    artQ.sort(() => 0); setTimeout(pump, 400);
  });
  function frame(){ const vh = innerHeight, vw = innerWidth;
    comics.forEach(C => { if (C.skin){ const t = C.prevT.getBoundingClientRect(); if (t.bottom > 0 && t.top < vh){ const q0 = clamp(-t.top / Math.max(1, t.height - vh), 0, 1), f0 = sm(clamp((q0 - .1) / .8, 0, 1)); C.skin.style.opacity = f0.toFixed(3); grainTick(performance.now()); } }
      const r = C.sec.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
      const arr = sm(clamp(1 - r.top / vh, 0, 1)); C.bg.style.opacity = C.bg2.style.opacity = arr.toFixed(3);
      { const left = (r.bottom - vh) / vh; C.tail.style.opacity = sm(clamp(1 - left / .9, 0, 1)).toFixed(3); }
      const q = clamp(-r.top / Math.max(1, r.height - vh * 1.9), 0, 1), n = C.panels.length; let f = q * (n - .001 + (C.F ? C.F.extra : 0) + (C.S ? C.S.extra : 0));
      if (C.S){ const S = C.S, a0 = S.i + .5; if (f > a0 + S.extra){ S.p = 1; f -= S.extra; } else if (f > a0){ S.p = (f - a0) / S.extra; f = a0; } else S.p = 0; try { scatter(S, vw, vh, f); } catch(err){ console.warn('scatter', err); } }
      C.bg.style.transform = 'translate3d(0,' + (-q * vh * .9).toFixed(1) + 'px,0)'; C.bg2.style.transform = 'translate3d(0,' + (-q * vh * .35).toFixed(1) + 'px,0)';
      if (C.BG){ const B = C.BG, dB = f - B.i - .5, o = 1 - sm(clamp((Math.abs(dB) - .55) / .55, 0, 1)); B.lay.style.opacity = o.toFixed(3);
        if (o > .01){ B.pic.style.transform = 'translate3d(0,' + (-dB * vh * .08).toFixed(1) + 'px,0) scale(' + (1.04 + Math.abs(dB) * .05).toFixed(4) + ')'; const now = performance.now(), dt = Math.min(.05, (now - B.t) / 1000); B.t = now; const cv = B.pc, W = Math.ceil(cv.clientWidth), H = Math.ceil(cv.clientHeight); if (cv.width !== W || cv.height !== H){ cv.width = W; cv.height = H; }
          const x = cv.getContext('2d'), gust = 1 + Math.min(3, Math.abs(B.vy || 0)); x.clearRect(0, 0, W, H); B.PET.forEach(p => { p.y += dt * .05 * p.z * gust; p.x += dt * (.03 + .02 * Math.sin(now / 1400 + p.ph)) * p.z * gust; p.r += dt * p.vr; if (p.y > 1.05){ p.y = -.05; p.x = Math.random() * .9; } if (p.x > 1.05) p.x = -.05;
            const s = 5 + p.z * 7, px = p.x * W, py = p.y * H + Math.sin(now / 900 + p.ph) * 6; x.save(); x.translate(px, py); x.rotate(p.r); x.scale(1, .55 + .45 * Math.abs(Math.sin(now / 700 + p.ph))); x.fillStyle = 'rgba(' + (236 - p.hue * 12) + ',' + (178 + p.hue * 20) + ',' + (178 + p.hue * 16) + ',' + (.55 + p.z * .3).toFixed(2) + ')'; x.beginPath(); x.ellipse(0, 0, s, s * .62, 0, 0, 7); x.fill(); x.restore(); }); }
        B.vy = ((B.pf == null ? f : f - B.pf) * 60); B.pf = f; }
      const FF = C.F, fe = FF ? clamp((f - FF.i - .5 + .3) / (FF.extra + .7), 0, 1) : 0;
      C.panels.forEach((P, i) => { const dr = f - i - .5, fz = FF && i === FF.i && dr > -.3, d = FF && i === FF.i && dr > -.3 ? -.3 + (dr + .3 < .5 ? (dr + .3) - (dr + .3) * (dr + .3) : .25) : dr; if (Math.abs(d) > 1.6){ P.wrap.style.opacity = 0; P.wrap.style.pointerEvents = 'none'; return; }
        const y = -d * vh * .95 * P.sp, x = (P.mode ? 0 : P.xo) * (P.side * vw * .06 - d * P.side * vw * .02), op = 1 - sm(clamp((Math.abs(d) - .45) / .6, 0, 1));
        P.wrap.style.opacity = op.toFixed(3); P.wrap.style.zIndex = 100 - Math.round(Math.abs(d) * 20); P.wrap.style.pointerEvents = op < .2 ? 'none' : ''; P.wrap.style.transform = 'translate3d(calc(-50% + ' + x.toFixed(1) + 'px), calc(-58% + ' + y.toFixed(1) + 'px), 0)';
        if (P.fr._art) P.fr._art.style.transform = 'translate3d(0,' + (d * 34).toFixed(1) + 'px,0) scale(1.04)';
        if (FF && i === FF.i && !fz) FF.holder.style.opacity = sm(clamp((d + .32) / .26, 0, 1)).toFixed(3);
        if (fz){ const F = FF, sm2 = x => x * x * (3 - 2 * x), eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, g = eio(clamp(fe / .46, 0, 1)), pr = C.sec.firstElementChild.getBoundingClientRect();
          P.fr.style.visibility = 'hidden'; const r0 = P.fr.getBoundingClientRect(); const L = r0.left - pr.left, T = r0.top - pr.top, OW = r0.width + (vw - r0.width) * g, OH = r0.height + (vh - r0.height) * g;
          Object.assign(F.ov.style, {opacity: '1', left: (L * (1 - g)).toFixed(1) + 'px', top: (T * (1 - g)).toFixed(1) + 'px', width: OW.toFixed(1) + 'px', height: OH.toFixed(1) + 'px'});
          const IW = OW * 1.16, IH = OH * 1.16, bw = Math.max(IW * 1.2496, IH * 1402 / 1122), bh = bw * 1122 / 1402; Object.assign(F.scene.style, {width: bw.toFixed(1) + 'px', height: bh.toFixed(1) + 'px', left: ((IW - bw) / 2).toFixed(1) + 'px', top: ((IH - bh) / 2).toFixed(1) + 'px'});
          F.ia.style.transform = 'scale(' + (1 + fe * .04).toFixed(4) + ')'; if (fe > .6 && !F.chirp){ F.chirp = 1; SFX('birds'); } if (fe < .3) F.chirp = 0; F.veil.style.opacity = sm2(clamp((fe - .46) / .12, 0, 1)).toFixed(3);
          F.holder.style.opacity = (sm(clamp((dr + .32) / .26, 0, 1)) * (1 - sm2(clamp((fe - .48) / .08, 0, 1)))).toFixed(3);
          F.blocks.forEach((bl, k) => { const t = sm2(clamp((fe - (.58 + k * .17)) / .13, 0, 1)); bl.style.opacity = t.toFixed(3); bl.style.transform = 'translate3d(0,' + ((1 - t) * 16).toFixed(1) + 'px,0)'; });
          const now = performance.now(), dt = Math.min(.05, (now - (F.last || now)) / 1000), T2 = now / 1000; F.last = now;
          F.tree.style.transform = 'rotate(' + (Math.sin(T2 * 1.1) * .55 + Math.sin(T2 * 2.7) * .18).toFixed(3) + 'deg) skewX(' + (Math.sin(T2 * 1.1 + .6) * .5).toFixed(3) + 'deg)';
          const cv = F.amb, CW = Math.round(bw / 1.5), CH = Math.round(bh / 1.5); if (cv.width !== CW || cv.height !== CH){ cv.width = CW; cv.height = CH; } const x = cv.getContext('2d'); x.clearRect(0, 0, CW, CH);
          F.puffs.forEach((el, k) => { const p = (T2 / 5.5 + k / 3) % 1, e2 = p * (2 - p); el.style.opacity = (Math.sin(Math.PI * p) * .95).toFixed(3); el.style.transform = 'translate(' + (e2 * 2.2 + Math.sin(T2 * .9 + k) * .25).toFixed(3) + '%,' + (-e2 * 5.5).toFixed(3) + '%) scale(' + (.85 + e2 * .45).toFixed(3) + ') skewX(' + (-6 * e2).toFixed(2) + 'deg)'; });
          const vt = (-parseFloat(F.scene.style.top) + .08 * OH) / bh, vl = (-parseFloat(F.scene.style.left) + .08 * OW) / bw, vwf = OW / bw;
          x.strokeStyle = 'rgba(52,50,47,.8)'; x.lineCap = 'round'; x.lineJoin = 'round'; let lead = F.birds[0]; lead.x += dt * lead.v; if (lead.x > 1.15){ lead.x = -.12; lead.y = .12 + Math.random() * .12; }
          F.birds.forEach((bd, k) => { if (k){ bd.x = lead.x - k * .045 - Math.sin(T2 * .3 + k) * .006; bd.y += (lead.y + (k % 2 ? .04 : -.03) * k * .6 - bd.y) * .02; }
            const ft = (T2 + bd.ph) % bd.cyc, flapping = ft < .9, fl = flapping ? Math.sin(ft / .9 * Math.PI * 2.5) : .25 + Math.sin(T2 * 1.3 + bd.ph) * .05;
            const px = (vl + bd.x * vwf * .62) * CW, py = (vt + (bd.y + Math.sin(T2 * .5 + bd.ph) * .006) * (OH / bh)) * CH, w = 7 * bd.s * CW / 1000, lift = w * .5 * fl;
            // 날개: 몸에서 굵게 시작해 손목에서 꺾이고 끝으로 가늘어지는 채운 모양, 작은 몸통과 꼬리
            x.fillStyle = 'rgba(46,44,41,' + (.62 + bd.s * .18).toFixed(2) + ')';
            [-1, 1].forEach(sd => { const wx = px + sd * w * .42, wy = py - lift * .62 - w * .1, tx = px + sd * w, ty = py - lift + w * .04;
              x.beginPath(); x.moveTo(px + sd * w * .04, py - w * .07); x.quadraticCurveTo(wx - sd * w * .02, wy - w * .07, tx, ty);
              x.quadraticCurveTo(wx + sd * w * .02, wy + w * .09, px + sd * w * .05, py + w * .05); x.closePath(); x.fill(); });
            x.beginPath(); x.ellipse(px, py, w * .13, w * .055, 0, 0, 7); x.fill();
            x.beginPath(); x.moveTo(px - w * .1, py); x.lineTo(px - w * .24, py - w * .03); x.lineTo(px - w * .22, py + w * .05); x.closePath(); x.fill(); });
        } else if (FF && i === FF.i){ P.fr.style.visibility = ''; FF.r0 = null; FF.ov.style.opacity = '0'; FF.blocks.forEach(bl => bl.style.opacity = 0); }
        panelFx(P, d); grainTick(performance.now()); P.caps.forEach(c => { c.cap.style.transform = window.__mmCapEdit ? 'none' : 'translate3d(' + (P.mode ? 0 : d * c.dx * 18).toFixed(1) + 'px,' + (-d * vh * (c.k - 1.1) * (P.mode ? .12 : .5)).toFixed(1) + 'px,0)'; }); }); });
    requestAnimationFrame(frame); }
  if (!reduced) requestAnimationFrame(frame);
  else comics.forEach(C => { C.sec.style.height = 'auto'; C.panels.forEach(P => { P.wrap.style.position = 'relative'; P.wrap.style.left = P.wrap.style.top = 'auto'; P.wrap.style.margin = '12vh auto'; }); C.sec.firstElementChild.style.position = 'relative'; C.sec.firstElementChild.style.height = 'auto'; });
})();

// 엔딩 크레딧 — 화면이 완전히 검게 바뀐 뒤, 이름들이 스크롤을 따라 아래에서 위로 올라간다
(function credits(){
  const sec = document.getElementById('credits'), roll = document.getElementById('roll'); if (!sec || !roll) return;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // 끝: 조사명 → 국가유산청 → 한국민속학회 → 제목. 화면 가운데에 고정된 채 하나씩 나타났다 사라진다
  { const lastP = [...roll.querySelectorAll('p[data-cr-line]')].pop(); if (lastP && /국가유산청/.test(lastP.textContent)) lastP.remove(); }
  const pin = document.getElementById('cr-end').parentElement, mkStep = (html) => { const el = document.createElement('div'); el.style.cssText = "position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);display:flex;justify-content:center;align-items:center;padding:0 6vw;opacity:0;pointer-events:none;text-align:center"; el.innerHTML = html; pin.appendChild(el); return el; };
  const LOGOS = {'국가유산청': 'assets/logo-khs.svg', '(사)한국민속학회': 'assets/logo-kfs.svg'}, LOGO_SUB = {'(사)한국민속학회': '(사)한국민속학회'}; // 로고 파일이 들어오면 경로를 넣는다 — 예: {'국가유산청': 'assets/logo-khs.jpg'}
  const logo = (src, name) => LOGOS[name] ? '<div style="display:flex;flex-direction:column;align-items:center;gap:18px"><img src="' + LOGOS[name] + '" alt="' + name + '" style="display:block;width:min(52vw,340px);height:auto;max-height:min(14vh,110px);object-fit:contain;' + (/khs/.test(LOGOS[name]) ? '' : 'filter:brightness(0) invert(1)') + '">' + (LOGO_SUB[name] ? '<span style="font-family:\'Nanum Myeongjo\',serif;font-weight:700;font-size:clamp(16px,1.8vw,22px);letter-spacing:.06em;color:#f2efe9">' + LOGO_SUB[name] + '</span>' : '') + '</div>' : '<span style="font-family:\'Nanum Myeongjo\',serif;font-weight:700;font-size:clamp(22px,3vw,34px);color:#f2efe9">' + name + '</span>';
  const steps = [mkStep("<p style=\"margin:0;font-family:'Nanum Myeongjo','Apple Myungjo',serif;font-weight:700;font-size:clamp(20px,2.6vw,32px);line-height:1.6;color:#f2efe9;word-break:keep-all\">2026년 K-무형유산 지식자원 기초조사</p>"), mkStep(logo('assets/logo-khs.jpg', '국가유산청')), mkStep(logo('assets/logo-kfs.jpg', '(사)한국민속학회'))];
  const fit = () => { sec.style.height = Math.round(roll.offsetHeight + innerHeight * 7.2) + 'px'; }; fit(); addEventListener('resize', fit); (document.fonts ? document.fonts.ready : Promise.resolve()).then(fit);
  const sm3 = t => t * t * (3 - 2 * t);
  const tick = () => { const vh = innerHeight, r = sec.getBoundingClientRect();
    if (r.bottom > 0 && r.top < vh){ const sp = Math.max(1, r.height - vh), q = clamp(-r.top / sp, 0, 1), H = roll.offsetHeight, rollSpan = (H + vh) / sp, k = clamp((q - .04) / rollSpan, 0, 1), endT = .04 + rollSpan;
      const SW = (1 - endT) / (steps.length + 1.4); steps.forEach((el, i) => { const a0 = endT + i * SW, u = clamp((q - a0) / SW, 0, 1), fi = sm3(clamp(u / .3, 0, 1)), fo = sm3(clamp((u - .72) / .28, 0, 1)), o = fi * (1 - fo); el.style.opacity = o.toFixed(3); el.style.filter = 'blur(' + ((1 - fi) * 6 + fo * 6).toFixed(1) + 'px)'; });
      { const ce = document.getElementById('cr-end'); if (ce){ const e = clamp((q - (endT + steps.length * SW)) / (SW * .6), 0, 1), ee = e * e * (3 - 2 * e); ce.style.opacity = ee.toFixed(3); ce.style.transform = 'translateY(calc(-50% + ' + ((1 - ee) * 18).toFixed(1) + 'px))'; ce.style.filter = 'blur(' + ((1 - ee) * 6).toFixed(1) + 'px)'; } }
      roll.style.transform = 'translate3d(0,' + (-(k * (H + vh))).toFixed(1) + 'px,0)';
      roll.querySelectorAll('[data-cr-line]').forEach(el => { const t = el.getBoundingClientRect().top, inn = clamp((vh * .9 - t) / (vh * .16), 0, 1), out = clamp((t - vh * .06) / (vh * .14), 0, 1), e = inn * inn * (3 - 2 * inn); el.style.opacity = (e * out).toFixed(3); el.style.transform = 'translate3d(0,' + ((1 - e) * 22).toFixed(1) + 'px,0)'; }); }
    requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
})();

// 배치 편집 모드 — 설정 › 배치 편집. 상자를 끌어 옮기면 이 브라우저에 저장되고, '배치 확정'으로 코드에 고정할 값을 남긴다
(function capEditor(){
  const btn = document.getElementById('b-edit'); if (!btn) return;
  const bar = document.createElement('div'); bar.setAttribute('role', 'toolbar'); bar.style.cssText = "position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:80;display:none;align-items:center;gap:6px;padding:8px 8px 8px 16px;background:rgba(20,18,16,.92);color:#f2efe9;font:14px 'Noto Sans KR',sans-serif;border-radius:999px;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)";
  const msg = document.createElement('span'); msg.style.cssText = 'margin-right:8px;white-space:nowrap'; msg.textContent = '상자를 끌어 옮기세요';
  const mk = (t, fn) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.style.cssText = 'padding:8px 14px;border-radius:999px;background:rgba(242,239,233,.12);color:#f2efe9;font:inherit;cursor:pointer;white-space:nowrap;transition:transform 100ms'; b.onpointerdown = () => b.style.transform = 'scale(.95)'; b.onpointerup = b.onpointerleave = () => b.style.transform = ''; b.onclick = fn; return b; };
  const allCaps = () => CAPPOS.reg.flatMap(r => r.caps.map(c => ({cap: c.cap, wrap: r.wrap})));
  const handle = (host, kind, css) => { let h = host.querySelector(':scope > [data-rs]'); if (!h){ h = document.createElement('div'); h.dataset.rs = kind; h.setAttribute('aria-hidden', 'true'); h.style.cssText = 'position:absolute;z-index:6;width:14px;height:14px;background:#141210;border:2px solid #f2efe9;border-radius:50%;cursor:nwse-resize;touch-action:none;' + css; host.appendChild(h); } return h; };
  const handles = on => { document.querySelectorAll('[data-frame-key]').forEach(w => handle(w, 'frame', 'right:-9px;bottom:-9px').style.display = on ? '' : 'none'); allCaps().forEach(({cap}) => { const h = handle(cap, 'cap', 'right:-9px;top:50%;margin-top:-7px;cursor:ew-resize'); h.style.display = on ? '' : 'none'; }); };
  let rs = null;
  document.addEventListener('pointerdown', e => { if (!window.__mmCapEdit || !e.target.dataset || !e.target.dataset.rs) return; e.preventDefault(); e.stopImmediatePropagation(); const h = e.target, host = h.parentElement;
    rs = {kind: h.dataset.rs, host, x: e.clientX, w0: host.offsetWidth}; if (rs.kind === 'cap') host.style.maxWidth = 'none'; }, true);
  document.addEventListener('pointermove', e => { if (!rs) return; const dx = e.clientX - rs.x;
    if (rs.kind === 'cap'){ rs.host.style.width = Math.max(120, rs.w0 + dx) + 'px'; }
    else { const nw = Math.max(innerWidth * .2, Math.min(innerWidth * .9, rs.w0 + dx * 2)); rs.host.style.width = nw + 'px'; rs.nw = nw; } });
  document.addEventListener('pointerup', () => { if (!rs) return; const r = rs; rs = null;
    if (r.kind === 'cap'){ const wr = r.host.offsetParent; if (wr){ const p = +(r.host.offsetWidth / wr.offsetWidth * 100).toFixed(2); r.host.style.width = p + '%'; CAPPOS.set(r.host.dataset.capKey, {w: p}); } }
    else if (r.nw){ const fw = +((+r.host.dataset.fw) * r.nw / r.w0).toFixed(2); r.host.dataset.fw = fw; r.host.style.width = 'min(' + fw + 'vw,' + Math.round(fw * 1.3) + 'vh)'; CAPPOS.set(r.host.dataset.frameKey, {fw}); }
    msg.textContent = '저장됨'; });
  const style = on => { handles(on); document.querySelectorAll('[data-img-key]').forEach(im => { im.style.cursor = on ? 'move' : ''; im.style.touchAction = on ? 'none' : ''; im.style.outline = on ? '2px dashed rgba(20,18,16,.45)' : ''; im.style.outlineOffset = on ? '-14%' : ''; }); styleCaps(on); };
  const styleCaps = on => allCaps().forEach(({cap}) => { cap.style.outline = on ? '2px dashed #141210' : ''; cap.style.outlineOffset = on ? '4px' : ''; cap.style.cursor = on ? 'grab' : ''; cap.style.touchAction = on ? 'none' : ''; cap.style.userSelect = on ? 'none' : ''; });
  const set = on => { window.__mmCapEdit = on; bar.style.display = on ? 'flex' : 'none'; btn.querySelector('.st') && (btn.querySelector('.st').textContent = on ? '켬' : '끔'); style(on); msg.textContent = '끌어서 옮기기 · 점을 끌어 크기 조절 · 휠로 그림 확대'; };
  bar.append(msg, mk('되돌리기', () => { if (!confirm('옮긴 위치를 모두 지우고 자동 배치로 되돌릴까요?')) return; CAPPOS.clear(); document.querySelectorAll('[data-img-key]').forEach(im => { im.style.backgroundPosition = 'center'; im.style.backgroundSize = 'cover'; im._z = 0; }); allCaps().forEach(({cap}) => { ['top', 'bottom', 'left', 'right', 'width'].forEach(k => cap.style[k] = ''); }); document.querySelectorAll('[data-frame-key]').forEach(w => { const d = [52, 47, 56, 45, 50][+w.dataset.frameKey.split('-').pop() % 5]; w.dataset.fw = d; w.style.width = 'min(' + d + 'vw,' + Math.round(d * 1.3) + 'vh)'; }); CAPPOS.reg.forEach(r => r.relayout()); msg.textContent = '자동 배치로 되돌렸습니다'; }),
    mk('배치 확정', () => { const data = JSON.stringify(CAPPOS.load()); try { navigator.clipboard && navigator.clipboard.writeText(data); } catch(e){} msg.textContent = '저장됨 — 채팅에 "배치 확정"이라고 알려 주세요'; }),
    mk('끝내기', () => set(false)));
  document.body.appendChild(bar);
  btn.addEventListener('click', () => set(!window.__mmCapEdit));
  let drag = null, pan = null;
  const posOf = im => { const m = (im.style.backgroundPosition || '50% 50%').match(/(-?[\d.]+)%\s+(-?[\d.]+)%/); return m ? [+m[1], +m[2]] : [50, 50]; };
  const dims = im => new Promise(res => { if (im._nat) return res(im._nat); const u = (getComputedStyle(im).backgroundImage.match(/url\(["']?(.*?)["']?\)/) || [])[1]; if (!u) return res(null); const g = new Image(); g.onload = () => res(im._nat = [g.naturalWidth, g.naturalHeight]); g.onerror = () => res(null); g.src = u; });
  document.addEventListener('pointerdown', async e => { if (!window.__mmCapEdit || !e.target.closest) return; const im = !e.target.closest('[data-cap-key]') && e.target.closest('[data-img-key]'); if (!im) return; e.preventDefault();
    const g = await geo(im); if (!g) return; const [px, py] = posOf(im);
    pan = {im, x: e.clientX, y: e.clientY, px, py, ox: g.ox, oy: g.oy}; msg.textContent = g.ox < 1 && g.oy < 1 ? '휠을 굴려 확대하면 움직일 수 있습니다' : '끌어서 위치, 휠로 확대/축소'; }, true);
  const geo = async im => { const n = await dims(im); if (!n) return null; const W0 = im.offsetWidth, H0 = im.offsetHeight, sc = Math.max(W0 / n[0], H0 / n[1]), cw = n[0] * sc / W0 * 100, z = im._z || ((parseFloat(im.style.backgroundSize) || cw) / cw), w = n[0] * sc * z, h = n[1] * sc * z; im._z = z; return {cw, z, ox: w - W0, oy: h - H0}; };
  const save = im => { const [x, y] = posOf(im), sz = parseFloat(im.style.backgroundSize); CAPPOS.set(im.dataset.imgKey, sz ? {x, y, s: +sz.toFixed(2)} : {x, y}); };
  addEventListener('wheel', async e => { if (!window.__mmCapEdit || !e.target.closest) return; const im = !e.target.closest('[data-cap-key]') && e.target.closest('[data-img-key]'); if (!im) return; e.preventDefault();
    const g = await geo(im); if (!g) return; const z = Math.max(1, Math.min(3, g.z * (e.deltaY < 0 ? 1.06 : 1 / 1.06))); im._z = z; im.style.backgroundSize = (g.cw * z).toFixed(2) + '% auto'; save(im); msg.textContent = '확대 ' + Math.round(z * 100) + '% — 끌어서 위치 조정'; }, {passive: false});
  document.addEventListener('pointermove', e => { if (!pan) return; const nx = pan.ox > 1 ? Math.max(0, Math.min(100, pan.px - (e.clientX - pan.x) / pan.ox * 100)) : 50, ny = pan.oy > 1 ? Math.max(0, Math.min(100, pan.py - (e.clientY - pan.y) / pan.oy * 100)) : 50; pan.im.style.backgroundPosition = nx.toFixed(1) + '% ' + ny.toFixed(1) + '%'; });
  document.addEventListener('pointerup', () => { if (!pan) return; save(pan.im); pan = null; msg.textContent = '저장됨'; });
  document.addEventListener('pointerdown', e => { if (!window.__mmCapEdit) return; const cap = e.target.closest && e.target.closest('[data-cap-key]'); if (!cap) return; e.preventDefault();
    drag = {cap, x: e.clientX, y: e.clientY, l: cap.offsetLeft, t: cap.offsetTop}; cap.setPointerCapture && cap.setPointerCapture(e.pointerId); cap.style.cursor = 'grabbing'; cap.style.zIndex = 5; }, true);
  document.addEventListener('pointermove', e => { if (!drag) return; const c = drag.cap; ['top', 'bottom', 'left', 'right'].forEach(k => c.style[k] = ''); c.style.left = (drag.l + e.clientX - drag.x) + 'px'; c.style.top = (drag.t + e.clientY - drag.y) + 'px'; });
  document.addEventListener('pointerup', () => { if (!drag) return; const c = drag.cap, w = c.offsetParent; drag = null; c.style.cursor = 'grab'; c.style.zIndex = 2; if (!w) return;
    const l = +(c.offsetLeft / w.offsetWidth * 100).toFixed(2), t = +(c.offsetTop / w.offsetHeight * 100).toFixed(2); c.style.left = l + '%'; c.style.top = t + '%'; CAPPOS.set(c.dataset.capKey, {l, t}); msg.textContent = '저장됨'; });
  addEventListener('wheel', e => { if (window.__mmCapEdit && drag) e.preventDefault(); }, {passive: false});
})();

// 챕터 바로가기 — 왼쪽에 숫자만, 마우스를 올리면 CHAPTER n으로 펼쳐진다. 배경 밝기와 상관없이 읽히도록 difference 합성
(function chapterNav(){
  const ids = ['p2', 'p3', 'p4', 'p5', 'p6'], secs = ids.map(id => document.getElementById(id)); if (secs.some(x => !x)) return;
  const SIG = 'cubic-bezier(.4,0,.2,1)', nav = document.createElement('nav'); nav.setAttribute('aria-label', '챕터 바로가기');
  nav.style.cssText = 'position:fixed;left:22px;top:50%;transform:translate(-8px,-50%);z-index:58;display:flex;flex-direction:column;gap:6px;mix-blend-mode:difference;color:#f2efe9;opacity:0;pointer-events:none;transition:opacity 400ms ' + SIG + ',transform 400ms ' + SIG;
  const items = secs.map((sec, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'CHAPTER ' + (i + 1) + '로 이동');
    b.style.cssText = "display:flex;align-items:center;gap:10px;padding:6px 8px 6px 0;background:none;border:0;color:inherit;cursor:pointer;font-family:'GriunKimTang','Nanum Myeongjo',serif;font-size:15px;letter-spacing:.14em;line-height:1;opacity:.45;transition:opacity 200ms " + SIG + ',transform 100ms';
    const ln = document.createElement('span'); ln.setAttribute('aria-hidden', 'true'); ln.style.cssText = 'display:block;height:1px;width:10px;background:currentColor;transition:width 400ms ' + SIG;
    const lab = document.createElement('span'); lab.style.cssText = 'display:flex;align-items:baseline;white-space:nowrap';
    const word = document.createElement('span'); word.textContent = 'CHAPTER'; word.style.cssText = 'display:inline-block;overflow:hidden;max-width:0;opacity:0;transition:max-width 400ms ' + SIG + ',opacity 200ms ' + SIG + ',margin 400ms ' + SIG;
    const num = document.createElement('span'); num.textContent = String(i + 1);
    lab.append(word, num); b.append(ln, lab);
    const open = on => { word.style.maxWidth = on ? '7em' : '0'; word.style.opacity = on ? '1' : '0'; word.style.marginRight = on ? '.5em' : '0'; };
    b.addEventListener('mouseenter', () => { open(true); b.style.opacity = '1'; }); b.addEventListener('mouseleave', () => { open(false); b.style.opacity = b._act ? '1' : '.45'; });
    b.addEventListener('focus', () => open(true)); b.addEventListener('blur', () => open(false));
    b.addEventListener('pointerdown', () => b.style.transform = 'scale(.95)'); b.addEventListener('pointerup', () => b.style.transform = ''); b.addEventListener('pointerleave', () => b.style.transform = '');
    b.addEventListener('click', () => { window.__mmStarted = 1; window.scrollTo({top: sec.offsetTop + 2, behavior: 'smooth'}); });
    nav.appendChild(b); return {b, ln, sec}; });
  document.body.appendChild(nav);
  let shown = false, act = -1;
  const tick = () => { const y = scrollY, vh = innerHeight, on = y >= secs[0].offsetTop - vh * .5;
    if (on !== shown){ shown = on; nav.style.opacity = on ? '1' : '0'; nav.style.pointerEvents = on ? 'auto' : 'none'; nav.style.transform = on ? 'translate(0,-50%)' : 'translate(-8px,-50%)'; }
    let a = -1; secs.forEach((s, i) => { if (y + vh * .5 >= s.offsetTop) a = i; });
    if (a !== act){ act = a; items.forEach((it, i) => { it.b._act = i === a; it.ln.style.width = i === a ? '28px' : '10px'; if (!it.b.matches(':hover')) it.b.style.opacity = i === a ? '1' : '.45'; it.b.setAttribute('aria-current', i === a ? 'true' : 'false'); }); }
    requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
})();

// 모바일 공통: 챕터 내비·영상 컨트롤·표지 제목을 작은 화면과 가로 화면에 맞춘다
(function mobileTweaks(){
  const apply = () => { const P = innerWidth < 760, L = !P && innerHeight < 520;
    const nav = document.querySelector('nav[aria-label="챕터 바로가기"]'); if (nav){ nav.style.left = P ? '4px' : L ? '10px' : '22px'; nav.style.gap = P || L ? '2px' : '6px'; nav.querySelectorAll('button').forEach(b => { b.style.minHeight = P || L ? '40px' : ''; b.style.fontSize = P ? '12px' : ''; }); }
    const ctl = document.getElementById('intro-ctl'); if (ctl) ctl.style.paddingBottom = 'calc(' + (L ? 10 : 18) + 'px + env(safe-area-inset-bottom))';
    const ct = document.getElementById('cover-title'); if (ct){ if (ct.dataset.fs0 == null) ct.dataset.fs0 = ct.style.fontSize; ct.style.top = L ? '10%' : P ? '18%' : '14%'; ct.style.fontSize = P ? 'clamp(24px,7.4vw,40px)' : L ? 'clamp(24px,5vw,44px)' : ct.dataset.fs0; }
    document.querySelectorAll('#roll [data-cr-line]').forEach(r => { if (r.style.display === 'grid') r.style.gap = P ? '14px' : '32px'; });
  };
  apply(); addEventListener('resize', apply); addEventListener('orientationchange', () => setTimeout(apply, 150)); setTimeout(apply, 1500);
})();

// 소리: 배경음악(낮은 지속음 + 가끔 울리는 현 소리)과 효과음 — 파일 없이 브라우저에서 합성한다. 설정에서 끌 수 있다
(function audio(){ if (window.MMSfx) return; let ctx = null, master, bgmG, sfxG, verb, on = localStorage.getItem('mm-sound') !== 'off', bgm = null;
  const init = () => { if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; } try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){ return; }
    master = ctx.createGain(); master.gain.value = on ? 1 : 0; master.connect(ctx.destination); bgmG = ctx.createGain(); bgmG.gain.value = 0; sfxG = ctx.createGain(); sfxG.gain.value = .9; bgmG.connect(master); sfxG.connect(master);
    const dl = ctx.createDelay(1.5); dl.delayTime.value = .38; const fb = ctx.createGain(); fb.gain.value = .42; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800; dl.connect(lp); lp.connect(fb); fb.connect(dl); verb = ctx.createGain(); verb.gain.value = .5; verb.connect(dl); dl.connect(master); };
  ['pointerdown', 'keydown', 'touchend'].forEach(ev => addEventListener(ev, init, {capture: true, passive: true}));
  const noise = sec => { const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * sec), ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const n = ctx.createBufferSource(); n.buffer = b; return n; };
  const env = (g, t, a, peak, dec) => { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + dec); };
  const S = {
    thump(pan){ const t = ctx.currentTime, p = ctx.createStereoPanner(); p.pan.value = pan || 0; p.connect(sfxG);
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(92, t); o.frequency.exponentialRampToValueAtTime(38, t + .32); env(g, t, .004, .9, .5); o.connect(g); g.connect(p); o.start(t); o.stop(t + .6);
      const n = noise(.2), bp = ctx.createBiquadFilter(), g2 = ctx.createGain(); bp.type = 'bandpass'; bp.frequency.value = 220; bp.Q.value = 1.4; env(g2, t, .002, .5, .14); n.connect(bp); bp.connect(g2); g2.connect(p); n.start(t); },
    steps(){ [0, .5].forEach(dt => { const t = ctx.currentTime + dt, n = noise(.15), bp = ctx.createBiquadFilter(), g = ctx.createGain(); bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = .9; env(g, t, .003, .45, .1); n.connect(bp); bp.connect(g); g.connect(sfxG); n.start(t);
      const o = ctx.createOscillator(), g2 = ctx.createGain(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(60, t + .1); env(g2, t, .003, .35, .12); o.connect(g2); g2.connect(sfxG); o.start(t); o.stop(t + .2); }); },
    wind(len){ len = len || 1; const t = ctx.currentTime, D = 3.4 * len, n = noise(D + .2), bp = ctx.createBiquadFilter(), g = ctx.createGain(); bp.type = 'bandpass'; bp.Q.value = .7; bp.frequency.setValueAtTime(380, t); bp.frequency.linearRampToValueAtTime(900, t + D * .45); bp.frequency.linearRampToValueAtTime(320, t + D);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.32, t + D * .4); g.gain.linearRampToValueAtTime(0, t + D); n.connect(bp); bp.connect(g); g.connect(sfxG); g.connect(verb); n.start(t); },
    birds(){ for (let k = 0; k < 5; k++){ const t = ctx.currentTime + .15 + k * (.18 + Math.random() * .25), o = ctx.createOscillator(), g = ctx.createGain(), f = 2600 + Math.random() * 900; o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.45, t + .07); env(g, t, .005, .07, .09); o.connect(g); g.connect(sfxG); g.connect(verb); o.start(t); o.stop(t + .2); } }
  };
  // 배경음악: A단조 오음계의 낮은 지속음과, 6~11초마다 하나씩 울리는 현
  const startBgm = () => { if (bgm || !ctx) return; const t = ctx.currentTime, lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; lp.connect(bgmG); const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = .05; lg.gain.value = 220; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
    const dr = [[110, 'triangle', .07], [110.6, 'sawtooth', .018], [164.8, 'triangle', .045], [220.4, 'sine', .03]].map(([f, ty, gv]) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = ty; o.frequency.value = f; g.gain.value = gv; o.connect(g); g.connect(lp); o.start(t); return o; });
    const notes = [220, 261.6, 293.7, 329.6, 392, 440, 523.3, 587.3];
    const pluck = () => { if (!bgm) return; const tt = ctx.currentTime + .05, f = notes[Math.floor(Math.random() * notes.length)], o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), bp = ctx.createBiquadFilter(); bp.type = 'lowpass'; bp.frequency.setValueAtTime(2400, tt); bp.frequency.exponentialRampToValueAtTime(500, tt + 1.8);
      o.type = 'triangle'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2.003; g.gain.setValueAtTime(0, tt); g.gain.linearRampToValueAtTime(.09, tt + .008); g.gain.exponentialRampToValueAtTime(.0001, tt + 3.2); o.frequency.setValueAtTime(f * 1.012, tt); o.frequency.exponentialRampToValueAtTime(f, tt + .25);
      o.connect(bp); o2.connect(bp); bp.connect(g); g.connect(bgmG); g.connect(verb); o.start(tt); o2.start(tt); o.stop(tt + 3.4); o2.stop(tt + 3.4); bgm.tm = setTimeout(pluck, 6000 + Math.random() * 5000); };
    bgm = {dr, lfo, tm: setTimeout(pluck, 2500)}; };
  setInterval(() => { if (!ctx) return; const v = document.getElementById('intro-video'), playing = v && !v.paused && !v.ended, want = on && window.__mmStarted && !playing && !document.hidden && window.scrollY > innerHeight * .5;
    if (want) startBgm(); bgmG.gain.setTargetAtTime(want ? .55 : 0, ctx.currentTime, want ? 2.5 : .6); }, 400);
  window.MMSfx = { play(k, a){ if (!ctx || !on || ctx.state !== 'running' || !S[k]) return; S[k](a); } };
  // 설정 패널에 '소리' 켜기/끄기
  const addBtn = () => { const panel = document.getElementById('panel'), ref = document.getElementById('b-caps'); if (!panel || !ref || document.getElementById('b-sound')) return; const b = ref.cloneNode(true); b.id = 'b-sound'; b.firstChild.textContent = '소리'; const stl = b.querySelector('.st'); if (stl) stl.textContent = on ? '켬' : '끔';
    b.addEventListener('click', () => { on = !on; localStorage.setItem('mm-sound', on ? 'on' : 'off'); if (stl) stl.textContent = on ? '켬' : '끔'; init(); if (master) master.gain.setTargetAtTime(on ? 1 : 0, ctx.currentTime, .2); }); panel.insertBefore(b, ref); };
  addBtn(); setTimeout(addBtn, 1200);
})();
