// ===== Data pasien & patokan paru sehat =====
// Prediksi sehat: laki-laki 20 th, 175 cm (contoh; nanti dari persamaan GLI penuh).
// LLN (% prediksi) dari Tabel 3 ERS/ATS 2022 (pria 25 th): FEV1 80,5 | FVC 80,9 | FEV1/FVC 86,9
const PAT={nama:'Faisal Akbar',usia:'20 tahun',jk:'Laki-laki',tb:'175 cm',id:'P-0003',dr:'dr. Adzka Channel, S.Ked'};
const REF={fev1:3.22,fvc:3.85,lln:{fev1:.805,fvc:.809,rat:.869}};REF.rat=REF.fev1/REF.fvc;
let history = [
  {d:'15 Jan 2025, 10:24', fev1:2.61, fvc:3.21, pef:6.72, fef:2.90, svc:3.28},
  {d:'10 Jan 2025, 09:11', fev1:2.42, fvc:3.19, pef:6.40, fef:2.70, svc:3.25},
  {d:'03 Jan 2025, 14:30', fev1:2.37, fvc:3.16, pef:6.31, fef:2.62, svc:3.20}
];
let sel=0; // indeks hasil yang sedang dilihat (dipakai juga oleh PDF)
const f=(n,d=2)=>n.toFixed(d).replace('.',',');
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);

// ===== Analisis (ERS/ATS 2022): z-score, derajat, pola, status =====
// z-score diestimasi linear dari LLN GLI: z = (obs/pred - 1) / ((1-LLN%)/1,645)
const SEV=['Normal','Ringan','Sedang','Berat'],PL=['Normal','Sedikit rendah','Rendah','Sangat rendah'],STK={ok:'Baik',warn:'Kurang baik',bad:'Parah'},NM={fev1:'FEV1',fvc:'FVC',rat:'FEV1/FVC'};
const cls=l=>'st-'+['ok','warn','warn','bad'][l], cc=l=>['ok','yl','yl','bad'][l], ccs={ok:'ok',warn:'yl',bad:'bad'};
const zs=(o,p,l)=>(o/p-1)/((1-l)/1.645), lvl=z=>z>=-1.645?0:z>=-2.5?1:z>=-4?2:3;
function analyze(r){
  const ratio=r.fev1/r.fvc, z={fev1:zs(r.fev1,REF.fev1,REF.lln.fev1),fvc:zs(r.fvc,REF.fvc,REF.lln.fvc),rat:zs(ratio,REF.rat,REF.lln.rat)};
  const L={fev1:lvl(z.fev1),fvc:lvl(z.fvc),rat:lvl(z.rat)}, obs=L.rat>0, lowF=L.fvc>0, w=Math.max(L.fev1,L.fvc,L.rat), s=w===0?'ok':w<3?'warn':'bad';
  const abn=Object.keys(L).filter(k=>L[k]>0).map(k=>`${NM[k]} (${SEV[L[k]].toLowerCase()})`).join(', ');
  const pola=obs?(lowF?'Pola obstruktif dengan FVC rendah; kemungkinan campuran, perlu pengukuran volume paru (TLC).':'Pola obstruktif: FEV1/FVC di bawah batas bawah normal.'):lowF?'FVC rendah dengan rasio normal: kemungkinan restriksi atau pola non-spesifik, perlu pengukuran TLC.':'Pola spirometri normal. Tidak ada tanda hambatan aliran udara.';
  const near=(s==='ok'&&Math.min(z.fev1,z.fvc,z.rat)<-1.2)?' Ada angka yang mendekati batas bawah normal, pantau secara berkala.':'';
  const T={ok:['Kondisi paru baik','Semua angka (FEV1, FVC, dan rasionya) berada dalam batas normal.'+near+' Pertahankan gaya hidup sehat.'],
    warn:['Kondisi paru kurang baik',`Ada angka di bawah batas normal: ${abn}. Konsultasikan dengan tenaga kesehatan dan ulangi pemeriksaan.`],
    bad:['Kondisi paru parah',`Ada angka yang sangat rendah: ${abn}. Segera hubungi tenaga kesehatan atau fasilitas kesehatan terdekat.`]}[s];
  return {ratio,z,L,w,s,pola,near,title:T[0],msg:T[1]};
}

