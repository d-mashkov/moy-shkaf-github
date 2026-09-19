/* Мой шкаф — логика конструктора и интерфейса */
(function(){
"use strict";
const {SL,ORDER,REQ,SEAS,CATS,I,OUT,BANPAIR,OCC}=window.CLOSET;
const BY={}; I.forEach(x=>BY[x.id]=x);
const REQK=["bottom","top","shoes"];
const $=id=>document.getElementById(id);
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const phone=()=>matchMedia("(max-width:820px)").matches;

/* ---------- правила совместимости ---------- */
function ok(list,wx,occ){
  const has=id=>list.some(x=>x.id===id), get=s=>list.find(x=>x.slot===s);
  let s="SMC"; for(const x of list){ s=[...s].filter(c=>x.s.includes(c)).join(""); }
  if(!s) return false; if(wx && !s.includes(wx)) return false;
  let lo=0,hi=3; for(const x of list){lo=Math.max(lo,x.f[0]);hi=Math.min(hi,x.f[1]);}
  if(occ){lo=Math.max(lo,OCC[occ][0]);hi=Math.min(hi,OCC[occ][1]);}
  if(lo>hi) return false;
  if(list.filter(x=>x.loud).length>1) return false;
  if(list.filter(x=>x.logo).length>1) return false;
  if(new Set(list.filter(x=>x.pat).map(x=>x.pat)).size>1) return false;
  for(const [a,b] of BANPAIR) if(has(a)&&has(b)) return false;
  const bottom=get("bottom"),top=get("top"),layer=get("layer"),shoes=get("shoes"),belt=get("belt");
  if(bottom&&shoes&&bottom.dark&&shoes.brown) return false;
  if(layer&&layer.id==="denimJ"&&bottom&&bottom.denim) return false;
  if(top&&top.sweater&&layer&&!["trench","brownCoat"].includes(layer.id)) return false;
  if(top&&top.sleeve&&layer&&!["trench","blazer"].includes(layer.id)) return false;
  if(layer&&layer.id==="blueCardi"&&top&&!top.fit) return false;
  if(belt&&bottom&&!bottom.belt&&top&&!top.bo) return false;
  return true;
}
function seasonOf(list){let s="SMC";for(const x of list){s=[...s].filter(c=>x.s.includes(c)).join("")}return s}
const lc=s=>s.charAt(0).toLowerCase()+s.slice(1);
function tips(list){
  const t=[], g=s=>list.find(x=>x.slot===s);
  const top=g("top"),bottom=g("bottom"),layer=g("layer"),shoes=g("shoes"),belt=g("belt");
  if(top&&bottom&&(bottom.wide||bottom.id==="bermuda")&&!top.notuck) t.push("Заправь верх хотя бы спереди — так видна талия.");
  if(top&&bottom&&top.over&&bottom.mini) t.push("Объёмный верх и короткий низ — лучшая пропорция для тебя. Заправь спереди или затяни ремень.");
  if(top&&["shirtWhite","shirtBlue"].includes(top.id)) t.push("Рукава закатай до локтя, две верхние пуговицы расстегни.");
  if(top&&top.id==="greySw"&&!layer) t.push("Свитер можно завязать на плечах — небрежная деталь с референсов.");
  if(top&&bottom&&top.pat==="set"&&bottom.pat==="set") t.push("Это комплект из одной ткани — носи как костюм.");
  if(layer&&["trench","blazer","brownCoat"].includes(layer.id)&&bottom&&bottom.wide) t.push(`${layer.n} носи нараспашку: длинная вертикаль вытягивает силуэт.`);
  if(layer&&layer.id==="blazer"&&top&&["corset","lace","bodyB"].includes(top.id)) t.push("Пусть топ выглядывает из пиджака, украшения тонкие.");
  if(top&&top.id==="corset") t.push("Корсет сам держит талию — ремень и заправка не нужны.");
  if(layer&&layer.id==="leather") t.push("Пояс куртки затяни или завяжи узлом на талии.");
  if(layer&&layer.id==="brownCoat") t.push("Пальто короткое — низ должен сидеть на талии.");
  if(shoes&&shoes.id==="loafers") t.push("Лоферы — с белыми носками днём, на голую ногу вечером.");
  if(shoes&&["nb","samba","scBrown","scBlack","dunk"].includes(shoes.id)&&bottom&&(bottom.id==="bermuda"||bottom.mini)) t.push("Белые носки к кроссовкам продолжают линию ноги.");
  if(shoes&&shoes.id==="bootsK") t.push("На каблуке долго не погуляешь — это пара на выход.");
  if(belt&&bottom&&!bottom.belt) t.push("Ремень носи поверх рубашки или свитера на талии.");
  if(bottom&&!belt&&bottom.belt&&top&&!top.notuck) t.push("Добавь ремень: заправленный верх держится, талия видна.");
  const loud=list.find(x=>x.loud); if(loud&&list.length>2) t.push(`${loud.n} — главный акцент, всё остальное тихое.`);
  if(top&&bottom&&top.id==="polo"&&bottom.id==="trGrey") t.push("Серое на сером — колонна тон в тон, самый быстрый способ выглядеть дорого.");
  if(top&&["shirtWhite","shirtBlue","shirtLinen"].includes(top.id)&&seasonOf(list).includes("S")) t.push("В жару рубашка закрывает плечи — подходит и для храмов.");
  return t;
}

/* ---------- состояние ---------- */
const st={pick:{},wx:"",occ:"",edit:{}};
const picked=()=>ORDER.map(k=>st.pick[k]).filter(Boolean).map(id=>BY[id]);
function options(slot){
  const others=picked().filter(x=>x.slot!==slot);
  return I.filter(x=>x.slot===slot&&ok([...others,x],st.wx,st.occ));
}

/* ---------- сегментированный контрол: скользящий индикатор ---------- */
function moveInd(seg){
  const ind=seg.querySelector(".ind"), on=seg.querySelector('[aria-pressed="true"],[aria-selected="true"]');
  if(!ind||!on) return;
  ind.style.left=on.offsetLeft+"px"; ind.style.width=on.offsetWidth+"px";
}
const segs=()=>document.querySelectorAll(".seg");
addEventListener("resize",()=>segs().forEach(moveInd));

/* ---------- слоты: DOM строится один раз, дальше только переключаем ---------- */
function buildSlots(){
  $("slots").innerHTML=ORDER.map(slot=>`
  <section class="slot glass" id="slot-${slot}" aria-labelledby="h-${slot}">
    <div class="slot-h"><h3 id="h-${slot}">${SL[slot]}</h3>${REQ[slot]?"":'<span class="opt">по желанию</span>'}<span class="badge num" id="b-${slot}"></span></div>
    <div class="sel" id="sel-${slot}" hidden></div>
    <div class="slot-body"><div>
      <div class="chips">${I.filter(x=>x.slot===slot).map(x=>`<button type="button" class="chip" data-id="${x.id}" aria-pressed="false">${x.n}</button>`).join("")}</div>
      <p class="none" id="none-${slot}" hidden>С выбранными вещами сюда ничего не подходит. Сними одну из них в карточке «Твой образ».</p>
      <p class="hint num" id="hint-${slot}" hidden></p>
    </div></div>
  </section>`).join("");
}
function renderSlots(){
  for(const slot of ORDER){
    const el=$("slot-"+slot), opts=new Set(options(slot).map(x=>x.id)), sel=st.pick[slot];
    const total=I.filter(x=>x.slot===slot).length, n=opts.size;
    const collapsed=!!sel&&!st.edit[slot];
    el.classList.toggle("done",collapsed);
    el.querySelectorAll(".chip").forEach(c=>{
      const id=c.dataset.id, on=sel===id;
      c.setAttribute("aria-pressed",on?"true":"false");
      if(opts.has(id)||on) c.removeAttribute("data-off"); else c.setAttribute("data-off","");
      c.tabIndex=collapsed?-1:0;
    });
    const b=$("b-"+slot); b.textContent=sel?"✓":`${n}`; b.classList.toggle("on",!!sel);
    b.setAttribute("aria-label",sel?"выбрано":`подходит ${n}`);
    const s=$("sel-"+slot);
    if(collapsed){ s.hidden=false; s.innerHTML=`<span class="chip" aria-pressed="true">${BY[sel].n}</span><button type="button" class="link" data-edit="${slot}">Изменить</button>`; }
    else s.hidden=true;
    $("none-"+slot).hidden=n>0||!!sel;
    const hid=total-n, h=$("hint-"+slot);
    h.hidden=!(hid>0&&n>0&&!sel); h.textContent=`Скрыто ${hid} — не сочетаются с выбранным`;
  }
}

/* ---------- лист «Твой образ» ---------- */
function renderSheet(bump){
  const list=picked(), need=REQK.filter(k=>!st.pick[k]);
  const ready=need.length===0;
  $("sheetTitle").textContent=!list.length?"Выбери первую вещь":ready?"Образ готов":`Осталось: ${need.map(k=>SL[k].toLowerCase()).join(", ")}`;
  $("sheetSum").textContent=list.length?list.map(x=>x.n).join(" · "):"пока ничего не выбрано";
  const steps=$("steps").children;
  REQK.forEach((k,i)=>{steps[i].className=ready?"all":st.pick[k]?"on":"";});
  $("rows").innerHTML=ORDER.map(k=>{const id=st.pick[k];return `<li><span class="k">${SL[k]}</span>${id?`<span class="v">${BY[id].n}</span><button type="button" class="x" data-rm="${k}" aria-label="Убрать: ${BY[id].n}">✕</button>`:`<span class="v empty">${REQ[k]?"не выбрано":"—"}</span><span></span>`}</li>`}).join("");
  const s=seasonOf(list);
  $("wx").textContent=list.length?`Погода: ${[...s].map(c=>SEAS[c]).join(" · ")}`:"";
  $("tips").innerHTML=tips(list).map(x=>`<li>${x}</li>`).join("");
  const sh=$("sheet"); sh.classList.toggle("ready",ready);
  const fill=$("fill"); fill.textContent=ready?"Другой вариант":"Собрать за меня";
  $("save").disabled=!ready;
  if(bump&&!reduce&&sh.animate) sh.animate([{transform:"translateY(0)"},{transform:"translateY(-4px)"},{transform:"translateY(0)"}],{duration:260,easing:"cubic-bezier(.34,1.3,.5,1)"});
}
function render(bump){renderSlots();renderSheet(bump)}

/* ---------- действия ---------- */
function nextOpen(){
  const k=REQK.find(k=>!st.pick[k]); if(!k) return;
  const el=$("slot-"+k); const r=el.getBoundingClientRect();
  const off=document.querySelector(".topbar").offsetHeight+12;
  if(r.top>innerHeight*.6||r.top<off){
    const go=()=>scrollTo({top:el.getBoundingClientRect().top+scrollY-off,behavior:reduce?"auto":"smooth"});
    go(); if(!reduce) setTimeout(()=>{const d=el.getBoundingClientRect().top-off; if(Math.abs(d)>16) go();},420);
  }
}
function tick(){ if(navigator.vibrate) try{navigator.vibrate(6)}catch(e){} }
$("slots").addEventListener("click",e=>{
  const ed=e.target.closest("[data-edit]"); if(ed){st.edit[ed.dataset.edit]=true;render();return}
  const b=e.target.closest(".chips [data-id]"); if(!b) return;
  const x=BY[b.dataset.id], was=st.pick[x.slot]===x.id;
  st.pick[x.slot]=was?undefined:x.id; st.edit[x.slot]=false; tick();
  render(!was); if(!was) setTimeout(nextOpen,reduce?0:330);  // после сворачивания блока (--t .28s)
});
$("rows").addEventListener("click",e=>{const b=e.target.closest("[data-rm]"); if(!b) return; st.pick[b.dataset.rm]=undefined; st.edit[b.dataset.rm]=false; render();});
$("reset").addEventListener("click",()=>{st.pick={};st.edit={};render();$("slot-bottom").scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});});
$("fill").addEventListener("click",()=>{
  const ready=REQK.every(k=>st.pick[k]);
  const keep=ready?{}:{...st.pick};
  if(ready){ // «Другой вариант»: оставляем первую вещь, остальное пересобираем
    const first=st.first&&st.pick[BY[st.first].slot]===st.first?st.first:st.pick.bottom;
    keep[BY[first].slot]=first;
  }
  for(let t=0;t<60;t++){
    st.pick={...keep}; let fail=false;
    for(const slot of ["bottom","top","shoes","bag"]){
      if(st.pick[slot]) continue; const o=options(slot); if(!o.length){fail=true;break}
      st.pick[slot]=o[Math.floor(Math.random()*o.length)].id;
    }
    if(!fail&&REQK.every(k=>st.pick[k])) break;
  }
  st.edit={}; tick(); render(true);
  const f=$("fill"); f.classList.add("done"); setTimeout(()=>f.classList.remove("done"),600);
});
// запоминаем, с какой вещи начали — «Другой вариант» её сохранит
const origRender=render;
render=function(b){ const l=picked(); if(l.length===1) st.first=l[0].id; if(!l.length) st.first=null; origRender(b); };

