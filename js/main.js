/**
 * PHOENIX MOBILES v3 — main.js
 * Eagle birth animation · Per-section fire canvases · Fire cursor trail
 * Buttery GSAP ScrollTrigger · Typewriter · Full mobile compatibility
 */
'use strict';

/* ─── UTILS ─── */
const $ = (s,c=document) => c.querySelector(s);
const $$ = (s,c=document) => [...c.querySelectorAll(s)];
const clamp = (v,a,b) => Math.min(Math.max(v,a),b);
const lerp = (a,b,t) => a+(b-a)*t;
const rnd = (a,b) => a+Math.random()*(b-a);
const rndI = (a,b) => Math.floor(rnd(a,b+1));

const D = (() => {
  let _r=null,_t=null,_m=null;
  return {
    reduced:()=>{ if(_r===null)_r=window.matchMedia('(prefers-reduced-motion:reduce)').matches; return _r; },
    touch:()=>{ if(_t===null)_t=('ontouchstart' in window)||window.matchMedia('(hover:none)').matches; return _t; },
    mobile:()=>window.innerWidth<=768,
    refresh:()=>{ _t=null; _m=null; }
  };
})();

const GOLD = ['#FFD700','#D4AF37','#FFC107','#FFFDE7','#FFAB00','#C9962A','#FFE082'];

function hexRgb(hex){ return [parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)]; }
function goldRgba(hex,a){ const [r,g,b]=hexRgb(hex); return `rgba(${r},${g},${b},${a.toFixed(2)})`; }

/* ─── VIEWPORT FIX ─── */
function initVH(){
  const set=()=>document.documentElement.style.setProperty('--vh',`${window.innerHeight*.01}px`);
  set(); window.addEventListener('resize',()=>{ D.refresh(); set(); },{passive:true});
}

/* ─── SCROLL BAR ─── */
function initScrollBar(){
  const bar=$('#scrollBar'); if(!bar) return;
  let raf=false;
  window.addEventListener('scroll',()=>{
    if(raf) return; raf=true;
    requestAnimationFrame(()=>{
      const t=document.documentElement.scrollHeight-window.innerHeight;
      bar.style.width=t>0?`${(window.scrollY/t)*100}%`:'0%';
      raf=false;
    });
  },{passive:true});
}

/* ─── CURSOR ─── */
function initCursor(){
  if(D.reduced()||D.touch()) return;
  const wrap=$('#cursor'); if(!wrap) return;
  const dot=$('.cur-dot',wrap), ring=$('.cur-ring',wrap);
  let mx=-200,my=-200,rx=-200,ry=-200;
  document.addEventListener('mousemove',e=>{ mx=e.clientX;my=e.clientY; if(dot){dot.style.left=mx+'px';dot.style.top=my+'px';} },{passive:true});
  const sel='a,button,[data-magnetic],.srv-card,.why-card,.dev-tile,.gl-card,.proc-step';
  document.addEventListener('mouseover',e=>{ if(e.target.closest(sel)) wrap.classList.add('hovered'); });
  document.addEventListener('mouseout', e=>{ if(e.target.closest(sel)) wrap.classList.remove('hovered'); });
  document.addEventListener('mousedown',()=>wrap.classList.add('clicking'));
  document.addEventListener('mouseup',  ()=>wrap.classList.remove('clicking'));
  if(ring){(function t(){ rx=lerp(rx,mx,.11);ry=lerp(ry,my,.11);ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(t);})();}
}

/* ─── FIRE CURSOR TRAIL ─── */
function initFireTrail(){
  const canvas=$('#fireTrailCanvas'); if(!canvas||D.reduced()||D.touch()) return;
  const ctx=canvas.getContext('2d',{alpha:true});
  let W,H,mx=0,my=0,particles=[];

  function resize(){ W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight; }
  resize(); window.addEventListener('resize',resize,{passive:true});
  document.addEventListener('mousemove',e=>{ mx=e.clientX;my=e.clientY; spawnTrail(mx,my); },{passive:true});

  function spawnTrail(x,y){
    const n=D.mobile()?1:3;
    for(let i=0;i<n;i++){
      particles.push({
        x:x+rnd(-6,6),y:y+rnd(-6,6),
        vx:rnd(-1.2,1.2),vy:rnd(-2.5,-0.5),
        r:rnd(2,5),life:1,decay:rnd(0.05,0.1),
        hue:rnd(28,52)
      });
    }
  }

  (function draw(){
    requestAnimationFrame(draw);
    ctx.clearRect(0,0,W,H);
    particles=particles.filter(p=>p.life>0);
    particles.forEach(p=>{
      p.life-=p.decay; p.x+=p.vx; p.y+=p.vy; p.r*=0.96;
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3);
      g.addColorStop(0,`hsla(${p.hue},90%,65%,${(p.life*0.7).toFixed(2)})`);
      g.addColorStop(1,'transparent');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*3,0,Math.PI*2); ctx.fill();
    });
  })();
}

