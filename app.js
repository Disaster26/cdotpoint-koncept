(function(){
  'use strict';
  var d=document, top=d.getElementById('top'), nav=d.getElementById('nav'), burger=d.querySelector('.burger');
  var rok=d.getElementById('rok'); if(rok) rok.textContent=new Date().getFullYear();

  /* menu mobilne */
  function zamknij(){ nav.classList.remove('open'); burger.setAttribute('aria-expanded','false'); }
  burger.addEventListener('click',function(){ var o=nav.classList.toggle('open'); burger.setAttribute('aria-expanded',o?'true':'false'); });
  nav.addEventListener('click',function(e){ if(e.target.closest('a')) zamknij(); });
  d.addEventListener('keydown',function(e){ if(e.key==='Escape') zamknij(); });

  /* cień nagłówka */
  function sc(){ top.classList.toggle('scrolled',window.scrollY>8); }
  window.addEventListener('scroll',sc,{passive:true}); sc();

  /* aktywna pozycja menu */
  var linki=[].slice.call(nav.querySelectorAll('a[href^="#"]'));
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(en){ if(en.isIntersecting){ var id=en.target.id;
        linki.forEach(function(a){ var on=a.getAttribute('href')==='#'+id; a.classList.toggle('akt',on); if(on) a.setAttribute('aria-current','true'); else a.removeAttribute('aria-current'); }); } });
    },{rootMargin:'-45% 0px -50% 0px'});
    ['about','offer','cases','people','news','contact'].forEach(function(id){ var el=d.getElementById(id); if(el) io.observe(el); });
    var hero=d.querySelector('.hero');
    new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting) linki.forEach(function(a){a.classList.remove('akt');a.removeAttribute('aria-current');}); }); },{rootMargin:'-45% 0px -50% 0px'}).observe(hero);
    /* dolny pasek po przewinięciu za przycisk hero */
    var bar=d.querySelector('.mob-bar'), cta=d.querySelector('.hero-cta'), kon=d.getElementById('contact');
    var zaCta=false, wKontakcie=false;
    function upd(){ var w=zaCta&&!wKontakcie; bar.classList.toggle('widac',w); bar.setAttribute('aria-hidden',w?'false':'true'); [].forEach.call(bar.querySelectorAll('a'),function(a){a.tabIndex=w?0:-1;}); }
    new IntersectionObserver(function(es){ zaCta=!es[0].isIntersecting && es[0].boundingClientRect.top<0; upd(); }).observe(cta);
    new IntersectionObserver(function(es){ wKontakcie=es[0].isIntersecting; upd(); },{threshold:.15}).observe(kon);
  }

  /* karuzela projektów: palec (natywnie), mysz (przeciąganie), strzałki, kropki */
  var tor=d.querySelector('.tor');
  if(tor){
    var karty=[].slice.call(tor.querySelectorAll('.karta')), licz=d.querySelector('.tor-licz'), btn=d.querySelectorAll('.tor-btn'), kr=d.querySelector('.tor-kropki');
    karty.forEach(function(){ kr.appendChild(d.createElement('i')); });
    var kropki=[].slice.call(kr.children);
    function krok(){ return karty.length>1 ? karty[1].offsetLeft-karty[0].offsetLeft : tor.clientWidth; }
    function idx(){ return Math.max(0,Math.min(karty.length-1,Math.round(tor.scrollLeft/krok()))); }
    function odsw(){ var i=idx(), max=tor.scrollWidth-tor.clientWidth-2;
      licz.textContent=(i+1)+' / '+karty.length;
      kropki.forEach(function(k,j){ k.classList.toggle('on',j===i); });
      btn[0].disabled=tor.scrollLeft<=2; btn[1].disabled=tor.scrollLeft>=max; }
    tor.addEventListener('scroll',function(){ window.requestAnimationFrame(odsw); },{passive:true});
    [].forEach.call(btn,function(b){ b.addEventListener('click',function(){ tor.scrollBy({left:krok()*(+b.dataset.dir),behavior:'smooth'}); }); });
    tor.addEventListener('keydown',function(e){ if(e.key==='ArrowRight'){tor.scrollBy({left:krok(),behavior:'smooth'});e.preventDefault();} if(e.key==='ArrowLeft'){tor.scrollBy({left:-krok(),behavior:'smooth'});e.preventDefault();} });
    var start=null, sl=0, ruch=false;
    tor.addEventListener('pointerdown',function(e){ if(e.pointerType!=='mouse'||e.button!==0) return; start=e.clientX; sl=tor.scrollLeft; ruch=false; });
    window.addEventListener('pointermove',function(e){ if(start===null) return; var dx=e.clientX-start; if(!ruch&&Math.abs(dx)>5){ ruch=true; tor.classList.add('drag'); } if(ruch){ tor.scrollLeft=sl-dx; e.preventDefault(); } });
    window.addEventListener('pointerup',function(){ if(start===null) return; start=null;
      if(ruch){ var cel=Math.round(tor.scrollLeft/krok())*krok(); tor.classList.remove('drag'); tor.scrollTo({left:cel,behavior:'smooth'}); } });
    tor.addEventListener('click',function(e){ if(ruch){ e.preventDefault(); e.stopPropagation(); ruch=false; } },true);
    odsw();
  }

  /* oferta: na telefonie rozwijana lista (pierwsza otwarta), na komputerze zawsze otwarta */
  var det=[].slice.call(d.querySelectorAll('.rz details')), mq=window.matchMedia('(max-width:760px)');
  function ust(){ det.forEach(function(x,i){ x.open = mq.matches ? i===0 : true; }); }
  det.forEach(function(x){ x.querySelector('summary').addEventListener('click',function(e){ if(!mq.matches) e.preventDefault(); }); });
  if(mq.addEventListener) mq.addEventListener('change',ust); ust();

  /* formularz pokazowy: bez wysyłki */
  var form=d.getElementById('form');
  form.addEventListener('submit',function(e){ e.preventDefault(); form.querySelector('.form-info').hidden=false; });

  /* EN / PL */
  var tl=[].slice.call(d.querySelectorAll('[data-pl]'));
  var meta={en:{t:d.title,dsc:d.querySelector('meta[name=description]').content},
            pl:{t:'C.point - doradztwo i komunikacja dla sektora publicznego i prywatnego',dsc:'C.point: strategie, rozwój miast, transformacja organizacji i zarządzanie reputacją dla miast, regionów i firm. Warszawa.'}};
  function jezyk(l){
    tl.forEach(function(el){ if(el.dataset.en===undefined) el.dataset.en=el.innerHTML; el.innerHTML = l==='pl' ? el.dataset.pl : el.dataset.en; });
    d.documentElement.lang=l; d.title=meta[l].t; d.querySelector('meta[name=description]').content=meta[l].dsc;
    [].forEach.call(d.querySelectorAll('.lang button'),function(b){ b.setAttribute('aria-pressed',b.dataset.lang===l?'true':'false'); });
    try{ localStorage.setItem('cpoint-lang',l); }catch(e){}
  }
  [].forEach.call(d.querySelectorAll('.lang button'),function(b){ b.addEventListener('click',function(){ jezyk(b.dataset.lang); }); });
  var zap=null; try{ zap=localStorage.getItem('cpoint-lang'); }catch(e){}
  if(zap==='pl') jezyk('pl');
})();