/* мобильный лист */
$("sheetToggle").addEventListener("click",()=>{
  if(!phone()) return;
  const sh=$("sheet"), open=!sh.classList.contains("open");
  sh.classList.toggle("open",open); $("sheetToggle").setAttribute("aria-expanded",open?"true":"false");
});

/* фильтры */
function bindSeg(id,attr,key){
  const seg=$(id);
  seg.addEventListener("click",e=>{
    const b=e.target.closest(`[data-${attr}]`); if(!b) return;
    st[key]=b.dataset[attr];
    seg.querySelectorAll(`[data-${attr}]`).forEach(x=>x.setAttribute("aria-pressed",x===b?"true":"false"));
    moveInd(seg);
    let ch=true; while(ch){ ch=false; for(const k of ORDER){ if(st.pick[k]&&!options(k).some(x=>x.id===st.pick[k])){st.pick[k]=undefined;ch=true} } }
    render();
  });
}
bindSeg("seg-w","w","wx"); bindSeg("seg-o","o","occ");

/* ---------- вкладки ---------- */
function show(view,scroll){
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id==="view-"+view));
  document.querySelectorAll("[role=tab][data-view]").forEach(t=>t.setAttribute("aria-selected",t.dataset.view===view?"true":"false"));
  segs().forEach(moveInd);
  document.body.dataset.view=view;
  $("sheet").hidden=view!=="build";
  if(scroll!==false) scrollTo({top:0,behavior:"auto"});
  try{history.replaceState(null,"","#"+view)}catch(e){}
}
document.querySelectorAll("[role=tablist]").forEach(tl=>tl.addEventListener("click",e=>{const t=e.target.closest("[data-view]"); if(t) show(t.dataset.view);}));