/* ═══════════════════════════════════════════════════
   EAGLE BIRTH ANIMATION
   Gold particles swirl → phoenix shape → spreads wings → fades into hero
═══════════════════════════════════════════════════ */
function initEagleIntro(){
  const intro=$('#eagleIntro');
  const canvas=$('#eagleCanvas');
  const textEl=$('.eagle-text');
  if(!intro||!canvas) return;
  if(D.reduced()){ intro.classList.add('hidden'); return; }

  const ctx=canvas.getContext('2d');
  let W,H,pts=[],phase=0,raf=null,done=false;
  let tick=0;

  function resize(){ W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight; buildPoints(); }

  /* Target: phoenix silhouette centred at screen */
  function phoenixTarget(i,total){
    const half=Math.ceil(total/2);
    const side=i%2===0?-1:1;
    const t=(i%half)/half;
    const scale=Math.min(W,H)*0.0025;
    const angle=0.18+t*1.72;
    const radius=(55+t*175)*scale;
    let tx=0.5+side*Math.cos(angle)*(radius/W);
    let ty=0.44-Math.sin(angle)*(radius*0.5)/H;
    if(t>0.78){ ty=0.52+(t-0.78)*1.0; tx=0.5+side*0.06*Math.sin(t*Math.PI*6); }
    return {x:tx*W, y:ty*H};
  }

  class EaglePt {
    constructor(i,total){
      this.i=i; this.total=total;
      this.reset();
      const tgt=phoenixTarget(i,total);
      this.x=rnd(0,W); this.y=rnd(H*0.3,H*0.7);
      this.tx=tgt.x; this.ty=tgt.y;
    }
    reset(){
      this.vx=0; this.vy=0;
      this.sz=rnd(1.8,4.5); this.a=rnd(0.4,0.95);
      this.col=GOLD[rndI(0,GOLD.length-1)];
      this.spd=rnd(0.04,0.08); this.ph=rnd(0,Math.PI*2);
    }
    update(ts,drift){
      /* attract to target */
      this.vx+=(this.tx-this.x)*this.spd;
      this.vy+=(this.ty-this.y)*this.spd;
      /* turbulence during formation */
      if(drift>0.01){
        this.vx+=Math.sin(ts*0.0008+this.ph)*1.8*drift;
        this.vy+=Math.cos(ts*0.0006+this.ph)*1.4*drift;
      }
      this.vx*=0.86; this.vy*=0.86;
      this.x+=this.vx; this.y+=this.vy;
      this.a=clamp(this.a+Math.sin(ts*0.003+this.ph)*0.015,0.2,1);
    }
    draw(ctx,alpha){
      const r=this.sz*3;
      const g=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,r);
      g.addColorStop(0,goldRgba(this.col,this.a*alpha));
      g.addColorStop(0.4,goldRgba(this.col,this.a*alpha*0.4));
      g.addColorStop(1,'transparent');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(this.x,this.y,r,0,Math.PI*2); ctx.fill();
    }
  }

  function buildPoints(){
    const count=D.mobile()?80:180;
    pts=Array.from({length:count},(_,i)=>new EaglePt(i,count));
  }

  resize(); window.addEventListener('resize',resize,{passive:true});

  let startTs=null;

  function animate(ts){
    if(done) return;
    if(!startTs) startTs=ts;
    const elapsed=(ts-startTs)/1000; // seconds

    raf=requestAnimationFrame(animate);
    ctx.clearRect(0,0,W,H);

    /* Background radial glow */
    const cg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.min(W,H)*0.5);
    cg.addColorStop(0,`rgba(212,175,55,${Math.min(elapsed/4*0.08,0.08)})`);
    cg.addColorStop(1,'transparent');
    ctx.fillStyle=cg; ctx.fillRect(0,0,W,H);

    /* Phase 0-2s: chaotic particles rushing to form */
    /* Phase 2-4s: phoenix shape holds, wings pulse */
    /* Phase 4-5s: text fades in */
    /* Phase 5-7s: everything shatters outward */
    const drift = elapsed<2 ? 1-elapsed/2 : 0;
    const globalA = elapsed<0.3 ? elapsed/0.3 : elapsed>6.5 ? clamp(1-(elapsed-6.5)/0.8,0,1) : 1;

    pts.forEach(p=>{ p.update(ts,drift); p.draw(ctx,globalA); });

    /* Wing pulse aura when formed */
    if(elapsed>2 && elapsed<6.5){
      const pulseA=Math.sin((elapsed-2)*Math.PI*0.8)*0.12;
      const ag=ctx.createRadialGradient(W/2,H*0.44,0,W/2,H*0.44,Math.min(W,H)*0.35);
      ag.addColorStop(0,`rgba(212,175,55,${Math.max(0,pulseA)})`);
      ag.addColorStop(1,'transparent');
      ctx.fillStyle=ag; ctx.fillRect(0,0,W,H);
    }

    /* Text reveal: 4-6s */
    if(elapsed>4 && elapsed<6.5 && textEl){
      const ta=clamp((elapsed-4)/1,0,1);
      textEl.style.opacity=ta;
      $$('.et-word',textEl).forEach((w,i)=>{
        const wa=clamp((elapsed-4-i*0.3)/0.6,0,1);
        w.style.opacity=wa;
        w.style.transform=`translateY(${(1-wa)*30}px)`;
      });
    }

    /* End: fade overlay to black, then show site */
    if(elapsed>7){
      done=true;
      cancelAnimationFrame(raf);
      finishIntro();
    }
  }

  requestAnimationFrame(animate);

  function finishIntro(){
    if(typeof gsap!=='undefined'){
      gsap.to(intro,{opacity:0,duration:0.8,ease:'power2.in',onComplete:()=>{ intro.classList.add('hidden'); afterEagle(); }});
    } else {
      intro.style.transition='opacity 0.8s ease';
      intro.style.opacity='0';
      setTimeout(()=>{ intro.classList.add('hidden'); afterEagle(); },850);
    }
  }
}

/* ─── PRELOADER ─── */
function initPreloader(){
  const pl=$('#preloader'); if(!pl) return;
  const MIN=D.mobile()?1800:2600;
  const t0=Date.now();
  function finish(){
    pl.classList.add('exit');
    setTimeout(()=>{ pl.style.display='none'; document.body.classList.remove('loading'); initEagleIntro(); },950);
  }
  window.addEventListener('load',()=>{ setTimeout(finish,Math.max(0,MIN-(Date.now()-t0))); });
  setTimeout(finish,MIN+1000);
}

