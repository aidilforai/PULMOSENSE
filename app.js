// ===== Data contoh (nanti diganti data dari alat via Bluetooth/API) =====
const PRED_FEV1 = 3.22;
let history = [
  {d:'15 Jan 2025, 10:24', fev1:2.61, fvc:3.21, pef:6.72, fef:2.90, svc:3.28},
  {d:'10 Jan 2025, 09:11', fev1:2.42, fvc:3.19, pef:6.40, fef:2.70, svc:3.25},
  {d:'03 Jan 2025, 14:30', fev1:2.37, fvc:3.16, pef:6.31, fef:2.62, svc:3.20}
];
const f = (n,d=2)=>n.toFixed(d).replace('.',',');
const $ = s=>document.querySelector(s), $$ = s=>document.querySelectorAll(s);

// ===== Dark / Light Mode Toggle =====
const themeToggle = $('#themeToggle');
const savedTheme = localStorage.getItem('pulmosense_theme');
if(savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.body.classList.add('dark');
  if(themeToggle) themeToggle.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
}

if(themeToggle) {
  themeToggle.onclick = () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('pulmosense_theme', isDark ? 'dark' : 'light');
    themeToggle.innerHTML = isDark 
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  };
}

// ===== Navigasi =====
function go(v){
  $$('.view').forEach(e=>e.classList.toggle('on',e.id==='v-'+v));
  $$('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.go===v));
  scrollTo(0,0);
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)go(b.dataset.go)});

// ===== Gejala =====
['Sesak napas','Batuk','Dahak','Aktivitas terbatas'].forEach(s=>{
  $('#sym').insertAdjacentHTML('beforeend',`<label><input type="checkbox"> ${s}</label>`)});

// ===== Evaluasi Status & Interpretasi (Berdasarkan ERS/ATS 2022) =====
function evaluateStatus(fev1, fvc) {
  const ratio = fev1 / fvc;
  const pct = fev1 / PRED_FEV1 * 100;
  const zScore = (pct - 100) / 12; // Estimasi deviasi standar GLI

  if (ratio < 0.70 || pct < 50 || zScore < -2.5) {
    return {
      level: 'merah',
      text: 'Kondisi Paru Parah / Obstruksi Signifikan',
      colorClass: 'bad',
      alertClass: 'red',
      msg: 'INDIKASI MERAH: Terdeteksi penurunan fungsi paru atau hambatan aliran udara yang signifikan (Z-score < -2.5). Segera konsultasikan ke dokter spesialis paru.'
    };
  } else if (pct < 80 || (zScore >= -2.5 && zScore < -1.645) || (ratio >= 0.70 && ratio < 0.75)) {
    return {
      level: 'kuning',
      text: 'Kurang Baik / Hambatan Ringan',
      colorClass: 'yellow',
      alertClass: 'yellow',
      msg: 'INDIKASI KUNING: Fungsi paru kurang optimal atau berada di batas bawah normal (LLN / Z-score -1.65 s.d. -2.5). Perhatikan gejala dan lakukan pemeriksaan ulang.'
    };
  } else {
    return {
      level: 'hijau',
      text: 'Baik / Normal',
      colorClass: 'ok',
      alertClass: 'green',
      msg: 'INDIKASI HIJAU: Fungsi paru sehat dan normal (Z-score ≥ -1.645 / Sesuai patokan standar ERS/ATS 2022). Pertahankan pola hidup sehat.'
    };
  }
}