/* ---------- каталог ---------- */
function card(x){
  const seas=[...x.s].map(c=>SEAS[c]).join(" · ");
  return `<article class="card glass" data-cat="${x.cat}"><div class="meta"><span>${SL[x.slot]}</span><span>${seas}</span></div><h4>${x.n}</h4><p class="d">${x.d}</p><p class="w"><b>Как носить.</b> ${x.w}</p><button type="button" class="try" data-try="${x.id}">Собрать образ с этой вещью</button></article>`;
}
$("cards").innerHTML=I.map(card).join("");
$("out").innerHTML=OUT.map(([n,w])=>`<article class="card glass muted"><h4>${n}</h4><p class="w">${w}</p></article>`).join("");
$("catf").insertAdjacentHTML("afterbegin",`<button type="button" data-c="" aria-pressed="true">Все</button>`+CATS.map(([c,t])=>`<button type="button" data-c="${c}" aria-pressed="false">${t.split(",")[0].replace("Верхняя одежда и жакеты","Верх. одежда")}</button>`).join(""));
$("catf").addEventListener("click",e=>{
  const b=e.target.closest("[data-c]"); if(!b) return;
  $("catf").querySelectorAll("[data-c]").forEach(x=>x.setAttribute("aria-pressed",x===b?"true":"false")); moveInd($("catf"));
  document.querySelectorAll("#cards .card").forEach(c=>{ if(!b.dataset.c||c.dataset.cat===b.dataset.c) c.removeAttribute("data-off"); else c.setAttribute("data-off",""); });
});
$("cards").addEventListener("click",e=>{
  const b=e.target.closest("[data-try]"); if(!b) return;
  const x=BY[b.dataset.try];
  st.pick={}; st.edit={}; st.wx=""; st.occ="";
  document.querySelectorAll("#seg-w [data-w],#seg-o [data-o]").forEach(y=>y.setAttribute("aria-pressed",(y.dataset.w===""||y.dataset.o==="")?"true":"false"));
  st.pick[x.slot]=x.id; show("build"); render(true); setTimeout(nextOpen,60);
});