/* ─── AFTER EAGLE ─── */
function afterEagle(){
  initStarField();
  initHeroCanvas();
  initSectionFires();
  initCtaCanvas();
  animateHeroIn();
  initGSAP();
  initTypewriter();
}

/* ─── STAR FIELD ─── */
function initStarField(){
  const f=$('#heroStars'); if(!f||D.reduced()) return;
  const count=D.mobile()?22:60;
  const frag=document.createDocumentFragment();
  for(let i=0;i<count;i++){
    const s=document.createElement('div'); s.className='star-dot';
    const sz=rnd(0.8,2.4);
    s.style.cssText=`width:${sz}px;height:${sz}px;top:${rnd(4,96)}%;left:${rnd(2,98)}%;animation-duration:${rnd(2,7)}s;animation-delay:${rnd(0,7)}s;`;
    frag.appendChild(s);
  }
  f.appendChild(frag);
}

/* ─── HERO CANVAS (gold wing particles) ─── */
function initHeroCanvas(){
  const canvas=$('#heroCanvas'); if(!canvas||D.reduced()) return;
  const ctx=canvas.getContext('2d',{alpha:true});
  let W,H,pts=[],raf=null,vis=true,shocks=[];
  let lastTick=0;

  const vObs=new IntersectionObserver(e=>{
    vis=e[0].isIntersecting;
    if(vis&&!raf) raf=requestAnimationFrame(loop);
  },{threshold:0.01});
  vObs.observe(canvas);

  class Pt {
    constructor(i,total){
      const half=Math.ceil(total/2),side=i%2===0?-1:1;
      const t=(i%half)/half,sc=W?W/1440:1;
      const angle=0.18+t*1.72,radius=(50+t*170)*sc;
      this.tx=0.5+side*Math.cos(angle)*(radius/(W||1));
      this.ty=0.43-Math.sin(angle)*(radius*0.5)/(H||1);
      if(t>0.78){this.ty=0.52+(t-0.78)*1.0;this.tx=0.5+side*0.05*Math.sin(t*Math.PI*6);}
      this.x=rnd(0.15,0.85)*(W||1); this.y=rnd(0.15,0.85)*(H||1);
      this.vx=0;this.vy=0;this.sz=rnd(1.2,4.2);
      this.col=GOLD[rndI(0,GOLD.length-1)];this.a=rnd(0.3,0.9);this.spd=rnd(0.022,0.05);this.ph=rnd(0,Math.PI*2);
    }
    update(ts){
      const tx=this.tx*W,ty=this.ty*H;
      this.vx+=(tx-this.x)*this.spd+Math.sin(ts*0.0007+this.ph)*1.4;
      this.vy+=(ty-this.y)*this.spd+Math.cos(ts*0.0005+this.ph)*1.1;
      this.vx*=0.87;this.vy*=0.87;this.x+=this.vx;this.y+=this.vy;
      this.a=clamp(this.a+Math.sin(ts*0.0028+this.ph)*0.012,0.15,0.95);
    }
    draw(){
      const r=this.sz*2.8;
      const g=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,r);
      g.addColorStop(0,goldRgba(this.col,this.a));
      g.addColorStop(0.45,goldRgba(this.col,this.a*0.4));
      g.addColorStop(1,'transparent');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(this.x,this.y,r,0,Math.PI*2);ctx.fill();
    }
  }

  function resize(){
    W=canvas.width=canvas.offsetWidth;H=canvas.height=canvas.offsetHeight;
    const count=D.mobile()?55:Math.min(210,Math.floor(W/6.5));
    pts=Array.from({length:count},(_,i)=>new Pt(i,count));
  }

  function loop(ts){
    if(!vis){raf=null;return;}
    raf=requestAnimationFrame(loop);
    ctx.clearRect(0,0,W,H);
    const ax=W*0.5,ay=H*0.42;
    const pulse=0.06+Math.sin(ts*0.0006)*0.018;
    const ag=ctx.createRadialGradient(ax,ay,0,ax,ay,Math.min(W,H)*0.38);
    ag.addColorStop(0,`rgba(212,175,55,${pulse})`);
    ag.addColorStop(0.5,`rgba(180,140,30,${pulse*0.38})`);
    ag.addColorStop(1,'transparent');
    ctx.fillStyle=ag;ctx.fillRect(0,0,W,H);
    pts.forEach(p=>{p.update(ts);p.draw();});
    lastTick++;
    if(lastTick%700===0&&!D.mobile()) shocks.push({x:ax,y:ay,r:10,a:0.75});
    shocks=shocks.filter(s=>s.a>0.01);
    shocks.forEach(s=>{
      s.r+=3.5;s.a*=0.965;
      ctx.save();ctx.strokeStyle=`rgba(212,175,55,${s.a})`;ctx.lineWidth=1.5;
      ctx.shadowColor='rgba(255,215,0,0.4)';ctx.shadowBlur=10;
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.stroke();ctx.restore();
    });
  }

  resize();window.addEventListener('resize',resize,{passive:true});
}