// ===== Tema: terang / gelap / otomatis =====
const root=document.documentElement, mq=matchMedia('(prefers-color-scheme:dark)');
let pref='auto';try{const v=localStorage.getItem('tema');if(['terang','gelap','auto'].includes(v))pref=v}catch(e){}
const isDark=()=>pref==='gelap'||(pref==='auto'&&mq.matches);
function applyTheme(){root.dataset.theme=isDark()?'dark':'light';$('#theme').textContent=isDark()?'☀':'☾';$$('#themeSeg button').forEach(b=>b.classList.toggle('on',b.dataset.p===pref))}
function setPref(p){pref=p;try{localStorage.setItem('tema',p)}catch(e){}applyTheme()}
$('#theme').onclick=()=>setPref(isDark()?'terang':'gelap');
$('#themeSeg').onclick=e=>{const b=e.target.closest('button');if(b)setPref(b.dataset.p)};
mq.addEventListener('change',applyTheme);applyTheme();

// ===== Navigasi =====
const TT={beranda:'PulmoSense-AI',panduan:'Panduan Pemeriksaan',periksa:'Pemeriksaan',kualitas:'Evaluasi Kualitas',hasil:'Hasil Pemeriksaan',jelas:'Penjelasan Hasil',riwayat:'Riwayat Pemeriksaan',bantuan:'Bantuan',pengaturan:'Pengaturan'};
const NAVMAP={panduan:'beranda',periksa:'beranda',kualitas:'beranda',hasil:'beranda',jelas:'bantuan'};
let stack=['beranda'];
function show(v){$$('.view').forEach(e=>e.classList.toggle('on',e.id==='v-'+v));$('#ttl').textContent=TT[v];$('#back').hidden=v==='beranda';
  const n=NAVMAP[v]||v;$$('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.go===n));scrollTo(0,0)}
function go(v){if(v!==stack[stack.length-1])stack.push(v);show(v)}
$('#back').onclick=()=>{if(stack.length>1)stack.pop();show(stack[stack.length-1])};
document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(!b)return;
  if(b.closest('.nav'))stack=['beranda'];
  if(b.dataset.sel!==undefined){sel=+b.dataset.sel;render()}
  go(b.dataset.go)});
// tab (seg) umum
$$('.seg[data-grp]').forEach(s=>s.onclick=e=>{const b=e.target.closest('button');if(!b)return;
  s.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
  $$(`.pane[data-grp="${s.dataset.grp}"]`).forEach(p=>p.hidden=p.dataset.t!==b.dataset.t)});

// ===== Panduan 3 langkah =====
const SL=[{i:'🪑',t:'Posisi tubuh',l:['Duduk tegak dan rileks','Bahu rileks','Kaki menapak di lantai']},
  {i:'👃',t:'Gunakan alat',l:['Pasang penjepit hidung','Masukkan mouthpiece ke mulut','Tutup bibir rapat di sekeliling mouthpiece']},
  {i:'🌬️',t:'Teknik meniup',l:['Tarik napas sedalam mungkin','Hembuskan sekuat dan secepat mungkin sampai habis','Jangan batuk atau berhenti di tengah']}];
let si=0;
function slide(){const s=SL[si];
  $('#slide').innerHTML=`<div class="cnt">${si+1}/${SL.length}</div><div class="emo">${s.i}</div><h2>${s.t}</h2><ul>${s.l.map(x=>`<li>${x}</li>`).join('')}</ul>`;
  $('#dots').innerHTML=SL.map((_,i)=>`<i class="${i===si?'on':''}"></i>`).join('');
  $('#next').textContent=si<SL.length-1?'Lanjut':'Mulai pemeriksaan'}
