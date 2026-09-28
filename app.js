(()=>{'use strict';
const $=id=>document.getElementById(id);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const intro=$('intro'),introVideo=$('introVideo'),introHelp=$('videoHelp'),heroIdle=$('heroIdle');
const explore=$('exploreSequence'),exploreVideo=$('exploreVideo'),exploreHelp=$('exploreHelp');
const navEntry=performance.getEntriesByType?.('navigation')?.[0];
const legacyReload=performance.navigation?.type===1;
const forcedWalkIn=new URLSearchParams(location.search).get('entry')==='walkin';
const isReload=navEntry?.type==='reload'||legacyReload;
const mediaVersion='20260928-1245';
const welcomeSrc='assets/video/satish-welcome.mp4?v='+mediaVersion;
const refreshSrc='assets/video/satish-refresh-entry.mp4?v='+mediaVersion;
let introOpen=false,exploreOpen=false,progressId=0,exploreProgressId=0,focusReturn=null;
const heroSceneOverride=new URLSearchParams(location.search).get('hero');
const heroScenes={
  dark:{src:'assets/video/satish-idle.mp4?v='+mediaVersion,label:'Cinematic animation of Satish working at a laptop'},
  light:{src:'assets/video/satish-workday-white.mp4?v=20260928-workday1',label:'Professional workday scene of Satish working at a laptop'}
};
let heroReplayTimer=0;

function setHeroScene(key){
  if(!heroIdle||!heroScenes[key])return;
  const scene=heroScenes[key];
  const source=heroIdle.querySelector('source');
  if(source)source.src=scene.src;else heroIdle.src=scene.src;
  heroIdle.dataset.scene=key;
  heroIdle.classList.toggle('hero-light',key==='light');
  heroIdle.setAttribute('aria-label',scene.label);
  heroIdle.removeAttribute('poster');
  heroIdle.loop=false;
  heroIdle.load();
}
function selectHeroScene(){
  const key=heroSceneOverride==='dark'?'dark':'light';
  setHeroScene(key);
}
function resumeHeroAmbient(restart=false){
  clearTimeout(heroReplayTimer);
  if(!heroIdle||reduced||introOpen||exploreOpen||document.hidden)return;
  const atEnd=Number.isFinite(heroIdle.duration)&&heroIdle.duration>0&&heroIdle.currentTime>=heroIdle.duration-.15;
  if(restart||atEnd){try{heroIdle.currentTime=.12}catch(_){}}
  heroIdle.play().catch(()=>{});
}
heroIdle?.addEventListener('ended',()=>{
  clearTimeout(heroReplayTimer);
  heroReplayTimer=setTimeout(()=>resumeHeroAmbient(true),8000);
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){clearTimeout(heroReplayTimer);heroIdle?.pause()}
  else if(!introOpen&&!exploreOpen)resumeHeroAmbient(false);
});

function setSound(video,button,on){
  video.muted=!on;video.volume=1;
  button.setAttribute('aria-pressed',String(on));
  button.textContent=on?'🔇 Mute':'🔊 Turn sound on';
}
function toggleSound(video,button,help){
  const on=video.muted;setSound(video,button,on);
  if(video.paused&&!video.ended) video.play().catch(()=>{setSound(video,button,false);help.textContent='Your browser blocked audible playback. Press Replay and try again.'});
  help.textContent=on?'Sound enabled.':'Sound muted.';
}
function configureEntry(forceWalkIn=false){
  const source=$('introSource'); if(!source)return;
  const refresh=forceWalkIn||forcedWalkIn||isReload;
  const selectedSrc=refresh?refreshSrc:welcomeSrc;
  source.src=selectedSrc;
  introVideo.src=selectedSrc;
  $('introModeLabel').textContent=refresh?'WELCOME BACK · REFRESH ENTRANCE':'WELCOME SEQUENCE';
  $('introEyebrow').textContent=refresh?'WELCOME BACK TO SATISH OS':"HELLO, I'M SATISH TIWARI";
  $('introTitle').innerHTML=refresh?'Walk in.<br>Settle in.<br><i>Build forward.</i>':'Technology.<br>People.<br><i>Possibility.</i>';
  $('introDescription').textContent=refresh?'Satish walks into the workspace, takes his seat and gets back to work.':'Come inside my workspace. See the thinking, teamwork and systems behind the outcomes.';
  introHelp.textContent=refresh?'Walk-in entrance ready. Skip whenever you like.':'A short welcome. Skip whenever you’re ready.';
  introVideo.load();
}
function tickIntro(){
  if(!introOpen)return;
  const d=introVideo.duration||10,p=Math.max(0,Math.min(1,introVideo.currentTime/d));
  $('introProgress').style.transform='scaleX('+p+')';
  progressId=requestAnimationFrame(tickIntro);
}
function playReliable(video,button,help,preferSound=false){
  if(!video)return;
  let attempted=false;
  const attempt=()=>{
    if(attempted&&video.currentTime>0&&!video.paused)return;
    attempted=true;
    const result=video.play();
    if(result?.catch)result.catch(()=>{
      if(!video.muted){
        setSound(video,button,false);
        video.play().then(()=>{help.textContent='Video is playing. Tap Turn sound on if you want audio.'}).catch(()=>{
          help.textContent='Tap Replay to start the video.';
        });
      }else{
        help.textContent='Tap Replay to start the video.';
      }
    });
  };
  if(video.readyState>=2)attempt();
  else{
    video.addEventListener('canplay',attempt,{once:true});
    video.addEventListener('loadeddata',attempt,{once:true});
    video.load();
    setTimeout(attempt,900);
  }
}
function openIntro(withSound=false,forceMotion=false){
  focusReturn=document.activeElement; introOpen=true; intro.hidden=false; document.body.classList.add('intro-open');
  heroIdle?.pause(); introVideo.currentTime=0; setSound(introVideo,$('introSound'),withSound);
  $('introProgress').style.transform='scaleX(0)';
  if(reduced&&!forceMotion){introHelp.textContent='Reduced-motion preference detected. Use Watch intro if you want to play the video.';return}
  playReliable(introVideo,$('introSound'),introHelp,withSound);
  progressId=requestAnimationFrame(tickIntro);
}
function closeIntro(destination){
  if(!introOpen)return;
  cancelAnimationFrame(progressId); introVideo.pause(); intro.hidden=true; introOpen=false; document.body.classList.remove('intro-open'); $('introProgress').style.transform='scaleX(0)';
  resumeHeroAmbient(false);
  if(destination)setTimeout(()=>$(destination)?.scrollIntoView({behavior:reduced?'auto':'smooth'}),80);
  else focusReturn?.focus?.({preventScroll:true});
}
function tickExplore(){
  if(!exploreOpen)return;
  const d=exploreVideo.duration||10,p=Math.max(0,Math.min(1,exploreVideo.currentTime/d));
  $('exploreProgress').style.transform='scaleX('+p+')';
  exploreProgressId=requestAnimationFrame(tickExplore);
}
function openExplore(withSound=true){
  if(introOpen)closeIntro();
  focusReturn=document.activeElement; exploreOpen=true; explore.hidden=false; document.body.classList.add('intro-open');
  heroIdle?.pause(); exploreVideo.currentTime=0; setSound(exploreVideo,$('exploreSound'),withSound);
  exploreHelp.textContent='A short invitation into the work. Skip whenever you like.';
  if(!reduced){
    playReliable(exploreVideo,$('exploreSound'),exploreHelp,withSound);
    exploreProgressId=requestAnimationFrame(tickExplore);
  }
}
function closeExplore(scroll=true){
  if(!exploreOpen)return;
  cancelAnimationFrame(exploreProgressId); exploreVideo.pause(); explore.hidden=true; exploreOpen=false; document.body.classList.remove('intro-open'); $('exploreProgress').style.transform='scaleX(0)'; resumeHeroAmbient(false);
  if(scroll)setTimeout(()=>$('projects')?.scrollIntoView({behavior:reduced?'auto':'smooth'}),80); else focusReturn?.focus?.({preventScroll:true});
}
$('introSound')?.addEventListener('click',()=>toggleSound(introVideo,$('introSound'),introHelp));
$('exploreSound')?.addEventListener('click',()=>toggleSound(exploreVideo,$('exploreSound'),exploreHelp));
$('replayBtn')?.addEventListener('click',()=>{configureEntry(false);openIntro(true,true)});
$('enterSite')?.addEventListener('click',()=>closeIntro());
$('skipIntro')?.addEventListener('click',()=>closeIntro());
$('introProjects')?.addEventListener('click',()=>{closeIntro();openExplore(true)});
$('exploreBtn')?.addEventListener('click',()=>openExplore(true));
$('exploreEnter')?.addEventListener('click',()=>closeExplore(true));
$('exploreSkip')?.addEventListener('click',()=>closeExplore(true));
$('exploreReplay')?.addEventListener('click',()=>{exploreVideo.currentTime=0;playReliable(exploreVideo,$('exploreSound'),exploreHelp,!exploreVideo.muted)});
introVideo?.addEventListener('ended',()=>closeIntro());
exploreVideo?.addEventListener('ended',()=>closeExplore(true));
introVideo?.addEventListener('error',()=>{introHelp.textContent='The cinematic video could not load. You can still enter the portfolio.'});
exploreVideo?.addEventListener('error',()=>{exploreHelp.textContent='The invitation video could not load. Continue to the projects.'});

function restartWalkIn(event){
  event?.preventDefault?.();
  if(!modal?.hidden)closeProject();
  if(exploreOpen)closeExplore(false);
  if(introOpen)closeIntro();
  window.scrollTo({top:0,left:0,behavior:'auto'});
  configureEntry(true);
  openIntro(false,true);
  try{
    const url=new URL(location.href);
    url.searchParams.set('entry','walkin');
    url.hash='home';
    history.replaceState(null,'',url.pathname+url.search+url.hash);
  }catch(_){}
}
document.querySelectorAll('[data-walkin-restart]').forEach(el=>el.addEventListener('click',restartWalkIn));

const projects={
 reliability:{
   kicker:'01 / PLATFORM RELIABILITY',
   title:'When a signal becomes a response.',
   summary:'An illustrative incident-response workflow: detect a signal, acknowledge impact, coordinate mitigation and confirm recovery.',
   metrics:[['99.8%','uptime SLA supported'],['40%','faster MTTA'],['30%','faster ticket resolution']],
   systems:['Monitoring','Incident response','Stakeholder updates','SLA visibility'],
   details:[['CHALLENGE','Production issues need timely context, clear ownership and reliable communication—not just another alert.'],['APPROACH','Bring monitoring, escalation, response checkpoints and stakeholder updates into one traceable workflow.'],['INTERACTION','Trigger the synthetic incident, acknowledge it, mitigate it and verify recovery. No real client systems or customer information are connected.']]
 },
 automation:{
   kicker:'02 / AUTOMATION',
   title:'From noisy data to clear action.',
   summary:'Representative API-driven reporting workflows built around validation, checkpoints and useful alerts.',
   metrics:[['10+ hrs','manual work saved weekly'],['60%','fewer data-entry errors'],['15%','operational cost reduction']],
   systems:['REST APIs','Google Apps Script','Webhooks','AI-assisted workflows'],
   details:[['PROBLEM','Manual reporting introduces delay, repetition and inconsistency.'],['METHOD','Collect authorized data, validate completeness, preserve checkpoints, transform it into concise summaries and deliver actionable alerts.'],['OUTCOME','A repeatable operating rhythm that reduces manual effort and makes information easier to use.']]
 },
 leadership:{
   kicker:'03 / CROSS-FUNCTIONAL DELIVERY',
   title:'One team. One clear plan.',
   summary:'A practical model for alignment during incidents, technical changes and high-visibility operating events.',
   metrics:[['8+','cross-functional members led'],['40%','better stakeholder visibility'],['QBR','C-level facilitation']],
   systems:['Ownership','Escalation','Decision logs','Follow-up actions'],
   details:[['OWNERSHIP','Clarify who investigates, who approves changes and who communicates.'],['WORKFLOW','Connect technical context with risk, handovers, decisions and follow-up actions.'],['OUTCOME','Teams move together without losing accountability or hiding trade-offs.']]
 },
 resume:{
   kicker:'05 / RÉSUMÉ HIGHLIGHTS',
   title:'Impact that is easy to scan.',
   summary:'The résumé is intentionally concise, ATS-friendly and grounded in measurable technical-operations and customer-success outcomes.',
   metrics:[['7+ years','professional experience'],['99.8%','uptime SLA supported'],['95%','CSAT achieved']],
   systems:['Technical operations','Customer success','Automation','Incident response'],
   details:[['POSITIONING','Technical operations and customer success leadership with practical automation and incident-response experience.'],['PROOF','Metrics are attached to concrete work: reporting automation, faster acknowledgement, lower manual error rates and stronger support outcomes.'],['FORMAT','Two-page structure, standard typography, simple section hierarchy and no decorative elements that interfere with ATS parsing.']]
 }
};
const modal=$('projectModal'),modalContent=$('modalContent');let modalFocus=null;
function labMarkup(){return '<div class="lab-box"><div class="lab-head"><span id="labStatus" role="status">● OPERATIONAL</span><span>FICTIONAL DATA · LIVE DEMO</span></div><div class="lab-metrics"><div>API LATENCY<b id="labLatency">84 ms</b></div><div>ERROR RATE<b id="labErrors">0.1%</b></div><div>RESPONSE<b id="labPhase">Normal</b></div></div><p id="labDetails">Monitoring is active. Trigger the simulated incident to begin.</p><div class="lab-actions"><button id="triggerLab">1. Trigger incident</button><button id="ackLab" class="secondary" disabled>2. Acknowledge</button><button id="mitigateLab" class="secondary" disabled>3. Mitigate</button><button id="resolveLab" class="secondary" disabled>4. Verify recovery</button><button id="resetLab" class="secondary">↻ Reset</button></div></div>'}
function impactMarkup(metrics=[]){return '<div class="project-impact-panel">'+metrics.map(m=>'<div><b>'+m[0]+'</b><span>'+m[1]+'</span></div>').join('')+'</div>'}
function systemsMarkup(systems=[]){return '<div class="modal-systems">'+systems.map(s=>'<span>'+s+'</span>').join('')+'</div>'}
function showProject(id){
 const p=projects[id];if(!p)return;modalFocus=document.activeElement;
 modalContent.innerHTML='<span class="eyebrow">'+p.kicker+'</span><h2 id="modalTitle">'+p.title+'</h2><p>'+p.summary+'</p>'+impactMarkup(p.metrics)+systemsMarkup(p.systems)+p.details.map(d=>'<div class="modal-detail"><strong>'+d[0]+'</strong><p>'+d[1]+'</p></div>').join('')+(id==='reliability'?labMarkup():'<div class="case-steps"><div><b>01 / Understand</b><br>Start from the actual operational problem and constraints.</div><div><b>02 / Build</b><br>Create the smallest reliable system that improves the workflow.</div><div><b>03 / Measure</b><br>Use outcomes and feedback to improve the next iteration.</div></div>');
 modal.hidden=false;document.body.classList.add('modal-open');$('closeModal').focus();if(id==='reliability')setupLab();
}
function closeProject(){if(modal.hidden)return;modal.hidden=true;document.body.classList.remove('modal-open');modalFocus?.focus?.({preventScroll:true})}
document.querySelectorAll('[data-open]').forEach(b=>{
  b.addEventListener('click',()=>showProject(b.dataset.open));
  if(b.getAttribute('role')==='button'){
    b.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();showProject(b.dataset.open)}
    });
  }
});
$('closeModal')?.addEventListener('click',closeProject);modal?.addEventListener('click',e=>{if(e.target===modal)closeProject()});