/* ═══════════════════════════════════════════════════
   PER-SECTION FIRE CANVASES
   Each section gets a different fire style
═══════════════════════════════════════════════════ */
const FIRE_MODES = {
  /* Floating embers — services */
  embers(ctx,W,H,ps,ts){
    ps.forEach(p=>{
      p.life-=p.decay;
      if(p.life<=0){ p.x=rnd(0,W);p.y=H+10;p.life=rnd(0.5,1);p.vx=rnd(-0.8,0.8);p.vy=-(rnd(0.3,1)); }
      p.x+=p.vx+Math.sin(ts*0.001+p.ph)*0.4;p.y+=p.vy;
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*5);
      g.addColorStop(0,`hsla(${p.hue},90%,68%,${(p.life*0.45).toFixed(2)})`);
      g.addColorStop(1,'transparent');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r*5,0,Math.PI*2);ctx.fill();
    });
  },
  /* Radial pulse bursts — why us */
  radial(ctx,W,H,ps,ts){
    const cx=W/2,cy=H/2;
    ps.forEach(p=>{
      p.life-=p.decay*0.5;
      if(p.life<=0){ p.r2=rnd(30,Math.min(W,H)*0.45);p.a2=rnd(30,350);p.life=rnd(0.4,1); }
      const angle=p.a2*(Math.PI/180)+ts*0.0004*p.ph;
      const r=p.r2*(1-p.life)+p.r2*0.2;
      p.x=cx+Math.cos(angle)*r;p.y=cy+Math.sin(angle)*r*0.55;
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);
      g.addColorStop(0,`hsla(${p.hue},85%,62%,${(p.life*0.5).toFixed(2)})`);
      g.addColorStop(1,'transparent');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r*4,0,Math.PI*2);ctx.fill();
    });
  },
  /* Rising trail — process */
  trail(ctx,W,H,ps,ts){
    ps.forEach(p=>{
      p.life-=p.decay;
      if(p.life<=0){ p.x=rnd(W*0.1,W*0.9);p.y=H+10;p.life=rnd(0.5,1);p.vx=rnd(-0.3,0.3);p.vy=-(rnd(0.6,1.4)); }
      p.x+=p.vx;p.y+=p.vy;p.r*=0.995;
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*6);
      g.addColorStop(0,`hsla(${p.hue},95%,70%,${(p.life*0.55).toFixed(2)})`);
      g.addColorStop(0.5,`hsla(${p.hue-10},80%,50%,${(p.life*0.25).toFixed(2)})`);
      g.addColorStop(1,'transparent');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r*6,0,Math.PI*2);ctx.fill();
    });
  },
  /* Heat shimmer — devices */
  shimmer(ctx,W,H,ps,ts){
    ps.forEach(p=>{
      p.life-=p.decay*0.3;
      if(p.life<=0){ p.x=rnd(0,W);p.y=rnd(H*0.5,H);p.life=rnd(0.3,0.9);p.vx=rnd(-0.2,0.2);p.vy=-(rnd(0.2,0.7)); }
      p.x+=p.vx+Math.sin(ts*0.0015+p.ph)*1.2;p.y+=p.vy;
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*8);
      g.addColorStop(0,`hsla(${p.hue},60%,75%,${(p.life*0.15).toFixed(2)})`);
      g.addColorStop(1,'transparent');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r*8,0,Math.PI*2);ctx.fill();
    });
  },
  /* Horizontal streaks — gallery */
  streaks(ctx,W,H,ps,ts){
    ps.forEach(p=>{
      p.life-=p.decay;
      if(p.life<=0){ p.x=rnd(-100,0);p.y=rnd(0,H);p.life=rnd(0.3,1);p.vx=rnd(1.5,4.5);p.vy=rnd(-0.2,0.2);p.len=rnd(40,160); }
      p.x+=p.vx;p.y+=p.vy;
      const grd=ctx.createLinearGradient(p.x,p.y,p.x-p.len,p.y);
      grd.addColorStop(0,`hsla(${p.hue},90%,65%,${(p.life*0.5).toFixed(2)})`);
      grd.addColorStop(1,'transparent');
      ctx.strokeStyle=grd;ctx.lineWidth=p.r*1.5;
      ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.len,p.y);ctx.stroke();
    });
  },
  /* Gold rain sparks — sales */
  sparks(ctx,W,H,ps,ts){
    ps.forEach(p=>{
      p.life-=p.decay;
      if(p.life<=0){ p.x=rnd(0,W);p.y=rnd(-60,0);p.life=rnd(0.5,1);p.vx=rnd(-0.5,0.5);p.vy=rnd(1,3); }
      p.x+=p.vx+Math.sin(ts*0.001+p.ph)*0.5;p.y+=p.vy;
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3);
      g.addColorStop(0,`hsla(${p.hue},95%,72%,${(p.life*0.6).toFixed(2)})`);
      g.addColorStop(1,'transparent');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r*3,0,Math.PI*2);ctx.fill();
    });
  },
  /* Slow drift — about */
  drift(ctx,W,H,ps,ts){
    ps.forEach(p=>{
      p.life-=p.decay*0.4;
      if(p.life<=0){ p.x=rnd(0,W);p.y=H+10;p.life=rnd(0.4,0.9);p.vx=rnd(-0.6,0.6);p.vy=-(rnd(0.15,0.5)); }
      p.x+=p.vx+Math.sin(ts*0.0008+p.ph)*0.7;p.y+=p.vy;
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*6);
      g.addColorStop(0,`hsla(${p.hue},75%,60%,${(p.life*0.3).toFixed(2)})`);
      g.addColorStop(1,'transparent');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r*6,0,Math.PI*2);ctx.fill();
    });
  },
  /* Low horizon flame — contact */
  horizon(ctx,W,H,ps,ts){
    ps.forEach(p=>{
      p.life-=p.decay;
      if(p.life<=0){ p.x=rnd(0,W);p.y=H;p.life=rnd(0.3,0.8);p.vx=rnd(-0.8,0.8);p.vy=-(rnd(0.5,2)); }
      p.x+=p.vx+Math.sin(ts*0.001+p.ph)*1;p.y+=p.vy;
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*7);
      g.addColorStop(0,`hsla(${p.hue},90%,65%,${(p.life*0.4).toFixed(2)})`);
      g.addColorStop(0.5,`hsla(${p.hue-10},75%,45%,${(p.life*0.15).toFixed(2)})`);
      g.addColorStop(1,'transparent');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r*7,0,Math.PI*2);ctx.fill();
    });
  }
};