$('#next').onclick=()=>{if(si<SL.length-1){si++;slide()}else{si=0;slide();go('periksa')}};
slide();

// ===== Istilah / penjelasan FEV1, FVC, FEV1/FVC =====
const GL={
  fev1:{t:'FEV1 itu apa?',d:'Jumlah udara yang bisa kamu hembuskan pada 1 detik pertama saat meniup sekuat dan secepat mungkin. FEV1 menunjukkan seberapa lancar udara keluar dari saluran napas.',low:'Jika rendah: saluran napas bisa menyempit atau paru kurang mampu mengeluarkan udara dengan cepat.'},
  fvc:{t:'FVC itu apa?',d:'Total udara yang bisa kamu hembuskan sampai habis setelah menarik napas sedalam mungkin. FVC menggambarkan seberapa banyak udara yang bisa dipakai paru kamu.',low:'Jika rendah: paru bisa kurang mengembang, atau tiupan belum sampai habis.'},
  rat:{t:'FEV1/FVC itu apa?',d:'Perbandingan FEV1 dengan FVC, yaitu berapa persen udara yang keluar dalam 1 detik pertama. Angka ini membantu melihat apakah ada hambatan aliran udara.',low:'Jika rendah: udara sulit keluar karena saluran napas menyempit (pola obstruktif).'}};
$('#gloss').innerHTML=['fev1','fvc','rat'].map(k=>`<div class="card"><h3>${GL[k].t}</h3><p>${GL[k].d}</p><p class="mut">${GL[k].low}</p></div>`).join('')+
  `<div class="card"><h3>Batas bawah normal (LLN)</h3><p>Angka terendah yang masih ditemukan pada 95% orang sehat dengan usia, tinggi badan, dan jenis kelamin yang sama. Nilai di bawahnya dianggap rendah.</p><p class="mut">Dasar penilaian: ERS/ATS technical standard 2022 (Stanojevic dkk.).</p></div>`;

// ===== Render =====
const fmt=(k,x)=>k==='rat'?Math.round(x*100)+'%':f(x)+' L', gv=(k,r,a)=>k==='fev1'?r.fev1:k==='fvc'?r.fvc:a.ratio;
const TODO={ok:['Pertahankan aktivitas fisik dan hindari asap rokok.','Periksa rutin sesuai anjuran dokter.'],
  warn:['Konsultasikan hasil ini dengan tenaga kesehatan.','Ulangi pemeriksaan dengan teknik tiup yang benar.','Catat gejala: sesak, batuk, atau dahak.'],
  bad:['Segera hubungi dokter atau fasilitas kesehatan.','Jika sesak berat atau bibir membiru, segera ke IGD.','Hindari aktivitas berat sampai diperiksa.']};
function meter(k,r,a){
  const v=gv(k,r,a),p=REF[k],l=p*REF.lln[k],mx=p*1.2,pos=Math.min(100,v/mx*100),lp=l/mx*100,lv=a.L[k];
  return `<div class="card res ${cls(lv)}"><div class="row"><b>${NM[k]}</b><span class="chip ${cc(lv)}">${PL[lv]}</span></div>
  <div class="big">${fmt(k,v)}</div>
  <div class="meter" style="background:linear-gradient(90deg,var(--yelbg) ${lp}%,var(--okbg) ${lp}%)"><u style="left:${lp}%"></u><i style="left:${pos}%"></i></div>
  <small>Garis tegak = batas bawah normal (${fmt(k,l)}). Prediksi sehat: ${fmt(k,p)}. Kamu: ${Math.round(v/p*100)}% dari prediksi.</small></div>`}