const toolkitData={
 automation:{label:'ACTIVE TOOLKIT / AUTOMATION + APPLIED AI',title:'Build once. Remove repeat work.',description:'Connect APIs, scripts, webhooks and AI-assisted analysis into reliable workflows with validation, checkpoints and useful alerts.',flow:['INPUT','VALIDATE','AUGMENT','ACT']},
 visibility:{label:'ACTIVE TOOLKIT / DATA & VISIBILITY',title:'Turn operational data into a decision.',description:'Use dashboards and automated reporting to make SLA health, trends and follow-up actions easier for both technical and business stakeholders to understand.',flow:['COLLECT','CHECK','VISUALIZE','DECIDE']},
 operations:{label:'ACTIVE TOOLKIT / OPERATIONS & LEADERSHIP',title:'Make ownership obvious when pressure is high.',description:'Combine incident response, clear escalation, stakeholder communication and process improvement so teams know what happens next.',flow:['DETECT','OWN','COORDINATE','LEARN']}
};
document.querySelectorAll('[data-toolkit]').forEach(button=>button.addEventListener('click',()=>{
  const data=toolkitData[button.dataset.toolkit];if(!data)return;
  document.querySelectorAll('[data-toolkit]').forEach(x=>x.classList.toggle('active',x===button));
  const consoleEl=$('toolkitConsole');
  consoleEl?.querySelector('.eyebrow')?.replaceChildren(document.createTextNode(data.label));
  if($('toolkitTitle'))$('toolkitTitle').textContent=data.title;
  if($('toolkitDescription'))$('toolkitDescription').textContent=data.description;
  if($('toolkitFlow'))$('toolkitFlow').innerHTML=data.flow.map((x,i)=>'<span>'+x+'</span>'+(i<data.flow.length-1?'<i>→</i>':'')).join('');
}));