// ===== Render nilai =====
function render(){
  const r = history[0], ratio = r.fev1/r.fvc, pct = Math.round(r.fev1/PRED_FEV1*100);
  $('#d-fev1').textContent=f(r.fev1); $('#d-fvc').textContent=f(r.fvc); $('#d-rat').textContent=f(ratio);
  $('#d-fev1').nextElementSibling.textContent=`L · ${pct}% prediksi`;
  $('#d-rat').nextElementSibling.textContent=Math.round(ratio*100)+'%';
  $('#h-date').textContent=r.d;

  const status = evaluateStatus(r.fev1, r.fvc);

  $('#d-ai').textContent = status.msg;
  $('#d-gold').textContent = ratio < 0.7 ? 'Derajat GOLD: '+gold(pct) : 'Klasifikasi GOLD tidak berlaku (FEV1/FVC ≥ 0,70, Z-score normal).';
  
  const a=$('#alert'); 
  a.className = `card warn ${status.alertClass}`;
  a.querySelector('b').textContent = `Pemberitahuan Status: ${status.text}`;
  a.querySelector('span').textContent = status.msg;

  const statusBanner = $('#statusCardBanner');
  if(statusBanner) {
    statusBanner.className = `card warn ${status.alertClass}`;
    statusBanner.innerHTML = `<b>Indikator Status Paru: <span style="text-transform:uppercase">${status.text}</span></b><p style="margin-top:4px;font-size:13px">${status.msg}</p>`;
  }

  $('#h-q').className = `chip ${status.colorClass}`;
  $('#h-q').textContent = status.text.split('/')[0].trim();

  $('#tbl').innerHTML=`<tr><th>Parameter</th><th>Hasil Pasien</th><th>Patokan Sehat (LLN / Z ≥ -1.65)</th></tr>
   <tr><td>FEV1</td><td>${f(r.fev1)} L (${pct}%)</td><td>Z-score ≥ -1,645 (Normal)</td></tr>
   <tr><td>FVC</td><td>${f(r.fvc)} L</td><td>Z-score ≥ -1,645 (Normal)</td></tr>
   <tr><td>FEV1/FVC</td><td>${f(ratio)} (${Math.round(ratio*100)}%)</td><td>≥ 0,70 (Tanpa Obstruksi)</td></tr>
   <tr><td>PEF</td><td>${f(r.pef)} L/s</td><td>Batas GLI Normal</td></tr>
   <tr><td>FEF25–75%</td><td>${f(r.fef)} L/s</td><td>Batas GLI Normal</td></tr>
   <tr><td>SVC</td><td>${f(r.svc)} L</td><td>Batas GLI Normal</td></tr>`;
   
  $('#list').innerHTML=history.map(h=>{
    const st = evaluateStatus(h.fev1, h.fvc);
    return `<div class="item" data-go="hasil"><div><b>${h.d}</b><small>FEV1 ${f(h.fev1)} L (${Math.round(h.fev1/PRED_FEV1*100)}%)</small></div><span class="chip ${st.colorClass}">${st.text.split('/')[0].trim()}</span></div>`;
  }).join('');
  
  curves(r); trend();
  const drop = history.length>1 ? (history[0].fev1-history[1].fev1)/history[1].fev1 : 0;
  $('.dot').classList.toggle('on',drop<=-0.1 || status.level === 'merah');
}
function gold(p){return p>=80?'GOLD 1 (Ringan)':p>=50?'GOLD 2 (Sedang)':p>=30?'GOLD 3 (Berat)':'GOLD 4 (Sangat berat)'}