function banner(e,a,extra=''){e.className='card status st-'+a.s;e.innerHTML=`<b>${a.title}</b><span>${a.msg}</span>${extra}`}
let notified=null;
const toast=a=>{const t=$('#toast');t.className='toast st-'+a.s;t.innerHTML=`<b>${a.title}</b><br>${a.msg}`;t.hidden=false;clearTimeout(toast.id);toast.id=setTimeout(()=>t.hidden=true,6000)};

function render(){
  const r=history[sel], a=analyze(r), a0=analyze(history[0]);
  banner($('#status'),a0,`<small>Pemeriksaan terakhir: ${history[0].d}</small><button class="link" data-go="hasil" data-sel="0" style="margin:0;text-align:left">Lihat hasil lengkap</button>`);
  banner($('#h-status'),a); $('#h-date').textContent='Pemeriksaan: '+r.d;
  $('#meters').innerHTML=['fev1','fvc','rat'].map(k=>meter(k,r,a)).join('');
  $('#todo').innerHTML=TODO[a.s].map(t=>`<li>${t}</li>`).join('');
  const prev=history[sel+1], drop=prev?(r.fev1-prev.fev1)/prev.fev1:0, al=$('#alert');
  al.className='card alert '+(drop<=-.1?'st-warn':'st-ok');
  al.querySelector('span').textContent=!prev?'Ini pemeriksaan pertama.':drop<=-.1?`FEV1 turun ${Math.abs(Math.round(drop*100))}%. Hubungi tenaga kesehatan.`:'Tidak ada penurunan FEV1 yang bermakna.';
  $('#tbl').innerHTML=`<tr><th>Parameter</th><th>Hasil</th><th>Status</th></tr>`+
   ['fev1','fvc','rat'].map(k=>`<tr><td>${NM[k]}</td><td>${k==='rat'?f(a.ratio)+' ('+fmt(k,a.ratio)+')':fmt(k,gv(k,r,a))}</td><td><span class="chip ${cc(a.L[k])}">${PL[a.L[k]]}</span></td></tr>`).join('')+
   `<tr><td>PEF</td><td>${f(r.pef)} L/s</td><td>–</td></tr><tr><td>FEF25–75%</td><td>${f(r.fef)} L/s</td><td>–</td></tr><tr><td>SVC</td><td>${f(r.svc)} L</td><td>–</td></tr>`;
  const upper=(r.fev1*1000)/(r.pef*60)>8, row=(n,bad,txt)=>`<li>${n}<span class="chip ${bad?'yl':'ok'}">${bad?txt:'Tidak terindikasi'}</span></li>`;
  $('#dis').innerHTML=row('PPOK / Asma (pola obstruktif)',a.L.rat>0,'Perlu evaluasi')+row('Restriktif',a.L.rat===0&&a.L.fvc>0,'Mungkin, cek TLC')+row('Obstruksi saluran napas atas',upper,'Perlu evaluasi');
  curves(r); trend(); jelas();
  $('#list').innerHTML=history.map((h,i)=>{const x=analyze(h);return `<button class="item" data-go="hasil" data-sel="${i}"><div><b>${h.d}</b><small>FEV1 ${f(h.fev1)} L · FVC ${f(h.fvc)} L</small></div><span class="chip ${ccs[x.s]}">${STK[x.s]}</span></button>`}).join('');
  const h0=history[0];
  $('#last').innerHTML=`<div class="row"><div><b>Hasil Terakhir</b><small>${h0.d}</small></div><span class="chip ${ccs[a0.s]}">${STK[a0.s]}</span></div>
   <div class="grid3" style="margin-top:10px"><div><small>FEV1</small><b>${f(h0.fev1)}</b> L</div><div><small>FVC</small><b>${f(h0.fvc)}</b> L</div><div><small>Rasio</small><b>${Math.round(a0.ratio*100)}</b>%</div></div>`;
}