function setupLab(){
 let phase=0;const states=[['● OPERATIONAL','84 ms','0.1%','Normal','Monitoring is active. Trigger a synthetic incident to begin.'],['● INCIDENT DETECTED','2,420 ms','11.8%','Investigating','High error rate detected. Record impact and acknowledge ownership.'],['● ACKNOWLEDGED','1,860 ms','8.2%','Coordinating','Notify stakeholders and prepare mitigation.'],['● MITIGATED','145 ms','0.5%','Validating','Mitigation applied. Check recovery and stability.'],['● RECOVERED','87 ms','0.1%','Closed','Recovery verified. Capture follow-ups and share a concise summary.']];
 const buttons=[$('triggerLab'),$('ackLab'),$('mitigateLab'),$('resolveLab')];
 const draw=()=>{const s=states[phase];$('labStatus').textContent=s[0];$('labLatency').textContent=s[1];$('labErrors').textContent=s[2];$('labPhase').textContent=s[3];$('labDetails').textContent=s[4];buttons.forEach((b,i)=>b.disabled=i!==phase);$('labStatus').style.color=phase===1?'#b95339':phase===4?'#137a56':'#276fa8'};
 buttons.forEach((b,i)=>b.addEventListener('click',()=>{if(phase===i){phase++;draw()}}));$('resetLab').addEventListener('click',()=>{phase=0;draw()});draw();
}
$('backTop')?.addEventListener('click',()=>scrollTo({top:0,behavior:reduced?'auto':'smooth'}));
$('mobileMenu')?.addEventListener('click',()=>{const nav=document.querySelector('.site-nav'),open=nav.classList.toggle('open');$('mobileMenu').setAttribute('aria-expanded',String(open));$('mobileMenu').textContent=open?'×':'☰'});
document.querySelectorAll('.site-nav a').forEach(a=>a.addEventListener('click',()=>{document.querySelector('.site-nav').classList.remove('open');$('mobileMenu').setAttribute('aria-expanded','false');$('mobileMenu').textContent='☰'}));
const heroVisual=document.querySelector('.hero-visual');
if(heroVisual&&matchMedia('(pointer:fine)').matches&&!reduced){heroVisual.addEventListener('pointermove',e=>{const r=heroVisual.getBoundingClientRect();heroVisual.style.setProperty('--cursor-x',(((e.clientX-r.left)/r.width-.5)*12).toFixed(1)+'px');heroVisual.style.setProperty('--cursor-y',(((e.clientY-r.top)/r.height-.5)*9).toFixed(1)+'px')});heroVisual.addEventListener('pointerleave',()=>{heroVisual.style.setProperty('--cursor-x','0px');heroVisual.style.setProperty('--cursor-y','0px')})}
if('IntersectionObserver'in window&&!reduced){const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.proof-card,.project-card,.timeline article,.skill-panels article').forEach(el=>{el.classList.add('fade-in');obs.observe(el)})}
if('IntersectionObserver'in window){const links=[...document.querySelectorAll('.site-nav a')],obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id))}),{rootMargin:'-28% 0px -62% 0px'});document.querySelectorAll('main section[id]').forEach(s=>obs.observe(s))}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!modal.hidden)closeProject();else if(exploreOpen)closeExplore(false);else if(introOpen)closeIntro()}});
selectHeroScene();
configureEntry();
if(reduced){intro.hidden=true;heroIdle?.pause()}else setTimeout(()=>openIntro(false),220);
})();