// ===== Grafik SVG =====
function axes(w,h){return `<path d="M30 8V${h-20}H${w-8}" stroke="var(--line)" fill="none" stroke-width="1.5"/>`}
function curves(r){
  const vt=[],fv=[];
  for(let i=0;i<=40;i++){const t=i/40*6; vt.push([30+t/6*260, 130-(1-Math.exp(-t*1.1))*r.fvc/4*110]);}
  for(let i=0;i<=40;i++){const v=i/40*r.fvc; const x=v/r.fvc; const fl=r.pef*Math.min(1,x*6)*(1-x)**0.9; fv.push([30+v/4*260,130-fl/8*115]);}
  const p=a=>a.map((q,i)=>(i?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1)).join('');
  $('#svgVT').innerHTML=axes(300,150)+`<path d="${p(vt)}" fill="none" stroke="var(--pri)" stroke-width="3"/><text x="150" y="148" font-size="9" fill="var(--mut)" text-anchor="middle">Waktu (s)</text>`;
  $('#svgFV').innerHTML=axes(300,150)+`<path d="${p(fv)}Z" fill="#12b5a622" stroke="var(--pri)" stroke-width="3"/><text x="150" y="148" font-size="9" fill="var(--mut)" text-anchor="middle">Volume (L)</text>`;
}
function trend(){
  const pts=[...history].reverse().map(h=>h.fev1/h.fvc), n=pts.length;
  const xy=pts.map((v,i)=>[40+i*(240/Math.max(n-1,1)),140-(v-0.7)/0.2*120]);
  $('#svgTr').innerHTML=axes(300,160)+[0.7,0.8,0.9].map(v=>`<text x="2" y="${144-(v-0.7)/0.2*120}" font-size="9" fill="var(--mut)">${f(v)}</text>`).join('')+
   `<path d="${xy.map((q,i)=>(i?'L':'M')+q).join('')}" fill="none" stroke="var(--pri2)" stroke-width="3"/>`+
   xy.map((q,i)=>`<circle cx="${q[0]}" cy="${q[1]}" r="5" fill="var(--pri)"/><text x="${q[0]}" y="${q[1]-10}" font-size="10" text-anchor="middle" fill="var(--ink)">${f(pts[i])}</text>`).join('');
}
$$('.seg button').forEach(b=>b.onclick=()=>{$$('.seg button').forEach(x=>x.classList.toggle('on',x===b));$('#list').hidden=b.dataset.t!=='list';$('#trend').hidden=b.dataset.t!=='trend'});

// ===== Bluetooth (Web Bluetooth) =====
let connected=false;
$('#btnConn').onclick=async()=>{
  let name='PulmoSense-01 (simulasi)';
  try{ if(navigator.bluetooth){const d=await navigator.bluetooth.requestDevice({acceptAllDevices:true}); name=d.name||'Perangkat BLE';} }catch(e){ if(e.name==='NotFoundError')return; }
  connected=true; $('#devname').textContent=name; const c=$('#conn'); c.textContent='Terhubung'; c.className='chip ok'; $('#btnStart').disabled=false;
};

// ===== Uji spirometri (simulasi kurva real-time) =====
const cv=$('#cv'), cx=cv.getContext('2d');
function drawBase(){cx.clearRect(0,0,320,170);cx.strokeStyle='#8fa9b5';cx.lineWidth=1;cx.beginPath();cx.moveTo(30,10);cx.lineTo(30,150);cx.lineTo(312,150);cx.stroke();cx.fillStyle='#8fa9b5';cx.font='10px sans-serif';cx.fillText('Aliran (L/s)',2,8);cx.fillText('Waktu (s)',250,166)}
drawBase();
$('#btnStart').onclick=()=>{
  const btn=$('#btnStart'); btn.disabled=true; drawBase(); let t=0; const T=6;
  $('#hint').textContent='Hembuskan sekuat mungkin…'; cx.strokeStyle='#0b6e8f'; cx.lineWidth=3; cx.beginPath();
  const id=setInterval(()=>{
    t+=0.1; const fl=7*(t/0.15)*Math.exp(1-t/0.15)*0.37*Math.exp(-t*0.45)+Math.random()*0.08;
    const x=30+t/T*280,y=150-fl/8*130; t<=0.11?cx.moveTo(x,y):cx.lineTo(x,y); cx.stroke();
    const p=Math.min(100,Math.round(t/T*100)); $('#bar').style.width=p+'%'; $('#pct').textContent=p+'%';
    if(t>=T){clearInterval(id);finish();btn.disabled=false}
  },100);
};
function finish(){
  const j=()=>1+(Math.random()-.5)*0.06, fvc=3.21*j(), fev1=fvc*0.81*j();
  const d=new Date(), m=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][d.getMonth()];
  history.unshift({d:`${d.getDate()} ${m} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`,fev1,fvc,pef:6.72*j(),fef:2.9*j(),svc:3.28*j()});
  $('#hint').textContent='Pemeriksaan selesai. Kualitas manuver: Layak.'; render(); setTimeout(()=>go('hasil'),700);
}
$('#bell').onclick=()=>alert($('#alert span').textContent);
render();