// ===== Penjelasan hasil (tab FEV1 / FVC / FEV1/FVC) =====
let jk='fev1';
function jelas(){
  const r=history[sel],a=analyze(r),k=jk,g=GL[k],v=gv(k,r,a),p=REF[k],l=p*REF.lln[k],lv=a.L[k];
  $$('#jTabs button').forEach(b=>b.classList.toggle('on',b.dataset.k===k));
  $('#jBody').innerHTML=`<div class="card"><h3>${g.t}</h3><p>${g.d}</p><p class="mut">${g.low}</p></div>
  <div class="card res ${cls(lv)}"><small>Hasil kamu</small><div class="big">${fmt(k,v)}</div><p class="mut">Nilai prediksi sehat: ${fmt(k,p)}<br>Batas bawah normal (LLN): ${fmt(k,l)}<br>(= ${Math.round(v/p*100)}% dari prediksi)</p></div>
  <div class="card status ${cls(lv)}"><b>${lv?'Di bawah batas normal ('+PL[lv].toLowerCase()+')':'Dalam batas normal'}</b><span>${lv?'Nilai kamu lebih rendah dari batas bawah normal. Konsultasikan dengan tenaga kesehatan.':'Nilai kamu berada di atas batas bawah normal.'}</span></div>`}
$('#jTabs').onclick=e=>{const b=e.target.closest('button');if(b){jk=b.dataset.k;jelas()}};

// ===== Grafik SVG =====
function axes(w,h){return `<path d="M30 8V${h-20}H${w-8}" stroke="var(--line)" fill="none" stroke-width="1.5"/>`}
function curves(r){
  const vt=[],fv=[];
  for(let i=0;i<=40;i++){const t=i/40*6; vt.push([30+t/6*260, 130-(1-Math.exp(-t*1.1))*r.fvc/4*110]);}
  for(let i=0;i<=40;i++){const v=i/40*r.fvc; const x=v/r.fvc; const fl=r.pef*Math.min(1,x*6)*(1-x)**0.9; fv.push([30+v/4*260,130-fl/8*115]);}
  const p=a=>a.map((q,i)=>(i?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1)).join('');
  $('#svgVT').innerHTML=axes(300,150)+`<path d="${p(vt)}" fill="none" stroke="var(--pri)" stroke-width="3"/><text x="150" y="148" font-size="9" fill="var(--mut)" text-anchor="middle">Waktu (s)</text>`;
  $('#svgFV').innerHTML=axes(300,150)+`<path d="${p(fv)}Z" fill="var(--blue)" fill-opacity=".12" stroke="var(--pri)" stroke-width="3"/><text x="150" y="148" font-size="9" fill="var(--mut)" text-anchor="middle">Volume (L)</text>`;
}
function trend(){ // grafik FEV1 dan FVC (L) seperti pada desain
  const hs=[...history].reverse(), n=hs.length, all=hs.flatMap(h=>[h.fev1,h.fvc]), lo=Math.floor(Math.min(...all)-.3), hi=Math.ceil(Math.max(...all)+.3);
  const Y=v=>140-(v-lo)/(hi-lo)*120, X=i=>50+i*(230/Math.max(n-1,1));
  const line=(key,c)=>`<path d="${hs.map((h,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(h[key]).toFixed(1)).join('')}" fill="none" stroke="var(${c})" stroke-width="3"/>`+hs.map((h,i)=>`<circle cx="${X(i)}" cy="${Y(h[key])}" r="4.5" fill="var(${c})"/><text x="${X(i)}" y="${Y(h[key])-9}" font-size="9" text-anchor="middle" fill="var(--ink)">${f(h[key])}</text>`).join('');
  $('#svgTr').innerHTML=axes(300,160)+[0,1,2,3].map(i=>{const v=lo+(hi-lo)*i/3;return `<text x="2" y="${Y(v)+3}" font-size="9" fill="var(--mut)">${f(v,1)}</text>`}).join('')+
    line('fvc','--pri')+line('fev1','--blue')+hs.map((h,i)=>`<text x="${X(i)}" y="170" font-size="9" text-anchor="middle" fill="var(--mut)">${h.d.split(',')[0]}</text>`).join('');
}