function makeSectionParticles(W,H,mode){
  const counts={embers:40,radial:60,trail:35,shimmer:50,streaks:20,sparks:45,drift:35,horizon:40};
  const isMob=D.mobile();
  const n=Math.ceil((counts[mode]||40)*(isMob?0.5:1));
  return Array.from({length:n},()=>({
    x:rnd(0,W),y:rnd(0,H),
    vx:rnd(-1,1),vy:rnd(-1,1),
    r:rnd(1.5,4.5),life:rnd(0,1),
    decay:rnd(0.003,0.008),hue:rnd(28,54),
    ph:rnd(0,Math.PI*2),a2:rnd(0,360),r2:100,len:60
  }));
}

function initSectionFires(){
  if(D.reduced()) return;
  $$('.section-fire').forEach(canvas=>{
    const mode=canvas.dataset.fire;
    if(!mode||!FIRE_MODES[mode]) return;
    const ctx=canvas.getContext('2d',{alpha:true});
    let W,H,ps=[],raf=null,vis=false;

    const obs=new IntersectionObserver(e=>{
      vis=e[0].isIntersecting;
      if(vis&&!raf) raf=requestAnimationFrame(loop);
    },{threshold:0.01});
    obs.observe(canvas);

    function resize(){
      W=canvas.width=canvas.offsetWidth||canvas.parentElement.offsetWidth;
      H=canvas.height=canvas.offsetHeight||canvas.parentElement.offsetHeight;
      ps=makeSectionParticles(W,H,mode);
    }

    function loop(ts){
      if(!vis){raf=null;return;}
      raf=requestAnimationFrame(loop);
      ctx.clearRect(0,0,W,H);
      FIRE_MODES[mode](ctx,W,H,ps,ts);
    }

    resize();
    const ro=new ResizeObserver(resize);
    ro.observe(canvas.parentElement||canvas);
  });
}

/* ─── CTA CANVAS ─── */
function initCtaCanvas(){
  const canvas=$('#ctaCanvas'); if(!canvas||D.reduced()) return;
  const ctx=canvas.getContext('2d',{alpha:true});
  let W,H,ps=[],raf=null,vis=false;
  const obs=new IntersectionObserver(e=>{ vis=e[0].isIntersecting; if(vis&&!raf) raf=requestAnimationFrame(loop); },{threshold:0.01});
  obs.observe(canvas);
  function resize(){
    W=canvas.width=canvas.offsetWidth;H=canvas.height=canvas.offsetHeight;
    if(!ps.length) ps=makeSectionParticles(W,H,'trail');
  }
  function loop(ts){
    if(!vis){raf=null;return;}
    raf=requestAnimationFrame(loop);
    ctx.clearRect(0,0,W,H);
    FIRE_MODES.trail(ctx,W,H,ps,ts);
  }
  resize();window.addEventListener('resize',resize,{passive:true});
}

/* ─── HERO ANIMATE IN ─── */
function animateHeroIn(){
  const logoWrap=$('#heroLogoWrap'),heroText=$('#heroText'),stats=$('#heroStats');
  const eyebrow=$('#heroEyebrow'),sub=$('#heroSub'),actions=$('#heroActions');
  const lines=$$('.hh-inner');

  if(D.reduced()){
    [logoWrap,heroText,stats].forEach(e=>{ if(e){e.style.opacity='1';e.style.transform='none';} });
    lines.forEach(l=>{ l.style.transform='translateY(0)'; });
    if(stats) stats.classList.add('revealed');
    return;
  }

  if(typeof gsap!=='undefined'){
    gsap.set([eyebrow,sub,actions],{opacity:0,y:24});
    if(heroText) heroText.style.opacity='1';
    gsap.set(lines,{y:'108%'});
    const tl=gsap.timeline({defaults:{ease:'expo.out'}});
    tl.fromTo(logoWrap,{opacity:0,scale:0.65,filter:'blur(28px)'},{opacity:1,scale:1,filter:'blur(0px)',duration:1.35})
      .to(eyebrow,{opacity:1,y:0,duration:0.7},'-=0.55')
      .to(lines,{y:'0%',duration:0.95,stagger:0.17,ease:'expo.out'},'-=0.45')
      .to(sub,{opacity:1,y:0,duration:0.7},'-=0.4')
      .to(actions,{opacity:1,y:0,duration:0.6},'-=0.3')
      .call(()=>{ if(stats){ stats.classList.add('revealed'); initCounters(stats); } });
  } else {
    const show=(el,d)=>{ if(!el) return; setTimeout(()=>{ el.style.transition='opacity .8s ease,transform .8s ease'; el.style.opacity='1'; el.style.transform='none'; },d); };
    show(logoWrap,100);
    lines.forEach((l,i)=>{ setTimeout(()=>{ l.style.transition=`transform .9s ${.5+i*.15}s cubic-bezier(.22,1,.36,1)`; l.style.transform='translateY(0)'; },50); });
    if(heroText) heroText.style.opacity='1';
    show(eyebrow,500); show(sub,900); show(actions,1100);
    if(stats) setTimeout(()=>{ stats.classList.add('revealed'); stats.style.transition='opacity .7s ease'; stats.style.opacity='1'; initCounters(stats); },1400);
  }
}