// ===== Ekspor PDF: dengan Patokan Ukuran Paru Sehat (ERS/ATS 2022) & Indikator Status =====
function buildPDF(){
  const W=595,H=842,c=[],A=s=>String(s).replace(/[^\x20-\x7E]/g,m=>({'–':'-','≥':'>=','₂':'2','≤':'<='}[m]||'')).replace(/[\\()]/g,'\\$&');
  const col=a=>a.join(' '),TEAL=[.04,.43,.56],GRN=[.09,.54,.32],INK=[.05,.17,.23],MUT=[.36,.46,.52],LINE=[.84,.9,.92];
  const T=(x,y,s,z=10,b=0,k=INK,al=0)=>{const w=al?A(s).length*z*.5:0;c.push(`BT /F${b?2:1} ${z} Tf ${col(k)} rg ${(x-(al==1?w/2:al==2?w:0)).toFixed(1)} ${(H-y).toFixed(1)} Td (${A(s)}) Tj ET`)};
  const R=(x,y,w,h,k)=>c.push(`${col(k)} rg ${x} ${H-y-h} ${w} ${h} re f`);
  const Ln=(x1,y1,x2,y2,k=LINE,w=.8)=>c.push(`${col(k)} RG ${w} w ${x1} ${H-y1} m ${x2} ${H-y2} l S`);
  const P=(pts,k,w=1.8)=>c.push(`${col(k)} RG ${w} w 1 J 1 j `+pts.map((p,i)=>`${p[0].toFixed(1)} ${(H-p[1]).toFixed(1)} ${i?'l':'m'}`).join(' ')+' S');
  const r=history[0],ratio=r.fev1/r.fvc,pct=Math.round(r.fev1/PRED_FEV1*100),obs=ratio<.7;
  const status=evaluateStatus(r.fev1,r.fvc);

  // header
  R(0,0,W,78,TEAL);T(40,38,'PulmoSense-AI',22,1,[1,1,1]);T(40,58,'Laporan Hasil Pemeriksaan Spirometri & Standar Paru Sehat',11,0,[.85,.95,.97]);
  T(W-40,38,'Dicetak: '+new Date().toLocaleDateString('id-ID'),9,0,[1,1,1],2);T(W-40,58,'Status: '+status.text,9,0,[1,1,1],2);
  
  // pasien
  T(40,94,'Data pasien',12,1,TEAL);Ln(40,100,W-40,100);
  [['Nama','Budi Santoso'],['Usia','32 tahun'],['Jenis kelamin','Laki-laki'],['Tinggi badan','175 cm']].forEach((q,i)=>{const x=40+(i%2)*260,y=116+Math.floor(i/2)*16;T(x,y,q[0],9.5,0,MUT);T(x+80,y,q[1],9.5,1)});
  T(40,154,'ID pasien: P-0003    Tenaga kesehatan: dr. Andi Pratama, Sp.P',9,0,MUT);

  // Patokan Paru Sehat (ERS/ATS 2022)
  T(40,176,'Patokan Ukuran Paru Sehat (ERS/ATS 2022 / Stanojevic et al.)',12,1,TEAL);
  R(40,184,515,36,[.92,.97,.95]);
  T(48,198,'- Batas Bawah Normal (LLN) / Z-score >= -1,645 (5th percentile dari populasi sehat).',9,0,INK);
  T(48,212,'- Klasifikasi Status: Hijau (Normal/Baik), Kuning (Ringan/Kurang Baik), Merah (Obstruksi Berat/Parah).',9,0,INK);

  // tabel hasil
  T(40,234,'Hasil pemeriksaan & perbandingan patokan',12,1,TEAL);R(40,242,515,18,[.9,.96,.97]);
  T(48,254,'Parameter',9,1,MUT);T(200,254,'Hasil Pasien',9,1,MUT);T(340,254,'Patokan Sehat (LLN)',9,1,MUT);
  const rows=[
    ['FEV1',f(r.fev1)+' L ('+pct+'%)','Z-score >= -1,645'],
    ['FVC',f(r.fvc)+' L','Z-score >= -1,645'],
    ['FEV1/FVC',f(ratio)+' ('+Math.round(ratio*100)+'%)','>= 0,70 (Normal)'],
    ['PEF',f(r.pef)+' L/s','Batas GLI Normal'],
    ['FEF25-75%',f(r.fef)+' L/s','Batas GLI Normal'],
    ['SVC',f(r.svc)+' L','Batas GLI Normal']
  ];
  rows.forEach((q,i)=>{const y=276+i*18;T(48,y,q[0],9.5);T(200,y,q[1],9.5,1);T(340,y,q[2],9.5,0,MUT);Ln(40,y+5,555,y+5)});

  // kurva
  const box=(x,y,w,h,title,xl,pts)=>{T(x,y-6,title,10,1,TEAL);Ln(x,y,x,y+h,MUT,1);Ln(x,y+h,x+w,y+h,MUT,1);T(x+w/2,y+h+12,xl,8,0,MUT,1);P(pts.map(p=>[x+p[0]*w,y+h-p[1]*h]),TEAL,2)};
  const vt=[],fv=[];for(let i=0;i<=40;i++){const t=i/40*6;vt.push([t/6,(1-Math.exp(-t*1.1))*r.fvc/4])}
  for(let i=0;i<=40;i++){const x=i/40;fv.push([x*r.fvc/4,r.pef*Math.min(1,x*6)*(1-x)**.9/8])}
  T(40,410,'Kurva spirometri',12,1,TEAL);
  box(60,438,200,100,'Kurva volume-waktu','Waktu (s)',vt);box(340,438,200,100,'Kurva aliran-volume','Volume (L)',fv);

  // interpretasi klinis
  T(40,560,'Interpretasi Klinis & Indikator Status',12,1,TEAL);
  R(40,568,515,48,[.95,.95,.95]);
  T(48,582,`Status Indikator: ${status.text.toUpperCase()}`,10,1,status.level==='merah'?[.8,.1,.1]:status.level==='kuning'?[.7,.5,0]:GRN);
  T(48,598,status.msg,9,0,INK);

  Ln(40,H-50,W-40,H-50);T(W/2,H-34,'Hasil analisis AI dan patokan standar ERS/ATS 2022 bersifat pendukung keputusan klinis.',8,0,MUT,1);

  const st=c.join('\n'),o=['<</Type/Catalog/Pages 2 0 R>>','<</Type/Pages/Kids[3 0 R]/Count 1>>',`<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${W} ${H}]/Resources<</Font<</F1 5 0 R/F2 6 0 R>>>>/Contents 4 0 R>>`,`<</Length ${st.length}>>\nstream\n${st}\nendstream`,'<</Type/Font/Subtype/Type1/BaseFont/Helvetica/Encoding/WinAnsiEncoding>>','<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold/Encoding/WinAnsiEncoding>>'];
  let out='%PDF-1.4\n',xr=[];o.forEach((b,i)=>{xr.push(out.length);out+=`${i+1} 0 obj\n${b}\nendobj\n`});
  const xo=out.length;out+=`xref\n0 ${o.length+1}\n0000000000 65535 f \n`+xr.map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<</Size ${o.length+1}/Root 1 0 R>>\nstartxref\n${xo}\n%%EOF`;
  return new Blob([new Uint8Array([...out].map(ch=>ch.charCodeAt(0)))],{type:'application/pdf'});
}
function exportPDF(btn){
  const a=document.createElement('a'),d=new Date().toISOString().slice(0,10);
  a.href=URL.createObjectURL(buildPDF());a.download=`Laporan_PulmoSense_BudiSantoso_${d}.pdf`;
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  const t=btn.textContent;btn.textContent='Laporan PDF terunduh';setTimeout(()=>btn.textContent=t,2000);
}
$$('[data-pdf]').forEach(b=>b.onclick=()=>exportPDF(b));