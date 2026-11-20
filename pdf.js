// ===== Ekspor PDF (2 halaman): dibuat langsung di browser lalu diunduh =====
function buildPDF(){
  const W=595,H=842,pages=[];let c;const np=()=>{c=[];pages.push(c)};np();
  const A=s=>String(s).replace(/[^\x20-\x7E]/g,m=>({'–':'-','−':'-','≥':'>=','₂':'2','≤':'<=','·':'-'}[m]||'')).replace(/[\\()]/g,'\\$&');
  const col=a=>a.join(' '),TEAL=[.04,.43,.56],GRN=[.09,.54,.32],INK=[.05,.17,.23],MUT=[.36,.46,.52],LINE=[.84,.9,.92],WH=[1,1,1];
  const SC={ok:GRN,warn:[.72,.47,0],bad:[.78,.15,.15]},SB={ok:[.87,.96,.91],warn:[1,.95,.78],bad:[.99,.88,.88]},K=l=>['ok','warn','warn','bad'][l];
  const T=(x,y,s,z=10,b=0,k=INK,al=0)=>{const w=al?A(s).length*z*.5:0;c.push(`BT /F${b?2:1} ${z} Tf ${col(k)} rg ${(x-(al==1?w/2:al==2?w:0)).toFixed(1)} ${(H-y).toFixed(1)} Td (${A(s)}) Tj ET`)};
  const R=(x,y,w,h,k)=>c.push(`${col(k)} rg ${x} ${H-y-h} ${w} ${h} re f`);
  const Ln=(x1,y1,x2,y2,k=LINE,w=.8)=>c.push(`${col(k)} RG ${w} w ${x1} ${H-y1} m ${x2} ${H-y2} l S`);
  const P=(pts,k,w=1.8)=>c.push(`${col(k)} RG ${w} w 1 J 1 j `+pts.map((p,i)=>`${p[0].toFixed(1)} ${(H-p[1]).toFixed(1)} ${i?'l':'m'}`).join(' ')+' S');
  const wrap=(s,n)=>{const l=[];let q='';String(s).split(' ').forEach(w=>{if((q+' '+w).trim().length>n){l.push(q);q=w}else q=(q+' '+w).trim()});if(q)l.push(q);return l};
  const wr=(x,y,s,n,z=9,k=INK,lh=12)=>{const l=wrap(s,n);l.forEach((t,i)=>T(x,y+i*lh,t,z,0,k));return l.length};
  const foot=()=>{Ln(40,H-50,W-40,H-50);T(W/2,H-36,'Hasil analisis AI bersifat pendukung. Interpretasi akhir dilakukan oleh tenaga kesehatan.',8,0,MUT,1);T(W/2,H-24,'Acuan: Stanojevic S, et al. ERS/ATS technical standard on interpretive strategies for routine lung function tests. Eur Respir J 2022;60:2101499.',6.5,0,MUT,1)};
  const r=history[sel],a=analyze(r),th='Rentang';
  // ---------- Halaman 1 ----------
  R(0,0,W,78,TEAL);T(40,38,'PulmoSense-AI',22,1,WH);T(40,58,'Laporan Hasil Pemeriksaan Spirometri',11,0,[.85,.95,.97]);
  T(W-40,38,'Dicetak: '+new Date().toLocaleDateString('id-ID'),9,0,WH,2);T(W-40,58,'Pemeriksaan: '+r.d,9,0,WH,2);
  T(40,104,'Data pasien',12,1,TEAL);Ln(40,110,W-40,110);
  [['Nama',PAT.nama],['Usia',PAT.usia],['Jenis kelamin',PAT.jk],['Tinggi badan',PAT.tb]].forEach((q,i)=>{const x=40+(i%2)*260,y=128+Math.floor(i/2)*16;T(x,y,q[0],9.5,0,MUT);T(x+80,y,q[1],9.5,1)});
  T(40,168,`ID pasien: ${PAT.id}    Tenaga kesehatan: ${PAT.dr}`,9,0,MUT);
  // banner status (hijau / kuning / merah)
  const ml=wrap(a.msg,108),bh=30+ml.length*12;R(40,180,515,bh,SB[a.s]);R(40,180,5,bh,SC[a.s]);
  T(54,198,'Status: '+a.title,12,1,SC[a.s]);ml.forEach((t,i)=>T(54,213+i*12,t,9));
  const Y0=180+bh+24;
  T(40,Y0,'Hasil pemeriksaan',12,1,TEAL);R(40,Y0+8,515,18,[.9,.96,.97]);
  [['Parameter',48],['Hasil',200],['Z-score (estimasi)',310],['Status',430]].forEach(q=>T(q[1],Y0+20,q[0],9,1,MUT));
  const rows=[['FEV1',f(r.fev1)+' L',f(a.z.fev1,1),'fev1'],['FVC',f(r.fvc)+' L',f(a.z.fvc,1),'fvc'],['FEV1/FVC',f(a.ratio)+' ('+Math.round(a.ratio*100)+'%)',f(a.z.rat,1),'rat'],['PEF',f(r.pef)+' L/s','-',null],['FEF25-75%',f(r.fef)+' L/s','-',null],['SVC',f(r.svc)+' L','-',null],['Kualitas manuver','Layak','-',null,'Dinilai CNN 1D']];
  rows.forEach((q,i)=>{const y=Y0+42+i*19,l=q[3]?a.L[q[3]]:null;T(48,y,q[0],10);T(200,y,q[1],10,1);T(310,y,q[2],10,0,MUT);T(430,y,l===null?(q[4]||''):SEV[l],10,1,l===null?MUT:SC[K(l)]);Ln(40,y+6,555,y+6)});
  const box=(x,y,w,h,title,xl,pts)=>{T(x,y-6,title,10,1,TEAL);Ln(x,y,x,y+h,MUT,1);Ln(x,y+h,x+w,y+h,MUT,1);T(x+w/2,y+h+12,xl,8,0,MUT,1);P(pts.map(p=>[x+p[0]*w,y+h-p[1]*h]),TEAL,2)};
  const vt=[],fv=[];for(let i=0;i<=40;i++){const t=i/40*6;vt.push([t/6,(1-Math.exp(-t*1.1))*r.fvc/4])}
  for(let i=0;i<=40;i++){const x=i/40;fv.push([x*r.fvc/4,r.pef*Math.min(1,x*6)*(1-x)**.9/8])}
  const cy=Y0+42+7*19+30;T(40,cy,'Kurva spirometri',12,1,TEAL);
  box(60,cy+28,200,110,'Kurva volume-waktu','Waktu (s)',vt);box(340,cy+28,200,110,'Kurva aliran-volume','Volume (L)',fv);
  const iy=cy+28+110+36;T(40,iy,'Interpretasi AI (pendukung)',12,1,TEAL);Ln(40,iy+6,W-40,iy+6);
  let n=wr(40,iy+24,a.pola+a.near,108,9.5);n+=wr(40,iy+24+n*12+4,(a.w>0?'Derajat gangguan (z-score): '+SEV[a.w]+'. ':'Semua parameter di atas batas bawah normal. ')+'Kualitas manuver: Layak (analisis CNN 1D).',108,9.5);
  foot();
  // ---------- Halaman 2: patokan paru sehat ----------
  np();R(0,0,W,40,TEAL);T(40,26,'PulmoSense-AI - Patokan paru sehat & riwayat',13,1,WH);T(W-40,26,PAT.nama+' / '+PAT.id,9,0,WH,2);
  T(40,72,'Patokan ukuran paru sehat',12,1,TEAL);R(40,80,515,18,[.9,.96,.97]);
  [['Parameter',48],['Sehat (prediksi)',170],['Batas bawah normal',300],['Hasil Anda',440]].forEach(q=>T(q[1],92,q[0],9,1,MUT));
  [['FEV1',REF.fev1,REF.lln.fev1*REF.fev1,r.fev1,' L','fev1'],['FVC',REF.fvc,REF.lln.fvc*REF.fvc,r.fvc,' L','fvc'],['FEV1/FVC',REF.rat,REF.rat*REF.lln.rat,a.ratio,'','rat']].forEach((q,i)=>{const y=114+i*19,l=a.L[q[5]];
    T(48,y,q[0],10);T(170,y,f(q[1])+q[4],10);T(300,y,'>= '+f(q[2])+q[4],10);T(440,y,f(q[3])+q[4]+' ('+SEV[l]+')',10,1,SC[K(l)]);Ln(40,y+6,555,y+6)});
  wr(40,184,`Patokan untuk ${PAT.jk.toLowerCase()}, ${PAT.usia}, tinggi ${PAT.tb}. Batas bawah normal (LLN) = persentil ke-5 (z-score -1,645) populasi sehat; hasil di bawah LLN berada di luar rentang orang sehat. Z-score diestimasi dari batas bawah GLI (Tabel 3, ERS/ATS 2022); pembulatan dapat berbeda dari perangkat klinis.`,108,8.5,MUT);
  T(40,236,'Kriteria derajat dan pemberitahuan (ERS/ATS 2022)',12,1,TEAL);Ln(40,242,W-40,242);
  [['Normal','z >= -1,645',0,'Baik. Pertahankan gaya hidup sehat.'],['Ringan','z -1,65 s/d -2,5',1,'Kurang baik. Pantau, konsultasi bila ada gejala.'],['Sedang','z -2,51 s/d -4',2,'Kurang baik. Konsultasi dan ulangi pemeriksaan.'],['Berat','z < -4',3,'Parah. Segera hubungi tenaga kesehatan.']].forEach((q,i)=>{const y=262+i*20;
    R(48,y-9,10,10,SC[K(q[2])]);T(66,y,q[0],10,a.w===q[2]?1:0);T(130,y,q[1],10,0,MUT);T(240,y,q[3],9.5,a.w===q[2]?1:0,SC[K(q[2])]);Ln(40,y+6,555,y+6)});
  T(40,366,'Pola spirometri (Tabel 5 ERS/ATS 2022)',12,1,TEAL);Ln(40,372,W-40,372);
  ['Normal: FEV1, FVC, dan FEV1/FVC di atas batas bawah normal.','Obstruktif: FEV1/FVC di bawah batas bawah normal.','Kemungkinan restriktif: FVC rendah, FEV1/FVC normal (konfirmasi dengan TLC).','Campuran: FEV1/FVC dan FVC rendah (perlu pengukuran volume paru).'].forEach((s,i)=>T(48,392+i*15,s,9.5));
  T(40,470,'Riwayat pemeriksaan',12,1,TEAL);R(40,478,515,16,[.9,.96,.97]);
  [['Tanggal',48],['FEV1 (L)',220],['FVC (L)',290],['FEV1/FVC',360],['Status',440]].forEach(q=>T(q[1],489,q[0],9,1,MUT));
  history.slice(0,5).forEach((h,i)=>{const y=510+i*16,x=analyze(h);T(48,y,h.d,9.5);T(220,y,f(h.fev1),9.5);T(290,y,f(h.fvc),9.5);T(360,y,f(h.fev1/h.fvc),9.5,1);T(440,y,STK[x.s],9.5,1,SC[x.s]);Ln(40,y+5,555,y+5)});
  const hs=[...history.slice(0,5)].reverse(),by=630,bh2=50,bx=70,bw=200,pts=hs.map(h=>h.fev1/h.fvc),lo=Math.min(.7,REF.rat*REF.lln.rat-.03,...pts)-.02,hi=Math.max(.9,...pts)+.02,Yv=v=>by+bh2-(v-lo)/(hi-lo)*bh2;
  T(40,by-14,'Tren FEV1/FVC',10,1,TEAL);Ln(bx,by,bx,by+bh2,MUT,1);Ln(bx,by+bh2,bx+bw,by+bh2,MUT,1);
  const yl=Yv(REF.rat*REF.lln.rat);Ln(bx,yl,bx+bw,yl,SC.bad,.6);T(bx+bw+4,yl+3,'LLN',7,0,SC.bad);
  const tp=hs.map((h,i)=>[bx+10+i*((bw-20)/Math.max(hs.length-1,1)),Yv(pts[i])]);P(tp,[.07,.71,.65],2);tp.forEach((p,i)=>T(p[0],p[1]-4,f(pts[i]),8,0,INK,1));
  T(330,by-14,'Pemberitahuan',10,1,SC[a.s]);R(330,by-6,225,4,SC[a.s]);T(330,by+14,'Status: '+a.title,9.5,1,SC[a.s]);wr(330,by+28,a.msg,50,8.5);
  foot();
  // ---------- rakit PDF ----------
  const o=['<</Type/Catalog/Pages 2 0 R>>',`<</Type/Pages/Kids[${pages.map((_,i)=>`${5+2*i} 0 R`).join(' ')}]/Count ${pages.length}>>`,'<</Type/Font/Subtype/Type1/BaseFont/Helvetica/Encoding/WinAnsiEncoding>>','<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold/Encoding/WinAnsiEncoding>>'];
  pages.forEach((p,i)=>{const st=p.join('\n');o.push(`<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${W} ${H}]/Resources<</Font<</F1 3 0 R/F2 4 0 R>>>>/Contents ${6+2*i} 0 R>>`);o.push(`<</Length ${st.length}>>\nstream\n${st}\nendstream`)});
  let out='%PDF-1.4\n',xr=[];o.forEach((b,i)=>{xr.push(out.length);out+=`${i+1} 0 obj\n${b}\nendobj\n`});
  const xo=out.length;out+=`xref\n0 ${o.length+1}\n0000000000 65535 f \n`+xr.map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<</Size ${o.length+1}/Root 1 0 R>>\nstartxref\n${xo}\n%%EOF`;
  return new Blob([new Uint8Array([...out].map(ch=>ch.charCodeAt(0)))],{type:'application/pdf'});
}
function exportPDF(btn){
  const a=document.createElement('a'),d=new Date().toISOString().slice(0,10);
  a.href=URL.createObjectURL(buildPDF());a.download=`Laporan_PulmoSense_${PAT.nama.replace(/\s/g,'')}_${d}.pdf`;
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  const t=btn.textContent;btn.textContent='Laporan PDF terunduh';setTimeout(()=>btn.textContent=t,2000);
}
$$('[data-pdf]').forEach(b=>b.onclick=()=>exportPDF(b));v