/* ─── TYPEWRITER ─── */
function initTypewriter(){
  const el=$('#heroTypewriter'); if(!el||D.reduced()) return;
  const msgs=['Your device, reborn by the Phoenix.','Expert hands. Genuine parts.','Same day. Hoskote\'s finest.','Trusted by thousands locally.'];
  let mi=0,ci=0,del=false,timer=null;
  function tick(){
    const msg=msgs[mi];
    if(!del){ el.textContent=msg.slice(0,ci+1); ci++; if(ci>=msg.length){ del=true; timer=setTimeout(tick,1800); return; } }
    else { el.textContent=msg.slice(0,ci-1); ci--; if(ci<=0){ del=false; mi=(mi+1)%msgs.length; timer=setTimeout(tick,400); return; } }
    timer=setTimeout(tick,del?50:80);
  }
  setTimeout(tick,3500);
}

/* ─── COUNTERS ─── */
function initCounters(scope){
  if(!scope) return;
  const nums=$$('[data-count]',scope); if(!nums.length) return;
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const el=entry.target,target=parseInt(el.dataset.count,10);
      const dur=D.mobile()?1400:2000,t0=performance.now();
      (function tick(now){ const p=clamp((now-t0)/dur,0,1); el.textContent=Math.round((1-Math.pow(1-p,3))*target); if(p<1) requestAnimationFrame(tick); })(t0);
      obs.unobserve(el);
    });
  },{threshold:0.4});
  nums.forEach(el=>obs.observe(el));
}

/* ─── PROCESS LINE ─── */
function initProcessLine(){
  const rail=$('#processRail'),path=$('#processPath'),steps=$$('.proc-step'); if(!rail||!path) return;
  const svgEl=$('#processSvgLine');
  let len=800;
  if(svgEl){ const sh=svgEl.getBoundingClientRect().height; if(sh>10) len=sh; }
  path.setAttribute('stroke-dasharray',len); path.setAttribute('stroke-dashoffset',len);
  $('#processPathBg')?.setAttribute('d',`M2,0 L2,${len}`); path.setAttribute('d',`M2,0 L2,${len}`);
  function update(){
    const rect=rail.getBoundingClientRect();
    const p=clamp(((- rect.top)/(rect.height*0.78)),0,1);
    path.style.strokeDashoffset=len*(1-p);
    steps.forEach((s,i)=>s.classList.toggle('active',p>=(i+0.5)/steps.length));
  }
  window.addEventListener('scroll',update,{passive:true}); update();
}

/* ─── GALLERY SCROLL ─── */
function initGalleryScroll(){
  const outer=$('#galleryOuter'),sticky=outer&&$('#galleryStickyEl'),track=$('#galleryTrack');
  if(!outer||!track||!sticky) return;
  const pb=$('#galleryProgressBar');

  if(D.touch()||window.innerWidth<=1100){
    /* Ensure native scroll */
    sticky.classList.remove('js-pin');
    outer.style.height='auto'; sticky.style.cssText=''; track.style.transform='none';
    /* Update progress bar on scroll */
    if(pb) track.addEventListener('scroll',()=>{ pb.style.width=`${(track.scrollLeft/(track.scrollWidth-track.offsetWidth))*100}%`; },{passive:true});
    return;
  }
  if(typeof gsap==='undefined'||typeof ScrollTrigger==='undefined') return;
  sticky.classList.add('js-pin');

  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const shift=Math.max(0,track.scrollWidth-window.innerWidth+120);
    if(shift<20){ sticky.classList.remove('js-pin'); outer.style.height='auto'; return; }
    outer.style.height=`${shift+window.innerHeight}px`;
    ScrollTrigger.create({
      trigger:outer,start:'top top',end:`+=${shift}`,
      pin:sticky,pinSpacing:false,scrub:0.8,invalidateOnRefresh:true,
      onUpdate(self){
        gsap.set(track,{x:-(self.progress*shift),overwrite:'auto'});
        if(pb) pb.style.width=`${self.progress*100}%`;
      },
      onRefresh(){
        const ns=Math.max(0,track.scrollWidth-window.innerWidth+120);
        outer.style.height=`${ns+window.innerHeight}px`;
      }
    });
    window.matchMedia('(hover:none),(max-width:1100px)').addEventListener('change',e=>{
      if(e.matches){ ScrollTrigger.getAll().forEach(t=>t.kill()); sticky.classList.remove('js-pin'); outer.style.height='auto'; track.style.transform=''; }
    });
  }));
}

/* ─── CARD TILT ─── */
function initCardTilt(){
  if(D.touch()||D.reduced()) return;
  $$('.srv-card,.why-card,.gl-card').forEach(card=>{
    card.addEventListener('mouseenter',()=>{ card.style.transition='transform .18s ease'; });
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const dx=(e.clientX-(r.left+r.width/2))/(r.width/2);
      const dy=(e.clientY-(r.top+r.height/2))/(r.height/2);
      card.style.transform=`perspective(900px) rotateY(${dx*6}deg) rotateX(${-dy*6}deg) translateY(-7px) scale(1.01)`;
    });
    card.addEventListener('mouseleave',()=>{
      card.style.transition='transform .55s cubic-bezier(.34,1.56,.64,1)';
      card.style.transform='';
      setTimeout(()=>{ card.style.transition=''; },550);
    });
  });
}