// ===== Bluetooth (Web Bluetooth; jika tidak tersedia -> mode simulasi untuk presentasi) =====
let connected=false;
function setHint(t){$('#hint').textContent=t||(connected?'Tarik napas dalam, lalu tekan Mulai tiup':'Hubungkan alat di Beranda terlebih dahulu')}
$('#btnConn').onclick=async()=>{
  let name='PulmoSense-01 (simulasi)';
  try{ if(navigator.bluetooth){const d=await navigator.bluetooth.requestDevice({acceptAllDevices:true}); name=d.name||'Perangkat BLE';} }catch(e){ if(e.name==='NotFoundError')return; }
  connected=true; $('#devname').textContent=name; $('#devsub').textContent='Siap digunakan'; const c=$('#conn'); c.textContent='Terhubung'; c.className='chip ok'; $('#btnStart').disabled=false; setHint();
};

// ===== Uji spirometri (simulasi kurva real-time) =====
const cv=$('#cv'), cx=cv.getContext('2d');
function drawBase(){cx.clearRect(0,0,320,170);cx.strokeStyle='#8fa9b5';cx.lineWidth=1;cx.beginPath();cx.moveTo(30,10);cx.lineTo(30,150);cx.lineTo(312,150);cx.stroke();cx.fillStyle='#8fa9b5';cx.font='10px sans-serif';cx.fillText('Aliran (L/s)',2,8);cx.fillText('Waktu (s)',250,166)}
drawBase();
$('#btnStart').onclick=()=>{
  const btn=$('#btnStart'); btn.disabled=true; drawBase(); let t=0; const T=6, k={baik:1,kurang:.67,parah:.37}[$('#sim').value];
  setHint('Hembuskan napas sekarang!'); cx.strokeStyle=getComputedStyle(root).getPropertyValue('--pri').trim()||'#0f8f74'; cx.lineWidth=3; cx.beginPath();
  const id=setInterval(()=>{
    t+=0.1; const fl=(7*(t/0.15)*Math.exp(1-t/0.15)*0.37*Math.exp(-t*0.45)+Math.random()*0.08)*k;
    const x=30+t/T*280,y=150-fl/8*130; t<=0.11?cx.moveTo(x,y):cx.lineTo(x,y); cx.stroke();
    const p=Math.min(100,Math.round(t/T*100)); $('#bar').style.width=p+'%'; $('#pct').textContent=p+'%'; $('#tm').textContent=f(Math.min(t,T),1)+' s';
    if(t>=T){clearInterval(id);finish();btn.disabled=false}
  },100);
};
function finish(){
  // [FVC, FEV1/FVC, PEF, FEF25-75, SVC] sesuai mode simulasi
  const P={baik:[3.21,.81,6.72,2.9,3.28],kurang:[2.9,.66,4.5,1.6,3.0],parah:[2.3,.45,2.5,.8,2.5]}[$('#sim').value];
  const j=()=>1+(Math.random()-.5)*0.06, fvc=P[0]*j(), fev1=fvc*P[1]*j();
  const d=new Date(), m=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][d.getMonth()];
  history.unshift({d:`${d.getDate()} ${m} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`,fev1,fvc,pef:P[2]*j(),fef:P[3]*j(),svc:P[4]*j()});
  sel=0; render(); setHint('Pemeriksaan selesai'); setTimeout(()=>{go('kualitas');setHint()},600);
}
$('#btnRes').onclick=()=>{go('hasil');const a=analyze(history[0]);if(a.s!=='ok')toast(a)};

// ===== Gejala =====
['Sesak napas','Batuk','Dahak','Aktivitas terbatas'].forEach(s=>{
  $('#sym').insertAdjacentHTML('beforeend',`<label><input type="checkbox"> ${s}</label>`)});
render();