/* ---------- карточка образа картинкой ---------- */
const OCCN={walk:"прогулка",meet:"город",eve:"вечер"};
const SW=[[/чёрн|black/i,"#1E1F22"],[/бел|white/i,"#F5F3EE"],[/голуб/i,"#A9BFD8"],[/васил|син/i,"#3558B0"],[/сер/i,"#9B9DA2"],[/шоколад|коричн|birken|speedcat кор|dunk/i,"#5B3A2C"],[/молоч|крем/i,"#EFE6D6"],[/stone|беж/i,"#D8CFC0"],[/джинс|бермуд/i,"#7F9DBF"],[/олив/i,"#6E6B3E"],[/жёлт/i,"#E3C04B"],[/new balance/i,"#C9CCD1"],[/gucci/i,"#8A6E4B"],[/samba/i,"#F2F2F2"],[/платок/i,"#E9E3D6"]];
const swatch=n=>{for(const [r,c] of SW) if(r.test(n)) return c; return "#C8C8CC"};
function rr(x,X,Y,W,H,R){x.beginPath();x.moveTo(X+R,Y);x.arcTo(X+W,Y,X+W,Y+H,R);x.arcTo(X+W,Y+H,X,Y+H,R);x.arcTo(X,Y+H,X,Y,R);x.arcTo(X,Y,X+W,Y,R);x.closePath()}
function wrapT(x,t,w){const out=[];let line="";for(const word of t.split(" ")){const tt=line?line+" "+word:word;if(x.measureText(tt).width>w&&line){out.push(line);line=word}else line=tt}if(line)out.push(line);return out}
function drawCard(){
  const W=1080,H=1350,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
  const F='-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Roboto,Arial,sans-serif';
  const list=picked(), tp=tips(list).slice(0,2);
  // фон
  x.fillStyle="#EEF0F3";x.fillRect(0,0,W,H);
  for(const [cx,cy,r,col] of [[120,80,720,"201,215,232"],[1000,420,620,"230,217,200"],[380,1320,640,"217,199,188"],[960,1260,520,"244,241,234"]]){
    const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,`rgba(${col},1)`);g.addColorStop(1,`rgba(${col},0)`);x.fillStyle=g;x.fillRect(0,0,W,H);}
  // стеклянная карточка
  const P=64,CX=P,CY=P,CW=W-2*P,CH=H-2*P;
  x.save();x.shadowColor="rgba(28,28,30,.12)";x.shadowBlur=60;x.shadowOffsetY=18;rr(x,CX,CY,CW,CH,56);x.fillStyle="rgba(255,255,255,.62)";x.fill();x.restore();
  rr(x,CX,CY,CW,CH,56);x.lineWidth=2;x.strokeStyle="rgba(255,255,255,.95)";x.stroke();
  const L=CX+64, R=CX+CW-64, TW=R-L;
  // логотип
  const g2=x.createLinearGradient(L,CY+60,L+72,CY+132);g2.addColorStop(0,"#3E6491");g2.addColorStop(1,"#26405F");
  rr(x,L,CY+60,72,72,20);x.fillStyle=g2;x.fill();
  x.save();x.translate(L+12,CY+72);x.scale(2,2);x.strokeStyle="#fff";x.lineWidth=1.8;x.lineCap="round";x.lineJoin="round";
  x.stroke(new Path2D("M12 5.2a1.9 1.9 0 1 1 1.9 1.9c-.9 0-1.9.6-1.9 1.6v1.1L4.3 15.2c-.9.6-.5 2 .6 2h14.2c1.1 0 1.5-1.4.6-2L12 9.8"));x.restore();
  x.fillStyle="#1C1C1E";x.font=`700 36px ${F}`;x.textBaseline="middle";x.fillText("Мой шкаф",L+96,CY+96);
  x.textAlign="right";x.fillStyle="rgba(60,60,67,.62)";x.font=`500 28px ${F}`;
  x.fillText(new Date().toLocaleDateString("ru",{day:"numeric",month:"long"}),R,CY+96);x.textAlign="left";
  // заголовок и чипы
  let y=CY+250;
  x.fillStyle="#1C1C1E";x.font=`800 84px ${F}`;x.textBaseline="alphabetic";x.fillText("Мой образ",L,y);
  y+=46;
  const chips=[[...seasonOf(list)].map(k=>SEAS[k]).join(" · ")];if(st.occ)chips.push(OCCN[st.occ]);
  x.font=`600 26px ${F}`;let cx=L;
  for(const t of chips){const w=x.measureText(t).width+44;rr(x,cx,y,w,50,25);x.fillStyle="rgba(62,100,145,.12)";x.fill();x.fillStyle="#3E6491";x.textBaseline="middle";x.fillText(t,cx+22,y+26);cx+=w+12}
  y+=96;
  // палитра образа
  const dots=list.map(i=>swatch(i.n));
  dots.forEach((col,i)=>{x.beginPath();x.arc(L+34+i*58,y,26,0,Math.PI*2);x.fillStyle=col;x.fill();x.lineWidth=3;x.strokeStyle="rgba(255,255,255,.95)";x.stroke();});
  y+=58;
  // строки: подгоняем размер, чтобы всё поместилось
  const rows=ORDER.filter(k=>st.pick[k]).map(k=>[SL[k].toUpperCase(),BY[st.pick[k]].n]);
  const bottomLimit=CY+CH-(tp.length?64:40)-40;
  let fs=40,layout;
  for(;fs>=28;fs-=2){
    x.font=`500 ${fs}px ${F}`;let yy=y;const lay=[];
    for(const [k,v] of rows){const ls=wrapT(x,v,TW-230);lay.push([k,ls,yy]);yy+=Math.max(ls.length*fs*1.22,fs*1.22)+34;}
    let ty=yy+10;x.font=`400 ${Math.round(fs*.72)}px ${F}`;const tl=tp.map(t=>wrapT(x,t,TW-36));
    const tipH=tl.reduce((a,l)=>a+l.length*fs*.72*1.35+14,0);
    layout={lay,ty,tl,fs};if(ty+tipH<bottomLimit)break;
  }
  x.textBaseline="top";
  layout.lay.forEach(([k,ls,yy],i)=>{
    x.fillStyle="rgba(60,60,67,.62)";x.font=`700 ${Math.round(layout.fs*.55)}px ${F}`;
    x.save();x.letterSpacing="2px";x.fillText(k,L,yy+layout.fs*.3);x.restore();
    x.fillStyle="#1C1C1E";x.font=`500 ${layout.fs}px ${F}`;ls.forEach((l,j)=>x.fillText(l,L+230,yy+j*layout.fs*1.22));
    const by=yy+Math.max(ls.length,1)*layout.fs*1.22+16;
    if(i<layout.lay.length-1){x.fillStyle="rgba(60,60,67,.14)";x.fillRect(L,by,TW,2);}
  });
  // советы
  let ty=layout.ty+8;const tf=Math.round(layout.fs*.72);x.font=`400 ${tf}px ${F}`;
  layout.tl.forEach(ls=>{x.beginPath();x.arc(L+8,ty+tf*.62,5,0,Math.PI*2);x.fillStyle="#3E6491";x.fill();x.fillStyle="rgba(60,60,67,.8)";ls.forEach((l,j)=>x.fillText(l,L+30,ty+j*tf*1.35));ty+=ls.length*tf*1.35+14;});
  // подпись
  x.textBaseline="alphabetic";x.fillStyle="rgba(60,60,67,.4)";x.font=`500 24px ${F}`;x.fillText("собрано в «Мой шкаф»",L,CY+CH-44);
  return c;
}
let cardBlob=null, dl=null;
if(window.claude&&typeof window.claude.use==="function") window.claude.use("downloads").then(n=>{dl=n}).catch(()=>{});
function openCard(){
  if(!REQK.every(k=>st.pick[k])) return;
  const c=drawCard(); $("mImg").src=c.toDataURL("image/png"); cardBlob=null;
  c.toBlob(b=>{cardBlob=b},"image/png");
  $("mHint").classList.remove("strong"); $("modal").hidden=false; document.body.style.overflow="hidden"; $("mSave").focus();
}
function closeCard(){ $("modal").hidden=true; document.body.style.overflow=""; $("save").focus(); }
$("save").addEventListener("click",openCard);
$("mClose").addEventListener("click",closeCard);
$("modal").addEventListener("click",e=>{ if(e.target.id==="modal") closeCard(); });
addEventListener("keydown",e=>{ if(e.key==="Escape"&&!$("modal").hidden) closeCard(); });
$("mSave").addEventListener("click",async()=>{
  const name=`obraz-${new Date().toISOString().slice(0,10)}.png`;
  const blob=cardBlob||await (await fetch($("mImg").src)).blob();
  const file=new File([blob],name,{type:"image/png"});
  if(dl){ // внутри Claude: сохранение через платформу
    try{ await dl.save({filename:name,data:blob}); $("mHint").textContent="Готово: картинка сохранена."; }
    catch(err){ if(err&&err.code==="declined") return; $("mHint").classList.add("strong"); }
    return;
  }
  try{
    if(navigator.canShare&&navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:"Мой образ"}); return; }
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),4000);
    $("mHint").textContent="Картинка сохранена в «Загрузки». Если её там нет, удержи картинку и выбери «Сохранить в Фото».";
  }catch(err){ if(err&&err.name==="AbortError") return; $("mHint").classList.add("strong"); }
});

/* логотип — на главную */
$("brand").addEventListener("click",e=>{ e.preventDefault(); show("build"); scrollTo({top:0,behavior:reduce?"auto":"smooth"}); });

/* ---------- счётчик сочетаний ---------- */
(function(){
  const T=I.filter(x=>x.slot==="top"),B=I.filter(x=>x.slot==="bottom"),S=I.filter(x=>x.slot==="shoes");let n=0;
  for(const t of T)for(const b of B){ if(!ok([t,b]))continue; for(const s of S) if(ok([t,b,s])) n++; }
  $("stat").textContent=`${I.length} вещей · ${n.toLocaleString("ru")} сочетаний верха, низа и обуви`;
})();

/* ---------- старт ---------- */
buildSlots();
const start=(location.hash||"").slice(1);
show(["build","closet","rules"].includes(start)?start:"build",false);
if(!start){ st.pick.bottom="trBlack"; }   // рабочий пример при первом открытии
render();
requestAnimationFrame(()=>segs().forEach(moveInd));
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>segs().forEach(moveInd));

/* для тестов */
window.__closet={st,BY,ok,options,picked,ORDER,I,render:(b)=>render(b)};
})();