/* ─── SERVICE CARD SPARKS ─── */
function initCardSparks(){
  if(D.touch()||D.reduced()) return;
  $$('.srv-card').forEach(card=>{
    const box=card.querySelector('.sc-sparks'); if(!box) return;
    const glow=card.querySelector('.sc-glow');
    card.addEventListener('mousemove',e=>{ if(glow){ const r=card.getBoundingClientRect(); glow.style.left=`${e.clientX-r.left-100}px`; glow.style.top=`${e.clientY-r.top-100}px`; } });
    card.addEventListener('mouseenter',()=>{
      for(let i=0;i<18;i++){
        const p=document.createElement('div'); p.className='sp-dot';
        const a=rnd(0,Math.PI*2),d=rnd(36,115);
        p.style.setProperty('--tx',`${Math.cos(a)*d}px`); p.style.setProperty('--ty',`${Math.sin(a)*d}px`);
        p.style.setProperty('--d',`${rnd(0.5,.95)}s`);
        p.style.left=`${rnd(25,75)}%`; p.style.top=`${rnd(25,75)}%`;
        p.style.animationDelay=`${rnd(0,.18)}s`;
        box.appendChild(p); setTimeout(()=>p.remove(),1100);
      }
    });
  });
}

/* ─── MAGNETIC ─── */
function initMagnetic(){
  if(D.touch()||D.reduced()) return;
  $$('[data-magnetic]').forEach(el=>{
    el.addEventListener('mouseenter',()=>{ el.style.transition='transform .15s ease'; });
    el.addEventListener('mousemove',e=>{
      const r=el.getBoundingClientRect();
      const dx=(e.clientX-(r.left+r.width/2))/(r.width/2);
      const dy=(e.clientY-(r.top+r.height/2))/(r.height/2);
      el.style.transform=`translate(${dx*7}px,${dy*7}px)`;
    });
    el.addEventListener('mouseleave',()=>{ el.style.transition='transform .5s cubic-bezier(.34,1.56,.64,1)'; el.style.transform=''; setTimeout(()=>{ el.style.transition=''; },500); });
  });
}

/* ─── NAV ─── */
function initNav(){
  const header=$('#header'),burger=$('#navBurger'),menu=$('#navMenu'),links=$$('.nav-link');
  if(!header) return;
  let lastY=0;
  const onScroll=()=>{
    const y=window.scrollY;
    header.classList.toggle('scrolled',y>60);
    if(D.mobile()){ header.style.transform=y>lastY+4&&y>80?'translateY(-100%)':''; }
    lastY=y;
    const ay=y+140;let active=null;
    $$('section[id]').forEach(s=>{ if(ay>=s.offsetTop) active=s.id; });
    links.forEach(a=>{ const id=(a.getAttribute('href')||'').replace('#',''); a.classList.toggle('active',id===active); });
  };
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  if(burger&&menu){
    const toggle=open=>{ menu.classList.toggle('open',open); burger.setAttribute('aria-expanded',String(open)); document.body.classList.toggle('menu-open',open); };
    burger.addEventListener('click',()=>toggle(!menu.classList.contains('open')));
    $$('a,button',menu).forEach(el=>el.addEventListener('click',()=>toggle(false)));
    document.addEventListener('click',e=>{ if(menu.classList.contains('open')&&!header.contains(e.target)) toggle(false); });
    document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&menu.classList.contains('open')) toggle(false); });
    let tx=0;
    menu.addEventListener('touchstart',e=>{ tx=e.touches[0].clientX; },{passive:true});
    menu.addEventListener('touchend',e=>{ if(e.changedTouches[0].clientX-tx>60) toggle(false); },{passive:true});
  }
}

/* ─── SMOOTH SCROLL ─── */
function initSmoothScroll(){
  $$('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const id=a.getAttribute('href').slice(1);
      const target=document.getElementById(id); if(!target) return;
      e.preventDefault();
      const navH=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'))||78;
      window.scrollTo({top:target.getBoundingClientRect().top+window.scrollY-navH-8,behavior:'smooth'});
    });
  });
}

/* ─── TOUCH RIPPLE ─── */
function initTouchRipple(){
  if(!D.touch()) return;
  $$('.btn-gold,.btn-outline,.nav-cta').forEach(el=>{
    el.addEventListener('touchstart',e=>{
      const r=el.getBoundingClientRect(),t=e.touches[0];
      const rip=document.createElement('span');
      rip.style.cssText=`position:absolute;border-radius:50%;width:80px;height:80px;background:rgba(255,255,255,.22);left:${t.clientX-r.left-40}px;top:${t.clientY-r.top-40}px;transform:scale(0);animation:ripA .55s ease-out forwards;pointer-events:none;z-index:10;`;
      el.style.position='relative'; el.style.overflow='hidden';
      el.appendChild(rip); setTimeout(()=>rip.remove(),600);
    },{passive:true});
  });
  if(!document.getElementById('ripStyle')){
    const s=document.createElement('style'); s.id='ripStyle';
    s.textContent='@keyframes ripA{to{transform:scale(3);opacity:0}}';
    document.head.appendChild(s);
  }
}

/* ─── FLOAT WA ─── */
function initFloatWA(){
  const btn=$('#floatWA'); if(!btn) return;
  const obs=new IntersectionObserver(([e])=>{ if(!e.isIntersecting) btn.classList.add('show'); },{threshold:0.8});
  const hero=$('#hero'); if(hero) obs.observe(hero); else btn.classList.add('show');
}

/* ─── CLICK RIPPLE (fire burst on page click) ─── */
function initClickRipple(){
  if(D.touch()||D.reduced()) return;
  document.addEventListener('click',e=>{
    /* Only on section backgrounds, not interactive elements */
    if(e.target.closest('a,button,input,select,[data-magnetic]')) return;
    const burst=document.createElement('div');
    burst.style.cssText=`position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:0;height:0;border-radius:50%;pointer-events:none;z-index:9997;box-shadow:0 0 0 0 rgba(212,175,55,0.5);animation:clickBurst .7s ease-out forwards;`;
    document.body.appendChild(burst);
    setTimeout(()=>burst.remove(),750);
  });
  if(!document.getElementById('burstStyle')){
    const s=document.createElement('style'); s.id='burstStyle';
    s.textContent='@keyframes clickBurst{to{box-shadow:0 0 0 60px rgba(212,175,55,0);}}';
    document.head.appendChild(s);
  }
}

