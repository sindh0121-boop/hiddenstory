// 만화 칸 그림 — 목탄 질감(흐린 마스크 → 노이즈 임계값)으로 그린 구체적 장면들. 값 구성: 배경 옅음 → 중경 중간 → 전경 짙음
(function(){
  const W = 720, H = 576, DK = [17,16,15], LT = [243,242,239], R = Math.random, PI = Math.PI;
  const G = v => [v, v - 1, v - 3];
  const STR = new Float32Array(W); { let v = 0; for (let i = 0; i < W; i++){ v = v * .55 + R() * .45; STR[i] = R() < .5 ? v : v * v; } }
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w || W; c.height = h || H; return c; };
  function ink(out, paint, o){ o = o || {};
    const m = mk(), x = m.getContext('2d'); x.fillStyle = '#fff'; x.strokeStyle = '#fff'; x.lineCap = 'round'; x.lineJoin = 'round'; paint(x);
    const k = Math.max(2.5, (o.blur == null ? 4 : o.blur) * 1.6), sw = Math.max(6, Math.round(W / k)), sh = Math.max(6, Math.round(H / k));
    const s = mk(sw, sh), sx = s.getContext('2d'); sx.imageSmoothingQuality = 'high'; sx.drawImage(m, 0, 0, sw, sh);
    let md = s; for (let f = 2; sw * f < W; f *= 2){ const n = mk(Math.min(W, sw * f), Math.min(H, sh * f)), nx = n.getContext('2d'); nx.imageSmoothingQuality = 'high'; nx.filter = 'blur(1px)'; nx.drawImage(md, 0, 0, n.width, n.height); md = n; }
    const b = mk(), bx = b.getContext('2d'); bx.imageSmoothingQuality = 'high'; bx.drawImage(md, 0, 0, W, H);
    const d = bx.getImageData(0, 0, W, H), p = d.data, c = o.col || DK, gr = (o.grain == null ? .6 : o.grain) * 1.25, op = o.op == null ? 1 : o.op, sp = o.speck == null ? .2 : o.speck, st = o.streak == null ? .14 : o.streak, sl = o.slope == null ? .35 : o.slope;
    for (let i = 0; i < p.length; i += 4){ const a = p[i+3] / 255; if (a < .01){ p[i+3] = 0; continue; }
      const px = (i >> 2) % W, py = (i >> 2) / W | 0, sv = STR[(px + (py * sl | 0) + 4 * W) % W];
      const t = a + (R() - .5) * gr; let al = t <= .28 ? 0 : t >= .72 ? 1 : (t - .28) / .44; al *= (1 - sp * R()) * (1 - st * sv) * op;
      p[i] = c[0]; p[i+1] = c[1]; p[i+2] = c[2]; p[i+3] = al * 255; }
    bx.putImageData(d, 0, 0); out.drawImage(b, 0, 0); }
  // 선: 목탄 선 (살짝 떨림)
  function line(out, pts, o){ o = o || {}; ink(out, x => { x.lineWidth = o.lw || 3; x.beginPath(); pts.forEach(([px, py], i) => { const jx = px + (R() - .5) * (o.j || 1.2), jy = py + (R() - .5) * (o.j || 1.2); i ? x.lineTo(jx, jy) : x.moveTo(jx, jy); }); if (o.close) x.closePath(); x.stroke(); }, {blur: o.blur || 1.6, col: o.col, op: o.op == null ? .9 : o.op, grain: o.grain == null ? .5 : o.grain}); }
  function hatch(out, path, o){ out.save(); out.beginPath(); path(out); out.clip(); out.strokeStyle = o.col; out.lineCap = 'round';
    for (let k = 0; k < o.n; k++){ const px = o.x0 + R() * (o.x1 - o.x0), py = o.y0 + R() * (o.y1 - o.y0), an = o.a + (R() - .5) * (o.da || .3), L = o.len * (.4 + R() * .8);
      out.globalAlpha = o.al * (.3 + R() * .7); out.lineWidth = o.lw * (.5 + R()); out.beginPath(); out.moveTo(px, py); out.lineTo(px + Math.cos(an) * L, py + Math.sin(an) * L); out.stroke(); }
    out.restore(); out.globalAlpha = 1; }
  const poly = (x, pts) => { x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath(); };
  const fillP = (out, pts, o) => ink(out, x => { poly(x, pts); x.fill(); }, o);
  const ell = (out, cx, cy, rx, ry, o, rot) => ink(out, x => { x.beginPath(); x.ellipse(cx, cy, rx, ry, rot || 0, 0, 7); x.fill(); }, o);
  const rect = (out, px, py, w, h, o) => ink(out, x => x.fillRect(px, py, w, h), o);
  const sky = (out, v0, v1) => { const g = out.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgb(' + G(v0).join(',') + ')'); g.addColorStop(1, 'rgb(' + G(v1).join(',') + ')'); out.fillStyle = g; out.fillRect(0, 0, W, H); };
  const paper = out => { out.fillStyle = '#e9e7e3'; out.fillRect(0, 0, W, H); };
  // ---- 소재 ----
  // 초가집: 둥근 초가지붕 + 흙벽 + 문
  function thatch(out, cx, by, w, h, o){ o = o || {}; const rv = o.roof || DK, wv = o.wall || G(120), rh = h * .5;
    fillP(out, [[cx - w*.5, by], [cx - w*.5, by - h + rh], [cx + w*.5, by - h + rh], [cx + w*.5, by]], {col: wv, blur: 3});
    ink(out, x => { x.beginPath(); x.moveTo(cx - w*.58, by - h + rh + 4); x.quadraticCurveTo(cx - w*.5, by - h - rh*.1, cx, by - h - rh*.18); x.quadraticCurveTo(cx + w*.5, by - h - rh*.1, cx + w*.58, by - h + rh + 4); x.closePath(); x.fill(); }, {col: rv, blur: 3});
    hatch(out, x => { x.moveTo(cx - w*.58, by - h + rh + 4); x.quadraticCurveTo(cx, by - h - rh*.3, cx + w*.58, by - h + rh + 4); x.closePath(); }, {col: 'rgba(235,233,228,.5)', n: Math.round(w * .9), x0: cx - w*.6, x1: cx + w*.6, y0: by - h - rh*.2, y1: by - h + rh, a: PI/2, da: .25, len: rh * .5, lw: 1, al: .5});
    if (o.door !== false) rect(out, cx - w*.1, by - h*.42, w*.2, h*.42, {col: o.doorCol || G(40), blur: 2});
    if (o.smoke){ ink(out, x => { x.lineWidth = 9; x.beginPath(); x.moveTo(cx + w*.3, by - h - rh*.1); x.bezierCurveTo(cx + w*.36, by - h - rh*1.2, cx + w*.2, by - h - rh*1.8, cx + w*.34, by - h - rh*3); x.stroke(); }, {col: G(205), blur: 10, op: .7, grain: .9}); } }
  // 소나무
  function pine(out, cx, by, h, col){ col = col || DK; line(out, [[cx, by], [cx + h*.04, by - h*.45], [cx - h*.03, by - h*.8]], {lw: Math.max(3, h*.05), col, blur: 1.8});
    for (let k = 0; k < 4; k++){ const t = .35 + k*.18, y = by - h*t, s = (k % 2 ? 1 : -1), L = h*(.34 - k*.05); line(out, [[cx + (t-.3)*h*.05, y], [cx + s*L, y - h*.06]], {lw: 3, col, blur: 1.6});
      ell(out, cx + s*L*.75, y - h*.08, L*.5, h*.045, {col, blur: 3, grain: .9, speck: .4}); } ell(out, cx - h*.02, by - h*.86, h*.16, h*.06, {col, blur: 3, grain: .9, speck: .4}); }
  // 사람: 서 있는 뒷모습/앞모습, 한복 두루마기 실루엣. o: {hat:'gat'|'cap'|'gulgeon'|'none', back, bundle, sword, col}
  function person(out, cx, by, h, o){ o = o || {}; const col = o.col || DK, hr = h*.075, hy = by - h + hr*1.1, sw = h*.17;
    fillP(out, [[cx - sw*.55, by - h*.78], [cx - sw*1.05, by - h*.55], [cx - sw*.9, by], [cx + sw*.9, by], [cx + sw*1.05, by - h*.55], [cx + sw*.55, by - h*.78]], {col, blur: 3});
    ell(out, cx, by - h*.8, sw*.72, h*.045, {col, blur: 3});
    ell(out, cx, hy, hr, hr*1.12, {col, blur: 2});
    if (o.hat === 'gat'){ ell(out, cx, hy - hr*.45, hr*2.1, hr*.42, {col, blur: 1.8}); rect(out, cx - hr*.75, hy - hr*2.1, hr*1.5, hr*1.5, {col, blur: 1.8}); }
    if (o.hat === 'cap'){ rect(out, cx - hr*1.05, hy - hr*1.35, hr*2.1, hr*.9, {col, blur: 1.6}); fillP(out, [[cx - hr*1.2, hy - hr*.5], [cx + hr*1.3, hy - hr*.5], [cx + hr*1.5, hy - hr*.2]], {col, blur: 1.4}); }
    if (o.hat === 'gulgeon'){ fillP(out, [[cx - hr*1.1, hy - hr*.6], [cx, hy - hr*2.6], [cx + hr*1.1, hy - hr*.6]], {col: o.hatCol || col, blur: 1.6}); }
    if (o.sword) line(out, [[cx + sw*.9, by - h*.5], [cx + sw*1.1, by - h*.08]], {lw: 4, col, blur: 1.4});
    if (o.bundle) ell(out, cx, by - h*.58, sw*1.05, h*.12, {col: o.bundleCol || G(225), blur: 3, grain: .8});
    if (o.stick) line(out, [[cx + sw*1.2, by - h*.75], [cx + sw*1.2, by]], {lw: 3, col, blur: 1.4}); }
  // 앉은 사람 (옆/앞). bow: 고개 숙임
  function seated(out, cx, by, h, o){ o = o || {}; const col = o.col || DK, hr = h*.11, hy = by - h + hr*1.1 + (o.bow ? h*.09 : 0), hx = cx + (o.bow || 0) * h*.08;
    fillP(out, [[cx - h*.42, by], [cx - h*.36, by - h*.5], [cx - h*.2, by - h*.76], [cx, by - h*.8], [cx + h*.2, by - h*.76], [cx + h*.36, by - h*.5], [cx + h*.44, by]], {col, blur: 3});
    ell(out, hx, hy, hr, hr*1.1, {col, blur: 2});
    if (o.white) ell(out, hx, hy - hr*.55, hr*.95, hr*.5, {col: G(225), blur: 2, grain: .8});
    if (o.knees) [[-1], [1]].forEach(([s]) => ell(out, cx + s*h*.26, by - h*.12, h*.1, h*.07, {col: G(215), blur: 3}));
    if (o.notebook){ fillP(out, [[cx - h*.14, by - h*.3], [cx + h*.18, by - h*.34], [cx + h*.2, by - h*.2], [cx - h*.12, by - h*.16]], {col: LT, blur: 1.6}); line(out, [[cx + h*.12, by - h*.46], [cx + h*.17, by - h*.3]], {lw: 2.5, col, blur: 1.2}); } }
  // 창호 (격자 문/창)
  function lattice(out, px, py, w, h, o){ o = o || {}; rect(out, px, py, w, h, {col: o.paper || G(236), blur: 3, grain: .9}); const col = o.col || G(60), cols = o.cols || 3, rows = o.rows || 6;
    line(out, [[px, py], [px + w, py], [px + w, py + h], [px, py + h]], {lw: 5, col, close: true, blur: 1.5});
    for (let i = 1; i < cols; i++) line(out, [[px + w*i/cols, py], [px + w*i/cols, py + h]], {lw: 2.6, col, blur: 1.3});
    for (let j = 1; j < rows; j++) line(out, [[px, py + h*j/rows], [px + w, py + h*j/rows]], {lw: 2.6, col, blur: 1.3}); }
  // 글씨 흔적 (세로/가로)
  function script(out, px, py, w, n, o){ o = o || {}; const v = o.vertical, col = o.col || G(40);
    ink(out, x => { x.lineWidth = o.lw || 3; for (let i = 0; i < n; i++){ const L = (o.len || 40) * (.5 + R() * .7); if (v){ const cx = px + i * w; for (let y = py; y < py + L * 5; y += 11){ if (R() < .2) continue; x.beginPath(); x.moveTo(cx - 3, y); x.lineTo(cx + 3 + R()*2, y + 4 + R()*4); x.stroke(); } } else { const cy = py + i * w; x.beginPath(); x.moveTo(px, cy); for (let xx = px; xx < px + L; xx += 7) x.lineTo(xx, cy + Math.sin(xx*.4 + i)*2 + R()*2); x.stroke(); } } }, {blur: 1.4, col, op: .8, grain: .5}); }
  function mountains(out, layers){ layers.forEach(([y, amp, v, blur]) => ink(out, x => { x.beginPath(); x.moveTo(0, H); x.lineTo(0, y); for (let xx = 0; xx <= W; xx += 24) x.lineTo(xx, y - amp * (.5 + .5*Math.sin(xx*.009 + y) + .3*Math.sin(xx*.023 + amp))); x.lineTo(W, H); x.closePath(); x.fill(); }, {col: G(v), blur: blur || 10, grain: .8})); }
  function ground(out, y, v, o){ ink(out, x => { x.beginPath(); x.moveTo(0, H); x.lineTo(0, y); x.quadraticCurveTo(W*.5, y - (o && o.bow || 14), W, y + 4); x.lineTo(W, H); x.fill(); }, {col: G(v), blur: 8, grain: .8}); }
  function vignette(c){ const g = c.createRadialGradient(W/2, H/2, H*.3, W/2, H/2, H*.92); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.2)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  function grainAll(c){ const d = c.getImageData(0, 0, W, H), p = d.data; for (let i = 0; i < p.length; i += 4){ const n = (R() - .5) * 28 + (R() < .008 ? (R() - .5) * 110 : 0); p[i] += n; p[i+1] += n; p[i+2] += n; } c.putImageData(d, 0, 0); }

  const S = {
    // 4부
    '짚으로 덮은 초분': c => { sky(c, 232, 214); mountains(c, [[H*.46, 70, 190, 14]]); pine(c, W*.1, H*.5, 150, G(120)); pine(c, W*.9, H*.5, 120, G(120));
      ground(c, H*.68, 90); ground(c, H*.78, 50, {bow: 24});
      // 초분: 짚을 덮고 새끼줄로 묶은 긴 둔덕, 앞뒤에 나무 말뚝
      const mound = x => { x.moveTo(W*.24, H*.72); x.bezierCurveTo(W*.26, H*.44, W*.6, H*.4, W*.72, H*.7); x.closePath(); };
      ink(c, x => { mound(x); x.fill(); }, {col: G(175), blur: 4});
      hatch(c, mound, {col: 'rgba(30,28,26,.85)', n: 5200, x0: W*.22, x1: W*.74, y0: H*.42, y1: H*.72, a: 1.45, da: .35, len: 26, lw: 1.1, al: .55});
      hatch(c, mound, {col: 'rgba(240,238,233,.6)', n: 1800, x0: W*.22, x1: W*.74, y0: H*.42, y1: H*.6, a: 1.4, da: .3, len: 18, lw: .9, al: .5});
      [.3, .4, .5, .6, .68].forEach((t, k) => line(c, [[W*(.24 + t*.48), H*(.73 - Math.sin(t*PI)*.3) - 4], [W*(.24 + t*.48) + (k%2 ? -6 : 6), H*.71]], {lw: 3.5, col: G(25), blur: 1.4}));
      line(c, [[W*.26, H*.56], [W*.5, H*.44], [W*.7, H*.6]], {lw: 3, col: G(25), blur: 1.4}); line(c, [[W*.28, H*.64], [W*.5, H*.55], [W*.69, H*.66]], {lw: 3, col: G(25), blur: 1.4});
      line(c, [[W*.21, H*.74], [W*.22, H*.52]], {lw: 6, col: DK, blur: 1.6}); line(c, [[W*.75, H*.73], [W*.74, H*.55]], {lw: 6, col: DK, blur: 1.6});
      // 제상: 작은 상 위 그릇, 향
      rect(c, W*.36, H*.76, W*.22, 8, {col: DK, blur: 1.6}); line(c, [[W*.38, H*.77], [W*.38, H*.83]], {lw: 4, col: DK, blur: 1.4}); line(c, [[W*.56, H*.77], [W*.56, H*.83]], {lw: 4, col: DK, blur: 1.4});
      ell(c, W*.42, H*.755, 14, 6, {col: LT, blur: 1.4}); ell(c, W*.5, H*.755, 14, 6, {col: LT, blur: 1.4}); line(c, [[W*.47, H*.75], [W*.47, H*.62]], {lw: 2, col: G(140), blur: 4, op: .7});
      // 상주: 두건을 쓰고 손을 모은 사람
      person(c, W*.84, H*.86, 190, {hat: 'gulgeon', col: G(215), hatCol: G(215)}); ell(c, W*.84, H*.86 - 190*.5, 14, 10, {col: G(170), blur: 2}); },
    '마을에 들어선 순사': c => { sky(c, 236, 220);
      // 돌담 사이 마을길, 멀어지는 초가들
      thatch(c, W*.2, H*.62, 170, 110, {roof: G(60), wall: G(150)}); thatch(c, W*.74, H*.6, 150, 100, {roof: G(60), wall: G(150)});
      thatch(c, W*.5, H*.54, 100, 64, {roof: G(110), wall: G(185), door: false}); pine(c, W*.6, H*.5, 90, G(135));
      ground(c, H*.66, 120); fillP(c, [[W*.42, H*.66], [W*.58, H*.66], [W*.9, H], [W*.1, H]], {col: G(205), blur: 10, grain: .9});
      // 돌담
      [[0, W*.36], [W*.64, W]].forEach(([x0, x1]) => { fillP(c, [[x0, H*.9], [x0, H*.62], [x1, H*.66], [x1, H*.78]], {col: G(95), blur: 4});
        for (let k = 0; k < 40; k++){ const px = x0 + R() * (x1 - x0), t = (px - x0) / (x1 - x0), py = H*.64 + (x0 ? (1-t) : t) * H*.02 + R() * H*.2; ell(c, px, py, 9 + R()*9, 6 + R()*4, {col: G(40 + R()*60), blur: 2}); } });
      // 순사: 제모·검을 찬 제복, 길 한가운데를 걸어온다 — 긴 그림자
      ell(c, W*.5, H*.98, W*.2, H*.04, {col: G(70), blur: 8, op: .8});
      person(c, W*.5, H*.98, 330, {hat: 'cap', sword: true}); rect(c, W*.5 - 26, H*.98 - 330*.52, 52, 6, {col: G(160), blur: 1.4}); line(c, [[W*.5 - 5, H*.98 - 330*.75], [W*.5 - 5, H*.98 - 330*.52]], {lw: 2, col: G(150), blur: 1.2});
      [0, 1, 2].forEach(k => ell(c, W*.5 - 5, H*.98 - 330*(.7 - k*.07), 2.5, 2.5, {col: G(200), blur: 1}));
      // 담 뒤에서 내다보는 아이들 머리
      [[W*.28, H*.6], [W*.33, H*.615]].forEach(([px, py]) => ell(c, px, py, 11, 12, {col: G(30), blur: 1.8})); },
    '펼쳐진 족보': c => { paper(c); rect(c, 0, 0, W, H, {col: G(205), blur: 6, op: .5, grain: .9});
      // 방바닥 결
      for (let k = 0; k < 7; k++) line(c, [[0, H*.1 + k*H*.14], [W, H*.07 + k*H*.14]], {lw: 1.5, col: G(165), blur: 2, op: .6});
      // 펼친 책: 두 면, 가운데 접힘, 겉장이 보이는 두께
      const pg = [[W*.1, H*.2], [W*.5, H*.15], [W*.9, H*.2], [W*.92, H*.86], [W*.5, H*.9], [W*.08, H*.86]];
      fillP(c, pg.map(([a, b]) => [a + 8, b + 10]), {col: G(70), blur: 6, op: .7}); fillP(c, pg, {col: LT, blur: 2.5, grain: .4});
      line(c, [[W*.5, H*.15], [W*.5, H*.9]], {lw: 5, col: G(110), blur: 3, op: .8});
      // 세로 칸선 + 한자 흔적 (오른쪽 면이 더 빽빽)
      [[W*.14, W*.46], [W*.54, W*.86]].forEach(([x0, x1], side) => { const cols = 7; for (let i = 0; i <= cols; i++) line(c, [[x0 + (x1-x0)*i/cols, H*.22], [x0 + (x1-x0)*i/cols, H*.84]], {lw: 1.6, col: G(150), blur: 1.3, op: .8});
        script(c, x0 + (x1-x0)/cols*.5, H*.26, (x1-x0)/cols, cols, {vertical: true, len: 56, lw: 2.6, col: G(35)});
        line(c, [[x0, H*.22], [x1, H*.22]], {lw: 2.5, col: G(90), blur: 1.3}); });
      // 붉은 인장 자리(회색 사각), 그리고 짚어 보는 손가락
      rect(c, W*.72, H*.3, 26, 26, {col: G(95), blur: 1.6, op: .85}); rect(c, W*.3, H*.66, 22, 22, {col: G(95), blur: 1.6, op: .85});
      ink(c, x => { x.beginPath(); x.moveTo(W*.98, H*.98); x.lineTo(W*.78, H*.62); x.quadraticCurveTo(W*.75, H*.54, W*.7, H*.56); x.lineTo(W*.62, H*.5); x.quadraticCurveTo(W*.6, H*.46, W*.64, H*.46); x.lineTo(W*.74, H*.52); x.lineTo(W*.86, H*.6); x.lineTo(W*1.02, H*.86); x.closePath(); x.fill(); }, {col: G(40), blur: 3});
      ell(c, W*.64, H*.47, 7, 5, {col: G(120), blur: 1.4}); },
    '이장님': c => { sky(c, 120, 60);
      lattice(c, W*.08, H*.06, W*.42, H*.62, {paper: G(228), col: G(50), cols: 3, rows: 7});
      // 창에서 들어오는 빛
      fillP(c, [[W*.1, H*.68], [W*.5, H*.68], [W*.78, H], [-W*.1, H]], {col: G(190), blur: 30, op: .6, grain: .9});
      ground(c, H*.74, 75);
      // 이장님: 백발, 조끼, 양손을 무릎에 — 몸은 왼쪽 빛을 향해
      seated(c, W*.64, H*.96, 330, {col: G(28), white: true, knees: true});
      // 얼굴 측면: 코, 귀, 깊은 주름을 선 몇 개로
      const hx = W*.64, hy = H*.96 - 330 + 330*.11*1.1; line(c, [[hx - 30, hy - 14], [hx - 38, hy - 2], [hx - 30, hy + 4]], {lw: 2.4, col: G(200), blur: 1.1}); line(c, [[hx - 22, hy + 16], [hx - 10, hy + 20]], {lw: 2, col: G(190), blur: 1.1}); line(c, [[hx - 32, hy + 12], [hx - 24, hy + 26]], {lw: 1.6, col: G(170), blur: 1.1});
      rect(c, hx - 8, hy + 36, 16, 10, {col: G(200), blur: 1.4}); line(c, [[hx - 40, hy + 56], [hx + 40, hy + 56], [hx + 44, hy + 120]], {lw: 3, col: G(90), blur: 1.4});
      // 손, 찻잔, 바닥의 수첩(조사자 쪽)
      ell(c, W*.52, H*.9, 22, 12, {col: G(205), blur: 2.4}); ell(c, W*.76, H*.9, 22, 12, {col: G(205), blur: 2.4});
      ell(c, W*.3, H*.92, 16, 7, {col: G(210), blur: 1.6}); rect(c, W*.3 - 12, H*.9, 24, 12, {col: G(215), blur: 1.6});
      fillP(c, [[W*.1, H*.95], [W*.26, H*.93], [W*.28, H*1.02], [W*.12, H*1.04]], {col: G(230), blur: 1.6}); },
    '마을 원경': c => { sky(c, 238, 222);
      mountains(c, [[H*.36, 90, 205, 16], [H*.46, 60, 170, 12], [H*.55, 36, 125, 8]]);
      // 논: 가로 띠와 논두렁 선
      ground(c, H*.64, 190); for (let k = 0; k < 9; k++) line(c, [[0, H*(.66 + k*.04)], [W, H*(.65 + k*.04) + (k%2)*6]], {lw: 1.8, col: G(120), blur: 2, op: .7});
      // 마을: 초가 여러 채, 큰 느티나무, 연기
      [[.18, .66, 70, 44], [.3, .68, 80, 50], [.44, .66, 64, 42], [.58, .69, 88, 54], [.72, .66, 66, 42], [.85, .68, 78, 48]].forEach(([x, y, w, h], k) => thatch(c, W*x, H*y, w, h, {roof: G(35), wall: G(170), door: k % 2 === 0, smoke: k === 3}));
      pine(c, W*.5, H*.66, 110, DK); pine(c, W*.08, H*.7, 80, G(40));
      // 길: 마을에서 앞으로 굽어 내려오는 흙길
      ink(c, x => { x.lineWidth = 34; x.beginPath(); x.moveTo(W*.52, H*.7); x.bezierCurveTo(W*.5, H*.8, W*.3, H*.86, W*.26, H*1.02); x.stroke(); }, {col: G(215), blur: 6, op: .9, grain: .8});
      // 새
      [[.3, .2], [.34, .18], [.37, .21]].forEach(([x, y]) => line(c, [[W*x - 6, H*y], [W*x, H*y - 4], [W*x + 6, H*y]], {lw: 1.6, col: G(70), blur: 1}));
      // 전경: 들풀
      hatch(c, x => x.rect(0, H*.84, W, H*.16), {col: 'rgba(20,18,16,.8)', n: 500, x0: 0, x1: W, y0: H*.88, y1: H, a: -PI/2, da: .4, len: 30, lw: 1.6, al: .6}); },
    // 5부
    '이야기를 듣는 조사자': c => { sky(c, 70, 35);
      lattice(c, W*.3, H*.04, W*.4, H*.5, {paper: G(226), col: G(45), cols: 4, rows: 6});
      fillP(c, [[W*.3, H*.54], [W*.7, H*.54], [W*.86, H*.9], [W*.14, H*.9]], {col: G(175), blur: 30, op: .6, grain: .9});
      ground(c, H*.76, 55);
      // 왼쪽: 어르신(백발), 오른쪽: 수첩 든 조사자 둘과 바닥의 녹음기
      seated(c, W*.2, H*.98, 300, {col: G(22), white: true, knees: true});
      seated(c, W*.6, H*.98, 240, {col: G(30), bow: -1, notebook: true}); seated(c, W*.84, H*.99, 230, {col: G(26), bow: -1, notebook: true});
      rect(c, W*.4, H*.9, 36, 16, {col: G(200), blur: 1.6}); ell(c, W*.4 + 8, H*.9 + 8, 3, 3, {col: G(40), blur: 1});
      // 상 위 잔 두 개
      rect(c, W*.3, H*.86, W*.2, 6, {col: G(50), blur: 1.4}); ell(c, W*.35, H*.855, 10, 5, {col: G(210), blur: 1.3}); ell(c, W*.45, H*.855, 10, 5, {col: G(210), blur: 1.3}); },
    '마을 뒤 산자락, 애장터': c => { sky(c, 234, 218);
      mountains(c, [[H*.3, 80, 200, 16]]);
      // 비탈: 왼쪽 위에서 오른쪽 아래로
      fillP(c, [[0, H*.34], [W, H*.52], [W, H], [0, H]], {col: G(150), blur: 10, grain: .8});
      hatch(c, x => { poly(x, [[0, H*.34], [W, H*.52], [W, H], [0, H]]); }, {col: 'rgba(25,23,21,.75)', n: 4200, x0: 0, x1: W, y0: H*.34, y1: H, a: -1.4, da: .3, len: 22, lw: 1.1, al: .4});
      [[.12, .36, 130], [.3, .42, 100], [.86, .5, 140], [.68, .46, 90]].forEach(([x, y, h]) => pine(c, W*x, H*y + 10, h, G(35)));
      // 작은 돌무더기 무덤들: 어른 무덤보다 훨씬 작고, 돌을 몇 개씩 얹었다
      [[.28, .66, 1], [.46, .6, .8], [.6, .72, 1.1], [.78, .66, .9], [.4, .8, 1.2]].forEach(([x, y, s]) => { ell(c, W*x, H*y + 8*s, 50*s, 10*s, {col: G(40), blur: 6, op: .7}); ell(c, W*x, H*y, 44*s, 18*s, {col: G(120), blur: 4}); for (let k = 0; k < 9; k++) ell(c, W*x + (R()-.5)*60*s, H*y - 6*s - R()*14*s, 6 + R()*6, 4 + R()*4, {col: G(40 + R()*50), blur: 1.6}); });
      // 하나에는 바랜 천 조각이 묶인 작은 나무
      line(c, [[W*.6, H*.72], [W*.6, H*.6]], {lw: 4, col: DK, blur: 1.4}); fillP(c, [[W*.6, H*.62], [W*.66, H*.6], [W*.64, H*.65], [W*.6, H*.65]], {col: G(230), blur: 1.6});
      // 아래로 마을 지붕 끝이 살짝
      thatch(c, W*.06, H*1.02, 90, 60, {roof: G(40), wall: G(160), door: false}); },
    '보따리를 안고 산길을 오르는 뒷모습': c => { sky(c, 228, 206);
      // 안개 속 먼 숲: 옅은 줄기들
      ink(c, x => { for (let k = 0; k < 9; k++){ const px = W*(.02 + k*.12) + (k%2)*18; x.lineWidth = 6 + R()*6; x.beginPath(); x.moveTo(px, H*.66 - k*6); x.lineTo(px + (R()-.5)*16, -10); x.stroke(); } }, {col: G(170), blur: 6, op: .8, grain: .9});
      fillP(c, [[0, 0], [W, 0], [W, H*.7], [0, H*.7]], {col: G(228), blur: 40, op: .45, grain: .9});
      // 비탈길: 아래 넓고 위로 좁아지며 굽는다. 흙길은 옅고 양옆은 짙은 풀숲
      fillP(c, [[0, H*.5], [W, H*.5], [W, H], [0, H]], {col: G(70), blur: 10, grain: .8});
      ink(c, x => { x.beginPath(); x.moveTo(W*.14, H); x.bezierCurveTo(W*.4, H*.78, W*.46, H*.62, W*.5, H*.5); x.lineTo(W*.56, H*.5); x.bezierCurveTo(W*.62, H*.64, W*.74, H*.8, W*.96, H); x.closePath(); x.fill(); }, {col: G(195), blur: 5, grain: .9});
      hatch(c, x => x.rect(0, H*.5, W, H*.5), {col: 'rgba(15,14,12,.9)', n: 1600, x0: 0, x1: W, y0: H*.5, y1: H, a: -PI/2, da: .5, len: 28, lw: 1.6, al: .5});
      line(c, [[W*.2, H*.98], [W*.4, H*.78], [W*.5, H*.56]], {lw: 2, col: G(120), blur: 2.4, op: .6});
      // 가까운 큰 나무 둘: 두꺼운 줄기와 뻗은 가지, 잎 덩어리
      [[.1, 1], [.88, -1]].forEach(([x, s]) => { const bx = W*x; ink(c, xx => { xx.lineWidth = 46; xx.beginPath(); xx.moveTo(bx, H*.8); xx.quadraticCurveTo(bx + s*20, H*.4, bx - s*10, -20); xx.stroke(); }, {col: DK, blur: 2.6});
        hatch(c, xx => { xx.rect(bx - 30, 0, 60, H*.8); }, {col: 'rgba(120,118,114,.6)', n: 300, x0: bx - 24, x1: bx + 24, y0: 0, y1: H*.8, a: -PI/2, da: .1, len: 40, lw: 1.2, al: .4});
        [[.22, 180, -.25], [.36, 150, -.1], [.5, 120, -.3]].forEach(([t, L, an]) => { line(c, [[bx, H*t], [bx + s*L*Math.cos(an), H*t + L*Math.sin(an)]], {lw: 12, col: DK, blur: 2}); line(c, [[bx + s*L*.6*Math.cos(an), H*t + L*.6*Math.sin(an)], [bx + s*L*.9, H*t + L*.6*Math.sin(an) - 40]], {lw: 6, col: DK, blur: 1.8}); ell(c, bx + s*L*.9, H*t + L*Math.sin(an) - 20, L*.4, L*.16, {col: G(40), blur: 6, grain: .95, speck: .5}); }); });
      // 뒷모습: 흰 옷, 삼베 보따리를 가슴에 안고 비탈을 오른다 — 전경 가운데, 크게
      ell(c, W*.5, H*.86, 40, 10, {col: G(50), blur: 6, op: .8});
      person(c, W*.5, H*.86, 250, {col: G(226), bundle: true, bundleCol: G(150)});
      line(c, [[W*.5 - 22, H*.86 - 250*.6], [W*.5 + 20, H*.86 - 250*.56]], {lw: 3, col: G(90), blur: 1.3}); line(c, [[W*.5 - 10, H*.86 - 250*.66], [W*.5 + 12, H*.86 - 250*.64]], {lw: 2, col: G(110), blur: 1.2});
      hatch(c, x => x.rect(W*.4, H*.3, W*.2, H*.56), {col: 'rgba(90,88,84,.6)', n: 160, x0: W*.44, x1: W*.56, y0: H*.5, y1: H*.86, a: PI/2, da: .15, len: 40, lw: 1.1, al: .35});
      ell(c, W*.5, H*.86 - 250 + 250*.075*1.1, 250*.075*1.1, 250*.075*.7, {col: G(60), blur: 1.8}); },
    '수레 위 상여 뚜껑': c => { sky(c, 236, 215); ground(c, H*.72, 165);
      // 손수레: 바퀴 둘, 긴 손잡이, 판 위에 삼베로 싼 작은 꾸러미
      ell(c, W*.5, H*.9, W*.3, H*.03, {col: G(90), blur: 10, op: .7});
      [W*.34, W*.66].forEach(x0 => { ell(c, x0, H*.82, 44, 44, {col: DK, blur: 2}); ell(c, x0, H*.82, 32, 32, {col: G(165), blur: 2}); for (let k = 0; k < 6; k++) line(c, [[x0, H*.82], [x0 + Math.cos(k*PI/3)*32, H*.82 + Math.sin(k*PI/3)*32]], {lw: 3, col: DK, blur: 1.2}); ell(c, x0, H*.82, 6, 6, {col: DK, blur: 1}); });
      rect(c, W*.26, H*.68, W*.48, 14, {col: G(45), blur: 2}); line(c, [[W*.26, H*.72], [W*.08, H*.6]], {lw: 7, col: G(45), blur: 1.6}); line(c, [[W*.74, H*.72], [W*.92, H*.6]], {lw: 7, col: G(45), blur: 1.6});
      line(c, [[W*.3, H*.68], [W*.3, H*.6]], {lw: 5, col: G(45), blur: 1.4}); line(c, [[W*.7, H*.68], [W*.7, H*.6]], {lw: 5, col: G(45), blur: 1.4});
      ell(c, W*.5, H*.64, W*.14, H*.055, {col: G(200), blur: 3, grain: .8}); [[-.06], [.06]].forEach(([d]) => line(c, [[W*(.5+d), H*.59], [W*(.5+d), H*.69]], {lw: 2.5, col: G(110), blur: 1.3}));
      // 종이 상여 뚜껑: 지붕꼴, 가장자리 술, 꼭대기 꾸밈 — 내려와 덮이기 직전
      const top = H*.22; fillP(c, [[W*.2, H*.46], [W*.3, H*.3], [W*.7, H*.3], [W*.8, H*.46]], {col: G(60), blur: 2.5});
      hatch(c, x => poly(x, [[W*.2, H*.46], [W*.3, H*.3], [W*.7, H*.3], [W*.8, H*.46]]), {col: 'rgba(240,238,233,.5)', n: 400, x0: W*.2, x1: W*.8, y0: H*.3, y1: H*.46, a: 0, da: .1, len: 40, lw: 1.2, al: .5});
      line(c, [[W*.3, H*.3], [W*.7, H*.3]], {lw: 6, col: DK, blur: 1.5}); line(c, [[W*.2, H*.46], [W*.8, H*.46]], {lw: 4, col: DK, blur: 1.4});
      for (let k = 0; k <= 16; k++){ const px = W*.2 + k*(W*.6/16); line(c, [[px, H*.46], [px + (k%2 ? 3 : -3), H*.52]], {lw: 2.4, col: G(40), blur: 1.2}); }
      for (let k = 0; k < 5; k++){ const px = W*(.3 + k*.1); ell(c, px, H*.3 - 10, 10, 8, {col: LT, blur: 1.4}); ell(c, px, H*.3 - 10, 4, 4, {col: G(60), blur: 1}); }
      line(c, [[W*.5, H*.3], [W*.5, top]], {lw: 4, col: DK, blur: 1.3}); ell(c, W*.5, top - 8, 14, 10, {col: LT, blur: 1.4}); ell(c, W*.5, top - 8, 5, 5, {col: G(60), blur: 1});
      // 뚜껑을 받쳐 든 손 둘 (양 옆에서)
      ink(c, x => { x.beginPath(); x.moveTo(0, H*.42); x.lineTo(W*.14, H*.4); x.quadraticCurveTo(W*.24, H*.4, W*.24, H*.46); x.lineTo(W*.12, H*.5); x.lineTo(0, H*.52); x.closePath(); x.fill(); x.beginPath(); x.moveTo(W, H*.42); x.lineTo(W*.86, H*.4); x.quadraticCurveTo(W*.76, H*.4, W*.76, H*.46); x.lineTo(W*.88, H*.5); x.lineTo(W, H*.52); x.closePath(); x.fill(); }, {col: G(30), blur: 3}); },
    '말을 잃은 조사자들': c => { sky(c, 92, 50); ground(c, H*.7, 60);
      fillP(c, [[W*.2, 0], [W*.8, 0], [W*.9, H*.7], [W*.1, H*.7]], {col: G(135), blur: 40, op: .5, grain: .9});
      // 상: 식은 잔, 멈춘 펜과 수첩
      rect(c, W*.22, H*.8, W*.56, 8, {col: G(35), blur: 1.6}); [W*.3, W*.5, W*.7].forEach(x0 => { ell(c, x0, H*.795, 11, 5, {col: G(205), blur: 1.3}); rect(c, x0 - 11, H*.775, 22, 12, {col: G(210), blur: 1.3}); });
      fillP(c, [[W*.38, H*.84], [W*.6, H*.83], [W*.62, H*.93], [W*.4, H*.94]], {col: G(228), blur: 1.6}); script(c, W*.42, H*.86, 9, 3, {len: 60, lw: 2, col: G(70)}); line(c, [[W*.5, H*.9], [W*.62, H*.86]], {lw: 3, col: DK, blur: 1.2});
      // 셋 다 고개를 떨구고 앉아 있다
      seated(c, W*.24, H*.78, 230, {col: G(22), bow: 1}); seated(c, W*.5, H*.76, 250, {col: G(28), bow: 1}); seated(c, W*.78, H*.78, 230, {col: G(24), bow: -1});
      // 어깨선·목선을 밝은 선으로
      [[W*.24, 230], [W*.5, 250], [W*.78, 230]].forEach(([x0, h]) => line(c, [[x0 - h*.2, H*.78 - h*.76], [x0, H*.78 - h*.8], [x0 + h*.2, H*.78 - h*.76]], {lw: 2, col: G(130), blur: 1.3, op: .7})); },
    '한 시대의 사람들': c => { sky(c, 238, 222); mountains(c, [[H*.5, 50, 200, 14]]);
      ground(c, H*.74, 120); ground(c, H*.82, 55, {bow: 10});
      // 상여 행렬: 긴 채를 멘 상두꾼 여덟, 위에 상여(지붕·꾸밈·휘장), 앞에 깃발·요령, 뒤에 상복 입은 유족
      const baseY = H*.8, n = 8; for (let k = 0; k < n; k++) person(c, W*(.22 + k*.075), baseY, 150, {hat: 'none', col: G(22 + (k%2)*18)});
      rect(c, W*.17, baseY - 150*.72, W*.63, 7, {col: DK, blur: 1.6});
      const sx = W*.26, sw2 = W*.46, sy = baseY - 150*.74; rect(c, sx, sy - 70, sw2, 70, {col: G(50), blur: 2.4});
      for (let k = 0; k <= 10; k++) line(c, [[sx + k*sw2/10, sy], [sx + k*sw2/10, sy - 70]], {lw: 1.8, col: G(140), blur: 1.1, op: .7});
      fillP(c, [[sx - 20, sy - 70], [sx + 30, sy - 120], [sx + sw2 - 30, sy - 120], [sx + sw2 + 20, sy - 70]], {col: G(28), blur: 2.4});
      for (let k = 0; k < 6; k++) ell(c, sx + 40 + k*(sw2 - 80)/5, sy - 124, 9, 7, {col: LT, blur: 1.3});
      line(c, [[sx + sw2/2, sy - 120], [sx + sw2/2, sy - 160]], {lw: 4, col: DK, blur: 1.3}); ell(c, sx + sw2/2, sy - 166, 12, 9, {col: LT, blur: 1.3});
      for (let k = 0; k <= 14; k++) line(c, [[sx + k*sw2/14, sy], [sx + k*sw2/14 + 2, sy + 16]], {lw: 2, col: G(40), blur: 1.1});
      // 앞의 명정(깃발), 뒤의 상주들(흰 상복, 굴건)
      line(c, [[W*.1, baseY], [W*.1, baseY - 260]], {lw: 4, col: DK, blur: 1.4}); fillP(c, [[W*.1, baseY - 258], [W*.17, baseY - 250], [W*.16, baseY - 140], [W*.1, baseY - 130]], {col: G(90), blur: 2}); script(c, W*.13, baseY - 240, 10, 1, {vertical: true, len: 18, lw: 2, col: LT});
      [.86, .93].forEach((x, k) => person(c, W*x, baseY + 6, 140, {hat: 'gulgeon', col: G(220), hatCol: G(220), stick: k === 0})); },
    '곁을 지키는 손': c => { sky(c, 118, 60);
      const cloth = [[0, H*.42], [W, H*.36], [W, H], [0, H]]; fillP(c, cloth, {col: G(180), blur: 6, grain: .8});
      hatch(c, x => poly(x, cloth), {col: 'rgba(30,28,26,.5)', n: 1800, x0: 0, x1: W, y0: H*.36, y1: H, a: 0, da: .04, len: 70, lw: 1, al: .35}); hatch(c, x => poly(x, cloth), {col: 'rgba(30,28,26,.5)', n: 1800, x0: 0, x1: W, y0: H*.36, y1: H, a: PI/2, da: .04, len: 70, lw: 1, al: .3});
      // 아래: 늙은 손 — 왼쪽 아래에서 팔목, 손등, 손가락 넷이 오른쪽으로
      ink(c, x => { x.beginPath(); x.moveTo(-10, H*.98); x.lineTo(W*.08, H*.66); x.quadraticCurveTo(W*.2, H*.5, W*.4, H*.5); x.lineTo(W*.6, H*.5); x.lineTo(W*.62, H*.86); x.lineTo(W*.2, H*.96); x.closePath(); x.fill(); }, {col: G(210), blur: 3.5, grain: .7});
      [[.5, .5, .92, .46, 32], [.56, .6, .94, .58, 30], [.58, .7, .92, .7, 28], [.56, .8, .86, .82, 24]].forEach(([x0, y0, x1, y1, w], k) => { ink(c, x => { x.lineWidth = w; x.beginPath(); x.moveTo(W*x0, H*y0); x.quadraticCurveTo(W*(x0 + x1)/2, H*(y0 + y1)/2 - 8, W*x1, H*y1); x.stroke(); }, {col: G(214 - k*4), blur: 3, grain: .7});
        [.45, .72].forEach(t => { const px = W*(x0 + (x1 - x0)*t), py = H*(y0 + (y1 - y0)*t) - 6; line(c, [[px - 4, py - w*.42], [px + 2, py], [px - 4, py + w*.42]], {lw: 1.8, col: G(110), blur: 1.3, op: .8}); line(c, [[px + 5, py - w*.3], [px + 8, py + w*.3]], {lw: 1.2, col: G(130), blur: 1.2, op: .6}); });
        ell(c, W*x1 + 2, H*y1, w*.5, w*.42, {col: G(205 - k*4), blur: 2.2}); line(c, [[W*x1 - 6, H*y1 - w*.3], [W*x1 + 6, H*y1 - w*.1]], {lw: 1.6, col: G(120), blur: 1.2, op: .7}); });
      // 손등 힘줄과 관절, 그늘
      for (let k = 0; k < 4; k++) line(c, [[W*.22, H*(.62 + k*.06)], [W*.5, H*(.5 + k*.08)]], {lw: 2, col: G(140), blur: 2.2, op: .6});
      hatch(c, x => x.rect(0, H*.6, W*.4, H*.4), {col: 'rgba(60,58,55,.6)', n: 500, x0: 0, x1: W*.4, y0: H*.62, y1: H, a: -.5, da: .2, len: 30, lw: 1, al: .35});
      ell(c, W*.14, H*.7, 40, 24, {col: G(120), blur: 10, op: .5});
      // 위: 젊은 손이 오른쪽 위에서 들어와 손등을 감싼다 — 세 손가락이 늙은 손 손가락 위로 겹침
      ink(c, x => { x.beginPath(); x.moveTo(W*1.04, H*.08); x.lineTo(W*.8, H*.22); x.quadraticCurveTo(W*.52, H*.3, W*.42, H*.46); x.lineTo(W*.5, H*.52); x.lineTo(W*.8, H*.42); x.lineTo(W*1.04, H*.34); x.closePath(); x.fill(); }, {col: G(238), blur: 3, grain: .5});
      [[.46, .5, .66, .56, 26], [.5, .58, .68, .64, 24], [.52, .66, .64, .7, 22]].forEach(([x0, y0, x1, y1, w]) => { ink(c, x => { x.lineWidth = w; x.beginPath(); x.moveTo(W*x0, H*y0); x.quadraticCurveTo(W*(x0 + x1)/2 + 6, H*(y0 + y1)/2 + 10, W*x1, H*y1); x.stroke(); }, {col: G(238), blur: 2.6, grain: .5}); ell(c, W*x1, H*y1 + 1, w*.5, w*.42, {col: G(236), blur: 2}); });
      line(c, [[W*.44, H*.47], [W*.5, H*.52]], {lw: 2.5, col: G(150), blur: 1.6, op: .6}); ell(c, W*.56, H*.5, 60, 14, {col: G(120), blur: 10, op: .35}); },
    '조사 노트': c => { sky(c, 80, 45);
      // 마루 널
      for (let k = 0; k < 6; k++) fillP(c, [[0, H*(.1 + k*.16)], [W, H*(.07 + k*.16)], [W, H*(.22 + k*.16)], [0, H*(.25 + k*.16)]], {col: G(70 + (k%2)*12), blur: 3, grain: .8});
      for (let k = 0; k < 7; k++) line(c, [[0, H*(.1 + k*.16)], [W, H*(.07 + k*.16)]], {lw: 2, col: G(30), blur: 1.5});
      // 펼친 수첩: 왼쪽은 빼곡한 글, 오른쪽은 쓰다 만 줄 + 펜
      const nb = [[W*.16, H*.22], [W*.5, H*.18], [W*.84, H*.22], [W*.86, H*.8], [W*.5, H*.84], [W*.14, H*.8]];
      fillP(c, nb.map(([a, b]) => [a + 10, b + 12]), {col: G(20), blur: 8, op: .8}); fillP(c, nb, {col: G(238), blur: 2.4, grain: .4});
      line(c, [[W*.5, H*.18], [W*.5, H*.84]], {lw: 4, col: G(150), blur: 2.4, op: .8}); for (let k = 0; k < 3; k++) ell(c, W*.5, H*(.3 + k*.2), 6, 6, {col: G(90), blur: 1.3});
      script(c, W*.2, H*.3, 24, 9, {len: 190, lw: 2.4, col: G(45)}); script(c, W*.56, H*.3, 24, 4, {len: 170, lw: 2.4, col: G(45)});
      line(c, [[W*.56, H*.3 + 24*4], [W*.66, H*.3 + 24*4 + 2]], {lw: 2.4, col: G(45), blur: 1.3});
      // 밑줄 친 한 줄, 여백의 작은 메모
      line(c, [[W*.2, H*.3 + 24*3 + 8], [W*.44, H*.3 + 24*3 + 9]], {lw: 2.6, col: G(30), blur: 1.1}); script(c, W*.58, H*.62, 12, 3, {len: 70, lw: 1.6, col: G(90)});
      // 펜 (사선), 녹음기, 끼워 둔 사진 한 장
      ink(c, x => { x.save(); x.translate(W*.7, H*.6); x.rotate(-.6); x.fillRect(-7, -120, 14, 200); x.beginPath(); x.moveTo(-7, 80); x.lineTo(0, 104); x.lineTo(7, 80); x.fill(); x.restore(); }, {col: DK, blur: 1.8}); ink(c, x => { x.save(); x.translate(W*.7, H*.6); x.rotate(-.6); x.fillRect(-7, -60, 14, 6); x.fillRect(-7, 40, 14, 6); x.restore(); }, {col: G(180), blur: 1.2});
      rect(c, W*.06, H*.84, 70, 34, {col: G(190), blur: 1.8}); ell(c, W*.06 + 14, H*.84 + 17, 5, 5, {col: G(40), blur: 1}); rect(c, W*.06 + 28, H*.84 + 12, 34, 10, {col: G(60), blur: 1});
      ink(c, x => { x.save(); x.translate(W*.2, H*.72); x.rotate(.14); x.fillRect(-36, -28, 72, 56); x.restore(); }, {col: LT, blur: 1.6}); ink(c, x => { x.save(); x.translate(W*.2, H*.72); x.rotate(.14); x.fillRect(-30, -22, 60, 40); x.restore(); }, {col: G(110), blur: 1.6, grain: .9}); },
    '빈 마루': c => { sky(c, 24, 14);
      // 대청마루: 앞으로 넓어지는 널, 뒤로 열린 문 두 짝 너머 밝은 마당
      const DOOR = [[W*.28, H*.1], [W*.72, H*.1], [W*.72, H*.6], [W*.28, H*.6]];
      fillP(c, DOOR, {col: G(238), blur: 3, grain: .9}); fillP(c, [[W*.28, H*.46], [W*.72, H*.46], [W*.72, H*.6], [W*.28, H*.6]], {col: G(200), blur: 6, grain: .9});
      // 마당의 나무 한 그루, 멀리 담
      pine(c, W*.6, H*.5, 140, G(170)); line(c, [[W*.28, H*.48], [W*.72, H*.48]], {lw: 3, col: G(150), blur: 2, op: .7});
      // 열린 문짝 (창호, 안쪽으로 비스듬히)
      lattice(c, W*.1, H*.08, W*.17, H*.56, {paper: G(205), col: G(40), cols: 2, rows: 7}); lattice(c, W*.73, H*.08, W*.17, H*.56, {paper: G(205), col: G(40), cols: 2, rows: 7});
      line(c, [[W*.26, H*.06], [W*.74, H*.06], [W*.74, H*.62], [W*.26, H*.62]], {lw: 8, col: G(35), close: true, blur: 1.8});
      // 마루 널: 원근으로 벌어지는 선, 문에서 쏟아지는 빛
      fillP(c, [[0, H*.62], [W, H*.62], [W, H], [0, H]], {col: G(60), blur: 4, grain: .8});
      fillP(c, [[W*.3, H*.62], [W*.7, H*.62], [W*.92, H], [W*.08, H]], {col: G(150), blur: 24, op: .7, grain: .9});
      for (let k = -7; k <= 7; k++) line(c, [[W*.5 + k*W*.03, H*.62], [W*.5 + k*W*.085, H]], {lw: 2.2, col: G(25), blur: 1.3, op: .85});
      [.72, .84, .96].forEach(y => line(c, [[0, H*y], [W, H*y - 3]], {lw: 1.6, col: G(25), blur: 1.2, op: .6}));
      // 댓돌 위 고무신 한 켤레
      rect(c, W*.3, H*.9, W*.4, 20, {col: G(95), blur: 2.4}); [[W*.45], [W*.53]].forEach(([x0]) => { ell(c, x0, H*.9 - 6, 22, 8, {col: LT, blur: 1.6}); ell(c, x0, H*.9 - 7, 14, 4, {col: G(90), blur: 1.2}); }); }
  };
  window.MMArt = { W, H, keys: Object.keys(S), draw(cv, key){ cv.width = W; cv.height = H; const c = cv.getContext('2d'); c.fillStyle = '#e9e7e3'; c.fillRect(0, 0, W, H); (S[key] || S['마을 원경'])(c); grainAll(c); vignette(c); } };
})();