/* ─── GSAP SCROLL ANIMATIONS ─── */
function initGSAP(){
  if(D.reduced()){ initFallbackReveal(); return; }
  if(typeof gsap==='undefined'){ initFallbackReveal(); return; }
  gsap.registerPlugin(ScrollTrigger);

  const st=(t,extra={})=>({trigger:t,start:'top 88%',once:true,...extra});

  $$('.sec-label,.sec-title,.sec-sub,[data-reveal]').forEach(el=>{
    gsap.fromTo(el,{opacity:0,y:36},{opacity:1,y:0,duration:0.75,ease:'power3.out',scrollTrigger:st(el)});
  });

  gsap.fromTo('.srv-card',{opacity:0,y:55,scale:0.95,rotateX:-6},{opacity:1,y:0,scale:1,rotateX:0,duration:0.7,stagger:{amount:0.55},ease:'back.out(1.3)',scrollTrigger:st('.srv-grid')});

  gsap.fromTo('[data-reveal-stagger]',{opacity:0,y:44,scale:0.95},{opacity:1,y:0,scale:1,duration:0.65,stagger:0.09,ease:'power3.out',scrollTrigger:st('.why-grid')});

  gsap.fromTo('.stats-band',{opacity:0,y:35},{opacity:1,y:0,duration:0.75,ease:'power3.out',scrollTrigger:{...st('.stats-band'),onEnter:()=>initCounters($('.stats-band'))}});

  $$('.proc-step').forEach(el=>{
    gsap.fromTo(el,{opacity:0,x:D.mobile()?0:-45,y:D.mobile()?30:0},{opacity:1,x:0,y:0,duration:0.65,ease:'power3.out',scrollTrigger:{...st(el),onEnter:()=>el.classList.add('revealed')}});
  });

  if(!D.mobile()){
    gsap.fromTo('.sales-text',{opacity:0,x:-60},{opacity:1,x:0,duration:0.8,ease:'power3.out',scrollTrigger:st('.sales-grid')});
    gsap.fromTo('.sales-visual',{opacity:0,x:60},{opacity:1,x:0,duration:0.8,ease:'power3.out',scrollTrigger:st('.sales-grid')});
    gsap.fromTo('.about-text',{opacity:0,x:-60},{opacity:1,x:0,duration:0.8,ease:'power3.out',scrollTrigger:st('.about-grid')});
    gsap.fromTo('.contact-info',{opacity:0,x:-55},{opacity:1,x:0,duration:0.75,ease:'power3.out',scrollTrigger:st('.contact-layout')});
    gsap.fromTo('.contact-map',{opacity:0,x:55},{opacity:1,x:0,duration:0.75,ease:'power3.out',scrollTrigger:st('.contact-layout')});
  } else {
    gsap.fromTo(['.sales-text','.sales-visual','.about-text','.about-cards'],{opacity:0,y:36},{opacity:1,y:0,duration:0.7,stagger:0.12,ease:'power3.out',scrollTrigger:st('#sales')});
    gsap.fromTo(['.contact-info','.contact-map'],{opacity:0,y:28},{opacity:1,y:0,duration:0.65,stagger:0.15,ease:'power3.out',scrollTrigger:st('#contact')});
  }

  gsap.fromTo('.ac-card',{opacity:0,x:55},{opacity:1,x:0,duration:0.65,stagger:0.12,ease:'power3.out',scrollTrigger:st('.about-cards')});
  gsap.fromTo('.cta-logo',{opacity:0,y:40,scale:0.82},{opacity:1,y:0,scale:1,duration:1,ease:'back.out(1.3)',scrollTrigger:st('#cta')});
  gsap.fromTo('.gallery-header .sec-title,.gallery-header .sec-eyebrow',{opacity:0,y:28},{opacity:1,y:0,duration:0.7,stagger:0.1,ease:'power3.out',scrollTrigger:st('.gallery-header')});
  gsap.fromTo('.dev-tile',{opacity:0,y:45,scale:0.9},{opacity:1,y:0,scale:1,duration:0.65,stagger:{amount:0.4},ease:'back.out(1.5)',scrollTrigger:st('.dev-grid')});

  initGalleryScroll();
  initProcessLine();
  initCardTilt();
  initCardSparks();
  initCounters($('#why-us'));
}

function initFallbackReveal(){
  const targets=$$('.sec-label,.sec-title,.sec-sub,[data-reveal],[data-reveal-stagger],.srv-card,.why-card,.dev-tile,.proc-step,.stats-band,.sales-text,.sales-visual,.about-text,.ac-card,.contact-info,.contact-map,.cta-logo');
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el=e.target,d=parseFloat(el.dataset.delay||el.dataset.revealStagger||0)*100;
      setTimeout(()=>{ el.style.transition='opacity .7s ease,transform .7s ease'; el.style.opacity='1'; el.style.transform='none'; el.classList.add('revealed'); },d);
      obs.unobserve(el);
    });
  },{threshold:0.08,rootMargin:'0px 0px -40px 0px'});
  targets.forEach(el=>{ el.style.opacity='0'; el.style.transform='translateY(28px)'; obs.observe(el); });
  initProcessLine();
  initCounters($('.stats-band'));
  initCounters($('#why-us'));
}

/* ─── BOOT ─── */
function boot(){
  document.body.classList.add('loading');
  initVH();
  initScrollBar();
  initFireTrail();
  initCursor();
  initNav();
  initMagnetic();
  initSmoothScroll();
  initTouchRipple();
  initFloatWA();
  initClickRipple();
  initPreloader();
}

if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',boot); } else { boot(); }
